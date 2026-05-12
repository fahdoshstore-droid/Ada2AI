/**
 * CoachDashboard - Coach tools and player management
 * Features: Players, Training, Stats Charts, Attendance, Evaluation
 * 
 * This is a thin orchestrator that composes extracted sub-components.
 * See ./coach/ for individual components.
 * 
 * REFACTORED: All data comes from Supabase via useCoachDashboard()
 */
import React from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import BackButton from '@/components/BackButton'
import {
  CoachDashboardHeader,
  CoachDashboardTabs,
  PlayersTab,
  TrainingTab,
  StatsTab,
  AttendanceTab,
  PlayerDetailPanel,
  TrainingModal,
  EvaluationModal,
  AttendanceModal,
  useCoachDashboard,
} from './coach'

export default function CoachDashboard() {
  const {
    isRTL,
    selectedPlayer, setSelectedPlayer,
    activeTab, setActiveTab,
    showTrainingModal, setShowTrainingModal,
    showEvaluationModal, setShowEvaluationModal,
    selectedTrainingForAttendance, setSelectedTrainingForAttendance,
    players, loading, error,
    trainings,
    attendanceRecords,
    performanceData, goalsData, monthlyPerformance,
    newTraining, setNewTraining,
    evaluation, setEvaluation,
    handleAddTraining, toggleAttendance, handleSubmitEvaluation,
    matches,
  } = useCoachDashboard()

  if (loading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    </DashboardLayout>
  )

  if (error) return (
    <DashboardLayout>
      <div className="text-red-500 text-center p-8">Error: {error}</div>
    </DashboardLayout>
  )

  // ─── Upcoming Matches (from Supabase) ─────────────────────────────────
  const upcomingMatches = (matches || []).filter((m: any) => {
    if (!m.match_date) return false
    return new Date(m.match_date) >= new Date()
  }).sort((a: any, b: any) => new Date(a.match_date).getTime() - new Date(b.match_date).getTime())

  // ─── Recent Evaluations (derived from player data) ────────────────────
  const recentEvaluations = players
    .filter(p => (p.technical ?? 0) > 0 || (p.tactical ?? 0) > 0 || (p.physical ?? 0) > 0 || (p.mental ?? 0) > 0)
    .slice(0, 5)
    .map(p => ({
      playerId: p.id,
      playerName: p.name,
      overall: p.rating,
      technical: p.technical || 0,
      tactical: p.tactical || 0,
      physical: p.physical || 0,
      mental: p.mental || 0,
    }))

  return (
    <DashboardLayout>
      <div>
        <BackButton fallbackRoute="/dashboards" />
        <CoachDashboardHeader />
        <CoachDashboardTabs activeTab={activeTab} setActiveTab={setActiveTab} isRTL={isRTL} />

        {/* Players Tab */}
        {activeTab === 'players' && (
          <PlayersTab
            players={players}
            selectedPlayer={selectedPlayer}
            setSelectedPlayer={setSelectedPlayer}
            isRTL={isRTL}
            setShowTrainingModal={setShowTrainingModal}
            setShowEvaluationModal={setShowEvaluationModal}
            evaluation={evaluation}
            setEvaluation={setEvaluation}
          />
        )}

        {/* Training Tab */}
        {activeTab === 'training' && (
          <TrainingTab
            trainings={trainings}
            players={players}
            isRTL={isRTL}
            setShowTrainingModal={setShowTrainingModal}
            setSelectedTrainingForAttendance={setSelectedTrainingForAttendance}
          />
        )}

        {/* Stats Tab */}
        {activeTab === 'stats' && (
          <StatsTab
            performanceData={performanceData}
            goalsData={goalsData}
            monthlyPerformance={monthlyPerformance}
            isRTL={isRTL}
          />
        )}

        {/* Attendance Tab */}
        {activeTab === 'attendance' && (
          <AttendanceTab
            attendanceRecords={attendanceRecords}
            players={players}
            isRTL={isRTL}
          />
        )}

        {/* Upcoming Matches Section */}
        {upcomingMatches.length > 0 && (
          <div style={{
            marginTop: '24px', backgroundColor: '#0A0E1A', borderRadius: '12px',
            padding: '24px', border: '1px solid #1F2937',
          }}>
            <h2 style={{ color: '#EEEFEE', fontSize: '18px', fontWeight: '600', marginBottom: '16px', fontFamily: "'Cairo', sans-serif" }}>
              {isRTL ? 'المباريات القادمة' : 'Upcoming Matches'}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {upcomingMatches.slice(0, 5).map((match: any) => (
                <div key={match.id} style={{
                  padding: '16px', backgroundColor: 'rgba(255,255,255,0.02)',
                  borderRadius: '8px', border: '1px solid #374151',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <div>
                    <div style={{ color: '#EEEFEE', fontWeight: '600' }}>
                      {match.opponent || (isRTL ? 'منافس' : 'Opponent')}
                    </div>
                    <div style={{ color: '#9CA3AF', fontSize: '12px' }}>
                      {match.match_date && new Date(match.match_date).toLocaleDateString('ar-SA')}
                      {match.venue ? ` • ${match.venue}` : ''}
                    </div>
                  </div>
                  <div style={{
                    backgroundColor: 'rgba(0,220,200,0.1)', color: '#00DCC8',
                    padding: '4px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: '600',
                  }}>
                    {match.status || (isRTL ? 'قادمة' : 'Upcoming')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Evaluations Section */}
        {recentEvaluations.length > 0 && activeTab === 'players' && (
          <div style={{
            marginTop: '24px', backgroundColor: '#0A0E1A', borderRadius: '12px',
            padding: '24px', border: '1px solid #1F2937',
          }}>
            <h2 style={{ color: '#EEEFEE', fontSize: '18px', fontWeight: '600', marginBottom: '16px', fontFamily: "'Cairo', sans-serif" }}>
              {isRTL ? 'أحدث التقييمات' : 'Recent Evaluations'}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {recentEvaluations.map((ev) => (
                <div key={ev.playerId} style={{
                  padding: '16px', backgroundColor: 'rgba(255,255,255,0.02)',
                  borderRadius: '8px', border: '1px solid #374151',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <div>
                    <div style={{ color: '#EEEFEE', fontWeight: '600' }}>{ev.playerName}</div>
                    <div style={{ color: '#9CA3AF', fontSize: '12px' }}>
                      {isRTL ? 'تقني' : 'TEC'}: {ev.technical} · {isRTL ? 'تكتيكي' : 'TAC'}: {ev.tactical} · {isRTL ? 'بدني' : 'PHY'}: {ev.physical} · {isRTL ? 'ذهني' : 'MEN'}: {ev.mental}
                    </div>
                  </div>
                  <div style={{
                    backgroundColor: ev.overall >= 80 ? 'rgba(0,220,200,0.2)' : ev.overall >= 60 ? 'rgba(245,158,11,0.2)' : 'rgba(239,68,68,0.2)',
                    color: ev.overall >= 80 ? '#00DCC8' : ev.overall >= 60 ? '#F59E0B' : '#EF4444',
                    padding: '4px 12px', borderRadius: '4px', fontSize: '14px', fontWeight: '700',
                    fontFamily: "'Orbitron', sans-serif",
                  }}>
                    {ev.overall}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Training Invitations Note */}
        <div style={{
          marginTop: '24px', backgroundColor: 'rgba(139,92,246,0.06)', borderRadius: '12px',
          padding: '20px', border: '1px solid rgba(139,92,246,0.15)',
          display: 'flex', alignItems: 'center', gap: '12px',
        }}>
          <div style={{ color: '#8B5CF6', fontSize: '14px' }}>
            {isRTL ? '📋 دعوات التدريب ستتوفر قريباً - يتم تطوير هذه الميزة' : '📋 Training Invitations coming soon — this feature is under development'}
          </div>
        </div>

        {/* Selected Player Detail */}
        {selectedPlayer && activeTab === 'players' && (
          <PlayerDetailPanel
            selectedPlayer={selectedPlayer}
            players={players}
            isRTL={isRTL}
            setShowEvaluationModal={setShowEvaluationModal}
            evaluation={evaluation}
            setEvaluation={setEvaluation}
          />
        )}
      </div>

      {/* Training Modal */}
      <TrainingModal
        show={showTrainingModal}
        isRTL={isRTL}
        newTraining={newTraining}
        setNewTraining={setNewTraining}
        onClose={() => setShowTrainingModal(false)}
        onSubmit={handleAddTraining}
      />

      {/* Evaluation Modal */}
      <EvaluationModal
        show={showEvaluationModal}
        isRTL={isRTL}
        evaluation={evaluation}
        setEvaluation={setEvaluation}
        players={players}
        onClose={() => setShowEvaluationModal(false)}
        onSubmit={handleSubmitEvaluation}
      />

      {/* Attendance Modal */}
      <AttendanceModal
        selectedTrainingForAttendance={selectedTrainingForAttendance}
        players={players}
        trainings={trainings}
        isRTL={isRTL}
        onClose={() => setSelectedTrainingForAttendance(null)}
        toggleAttendance={toggleAttendance}
      />
    </DashboardLayout>
  )
}