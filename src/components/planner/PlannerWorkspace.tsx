"use client";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, CheckCircle2, Circle, Trash2, ArrowUp, ArrowDown, Plus, Send, Coffee, Edit3, Save, X } from "lucide-react";
import { NeuralLoader } from "@/components/ui/NeuralLoader";

type Priority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
type Category = "WORK" | "STUDY" | "HEALTH" | "PERSONAL" | "BREAK" | "FREE_TIME";
type Status = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "SKIPPED";

interface TaskItem {
  id: string; title: string; description: string; date: string; startTime: string; endTime: string;
  durationMinutes: number; priority: Priority; category: Category; status: Status; isBreak: boolean; sortOrder: number;
}
interface ChatMsg { id: string; role: string; content: string; }

const BADGE: Record<Priority, string> = {
  CRITICAL: "bg-rose-500/20 text-rose-300 border-rose-500/30",
  HIGH: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  MEDIUM: "bg-sky-500/20 text-sky-300 border-sky-500/30",
  LOW: "bg-slate-500/20 text-slate-300 border-slate-500/30",
};

function calcMinutes(start: string, end: string) {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const diff = (eh * 60 + em) - (sh * 60 + sm);
  return Math.max(5, diff > 0 ? diff : 60);
}

export function PlannerWorkspace() {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [prompt, setPrompt] = useState("");
  const [wakeTime, setWakeTime] = useState("08:00");
  const [sleepTime, setSleepTime] = useState("22:30");
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [generating, setGenerating] = useState(false);
  const [refining, setRefining] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Partial<TaskItem>>({});
  const [showAdd, setShowAdd] = useState(false);
  const [newTask, setNewTask] = useState({ title: "", description: "", startTime: "09:00", endTime: "10:00", priority: "MEDIUM" as Priority, category: "WORK" as Category, isBreak: false });

  const loadDay = useCallback(async () => {
    const res = await fetch(`/api/tasks?date=${date}`);
    if (!res.ok) return;
    const data = await res.json();
    setTasks(data.tasks || []);
    setMessages(data.messages || []);
  }, [date]);

  useEffect(() => { loadDay(); }, [loadDay]);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!prompt.trim()) return;
    setGenerating(true); setError("");
    const res = await fetch("/api/ai/plan", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt, date, wakeTime, sleepTime, replaceExisting: true }) });
    const data = await res.json();
    setGenerating(false);
    if (!res.ok) { setError(data.error || "Failed to generate schedule"); return; }
    setTasks(data.tasks); setPrompt(""); loadDay();
  }

  async function handleRefine(e: React.FormEvent) {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setRefining(true); setError("");
    const res = await fetch("/api/ai/refine", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ date, message: chatInput }) });
    const data = await res.json();
    setRefining(false);
    if (!res.ok) { setError(data.error || "Failed to refine schedule"); return; }
    setTasks(data.tasks); setChatInput(""); loadDay();
  }

  async function toggleComplete(task: TaskItem) {
    const status: Status = task.status === "COMPLETED" ? "PENDING" : "COMPLETED";
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status } : t)));
    await fetch(`/api/tasks/${task.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
  }

  async function deleteTask(id: string) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    await fetch(`/api/tasks/${id}`, { method: "DELETE" });
  }

  async function moveTask(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= tasks.length) return;
    const copy = [...tasks];
    const [moved] = copy.splice(index, 1);
    copy.splice(target, 0, moved);
    setTasks(copy);
    await fetch("/api/tasks/reorder", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderedIds: copy.map((t) => t.id) }) });
  }

  async function saveEdit(task: TaskItem) {
    const startTime = editDraft.startTime ?? task.startTime;
    const endTime = editDraft.endTime ?? task.endTime;
    const payload = { ...editDraft, durationMinutes: calcMinutes(startTime, endTime) };
    const res = await fetch(`/api/tasks/${task.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (res.ok) { const { task: updated } = await res.json(); setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t))); setEditingId(null); }
  }

  async function createManualTask(e: React.FormEvent) {
    e.preventDefault();
    const durationMinutes = calcMinutes(newTask.startTime, newTask.endTime);
    const res = await fetch("/api/tasks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...newTask, durationMinutes, date }) });
    if (res.ok) { const { task } = await res.json(); setTasks((prev) => [...prev, task]); setShowAdd(false); setNewTask({ ...newTask, title: "", description: "" }); }
  }

  const actionable = tasks.filter((t) => !t.isBreak);
  const completedCount = actionable.filter((t) => t.status === "COMPLETED").length;
  const pct = actionable.length > 0 ? Math.round((completedCount / actionable.length) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div className="liquid-glass rounded-3xl p-6 sm:p-8 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2"><Sparkles className="w-6 h-6 text-sky-400" /> Vespera AI Daily Planner</h1>
            <p className="text-sm text-slate-400 mt-1">Describe your responsibilities naturally. Vespera orchestrates your entire day.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <label className="flex flex-col gap-1 text-slate-400">Date<input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white" /></label>
            <label className="flex flex-col gap-1 text-slate-400">Start<input type="time" value={wakeTime} onChange={(e) => setWakeTime(e.target.value)} className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white" /></label>
            <label className="flex flex-col gap-1 text-slate-400">End<input type="time" value={sleepTime} onChange={(e) => setSleepTime(e.target.value)} className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white" /></label>
          </div>
        </div>
        <form onSubmit={handleGenerate} className="space-y-3">
          <textarea rows={3} value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder='e.g. "I have 3 hours of studying, gym, and some personal tasks."' className="w-full rounded-2xl bg-slate-950/60 border border-white/15 p-4 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-400" />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {["Plan my day with 3h study, gym, and rest", "خطة يوم متوازنة: 3 ساعات مذاكرة، جيم، ووقت راحة"].map((p) => (
                <button key={p} type="button" onClick={() => setPrompt(p)} className="text-xs px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 cursor-pointer">{p}</button>
              ))}
            </div>
            <button disabled={generating || !prompt.trim()} className="glow-btn px-6 py-3 rounded-2xl font-medium text-sm text-white inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"><Sparkles className="w-4 h-4" />{generating ? "Orchestrating..." : "Generate Smart Schedule"}</button>
          </div>
        </form>
        {error && <div className="p-3.5 rounded-xl bg-rose-500/20 border border-rose-500/30 text-xs text-rose-200">{error}</div>}
      </div>

      {generating && <NeuralLoader />}

      <div className="grid lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-8 space-y-4">
          <div className="liquid-glass rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div>
                <p className="text-xs text-slate-400">Daily Progress</p>
                <p className="text-lg font-bold text-white">{pct}% <span className="text-xs font-normal text-slate-400">({completedCount}/{actionable.length} tasks)</span></p>
              </div>
              <div className="w-36 h-2 rounded-full bg-white/10 overflow-hidden"><div className="h-full bg-gradient-to-r from-sky-400 to-purple-500 transition-all" style={{ width: `${pct}%` }} /></div>
            </div>
            <button onClick={() => setShowAdd(!showAdd)} className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-medium text-white inline-flex items-center gap-1.5 cursor-pointer"><Plus className="w-4 h-4 text-sky-400" /> Add Task</button>
          </div>

          {showAdd && (
            <form onSubmit={createManualTask} className="liquid-glass rounded-2xl p-5 grid sm:grid-cols-2 gap-3">
              <input required placeholder="Task title" value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white" />
              <input placeholder="Description" value={newTask.description} onChange={(e) => setNewTask({ ...newTask, description: e.target.value })} className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white" />
              <div className="flex gap-2">
                <input type="time" value={newTask.startTime} onChange={(e) => setNewTask({ ...newTask, startTime: e.target.value })} className="flex-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white" />
                <input type="time" value={newTask.endTime} onChange={(e) => setNewTask({ ...newTask, endTime: e.target.value })} className="flex-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white" />
              </div>
              <div className="flex gap-2">
                <select value={newTask.priority} onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as Priority })} className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-sm text-white">
                  <option value="LOW">LOW</option><option value="MEDIUM">MEDIUM</option><option value="HIGH">HIGH</option><option value="CRITICAL">CRITICAL</option>
                </select>
                <select value={newTask.category} onChange={(e) => setNewTask({ ...newTask, category: e.target.value as Category })} className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-white/10 text-sm text-white">
                  <option value="WORK">WORK</option><option value="STUDY">STUDY</option><option value="HEALTH">HEALTH</option><option value="PERSONAL">PERSONAL</option><option value="BREAK">BREAK</option><option value="FREE_TIME">FREE_TIME</option>
                </select>
              </div>
              <div className="sm:col-span-2 flex justify-end gap-2">
                <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 text-xs text-slate-400">Cancel</button>
                <button className="glow-btn px-4 py-2 rounded-xl text-xs font-medium text-white">Save Task</button>
              </div>
            </form>
          )}

          {tasks.length === 0 ? (
            <div className="liquid-glass rounded-3xl p-10 text-center text-slate-400 text-sm">No tasks scheduled for {date}. Describe your day above to generate your schedule.</div>
          ) : (
            <AnimatePresence>
              {tasks.map((task, idx) => (
                <motion.div key={task.id} layout initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }} className={`liquid-glass rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${task.isBreak ? "border-emerald-400/20 bg-emerald-950/15" : ""} ${task.status === "COMPLETED" ? "opacity-65" : ""}`}>
                  <div className="flex items-start gap-3.5 flex-1">
                    <button onClick={() => toggleComplete(task)} className="mt-0.5 text-sky-400 cursor-pointer">
                      {task.status === "COMPLETED" ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : task.isBreak ? <Coffee className="w-5 h-5 text-emerald-300" /> : <Circle className="w-5 h-5" />}
                    </button>
                    {editingId === task.id ? (
                      <div className="flex-1 grid sm:grid-cols-2 gap-2">
                        <input value={editDraft.title ?? task.title} onChange={(e) => setEditDraft({ ...editDraft, title: e.target.value })} className="px-3 py-1.5 rounded-lg bg-white/10 text-sm text-white" />
                        <div className="flex gap-2">
                          <input type="time" value={editDraft.startTime ?? task.startTime} onChange={(e) => setEditDraft({ ...editDraft, startTime: e.target.value })} className="px-2 py-1.5 rounded-lg bg-white/10 text-xs text-white" />
                          <input type="time" value={editDraft.endTime ?? task.endTime} onChange={(e) => setEditDraft({ ...editDraft, endTime: e.target.value })} className="px-2 py-1.5 rounded-lg bg-white/10 text-xs text-white" />
                        </div>
                        <input value={editDraft.description ?? task.description} onChange={(e) => setEditDraft({ ...editDraft, description: e.target.value })} className="sm:col-span-2 px-3 py-1.5 rounded-lg bg-white/10 text-xs text-slate-200" />
                      </div>
                    ) : (
                      <div className="space-y-1 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-mono text-sky-300 bg-sky-400/10 px-2 py-0.5 rounded-md">{task.startTime} – {task.endTime}</span>
                          <span className="text-[11px] text-slate-400">{task.durationMinutes}m</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border ${BADGE[task.priority]}`}>{task.priority}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-slate-300">{task.category}</span>
                        </div>
                        <h3 className={`font-semibold text-white ${task.status === "COMPLETED" ? "line-through" : ""}`}>{task.title}</h3>
                        {task.description && <p className="text-xs text-slate-300/85">{task.description}</p>}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 self-end sm:self-center">
                    {editingId === task.id ? (
                      <>
                        <button onClick={() => saveEdit(task)} className="p-2 rounded-lg hover:bg-white/10 text-emerald-400"><Save className="w-4 h-4" /></button>
                        <button onClick={() => setEditingId(null)} className="p-2 rounded-lg hover:bg-white/10 text-slate-400"><X className="w-4 h-4" /></button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => moveTask(idx, -1)} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400"><ArrowUp className="w-4 h-4" /></button>
                        <button onClick={() => moveTask(idx, 1)} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400"><ArrowDown className="w-4 h-4" /></button>
                        <button onClick={() => { setEditingId(task.id); setEditDraft(task); }} className="p-1.5 rounded-lg hover:bg-white/10 text-sky-300"><Edit3 className="w-4 h-4" /></button>
                        <button onClick={() => deleteTask(task.id)} className="p-1.5 rounded-lg hover:bg-white/10 text-rose-400"><Trash2 className="w-4 h-4" /></button>
                      </>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        <div className="lg:col-span-4 liquid-glass rounded-3xl p-5 flex flex-col h-[540px]">
          <div className="pb-3 border-b border-white/10">
            <h2 className="font-semibold text-white text-sm flex items-center gap-2"><Sparkles className="w-4 h-4 text-purple-400" /> Vespera Schedule Assistant</h2>
            <p className="text-xs text-slate-400 mt-0.5">Modify your schedule using natural language.</p>
          </div>
          <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1">
            {messages.length === 0 ? (
              <div className="text-xs text-slate-400 leading-relaxed bg-white/5 rounded-2xl p-4">Ask me to adjust anything: &ldquo;Move my gym session to 7 PM&rdquo; or &ldquo;Add a 15m break after studying.&rdquo;</div>
            ) : (
              messages.map((m) => (
                <div key={m.id} className={`p-3 rounded-2xl text-xs leading-relaxed ${m.role === "user" ? "bg-sky-500/20 border border-sky-400/25 text-sky-100 ml-6" : "bg-white/5 border border-white/10 text-slate-200 mr-6"}`}>{m.content}</div>
              ))
            )}
          </div>
          <form onSubmit={handleRefine} className="pt-3 border-t border-white/10 flex gap-2">
            <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Adjust schedule..." disabled={tasks.length === 0 || refining} className="flex-1 px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-sky-400 disabled:opacity-40" />
            <button disabled={tasks.length === 0 || refining || !chatInput.trim()} className="glow-btn px-3.5 rounded-xl text-white flex items-center justify-center disabled:opacity-40 cursor-pointer"><Send className="w-4 h-4" /></button>
          </form>
        </div>
      </div>
    </div>
  );
}
