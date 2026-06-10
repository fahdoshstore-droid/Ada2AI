import { Link } from 'react-router-dom'

export function Landing() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#000A0F', color: '#EEEFEE', direction: 'rtl', fontFamily: "'Cairo', sans-serif" }}>
      {/* ── Navbar ── */}
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 32px',
        borderBottom: '1px solid rgba(0, 220, 200, 0.15)',
        backgroundColor: 'rgba(0, 10, 15, 0.95)',
        backdropFilter: 'blur(12px)',
      }}>
        <h1 style={{ margin: 0, fontSize: '24px', fontFamily: "'Orbitron', sans-serif", fontWeight: 700, color: '#00DCC8', letterSpacing: '-0.02em' }}>Ada2AI</h1>
        <div style={{ display: 'flex', gap: '16px' }}>
          <Link to="/auth" style={{
            padding: '10px 24px',
            background: 'linear-gradient(135deg, #007ABA 0%, #00DCC8 100%)',
            color: '#000A0F',
            textDecoration: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 600,
            fontFamily: "'Cairo', sans-serif",
          }}>
            تسجيل الدخول
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{
        textAlign: 'center',
        padding: '100px 32px 80px',
        background: 'linear-gradient(180deg, #000A0F 0%, #0A1628 100%)',
      }}>
        <h2 style={{ fontSize: '48px', fontWeight: 900, fontFamily: "'Orbitron', sans-serif", color: '#EEEFEE', marginBottom: '16px', letterSpacing: '-0.02em' }}>
          منصة الذكاء الاصطناعي الرياضي
        </h2>
        <p style={{ fontSize: '20px', color: '#6B8099', marginBottom: '32px', maxWidth: '600px', margin: '0 auto 32px', fontFamily: "'Cairo', sans-serif" }}>
          إدارة متقدمة للفرق والأندية الأكاديمية مع تحليلات ذكية وتصنيفات حديثة
        </p>
        <Link to="/auth" style={{
          display: 'inline-block',
          padding: '16px 48px',
          background: 'linear-gradient(135deg, #007ABA 0%, #00DCC8 100%)',
          color: '#000A0F',
          textDecoration: 'none',
          borderRadius: '12px',
          fontSize: '18px',
          fontWeight: 700,
          fontFamily: "'Cairo', sans-serif",
          boxShadow: '0 0 30px rgba(0, 220, 200, 0.3)',
        }}>
          ابدأ الآن
        </Link>
      </section>

      {/* ── Features ── */}
      <section style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '24px',
        padding: '60px 32px',
        maxWidth: '1200px',
        margin: '0 auto',
      }}>
        {[
          { icon: '👥', title: 'إدارة الفريق', desc: 'تنظيم اللاعبين والكوادر الفنية' },
          { icon: '📊', title: 'التحليلات الذكية', desc: 'تقارير أداء متقدمة بالذكاء الاصطناعي' },
          { icon: '🏆', title: 'التصنيفات', desc: 'تصنيفات عادلة وشفافة لجميع اللاعبين' },
          { icon: '🎯', title: 'التكتيكات', desc: 'أدوات تكتيكية متطورة للمدربين' },
        ].map((feature) => (
          <div key={feature.title} style={{
            padding: '24px',
            backgroundColor: '#0D1E35',
            borderRadius: '12px',
            border: '1px solid rgba(0, 220, 200, 0.12)',
            textAlign: 'center',
            transition: 'border-color 0.2s, box-shadow 0.2s',
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>{feature.icon}</div>
            <h3 style={{ fontSize: '20px', fontWeight: 700, fontFamily: "'Orbitron', sans-serif", color: '#00DCC8', marginBottom: '8px' }}>{feature.title}</h3>
            <p style={{ color: '#6B8099', margin: 0, fontFamily: "'Cairo', sans-serif" }}>{feature.desc}</p>
          </div>
        ))}
      </section>
    </div>
  )
}