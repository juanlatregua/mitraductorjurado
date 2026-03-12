import { MetadataRoute } from "next";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://mitraductorjurado.es";

  const staticUrls: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/translators`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/auth/login`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/auth/register`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  // Perfiles de traductores — cargados dinámicamente en runtime
  try {
    const { prisma } = await import("@/lib/prisma");
    const translators = await prisma.translatorProfile.findMany({
      where: { verified: true },
      select: { userId: true, updatedAt: true },
    });

    const translatorUrls = translators.map((t) => ({
      url: `${baseUrl}/translators/${t.userId}`,
      lastModified: t.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

    return [...staticUrls, ...translatorUrls];
  } catch {
    return staticUrls;
  }
}
