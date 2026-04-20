import { Link } from 'react-router-dom'

// ════════════════════════════════════════════════════════════════
// PRODUCTS STRUCTURE — Constitution-compliant
// ════════════════════════════════════════════════════════════════
// 4 Main Products + Add-ons (not standalone features)

const mainProducts = [
  {
    id: 'sport-identity',
    icon: 'badge',
    title: 'الهوية الرياضية',
    desc: 'بطاقة FIFA لكل لاعب مع تقييم شامل',
    path: '/sport-id',
    color: 'var(--accent-gold)',
    addons: [
      { title: 'محرك تطوير الأداء', icon: 'trending_up', desc: 'تحليل تطوري مخصص' },
      { title: 'مساعد افتراضي', icon: 'smart_toy', desc: 'دعم ذكي على مدار الساعة' },
      { title: 'مركز التطوير', icon: 'school', desc: 'برامج تدريب متقدمة' },
    ]
  },
  {
    id: 'scout-dashboard',
    icon: 'person_search',
    title: 'لوحة الكشافين',
    desc: 'اكتشاف ومقارنة المواهب',
    path: '/scout',
    color: 'var(--accent-cyan)',
    addons: [
      { title: 'محرك تطوير الأداء', icon: 'trending_up', desc: 'تحليل تطوري مخصص' },
      { title: 'مساعد افتراضي', icon: 'smart_toy', desc: 'دعم ذكي على مدار الساعة' },
      { title: 'مركز التطوير', icon: 'school', desc: 'برامج تدريب متقدمة' },
    ]
  },
  {
    id: 'coach-dashboard',
    icon: 'sports',
    title: 'لوحة المدربين',
    desc: 'إدارة الفريق والتدريبات',
    path: '/coach',
    color: 'var(--accent-gold)',
    addons: [
      { title: 'محرك تطوير الأداء', icon: 'trending_up', desc: 'تحليل تطوري مخصص' },
      { title: 'مساعد افتراضي', icon: 'smart_toy', desc: 'دعم ذكي على مدار الساعة' },
      { title: 'مركز التطوير', icon: 'school', desc: 'برامج تدريب متقدمة' },
    ]
  },
  {
    id: 'organizations-dashboard',
    icon: 'groups',
    title: 'لوحه المنشئات',
    desc: 'إدارة اللاعبين والمؤسسات',
    path: '/club',
    color: 'var(--accent-cyan)',
    addons: [
      // Club dashboard includes ALL players - no add-ons needed for now
    ]
  },
]

// Standalone features that were moved to add-ons:
// - تحليل الفيديو (Video Analysis) → now an addon
// - ترتيب المواهب (Rankings) → integrated into dashboards
// - Dheeb V4 (AI Brain) → now an addon called "مساعد افتراضي"


const features = mainProducts

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
        <h2 className="section-title" style={{ textAlign: 'center' }}>المنتجات</h2>
        <p className="section-subtitle" style={{ textAlign: 'center' }}>٤ منتجات رئيسية + خيارات إضافية</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          {mainProducts.map((product, i) => (
            <div key={i} className="glass-card" style={{ cursor: 'pointer' }}>
              <Link to={product.path} style={{ textDecoration: 'none' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
                  <div style={{
                    width: '48px', height: '48px',
                    background: product.color === 'var(--accent-gold)' ? 'linear-gradient(135deg, var(--accent-gold), #b8962e)' : 'rgba(0, 212, 255, 0.15)',
                    borderRadius: '12px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: product.color === 'var(--accent-cyan)' ? '1px solid rgba(0, 212, 255, 0.3)' : 'none',
                  }}>
                    <span className="material-symbols-outlined" style={{
                      color: product.color === 'var(--accent-gold)' ? 'var(--primary-bg)' : 'var(--accent-cyan)',
                      fontSize: '24px'
                    }}>{product.icon}</span>
                  </div>
                  <h3 style={{ color: 'var(--text-white)', fontSize: '1.1rem', fontWeight: 700 }}>{product.title}</h3>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '16px' }}>{product.desc}</p>
              </Link>

              {/* Add-ons */}
              {product.addons && product.addons.length > 0 && (
                <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--glass-border)' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginBottom: '12px', fontWeight: 600 }}>إضافة:</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {product.addons.map((addon, j) => (
                      <div key={j} style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        background: 'rgba(0, 212, 255, 0.1)',
                        border: '1px solid rgba(0, 212, 255, 0.2)',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                        color: 'var(--accent-cyan)',
                      }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>{addon.icon}</span>
                        {addon.title}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
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
