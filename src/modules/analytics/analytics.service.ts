import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as fs from "fs";
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
import {
  anomalyByType,
  anomalyTrendByBusiness,
  businesses,
  confusionMatrix,
  kpis,
  peopleByBusiness,
  severityDistribution,
  wordFrequencies,
} from "./analytics.mock";

// Shape of the analytics.json file produced by the Python aggregator in the
// sibling CRIMENO-Model repo. Only the fields we care about are typed here —
// everything is `unknown` until it passes the runtime validators below, since
// we never trust this file blindly (it's generated outside this process).
interface RealAnalyticsData {
  schema_version: number;
  businesses?: unknown;
  kpisByBusiness?: Record<string, unknown>;
  anomalyTrendByBusiness?: Record<string, unknown>;
  anomalyTypeByBusiness?: Record<string, unknown>;
  severityByBusiness?: Record<string, unknown>;
  wordFrequenciesByBusiness?: Record<string, unknown>;
  peopleByBusiness?: Record<string, unknown>;
  confusionMatrixByBusiness?: Record<string, unknown>;
  [key: string]: unknown;
}

const SUPPORTED_SCHEMA_VERSION = 2;

// Reads real analytics data (when ANALYTICS_JSON_PATH is configured) once at
// startup and prefers it field-by-field, falling back to the hardcoded mock
// in analytics.mock.ts whenever the real file is absent, unreadable, invalid,
// on an unsupported schema version, or missing/malformed for a given field.
@Injectable()
export class AnalyticsService implements OnModuleInit {
  private readonly logger = new Logger(AnalyticsService.name);
  private real: RealAnalyticsData | null = null;

  constructor(private readonly config: ConfigService) {}

  onModuleInit(): void {
    const jsonPath = this.config.get<string>("analyticsJsonPath");
    if (!jsonPath) {
      // Not configured — expected in local/dev without the env var. Operate
      // in mock-only mode silently.
      return;
    }

    let raw: string;
    try {
      raw = fs.readFileSync(jsonPath, "utf-8");
    } catch (err) {
      this.logger.warn(
        `Could not read analytics JSON at "${jsonPath}" (${(err as Error).message}). Falling back to mock analytics data.`,
      );
      return;
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      this.logger.warn(
        `Analytics JSON at "${jsonPath}" is not valid JSON (${(err as Error).message}). Falling back to mock analytics data.`,
      );
      return;
    }

    if (
      !parsed ||
      typeof parsed !== "object" ||
      (parsed as Record<string, unknown>).schema_version !== SUPPORTED_SCHEMA_VERSION
    ) {
      this.logger.warn(
        `Analytics JSON at "${jsonPath}" has a missing or unsupported schema_version (expected ${SUPPORTED_SCHEMA_VERSION}). Falling back to mock analytics data.`,
      );
      return;
    }

    this.real = parsed as RealAnalyticsData;
    this.logger.log(`Loaded real analytics data from "${jsonPath}".`);
  }

  getKpis(business?: string): Kpis | null {
    if (business !== undefined) {
      const real = this.real?.kpisByBusiness?.[business];
      return this.isValidKpis(real) ? real : null;
    }

    const real = this.firstValidRealEntry(this.real?.kpisByBusiness, this.isValidKpis);
    return real ?? kpis;
  }

  getBusinesses(): Business[] {
    const real = this.real?.businesses;
    if (this.isValidBusinesses(real)) {
      return real;
    }
    return businesses;
  }

  getAnomalyTrend(business?: string): AnomalyTimePoint[] | null {
    if (business !== undefined) {
      const real = this.real?.anomalyTrendByBusiness?.[business];
      return this.isValidAnomalyTimePoints(real) ? real : null;
    }

    const key = businesses[0].key;

    const real = this.real?.anomalyTrendByBusiness?.[key];
    if (this.isValidAnomalyTimePoints(real)) {
      return real;
    }

    return anomalyTrendByBusiness[key] ?? anomalyTrendByBusiness[businesses[0].key];
  }

  getAnomalyType(business?: string): AnomalyTypeCount[] | null {
    if (business !== undefined) {
      const real = this.real?.anomalyTypeByBusiness?.[business];
      return this.isValidAnomalyTypeCounts(real) ? real : null;
    }

    const real = this.firstValidRealEntry(
      this.real?.anomalyTypeByBusiness,
      this.isValidAnomalyTypeCounts,
    );
    return real ?? anomalyByType;
  }

  getSeverityDistribution(business?: string): SeveritySlice[] | null {
    if (business !== undefined) {
      const real = this.real?.severityByBusiness?.[business];
      return this.isValidSeveritySlices(real) ? real : null;
    }

    const real = this.firstValidRealEntry(
      this.real?.severityByBusiness,
      this.isValidSeveritySlices,
    );
    return real ?? severityDistribution;
  }

  getConfusionMatrix(business?: string): ConfusionMatrix | null {
    if (business !== undefined) {
      const real = this.real?.confusionMatrixByBusiness?.[business];
      return this.isValidConfusionMatrix(real) ? real : null;
    }

    const real = this.real?.confusionMatrixByBusiness?.["jewelry"];
    if (this.isValidConfusionMatrix(real)) {
      return real;
    }
    return confusionMatrix;
  }

  getWordFrequencies(business?: string): WordFrequency[] | null {
    if (business !== undefined) {
      const real = this.real?.wordFrequenciesByBusiness?.[business];
      return this.isValidWordFrequencies(real) ? real : null;
    }

    const real = this.firstValidRealEntry(
      this.real?.wordFrequenciesByBusiness,
      this.isValidWordFrequencies,
    );
    return real ?? wordFrequencies;
  }

  getPeopleByBusiness(): BusinessPeopleCount[] {
    const real = this.real?.peopleByBusiness;
    if (!real || typeof real !== "object") {
      return peopleByBusiness;
    }

    // Base off the mock array (preserves shape/order) and override just the
    // rows whose canonical business key has a valid real value.
    return peopleByBusiness.map((row) => {
      const canonical = businesses.find((b) => b.name === row.business);
      if (!canonical) {
        return row;
      }

      const realPeople = (real as Record<string, unknown>)[canonical.key];
      if (typeof realPeople === "number" && Number.isFinite(realPeople)) {
        return { business: row.business, people: realPeople };
      }

      return row;
    });
  }

  // Iterates canonical business keys (preferring the real `businesses` array
  // when valid, else the mock one) and returns the first dict value that
  // passes `validator`, or null if none do. Used to pick a sensible default
  // business for the fields that used to be flat top-level values before
  // schema_version 2 (kpis, anomalyType, severity, wordFrequencies).
  private firstValidRealEntry<T>(
    dict: Record<string, unknown> | undefined,
    validator: (x: unknown) => x is T,
  ): T | null {
    if (!dict) {
      return null;
    }

    const realBusinesses = this.real?.businesses;
    const canonicalBusinesses = this.isValidBusinesses(realBusinesses)
      ? realBusinesses
      : businesses;

    for (const b of canonicalBusinesses) {
      const candidate = dict[b.key];
      if (validator(candidate)) {
        return candidate;
      }
    }

    return null;
  }

  // -----------------------------
  // Validators — pragmatic runtime shape checks, not a full schema library.
  // Each one is deliberately conservative: anything not clearly matching the
  // expected shape is treated as invalid and triggers the mock fallback.
  // -----------------------------

  private isValidKpis(x: unknown): x is Kpis {
    if (!x || typeof x !== "object") return false;
    const k = x as Record<string, unknown>;
    return (
      typeof k.totalEvents === "number" &&
      typeof k.criminalEvents === "number" &&
      typeof k.avgAnomalyScore === "number" &&
      typeof k.activeBusinesses === "number" &&
      typeof k.alertsToday === "number"
    );
  }

  private isValidBusinesses(x: unknown): x is Business[] {
    return (
      Array.isArray(x) &&
      x.length > 0 &&
      x.every(
        (b) =>
          b &&
          typeof b === "object" &&
          typeof (b as Record<string, unknown>).key === "string" &&
          typeof (b as Record<string, unknown>).name === "string",
      )
    );
  }

  private isValidAnomalyTimePoints(x: unknown): x is AnomalyTimePoint[] {
    return (
      Array.isArray(x) &&
      x.length > 0 &&
      x.every((p) => {
        if (!p || typeof p !== "object") return false;
        const point = p as Record<string, unknown>;
        return (
          typeof point.time === "string" &&
          typeof point.normal === "number" &&
          typeof point.suspicious === "number" &&
          typeof point.criminal === "number"
        );
      })
    );
  }

  private isValidAnomalyTypeCounts(x: unknown): x is AnomalyTypeCount[] {
    return (
      Array.isArray(x) &&
      x.length > 0 &&
      x.every((t) => {
        if (!t || typeof t !== "object") return false;
        const item = t as Record<string, unknown>;
        return typeof item.type === "string" && typeof item.count === "number";
      })
    );
  }

  private isValidSeveritySlices(x: unknown): x is SeveritySlice[] {
    const validNames = new Set(["Normal", "Suspicious", "Criminal"]);
    return (
      Array.isArray(x) &&
      x.length === 3 &&
      x.every((s) => {
        if (!s || typeof s !== "object") return false;
        const slice = s as Record<string, unknown>;
        return (
          typeof slice.name === "string" &&
          validNames.has(slice.name) &&
          typeof slice.value === "number"
        );
      })
    );
  }

  private isValidConfusionMatrix(x: unknown): x is ConfusionMatrix {
    return (
      Array.isArray(x) &&
      x.length === 3 &&
      x.every(
        (row) =>
          Array.isArray(row) &&
          row.length === 3 &&
          row.every((cell) => typeof cell === "number"),
      )
    );
  }

  private isValidWordFrequencies(x: unknown): x is WordFrequency[] {
    return (
      Array.isArray(x) &&
      x.length > 0 &&
      x.every((w) => {
        if (!w || typeof w !== "object") return false;
        const item = w as Record<string, unknown>;
        return typeof item.text === "string" && typeof item.value === "number";
      })
    );
  }
}
