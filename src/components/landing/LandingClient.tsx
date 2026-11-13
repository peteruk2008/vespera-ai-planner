'use client';
import React, { useState } from 'react';

export function LandingClient() {
  const [prompt, setPrompt] = useState('');
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/ai/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      setTasks(data.tasks || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#090d16', color: '#fff', padding: '30px', fontFamily: 'sans-serif', direction: 'rtl' }}>
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '10px', color: '#38bdf8' }}>⚡ Vespera Skill Tree</h1>
        <p style={{ color: '#94a3b8', marginBottom: '25px' }}>نظام شبكة المهام الذهنية وتصنيف الصعوبة أوتوماتيكياً (من E إلى S)</p>
        
        <form onSubmit={handleGenerate} style={{ background: '#111827', padding: '20px', borderRadius: '12px', border: '1px solid #1f2937', marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>اكتب هدفك أو مهمتك اليومية:</label>
          <input 
            type="text" 
            value={prompt} 
            onChange={(e) => setPrompt(e.target.value)} 
            placeholder="اكتب مهمتك هنا..."
            style={{ width: '100%', padding: '12px', borderRadius: '8px', background: '#1f2937', border: '1px solid #374151', color: '#fff', marginBottom: '15px', outline: 'none' }}
          />
          <button type="submit" style={{ width: '100%', padding: '12px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
            {loading ? 'جاري التوزيع في الشبكة...' : 'توليد شبكة المهام الذهنية'}
          </button>
        </form>

        {tasks.length > 0 && (
          <div style={{ background: '#111827', padding: '20px', borderRadius: '12px', border: '1px solid #1f2937' }}>
            <h3 style={{ color: '#38bdf8', marginBottom: '15px' }}>مستويات شبكة المهام:</h3>
            {tasks.map((t, index) => (
              <div key={index} style={{ background: '#1f2937', padding: '12px', borderRadius: '8px', marginBottom: '10px', borderRight: '4px solid #3b82f6' }}>
                <span style={{ fontSize: '0.85rem', color: '#38bdf8', fontWeight: 'bold' }}>{t.time}</span>
                <p style={{ margin: '5px 0 0 0', color: '#e2e8f0' }}>{t.task}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
