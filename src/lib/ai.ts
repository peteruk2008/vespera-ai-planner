import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';

export const AiTaskSchema = z.object({
  title: z.string().min(1).max(120),
  description: z.string().max(400).default(''),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  durationMinutes: z.number().int().min(5).max(720),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  category: z.enum(['WORK', 'STUDY', 'HEALTH', 'PERSONAL', 'BREAK', 'FREE_TIME']),
  isBreak: z.boolean(),
});

export const AiScheduleResponseSchema = z.object({
  summary: z.string(),
  coachNote: z.string(),
  tasks: z.array(AiTaskSchema),
});

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('AI_NOT_CONFIGURED');
  return new GoogleGenAI({ apiKey });
}

export async function generateDailySchedule(params: {
  prompt: string;
  date: string;
  wakeTime?: string;
  sleepTime?: string;
  existingTasks?: Array<{ title: string; startTime: string; endTime: string; priority: string; status: string }>;
}) {
  const ai = getGeminiClient();
  const systemPrompt = `You are Vespera, an elite cognitive productivity architect.
Design a realistic, conflict-free daily schedule for ${params.date}.
Return ONLY valid JSON matching this schema: {"summary": "...", "coachNote": "...", "tasks": [{"title": "...", "description": "...", "startTime": "HH:MM", "endTime": "HH:MM", "durationMinutes": 30, "priority": "MEDIUM", "category": "WORK", "isBreak": false}]}.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `${systemPrompt}\n\nUser Request: ${params.prompt}`,
    config: {
      responseMimeType: 'application/json',
    },
  });

  const raw = response.text;
  if (!raw) throw new Error('Empty AI response');
  return AiScheduleResponseSchema.parse(JSON.parse(raw));
}

export async function refineDailySchedule(params: {
  instruction: string;
  date: string;
  currentTasks: Array<Record<string, unknown>>;
  history: Array<{ role: 'user' | 'assistant'; content: string }>;
}) {
  const ai = getGeminiClient();
  const systemPrompt = `You are Vespera Assistant editing a schedule for ${params.date}. Return ONLY valid JSON matching: {"reply": "...", "tasks": [...]}.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `${systemPrompt}\n\nCurrent Tasks: ${JSON.stringify(params.currentTasks)}\nEdit Instruction: ${params.instruction}`,
    config: {
      responseMimeType: 'application/json',
    },
  });

  const raw = response.text;
  if (!raw) throw new Error('Empty AI response');
  return z.object({ reply: z.string(), tasks: z.array(AiTaskSchema).min(1) }).parse(JSON.parse(raw));
}
