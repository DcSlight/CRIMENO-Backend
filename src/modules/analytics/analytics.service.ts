import { Injectable } from "@nestjs/common";
import {
  AnomalyTimePoint,
  AnomalyTypeCount,
  BusinessPeopleCount,
  ConfusionMatrix,
  Kpis,
  SeveritySlice,
  WordFrequency,
} from "./analytics.types";
import {
  anomaliesOverTime,
  anomalyByType,
  confusionMatrix,
  kpis,
  peopleByBusiness,
  severityDistribution,
  wordFrequencies,
} from "./analytics.mock";

// Replace each getter's data source with a real query once detection_results
// is wired up to a service.
@Injectable()
export class AnalyticsService {
  getKpis(): Kpis {
    return kpis;
  }

  getAnomalyTrend(): AnomalyTimePoint[] {
    return anomaliesOverTime;
  }

  getAnomalyType(): AnomalyTypeCount[] {
    return anomalyByType;
  }

  getSeverityDistribution(): SeveritySlice[] {
    return severityDistribution;
  }

  getConfusionMatrix(): ConfusionMatrix {
    return confusionMatrix;
  }

  getWordFrequencies(): WordFrequency[] {
    return wordFrequencies;
  }

  getPeopleByBusiness(): BusinessPeopleCount[] {
    return peopleByBusiness;
  }
}
