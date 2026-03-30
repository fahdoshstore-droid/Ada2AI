import { Link } from 'react-router-dom'

const features = [
  { icon: 'badge', title: 'الهوية الرياضية', desc: 'بطاقة FIFA لكل لاعب مع تقييم شامل', path: '/sport-id', color: 'var(--accent-gold)' },
  { icon: 'smart_display', title: 'تحليل الفيديو', desc: 'تحليل الأداء بالذكاء الاصطناعي', path: '/video-analysis', color: 'var(--accent-cyan)' },
  { icon: 'sports', title: 'لوحة المدرب', desc: 'إدارة الفريق والتدريبات', path: '/coach', color: 'var(--accent-gold)' },
  { icon: 'person_search', title: 'لوحة الكشاف', desc: 'اكتشاف ومقارنة المواهب', path: '/scout', color: 'var(--accent-cyan)' },
  { icon: 'leaderboard', title: 'ترتيب المواهب', desc: 'تصنيف أفضل اللاعبين', path: '/rankings', color: 'var(--accent-gold)' },
  { icon: 'psychology', title: 'Dheeb V4', desc: 'عقل ذكي يحلل ويتعلم ويتنبأ', path: '/dheeb', color: 'var(--accent-cyan)' },
]

const stats = [
  { value: '14', label: 'مدينة' },
  { value: '9', label: 'رياضات' },
  { value: '8-18', label: 'الأعمار' },
  { value: 'AI', label: 'تحليل ذكي' },
]

function LandingPage() {
  return (
    <div style={{ paddingTop: '20px' }}>
      {/* Hero */}
      <section style={{ textAlign: 'center', padding: '60px 0 40px' }}>
        <div className="gold-badge" style={{ marginBottom: '24px', display: 'inline-flex' }}>
          <span className="material-symbols-outlined">star</span>
          اكتشاف المواهب الرياضية بالذكاء الاصطناعي
        </div>
        <h1 style={{
          fontSize: 'clamp(2.5rem, 5vw, 4rem)',
          fontWeight: 900,
          lineHeight: 1.2,
          marginBottom: '20px',
        }}>
          <span style={{
            background: 'linear-gradient(90deg, var(--text-white) 0%, var(--accent-gold) 50%, var(--accent-cyan) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Scout AI
          </span>
          <br />
          <span style={{ color: 'var(--text-muted)', fontSize: '0.5em' }}>
            Ada2AI — منصة اكتشاف المواهب
          </span>
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto 32px', lineHeight: 1.8 }}>
          نظام متكامل لاكتشاف وتقييم المواهب الرياضية باستخدام الذكاء الاصطناعي — من التحليل إلى الاحتراف
        </p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/video-analysis" className="cta-btn" style={{ fontSize: '18px', padding: '16px 32px' }}>
            <span className="material-symbols-outlined">play_circle</span>
            ابدأ التحليل
          </Link>
          <Link to="/sport-id" className="nav-link" style={{ fontSize: '16px', padding: '16px 28px', border: '1px solid var(--glass-border)', borderRadius: '12px' }}>
            <span className="material-symbols-outlined">badge</span>
            الهوية الرياضية
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px', marginBottom: '60px' }}>
        {stats.map((s, i) => (
          <div key={i} className="stat-card glow-cyan">
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </section>

      {/* Features */}
      <section style={{ marginBottom: '60px' }}>
        <h2 className="section-title" style={{ textAlign: 'center' }}>المنظومة المتكاملة</h2>
        <p className="section-subtitle" style={{ textAlign: 'center' }}>كل أدوات اكتشاف المواهب في مكان واحد</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          {features.map((f, i) => (
            <Link key={i} to={f.path} className="glass-card" style={{ textDecoration: 'none', cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
                <div style={{
                  width: '48px', height: '48px',
                  background: f.color === 'var(--accent-gold)' ? 'linear-gradient(135deg, var(--accent-gold), #b8962e)' : 'rgba(0, 212, 255, 0.15)',
                  borderRadius: '12px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: f.color === 'var(--accent-cyan)' ? '1px solid rgba(0, 212, 255, 0.3)' : 'none',
                }}>
                  <span className="material-symbols-outlined" style={{
                    color: f.color === 'var(--accent-gold)' ? 'var(--primary-bg)' : 'var(--accent-cyan)',
                    fontSize: '24px'
                  }}>{f.icon}</span>
                </div>
                <h3 style={{ color: 'var(--text-white)', fontSize: '1.1rem', fontWeight: 700 }}>{f.title}</h3>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>{f.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="glass-card glow-gold" style={{ textAlign: 'center', padding: '48px', marginBottom: '40px' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-white)', marginBottom: '16px' }}>
          جاهز لاكتشاف المواهب؟
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '1.1rem' }}>
          11 أبريل — 4 يوليو 2026 • 14 مدينة • 9 رياضات
        </p>
        <Link to="/video-analysis" className="cta-btn" style={{ display: 'inline-flex', fontSize: '18px', padding: '16px 40px' }}>
          <span className="material-symbols-outlined">rocket_launch</span>
          ابدأ الآن
        </Link>
      </section>
    </div>
  )
}

export default LandingPage
