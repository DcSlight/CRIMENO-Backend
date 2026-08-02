import { Controller, Get, Query, Res } from "@nestjs/common";
import { ApiQuery, ApiTags } from "@nestjs/swagger";
import type { Response } from "express";
import { AnalyticsService } from "./analytics.service";
import type { Business, BusinessPeopleCount } from "./analytics.types";

@ApiTags("analytics")
@Controller("analytics")
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get("kpis")
  @ApiQuery({
    name: "business",
    required: false,
    description:
      "Business key to scope KPIs to. When provided and no real data exists for that business, returns null instead of falling back to mock.",
  })
  getKpis(@Res() res: Response, @Query("business") business?: string): void {
    const result = this.analyticsService.getKpis(business);
    res.status(200).json(result);
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
  getAnomalyTrend(@Res() res: Response, @Query("business") business?: string): void {
    const result = this.analyticsService.getAnomalyTrend(business);
    res.status(200).json(result);
  }

  @Get("anomaly-type")
  @ApiQuery({
    name: "business",
    required: false,
    description:
      "Business key to scope anomaly type counts to. When provided and no real data exists for that business, returns null instead of falling back to mock.",
  })
  getAnomalyType(@Res() res: Response, @Query("business") business?: string): void {
    const result = this.analyticsService.getAnomalyType(business);
    res.status(200).json(result);
  }

  @Get("severity")
  @ApiQuery({
    name: "business",
    required: false,
    description:
      "Business key to scope severity distribution to. When provided and no real data exists for that business, returns null instead of falling back to mock.",
  })
  getSeverityDistribution(@Res() res: Response, @Query("business") business?: string): void {
    const result = this.analyticsService.getSeverityDistribution(business);
    res.status(200).json(result);
  }

  @Get("confusion-matrix")
  @ApiQuery({
    name: "business",
    required: false,
    description:
      "Business key to scope the confusion matrix to. When provided and no real data exists for that business, returns null instead of falling back to mock.",
  })
  getConfusionMatrix(@Res() res: Response, @Query("business") business?: string): void {
    const result = this.analyticsService.getConfusionMatrix(business);
    res.status(200).json(result);
  }

  @Get("word-frequencies")
  @ApiQuery({
    name: "business",
    required: false,
    description:
      "Business key to scope word frequencies to. When provided and no real data exists for that business, returns null instead of falling back to mock.",
  })
  getWordFrequencies(@Res() res: Response, @Query("business") business?: string): void {
    const result = this.analyticsService.getWordFrequencies(business);
    res.status(200).json(result);
  }

  @Get("people-by-business")
  getPeopleByBusiness(): BusinessPeopleCount[] {
    return this.analyticsService.getPeopleByBusiness();
  }
}
