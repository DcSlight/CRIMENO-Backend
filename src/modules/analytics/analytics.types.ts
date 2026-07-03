export interface Kpis {
  totalEvents: number;
  criminalEvents: number;
  avgAnomalyScore: number;
  activeBusinesses: number;
  alertsToday: number;
}

export interface AnomalyTimePoint {
  time: string; // seconds into the business's video, e.g. "18s"
  normal: number;
  suspicious: number;
  criminal: number;
}

export interface Business {
  key: string;
  name: string;
}

export interface AnomalyTypeCount {
  type: string;
  count: number;
}

export interface SeveritySlice {
  name: "Normal" | "Suspicious" | "Criminal";
  value: number;
}

export interface WordFrequency {
  text: string;
  value: number; // 1–100, drives font size
}

export interface BusinessPeopleCount {
  business: string;
  people: number;
}

// Rows = actual label, Columns = predicted label — order is [Normal, Suspicious, Criminal]
export type ConfusionMatrix = number[][];
