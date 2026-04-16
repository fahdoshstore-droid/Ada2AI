/**
 * CoachDashboard - Coach tools and player management
 * Features: Players, Training, Stats Charts, Attendance, Evaluation
 * 
 * This is a thin orchestrator that composes extracted sub-components.
 * See ./coach/ for individual components.
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