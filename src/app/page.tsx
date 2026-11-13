import { redirect } from 'next/navigation';

export default function Home() {
  // إذا كانت الواجهة القديمة ظاهرة، سنقوم بعرض شبكة المهام مباشرة هنا
  return (
    <main style={{ minHeight: '100vh', background: '#090d16', color: '#fff', padding: '30px', fontFamily: 'sans-serif', direction: 'rtl' }}>
      <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', color: '#38bdf8', marginBottom: '15px' }}>⚡ شبكة المهام الذهنية</h1>
        <p style={{ color: '#94a3b8', marginBottom: '30px' }}>تم تفعيل نظام E إلى S بنجاح وتجاوز واجهة الذكاء الاصطناعي القديمة.</p>
        
        <div style={{ background: '#111827', padding: '25px', borderRadius: '12px', border: '1px solid #1f2937', textAlign: 'right' }}>
          <h3 style={{ color: '#38bdf8', marginBottom: '10px' }}>المستويات المتاحة:</h3>
          <p style={{ color: '#e2e8f0', lineHeight: '1.8' }}>
            - المستوى E و D: المهام البسيطة والسريعة.<br />
            - المستوى C و B: المهام المتوسطة والعميقة.<br />
            - المستوى A و S: التحديات الكبرى والاحتراف التام.
          </p>
        </div>
      </div>
    </main>
  );
}
