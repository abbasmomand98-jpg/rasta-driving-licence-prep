// Rasta — Driving Licence Test Prep & Appointment Tracker (UX Concept).
// IMPORTANT: every fee, licence number, office, figure and city below is
// SAMPLE data invented for this UX concept demo. No real office, licence
// number, or person appears anywhere. Rasta is an unofficial concept, not
// a government service: always confirm fees, test rules, appointment
// slots and licence status with the licensing authority before paying
// anyone anything.

// Canonical official fees (sample): Learner permit Rs 500 + signs & road
// test Rs 1,000 + licence card Rs 1,000 = official total Rs 2,500.
// An agent quoting Rs 8,000 is Rs 5,500 over the official fee.
var FEES = {
  learner: 500,
  test: 1000,
  card: 1000,
  total: 2500,
  agentQuote: 8000,
  overcharge: 5500
};

// The canonical mock test: 10 questions on real road signs, bilingual
// Urdu + English. Pass mark 7/10. Bilal scores 8/10 on his first try —
// a PASS. Demo "today" is pinned to 10 Nov 2026.
var PASS_MARK = 7;
var BILAL_RESULT = { name: "Bilal", age: 19, city: "Peshawar", score: 8, total: 10, passed: true };

var QUESTIONS = [
  { sign: "Stop", ur: "رکیں",
    q: "What does this sign mean?", urQ: "یہ نشان کیا مطلب رکھتا ہے؟",
    options: ["Stop", "Go ahead", "Slow down", "No entry"],
    answer: 0,
    why: "A red octagon means stop completely, then go only when the road is clear." },
  { sign: "No Entry", ur: "داخلہ منع ہے",
    q: "What does this sign mean?", urQ: "یہ نشان کیا مطلب رکھتا ہے؟",
    options: ["No entry", "One way", "No parking", "U-turn allowed"],
    answer: 0,
    why: "A red circle with a white bar means do not enter this road." },
  { sign: "Speed limit 40", ur: "رفتار کی حد 40",
    q: "What is the speed limit here?", urQ: "یہاں رفتار کی حد کیا ہے؟",
    options: ["40 km/h", "60 km/h", "80 km/h", "No limit"],
    answer: 0,
    why: "The number inside the red circle is the maximum speed — 40 km/h here." },
  { sign: "Pedestrian crossing", ur: "پیدل گزرگاہ",
    q: "What does this sign mean?", urQ: "یہ نشان کیا مطلب رکھتا ہے؟",
    options: ["Pedestrians may cross here", "No pedestrians allowed", "School ahead", "Parking ahead"],
    answer: 0,
    why: "Slow down and give way — people on foot may be crossing here." },
  { sign: "No U-turn", ur: "یو ٹرن منع ہے",
    q: "What does this sign mean?", urQ: "یہ نشان کیا مطلب رکھتا ہے؟",
    options: ["U-turns are not allowed", "U-turns are allowed", "Turn left only", "Roundabout ahead"],
    answer: 0,
    why: "A U-turn arrow with a red slash means you may not turn back here." },
  { sign: "One way", ur: "یک طرفہ سڑک",
    q: "What does this sign mean?", urQ: "یہ نشان کیا مطلب رکھتا ہے؟",
    options: ["Traffic flows one way only", "Two-way traffic", "No entry", "Dead end"],
    answer: 0,
    why: "Traffic on this road moves in one direction only — follow the arrow." },
  { sign: "No parking", ur: "پارکنگ منع ہے",
    q: "What does this sign mean?", urQ: "یہ نشان کیا مطلب رکھتا ہے؟",
    options: ["Parking is not allowed here", "Parking is allowed", "Bus stop", "Taxi stand"],
    answer: 0,
    why: "A blue circle with a red slash over a P means do not park here." },
  { sign: "Roundabout ahead", ur: "آگے گول چکر ہے",
    q: "What does this sign mean?", urQ: "یہ نشان کیا مطلب رکھتا ہے؟",
    options: ["A roundabout is ahead", "Traffic lights ahead", "Sharp bend ahead", "Road narrows"],
    answer: 0,
    why: "Slow down and give way to traffic already on the roundabout." },
  { sign: "School zone", ur: "اسکول کا علاقہ",
    q: "What does this sign mean?", urQ: "یہ نشان کیا مطلب رکھتا ہے؟",
    options: ["Slow down — children crossing", "Hospital ahead", "Speed up", "No horn"],
    answer: 0,
    why: "Children may cross here — slow down and stay alert near a school." },
  { sign: "Slippery road", ur: "پھسلن والی سڑک",
    q: "What does this sign mean?", urQ: "یہ نشان کیا مطلب رکھتا ہے؟",
    options: ["The road may be slippery — slow down", "Road closed", "Bumpy road", "Falling rocks"],
    answer: 0,
    why: "A skidding car means the road may be slippery — slow down and keep distance." }
];

// Appointment board — six city offices (sample slots). Lahore Township on
// Wed 12 Nov at 9:00 AM has 18 tokens left. Booking mints a receipt
// RST-2026-XXXX; the first booking mints RST-2026-1042.
var OFFICES = [
  { id: "lahore-township", office: "Lahore Township", city: "Lahore",
    date: "Wed 12 Nov", time: "9:00 AM", tokens: 18 },
  { id: "karachi-clifton", office: "Karachi Clifton", city: "Karachi",
    date: "Thu 13 Nov", time: "10:00 AM", tokens: 24 },
  { id: "islamabad-g9", office: "Islamabad G-9", city: "Islamabad",
    date: "Wed 12 Nov", time: "11:00 AM", tokens: 9 },
  { id: "peshawar-saddar", office: "Peshawar Saddar", city: "Peshawar",
    date: "Thu 13 Nov", time: "9:30 AM", tokens: 31 },
  { id: "rawalpindi-raja", office: "Rawalpindi Raja Bazaar", city: "Rawalpindi",
    date: "Fri 14 Nov", time: "10:00 AM", tokens: 12 },
  { id: "quetta-sariab", office: "Quetta Sariab Road", city: "Quetta",
    date: "Fri 14 Nov", time: "9:00 AM", tokens: 27 }
];

// Licence tracker — the same three cards appear in the mockups, slides
// and copy. LCN-2026-4812 is printing, ready 14 Nov 2026. Unknown IDs
// are "not found", never "verified".
var LICENCES = [
  { id: "LCN-2026-4812", status: "printing",
    title: "PRINTING — READY 14 NOV 2026",
    detail: "Your licence card is printing. It will be dispatched to your address and is ready on 14 Nov 2026 — 4 days from 10 Nov 2026.",
    steps: ["Applied", "Verified", "Printing", "Dispatched"], step: 2 },
  { id: "LCN-2026-077", status: "verification",
    title: "UNDER VERIFICATION",
    detail: "Your application is being checked. This usually takes a few working days — check again tomorrow.",
    steps: ["Applied", "Verified", "Printing", "Dispatched"], step: 1 },
  { id: "LCN-2026-310", status: "dispatched",
    title: "DISPATCHED",
    detail: "Your licence card has been dispatched and is on its way to your address.",
    steps: ["Applied", "Verified", "Printing", "Dispatched"], step: 3 }
];

// Scam spotter — each flag carries a sample example. The three flags
// named in the brief (no licence, cash-only advance, fee far above the
// official Rs 2,500) are first.
var REDFLAGS = [
  { id: "no-licence", flag: "No licence number shown",
    example: "A real agent works through the licensing office and can show a reference. Bilal's agent showed none — then vanished with Rs 6,000." },
  { id: "cash-advance", flag: "Cash-only advance payment",
    example: "An advance paid in cash, with no receipt, is gone if the agent vanishes. Insist on the official fee at the office counter, with a receipt." },
  { id: "fee-above-official", flag: "Fee far above the official Rs 2,500",
    example: "The official total is Rs 2,500 (learner Rs 500 + test Rs 1,000 + card Rs 1,000). An agent quoting Rs 8,000 is Rs 5,500 over — walk away." },
  { id: "guaranteed-pass", flag: "\u201cGuaranteed pass\u201d promised",
    example: "Nobody can guarantee you pass the signs test. The test is marked on the day — a \u201cguaranteed pass\u201d is a sales line, not a service." },
  { id: "pay-today", flag: "Pressure to pay today",
    example: "\u201cThis slot is only for today\u201d is a pressure tactic. Real appointment slots are listed on the board — take the receipt home and check it first." },
  { id: "cnic-whatsapp", flag: "Asks for your CNIC photo on WhatsApp",
    example: "Never send your CNIC photo to a stranger on WhatsApp. Your documents go to the licensing office counter, not to an agent's chat." },
  { id: "no-office", flag: "No office address, only a mobile number",
    example: "An agent with no office address cannot be found again if something goes wrong. A real office has a counter you can walk into." },
  { id: "no-receipt", flag: "No written receipt for your money",
    example: "A quote on WhatsApp is not a receipt. The official fee comes with a printed receipt — if there is no receipt, there is no proof you paid." }
];

// Document checklist — tick each step off before your appointment.
// Persisted in localStorage by app.js.
var CHECKLIST = [
  { id: "cnic", label: "CNIC original + one photocopy" },
  { id: "learner", label: "Learner permit (Rs 500) — valid 6 months" },
  { id: "photos", label: "Two passport-size photos" },
  { id: "fee", label: "Official fee Rs 2,500 ready (learner + test + card)" },
  { id: "receipt", label: "Appointment receipt (RST-2026-XXXX) saved" },
  { id: "practice", label: "Practised the mock test — scored 7/10 or more" }
];

var CITIES = ["Lahore", "Karachi", "Islamabad", "Peshawar", "Rawalpindi", "Quetta"];

if (typeof module !== "undefined") {
  module.exports = { FEES: FEES, PASS_MARK: PASS_MARK, BILAL_RESULT: BILAL_RESULT,
    QUESTIONS: QUESTIONS, OFFICES: OFFICES, LICENCES: LICENCES,
    REDFLAGS: REDFLAGS, CHECKLIST: CHECKLIST, CITIES: CITIES };
}
