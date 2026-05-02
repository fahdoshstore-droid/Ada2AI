import { useAuth } from '../../hooks/useAuth'
import { LoadingState } from '../../components/LoadingState'
import { EmptyState } from '../../components/EmptyState'

export function PlayerDashboard() {
  const { user, signOut, organization } = useAuth()

  const handleSignOut = async () => { await signOut() }

  if (!user) return <LoadingState />

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', direction: 'rtl', fontFamily: 'system-ui, sans-serif' }}>
      <header style={{ backgroundColor: '#fff', borderBottom: '1px solid #e5e7eb', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', color: '#1e293b' }}>لوحة اللاعب</h1>
          <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '14px' }}>{user.email}</p>
        </div>
        <button onClick={handleSignOut} style={{ padding: '8px 16px', backgroundColor: '#dc2626', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}>خروج</button>
      </header>

      <main style={{ padding: '32px', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb', marginBottom: '24px', textAlign: 'center' }}>
          <div style={{ width: '80px', height: '80px', backgroundColor: '#e0e7ff', borderRadius: '50%', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px' }}>⚽</div>
          <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#1e293b', margin: '0 0 8px' }}>{user.email}</h2>
          <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>{organization?.name || 'غير محدد'}</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          {[
            { label: 'المباريات', value: '—' },
            { label: 'الأهداف', value: '—' },
            { label: 'التمريرات', value: '—' },
            { label: 'التقييم', value: '—' },
          ].map(stat => (
            <div key={stat.label} style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
              <div style={{ fontSize: '28px', fontWeight: 700, color: '#2563eb' }}>{stat.value}</div>
              <div style={{ color: '#64748b', fontSize: '13px', marginTop: '4px' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1e293b', marginBottom: '16px' }}>التصنيف</h3>
          <EmptyState title="لا توجد بيانات تصنيف" description="ستظهر بيانات التصنيف عندما يتم تقييمك" />
        </div>
      </main>
    </div>
  )
}
