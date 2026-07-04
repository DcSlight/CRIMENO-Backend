export const MOCK_REPLIES: string[] = [
  "I'm cross-referencing the VLM and anomaly-scoring pipelines now — three business feeds (jewelry, gun store, market) are active and I'll flag anything crossing the suspicious threshold.",
  "Got it. I'll keep watching the anomaly_score trend on each feed and flag anything that escalates past 'suspicious'.",
  "Based on the last scoring pass, most feeds sit in the 'normal' band; a couple of cameras are trending upward and worth a look.",
  "I've noted that. Let me know if you'd like me to pull the frame-level VLM description for a specific camera or time range.",
];

export type BusinessKey = "jewelry" | "gun_store" | "market";

export const BUSINESS_KEYS: BusinessKey[] = ["jewelry", "gun_store", "market"];

export const BUSINESS_LABELS: Record<BusinessKey, string> = {
  jewelry: "Jewelry Store",
  gun_store: "Gun Store",
  market: "Market",
};

// Keyword -> per-business reply. Matched against the lowercased question; first
// keyword match wins, then one business is picked at random from `answers` so
// the chat reads like a real per-camera summary instead of a single canned line.
// Grounded in the demo groq mocks under mocks/{jewelry,gun_store,market}/groq_mock.jsonl
// (frame numbers converted to mm:ss assuming 30fps).
export const KEYWORD_REPLIES: {
  keywords: string[];
  answers: Record<BusinessKey, string>;
}[] = [
  {
    keywords: ["behaviour pattern", "behavior pattern"],
    answers: {
      jewelry:
        "Jewelry store: calm browsing until 00:22, then a capped subject walks straight to the counter with no browsing (anomaly_score 0.46 → 0.94 by 01:04, when suspects start forcing open display cases).",
      gun_store:
        "Gun store: two masked individuals skip normal shopping behaviour from 00:06 and turn aggressive near the counter by 00:12 (anomaly_score 0.68). By 00:42 one climbs over the counter into the restricted employee area (0.95).",
      market:
        "Market: a group loiters near checkout from 00:18 with limited browsing (helmet + heavy jacket noted), before an armed subject takes control of the register at 00:30 (anomaly_score 0.95).",
    },
  },
  {
    keywords: ["recent alert", "summarize alert", "summarise alert"],
    answers: {
      jewelry:
        "Jewelry store escalated to 'criminal' at 00:38 (anomaly_score 0.88) when a handgun became visible near the seller; peak severity 0.95 at 01:04 as display cases were forced open and jewelry removed.",
      gun_store:
        "Gun store escalated to 'criminal' at 00:18 (0.86) when the counter was attacked; peak severity 0.98 at 00:54 as suspects made off with firearms taken directly from the wall display.",
      market:
        "Market escalated to 'criminal' at 00:30 (0.95) when an armed suspect took control of the register; peak severity 0.99 as cash was handed over multiple times, including a bag of hidden cash.",
    },
  },
  {
    keywords: ["suspicious"],
    answers: {
      jewelry:
        "Yes — the jewelry store feed is currently in the criminal band (anomaly_score 0.95): suspects are actively reaching into display cases while weapons remain visible near the seller.",
      gun_store:
        "Yes — the gun store feed has escalated to criminal (anomaly_score 0.98): a masked robber is holding multiple stolen firearms taken off the wall display.",
      market:
        "Yes — the market feed shows a handgun visible and the cashier forced away from the register (anomaly_score 0.95, label: criminal).",
    },
  },
  {
    keywords: ["camera status", "check camera"],
    answers: {
      jewelry:
        "Jewelry store camera is online and streaming, reporting frames every ~6 seconds with no dropped frames. It's currently tracking an active criminal-labeled event.",
      gun_store:
        "Gun store camera is online and streaming with no gaps detected. It's currently tracking an active robbery (anomaly_score 0.97) as stolen firearms are carried toward the exit.",
      market:
        "Market camera is online and streaming with no dropped frames. It's currently tracking an active robbery in the checkout area (anomaly_score 0.99).",
    },
  },
];
