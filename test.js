// Rasta smoke tests — run with: node test.js
// Every canonical figure used in the mockups, slides and copy is asserted here.
var assert = require("assert");
var fs = require("fs");
var data = require("./data.js");
var L = require("./logic.js");

var n = 0;

function eq(a, b, msg) { assert.strictEqual(a, b, msg); n++; }
function ok(v, msg) { assert.ok(v, msg); n++; }
function deep(a, b, msg) { assert.deepStrictEqual(a, b, msg); n++; }

// 1. Official fees: 500 + 1,000 + 1,000 = Rs 2,500.
var f = L.feeBreakdown(data.FEES);
eq(f.learner, 500, "learner permit is Rs 500");
eq(f.test, 1000, "signs & road test is Rs 1,000");
eq(f.card, 1000, "licence card is Rs 1,000");
eq(f.total, 2500, "official total is Rs 2,500 (500 + 1,000 + 1,000)");
eq(data.FEES.total, 2500, "canonical official total is Rs 2,500");
eq(data.FEES.agentQuote, 8000, "canonical agent quote is Rs 8,000");
eq(data.FEES.overcharge, 5500, "canonical overcharge is Rs 5,500");

// 2. Agent-fee flagger: Rs 8,000 quote is Rs 5,500 over.
var o = L.overcharge(8000, 2500);
eq(o.official, 2500, "flagger official fee is Rs 2,500");
eq(o.quote, 8000, "flagger quote is Rs 8,000");
eq(o.over, 5500, "flagger overcharge is Rs 5,500");
eq(o.flagged, true, "Rs 8,000 quote is flagged");
var o2 = L.overcharge(6000, 2500);
eq(o2.over, 3500, "Bilal's Rs 6,000 agent payment was Rs 3,500 over");
eq(o2.flagged, true, "Rs 6,000 is flagged");
var o3 = L.overcharge(2500, 2500);
eq(o3.over, 0, "a quote of exactly Rs 2,500 has no overcharge");
eq(o3.flagged, false, "a quote of exactly Rs 2,500 is not flagged");
var o4 = L.overcharge(2000, 2500);
eq(o4.flagged, false, "a quote below the official fee is not flagged");
eq(o4.over, -500, "a Rs 2,000 quote is Rs 500 under");

// 3. Mock test: 10 questions, pass mark 7/10, Bilal 8/10 PASS.
eq(data.QUESTIONS.length, 10, "mock test has 10 questions");
eq(data.PASS_MARK, 7, "pass mark is 7/10");
var signs = ["Stop", "No Entry", "Speed limit 40", "Pedestrian crossing",
  "No U-turn", "One way", "No parking", "Roundabout ahead", "School zone", "Slippery road"];
data.QUESTIONS.forEach(function (q, i) {
  eq(q.sign, signs[i], "question " + (i + 1) + " is " + signs[i]);
  eq(q.options.length, 4, q.sign + " has 4 options");
  eq(q.answer, 0, q.sign + " correct answer is option A");
  ok(q.q.length > 5, q.sign + " has a question");
  ok(q.ur.length > 1, q.sign + " has an Urdu translation");
  ok(q.urQ.length > 1, q.sign + " has an Urdu question");
  ok(q.why.length > 10, q.sign + " has an explanation");
});
deep(data.BILAL_RESULT, { name: "Bilal", age: 19, city: "Peshawar", score: 8, total: 10, passed: true },
     "Bilal's canonical result is 8/10 PASS");
var bilalAnswers = [0, 0, 0, 0, 0, 0, 0, 0, 1, 1];
var r = L.scoreTest(bilalAnswers, data.QUESTIONS, data.PASS_MARK);
eq(r.correct, 8, "Bilal's answers score 8/10");
eq(r.total, 10, "test total is 10");
eq(r.passed, true, "8/10 passes");
eq(L.gradeTest(8, 10, 7), "PASS", "8/10 grades PASS");
eq(L.gradeTest(6, 10, 7), "FAIL", "6/10 grades FAIL");
eq(L.gradeTest(7, 10, 7), "PASS", "exactly 7/10 grades PASS");
var allWrong = L.scoreTest([1, 1, 1, 1, 1, 1, 1, 1, 1, 1], data.QUESTIONS, 7);
eq(allWrong.correct, 0, "all-wrong answers score 0/10");
eq(allWrong.passed, false, "0/10 fails");

// 4. Booking receipts: first booking mints RST-2026-1042.
eq(L.mintReceipt(1042), "RST-2026-1042", "first booking mints RST-2026-1042");
eq(L.mintReceipt(1043), "RST-2026-1043", "second booking mints RST-2026-1043");
eq(L.mintReceipt(7), "RST-2026-0007", "receipt numbers are zero-padded to 4 digits");
var booking = L.bookSlot(data.OFFICES[0], 1042, 18);
eq(booking.receipt, "RST-2026-1042", "Lahore booking receipt is RST-2026-1042");
eq(booking.office, "Lahore Township", "booking office is Lahore Township");
eq(booking.date, "Wed 12 Nov", "booking date is Wed 12 Nov");
eq(booking.time, "9:00 AM", "booking time is 9:00 AM");
eq(booking.token, 18, "booking token is 18");
eq(L.bookSlot(data.OFFICES[0], 1043, 0), null, "no booking when no tokens are left");

// 5. Appointment board: 6 offices, Lahore Township first.
eq(data.OFFICES.length, 6, "appointment board has 6 offices");
eq(data.OFFICES[0].office, "Lahore Township", "first office is Lahore Township");
eq(data.OFFICES[0].city, "Lahore", "Lahore Township is in Lahore");
eq(data.OFFICES[0].date, "Wed 12 Nov", "Lahore Township slot is Wed 12 Nov");
eq(data.OFFICES[0].time, "9:00 AM", "Lahore Township slot is 9:00 AM");
eq(data.OFFICES[0].tokens, 18, "Lahore Township has 18 tokens left");
eq(data.OFFICES[1].office, "Karachi Clifton", "second office is Karachi Clifton");
eq(data.OFFICES[1].tokens, 24, "Karachi Clifton has 24 tokens left");
eq(data.OFFICES[2].office, "Islamabad G-9", "third office is Islamabad G-9");
eq(data.OFFICES[3].office, "Peshawar Saddar", "fourth office is Peshawar Saddar");
eq(data.OFFICES[4].office, "Rawalpindi Raja Bazaar", "fifth office is Rawalpindi Raja Bazaar");
eq(data.OFFICES[5].office, "Quetta Sariab Road", "sixth office is Quetta Sariab Road");
eq(data.OFFICES[5].tokens, 27, "Quetta Sariab Road has 27 tokens left");
eq(L.filterOffices(data.OFFICES, "All cities").length, 6, "no filter shows all 6 offices");
eq(L.filterOffices(data.OFFICES, "Peshawar").length, 1, "Peshawar filter shows 1 office");
eq(L.filterOffices(data.OFFICES, "Peshawar")[0].office, "Peshawar Saddar", "Peshawar filter shows Peshawar Saddar");
eq(L.filterOffices(data.OFFICES, "Lahore").length, 1, "Lahore filter shows 1 office");

// 6. Licence tracker: LCN-2026-4812 printing, 077 verification, 310 dispatched.
var printing = L.lookupLicence(data.LICENCES, "LCN-2026-4812");
eq(printing.status, "printing", "LCN-2026-4812 is printing");
eq(printing.title, "PRINTING — READY 14 NOV 2026", "printing licence title");
ok(printing.detail.indexOf("14 Nov 2026") !== -1, "printing detail names 14 Nov 2026");
eq(printing.step, 2, "printing is step 3 of 4");
var printingLower = L.lookupLicence(data.LICENCES, "lcn-2026-4812");
eq(printingLower.status, "printing", "licence lookup is case-insensitive");
var printingSpaced = L.lookupLicence(data.LICENCES, "  LCN-2026-4812  ");
eq(printingSpaced.status, "printing", "licence lookup ignores surrounding spaces");
var verif = L.lookupLicence(data.LICENCES, "LCN-2026-077");
eq(verif.status, "verification", "LCN-2026-077 is under verification");
eq(verif.title, "UNDER VERIFICATION", "verification licence title");
var disp = L.lookupLicence(data.LICENCES, "LCN-2026-310");
eq(disp.status, "dispatched", "LCN-2026-310 is dispatched");
eq(disp.title, "DISPATCHED", "dispatched licence title");
var unknown = L.lookupLicence(data.LICENCES, "LCN-2026-999");
eq(unknown.status, "notfound", "an unknown licence is not-found, never verified");
eq(unknown.title, "LICENCE NOT FOUND", "unknown licence title");
eq(L.lookupLicence(data.LICENCES, ""), null, "empty licence returns null");
eq(L.lookupLicence(data.LICENCES, "   "), null, "blank licence returns null");
eq(L.lookupLicence(data.LICENCES, null), null, "null licence returns null");
eq(data.LICENCES.length, 3, "exactly three known sample licences");

// 7. Countdown: 10 Nov 2026 -> 14 Nov 2026 is 4 days.
eq(L.countdownDays("2026-11-14", "2026-11-10"), 4,
   "countdown from 10 Nov to 14 Nov 2026 is 4 days");
eq(L.countdownDays("2026-11-10", "2026-11-10"), 0, "same-day countdown is 0 days");

// 8. Scam spotter: 8 flags, score bands.
eq(data.REDFLAGS.length, 8, "spotter lists 8 red flags");
ok(data.REDFLAGS.some(function (r) { return r.id === "no-licence"; }),
   "spotter includes the no-licence flag");
ok(data.REDFLAGS.some(function (r) { return r.id === "cash-advance"; }),
   "spotter includes the cash-only advance flag");
ok(data.REDFLAGS.some(function (r) { return r.id === "fee-above-official"; }),
   "spotter includes the fee-above-official flag");
ok(data.REDFLAGS.every(function (r) { return r.example.length > 10; }),
   "every red flag carries a concrete example");
eq(L.scoreOffer(0).level, "LOOKS CLEAN", "0 flags is LOOKS CLEAN");
eq(L.scoreOffer(1).level, "CAUTION", "1 flag is CAUTION");
eq(L.scoreOffer(2).level, "CAUTION", "2 flags is CAUTION");
eq(L.scoreOffer(3).level, "WALK AWAY", "3 flags is WALK AWAY");
eq(L.scoreOffer(8).level, "WALK AWAY", "8 flags is WALK AWAY");

// 9. Pakistani digit grouping.
eq(L.formatPKR(500), "500", "Rs 500 needs no separator");
eq(L.formatPKR(2500), "2,500", "Rs 2,500");
eq(L.formatPKR(5500), "5,500", "Rs 5,500");
eq(L.formatPKR(8000), "8,000", "Rs 8,000");
eq(L.formatPKR(6000), "6,000", "Rs 6,000");

// 10. Checklist toggle is pure and progress counts.
var start = ["cnic", "learner"];
var added = L.toggleChecklist(start, "photos");
deep(added, ["cnic", "learner", "photos"], "toggle adds a missing check");
deep(start, ["cnic", "learner"], "toggle never mutates the original list");
deep(L.toggleChecklist(start, "cnic"), ["learner"], "toggle removes a done check");
deep(L.checklistProgress(["cnic", "learner"], data.CHECKLIST), { done: 2, total: 6 },
     "progress is 2 of 6 checks");
deep(L.checklistProgress([], data.CHECKLIST), { done: 0, total: 6 }, "progress starts at 0 of 6");
eq(data.CHECKLIST.length, 6, "checklist has 6 document checks");
ok(data.CHECKLIST.some(function (c) { return c.id === "fee"; }),
   "checklist includes the Rs 2,500 fee check");

// 11. Cities: the six canonical cities.
deep(data.CITIES, ["Lahore", "Karachi", "Islamabad", "Peshawar", "Rawalpindi", "Quetta"],
     "six cities in order");

// 12. Every element id referenced by app.js exists in index.html.
var html = fs.readFileSync(__dirname + "/index.html", "utf8");
var appJs = fs.readFileSync(__dirname + "/app.js", "utf8");
var ids = {};
var m;
var idRe = /el\("([^"]+)"\)/g;
while ((m = idRe.exec(appJs)) !== null) ids[m[1]] = true;
var idList = Object.keys(ids);
ok(idList.length >= 12, "app.js references at least 12 element ids (" + idList.length + " found)");
idList.forEach(function (id) {
  ok(html.indexOf('id="' + id + '"') !== -1, "index.html defines id " + id);
});
["data.js", "logic.js", "app.js"].forEach(function (f) {
  ok(html.indexOf('src="' + f + '"') !== -1, "index.html loads " + f);
});
ok(html.indexOf('href="style.css"') !== -1, "index.html loads style.css");
// Tab buttons and sections exist for all six tabs.
["mocktest", "appointments", "tracker", "feecheck", "scam", "checklist"].forEach(function (t) {
  ok(html.indexOf('id="tab-' + t + '"') !== -1, "index.html defines tab " + t);
  ok(html.indexOf('id="section-' + t + '"') !== -1, "index.html defines section " + t);
});

// 13. HTML tag balance: every opened tag is closed (void elements excluded).
var voidTags = { meta: 1, link: 1, input: 1, br: 1, hr: 1, img: 1 };
var stack = [];
var tagRe = /<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*\/?>/g;
while ((m = tagRe.exec(html)) !== null) {
  var tag = m[1].toLowerCase();
  var raw = m[0];
  if (voidTags[tag]) continue;
  if (raw[1] === "/") {
    eq(stack.pop(), tag, "closing tag </" + tag + "> matches the last opened tag");
  } else if (raw[raw.length - 2] !== "/") {
    stack.push(tag);
  }
}
eq(stack.length, 0, "no unclosed tags remain (stack empty)");

console.log("\n" + n + " assertions passed.");
