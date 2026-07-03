import {
  AnomalyTimePoint,
  AnomalyTypeCount,
  BusinessPeopleCount,
  ConfusionMatrix,
  Kpis,
  SeveritySlice,
  WordFrequency,
} from "./analytics.types";

// Ported from the client mock (src/modules/analytics/mocks/analytics.mock.ts).
// Replace each getter's data source with a real query once detection_results
// is wired up to a service.
export const kpis: Kpis = {
  totalEvents: 1_847,
  criminalEvents: 312,
  avgAnomalyScore: 0.61,
  activeBusinesses: 6,
  alertsToday: 24,
};

export const anomaliesOverTime: AnomalyTimePoint[] = [
  { date: "May 25", normal: 142, suspicious: 28, criminal: 6 },
  { date: "May 26", normal: 156, suspicious: 34, criminal: 9 },
  { date: "May 27", normal: 130, suspicious: 22, criminal: 4 },
  { date: "May 28", normal: 118, suspicious: 19, criminal: 3 },
  { date: "May 29", normal: 165, suspicious: 41, criminal: 14 },
  { date: "May 30", normal: 178, suspicious: 53, criminal: 21 },
  { date: "May 31", normal: 145, suspicious: 37, criminal: 11 },
  { date: "Jun 01", normal: 161, suspicious: 45, criminal: 17 },
  { date: "Jun 02", normal: 172, suspicious: 58, criminal: 23 },
  { date: "Jun 03", normal: 139, suspicious: 31, criminal: 8 },
  { date: "Jun 04", normal: 120, suspicious: 26, criminal: 5 },
  { date: "Jun 05", normal: 183, suspicious: 62, criminal: 28 },
  { date: "Jun 06", normal: 168, suspicious: 49, criminal: 19 },
  { date: "Jun 07", normal: 157, suspicious: 44, criminal: 16 },
];

export const anomalyByType: AnomalyTypeCount[] = [
  { type: "Armed Robbery", count: 387 },
  { type: "Weapon Detected", count: 98 },
  { type: "Suspicious Activity", count: 98 },
  { type: "Shoplifting", count: 76 },
  { type: "After Hours Presence", count: 21 },
];

export const severityDistribution: SeveritySlice[] = [
  { name: "Normal", value: 1220 },
  { name: "Suspicious", value: 415 },
  { name: "Criminal", value: 212 },
];

// Rows = actual label, Columns = predicted label, order: Normal / Suspicious / Criminal
export const confusionMatrix: ConfusionMatrix = [
  [890, 47, 12],
  [38, 312, 65],
  [5, 43, 164],
];

export const wordFrequencies: WordFrequency[] = [
  { text: "Armed Robbery", value: 95 },
  { text: "Weapon", value: 88 },
  { text: "Shoplifting", value: 76 },
  { text: "Suspicious Movement", value: 72 },
  { text: "Loitering", value: 65 },
  { text: "Physical Altercation", value: 60 },
  { text: "After Hours", value: 54 },
  { text: "Knife", value: 50 },
  { text: "Concealed Item", value: 48 },
  { text: "Running", value: 45 },
  { text: "Confrontation", value: 42 },
  { text: "Masked Individual", value: 40 },
  { text: "Trespassing", value: 38 },
  { text: "Bag Snatch", value: 35 },
  { text: "Person Down", value: 32 },
  { text: "Unauthorized Access", value: 30 },
  { text: "Aggressive Behavior", value: 28 },
  { text: "Fight", value: 26 },
  { text: "Vehicle", value: 22 },
  { text: "Security Breach", value: 20 },
  { text: "Crowded Area", value: 18 },
  { text: "Back Entrance", value: 15 },
  { text: "Surveillance", value: 14 },
  { text: "Theft", value: 12 },
];

export const peopleByBusiness: BusinessPeopleCount[] = [
  { business: "Downtown Market", people: 214 },
  { business: "Riverside Pharmacy", people: 178 },
  { business: "Northgate Electronics", people: 156 },
  { business: "Maple Street Diner", people: 132 },
  { business: "Harbor View Boutique", people: 97 },
  { business: "Central Auto Parts", people: 64 },
];
