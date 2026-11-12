import OpenAI from "openai";
import { z } from "zod";

export const AiTaskSchema = z.object({
  title: z.string().min(1).max(120),
  description: z.string().max(400).default(""),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  durationMinutes: z.number().int().min(5).max(720),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  category: z.enum(["WORK", "STUDY", "HEALTH", "PERSONAL", "BREAK", "FREE_TIME"]),
  isBreak: z.boolean(),
});

export const AiScheduleResponseSchema = z.object({ summary: z.string(), coachNote: z.string(), tasks: z.array(AiTaskSchema).min(1) });

function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("AI_NOT_CONFIGURED");
  return new OpenAI({ apiKey, baseURL: process.env.OPENAI_BASE_URL || undefined });
}

export async function generateDailySchedule(params: {
  prompt: string; date: string; wakeTime?: string; sleepTime?: string;
  existingTasks?: Array<{ title: string; startTime: string; endTime: string; priority: string; status: string }>;
}) {
  const client = getOpenAIClient();
  const systemPrompt = `You are Vespera, an elite cognitive productivity architect.
Design a realistic, conflict-free daily schedule for ${params.date}.
Return ONLY valid JSON: { "summary": "...", "coachNote": "...", "tasks": [{ "title": "...", "description": "...", "startTime": "HH:mm", "endTime": "HH:mm", "durationMinutes": 60, "priority": "LOW|MEDIUM|HIGH|CRITICAL", "category": "WORK|STUDY|HEALTH|PERSONAL|BREAK|FREE_TIME", "isBreak": false }] }
Rules: Insert 10-20m breaks after deep focus, include meals/rest, no overlaps, chronological order, active window ${params.wakeTime || "08:00"}-${params.sleepTime || "22:30"}. Match user language (Arabic or English) while keeping enum values English.`;

  const completion = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    temperature: 0.4,
    response_format: { type: "json_object" },
    messages: [{ role: "system", content: systemPrompt }, { role: "user", content: `Date: ${params.date}\nRequest: ${params.prompt}${params.existingTasks?.length ? `\nExisting: ${JSON.stringify(params.existingTasks)}` : ""}` }],
  });
  const raw = completion.choices[0]?.message?.content;
  if (!raw) throw new Error("Empty AI response");
  return AiScheduleResponseSchema.parse(JSON.parse(raw));
}

export async function refineDailySchedule(params: {
  instruction: string; date: string; currentTasks: Array<Record<string, unknown>>; history: Array<{ role: "user" | "assistant"; content: string }>;
}) {
  const client = getOpenAIClient();
  const completion = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    temperature: 0.3,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: `You are Vespera Assistant editing a schedule for ${params.date}. Return ONLY valid JSON: { "reply": "Explanation in user language", "tasks": [...] }. Keep unmentioned tasks intact unless shifting prevents overlaps.` },
      ...params.history.slice(-6),
      { role: "user", content: `Current:\n${JSON.stringify(params.currentTasks)}\n\nEdit: ${params.instruction}` },
    ],
  });
  const raw = completion.choices[0]?.message?.content;
  if (!raw) throw new Error("Empty AI response");
  return z.object({ reply: z.string(), tasks: z.array(AiTaskSchema).min(1) }).parse(JSON.parse(raw));
}
