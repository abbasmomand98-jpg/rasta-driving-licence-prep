// Rasta DOM smoke test — run with: node dom-smoke.js
// Executes data.js + logic.js + app.js in a tiny fake DOM (vm sandbox)
// and asserts the page renders the canonical figures.
var fs = require("fs");
var vm = require("vm");
var assert = require("assert");

function FakeEl(tag) {
  this.tagName = (tag || "div").toUpperCase();
  this.children = [];
  this._html = "";
  this.textContent = "";
  this.value = "";
  this.checked = false;
  this.disabled = false;
  this.className = "";
  this.style = {};
  this.listeners = {};
  this.attributes = {};
}
FakeEl.prototype.addEventListener = function (ev, fn) {
  (this.listeners[ev] = this.listeners[ev] || []).push(fn);
};
FakeEl.prototype.appendChild = function (child) { this.children.push(child); return child; };
FakeEl.prototype.setAttribute = function (k, v) { this.attributes[k] = v; };
FakeEl.prototype.getAttribute = function (k) { return this.attributes[k]; };
Object.defineProperty(FakeEl.prototype, "innerHTML", {
  get: function () { return this._html; },
  set: function (v) { this._html = String(v); this.children = []; }
});

var byId = {};
function el(id) {
  if (!byId[id]) byId[id] = new FakeEl("div");
  return byId[id];
}
var documentStub = {
  getElementById: el,
  createElement: function (tag) { return new FakeEl(tag); }
};
var store = {};
var localStorageStub = {
  getItem: function (k) { return store[k] || null; },
  setItem: function (k, v) { store[k] = String(v); }
};
function fire(id, ev, arg) {
  (byId[id].listeners[ev] || []).forEach(function (fn) { fn(arg || {}); });
}
function fireEl(node, ev, arg) {
  (node.listeners[ev] || []).forEach(function (fn) { fn(arg || {}); });
}

var sandbox = { document: documentStub, localStorage: localStorageStub, console: console };
sandbox.window = sandbox;
vm.createContext(sandbox);
["data.js", "logic.js", "app.js"].forEach(function (f) {
  vm.runInContext(fs.readFileSync(f, "utf8"), sandbox, { filename: f });
});

var n = 0;
function eq(a, b, msg) { assert.strictEqual(a, b, msg); n++; }
function ok(v, msg) { assert.ok(v, msg); n++; }

// 1. Mock test tab is active on load; quiz starts hidden until Start.
// quiz-intro is static HTML, so check the source file, not the fake DOM.
var htmlSrc = fs.readFileSync("index.html", "utf8");
ok(htmlSrc.indexOf("Bilal's result — 8/10, PASS") !== -1, "intro shows Bilal's 8/10 PASS result");

// 2. Starting the quiz renders question 1: Stop sign, Urdu + English.
fire("quiz-start", "click");
eq(el("quiz-box").style.display, "block", "quiz box shows after Start");
ok(el("quiz-progress").textContent.indexOf("Question 1 of 10") !== -1, "progress shows Question 1 of 10");
ok(el("quiz-question").innerHTML.indexOf("Stop") !== -1, "question 1 is the Stop sign");
ok(el("quiz-question").innerHTML.indexOf("رکیں") !== -1, "question 1 shows the Urdu word");
ok(el("quiz-question").innerHTML.indexOf("یہ نشان کیا مطلب رکھتا ہے؟") !== -1, "question 1 shows the Urdu question");
eq(el("quiz-options").children.length, 4, "question 1 has 4 options");
ok(el("quiz-options").children[0].textContent.indexOf("Stop") !== -1, "option A is Stop");

// 3. Answering correctly marks it and shows feedback, then Next moves on.
fireEl(el("quiz-options").children[0], "click");
ok(el("quiz-feedback").textContent.indexOf("Correct") !== -1, "correct answer shows Correct feedback");
eq(el("quiz-next").style.display, "inline-block", "Next button appears after answering");
fire("quiz-next", "click");
ok(el("quiz-progress").textContent.indexOf("Question 2 of 10") !== -1, "Next moves to Question 2 of 10");
ok(el("quiz-question").innerHTML.indexOf("No Entry") !== -1, "question 2 is No Entry");

// 4. Appointments tab renders all 6 offices; Lahore Township first with 18 tokens.
fire("tab-appointments", "click");
eq(el("section-appointments").style.display, "block", "appointments section shows on tab click");
eq(el("section-mocktest").style.display, "none", "mock test section hides on tab click");
eq(el("office-list").children.length, 6, "appointment board renders 6 offices on load");
ok(el("office-list").children[0].innerHTML.indexOf("Lahore Township") !== -1, "first office is Lahore Township");
ok(el("office-list").children[0].innerHTML.indexOf("18 tokens left") !== -1, "Lahore Township shows 18 tokens left");
ok(el("office-list").children[0].innerHTML.indexOf("Wed 12 Nov") !== -1, "Lahore Township shows Wed 12 Nov");
ok(el("office-list").children[0].innerHTML.indexOf("9:00 AM") !== -1, "Lahore Township shows 9:00 AM");
ok(el("office-summary").textContent.indexOf("18 tokens left") !== -1, "office summary names 18 tokens left");

// 5. Booking Lahore mints receipt RST-2026-1042 and drops tokens to 17.
var lahoreBook = el("office-list").children[0].children[0];
fireEl(lahoreBook, "click");
ok(el("booking-result").innerHTML.indexOf("RST-2026-1042") !== -1, "first booking mints RST-2026-1042");
ok(el("booking-result").innerHTML.indexOf("Lahore Township") !== -1, "receipt names Lahore Township");
ok(el("booking-result").innerHTML.indexOf("Token 18") !== -1, "receipt shows Token 18");
ok(el("office-list").children[0].innerHTML.indexOf("17 tokens left") !== -1, "Lahore tokens drop to 17 after booking");
ok((store["rasta-bookings"] || "").indexOf("RST-2026-1042") !== -1, "booking persists in localStorage");

// 6. City filter shows one office.
el("office-city").value = "Peshawar";
fire("office-city", "change");
eq(el("office-list").children.length, 1, "Peshawar filter shows 1 office");
ok(el("office-list").children[0].innerHTML.indexOf("Peshawar Saddar") !== -1, "Peshawar filter shows Peshawar Saddar");
el("office-city").value = "All cities";
fire("office-city", "change");
eq(el("office-list").children.length, 6, "switching the city filter off restores 6 offices");

// 7. Tracker renders the printing canonical sample on load.
fire("tab-tracker", "click");
ok(el("lcn-result").innerHTML.indexOf("PRINTING") !== -1, "tracker shows PRINTING on load");
ok(el("lcn-result").innerHTML.indexOf("14 Nov 2026") !== -1, "tracker shows ready 14 Nov 2026");
ok(el("lcn-result").innerHTML.indexOf("4 days to go") !== -1, "tracker shows 4 days to go");

// 8. Other licence numbers: verification and dispatched, unknown not found.
el("lcn-input").value = "LCN-2026-077";
fire("lcn-btn", "click");
ok(el("lcn-result").innerHTML.indexOf("UNDER VERIFICATION") !== -1, "LCN-2026-077 shows UNDER VERIFICATION");
el("lcn-input").value = "LCN-2026-310";
fire("lcn-btn", "click");
ok(el("lcn-result").innerHTML.indexOf("DISPATCHED") !== -1, "LCN-2026-310 shows DISPATCHED");
el("lcn-input").value = "LCN-2026-999";
fire("lcn-btn", "click");
ok(el("lcn-result").innerHTML.indexOf("LICENCE NOT FOUND") !== -1, "unknown licence shows LICENCE NOT FOUND");
ok(el("lcn-result").innerHTML.indexOf("PRINTING") === -1, "unknown licence is never called printing");

// 9. Fee checker renders the canonical overcharge on load: Rs 8,000 vs Rs 2,500.
fire("tab-feecheck", "click");
ok(el("fee-result").innerHTML.indexOf("Rs 2,500") !== -1, "fee checker shows official Rs 2,500");
ok(el("fee-result").innerHTML.indexOf("Rs 5,500") !== -1, "fee checker shows Rs 5,500 overcharge");
ok(el("fee-result").innerHTML.indexOf("OVERCHARGE") !== -1, "fee checker flags the overcharge");

// 10. Scam spotter renders 8 flags; ticking 3 gives WALK AWAY.
fire("tab-scam", "click");
eq(el("scam-flags").children.length, 8, "scam spotter renders 8 red flags");
ok(el("scam-score").textContent.indexOf("0 of 8") !== -1, "scam score starts at 0 of 8");
ok(el("scam-score").textContent.indexOf("LOOKS CLEAN") !== -1, "0 flags is LOOKS CLEAN");
for (var i = 0; i < 3; i++) {
  var cb = el("scam-flags").children[i].children[0];
  cb.checked = true;
  fireEl(cb, "change");
}
ok(el("scam-score").textContent.indexOf("3 of 8") !== -1, "scam score moves to 3 of 8 after ticking");
ok(el("scam-score").textContent.indexOf("WALK AWAY") !== -1, "3 flags is WALK AWAY");

// 11. Checklist renders 6 items, progress 0 of 6, ticking persists.
fire("tab-checklist", "click");
eq(el("checklist").children.length, 6, "checklist renders 6 document checks");
eq(el("checklist-progress").textContent, "0 of 6 documents ready — tick them all off before your appointment.", "checklist progress starts at 0 of 6");
var first = el("checklist").children[0].children[0];
first.checked = true;
fireEl(first, "change");
eq(el("checklist-progress").textContent, "1 of 6 documents ready — tick them all off before your appointment.", "progress moves to 1 of 6 after ticking");
ok((store["rasta-checklist-done"] || "").indexOf("cnic") !== -1, "ticked check persists in localStorage");

// 12. Reset restores the canonical defaults.
fire("reset-demo", "click");
eq(el("section-mocktest").style.display, "block", "reset returns to the mock test tab");
ok(el("fee-result").innerHTML.indexOf("Rs 5,500") !== -1, "reset restores the Rs 5,500 overcharge");
ok(el("lcn-result").innerHTML.indexOf("PRINTING") !== -1, "reset restores the printing licence");
eq(el("checklist-progress").textContent, "0 of 6 documents ready — tick them all off before your appointment.", "reset clears the checklist");
eq(el("office-list").children.length, 6, "reset restores all 6 offices");
ok(el("office-list").children[0].innerHTML.indexOf("18 tokens left") !== -1, "reset restores 18 tokens at Lahore Township");
ok(el("booking-result").innerHTML === "", "reset clears the booking receipt");

console.log("\n" + n + " DOM assertions passed.");
