/**
 * PlayerProfile - Player profile edit and view page
 */
import React, { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import DashboardLayout from '@/components/DashboardLayout'
import { supabase } from '@/lib/supabase'
import { User, Save, Camera, Trophy, Target, TrendingUp } from 'lucide-react'

export default function PlayerProfile() {
  const { user } = useAuth()
  const { isRTL } = useLanguage()

  const [profile, setProfile] = useState({
    full_name: user?.email?.split('@')[0] || '',
    phone: '',
    sport: 'football',
    position: '',
    age: '',
    height_cm: '',
    weight_kg: '',
    dominant_foot: 'right',
    jersey_number: '',
    achievements: '',
    region: '',
    city: '',
  })

  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    setSaving(true)
    try {
      const { error } = await supabase
        .from('player_profiles')
        .upsert({
          id: user.id,
          full_name: profile.full_name,
          phone: profile.phone,
          sport: profile.sport,
          position: profile.position,
          age: profile.age ? parseInt(profile.age) : null,
          height_cm: profile.height_cm ? parseInt(profile.height_cm) : null,
          weight_kg: profile.weight_kg ? parseInt(profile.weight_kg) : null,
          dominant_foot: profile.dominant_foot,
          jersey_number: profile.jersey_number ? parseInt(profile.jersey_number) : null,
          achievements: profile.achievements,
          region: profile.region,
          city: profile.city,
          updated_at: new Date().toISOString(),
        })
      if (error) throw error
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      console.error('Error saving profile:', err)
    } finally {
      setSaving(false)
    }
  }

  const inputStyle = {
    width: '100%',
    padding: '12px',
    backgroundColor: '#000A0F',
    border: '1px solid #374151',
    borderRadius: '8px',
    color: '#EEEFEE',
    fontSize: '16px',
    fontFamily: "'Cairo', sans-serif"
  }

  const labelStyle = {
    display: 'block',
    color: '#9CA3AF',
    marginBottom: '8px',
    fontSize: '14px',
    fontFamily: "'Cairo', sans-serif"
  }

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '800px' }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '32px'
        }}>
          <div>
            <h1 style={{
              color: '#EEEFEE',
              fontSize: '28px',
              fontWeight: 'bold',
              fontFamily: "'Cairo', sans-serif",
              marginBottom: '4px'
            }}>
              {isRTL ? 'ملفي الشخصي' : 'My Profile'}
            </h1>
            <p style={{ color: '#9CA3AF' }}>
              {isRTL ? 'إدارة بياناتك الشخصية' : 'Manage your personal information'}
            </p>
          </div>
          {saved && (
            <div style={{
              backgroundColor: 'rgba(16,185,129,0.1)',
              color: '#10B981',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '14px'
            }}>
              ✅ {isRTL ? 'تم الحفظ!' : 'Saved!'}
            </div>
          )}
        </div>

        <form onSubmit={handleSave}>
          {/* Avatar Section */}
          <div style={{
            backgroundColor: '#0A0E1A',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '24px',
            border: '1px solid #1F2937',
            display: 'flex',
            alignItems: 'center',
            gap: '24px'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: '#00DCC8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative'
            }}>
              <User size={40} color="#000A0F" />
              <button type="button" style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: '#007ABA',
                border: '2px solid #0A0E1A',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Camera size={14} color="#fff" />
              </button>
            </div>
            <div>
              <h3 style={{ color: '#EEEFEE', marginBottom: '4px' }}>{profile.full_name}</h3>
              <p style={{ color: '#9CA3AF', fontSize: '14px' }}>
                {isRTL ? 'لاعب' : 'Player'} • {profile.sport}
              </p>
            </div>
          </div>

          {/* Basic Info */}
          <div style={{
            backgroundColor: '#0A0E1A',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '24px',
            border: '1px solid #1F2937'
          }}>
            <h2 style={{
              color: '#EEEFEE',
              fontSize: '18px',
              fontWeight: '600',
              marginBottom: '20px',
              fontFamily: "'Cairo', sans-serif"
            }}>
              {isRTL ? 'المعلومات الأساسية' : 'Basic Information'}
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>{isRTL ? 'الاسم الكامل' : 'Full Name'}</label>
                <input
                  type="text"
                  value={profile.full_name}
                  onChange={(e) => setProfile({...profile, full_name: e.target.value})}
                  style={inputStyle}
                  required
                />
              </div>
              <div>
                <label style={labelStyle}>{isRTL ? 'رقم الهاتف' : 'Phone'}</label>
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => setProfile({...profile, phone: e.target.value})}
                  style={inputStyle}
                  placeholder="+966..."
                />
              </div>
              <div>
                <label style={labelStyle}>{isRTL ? 'العمر' : 'Age'}</label>
                <input
                  type="number"
                  value={profile.age}
                  onChange={(e) => setProfile({...profile, age: e.target.value})}
                  style={inputStyle}
                  min="10"
                  max="50"
                />
              </div>
              <div>
                <label style={labelStyle}>{isRTL ? 'المنطقة' : 'Region'}</label>
                <input
                  type="text"
                  value={profile.region}
                  onChange={(e) => setProfile({...profile, region: e.target.value})}
                  style={inputStyle}
                  placeholder={isRTL ? 'مثال: الرياض' : 'e.g. Riyadh'}
                />
              </div>
            </div>
          </div>

          {/* Sports Info */}
          <div style={{
            backgroundColor: '#0A0E1A',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '24px',
            border: '1px solid #1F2937'
          }}>
            <h2 style={{
              color: '#EEEFEE',
              fontSize: '18px',
              fontWeight: '600',
              marginBottom: '20px',
              fontFamily: "'Cairo', sans-serif"
            }}>
              {isRTL ? 'معلومات رياضية' : 'Sports Information'}
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
              <div>
                <label style={labelStyle}>{isRTL ? 'المركز' : 'Position'}</label>
                <select
                  value={profile.position}
                  onChange={(e) => setProfile({...profile, position: e.target.value})}
                  style={{ ...inputStyle, cursor: 'pointer' }}
                >
                  <option value="">-</option>
                  <option value="goalkeeper">{isRTL ? 'حارس مرمى' : 'Goalkeeper'}</option>
                  <option value="defender">{isRTL ? 'مدافع' : 'Defender'}</option>
                  <option value="midfielder">{isRTL ? 'وسط' : 'Midfielder'}</option>
                  <option value="forward">{isRTL ? 'مهاجم' : 'Forward'}</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>{isRTL ? 'القدم المهيمنة' : 'Dominant Foot'}</label>
                <select
                  value={profile.dominant_foot}
                  onChange={(e) => setProfile({...profile, dominant_foot: e.target.value})}
                  style={{ ...inputStyle, cursor: 'pointer' }}
                >
                  <option value="right">{isRTL ? 'يمين' : 'Right'}</option>
                  <option value="left">{isRTL ? 'يسار' : 'Left'}</option>
                  <option value="both">{isRTL ? 'كلاهما' : 'Both'}</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>{isRTL ? 'رقم القميص' : 'Jersey Number'}</label>
                <input
                  type="number"
                  value={profile.jersey_number}
                  onChange={(e) => setProfile({...profile, jersey_number: e.target.value})}
                  style={inputStyle}
                  min="1"
                  max="99"
                />
              </div>
              <div>
                <label style={labelStyle}>{isRTL ? 'الطول (سم)' : 'Height (cm)'}</label>
                <input
                  type="number"
                  value={profile.height_cm}
                  onChange={(e) => setProfile({...profile, height_cm: e.target.value})}
                  style={inputStyle}
                  placeholder="175"
                />
              </div>
              <div>
                <label style={labelStyle}>{isRTL ? 'الوزن (كجم)' : 'Weight (kg)'}</label>
                <input
                  type="number"
                  value={profile.weight_kg}
                  onChange={(e) => setProfile({...profile, weight_kg: e.target.value})}
                  style={inputStyle}
                  placeholder="70"
                />
              </div>
            </div>

            <div style={{ marginTop: '16px' }}>
              <label style={labelStyle}>{isRTL ? 'الإنجازات' : 'Achievements'}</label>
              <textarea
                value={profile.achievements}
                onChange={(e) => setProfile({...profile, achievements: e.target.value})}
                style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
                placeholder={isRTL ? 'سجل إنجازاتك...' : 'List your achievements...'}
              />
            </div>
          </div>

          {/* Save Button */}
          <button
            type="submit"
            disabled={saving}
            style={{
              width: '100%',
              padding: '16px',
              backgroundColor: saving ? '#007ABA80' : '#00DCC8',
              color: '#000A0F',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: saving ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontFamily: "'Cairo', sans-serif"
            }}
          >
            <Save size={20} />
            {saving
              ? (isRTL ? 'جاري الحفظ...' : 'Saving...')
              : (isRTL ? 'حفظ التغييرات' : 'Save Changes')
            }
          </button>
        </form>
      </div>
    </DashboardLayout>
  )
}
