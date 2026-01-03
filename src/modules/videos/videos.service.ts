import { BadRequestException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { spawn } from "child_process";
import * as fs from "fs";
import * as path from "path";

export type VideoOptionDto = {
  label: string;
  src: string;
};

@Injectable()
export class VideosService {
  constructor(private readonly config: ConfigService) {}

  // Allowed video extensions
  private readonly allowedExt = new Set([".mp4", ".webm", ".ogg", ".mov", ".m4v"]);

  // -----------------------------
  // GET /videos
  // -----------------------------
  getVideoOptions(): VideoOptionDto[] {
    const videosDir = this.getVideosDirFromEnv();

    if (!fs.existsSync(videosDir)) {
      // Keep API stable
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
      // client expects "/videos/<file>"
      src: `/videos/${encodeURIComponent(fileName)}`,
    }));
  }

  // -----------------------------
  // POST /videos/selection
  // -----------------------------
  handleSelection(selection: { label: string; src: string }) {
    if (!selection?.src || typeof selection.src !== "string") {
      throw new BadRequestException("src is required");
    }

    // basic guard: src should look like "/videos/<file>"
    if (!selection.src.startsWith("/videos/")) {
      throw new BadRequestException("src must start with /videos/");
    }

    // only keep the filename (prevents path traversal)
    const fileName = path.basename(selection.src);

    const ext = path.extname(fileName).toLowerCase();
    if (!this.allowedExt.has(ext)) {
      throw new BadRequestException(`Unsupported video extension: ${ext}`);
    }

    this.runPythonBroadcaster(fileName);
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

  private getPythonScriptFromEnv(): string {
    const pythonScript = this.config.get<string>("PYTHON_SCRIPT");
    if (!pythonScript) {
      throw new Error("[ENV] Missing PYTHON_SCRIPT");
    }
    return pythonScript;
  }

  private runPythonBroadcaster(fileName: string) {
    const videosDir = this.getVideosDirFromEnv();
    const pythonScript = this.getPythonScriptFromEnv();

    // env_value + filename (safe on Windows)
    const videoPath = path.join(videosDir, fileName);

    if (!fs.existsSync(videoPath)) {
      throw new BadRequestException(`Video not found: ${fileName}`);
    }

    if (!fs.existsSync(pythonScript)) {
      throw new Error(`[PYTHON] Script not found: ${pythonScript}`);
    }

    console.log("[PYTHON] Running:", pythonScript, videoPath);

    // Windows: use Python Launcher (py) + force Python 3
    const child = spawn("py", ["-3", pythonScript, videoPath]);

    // IMPORTANT: prevent Nest from crashing if spawn fails
    child.on("error", (err) => {
      console.error("[PYTHON] Failed to start:", err.message);
    });

    child.stdout.on("data", (data) => {
      console.log(`[PYTHON STDOUT]: ${data.toString()}`);
    });

    child.stderr.on("data", (data) => {
      console.error(`[PYTHON STDERR]: ${data.toString()}`);
    });

    child.on("close", (code) => {
      console.log(`[PYTHON] Process exited with code ${code}`);
    });
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
}
