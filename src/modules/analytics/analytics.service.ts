import { Injectable } from "@nestjs/common";
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

// Replace each getter's data source with a real query once detection_results
// is wired up to a service.
@Injectable()
export class AnalyticsService {
  getKpis(): Kpis {
    return kpis;
  }

  getBusinesses(): Business[] {
    return businesses;
  }

  getAnomalyTrend(business?: string): AnomalyTimePoint[] {
    const key = business ?? businesses[0].key;
    return anomalyTrendByBusiness[key] ?? anomalyTrendByBusiness[businesses[0].key];
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
