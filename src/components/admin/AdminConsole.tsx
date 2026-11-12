"use client";
import { useCallback, useEffect, useState } from "react";
import { Settings, Layers, FileText, FolderKanban, ImageIcon, BarChart3, Trash2, Upload, Save, Plus } from "lucide-react";

type Tab = "analytics" | "settings" | "sections" | "pages" | "projects" | "media";

interface AnalyticsData { totalViews: number; uniqueVisitors14d: number; totalUsers: number; totalTasks: number; topPages: Array<{ path: string; views: number }>; dailyTraffic: Array<{ date: string; views: number }>; }
interface SiteSettingsData { siteName: string; tagline: string; heroTitle: string; heroSubtitle: string; heroCtaText: string; accentColor: string; secondaryColor: string; footerText: string; maintenanceMode: boolean; }
interface SectionItem { id: string; key: string; badge: string | null; title: string; subtitle: string; content: string; imageUrl: string | null; sortOrder: number; published: boolean; }
interface PageItem { id: string; slug: string; title: string; summary: string; content: string; heroImage: string | null; published: boolean; }
interface ProjectItem { id: string; title: string; category: string; description: string; imageUrl: string | null; linkUrl: string | null; featured: boolean; sortOrder: number; }
interface MediaItem { id: string; url: string; originalName: string; }

export function AdminConsole() {
  const [tab, setTab] = useState<Tab>("analytics");
  const [notice, setNotice] = useState("");
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [settings, setSettings] = useState<SiteSettingsData | null>(null);
  const [sections, setSections] = useState<SectionItem[]>([]);
  const [pages, setPages] = useState<PageItem[]>([]);
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [media, setMedia] = useState<MediaItem[]>([]);

  const [newSection, setNewSection] = useState({ key: "", badge: "", title: "", subtitle: "", content: "", imageUrl: "", sortOrder: 0, published: true });
  const [newPage, setNewPage] = useState({ slug: "", title: "", summary: "", content: "", heroImage: "", published: true });
  const [newProject, setNewProject] = useState({ title: "", category: "", description: "", imageUrl: "", linkUrl: "", featured: true, sortOrder: 0 });

  const flash = (msg: string) => { setNotice(msg); setTimeout(() => setNotice(""), 3000); };

  const loadAll = useCallback(async () => {
    const [an, st, sc, pg, pr, md] = await Promise.all([
      fetch("/api/admin/analytics").then((r) => r.json()),
      fetch("/api/admin/settings").then((r) => r.json()),
      fetch("/api/admin/sections").then((r) => r.json()),
      fetch("/api/admin/pages").then((r) => r.json()),
      fetch("/api/admin/projects").then((r) => r.json()),
      fetch("/api/admin/upload").then((r) => r.json()),
    ]);
    setAnalytics(an); setSettings(st.settings); setSections(sc.sections || []); setPages(pg.pages || []); setProjects(pr.projects || []); setMedia(md.media || []);
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  async function saveSettings(e: React.FormEvent) {
    e.preventDefault();
    if (!settings) return;
    const res = await fetch("/api/admin/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(settings) });
    if (res.ok) flash("Website settings updated.");
  }

  async function createSection(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/sections", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...newSection, imageUrl: newSection.imageUrl || null }) });
    if (res.ok) { setNewSection({ key: "", badge: "", title: "", subtitle: "", content: "", imageUrl: "", sortOrder: 0, published: true }); flash("Section created."); loadAll(); }
  }

  async function updateSection(sec: SectionItem) {
    const res = await fetch("/api/admin/sections", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(sec) });
    if (res.ok) flash("Section saved.");
  }

  async function deleteSection(id: string) {
    await fetch(`/api/admin/sections?id=${id}`, { method: "DELETE" });
    flash("Section deleted."); loadAll();
  }

  async function createPage(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/pages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...newPage, heroImage: newPage.heroImage || null }) });
    if (res.ok) { setNewPage({ slug: "", title: "", summary: "", content: "", heroImage: "", published: true }); flash("Page published."); loadAll(); }
  }

  async function updatePage(pg: PageItem) {
    const res = await fetch("/api/admin/pages", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(pg) });
    if (res.ok) flash("Page updated.");
  }

  async function deletePage(id: string) {
    await fetch(`/api/admin/pages?id=${id}`, { method: "DELETE" });
    flash("Page removed."); loadAll();
  }

  async function createProject(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/projects", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...newProject, imageUrl: newProject.imageUrl || null, linkUrl: newProject.linkUrl || null }) });
    if (res.ok) { setNewProject({ title: "", category: "", description: "", imageUrl: "", linkUrl: "", featured: true, sortOrder: 0 }); flash("Project added."); loadAll(); }
  }

  async function deleteProject(id: string) {
    await fetch(`/api/admin/projects?id=${id}`, { method: "DELETE" });
    flash("Project deleted."); loadAll();
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData(); fd.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    if (res.ok) { flash("Image uploaded."); loadAll(); }
  }

  async function deleteMedia(id: string) {
    await fetch(`/api/admin/upload?id=${id}`, { method: "DELETE" });
    flash("Image deleted."); loadAll();
  }

  const tabs: Array<{ id: Tab; label: string; Icon: React.ComponentType<{ className?: string }> }> = [
    { id: "analytics", label: "Visitor Stats", Icon: BarChart3 },
    { id: "settings", label: "Site Settings", Icon: Settings },
    { id: "sections", label: "Sections", Icon: Layers },
    { id: "pages", label: "Pages", Icon: FileText },
    { id: "projects", label: "Projects", Icon: FolderKanban },
    { id: "media", label: "Images", Icon: ImageIcon },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-[11px] uppercase tracking-widest text-purple-300">Owner-Only Control Plane</span>
          <h1 className="text-3xl font-bold text-white">Vespera Admin Console</h1>
        </div>
        {notice && <div className="px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-xs text-emerald-200">{notice}</div>}
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map(({ id, label, Icon }) => (
          <button key={id} onClick={() => setTab(id)} className={`px-4 py-2.5 rounded-xl text-xs font-medium inline-flex items-center gap-2 transition cursor-pointer ${tab === id ? "glow-btn text-white" : "liquid-glass text-slate-300 hover:text-white"}`}>
            <Icon className="w-4 h-4" />{label}
          </button>
        ))}
      </div>

      {tab === "analytics" && analytics && (
        <div className="space-y-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[{ label: "Total Page Views", value: analytics.totalViews }, { label: "Unique Visitors (14d)", value: analytics.uniqueVisitors14d }, { label: "Registered Users", value: analytics.totalUsers }, { label: "Total Tasks", value: analytics.totalTasks }].map((k) => (
              <div key={k.label} className="liquid-glass rounded-2xl p-5"><p className="text-xs text-slate-400">{k.label}</p><p className="text-3xl font-bold text-white mt-1">{k.value}</p></div>
            ))}
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="liquid-glass rounded-2xl p-6 space-y-3">
              <h3 className="font-semibold text-white text-sm">Top Visited Pages (14d)</h3>
              {analytics.topPages?.map((p) => <div key={p.path} className="flex justify-between text-xs py-2 border-b border-white/5"><span className="text-sky-300 font-mono">{p.path}</span><span className="text-white font-semibold">{p.views} views</span></div>)}
            </div>
            <div className="liquid-glass rounded-2xl p-6 space-y-3">
              <h3 className="font-semibold text-white text-sm">Daily Traffic</h3>
              {analytics.dailyTraffic?.map((d) => <div key={d.date} className="flex justify-between text-xs py-2 border-b border-white/5"><span className="text-slate-300 font-mono">{d.date}</span><span className="text-purple-300 font-semibold">{d.views} views</span></div>)}
            </div>
          </div>
        </div>
      )}

      {tab === "settings" && settings && (
        <form onSubmit={saveSettings} className="liquid-glass rounded-3xl p-6 space-y-4">
          <h2 className="font-semibold text-white">Global Brand & Hero Content</h2>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <label className="space-y-1 text-xs text-slate-400">Site Name<input value={settings.siteName} onChange={(e) => setSettings({ ...settings, siteName: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white" /></label>
            <label className="space-y-1 text-xs text-slate-400">Tagline<input value={settings.tagline} onChange={(e) => setSettings({ ...settings, tagline: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white" /></label>
            <label className="sm:col-span-2 space-y-1 text-xs text-slate-400">Hero Headline<input value={settings.heroTitle} onChange={(e) => setSettings({ ...settings, heroTitle: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white" /></label>
            <label className="sm:col-span-2 space-y-1 text-xs text-slate-400">Hero Subtitle<textarea rows={3} value={settings.heroSubtitle} onChange={(e) => setSettings({ ...settings, heroSubtitle: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white" /></label>
            <label className="space-y-1 text-xs text-slate-400">Primary CTA<input value={settings.heroCtaText} onChange={(e) => setSettings({ ...settings, heroCtaText: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white" /></label>
            <label className="space-y-1 text-xs text-slate-400">Footer Text<input value={settings.footerText} onChange={(e) => setSettings({ ...settings, footerText: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white" /></label>
          </div>
          <button className="glow-btn px-5 py-2.5 rounded-xl text-xs font-medium text-white inline-flex items-center gap-2 cursor-pointer"><Save className="w-4 h-4" /> Save Settings</button>
        </form>
      )}

      {tab === "sections" && (
        <div className="space-y-6">
          <form onSubmit={createSection} className="liquid-glass rounded-3xl p-6 grid sm:grid-cols-2 gap-3">
            <h3 className="sm:col-span-2 font-semibold text-white text-sm flex items-center gap-2"><Plus className="w-4 h-4 text-sky-400" /> Add Section</h3>
            <input required placeholder="Key (e.g. focus-mode)" value={newSection.key} onChange={(e) => setNewSection({ ...newSection, key: e.target.value })} className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white" />
            <input placeholder="Badge" value={newSection.badge} onChange={(e) => setNewSection({ ...newSection, badge: e.target.value })} className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white" />
            <input required placeholder="Title" value={newSection.title} onChange={(e) => setNewSection({ ...newSection, title: e.target.value })} className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white" />
            <input placeholder="Image URL" value={newSection.imageUrl} onChange={(e) => setNewSection({ ...newSection, imageUrl: e.target.value })} className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white" />
            <textarea required placeholder="Content" value={newSection.content} onChange={(e) => setNewSection({ ...newSection, content: e.target.value })} className="sm:col-span-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white" />
            <button className="sm:col-span-2 justify-self-start glow-btn px-4 py-2 rounded-xl text-xs text-white">Create Section</button>
          </form>
          {sections.map((sec) => (
            <div key={sec.id} className="liquid-glass rounded-2xl p-5 space-y-3">
              <div className="grid sm:grid-cols-2 gap-3">
                <input value={sec.title} onChange={(e) => setSections(sections.map((s) => (s.id === sec.id ? { ...s, title: e.target.value } : s)))} className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white" />
                <input value={sec.imageUrl || ""} placeholder="Image URL" onChange={(e) => setSections(sections.map((s) => (s.id === sec.id ? { ...s, imageUrl: e.target.value } : s)))} className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white" />
                <textarea value={sec.content} onChange={(e) => setSections(sections.map((s) => (s.id === sec.id ? { ...s, content: e.target.value } : s)))} className="sm:col-span-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-200" />
              </div>
              <div className="flex gap-2">
                <button onClick={() => updateSection(sec)} className="px-3 py-1.5 rounded-lg bg-sky-500/20 text-sky-300 text-xs">Save</button>
                <button onClick={() => deleteSection(sec.id)} className="px-3 py-1.5 rounded-lg bg-rose-500/20 text-rose-300 text-xs">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "pages" && (
        <div className="space-y-6">
          <form onSubmit={createPage} className="liquid-glass rounded-3xl p-6 grid sm:grid-cols-2 gap-3">
            <h3 className="sm:col-span-2 font-semibold text-white text-sm">Create Custom Page</h3>
            <input required placeholder="slug (e.g. pricing)" value={newPage.slug} onChange={(e) => setNewPage({ ...newPage, slug: e.target.value })} className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white" />
            <input required placeholder="Title" value={newPage.title} onChange={(e) => setNewPage({ ...newPage, title: e.target.value })} className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white" />
            <input placeholder="Summary" value={newPage.summary} onChange={(e) => setNewPage({ ...newPage, summary: e.target.value })} className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white" />
            <input placeholder="Hero Image URL" value={newPage.heroImage} onChange={(e) => setNewPage({ ...newPage, heroImage: e.target.value })} className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white" />
            <textarea required rows={4} placeholder="Page body" value={newPage.content} onChange={(e) => setNewPage({ ...newPage, content: e.target.value })} className="sm:col-span-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white" />
            <button className="sm:col-span-2 justify-self-start glow-btn px-4 py-2 rounded-xl text-xs text-white">Publish Page</button>
          </form>
          {pages.map((pg) => (
            <div key={pg.id} className="liquid-glass rounded-2xl p-5 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-mono text-sky-300">/{pg.slug}</span>
                <div className="flex gap-2">
                  <button onClick={() => updatePage(pg)} className="px-3 py-1 rounded-lg bg-sky-500/20 text-sky-300 text-xs">Save</button>
                  <button onClick={() => deletePage(pg.id)} className="px-3 py-1 rounded-lg bg-rose-500/20 text-rose-300 text-xs">Delete</button>
                </div>
              </div>
              <input value={pg.title} onChange={(e) => setPages(pages.map((p) => (p.id === pg.id ? { ...p, title: e.target.value } : p)))} className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white" />
              <textarea rows={3} value={pg.content} onChange={(e) => setPages(pages.map((p) => (p.id === pg.id ? { ...p, content: e.target.value } : p)))} className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-200" />
            </div>
          ))}
        </div>
      )}

      {tab === "projects" && (
        <div className="space-y-6">
          <form onSubmit={createProject} className="liquid-glass rounded-3xl p-6 grid sm:grid-cols-2 gap-3">
            <h3 className="sm:col-span-2 font-semibold text-white text-sm">Add Showcase Module</h3>
            <input required placeholder="Title" value={newProject.title} onChange={(e) => setNewProject({ ...newProject, title: e.target.value })} className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white" />
            <input required placeholder="Category" value={newProject.category} onChange={(e) => setNewProject({ ...newProject, category: e.target.value })} className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white" />
            <input placeholder="Image URL" value={newProject.imageUrl} onChange={(e) => setNewProject({ ...newProject, imageUrl: e.target.value })} className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white" />
            <input placeholder="External Link" value={newProject.linkUrl} onChange={(e) => setNewProject({ ...newProject, linkUrl: e.target.value })} className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white" />
            <textarea required placeholder="Description" value={newProject.description} onChange={(e) => setNewProject({ ...newProject, description: e.target.value })} className="sm:col-span-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-white" />
            <button className="sm:col-span-2 justify-self-start glow-btn px-4 py-2 rounded-xl text-xs text-white">Add Project</button>
          </form>
          <div className="grid md:grid-cols-3 gap-4">
            {projects.map((p) => (
              <div key={p.id} className="liquid-glass rounded-2xl p-4 space-y-2">
                <span className="text-[11px] text-purple-300">{p.category}</span>
                <h4 className="font-semibold text-white text-sm">{p.title}</h4>
                <p className="text-xs text-slate-300">{p.description}</p>
                <button onClick={() => deleteProject(p.id)} className="text-xs text-rose-400 hover:underline">Delete</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "media" && (
        <div className="space-y-6">
          <label className="liquid-glass rounded-3xl p-8 flex flex-col items-center justify-center gap-3 border-dashed border-2 border-sky-400/30 cursor-pointer hover:bg-white/5 transition">
            <Upload className="w-8 h-8 text-sky-400" />
            <span className="text-sm font-medium text-white">Click to Upload Image (PNG, JPG, WebP, SVG — max 5MB)</span>
            <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
          </label>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            {media.map((m) => (
              <div key={m.id} className="liquid-glass rounded-2xl p-3 space-y-2">
                <img src={m.url} alt={m.originalName} className="w-full h-36 object-cover rounded-xl" />
                <p className="text-[11px] text-slate-300 truncate">{m.originalName}</p>
                <div className="flex items-center justify-between gap-2">
                  <button onClick={() => { navigator.clipboard.writeText(m.url); flash("Copied URL!"); }} className="text-[11px] text-sky-400 hover:underline">Copy URL</button>
                  <button onClick={() => deleteMedia(m.id)} className="text-rose-400 p-1"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
