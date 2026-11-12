import "dotenv/config";
import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || "owner@vespera.ai";
  const adminPassword = process.env.ADMIN_PASSWORD || "ChangeMeImmediately!2026";
  const adminName = process.env.ADMIN_NAME || "Vespera Owner";
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  await prisma.user.upsert({
    where: { email: adminEmail.toLowerCase() },
    update: { role: Role.ADMIN, name: adminName },
    create: { email: adminEmail.toLowerCase(), name: adminName, passwordHash, role: Role.ADMIN },
  });

  await prisma.siteSettings.upsert({ where: { id: "singleton" }, update: {}, create: { id: "singleton" } });

  const sections = [
    { key: "neural-scheduling", badge: "COGNITIVE ENGINE", title: "Natural Language to Structured Time", subtitle: "Zero rigid forms. Just tell Vespera what your day demands.", content: "Describe your studying, gym, calls, and rest in plain language. Vespera estimates realistic durations, inserts recovery breaks, and prioritizes critical outcomes automatically.", sortOrder: 1 },
    { key: "adaptive-chat", badge: "LIVE REFINEMENT", title: "Conversational Schedule Sculpting", subtitle: "Plans change. Vespera adapts in real time.", content: "Running late or low on energy? Ask the embedded Vespera Assistant to move your workout, split a study block, or protect your evening free time.", sortOrder: 2 },
    { key: "rhythm-analytics", badge: "TELEMETRY", title: "Flow-State Analytics & Weekly Cadence", subtitle: "Measure completion momentum without burnout.", content: "Track daily progress percentages, deep-work versus recovery balance, weekly consistency, and multi-day timelines in one tranquil Liquid Glass workspace.", sortOrder: 3 },
  ];
  for (const s of sections) await prisma.siteSection.upsert({ where: { key: s.key }, update: {}, create: s });

  if ((await prisma.projectShowcase.count()) === 0) {
    await prisma.projectShowcase.createMany({
      data: [
        { title: "Vespera Core v2.4", category: "AI Scheduling Kernel", description: "Constraint-solving LLM orchestration balancing deep focus with ultradian rest cycles.", featured: true, sortOrder: 1 },
        { title: "Circadian Flow Matrix", category: "Productivity Telemetry", description: "Real-time completion tracking, weekly momentum charts, and interactive calendar views.", featured: true, sortOrder: 2 },
        { title: "Liquid Glass Interface", category: "Spatial UI System", description: "Refractive glassmorphism panels, WebGL orbital shaders, and GSAP choreography.", featured: true, sortOrder: 3 },
      ],
    });
  }

  await prisma.customPage.upsert({
    where: { slug: "methodology" },
    update: {},
    create: {
      slug: "methodology",
      title: "The Vespera Method",
      summary: "How Vespera blends ultradian biology with artificial intelligence.",
      content: "Human focus peaks in 90-minute ultradian waves followed by 15-20 minute neural recovery windows.\n\nVespera weighs priority levels, clusters deep-focus blocks during peak hours, anchors physical exercise to reset dopamine, and guarantees breathing room before sleep.",
      published: true,
    },
  });
  console.log(`Seed complete. Admin: ${adminEmail}`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
