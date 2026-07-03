import { Controller, Get } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { AnalyticsService } from "./analytics.service";
import type {
  AnomalyTimePoint,
  AnomalyTypeCount,
  BusinessPeopleCount,
  ConfusionMatrix,
  Kpis,
  SeveritySlice,
  WordFrequency,
} from "./analytics.types";

@ApiTags("analytics")
@Controller("analytics")
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get("kpis")
  getKpis(): Kpis {
    return this.analyticsService.getKpis();
  }

  @Get("anomaly-trend")
  getAnomalyTrend(): AnomalyTimePoint[] {
    return this.analyticsService.getAnomalyTrend();
  }

  @Get("anomaly-type")
  getAnomalyType(): AnomalyTypeCount[] {
    return this.analyticsService.getAnomalyType();
  }

  @Get("severity")
  getSeverityDistribution(): SeveritySlice[] {
    return this.analyticsService.getSeverityDistribution();
  }

  @Get("confusion-matrix")
  getConfusionMatrix(): ConfusionMatrix {
    return this.analyticsService.getConfusionMatrix();
  }

  @Get("word-frequencies")
  getWordFrequencies(): WordFrequency[] {
    return this.analyticsService.getWordFrequencies();
  }

  @Get("people-by-business")
  getPeopleByBusiness(): BusinessPeopleCount[] {
    return this.analyticsService.getPeopleByBusiness();
  }
}
