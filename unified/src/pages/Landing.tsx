import { Link } from 'react-router-dom'

export function Landing() {
  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', direction: 'rtl' }}>
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 32px',
        borderBottom: '1px solid #e5e7eb',
        backgroundColor: '#fff',
      }}>
        <h1 style={{ margin: 0, fontSize: '24px', color: '#1e40af' }}>Ada2AI</h1>
        <div style={{ display: 'flex', gap: '16px' }}>
          <Link to="/auth" style={{
            padding: '10px 20px',
            backgroundColor: '#1e40af',
            color: '#fff',
            textDecoration: 'none',
            borderRadius: '8px',
            fontSize: '14px',
          }}>
            تسجيل الدخول
          </Link>
        </div>
      </nav>

      <section style={{
        textAlign: 'center',
        padding: '80px 32px',
        backgroundColor: '#f8fafc',
      }}>
        <h2 style={{ fontSize: '48px', fontWeight: 700, color: '#1e293b', marginBottom: '16px' }}>
          منصة الذكاء الاصطناعي الرياضي
        </h2>
        <p style={{ fontSize: '20px', color: '#64748b', marginBottom: '32px', maxWidth: '600px', margin: '0 auto 32px' }}>
          إدارة متقدمة للفرق والأندية الأكاديمية مع تحليلات ذكية وتصنيفات حديثة
        </p>
        <Link to="/auth" style={{
          display: 'inline-block',
          padding: '16px 40px',
          backgroundColor: '#2563eb',
          color: '#fff',
          textDecoration: 'none',
          borderRadius: '12px',
          fontSize: '18px',
          fontWeight: 600,
        }}>
          ابدأ الآن
        </Link>
      </section>

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
            backgroundColor: '#fff',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>{feature.icon}</div>
            <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>{feature.title}</h3>
            <p style={{ color: '#64748b', margin: 0 }}>{feature.desc}</p>
          </div>
        ))}
      </section>
    </div>
  )
}
