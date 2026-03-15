// prisma/migrate-segments.ts
// One-time migration: read translationData JSON → create Segment rows
// Usage: npx ts-node --compiler-options '{"module":"commonjs"}' prisma/migrate-segments.ts

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface LegacySegment {
  id: string;
  index: number;
  originalText: string;
  translatedText: string;
  isEdited: boolean;
  isApproved: boolean;
}

async function main() {
  const orders = await prisma.order.findMany({
    where: {
      translationData: { not: null },
    },
    select: {
      id: true,
      tenantId: true,
      translationData: true,
    },
  });

  console.log(`Found ${orders.length} orders with translationData`);

  let migrated = 0;
  let skipped = 0;
  let errors = 0;

  for (const order of orders) {
    // Skip if segments already exist for this order
    const existingCount = await prisma.segment.count({
      where: { orderId: order.id },
    });
    if (existingCount > 0) {
      skipped++;
      continue;
    }

    try {
      const data = JSON.parse(order.translationData!);
      const segments: LegacySegment[] = data.segments || [];

      if (segments.length === 0) {
        skipped++;
        continue;
      }

      await prisma.segment.createMany({
        data: segments.map((seg) => ({
          tenantId: order.tenantId,
          orderId: order.id,
          index: seg.index,
          original: seg.originalText,
          translation: seg.translatedText || null,
          status: seg.isApproved
            ? "confirmed"
            : seg.translatedText
              ? "suggestion"
              : "empty",
          source: seg.isEdited ? "manual" : seg.translatedText ? "deepl" : "manual",
        })),
      });

      migrated++;
      console.log(`  ✓ Order ${order.id}: ${segments.length} segments migrated`);
    } catch (err) {
      errors++;
      console.error(`  ✗ Order ${order.id}: ${err}`);
    }
  }

  console.log(`\nDone: ${migrated} migrated, ${skipped} skipped, ${errors} errors`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
