import * as fs from 'fs';
import * as path from 'path';

const MAP_PATH = path.join(process.cwd(), 'mocks', 'demo-map.json');

let cachedMap: Record<string, string> | undefined;

/**
 * mocks/demo-map.json maps a video filename (e.g. "jewelry.mp4") to the
 * demo dataset folder under mocks/<key>/. Add an entry here whenever a
 * video's filename doesn't already match its dataset folder name, or when
 * several videos should share the same dataset.
 */
function loadMap(): Record<string, string> {
  if (cachedMap) return cachedMap;

  if (!fs.existsSync(MAP_PATH)) {
    cachedMap = {};
    return cachedMap;
  }

  const raw = fs.readFileSync(MAP_PATH, 'utf-8');
  cachedMap = JSON.parse(raw) as Record<string, string>;
  return cachedMap;
}

/**
 * Derives the demo dataset key from a video src, e.g. "/videos/Jewelry.mp4" -> "jewelry".
 * Looks up mocks/demo-map.json first (keyed by filename, case-insensitive);
 * falls back to the filename stem if no mapping is found.
 */
export function toDemoKey(src: string): string {
  const fileName = path.basename(src);
  const map = loadMap();
  const mapped = map[fileName.toLowerCase()];
  if (mapped) return mapped;

  const stem = fileName.slice(0, fileName.length - path.extname(fileName).length);
  return stem.toLowerCase();
}
