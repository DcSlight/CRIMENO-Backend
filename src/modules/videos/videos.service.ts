import { Injectable } from "@nestjs/common";
import * as fs from "fs";
import * as path from "path";

export type VideoOptionDto = {
  label: string;
  src: string;
};

@Injectable()
export class VideosService {
  // Allowed video extensions
  private readonly allowedExt = new Set([".mp4", ".webm", ".ogg", ".mov", ".m4v"]);

  getVideoOptions(): VideoOptionDto[] {
    const videosDir = this.getVideosDirAbsolutePath();

    if (!fs.existsSync(videosDir)) {
      // If the folder doesn't exist, return an empty list (keeps API stable)
      return [];
    }

    const files = fs
      .readdirSync(videosDir, { withFileTypes: true })
      .filter((d) => d.isFile())
      .map((d) => d.name)
      .filter((name) => this.allowedExt.has(path.extname(name).toLowerCase()))
      .sort((a, b) => a.localeCompare(b));

    return files.map((fileName) => ({
      label: this.toNiceLabel(fileName),
      src: `/videos/${encodeURIComponent(fileName)}`,
    }));
  }

  private getVideosDirAbsolutePath(): string {
    // From: CRIMENO-Backend/dist/... or CRIMENO-Backend/src/...
    // Go up to CRIMENO-Backend, then to sibling CRIMENO-Client/public/videos
    return path.resolve(process.cwd(), "..", "CRIMENO-Client", "public", "videos");
  }

  private toNiceLabel(fileName: string): string {
    const base = fileName.replace(path.extname(fileName), "");
    const spaced = base.replace(/[_-]+/g, " ").trim();
    return spaced.length ? this.capitalizeWords(spaced) : fileName;
  }

  private capitalizeWords(text: string): string {
    return text
      .split(/\s+/)
      .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
      .join(" ");
  }

  handleSelection(selection: { label: string; src: string }) {
    console.log("[VIDEO_SELECTED]", selection);
  }
}
