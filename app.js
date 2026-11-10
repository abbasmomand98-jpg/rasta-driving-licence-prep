// Rasta — page wiring. All rules live in logic.js; this file only renders.
// "Today" is pinned to 2026-11-10 so the sample figures (official fee
// Rs 2,500, agent quote Rs 8,000, overcharge Rs 5,500, Bilal 8/10 PASS,
// Lahore Township Wed 12 Nov 9:00 AM with 18 tokens, LCN-2026-4812
// printing and ready 14 Nov 2026) stay stable no matter when you open it.
(function () {
  var L = window.RastaLogic;
  var TODAY = "2026-11-10";
  var READY_DATE = "2026-11-14";
  var STORE_CHECKLIST = "rasta-checklist-done";
  var STORE_BOOKINGS = "rasta-bookings";
  var STORE_NEXT = "rasta-receipt-next";
  var FIRST_RECEIPT_NO = 1042;

  function el(id) { return document.getElementById(id); }
  function rs(n) { return "Rs " + L.formatPKR(n); }

  function loadJSON(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key) || "null") || fallback; }
    catch (e) { return fallback; }
  }
  function saveJSON(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {}
  }
  var doneIds = loadJSON(STORE_CHECKLIST, []);
  var bookings = loadJSON(STORE_BOOKINGS, []);
  var nextReceipt = loadJSON(STORE_NEXT, FIRST_RECEIPT_NO);

  // ---- Tabs ----
  var TABS = ["mocktest", "appointments", "tracker", "feecheck", "scam", "checklist"];
  function showTab(name) {
    TABS.forEach(function (t) {
      el("section-" + t).style.display = (t === name) ? "block" : "none";
      el("tab-" + t).className = "tab-btn" + (t === name ? " active" : "");
    });
  }
  TABS.forEach(function (t) {
    el("tab-" + t).addEventListener("click", function () { showTab(t); });
  });
  showTab("mocktest");

  // ---- Mock test (10 questions, instant scoring, pass >= 7) ----
  var current = 0;
  var answers = [];
  var started = false;

  function renderQuestion() {
    var q = QUESTIONS[current];
    el("quiz-progress").textContent = "Question " + (current + 1) + " of " + QUESTIONS.length;
    el("quiz-score").textContent = "Score " + answers.filter(function (a, i) { return a === QUESTIONS[i].answer; }).length + "/" + current + " so far";
    el("quiz-question").innerHTML =
      '<span class="sign">' + q.sign + " — " + q.ur + "</span>" +
      "<h3>" + q.q + "</h3>" +
      '<p class="ur">' + q.urQ + "</p>";
    var box = el("quiz-options");
    box.innerHTML = "";
    q.options.forEach(function (opt, i) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = String.fromCharCode(65 + i) + ". " + opt;
      btn.addEventListener("click", function () { answerQuestion(i); });
      box.appendChild(btn);
    });
    el("quiz-feedback").textContent = "";
    el("quiz-feedback").className = "";
    el("quiz-next").style.display = "none";
  }

  function answerQuestion(i) {
    var q = QUESTIONS[current];
    answers[current] = i;
    var btns = el("quiz-options").children;
    for (var k = 0; k < btns.length; k++) {
      btns[k].disabled = true;
      if (k === q.answer) btns[k].className = "correct";
      else if (k === i) btns[k].className = "wrong";
    }
    var fb = el("quiz-feedback");
    if (i === q.answer) {
      fb.textContent = "✓ Correct. " + q.why;
      fb.className = "good";
    } else {
      fb.textContent = "✗ Not quite — the answer is " + q.options[q.answer] + ". " + q.why;
      fb.className = "bad";
    }
    el("quiz-next").style.display = "inline-block";
    el("quiz-next").textContent = (current === QUESTIONS.length - 1) ? "See my result" : "Next question";
  }

  function renderResult() {
    var r = L.scoreTest(answers, QUESTIONS, PASS_MARK);
    el("quiz-box").style.display = "none";
    el("quiz-result").innerHTML =
      '<div class="total"><strong>You scored ' + r.correct + "/" + r.total +
      " — " + L.gradeTest(r.correct, r.total, PASS_MARK) + "</strong>" +
      "<p>Pass mark is " + PASS_MARK + "/" + r.total + ". Bilal scored 8/10 on his first try — " +
      (r.passed ? "you passed too. Book a slot and go for the real test." : "keep practising — retake the test and beat 7/10.") +
      "</p></div>";
    var list = el("quiz-review");
    list.innerHTML = "";
    QUESTIONS.forEach(function (q, i) {
      var li = document.createElement("li");
      var ok = answers[i] === q.answer;
      li.innerHTML = "<strong>" + (i + 1) + ". " + q.sign + "</strong> — " +
        '<span class="' + (ok ? "ok" : "bad") + '">' + (ok ? "✓ Correct" : "✗ You chose " + q.options[answers[i]]) + "</span>" +
        "<br>Answer: " + q.options[q.answer] + " — " + q.why;
      list.appendChild(li);
    });
    el("quiz-restart").style.display = "inline-block";
  }

  function startQuiz() {
    started = true;
    current = 0;
    answers = [];
    el("quiz-box").style.display = "block";
    el("quiz-result").innerHTML = "";
    el("quiz-review").innerHTML = "";
    el("quiz-start").style.display = "none";
    el("quiz-restart").style.display = "none";
    renderQuestion();
  }

  el("quiz-start").addEventListener("click", startQuiz);
  el("quiz-restart").addEventListener("click", startQuiz);
  el("quiz-next").addEventListener("click", function () {
    if (current === QUESTIONS.length - 1) { renderResult(); return; }
    current++;
    renderQuestion();
  });
  el("quiz-box").style.display = "none";
  el("quiz-restart").style.display = "none";

  // ---- Appointments (6 offices, city filter, book -> receipt) ----
  function tokensLeft(office) {
    var used = bookings.filter(function (b) { return b.officeId === office.id; }).length;
    return Math.max(0, office.tokens - used);
  }

  function renderOffices() {
    var city = el("office-city").value;
    var list = L.filterOffices(OFFICES, city);
    var box = el("office-list");
    box.innerHTML = "";
    if (list.length === 0) {
      box.innerHTML = '<div class="alert notfound"><strong>No offices match</strong>' +
        "<p>Try a different city.</p></div>";
    }
    list.forEach(function (o) {
      var left = tokensLeft(o);
      var div = document.createElement("div");
      div.className = "office" + (o.id === "lahore-township" ? " hot" : "");
      div.innerHTML = "<h3>" + o.office + " <span class='city'>" + o.city + "</span></h3>" +
        "<p>" + o.date + " · " + o.time + "</p>" +
        "<p class='tokens'>" + left + " tokens left</p>";
      var btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = left > 0 ? "Book this slot" : "Fully booked";
      btn.disabled = left <= 0;
      btn.addEventListener("click", function () { bookOffice(o); });
      div.appendChild(btn);
      box.appendChild(div);
    });
    el("office-summary").textContent = "Six city offices. Lahore Township on Wed 12 Nov at 9:00 AM has " +
      tokensLeft(OFFICES[0]) + " tokens left — the earliest slot on the board.";
  }

  function bookOffice(office) {
    var left = tokensLeft(office);
    var booking = L.bookSlot(office, nextReceipt, left);
    if (!booking) return;
    bookings.push({ receipt: booking.receipt, officeId: office.id });
    nextReceipt++;
    saveJSON(STORE_BOOKINGS, bookings);
    saveJSON(STORE_NEXT, nextReceipt);
    el("booking-result").innerHTML =
      '<div class="receipt"><strong>✓ BOOKED — RECEIPT ' + booking.receipt + "</strong>" +
      "<p>" + booking.office + ", " + booking.city + " · " + booking.date + " · " + booking.time +
      " · Token " + booking.token + "</p>" +
      "<p>Show this receipt at the office — no agent needed.</p></div>";
    renderOffices();
  }

  el("office-city").addEventListener("change", renderOffices);
  renderOffices();

  // ---- Licence tracker ----
  function renderLicence(rec) {
    var box = el("lcn-result");
    if (!rec) {
      box.innerHTML = '<div class="alert notfound"><strong>Enter a licence card number</strong>' +
        "<p>It is on your appointment receipt and your learner permit.</p></div>";
      return;
    }
    var cls = rec.status === "notfound" ? "risk" : (rec.status === "printing" || rec.status === "dispatched" ? "ok" : "warn");
    var mark = rec.status === "notfound" ? "! " : "✓ ";
    var html = '<div class="alert ' + cls + '"><strong>' + mark + rec.title + "</strong>" +
      "<p>" + rec.detail + "</p>";
    if (rec.status !== "notfound") {
      html += '<div class="timeline">';
      rec.steps.forEach(function (s, i) {
        var st = i < rec.step ? "done" : (i === rec.step ? "current" : "");
        html += '<div class="step ' + st + '"><span class="dot">' + (i < rec.step ? "✓" : (i + 1)) + "</span>" + s + "</div>";
      });
      html += "</div>";
    }
    if (rec.status === "printing") {
      html += "<p>Ready 14 Nov 2026 — " + L.countdownDays(READY_DATE, TODAY) + " days to go (checked 10 Nov 2026, sample data).</p>";
    }
    html += "</div>";
    box.innerHTML = html;
  }

  function doLicence() {
    renderLicence(L.lookupLicence(LICENCES, el("lcn-input").value));
  }
  el("lcn-btn").addEventListener("click", doLicence);
  el("lcn-input").addEventListener("keydown", function (e) {
    if (e.key === "Enter") doLicence();
  });
  el("lcn-input").value = "LCN-2026-4812";
  doLicence();

  // ---- Agent-fee checker ----
  function renderFee() {
    var q = parseInt(el("quote-input").value, 10);
    if (isNaN(q) || q < 0) q = 0;
    var f = L.feeBreakdown(FEES);
    var o = L.overcharge(q, f.total);
    var box = el("fee-result");
    var html = '<div class="total"><strong>Official fee: ' + rs(f.total) + "</strong>" +
      "<p>Learner permit " + rs(f.learner) + " + signs &amp; road test " + rs(f.test) +
      " + licence card " + rs(f.card) + " = " + rs(f.total) + ".</p></div>";
    if (o.flagged) {
      html += '<div class="alert risk"><strong>! AGENT OVERCHARGE — ' + rs(o.over) + "</strong>" +
        "<p>The agent quoted " + rs(o.quote) + " — that is " + rs(o.over) +
        " over the official " + rs(o.official) + ". Walk away — and report the agent.</p></div>";
    } else {
      html += '<div class="alert ok"><strong>No overcharge</strong>' +
        "<p>The quote of " + rs(o.quote) + " is at or below the official " + rs(o.official) +
        " — but still ask for a written receipt before you pay.</p></div>";
    }
    box.innerHTML = html;
  }
  el("quote-btn").addEventListener("click", renderFee);
  el("quote-input").addEventListener("input", renderFee);
  el("quote-input").value = String(FEES.agentQuote);
  renderFee();

  // ---- Scam spotter ----
  function renderScam() {
    var list = el("scam-flags");
    list.innerHTML = "";
    REDFLAGS.forEach(function (r) {
      var li = document.createElement("li");
      var cb = document.createElement("input");
      cb.type = "checkbox";
      cb.setAttribute("aria-label", r.flag);
      cb.addEventListener("change", renderScamVerdict);
      var span = document.createElement("span");
      span.innerHTML = "<strong>⚠ " + r.flag + "</strong> — " + r.example;
      li.appendChild(cb);
      li.appendChild(span);
      list.appendChild(li);
    });
    renderScamVerdict();
  }

  function renderScamVerdict() {
    var checked = 0;
    var items = el("scam-flags").children;
    for (var i = 0; i < items.length; i++) {
      if (items[i].children[0] && items[i].children[0].checked) checked++;
    }
    var v = L.scoreOffer(checked);
    el("scam-score").textContent = checked + " of " + REDFLAGS.length + " red flags ticked — " + v.level;
    var cls = checked === 0 ? "ok" : (checked <= 2 ? "warn" : "risk");
    el("scam-verdict").innerHTML = '<div class="alert ' + cls + '"><strong>' + v.level + "</strong><p>" + v.advice + "</p></div>";
  }
  renderScam();

  // ---- Document checklist (persisted in localStorage) ----
  function renderChecklist() {
    var list = el("checklist");
    list.innerHTML = "";
    CHECKLIST.forEach(function (item) {
      var li = document.createElement("li");
      var done = doneIds.indexOf(item.id) !== -1;
      li.className = done ? "done" : "";
      var cb = document.createElement("input");
      cb.type = "checkbox";
      cb.checked = done;
      cb.setAttribute("aria-label", item.label);
      cb.addEventListener("change", function () {
        doneIds = L.toggleChecklist(doneIds, item.id);
        saveJSON(STORE_CHECKLIST, doneIds);
        renderChecklist();
      });
      var span = document.createElement("span");
      span.textContent = item.label;
      li.appendChild(cb);
      li.appendChild(span);
      list.appendChild(li);
    });
    var p = L.checklistProgress(doneIds, CHECKLIST);
    el("checklist-progress").textContent = p.done + " of " + p.total +
      " documents ready — tick them all off before your appointment.";
  }
  renderChecklist();

  el("reset-demo").addEventListener("click", function () {
    doneIds = [];
    bookings = [];
    nextReceipt = FIRST_RECEIPT_NO;
    saveJSON(STORE_CHECKLIST, doneIds);
    saveJSON(STORE_BOOKINGS, bookings);
    saveJSON(STORE_NEXT, nextReceipt);
    started = false;
    current = 0;
    answers = [];
    el("office-city").value = "All cities";
    el("lcn-input").value = "LCN-2026-4812";
    el("quote-input").value = String(FEES.agentQuote);
    el("booking-result").innerHTML = "";
    el("quiz-box").style.display = "none";
    el("quiz-result").innerHTML = "";
    el("quiz-review").innerHTML = "";
    el("quiz-start").style.display = "inline-block";
    el("quiz-restart").style.display = "none";
    showTab("mocktest");
    renderOffices();
    doLicence();
    renderFee();
    renderScam();
    renderChecklist();
  });
})();
