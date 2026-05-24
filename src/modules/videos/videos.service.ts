import { BadRequestException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as fs from "fs";
import * as path from "path";
import { BroadcasterService } from "../broadcaster/broadcaster.service";
import { BusinessesService } from "../businesses/businesses.service";
import { Business } from "../../database/entities";
import { GroqContextService } from "../groq/groq-context.service";

export type VideoOptionDto = {
  label: string;
  src: string;
};

@Injectable()
export class VideosService {
  constructor(
    private readonly config: ConfigService,
    private readonly broadcaster: BroadcasterService,
    private readonly businessesService: BusinessesService,
    private readonly groqContextService: GroqContextService,
  ) {}

  private readonly allowedExt = new Set([
    ".mp4",
    ".webm",
    ".ogg",
    ".mov",
    ".m4v",
  ]);

  // -----------------------------
  // POST /videos/select
  // -----------------------------
  async selectVideo(
    src: string,
    videoType: "local" | "online",
    businessId: number,
    includeContext: boolean,
  ) {
    if (!src || typeof src !== "string") {
      throw new BadRequestException("src is required");
    }

    if (videoType === "local") {
      if (!src.startsWith("/videos/")) {
        throw new BadRequestException("src must start with /videos/");
      }

      const fileName = path.basename(src);
      const ext = path.extname(fileName).toLowerCase();

      if (!this.allowedExt.has(ext)) {
        throw new BadRequestException(`Unsupported video extension: ${ext}`);
      }

      const videoPath = path.join(this.getVideosDirFromEnv(), fileName);

      if (!fs.existsSync(videoPath)) {
        throw new BadRequestException(`Video not found: ${fileName}`);
      }
      console.log(videoPath);
      await this.broadcaster.playVideo(videoPath, "local");
    } else {
      // online video - src is a URL
      console.log(src);
      await this.broadcaster.playVideo(src, "online");
    }

    if (includeContext) {
      const business = await this.businessesService.findBusinessById(businessId);
      const contextText = this.formatBusinessContext(business);
      await this.groqContextService.sendBusinessContext(contextText);
    }
  }

  private formatBusinessContext(business: Business): string {
    const lines: string[] = [];
    lines.push(`Store: ${business.store_name} (${business.store_type})`);
    if (business.description) lines.push(`Description: ${business.description}`);
    if (business.address || business.city) {
      lines.push(`Location: ${[business.address, business.city].filter(Boolean).join(", ")}`);
    }
    const policy = business.business_policy;
    if (policy) {
      lines.push(`Sensitivity: ${policy.sensitivity_level}; scoring: ${policy.scoring_level}; interaction: ${policy.interaction_sensitivity}`);
      if (policy.allowed_behaviors?.length) lines.push(`Allowed behaviors: ${policy.allowed_behaviors.join(", ")}`);
      if (policy.forbidden_behaviors?.length) lines.push(`Forbidden behaviors: ${policy.forbidden_behaviors.join(", ")}`);
    }
    if (business.cameras?.length) {
      lines.push(`Surveillance cameras (${business.cameras.length}) — all video frames analyzed are captured from these cameras:`);
      for (const cam of business.cameras) {
        lines.push(`  - ${cam.camera_name}: ${cam.location_description}`);
      }
    }
    return lines.join("\n");
  }

  // -----------------------------
  // GET /videos
  // -----------------------------
  getVideoOptions(): VideoOptionDto[] {
    const videosDir = this.getVideosDirFromEnv();

    if (!fs.existsSync(videosDir)) {
      return [];
    }

    return fs
      .readdirSync(videosDir, { withFileTypes: true })
      .filter((d) => d.isFile())
      .map((d) => d.name)
      .filter((name) =>
        this.allowedExt.has(path.extname(name).toLowerCase()),
      )
      .sort((a, b) => a.localeCompare(b))
      .map((fileName) => ({
        label: this.toNiceLabel(fileName),
        src: `/videos/${encodeURIComponent(fileName)}`,
      }));
  }

  // -----------------------------
  // Helpers
  // -----------------------------
  private getVideosDirFromEnv(): string {
    const videosDir = this.config.get<string>("VIDEOS_DIR");
    if (!videosDir) {
      throw new Error("[ENV] Missing VIDEOS_DIR");
    }
    return videosDir;
  }

  private toNiceLabel(fileName: string): string {
    const base = fileName.replace(path.extname(fileName), "");
    const spaced = base.replace(/[_-]+/g, " ").trim();
    return spaced
      .split(/\s+/)
      .map((w) => w[0].toUpperCase() + w.slice(1))
      .join(" ");
  }
}
