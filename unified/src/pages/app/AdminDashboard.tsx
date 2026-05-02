import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { LoadingState } from '../../components/LoadingState'
import { EmptyState } from '../../components/EmptyState'
import { ErrorState } from '../../components/ErrorState'

export function AdminDashboard() {
  const { user, signOut, organization } = useAuth()
  const [stats, setStats] = useState({ organizations: 0, players: 0, coaches: 0, totalMembers: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [organizations, setOrganizations] = useState<Array<{ id: string; name: string; type: string; memberCount: number }>>([])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data: orgData } = await supabase.from('organizations').select('*')
      const { data: memberData } = await supabase.from('memberships').select('*')

      const coaches = memberData?.filter(m => m.role === 'coach').length || 0
      const players = memberData?.filter(m => m.role === 'player').length || 0

      setStats({
        organizations: orgData?.length || 0,
        players,
        coaches,
        totalMembers: memberData?.length || 0,
      })

      const orgsWithCounts = (orgData || []).map(org => ({
        ...org,
        memberCount: memberData?.filter(m => m.organization_id === org.id).length || 0,
      }))
      setOrganizations(orgsWithCounts)
    } catch (err) {
      setError('فشل في تحميل البيانات')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const handleSignOut = async () => {
    await signOut()
  }

  if (loading) return <LoadingState />
  if (error) return <ErrorState message={error} onRetry={fetchData} />

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', direction: 'rtl', fontFamily: 'system-ui, sans-serif' }}>
      <header style={{ backgroundColor: '#fff', borderBottom: '1px solid #e5e7eb', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '24px', color: '#1e293b' }}>لوحة المسؤول</h1>
          <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '14px' }}>
            {organization?.name || user?.email}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <Link to="/app/rankings" style={{ padding: '8px 16px', backgroundColor: '#2563eb', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontSize: '14px' }}>التصنيفات</Link>
          <Link to="/app/organizations" style={{ padding: '8px 16px', backgroundColor: '#059669', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontSize: '14px' }}>المنظمات</Link>
          <button onClick={handleSignOut} style={{ padding: '8px 16px', backgroundColor: '#dc2626', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}>تسجيل الخروج</button>
        </div>
      </header>

      <main style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          {[
            { label: 'المنظمات', value: stats.organizations, color: '#2563eb' },
            { label: 'اللاعبين', value: stats.players, color: '#059669' },
            { label: 'المدربين', value: stats.coaches, color: '#d97706' },
            { label: 'إجمالي الأعضاء', value: stats.totalMembers, color: '#7c3aed' },
          ].map(stat => (
            <div key={stat.label} style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
              <div style={{ fontSize: '36px', fontWeight: 700, color: stat.color }}>{stat.value}</div>
              <div style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#1e293b', marginBottom: '16px' }}>المنظمات</h2>
          {organizations.length === 0 ? (
            <EmptyState title="لا توجد منظمات" description="قم بإنشاء منظمة جديدة للبدء" />
          ) : (
            <div style={{ display: 'grid', gap: '12px' }}>
              {organizations.map(org => (
                <div key={org.id} style={{ padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600, color: '#1e293b' }}>{org.name}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>{org.type === 'club' ? 'نادي' : 'أكاديمية'}</div>
                  </div>
                  <div style={{ backgroundColor: '#e0e7ff', color: '#3730a3', padding: '4px 12px', borderRadius: '16px', fontSize: '14px', fontWeight: 500 }}>
                    {org.memberCount} عضو
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
