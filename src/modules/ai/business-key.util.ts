import * as path from 'path';
import { Business } from '../../database/entities';

// Bridges the three identifier spaces that exist for the same store today:
//   - Postgres business id (numeric, e.g. 6)
//   - analytics.json key (string, e.g. "gun_store" — from the CRIMENO-Model
//     aggregator)
//   - CRIMENO-Model log session directory name (string, e.g.
//     "gun_store_robbery" — derived from the video filename by the pipeline)
// There is no mapping table for any of this; it's inferred by convention.
// Everything here is pure and returns null rather than guessing when a
// video or business genuinely doesn't correspond to a known analytics key.

// The one place the filename convention breaks: video files are misspelled
// "jewerly_store_*" while the analytics key is the correctly-spelled
// "jewelry". Every other stem already starts with its analytics key.
const STEM_ALIASES: Record<string, string> = {
  jewerly: 'jewelry',
};

function normalizeKeyCandidate(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[\s-]+/g, '_');
}

function applyAliases(stem: string): string {
  let result = stem;
  for (const [from, to] of Object.entries(STEM_ALIASES)) {
    result = result.replace(from, to);
  }
  return result;
}

// Picks the longest known key that `candidate` starts with (or contains,
// when `mode: 'includes'`), so a more specific key like "gun_store" wins
// over a shorter unrelated one.
function findKeyMatch(
  candidate: string,
  knownKeys: string[],
  mode: 'startsWith' | 'includes',
): string | null {
  const sortedKeys = [...knownKeys].sort((a, b) => b.length - a.length);
  for (const key of sortedKeys) {
    if (
      mode === 'startsWith'
        ? candidate.startsWith(key)
        : candidate.includes(key)
    ) {
      return key;
    }
  }
  return null;
}

// "/videos/gun_store_robbery_b.mp4" -> "gun_store_robbery_b"
export function videoToLogDir(src: string): string {
  const fileName = path.basename(src);
  return fileName.slice(0, fileName.length - path.extname(fileName).length);
}

// "/videos/jewerly_store_short.mp4" + ["jewelry","gun_store","market"] -> "jewelry"
export function videoToAnalyticsKey(
  src: string,
  knownKeys: string[],
): string | null {
  const stem = applyAliases(videoToLogDir(src).toLowerCase());
  return findKeyMatch(stem, knownKeys, 'startsWith');
}

// Used when no video is selected: infers the analytics key for a business
// straight from its DB row, preferring store_type then falling back to
// store_name (e.g. store_type "grocery" tells us nothing, but store_name
// "Downtown Market" does).
export function businessToAnalyticsKey(
  business: Business,
  knownKeys: string[],
): string | null {
  const byType = findKeyMatch(
    normalizeKeyCandidate(business.store_type),
    knownKeys,
    'includes',
  );
  if (byType) return byType;

  return findKeyMatch(
    normalizeKeyCandidate(business.store_name),
    knownKeys,
    'includes',
  );
}

// Resolves a reply to the "which business would you like me to check?" prompt
// back to a business — a 1-based index into the list that was offered, the
// full store name (what the client re-sends when a chip is clicked), or a
// short partial name a person would actually type (e.g. "Rio" for "Rio
// Diamond Gallery"): matched against the store name as a whole, and against
// each of its individual words.
export function matchBusinessFromReply(
  reply: string,
  businesses: Business[],
): Business | undefined {
  const normalized = reply.trim().toLowerCase();
  if (!normalized) return undefined;

  const byNumber = businesses[Number(normalized) - 1];
  if (byNumber) return byNumber;

  return businesses.find((b) => {
    const name = b.store_name.toLowerCase();
    return normalized.includes(name) || name.includes(normalized);
  });
}
