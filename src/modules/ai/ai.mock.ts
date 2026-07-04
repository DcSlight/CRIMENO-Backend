export const MOCK_REPLIES: string[] = [
  "I'm cross-referencing the VLM and anomaly-scoring pipelines now — three business feeds (jewelry, gun store, market) are active and I'll flag anything crossing the suspicious threshold.",
  "Got it. I'll keep watching the anomaly_score trend on each feed and flag anything that escalates past 'suspicious'.",
  "Based on the last scoring pass, most feeds sit in the 'normal' band; a couple of cameras are trending upward and worth a look.",
  "I've noted that. Let me know if you'd like me to pull the frame-level VLM description for a specific camera or time range.",
];

// Keyword -> reply. Matched against the lowercased question; first match wins.
// Mirrors the suggestion chips in AiChatWidget's SUGGESTED_QUESTIONS.
// Answers are grounded in the demo groq/vlm mocks under mocks/{jewelry,gun_store,market}
// so they read like a real summary of the anomaly-scoring + VLM pipeline output.
export const KEYWORD_REPLIES: { keywords: string[]; answer: string }[] = [
  {
    keywords: ["behaviour pattern", "behavior pattern"],
    answer:
      "Behaviour has shifted from routine to coordinated across three feeds. Jewelry store: calm browsing until 00:22, when a capped subject walked straight to the counter with no browsing (anomaly_score 0.46 → 0.94 by 01:04). Gun store: two masked individuals skip normal shopping behaviour from 00:06 and move toward the counter by 00:12 (face_concealed: yes, aggression: possible). Market: a group loiters near checkout from 00:18 with limited browsing before an armed subject enters at 00:30. All three are now flagged as coordinated/aggressive rather than normal foot traffic.",
  },
  {
    keywords: ["recent alert", "summarize alert", "summarise alert"],
    answer:
      "3 feeds escalated to 'criminal' in the last analysis pass: jewelry store (peak anomaly_score 0.95 — suspects reached into display cases and forced them open, handguns visible), gun store (peak 0.98 — two masked suspects broke into the counter, then stole firearms directly off the wall display), and market (peak 0.99 — an armed suspect took control of the register and cash was handed over twice). Each moved from 'normal' to 'criminal' in under 40 seconds of screen time.",
  },
  {
    keywords: ["suspicious"],
    answer:
      "Yes — 2 of 3 monitored feeds are currently above the suspicious threshold. Gun store: two face-concealed individuals are reaching over the counter with aggression flagged (anomaly_score 0.68). Market: a handgun is visible and the cashier has been forced away from the register (anomaly_score 0.95, label: criminal). The jewelry store feed is also in the criminal band — display cases are actively being emptied as of the last frame.",
  },
  {
    keywords: ["camera status", "check camera"],
    answer:
      "All monitored cameras across the jewelry store, gun store, and market feeds are online and streaming, reporting frames every ~6 seconds to the VLM and anomaly-scoring pipeline. No dropped frames or gaps detected in the current session.",
  },
];
