# Rasta — Driving Licence Test Prep & Appointment Tracker (UX Concept)

**Live demo:** https://abbasmomand98-jpg.github.io/rasta-driving-licence-prep/
**Code:** https://github.com/abbasmomand98-jpg/rasta-driving-licence-prep

Rasta is a driving licence test-prep and appointment tracker for Pakistan. A licence costs about Rs 2,500 in official fees — yet agents outside licence offices charge Rs 8,000, learners fail the signs test twice with nothing to practise on, and appointment slots stay invisible until you queue at dawn. Many end up driving unlicensed because the process itself is the obstacle.

Rasta teaches the real road signs in Urdu and English with a 10-question mock test (pass mark 7/10), shows live appointment slots across six city offices, books a slot with a digital receipt, tracks the licence card to your door, flags any agent quote above the official fee, scores an agent's offer against eight red flags, and keeps a document checklist to tick off before your appointment.

## How it works

Open `index.html` in a browser — no build step, no framework, just HTML, CSS and JavaScript. The demo is split into three files so each part is easy to read and change:

- `data.js` — all the sample data: the official fee breakdown, the ten mock-test questions on real road signs, the six city offices, the three licence records, the eight scam red flags, and the document checklist.
- `logic.js` — all the rules, with no DOM code at all: the fee breakdown, the agent-fee flagger, the mock-test scoring, the receipt minter, the office filter, the booking rule, the licence lookup, the countdown, the scam scorer, and the checklist toggle. Because it touches no DOM, it can be tested in Node with `node test.js`.
- `app.js` — the page wiring only: it reads the data, calls the logic, and renders the results into the page. Demo "today" is pinned to 10 Nov 2026 so the sample figures stay stable.

Try it with the sample figures:

1. **Mock test** — ten questions on the real road signs (Stop, No Entry, Speed limit 40, Pedestrian crossing, No U-turn, One way, No parking, Roundabout ahead, School zone, Slippery road), in Urdu and English, with instant scoring and a pass mark of 7/10. Bilal scores 8/10 on his first try — a pass. Answer all ten and the review shows every question with its correct answer.
2. **Appointments** — six city offices with live tokens. Lahore Township on Wed 12 Nov at 9:00 AM has 18 tokens left. Book it and you get receipt RST-2026-1042 — the first booking mints that number, and the token count drops to 17. Bookings are saved on this device.
3. **Licence tracker** — type `LCN-2026-4812` and it comes back PRINTING, ready 14 Nov 2026, 4 days from 10 Nov 2026, with the Applied → Verified → Printing → Dispatched timeline. Type `LCN-2026-077` for UNDER VERIFICATION, `LCN-2026-310` for DISPATCHED. Any other number comes back "not found", never "verified".
4. **Fee checker** — the official total is Rs 2,500 (learner Rs 500 + test Rs 1,000 + card Rs 1,000). Type an agent's quote: Rs 8,000 is flagged as Rs 5,500 over the official fee. Bilal paid an agent Rs 6,000 who vanished — that was Rs 3,500 over.
5. **Scam spotter** — tick the red flags in an agent's offer. Zero flags is LOOKS CLEAN, one or two is CAUTION, three or more is WALK AWAY.
6. **Document checklist** — tick off the six documents (CNIC, learner permit, photos, the Rs 2,500 fee, your appointment receipt, and a 7/10 mock-test score) before your appointment. Your ticks are saved in the browser with localStorage.

Run the tests with `node test.js` — they assert every canonical figure above, plus that all element IDs referenced by `app.js` exist in `index.html` and that the HTML tags balance. `node dom-smoke.js` renders the whole page in a fake DOM and asserts the canonical figures appear on load.

## What you can learn from this project

- **Separating data, logic, and rendering.** `data.js` holds facts, `logic.js` holds rules, `app.js` holds rendering. When the facts change (a new office, a new fee), only `data.js` changes. When a rule changes (how the overcharge is calculated), only `logic.js` changes. This is the single most useful habit in front-end work.
- **Pure functions are testable functions.** Every rule in `logic.js` takes inputs and returns outputs — no DOM, no dates from the clock, no hidden state. That is why `node test.js` can check the overcharge maths (8,000 − 2,500 = 5,500) without opening a browser.
- **Score, don't just list.** The mock test turns a booklet into a game: instant feedback, a running score, and a pass/fail line. A learner who scores 8/10 walks into the real test knowing they can pass.
- **Make the hidden price visible.** The fee checker subtracts the official total from any quote, so an agent's Rs 8,000 is exposed as Rs 5,500 over — before money changes hands. A calculator that only shows the quote would hide the scam.
- **Never trust user input — normalise it.** The licence checker upper-cases the input and trims spaces, so `lcn-2026-4812` still matches. And an unknown licence returns "not found", never a guess.
- **Pakistani number formatting.** `formatPKR` groups digits the way Pakistan writes them — 2,500 stays "2,500" and 8,000 stays "8,000". Small detail, big difference in whether a number reads as real to a Pakistani user.
- **localStorage for a checklist and bookings.** The document checklist and your bookings survive a page refresh because `app.js` saves them under two keys (`rasta-checklist-done`, `rasta-bookings`) and loads them back on start.

## Sample-data honesty note

Every fee, licence number, office, appointment and figure in this demo is invented sample data for an unofficial UX concept. No real office, licence number, or person appears anywhere. Rasta is not a government service — always confirm fees, test rules, appointment slots and licence status with the licensing authority before paying anyone anything.

## Fork it and make it yours

This project is a pattern, not just a demo: a **practise → book → track → verify** tool for any government process where agents and queues stand between people and a document. Fork the repo and adapt it to a problem people face where you live — passport appointments and fee checks, domicile certificate tracking, vehicle registration renewal, or birth certificate applications. Keep the data in `data.js`, the rules in `logic.js`, and the honesty note — and the same pattern will work for your problem too.

---

Rasta is an unofficial UX concept by Muhammad Abbas Khan.
Available for new projects: abbasmomand98@gmail.com
