import { Controller, Get, Query } from "@nestjs/common";
import { ApiQuery, ApiTags } from "@nestjs/swagger";
import { AnalyticsService } from "./analytics.service";
import type {
  AnomalyTimePoint,
  AnomalyTypeCount,
  Business,
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

  @Get("businesses")
  getBusinesses(): Business[] {
    return this.analyticsService.getBusinesses();
  }

  @Get("anomaly-trend")
  @ApiQuery({
    name: "business",
    required: false,
    description: "Business key to scope the seconds-timeline to (defaults to the first business)",
  })
  getAnomalyTrend(@Query("business") business?: string): AnomalyTimePoint[] {
    return this.analyticsService.getAnomalyTrend(business);
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
