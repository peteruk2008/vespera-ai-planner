'use client';
import React, { useState } from 'react';

export default function HomePage() {
  const [goal, setGoal] = useState('');
  const [skillTree, setSkillTree] = useState<any[]>([]);
  const [summaryTitle, setSummaryTitle] = useState('');
  const [loading, setLoading] = useState(false);

  const generateSkillTree = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal.trim()) return;
    setLoading(true);

    setTimeout(() => {
      const length = goal.length;
      let ranks = [];

      if (length > 40) {
        ranks = [
          { rank: "المستوى E (الأساس)", desc: "تفكيك الهدف الكبير وتجهيز البيئة المحيطة." },
          { rank: "المستوى D (البداية)", desc: "جمع الموارد الأساسية وبدء التنفيذ الفعلي." },
          { rank: "المستوى C (التطوير)", desc: "تجاوز أول عقبة وتثبيت روتين العمل." },
          { rank: "المستوى B (العمق)", desc: "مرحلة الاحتراف الجزئي والضغط الفكري." },
          { rank: "المستوى A (التقدم)", desc: "إنجاز الجزء الأكبر والوصول لمرحلة الخطر." },
          { rank: "المستوى S (الأسطوري)", desc: "اللمسات النهائية، الإطلاق، والتفوق التام." }
        ];
      } else if (length > 20) {
        ranks = [
          { rank: "المستوى E (الأساس)", desc: "تحديد معالم المهمة بوضوح." },
          { rank: "المستوى C (المتوسط)", desc: "التنفيذ والتركيز عالي المستوى." },
          { rank: "المستوى A (المتقدم)", desc: "المراجعة والتصحيح الفوري." },
          { rank: "المستوى S (الاحتراف)", desc: "التسليم بجودة فائقة." }
        ];
      } else {
        ranks = [
          { rank: "المستوى E (السريع)", desc: "البدء الفوري في المهمة البسيطة." },
          { rank: "المستوى D (الإنجاز)", desc: "الإنهاء السريع والتحقيق بنجاح." }
        ];
      }

      setSummaryTitle(`شبكة هدف: "${goal}"`);
      setSkillTree(ranks);
      setLoading(false);
    }, 400);
  };

  return (
    <main style={{ minHeight: '100vh', background: '#030712', color: '#f3f4f6', padding: '40px 20px', fontFamily: 'sans-serif', direction: 'rtl' }}>
      <div style={{ maxWidth: '750px', margin: '0 auto' }}>
        
        {/* الهيدر الجديد كلياً */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <span style={{ background: '#1e3a8a', color: '#60a5fa', padding: '6px 16px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold' }}>
            ⚡ Vespera Skill Tree Engine
          </span>
          <h1 style={{ fontSize: '2.5rem', marginTop: '15px', color: '#fff', fontWeight: '800' }}>مخطط شبكة المهام الذهنية</h1>
          <p style={{ color: '#9ca3af', marginTop: '8px' }}>نظام محلي متكامل لتحويل أي هدف إلى مهارات متدرجة من المستوى E إلى S تلقائياً.</p>
        </div>

        {/* صندوق الإدخال */}
        <form onSubmit={generateSkillTree} style={{ background: '#111827', padding: '25px', borderRadius: '16px', border: '1px solid #1f2937', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)' }}>
          <label style={{ display: 'block', marginBottom: '10px', fontWeight: '600', color: '#e5e7eb' }}>ما هو الهدف أو المشروع الذي تريد تفكيكه؟</label>
          <input 
            type="text" 
            value={goal} 
            onChange={(e) => setGoal(e.target.value)} 
            placeholder="مثال: تعلم برمجة تطبيقات الويب من الصفر..."
            style={{ width: '100%', padding: '14px 16px', borderRadius: '10px', background: '#1f2937', border: '1px solid #374151', color: '#fff', fontSize: '1rem', outline: 'none', marginBottom: '20px' }}
          />
          <button 
            type="submit" 
            style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', color: '#fff', border: 'none', borderRadius: '10px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' }}>
            {loading ? 'جاري بناء الشبكة...' : 'توليد شبكة المهارات (Skill Tree) 🚀'}
          </button>
        </form>

        {/* عرض النتائج */}
        {skillTree.length > 0 && (
          <div style={{ marginTop: '35px', animation: 'fadeIn 0.5s ease-in-out' }}>
            <h2 style={{ fontSize: '1.4rem', color: '#60a5fa', marginBottom: '20px', borderRight: '4px solid #3b82f6', paddingRight: '12px' }}>
              {summaryTitle}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {skillTree.map((item, index) => (
                <div key={index} style={{ background: '#111827', padding: '18px 22px', borderRadius: '12px', border: '1px solid #1f2937', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span style={{ color: '#38bdf8', fontSize: '0.9rem', fontWeight: 'bold' }}>{item.rank}</span>
                  <p style={{ margin: 0, color: '#d1d5db', fontSize: '1rem', lineHeight: '1.5' }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
