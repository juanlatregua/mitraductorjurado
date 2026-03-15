// lib/translation-memory.ts
// Translation Memory using pg_trgm similarity on confirmed Segments
// from delivered orders by the same translator.

import { prisma } from "@/lib/prisma";

const TENANT_ID = "default";

export interface MemoryMatch {
  original: string;
  translation: string;
  similarity: number;
  orderId: string;
  segmentId: string;
}

/**
 * Find translation memory matches for a list of source texts.
 * Searches confirmed segments from other delivered orders by the same translator.
 *
 * @param translatorId - The translator's userId
 * @param currentOrderId - Exclude segments from this order
 * @param texts - Source texts to find matches for
 * @param threshold - Minimum similarity (0.7 = 70%)
 * @returns Map of text index → best MemoryMatch
 */
export async function findMemoryMatches(
  translatorId: string,
  currentOrderId: string,
  texts: string[],
  threshold = 0.7,
): Promise<Map<number, MemoryMatch>> {
  if (texts.length === 0) return new Map();

  // Set tenant_id for RLS
  await prisma.$executeRawUnsafe(
    `SELECT set_config('app.tenant_id', '${TENANT_ID}', true)`,
  );

  const results = new Map<number, MemoryMatch>();

  // Process in batches of 20 to avoid query overload
  const batchSize = 20;
  for (let batchStart = 0; batchStart < texts.length; batchStart += batchSize) {
    const batch = texts.slice(batchStart, batchStart + batchSize);

    for (let i = 0; i < batch.length; i++) {
      const textIdx = batchStart + i;
      const text = batch[i];

      // Skip very short texts (< 10 chars) — too noisy for fuzzy matching
      if (text.length < 10) continue;

      // Query: find best matching confirmed segment from delivered orders
      // by this translator, excluding current order
      const matches: MemoryMatch[] = await prisma.$queryRawUnsafe(
        `SELECT
          s."original",
          s."translation",
          s."id" as "segmentId",
          s."orderId",
          similarity(s."original", $1) as similarity
        FROM "Segment" s
        INNER JOIN "Order" o ON o."id" = s."orderId"
        WHERE o."translatorId" = $2
          AND o."status" = 'delivered'
          AND s."orderId" != $3
          AND s."status" = 'confirmed'
          AND s."translation" IS NOT NULL
          AND s."translation" != ''
          AND s."tenantId" = $4
          AND similarity(s."original", $1) >= $5
        ORDER BY similarity(s."original", $1) DESC
        LIMIT 1`,
        text,
        translatorId,
        currentOrderId,
        TENANT_ID,
        threshold,
      );

      if (matches.length > 0) {
        results.set(textIdx, {
          ...matches[0],
          similarity: Number(matches[0].similarity),
        });
      }
    }
  }

  return results;
}

/**
 * Get translation memory stats for an order's segments.
 * Returns counts of identical (1.0), similar (0.7-0.99), and glossary matches.
 */
export async function getMemoryStats(
  translatorId: string,
  currentOrderId: string,
  texts: string[],
  languagePair: string,
): Promise<{
  identicalCount: number;
  similarCount: number;
  glossaryCount: number;
  matches: Array<{ index: number; match: MemoryMatch }>;
}> {
  const matches = await findMemoryMatches(
    translatorId,
    currentOrderId,
    texts,
    0.7,
  );

  let identicalCount = 0;
  let similarCount = 0;
  const matchList: Array<{ index: number; match: MemoryMatch }> = [];

  for (const [idx, match] of Array.from(matches.entries())) {
    if (match.similarity >= 1.0) {
      identicalCount++;
    } else {
      similarCount++;
    }
    matchList.push({ index: idx, match });
  }

  // Count glossary entries for this translator + language pair
  const glossaryCount = await prisma.glossaryEntry.count({
    where: {
      translatorId,
      languagePair,
    },
  });

  return { identicalCount, similarCount, glossaryCount, matches: matchList };
}
