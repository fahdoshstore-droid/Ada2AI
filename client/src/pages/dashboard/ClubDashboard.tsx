/**
 * ClubDashboard - Al-Rawda Club Management
 * Real Supabase integration with player management
 */
import React, { useState, useEffect } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { useNotifications } from '@/contexts/NotificationContext'
import DashboardLayout from '@/components/DashboardLayout'
import { Building2, Users, Trophy, TrendingUp, BarChart3, Calendar, Video, Settings, Plus, X, Edit2, Trash2, Bell, Loader2, CheckCircle, AlertCircle, UserPlus } from 'lucide-react'
import { supabase, getPlayers, createPlayer, updatePlayer, type Player, type Profile } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

export default function ClubDashboard() {
  const { isRTL } = useLanguage()
  const { addNotification } = useNotifications()
  const [user, setUser] = useState<User | null>(null)
  const [clubProfile, setClubProfile] = useState<Profile | null>(null)
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddPlayer, setShowAddPlayer] = useState(false)
  
  // New player form
  const [newPlayer, setNewPlayer] = useState({
    full_name: '',
    age: '',
    position: '',
    height_cm: '',
    weight_kg: '',
    jersey_number: '',
    dominant_foot: 'right'
  })
  const [saving, setSaving] = useState(false)

  // Load current user and data
  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
        
        if (user) {
          // Fetch club profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', user.id)
            .single()
          setClubProfile(profile)
          
          // Fetch players
          const { data: playersData } = await supabase
            .from('players')
            .select('*, profile:profiles(*)')
            .eq('club_id', profile?.id)
            .order('jersey_number')
          
          setPlayers(playersData || [])
        }
      } catch (err) {
        console.error('Error loading data:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // Stats
  const stats = [
    { icon: <Users size={24} />, label: isRTL ? 'اللاعبين' : 'Players', value: players.length.toString(), color: '#00DCC8' },
    { icon: <Trophy size={24} />, label: isRTL ? 'البطولات' : 'Championships', value: '3', color: '#F59E0B' },
    { icon: <TrendingUp size={24} />, label: isRTL ? 'المركز' : 'Rank', value: '#2', color: '#10B981' },
    { icon: <BarChart3 size={24} />, label: isRTL ? 'المباريات' : 'Matches', value: '18', color: '#007ABA' },
  ]

  // Add player
  const handleAddPlayer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!clubProfile) return
    
    setSaving(true)
    try {
      // Create profile for player first
      const playerName = newPlayer.full_name
      const { data: playerProfile, error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_type: 'player',
          full_name: playerName,
          sport: 'football'
        })
        .select()
        .single()
      
      if (profileError) throw profileError
      
      // Then create player record
      const { error: playerError } = await supabase
        .from('players')
        .insert({
          profile_id: playerProfile.id,
          club_id: clubProfile.id,
          position: newPlayer.position,
          age: parseInt(newPlayer.age) || null,
          height_cm: parseInt(newPlayer.height_cm) || null,
          weight_kg: parseInt(newPlayer.weight_kg) || null,
          jersey_number: parseInt(newPlayer.jersey_number) || null,
          dominant_foot: newPlayer.dominant_foot
        })
      
      if (playerError) throw playerError
      
      // Refresh players list
      const { data: updatedPlayers } = await supabase
        .from('players')
        .select('*, profile:profiles(*)')
        .eq('club_id', clubProfile.id)
        .order('jersey_number')
      setPlayers(updatedPlayers || [])
      
      // Reset form
      setNewPlayer({ full_name: '', age: '', position: '', height_cm: '', weight_kg: '', jersey_number: '', dominant_foot: 'right' })
      setShowAddPlayer(false)
      
      // Add notification
      addNotification({
        type: 'success',
        title: isRTL ? 'تم إضافة اللاعب' : 'Player Added',
        message: `${playerName} ${isRTL ? 'تمت إضافته للنادي' : 'has been added to the club'}`
      })
      
    } catch (err: any) {
      console.error('Error adding player:', err)
      addNotification({
        type: 'error',
        title: isRTL ? 'خطأ' : 'Error',
        message: err.message || (isRTL ? 'فشل إضافة اللاعب' : 'Failed to add player')
      })
    } finally {
      setSaving(false)
    }
  }

  // Delete player
  const handleDeletePlayer = async (playerId: string, playerName: string) => {
    if (!confirm(isRTL ? 'هل أنت متأكد من حذف هذا اللاعب؟' : 'Are you sure you want to delete this player?')) return
    
    try {
      const { error } = await supabase.from('players').delete().eq('id', playerId)
      if (error) throw error
      
      setPlayers(prev => prev.filter(p => p.id !== playerId))
      
      addNotification({
        type: 'success',
        title: isRTL ? 'تم حذف اللاعب' : 'Player Deleted',
        message: `${playerName} ${isRTL ? 'تم حذفه' : 'has been deleted'}`
      })
    } catch (err: any) {
      addNotification({
        type: 'error',
        title: isRTL ? 'خطأ' : 'Error',
        message: err.message || (isRTL ? 'فشل حذف اللاعب' : 'Failed to delete player')
      })
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <Loader2 size={48} color="#00DCC8" className="animate-spin" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ color: '#EEEFEE', fontSize: '28px', fontWeight: 'bold', fontFamily: "'Cairo', sans-serif", marginBottom: '8px' }}>
              🏟️ {isRTL ? 'نادي الروضة' : 'Al-Rawda Club'}
            </h1>
            <p style={{ color: '#9CA3AF' }}>
              {clubProfile?.city || 'Riyadh'} • {clubProfile?.region || 'Saudi Arabia'}
            </p>
          </div>
          <button
            onClick={() => setShowAddPlayer(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              backgroundColor: '#00DCC8',
              color: '#000A0F',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
              fontFamily: "'Cairo', sans-serif"
            }}
          >
            <UserPlus size={18} />
            {isRTL ? 'إضافة لاعب' : 'Add Player'}
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          {stats.map((stat, i) => (
            <div key={i} style={{
              backgroundColor: '#0A0E1A',
              borderRadius: '12px',
              padding: '24px',
              border: `1px solid ${stat.color}30`
            }}>
              <div style={{ color: stat.color, marginBottom: '12px' }}>{stat.icon}</div>
              <h3 style={{
                color: '#EEEFEE',
                fontSize: '32px',
                fontWeight: 'bold',
                fontFamily: "'Orbitron', sans-serif",
                marginBottom: '4px'
              }}>
                {stat.value}
              </h3>
              <p style={{ color: '#9CA3AF', fontSize: '14px' }}>{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Players Grid */}
        <div style={{
          backgroundColor: '#0A0E1A',
          borderRadius: '12px',
          padding: '24px',
          border: '1px solid #1F2937'
        }}>
          <h2 style={{
            color: '#EEEFEE',
            fontSize: '18px',
            fontWeight: '600',
            marginBottom: '20px',
            fontFamily: "'Cairo', sans-serif"
          }}>
            {isRTL ? 'قائمة اللاعبين' : 'Players Squad'}
            <span style={{ color: '#6B7280', fontSize: '14px', marginRight: '8px' }}>
              ({players.length} {isRTL ? 'لاعب' : 'players'})
            </span>
          </h2>

          {players.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px', color: '#6B7280' }}>
              <Users size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
              <p>{isRTL ? 'لا يوجد لاعبين بعد' : 'No players yet'}</p>
              <p style={{ fontSize: '14px', marginTop: '8px' }}>
                {isRTL ? 'اضغط على "إضافة لاعب" للبدء' : 'Click "Add Player" to get started'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
              {players.map((player) => (
                <div key={player.id} style={{
                  padding: '20px',
                  backgroundColor: 'rgba(255,255,255,0.02)',
                  borderRadius: '12px',
                  border: '1px solid #374151'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        backgroundColor: '#007ABA',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '18px',
                        fontWeight: 'bold',
                        color: '#fff'
                      }}>
                        {player.profile?.full_name?.charAt(0) || 'P'}
                      </div>
                      <div>
                        <h3 style={{ color: '#EEEFEE', fontWeight: '600' }}>
                          {player.profile?.full_name || 'Unknown'}
                        </h3>
                        <p style={{ color: '#9CA3AF', fontSize: '12px' }}>
                          #{player.jersey_number || '?'} • {player.position || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        onClick={() => handleDeletePlayer(player.id, player.profile?.full_name || 'Player')}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#EF4444',
                          padding: '4px'
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
                    {player.age && (
                      <span style={{ backgroundColor: 'rgba(0,220,200,0.1)', color: '#00DCC8', padding: '4px 8px', borderRadius: '4px', fontSize: '11px' }}>
                        {player.age} {isRTL ? 'سنة' : 'yrs'}
                      </span>
                    )}
                    {player.height_cm && (
                      <span style={{ backgroundColor: 'rgba(139,92,246,0.1)', color: '#8B5CF6', padding: '4px 8px', borderRadius: '4px', fontSize: '11px' }}>
                        {player.height_cm}cm
                      </span>
                    )}
                    {player.weight_kg && (
                      <span style={{ backgroundColor: 'rgba(245,158,11,0.1)', color: '#F59E0B', padding: '4px 8px', borderRadius: '4px', fontSize: '11px' }}>
                        {player.weight_kg}kg
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => window.location.href = `/dashboard/player/${player.id}`}
                    style={{
                      width: '100%',
                      padding: '10px',
                      backgroundColor: 'rgba(0,122,186,0.1)',
                      border: '1px solid #007ABA',
                      borderRadius: '6px',
                      color: '#007ABA',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: '600',
                      fontFamily: "'Cairo', sans-serif"
                    }}
                  >
                    {isRTL ? 'عرض التفاصيل' : 'View Details'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Player Modal */}
      {showAddPlayer && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#0A0E1A',
            borderRadius: '16px',
            padding: '32px',
            width: '100%',
            maxWidth: '500px',
            border: '1px solid #1F2937'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ color: '#EEEFEE', fontSize: '20px', fontWeight: '600' }}>
                {isRTL ? 'إضافة لاعب جديد' : 'Add New Player'}
              </h2>
              <button
                onClick={() => setShowAddPlayer(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#6B7280'
                }}
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleAddPlayer}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', color: '#9CA3AF', fontSize: '13px', marginBottom: '6px' }}>
                  {isRTL ? 'الاسم الكامل *' : 'Full Name *'}
                </label>
                <input
                  type="text"
                  value={newPlayer.full_name}
                  onChange={(e) => setNewPlayer(prev => ({ ...prev, full_name: e.target.value }))}
                  required
                  placeholder={isRTL ? 'مثال: أحمد محمد' : 'e.g. Ahmed Mohammed'}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    backgroundColor: '#000A0F',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#EEEFEE',
                    fontSize: '14px',
                    fontFamily: "'Cairo', sans-serif"
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', color: '#9CA3AF', fontSize: '13px', marginBottom: '6px' }}>
                    {isRTL ? 'العمر' : 'Age'}
                  </label>
                  <input
                    type="number"
                    value={newPlayer.age}
                    onChange={(e) => setNewPlayer(prev => ({ ...prev, age: e.target.value }))}
                    min="10"
                    max="50"
                    placeholder="18"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      backgroundColor: '#000A0F',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#EEEFEE',
                      fontSize: '14px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#9CA3AF', fontSize: '13px', marginBottom: '6px' }}>
                    {isRTL ? 'رقم القميص' : 'Jersey Number'}
                  </label>
                  <input
                    type="number"
                    value={newPlayer.jersey_number}
                    onChange={(e) => setNewPlayer(prev => ({ ...prev, jersey_number: e.target.value }))}
                    min="1"
                    max="99"
                    placeholder="10"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      backgroundColor: '#000A0F',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#EEEFEE',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', color: '#9CA3AF', fontSize: '13px', marginBottom: '6px' }}>
                  {isRTL ? 'المركز' : 'Position'}
                </label>
                <select
                  value={newPlayer.position}
                  onChange={(e) => setNewPlayer(prev => ({ ...prev, position: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    backgroundColor: '#000A0F',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: newPlayer.position ? '#EEEFEE' : '#6B7280',
                    fontSize: '14px'
                  }}
                >
                  <option value="">{isRTL ? 'اختر المركز' : 'Select Position'}</option>
                  <option value="GK">{isRTL ? 'حارس مرمى' : 'Goalkeeper'}</option>
                  <option value="DF">{isRTL ? 'مدافع' : 'Defender'}</option>
                  <option value="MID">{isRTL ? 'وسط' : 'Midfielder'}</option>
                  <option value="FW">{isRTL ? 'مهاجم' : 'Forward'}</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
                <div>
                  <label style={{ display: 'block', color: '#9CA3AF', fontSize: '13px', marginBottom: '6px' }}>
                    {isRTL ? 'الطول (سم)' : 'Height (cm)'}
                  </label>
                  <input
                    type="number"
                    value={newPlayer.height_cm}
                    onChange={(e) => setNewPlayer(prev => ({ ...prev, height_cm: e.target.value }))}
                    placeholder="175"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      backgroundColor: '#000A0F',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#EEEFEE',
                      fontSize: '14px'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#9CA3AF', fontSize: '13px', marginBottom: '6px' }}>
                    {isRTL ? 'القدم المفضلة' : 'Dominant Foot'}
                  </label>
                  <select
                    value={newPlayer.dominant_foot}
                    onChange={(e) => setNewPlayer(prev => ({ ...prev, dominant_foot: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      backgroundColor: '#000A0F',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#EEEFEE',
                      fontSize: '14px'
                    }}
                  >
                    <option value="right">{isRTL ? 'يمين' : 'Right'}</option>
                    <option value="left">{isRTL ? 'يسار' : 'Left'}</option>
                    <option value="both">{isRTL ? 'كلا القدمين' : 'Both'}</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                style={{
                  width: '100%',
                  padding: '14px',
                  backgroundColor: saving ? '#007ABA80' : '#00DCC8',
                  color: '#000A0F',
                  border: 'none',
                  borderRadius: '10px',
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
                {saving ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    {isRTL ? 'جاري الحفظ...' : 'Saving...'}
                  </>
                ) : (
                  <>
                    <CheckCircle size={18} />
                    {isRTL ? 'إضافة اللاعب' : 'Add Player'}
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
