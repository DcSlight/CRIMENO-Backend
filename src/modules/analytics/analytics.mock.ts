import {
  AnomalyTimePoint,
  AnomalyTypeCount,
  Business,
  BusinessPeopleCount,
  ConfusionMatrix,
  Kpis,
  SeveritySlice,
  WordFrequency,
} from "./analytics.types";

// Derived from the 3 real business mocks under /mocks (gun_store, market,
// jewelry) — each folder's groq_mock.jsonl (per-segment anomaly labels +
// scores) and vlm_mock.jsonl (per-frame VLM descriptions). Replace each
// getter's data source with a real query once detection_results is wired up
// to a service.
export const businesses: Business[] = [
  { key: "gun_store", name: "Gun Store" },
  { key: "market", name: "Market" },
  { key: "jewelry", name: "Jewelry Store" },
];

// Segment label totals across the 3 groq_mock.jsonl files:
// Gun Store 1/2/9, Market 3/2/16, Jewelry 4/4/10 (normal/suspicious/criminal)
// -> 8 normal, 8 suspicious, 35 criminal, 51 segments total.
export const kpis: Kpis = {
  totalEvents: 51,
  criminalEvents: 35,
  avgAnomalyScore: 0.76, // mean anomaly_score across all 51 segments
  activeBusinesses: businesses.length,
  alertsToday: 35, // criminal-labeled segments
};

// One seconds-timeline per business, built directly from each business's
// groq_mock.jsonl: time = frame_range.start / 30fps, and the segment's label
// carries round(anomaly_score * 100) while the other two series stay at 0 —
// this paints the normal -> suspicious -> criminal escalation per video.
export const anomalyTrendByBusiness: Record<string, AnomalyTimePoint[]> = {
  gun_store: [
    { time: "0s", normal: 18, suspicious: 0, criminal: 0 },
    { time: "6s", normal: 0, suspicious: 48, criminal: 0 },
    { time: "12s", normal: 0, suspicious: 68, criminal: 0 },
    { time: "18s", normal: 0, suspicious: 0, criminal: 86 },
    { time: "24s", normal: 0, suspicious: 0, criminal: 90 },
    { time: "30s", normal: 0, suspicious: 0, criminal: 91 },
    { time: "36s", normal: 0, suspicious: 0, criminal: 92 },
    { time: "42s", normal: 0, suspicious: 0, criminal: 95 },
    { time: "48s", normal: 0, suspicious: 0, criminal: 97 },
    { time: "54s", normal: 0, suspicious: 0, criminal: 98 },
    { time: "60s", normal: 0, suspicious: 0, criminal: 98 },
    { time: "66s", normal: 0, suspicious: 0, criminal: 97 },
  ],
  market: [
    { time: "0s", normal: 3, suspicious: 0, criminal: 0 },
    { time: "6s", normal: 4, suspicious: 0, criminal: 0 },
    { time: "12s", normal: 5, suspicious: 0, criminal: 0 },
    { time: "18s", normal: 0, suspicious: 42, criminal: 0 },
    { time: "24s", normal: 0, suspicious: 58, criminal: 0 },
    { time: "30s", normal: 0, suspicious: 0, criminal: 95 },
    { time: "36s", normal: 0, suspicious: 0, criminal: 97 },
    { time: "42s", normal: 0, suspicious: 0, criminal: 98 },
    { time: "48s", normal: 0, suspicious: 0, criminal: 98 },
    { time: "54s", normal: 0, suspicious: 0, criminal: 98 },
    { time: "60s", normal: 0, suspicious: 0, criminal: 99 },
    { time: "66s", normal: 0, suspicious: 0, criminal: 99 },
    { time: "72s", normal: 0, suspicious: 0, criminal: 99 },
    { time: "78s", normal: 0, suspicious: 0, criminal: 99 },
    { time: "84s", normal: 0, suspicious: 0, criminal: 99 },
    { time: "90s", normal: 0, suspicious: 0, criminal: 99 },
    { time: "96s", normal: 0, suspicious: 0, criminal: 99 },
    { time: "102s", normal: 0, suspicious: 0, criminal: 99 },
    { time: "108s", normal: 0, suspicious: 0, criminal: 99 },
    { time: "114s", normal: 0, suspicious: 0, criminal: 99 },
    { time: "120s", normal: 0, suspicious: 0, criminal: 99 },
  ],
  jewelry: [
    { time: "0s", normal: 4, suspicious: 0, criminal: 0 },
    { time: "6s", normal: 6, suspicious: 0, criminal: 0 },
    { time: "12s", normal: 8, suspicious: 0, criminal: 0 },
    { time: "18s", normal: 12, suspicious: 0, criminal: 0 },
    { time: "22s", normal: 0, suspicious: 46, criminal: 0 },
    { time: "26s", normal: 0, suspicious: 63, criminal: 0 },
    { time: "30s", normal: 0, suspicious: 74, criminal: 0 },
    { time: "34s", normal: 0, suspicious: 82, criminal: 0 },
    { time: "38s", normal: 0, suspicious: 0, criminal: 88 },
    { time: "42s", normal: 0, suspicious: 0, criminal: 90 },
    { time: "46s", normal: 0, suspicious: 0, criminal: 91 },
    { time: "50s", normal: 0, suspicious: 0, criminal: 89 },
    { time: "54s", normal: 0, suspicious: 0, criminal: 92 },
    { time: "58s", normal: 0, suspicious: 0, criminal: 94 },
    { time: "64s", normal: 0, suspicious: 0, criminal: 95 },
    { time: "72s", normal: 0, suspicious: 0, criminal: 94 },
    { time: "80s", normal: 0, suspicious: 0, criminal: 93 },
    { time: "88s", normal: 0, suspicious: 0, criminal: 91 },
  ],
};

// Categorized by keyword match (robbery/armed, weapon/firearm/gun, steal/
// theft/stolen, restricted/climb/breach) over each segment's reason +
// key_moments text across all 51 segments; "Suspicious Behavior" counts
// segments labeled suspicious. Segments can match more than one category.
export const anomalyByType: AnomalyTypeCount[] = [
  { type: "Armed Robbery", count: 25 },
  { type: "Theft / Stolen Goods", count: 19 },
  { type: "Weapon Detected", count: 15 },
  { type: "Suspicious Behavior", count: 8 },
  { type: "Restricted Area Breach", count: 3 },
];

export const severityDistribution: SeveritySlice[] = [
  { name: "Normal", value: 8 },
  { name: "Suspicious", value: 8 },
  { name: "Criminal", value: 35 },
];

// No ground-truth labels exist in the mocks, so this stays synthetic — sized
// to the real per-label totals above (row sums: 8 / 8 / 35). The Criminal row
// carries a heavier actual-criminal -> predicted-normal miss rate: several
// segments in the source videos (e.g. the opening seconds of the gun store
// and market robberies) score as "normal" even though the video is already a
// robbery, so the model isn't purely diagonal here.
// Rows = actual label, Columns = predicted label, order: Normal / Suspicious / Criminal
export const confusionMatrix: ConfusionMatrix = [
  [7, 1, 0],
  [1, 6, 1],
  [5, 3, 27],
];

// Top terms by frequency, tokenized from each segment's reason + key_moments
// text across all 51 segments (stopwords removed); value normalized to the
// top term's count (29 -> 100).
export const wordFrequencies: WordFrequency[] = [
  { text: "Suspects", value: 100 },
  { text: "Robbery", value: 90 },
  { text: "Counter", value: 76 },
  { text: "Armed", value: 59 },
  { text: "Suspect", value: 52 },
  { text: "Stolen", value: 41 },
  { text: "Visible", value: 38 },
  { text: "Masked", value: 38 },
  { text: "Control", value: 38 },
  { text: "Firearms", value: 34 },
  { text: "Theft", value: 31 },
  { text: "Enters", value: 31 },
  { text: "Cashier", value: 31 },
  { text: "Cash", value: 31 },
  { text: "Additional", value: 28 },
  { text: "Display", value: 28 },
  { text: "Cases", value: 28 },
  { text: "Behavior", value: 24 },
  { text: "Active", value: 24 },
  { text: "Items", value: 24 },
  { text: "Customer", value: 24 },
  { text: "Register", value: 24 },
  { text: "Weapon", value: 21 },
  { text: "Restricted", value: 21 },
];

// "Smart hardcode": peak distinct people mentioned in each business's
// vlm_mock.jsonl descriptions — Gun Store stays at "two masked individuals"
// throughout; Market peaks with cashier + customer + the entering group +
// armed suspect + accomplice + the late bag-carrying arrival; Jewelry peaks
// with the employee + browsing customers + capped male + the 2 additional
// armed suspects who join.
export const peopleByBusiness: BusinessPeopleCount[] = [
  { business: "Market", people: 7 },
  { business: "Jewelry Store", people: 6 },
  { business: "Gun Store", people: 2 },
];
