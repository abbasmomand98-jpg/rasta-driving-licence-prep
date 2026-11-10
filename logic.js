// Rasta — pure logic, no DOM here, so it can be unit-tested in Node.
(function (root) {
  // Pakistani / Indian digit grouping: 2500 -> "2,500",
  // 8000 -> "8,000". Last three digits group together, then
  // groups of two — the way lakh and crore figures are written in Pakistan.
  function formatPKR(n) {
    var s = String(Math.round(n));
    if (s.length <= 3) return s;
    var last3 = s.slice(-3);
    var rest = s.slice(0, -3);
    var groups = [];
    while (rest.length > 2) {
      groups.unshift(rest.slice(-2));
      rest = rest.slice(0, -2);
    }
    if (rest) groups.unshift(rest);
    return groups.join(",") + "," + last3;
  }

  // Official fee breakdown: learner Rs 500 + test Rs 1,000 + card Rs 1,000
  // = Rs 2,500 total. The parts must always add up to the total.
  function feeBreakdown(fees) {
    return { learner: fees.learner, test: fees.test, card: fees.card,
             total: fees.learner + fees.test + fees.card };
  }

  // Agent-fee flagger: how far is an agent's quote above the official fee?
  // A quote at or below Rs 2,500 is not flagged; anything above it is.
  function overcharge(quote, officialTotal) {
    var q = Math.max(0, Math.round(quote) || 0);
    var over = q - officialTotal;
    return { official: officialTotal, quote: q, over: over,
             flagged: over > 0 };
  }

  // Mock-test scoring: answers is an array of chosen option indexes,
  // one per question. Returns correct count, total and pass/fail —
  // pass is 7/10 or more.
  function scoreTest(answers, questions, passMark) {
    var correct = 0;
    questions.forEach(function (q, i) {
      if (answers[i] === q.answer) correct++;
    });
    return { correct: correct, total: questions.length,
             passed: correct >= passMark };
  }

  function gradeTest(correct, total, passMark) {
    return correct >= passMark ? "PASS" : "FAIL";
  }

  // Booking receipt: RST-2026-XXXX. The first booking mints RST-2026-1042.
  function mintReceipt(n) {
    return "RST-2026-" + String(n).padStart(4, "0");
  }

  // City filter for the appointment board.
  function filterOffices(offices, city) {
    if (!city || city === "All cities") return offices.slice();
    return offices.filter(function (o) { return o.city === city; });
  }

  // Book a slot: returns the booking record, or null when no tokens left.
  function bookSlot(office, receiptNo, tokensLeft) {
    if (tokensLeft <= 0) return null;
    return { receipt: mintReceipt(receiptNo), office: office.office,
             city: office.city, date: office.date, time: office.time,
             token: tokensLeft };
  }

  // Licence lookup: case-insensitive, ignores surrounding spaces.
  // Returns the licence record, or { status: "notfound" } for unknown
  // IDs — an unknown licence is never called verified or printing.
  function normalizeLicence(s) {
    return String(s || "").trim().toUpperCase();
  }

  function lookupLicence(licences, input) {
    var want = normalizeLicence(input);
    if (!want) return null;
    for (var i = 0; i < licences.length; i++) {
      if (normalizeLicence(licences[i].id) === want) return licences[i];
    }
    return { id: want, status: "notfound",
             title: "LICENCE NOT FOUND",
             detail: "This licence number is not in the sample register. Do not pay anyone for it until the number is proven in writing at the licensing office.",
             steps: ["Applied", "Verified", "Printing", "Dispatched"], step: -1 };
  }

  // Days from "today" (ISO date) to the ready date (ISO date).
  // 2026-11-10 -> 2026-11-14 is 4 days.
  function countdownDays(readyISO, todayISO) {
    var d = new Date(readyISO + "T00:00:00Z");
    var t = new Date(todayISO + "T00:00:00Z");
    return Math.round((d.getTime() - t.getTime()) / 86400000);
  }

  // Scam spotter: score an agent offer by how many red flags it shows.
  // 0 flags -> looks clean, 1–2 -> caution, 3+ -> walk away.
  function scoreOffer(selectedCount) {
    if (selectedCount === 0) return { level: "LOOKS CLEAN", advice: "No red flags in this offer — but still check the fee against the official Rs 2,500 before you pay." };
    if (selectedCount <= 2) return { level: "CAUTION", advice: "One or two red flags. Ask for the fee in writing and check the licence number before you pay anything." };
    return { level: "WALK AWAY", advice: "Three or more red flags — this looks like a scam. Do not pay. Book your slot on the appointment board instead." };
  }

  // Document checklist: pure toggle — returns a new array, never mutates.
  function toggleChecklist(doneIds, id) {
    var next = doneIds.slice();
    var i = next.indexOf(id);
    if (i === -1) next.push(id);
    else next.splice(i, 1);
    return next;
  }

  function checklistProgress(doneIds, docs) {
    return { done: doneIds.length, total: docs.length };
  }

  var api = { formatPKR: formatPKR,
              feeBreakdown: feeBreakdown, overcharge: overcharge,
              scoreTest: scoreTest, gradeTest: gradeTest,
              mintReceipt: mintReceipt, filterOffices: filterOffices,
              bookSlot: bookSlot,
              normalizeLicence: normalizeLicence,
              lookupLicence: lookupLicence,
              countdownDays: countdownDays,
              scoreOffer: scoreOffer,
              toggleChecklist: toggleChecklist,
              checklistProgress: checklistProgress };
  if (typeof module !== "undefined") { module.exports = api; }
  else { root.RastaLogic = api; }
})(typeof window !== "undefined" ? window : globalThis);
