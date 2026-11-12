import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { LandingClient } from "@/components/landing/LandingClient";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [user, settings, sections, projects] = await Promise.all([
    getSessionUser().catch(() => null),
    prisma.siteSettings.findUnique({ where: { id: "singleton" } }).catch(() => null),
    prisma.siteSection.findMany({ where: { published: true }, orderBy: { sortOrder: "asc" } }).catch(() => []),
    prisma.projectShowcase.findMany({ where: { featured: true }, orderBy: { sortOrder: "asc" } }).catch(() => []),
  ]);

  const fallback = {
    siteName: "Vespera",
    tagline: "Autonomous Intelligence for Your Daily Architecture",
    heroTitle: "Design Your Day With Liquid Precision",
    heroSubtitle: "Describe your goals in plain language. Vespera builds a balanced, conflict-free schedule.",
    heroCtaText: "Launch AI Planner",
    footerText: "© 2026 Vespera Intelligence Labs.",
  };

  return <LandingClient settings={settings || fallback} sections={sections} projects={projects} isAuthenticated={Boolean(user)} />;
}
