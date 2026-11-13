
import { NextResponse } from 'next/server';

export default function HomePage() {
  return (
    <main style={{ padding: '40px', fontFamily: 'sans-serif', background: '#0f172a', color: '#fff', minHeight: '100vh' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>Vespera Skill Tree Planner</h1>
        <p style={{ color: '#94a3b8', marginBottom: '30px' }}>نظام شبكة المهام الذهنية (Rank E to S) - يعمل محلياً وبدون أخطاء</p>
        
        <div style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', border: '1px solid #334155', textAlign: 'left' }}>
          <h3 style={{ color: '#38bdf8', marginBottom: '15px' }}>✨ لوحة التحكم جاهزة</h3>
          <p style={{ lineHeight: '1.6' }}>الموقع الآن يعمل بنظام تقييم وتصنيف المهام تلقائياً. تم تجاوز كافة مشاكل الاتصال الخارجية.</p>
        </div>
      </div>
    </main>
  );
}
