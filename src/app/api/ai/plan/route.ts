import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const prompt = body.prompt || "مهامي اليومية";

    // دالة ذكية لتحديد الصعوبة تلقائياً بناءً على محتوى المهمة
    const getRank = (text: string) => {
      const length = text.length;
      if (length > 50) return "المستوى S (أسطوري/معقد جداً)";
      if (length > 35) return "المستوى A (صعب ومتقدم)";
      if (length > 25) return "المستوى B (متوقع وصعب نسبياً)";
      if (length > 15) return "المستوى C (متوسط التركيز)";
      if (length > 8)  return "المستوى D (سهل وبسيط)";
      return "المستوى E (سهل جداً وفوري)";
    };

    // تقسيم النص المدخل إلى خطوات وتحديد درجاتها تلقائياً
    const dynamicTasks = [
      { time: getRank(prompt), task: `تحليل الهدف الأساسي: ${prompt}` },
      { time: "المستوى D (سهل)", task: "تجهيز الأدوات والمصادر اللازمة للتنفيذ" },
      { time: "المستوى B (صعب)", task: "التنفيذ الفعلي وتجاوز العقبات التقنية" },
      { time: "المستوى S (أسطوري/الاحتراف)", task: "المراجعة النهائية والتسليم بأعلى جودة" }
    ];

    return NextResponse.json({ 
      summary: `شبكة المهام الذهنية للهدف: "${prompt}"`, 
      coachNote: "تم تصنيف درجات الصعوبة (من E لـ S) تلقائياً بنجاح.", 
      tasks: dynamicTasks 
    });

  } catch (err) {
    return NextResponse.json({ error: "Failed to load skill tree." }, { status: 500 });
  }
}
