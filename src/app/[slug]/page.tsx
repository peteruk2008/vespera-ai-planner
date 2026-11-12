import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { GlassCard } from "@/components/ui/GlassCard";

export const dynamic = "force-dynamic";

export default async function CustomCmsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await prisma.customPage.findUnique({ where: { slug } }).catch(() => null);
  if (!page || !page.published) notFound();
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <GlassCard className="p-8 sm:p-12 space-y-6" hover={false}>
        {page.heroImage && <img src={page.heroImage} alt={page.title} className="w-full h-64 object-cover rounded-2xl border border-white/10" />}
        <h1 className="text-3xl sm:text-5xl font-bold text-white">{page.title}</h1>
        {page.summary && <p className="text-lg text-sky-200/90">{page.summary}</p>}
        <div className="text-slate-300 leading-relaxed whitespace-pre-line">{page.content}</div>
      </GlassCard>
    </div>
  );
}
