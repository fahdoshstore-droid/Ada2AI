/**
 * CoachDashboard - Coach tools and player management
 * Features: Players, Training, Stats Charts, Attendance, Evaluation
 */
import React, { useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import DashboardLayout from '@/components/DashboardLayout'
import { Users, BarChart3, Video, Calendar, TrendingUp, Search, Plus, MessageSquare, X, Check, Edit3, Download, TrendingDown } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts'

// VisualGuide - Arabic AI Teaching Overlay
import { VisualGuide, createFormationGuide } from '@/components/VisualGuide'
import type { GuideSession } from '@/components/VisualGuide'

export default function CoachDashboard() {
  const { isRTL } = useLanguage()
  const [selectedPlayer, setSelectedPlayer] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState<'players' | 'training' | 'stats' | 'attendance'>('players')
  
  // VisualGuide State
  const [guideActive, setGuideActive] = useState(false)
  const [guideSession, setGuideSession] = useState<GuideSession | null>(null)
  const [showTrainingModal, setShowTrainingModal] = useState(false)
  const [showEvaluationModal, setShowEvaluationModal] = useState(false)
  const [selectedTrainingForAttendance, setSelectedTrainingForAttendance] = useState<number | null>(null)

  // Mock Players Data
  const players = [
    { id: 1, name: 'أحمد محمد', nameEn: 'Ahmed Mohammed', age: 22, position: 'وسط', positionEn: 'Midfielder', status: 'active', performance: 85, attendance: 92, goals: 12, assists: 8, number: 10 },
    { id: 2, name: 'محمد عبدالله', nameEn: 'Mohammed Abdullah', age: 20, position: 'مدافع', positionEn: 'Defender', status: 'active', performance: 78, attendance: 88, goals: 2, assists: 5, number: 4 },
    { id: 3, name: 'عبدالله', nameEn: 'Abdullah', age: 24, position: 'مهاجم', positionEn: 'Forward', status: 'injured', performance: 92, attendance: 95, goals: 25, assists: 6, number: 9 },
    { id: 4, name: 'خالد', nameEn: 'Khaled', age: 21, position: 'حارس', positionEn: 'Goalkeeper', status: 'active', performance: 80, attendance: 90, goals: 0, assists: 1, number: 1 },
    { id: 5, name: 'سالم', nameEn: 'Salem', age: 23, position: 'وسط', positionEn: 'Midfielder', status: 'active', performance: 76, attendance: 85, goals: 5, assists: 12, number: 8 },
  ]

  // Mock Training Sessions
  const [trainings, setTrainings] = useState([
    { id: 1, title: 'تمارين اللياقة', titleEn: 'Fitness Training', date: '2026-04-15', time: '18:00', attendance: [], maxAttendance: 25 },
    { id: 2, title: 'تمارين تكتيكية', titleEn: 'Tactical Drills', date: '2026-04-14', time: '19:00', attendance: [1, 2, 3, 4, 5], maxAttendance: 25 },
    { id: 3, title: 'مباراة ودية', titleEn: 'Friendly Match', date: '2026-04-13', time: '17:00', attendance: [1, 2, 3, 4], maxAttendance: 22 },
  ])

  // Mock Attendance Records
  const attendanceRecords = [
    { playerId: 1, present: 18, absent: 2, rate: 90 },
    { playerId: 2, present: 16, absent: 4, rate: 80 },
    { playerId: 3, present: 19, absent: 1, rate: 95 },
    { playerId: 4, present: 17, absent: 3, rate: 85 },
    { playerId: 5, present: 15, absent: 5, rate: 75 },
  ]

  // Stats Data for Charts
  const performanceData = players.map(p => ({
    name: p.nameEn.substring(0, 3),
    performance: p.performance,
    attendance: p.attendance,
    goals: p.goals,
  }))

  const goalsData = [
    { name: 'أه', value: players.reduce((sum, p) => sum + p.goals, 0), color: '#00DCC8' },
    { name: 'against', value: players.reduce((sum, p) => sum + Math.floor(p.goals * 0.4), 0), color: '#EF4444' },
  ]

  const monthlyPerformance = [
    { month: 'يناير', performance: 72, attendance: 85 },
    { month: 'فبراير', performance: 75, attendance: 88 },
    { month: 'مارس', performance: 80, attendance: 82 },
    { month: 'أبريل', performance: 85, attendance: 90 },
  ]

  // New Training Form
  const [newTraining, setNewTraining] = useState({ title: '', titleEn: '', date: '', time: '' })

  // Evaluation Form
  const [evaluation, setEvaluation] = useState({
    playerId: null as number | null,
    technical: 0,
    tactical: 0,
    physical: 0,
    mental: 0,
    notes: ''
  })

  // Handle Add Training
  const handleAddTraining = () => {
    if (!newTraining.title || !newTraining.date || !newTraining.time) return
    const training = {
      id: trainings.length + 1,
      title: newTraining.title,
      titleEn: newTraining.titleEn || newTraining.title,
      date: newTraining.date,
      time: newTraining.time,
      attendance: [],
      maxAttendance: 25
    }
    setTrainings([...trainings, training])
    setNewTraining({ title: '', titleEn: '', date: '', time: '' })
    setShowTrainingModal(false)
  }

  // VisualGuide Handler
  const startGuide = () => {
    const formation = '4-4-2'
    const session = createFormationGuide(formation, isRTL)
    setGuideSession(session)
    setGuideActive(true)
  }

  // Handle Attendance Toggle
  const toggleAttendance = (trainingId: number, playerId: number) => {
    setTrainings(trainings.map(t => {
      if (t.id === trainingId) {
        const hasAttendance = t.attendance.includes(playerId)
        return {
          ...t,
          attendance: hasAttendance 
            ? t.attendance.filter(id => id !== playerId)
            : [...t.attendance, playerId]
        }
      }
      return t
    }))
  }

  // Handle Evaluation Submit
  const handleSubmitEvaluation = () => {
    if (!evaluation.playerId) return
    // In real app: save to Supabase
    console.log('Evaluation submitted:', evaluation)
    setShowEvaluationModal(false)
    setEvaluation({ playerId: null, technical: 0, tactical: 0, physical: 0, mental: 0, notes: '' })
  }

  const COLORS = ['#00DCC8', '#007ABA', '#10B981', '#F59E0B', '#EF4444']

  return (
    <DashboardLayout>
      <div>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ color: '#EEEFEE', fontSize: '28px', fontWeight: 'bold', fontFamily: "'Cairo', sans-serif", marginBottom: '8px' }}>
            {isRTL ? 'لوحة المدرب' : 'Coach Dashboard'}
          </h1>
          <p style={{ color: '#9CA3AF' }}>
            {isRTL ? 'إدارة اللاعبين والتدريب والتحليل' : 'Manage players, training and analytics'}
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid #374151', paddingBottom: '8px' }}>
          {[
            { key: 'players', label: isRTL ? 'اللاعبين' : 'Players', icon: <Users size={16} /> },
            { key: 'training', label: isRTL ? 'التدريب' : 'Training', icon: <Calendar size={16} /> },
            { key: 'stats', label: isRTL ? 'الإحصائيات' : 'Stats', icon: <BarChart3 size={16} /> },
            { key: 'attendance', label: isRTL ? 'الحضور' : 'Attendance', icon: <Check size={16} /> },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                backgroundColor: activeTab === tab.key ? 'rgba(0,220,200,0.1)' : 'transparent',
                border: activeTab === tab.key ? '1px solid #00DCC8' : '1px solid transparent',
                borderRadius: '8px',
                color: activeTab === tab.key ? '#00DCC8' : '#9CA3AF',
                cursor: 'pointer',
                fontFamily: "'Cairo', sans-serif",
                transition: 'all 0.2s'
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Players Tab */}
        {activeTab === 'players' && (
          <>
            {/* Quick Actions */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
              <button 
                onClick={() => { setShowTrainingModal(true) }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px', padding: '20px',
                  backgroundColor: '#0A0E1A', border: '1px solid #00DCC830', borderRadius: '12px',
                  cursor: 'pointer', transition: 'all 0.2s'
                }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(0,220,200,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Plus size={24} color="#00DCC8" />
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ color: '#EEEFEE', fontWeight: '600' }}>{isRTL ? 'إضافة تدريب' : 'Add Training'}</div>
                  <div style={{ color: '#9CA3AF', fontSize: '12px' }}>{isRTL ? 'جدول جديد' : 'New session'}</div>
                </div>
              </button>

              <button 
                onClick={() => { setShowEvaluationModal(true); setEvaluation({ ...evaluation, playerId: selectedPlayer }) }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px', padding: '20px',
                  backgroundColor: '#0A0E1A', border: '1px solid #10B98130', borderRadius: '12px',
                  cursor: 'pointer', transition: 'all 0.2s'
                }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Edit3 size={24} color="#10B981" />
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ color: '#EEEFEE', fontWeight: '600' }}>{isRTL ? 'تقييم لاعب' : 'Evaluate Player'}</div>
                  <div style={{ color: '#9CA3AF', fontSize: '12px' }}>{isRTL ? 'تقرير أداء' : 'Performance report'}</div>
                </div>
              </button>

              <button style={{
                display: 'flex', alignItems: 'center', gap: '12px', padding: '20px',
                backgroundColor: '#0A0E1A', border: '1px solid #007ABA30', borderRadius: '12px',
                cursor: 'pointer', transition: 'all 0.2s'
              }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(0,122,186,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Download size={24} color="#007ABA" />
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ color: '#EEEFEE', fontWeight: '600' }}>{isRTL ? 'تصدير التقرير' : 'Export Report'}</div>
                  <div style={{ color: '#9CA3AF', fontSize: '12px' }}>{isRTL ? 'PDF/Excel' : 'PDF/Excel'}</div>
                </div>
              </button>
            </div>

            {/* Players List */}
            <div style={{
              backgroundColor: '#0A0E1A', borderRadius: '12px', padding: '24px', border: '1px solid #1F2937'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ color: '#EEEFEE', fontSize: '18px', fontWeight: '600', fontFamily: "'Cairo', sans-serif" }}>
                  {isRTL ? 'قائمة اللاعبين' : 'Players List'}
                </h2>
                <div style={{ position: 'relative' }}>
                  <Search size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6B7280' }} />
                  <input type="text" placeholder={isRTL ? 'بحث...' : 'Search...'} style={{
                    padding: '8px 12px', paddingRight: '36px', backgroundColor: '#000A0F',
                    border: '1px solid #374151', borderRadius: '6px', color: '#EEEFEE', fontSize: '14px', width: '160px'
                  }} />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {players.map((player) => (
                  <div key={player.id} onClick={() => setSelectedPlayer(player.id)} style={{
                    padding: '16px', backgroundColor: selectedPlayer === player.id ? 'rgba(0,220,200,0.1)' : 'rgba(255,255,255,0.02)',
                    border: selectedPlayer === player.id ? '1px solid #00DCC8' : '1px solid transparent',
                    borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#007ABA',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '600', fontSize: '14px'
                      }}>
                        {player.number}
                      </div>
                      <div>
                        <div style={{ color: '#EEEFEE', fontWeight: '600', marginBottom: '2px' }}>{player.name}</div>
                        <div style={{ color: '#9CA3AF', fontSize: '12px' }}>{player.position} • {player.age} {isRTL ? 'سنة' : 'years'}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: player.status === 'active' ? '#10B981' : '#EF4444' }} />
                      <div style={{
                        backgroundColor: player.performance >= 85 ? 'rgba(16,185,129,0.2)' : player.performance >= 75 ? 'rgba(245,158,11,0.2)' : 'rgba(239,68,68,0.2)',
                        color: player.performance >= 85 ? '#10B981' : player.performance >= 75 ? '#F59E0B' : '#EF4444',
                        padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '600'
                      }}>
                        {player.performance}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Training Tab */}
        {activeTab === 'training' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            {/* Training Schedule */}
            <div style={{ backgroundColor: '#0A0E1A', borderRadius: '12px', padding: '24px', border: '1px solid #1F2937' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ color: '#EEEFEE', fontSize: '18px', fontWeight: '600', fontFamily: "'Cairo', sans-serif" }}>
                  {isRTL ? 'جدول التدريب' : 'Training Schedule'}
                </h2>
                <button onClick={() => setShowTrainingModal(true)} style={{
                  padding: '8px 16px', backgroundColor: 'rgba(0,220,200,0.1)', border: '1px solid #00DCC8',
                  borderRadius: '8px', color: '#00DCC8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                  fontFamily: "'Cairo', sans-serif"
                }}>
                  <Plus size={16} /> {isRTL ? 'جديد' : 'New'}
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {trainings.map((training) => (
                  <div key={training.id} style={{
                    padding: '16px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '8px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                      <div>
                        <div style={{ color: '#EEEFEE', fontWeight: '600', marginBottom: '4px' }}>{training.title}</div>
                        <div style={{ color: '#9CA3AF', fontSize: '12px' }}>{training.date} • {training.time}</div>
                      </div>
                      <button 
                        onClick={() => setSelectedTrainingForAttendance(training.id)}
                        style={{
                          padding: '6px 12px', backgroundColor: 'rgba(0,220,200,0.1)', border: '1px solid #00DCC8',
                          borderRadius: '6px', color: '#00DCC8', cursor: 'pointer', fontSize: '12px'
                        }}>
                        {isRTL ? 'الحضور' : 'Attendance'}
                      </button>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <div style={{
                        backgroundColor: 'rgba(0,220,200,0.1)', color: '#00DCC8', padding: '4px 8px',
                        borderRadius: '4px', fontSize: '11px', fontWeight: '600'
                      }}>
                        {training.attendance.length}/{training.maxAttendance} {isRTL ? 'حاضر' : 'attending'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div style={{ backgroundColor: '#0A0E1A', borderRadius: '12px', padding: '24px', border: '1px solid #1F2937' }}>
              <h2 style={{ color: '#EEEFEE', fontSize: '18px', fontWeight: '600', marginBottom: '20px', fontFamily: "'Cairo', sans-serif" }}>
                {isRTL ? 'إحصائيات سريعة' : 'Quick Stats'}
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ backgroundColor: 'rgba(0,220,200,0.1)', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ color: '#00DCC8', fontSize: '32px', fontWeight: 'bold' }}>{trainings.length}</div>
                  <div style={{ color: '#9CA3AF', fontSize: '12px' }}>{isRTL ? 'تدريب هذا الأسبوع' : 'Trainings this week'}</div>
                </div>
                <div style={{ backgroundColor: 'rgba(16,185,129,0.1)', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ color: '#10B981', fontSize: '32px', fontWeight: 'bold' }}>
                    {Math.round(trainings.reduce((sum, t) => sum + t.attendance.length, 0) / Math.max(trainings.length, 1))}
                  </div>
                  <div style={{ color: '#9CA3AF', fontSize: '12px' }}>{isRTL ? 'متوسط الحضور' : 'Avg Attendance'}</div>
                </div>
                <div style={{ backgroundColor: 'rgba(0,122,186,0.1)', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ color: '#007ABA', fontSize: '32px', fontWeight: 'bold' }}>{players.length}</div>
                  <div style={{ color: '#9CA3AF', fontSize: '12px' }}>{isRTL ? 'لاعبين مسجلين' : 'Registered players'}</div>
                </div>
                <div style={{ backgroundColor: 'rgba(245,158,11,0.1)', padding: '16px', borderRadius: '8px', textAlign: 'center' }}>
                  <div style={{ color: '#F59E0B', fontSize: '32px', fontWeight: 'bold' }}>3</div>
                  <div style={{ color: '#9CA3AF', fontSize: '12px' }}>{isRTL ? 'إصابات نشطة' : 'Active injuries'}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Stats Tab */}
        {activeTab === 'stats' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            {/* Performance Chart */}
            <div style={{ backgroundColor: '#0A0E1A', borderRadius: '12px', padding: '24px', border: '1px solid #1F2937' }}>
              <h2 style={{ color: '#EEEFEE', fontSize: '18px', fontWeight: '600', marginBottom: '20px', fontFamily: "'Cairo', sans-serif" }}>
                {isRTL ? 'أداء اللاعبين' : 'Player Performance'}
              </h2>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="name" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip contentStyle={{ backgroundColor: '#0A0E1A', border: '1px solid #374151', borderRadius: '8px' }} />
                  <Bar dataKey="performance" fill="#00DCC8" name={isRTL ? 'الأداء' : 'Performance'} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Goals Pie */}
            <div style={{ backgroundColor: '#0A0E1A', borderRadius: '12px', padding: '24px', border: '1px solid #1F2937' }}>
              <h2 style={{ color: '#EEEFEE', fontSize: '18px', fontWeight: '600', marginBottom: '20px', fontFamily: "'Cairo', sans-serif" }}>
                {isRTL ? 'الأهداف' : 'Goals'}
              </h2>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={goalsData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {goalsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0A0E1A', border: '1px solid #374151', borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#00DCC8' }} />
                  <span style={{ color: '#9CA3AF', fontSize: '12px' }}>{isRTL ? 'أهدافنا' : 'Our Goals'} ({goalsData[0].value})</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#EF4444' }} />
                  <span style={{ color: '#9CA3AF', fontSize: '12px' }}>{isRTL ? 'أهداف الخصم' : 'Against'} ({goalsData[1].value})</span>
                </div>
              </div>
            </div>

            {/* Monthly Trend */}
            <div style={{ gridColumn: 'span 2', backgroundColor: '#0A0E1A', borderRadius: '12px', padding: '24px', border: '1px solid #1F2937' }}>
              <h2 style={{ color: '#EEEFEE', fontSize: '18px', fontWeight: '600', marginBottom: '20px', fontFamily: "'Cairo', sans-serif" }}>
                {isRTL ? 'الأداء الشهري' : 'Monthly Performance'}
              </h2>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={monthlyPerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip contentStyle={{ backgroundColor: '#0A0E1A', border: '1px solid #374151', borderRadius: '8px' }} />
                  <Line type="monotone" dataKey="performance" stroke="#00DCC8" strokeWidth={2} name={isRTL ? 'الأداء' : 'Performance'} />
                  <Line type="monotone" dataKey="attendance" stroke="#007ABA" strokeWidth={2} name={isRTL ? 'الحضور' : 'Attendance'} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Attendance Tab */}
        {activeTab === 'attendance' && (
          <div style={{ backgroundColor: '#0A0E1A', borderRadius: '12px', padding: '24px', border: '1px solid #1F2937' }}>
            <h2 style={{ color: '#EEEFEE', fontSize: '18px', fontWeight: '600', marginBottom: '20px', fontFamily: "'Cairo', sans-serif" }}>
              {isRTL ? 'سجل الحضور' : 'Attendance Records'}
            </h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #374151' }}>
                    <th style={{ padding: '12px', textAlign: 'left', color: '#9CA3AF', fontWeight: '600' }}>{isRTL ? 'اللاعب' : 'Player'}</th>
                    <th style={{ padding: '12px', textAlign: 'center', color: '#9CA3AF', fontWeight: '600' }}>{isRTL ? 'حاضر' : 'Present'}</th>
                    <th style={{ padding: '12px', textAlign: 'center', color: '#9CA3AF', fontWeight: '600' }}>{isRTL ? 'غائب' : 'Absent'}</th>
                    <th style={{ padding: '12px', textAlign: 'center', color: '#9CA3AF', fontWeight: '600' }}>{isRTL ? 'النسبة' : 'Rate'}</th>
                    <th style={{ padding: '12px', textAlign: 'center', color: '#9CA3AF', fontWeight: '600' }}>{isRTL ? 'الحالة' : 'Status'}</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceRecords.map((record, index) => {
                    const player = players.find(p => p.id === record.playerId)
                    return (
                      <tr key={record.playerId} style={{ borderBottom: '1px solid #1F2937' }}>
                        <td style={{ padding: '12px', color: '#EEEFEE' }}>{player?.name}</td>
                        <td style={{ padding: '12px', textAlign: 'center', color: '#10B981' }}>{record.present}</td>
                        <td style={{ padding: '12px', textAlign: 'center', color: '#EF4444' }}>{record.absent}</td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: '8px',
                            backgroundColor: record.rate >= 90 ? 'rgba(16,185,129,0.2)' : record.rate >= 75 ? 'rgba(245,158,11,0.2)' : 'rgba(239,68,68,0.2)',
                            color: record.rate >= 90 ? '#10B981' : record.rate >= 75 ? '#F59E0B' : '#EF4444',
                            padding: '4px 12px', borderRadius: '4px', fontWeight: '600'
                          }}>
                            {record.rate >= 90 ? <TrendingUp size={14} /> : record.rate >= 75 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                            {record.rate}%
                          </div>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'center' }}>
                          <span style={{
                            padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '600',
                            backgroundColor: record.rate >= 90 ? 'rgba(16,185,129,0.2)' : record.rate >= 75 ? 'rgba(245,158,11,0.2)' : 'rgba(239,68,68,0.2)',
                            color: record.rate >= 90 ? '#10B981' : record.rate >= 75 ? '#F59E0B' : '#EF4444'
                          }}>
                            {record.rate >= 90 ? (isRTL ? 'ممتاز' : 'Excellent') : record.rate >= 75 ? (isRTL ? 'جيد' : 'Good') : (isRTL ? 'يحتاج تحسين' : 'Needs Improvement')}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Selected Player Detail */}
        {selectedPlayer && activeTab === 'players' && (
          <div style={{
            marginTop: '24px', backgroundColor: '#0A0E1A', borderRadius: '12px', padding: '24px', border: '1px solid #00DCC830'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ color: '#EEEFEE', fontSize: '18px', fontWeight: '600', marginBottom: '4px' }}>
                  {players.find(p => p.id === selectedPlayer)?.name}
                </h3>
                <p style={{ color: '#9CA3AF', fontSize: '14px' }}>
                  {isRTL ? 'تفاصيل اللاعب' : 'Player Details'}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button style={{
                  padding: '10px 16px', backgroundColor: 'rgba(0,122,186,0.1)', border: '1px solid #007ABA',
                  borderRadius: '8px', color: '#007ABA', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                  fontFamily: "'Cairo', sans-serif"
                }}>
                  <BarChart3 size={16} /> {isRTL ? 'التحليل' : 'Analysis'}
                </button>
                <button 
                  onClick={() => { setShowEvaluationModal(true); setEvaluation({ ...evaluation, playerId: selectedPlayer }) }}
                  style={{
                    padding: '10px 16px', backgroundColor: 'rgba(0,220,200,0.1)', border: '1px solid #00DCC8',
                    borderRadius: '8px', color: '#00DCC8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                    fontFamily: "'Cairo', sans-serif"
                  }}>
                  <Edit3 size={16} /> {isRTL ? 'تقييم' : 'Evaluate'}
                </button>
                <button style={{
                  padding: '10px 16px', backgroundColor: 'rgba(16,185,129,0.1)', border: '1px solid #10B981',
                  borderRadius: '8px', color: '#10B981', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px',
                  fontFamily: "'Cairo', sans-serif"
                }}>
                  <MessageSquare size={16} /> {isRTL ? 'رسالة' : 'Message'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Training Modal */}
      {showTrainingModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{ backgroundColor: '#0A0E1A', borderRadius: '12px', padding: '24px', width: '100%', maxWidth: '500px', border: '1px solid #374151' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ color: '#EEEFEE', fontSize: '18px', fontWeight: '600' }}>{isRTL ? 'إضافة تدريب جديد' : 'Add New Training'}</h2>
              <button onClick={() => setShowTrainingModal(false)} style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ color: '#9CA3AF', fontSize: '12px', marginBottom: '4px', display: 'block' }}>{isRTL ? 'العنوان (عربي)' : 'Title (Arabic)'}</label>
                <input
                  type="text"
                  value={newTraining.title}
                  onChange={(e) => setNewTraining({ ...newTraining, title: e.target.value })}
                  placeholder={isRTL ? 'مثال: تمارين لياقة' : 'e.g., Fitness Training'}
                  style={{ width: '100%', padding: '10px 12px', backgroundColor: '#000A0F', border: '1px solid #374151', borderRadius: '6px', color: '#EEEFEE' }}
                />
              </div>
              <div>
                <label style={{ color: '#9CA3AF', fontSize: '12px', marginBottom: '4px', display: 'block' }}>{isRTL ? 'العنوان (إنجليزي)' : 'Title (English)'}</label>
                <input
                  type="text"
                  value={newTraining.titleEn}
                  onChange={(e) => setNewTraining({ ...newTraining, titleEn: e.target.value })}
                  placeholder={isRTL ? 'مثال: Fitness Training' : 'e.g., Fitness Training'}
                  style={{ width: '100%', padding: '10px 12px', backgroundColor: '#000A0F', border: '1px solid #374141', borderRadius: '6px', color: '#EEEFEE' }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ color: '#9CA3AF', fontSize: '12px', marginBottom: '4px', display: 'block' }}>{isRTL ? 'التاريخ' : 'Date'}</label>
                  <input
                    type="date"
                    value={newTraining.date}
                    onChange={(e) => setNewTraining({ ...newTraining, date: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', backgroundColor: '#000A0F', border: '1px solid #374151', borderRadius: '6px', color: '#EEEFEE' }}
                  />
                </div>
                <div>
                  <label style={{ color: '#9CA3AF', fontSize: '12px', marginBottom: '4px', display: 'block' }}>{isRTL ? 'الوقت' : 'Time'}</label>
                  <input
                    type="time"
                    value={newTraining.time}
                    onChange={(e) => setNewTraining({ ...newTraining, time: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', backgroundColor: '#000A0F', border: '1px solid #374151', borderRadius: '6px', color: '#EEEFEE' }}
                  />
                </div>
              </div>
              <button
                onClick={handleAddTraining}
                disabled={!newTraining.title || !newTraining.date || !newTraining.time}
                style={{
                  width: '100%', padding: '12px', backgroundColor: '#00DCC8', border: 'none', borderRadius: '8px',
                  color: '#000', fontWeight: '600', cursor: newTraining.title && newTraining.date && newTraining.time ? 'pointer' : 'not-allowed',
                  opacity: newTraining.title && newTraining.date && newTraining.time ? 1 : 0.5
                }}
              >
                {isRTL ? 'إضافة' : 'Add Training'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Evaluation Modal */}
      {showEvaluationModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{ backgroundColor: '#0A0E1A', borderRadius: '12px', padding: '24px', width: '100%', maxWidth: '500px', border: '1px solid #374151' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ color: '#EEEFEE', fontSize: '18px', fontWeight: '600' }}>{isRTL ? 'تقييم اللاعب' : 'Player Evaluation'}</h2>
              <button onClick={() => setShowEvaluationModal(false)} style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ color: '#9CA3AF', fontSize: '12px', marginBottom: '4px', display: 'block' }}>{isRTL ? 'اللاعب' : 'Player'}</label>
                <select
                  value={evaluation.playerId || ''}
                  onChange={(e) => setEvaluation({ ...evaluation, playerId: Number(e.target.value) })}
                  style={{ width: '100%', padding: '10px 12px', backgroundColor: '#000A0F', border: '1px solid #374151', borderRadius: '6px', color: '#EEEFEE' }}
                >
                  <option value="">{isRTL ? 'اختر لاعب' : 'Select player'}</option>
                  {players.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              {[
                { key: 'technical', label: isRTL ? 'تقني' : 'Technical', color: '#00DCC8' },
                { key: 'tactical', label: isRTL ? 'تكتيكي' : 'Tactical', color: '#007ABA' },
                { key: 'physical', label: isRTL ? 'بدني' : 'Physical', color: '#10B981' },
                { key: 'mental', label: isRTL ? 'ذهني' : 'Mental', color: '#F59E0B' },
              ].map(item => (
                <div key={item.key}>
                  <label style={{ color: '#9CA3AF', fontSize: '12px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                    <span>{item.label}</span>
                    <span style={{ color: item.color }}>{evaluation[item.key as keyof typeof evaluation]}%</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={evaluation[item.key as keyof typeof evaluation] ?? 0}
                    onChange={(e) => setEvaluation({ ...evaluation, [item.key]: Number(e.target.value) })}
                    style={{ width: '100%', accentColor: item.color }}
                  />
                </div>
              ))}
              <div>
                <label style={{ color: '#9CA3AF', fontSize: '12px', marginBottom: '4px', display: 'block' }}>{isRTL ? 'ملاحظات' : 'Notes'}</label>
                <textarea
                  value={evaluation.notes}
                  onChange={(e) => setEvaluation({ ...evaluation, notes: e.target.value })}
                  placeholder={isRTL ? 'أضف ملاحظات...' : 'Add notes...'}
                  rows={3}
                  style={{ width: '100%', padding: '10px 12px', backgroundColor: '#000A0F', border: '1px solid #374151', borderRadius: '6px', color: '#EEEFEE', resize: 'vertical' }}
                />
              </div>
              <button
                onClick={handleSubmitEvaluation}
                disabled={!evaluation.playerId}
                style={{
                  width: '100%', padding: '12px', backgroundColor: '#10B981', border: 'none', borderRadius: '8px',
                  color: '#fff', fontWeight: '600', cursor: evaluation.playerId ? 'pointer' : 'not-allowed',
                  opacity: evaluation.playerId ? 1 : 0.5
                }}
              >
                {isRTL ? 'حفظ التقييم' : 'Save Evaluation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Modal */}
      {selectedTrainingForAttendance && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{ backgroundColor: '#0A0E1A', borderRadius: '12px', padding: '24px', width: '100%', maxWidth: '400px', border: '1px solid #374151' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ color: '#EEEFEE', fontSize: '18px', fontWeight: '600' }}>{isRTL ? 'تسجيل الحضور' : 'Take Attendance'}</h2>
              <button onClick={() => setSelectedTrainingForAttendance(null)} style={{ background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {players.map(player => {
                const training = trainings.find(t => t.id === selectedTrainingForAttendance)
                const isAttending = training?.attendance.includes(player.id)
                return (
                  <div key={player.id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px',
                    backgroundColor: isAttending ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                    borderRadius: '8px', cursor: 'pointer', border: isAttending ? '1px solid #10B981' : '1px solid #EF4444'
                  }}
                    onClick={() => toggleAttendance(selectedTrainingForAttendance, player.id)}
                  >
                    <div style={{ color: '#EEEFEE', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#007ABA',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '600', fontSize: '12px'
                      }}>
                        {player.number}
                      </div>
                      <span>{player.name}</span>
                    </div>
                    {isAttending ? (
                      <Check size={20} color="#10B981" />
                    ) : (
                      <X size={20} color="#EF4444" />
                    )}
                  </div>
                )
              })}
            </div>
            <button
              onClick={() => setSelectedTrainingForAttendance(null)}
              style={{
                width: '100%', marginTop: '16px', padding: '12px', backgroundColor: '#374151', border: 'none',
                borderRadius: '8px', color: '#EEEFEE', fontWeight: '600', cursor: 'pointer'
              }}
            >
              {isRTL ? 'تم' : 'Done'}
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
