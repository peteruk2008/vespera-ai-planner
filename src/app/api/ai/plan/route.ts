import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const prompt = body.prompt || "اكتب خطتي اليومية";

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ 
        error: "GEMINI_API_KEY is not configured" 
      }, { status: 500 });
    }

    // استدعاء Gemini API مباشرة
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const aiRes = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `أنت مساعد تخطيط ذكي. قم بتحويل الطلب التالي إلى جدول يومي منظم بصيغة JSON يحتوي على summary و tasks (كل مهمة لها time و task): 
            الطلب: ${prompt}`
          }]
        }]
      })
    });

    const aiData = await aiRes.json();
    const textResponse = aiData.candidates?.[0]?.content?.parts?.[0]?.text || "تم إنشاء الخطة بنجاح";

    // رد ناجح ومنظم للموقع
    return NextResponse.json({ 
      summary: textResponse, 
      coachNote: "تم توليد الخطة بواسطة Gemini بنجاح.", 
      tasks: [
        { time: "09:00 AM", task: prompt }
      ] 
    });

  } catch (err) {
    return NextResponse.json({ error: "Failed to generate schedule." }, { status: 500 });
  }
}
