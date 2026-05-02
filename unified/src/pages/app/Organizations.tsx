import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { LoadingState } from '../../components/LoadingState'
import { EmptyState } from '../../components/EmptyState'
import { ErrorState } from '../../components/ErrorState'
import type { OrganizationType } from '../../types'

export function Organizations() {
  const [organizations, setOrganizations] = useState<Array<{ id: string; name: string; type: string; created_at: string }>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newOrg, setNewOrg] = useState<{ name: string; type: OrganizationType }>({ name: '', type: 'club' })

  const fetchOrgs = async () => {
    try {
      setLoading(true)
      setError(null)
      const { data } = await supabase.from('organizations').select('*').order('created_at', { ascending: false })
      setOrganizations(data || [])
    } catch (err) {
      setError('فشل في تحميل المنظمات')
    } finally {
      setLoading(false)
    }
  }

  const createOrg = async () => {
    if (!newOrg.name.trim()) return
    try {
      const { error: insertError } = await supabase.from('organizations').insert({ name: newOrg.name, type: newOrg.type })
      if (insertError) throw insertError
      setNewOrg({ name: '', type: 'club' })
      fetchOrgs()
    } catch (err) {
      setError('فشل في إنشاء المنظمة')
    }
  }

  useEffect(() => { fetchOrgs() }, [])

  if (loading) return <LoadingState />
  if (error) return <ErrorState message={error} onRetry={fetchOrgs} />

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', direction: 'rtl', fontFamily: 'system-ui, sans-serif' }}>
      <header style={{ backgroundColor: '#fff', borderBottom: '1px solid #e5e7eb', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0, fontSize: '24px', color: '#1e293b' }}>المنظمات</h1>
        <Link to="/app/admin" style={{ padding: '8px 16px', backgroundColor: '#2563eb', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontSize: '14px' }}>العودة</Link>
      </header>

      <main style={{ padding: '32px', maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e5e7eb', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#1e293b', marginBottom: '16px' }}>إنشاء منظمة جديدة</h2>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <input value={newOrg.name} onChange={(e) => setNewOrg({ ...newOrg, name: e.target.value })} placeholder="اسم المنظمة" style={{ flex: 1, minWidth: '200px', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }} />
            <select value={newOrg.type} onChange={(e) => setNewOrg({ ...newOrg, type: e.target.value as OrganizationType })} style={{ padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' }}>
              <option value="club">نادي</option>
              <option value="academy">أكاديمية</option>
            </select>
            <button onClick={createOrg} style={{ padding: '10px 20px', backgroundColor: '#059669', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}>إنشاء</button>
          </div>
        </div>

        {organizations.length === 0 ? (
          <EmptyState title="لا توجد منظمات" description="قم بإنشاء أول منظمة للبدء" />
        ) : (
          <div style={{ display: 'grid', gap: '12px' }}>
            {organizations.map(org => (
              <div key={org.id} style={{ backgroundColor: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 600, color: '#1e293b' }}>{org.name}</div>
                  <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>{org.type === 'club' ? 'نادي' : 'أكاديمية'}</div>
                </div>
                <div style={{ backgroundColor: '#f1f5f9', color: '#475569', padding: '4px 12px', borderRadius: '16px', fontSize: '13px' }}>
                  {new Date(org.created_at).toLocaleDateString('ar-SA')}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
