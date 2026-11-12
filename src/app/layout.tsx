import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/ui/Navbar";
import { PageTracker } from "@/components/ui/PageTracker";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const sans = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-sans" });
const display = Space_Grotesk({ subsets: ["latin"], variable: "--font-display" });

export async function generateMetadata(): Promise<Metadata> {
  const settings = await prisma.siteSettings.findUnique({ where: { id: "singleton" } }).catch(() => null);
  return {
    title: settings ? `${settings.siteName} — ${settings.tagline}` : "Vespera — AI Smart Daily Planner",
    description: settings?.heroSubtitle || "Intelligent Liquid Glass AI Daily Planning Platform",
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [user, settings, pages] = await Promise.all([
    getSessionUser().catch(() => null),
    prisma.siteSettings.findUnique({ where: { id: "singleton" } }).catch(() => null),
    prisma.customPage.findMany({ where: { published: true }, select: { slug: true, title: true }, take: 4 }).catch(() => []),
  ]);

  return (
    <html lang="en" className={`${sans.variable} ${display.variable}`}>
      <body className="font-sans antialiased selection:bg-sky-400/30 selection:text-white">
        <div className="fixed inset-0 grid-backdrop pointer-events-none -z-10" />
        <PageTracker />
        <Navbar siteName={settings?.siteName || "Vespera"} user={user} customPages={pages} />
        <main className="pt-20">{children}</main>
      </body>
    </html>
  );
}
