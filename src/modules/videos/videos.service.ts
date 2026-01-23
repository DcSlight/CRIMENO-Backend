import { BadRequestException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as fs from "fs";
import * as path from "path";
import { BroadcasterService } from "../broadcaster/broadcaster.service";

export type VideoOptionDto = {
  label: string;
  src: string;
};

@Injectable()
export class VideosService {
  constructor(
    private readonly config: ConfigService,
    private readonly broadcaster: BroadcasterService,
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
  async selectVideo(src: string) {
    if (!src || typeof src !== "string") {
      throw new BadRequestException("src is required");
    }

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
    await this.broadcaster.playVideo(videoPath);
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
