export const MOCK_REPLIES: string[] = [
  "I'm scanning the live feeds now — no anomalies detected in the last 5 minutes.",
  "Got it. I'll flag anything suspicious as soon as it comes through.",
  "Based on recent activity, everything looks within normal patterns.",
  "I've noted that. Let me know if you'd like me to check a specific camera.",
];

// Keyword -> reply. Matched against the lowercased question; first match wins.
// Mirrors the suggestion chips in AiChatWidget's SUGGESTED_QUESTIONS.
export const KEYWORD_REPLIES: { keywords: string[]; answer: string }[] = [
  {
    keywords: ["behaviour pattern", "behavior pattern"],
    answer:
      "Analyzing behaviour patterns across all active cameras — mostly normal walking and standing detected, with one loitering instance near Camera 3 flagged for review.",
  },
  {
    keywords: ["recent alert", "summarize alert", "summarise alert"],
    answer:
      "In the last 24 hours there were 3 alerts: 2 loitering events and 1 unauthorized access attempt, all reviewed and marked low severity.",
  },
  {
    keywords: ["suspicious"],
    answer:
      "No suspicious activity detected today. All cameras are reporting normal patterns with anomaly scores below threshold.",
  },
  {
    keywords: ["camera status", "check camera"],
    answer:
      "All 6 cameras are online and streaming. Camera 4 had a brief 2-second disconnect at 14:32 but has since reconnected.",
  },
];
