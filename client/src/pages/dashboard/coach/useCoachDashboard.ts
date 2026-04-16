/**
 * Custom hook for Coach Dashboard data fetching and state management
 */
import { useState, useEffect } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import type { Player, Training, Evaluation, NewTraining, GuideSession } from './types'

// VisualGuide
import { createFormationGuide } from '@/components/VisualGuide'

export function useCoachDashboard() {
  const { isRTL } = useLanguage()

  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'players' | 'training' | 'stats' | 'attendance'>('players')

  // VisualGuide State
  const [guideActive, setGuideActive] = useState(false)
  const [guideSession, setGuideSession] = useState<GuideSession | null>(null)
  const [showTrainingModal, setShowTrainingModal] = useState(false)
  const [showEvaluationModal, setShowEvaluationModal] = useState(false)
  const [selectedTrainingForAttendance, setSelectedTrainingForAttendance] = useState<number | null>(null)

  // Players Data (fetched from API)
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/players?sport=Football')
      .then(r => r.json())
      .then((data: Player[]) => {
        setPlayers(data)
        setLoading(false)
      })
      .catch((e: Error) => { setError(e.message); setLoading(false) })
  }, [])

  // Training Sessions (fetched from API)
  const [trainings, setTrainings] = useState<Training[]>([])
  const [trainingsLoading, setTrainingsLoading] = useState(true)
  const [trainingsError, setTrainingsError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/trainings')
      .then(r => { if (!r.ok) throw new Error('Failed to fetch trainings'); return r.json() })
      .then((data: Training[]) => {
        setTrainings(data)
        setTrainingsLoading(false)
      })
      .catch((e: Error) => { setTrainingsError(e.message); setTrainingsLoading(false) })
  }, [])

  // Attendance Records (derived from players API data)
  const attendanceRecords = players.map((p) => {
    const totalSessions = 20
    const present = Math.round((p.attendance / 100) * totalSessions)
    return {
      playerId: Number(p.id),
      present,
      absent: totalSessions - present,
      rate: p.attendance,
    }
  })

  // Stats Data for Charts
  const performanceData = players.map(p => ({
    name: p.name.substring(0, 3),
    performance: p.rating,
    attendance: p.attendance,
    goals: p.goals,
  }))

  const goalsData = [
    { name: 'أه', value: players.reduce((sum, p) => sum + p.goals, 0), color: '#00DCC8' },
    { name: 'against', value: players.reduce((sum, p) => sum + Math.floor(p.goals * 0.4), 0), color: '#EF4444' },
  ]

  const monthlyPerformance = players.length > 0
    ? [
        { month: 'يناير', performance: Math.round(players.reduce((s, p) => s + p.rating, 0) / players.length * 0.85), attendance: Math.round(players.reduce((s, p) => s + p.attendance, 0) / players.length * 0.95) },
        { month: 'فبراير', performance: Math.round(players.reduce((s, p) => s + p.rating, 0) / players.length * 0.88), attendance: Math.round(players.reduce((s, p) => s + p.attendance, 0) / players.length * 0.98) },
        { month: 'مارس', performance: Math.round(players.reduce((s, p) => s + p.rating, 0) / players.length * 0.94), attendance: Math.round(players.reduce((s, p) => s + p.attendance, 0) / players.length * 0.92) },
        { month: 'أبريل', performance: Math.round(players.reduce((s, p) => s + p.rating, 0) / players.length), attendance: Math.round(players.reduce((s, p) => s + p.attendance, 0) / players.length) },
      ]
    : []

  // New Training Form
  const [newTraining, setNewTraining] = useState<NewTraining>({ title: '', titleEn: '', date: '', time: '' })

  // Evaluation Form
  const [evaluation, setEvaluation] = useState<Evaluation>({
    playerId: null,
    technical: 0,
    tactical: 0,
    physical: 0,
    mental: 0,
    notes: '',
  })

  // Handle Add Training
  const handleAddTraining = () => {
    if (!newTraining.title || !newTraining.date || !newTraining.time) return
    const training: Training = {
      id: trainings.length + 1,
      title: newTraining.title,
      titleEn: newTraining.titleEn || newTraining.title,
      date: newTraining.date,
      time: newTraining.time,
      attendance: [],
      maxAttendance: 25,
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
  const toggleAttendance = (trainingId: number, playerId: string | number) => {
    setTrainings(trainings.map(t => {
      if (t.id === trainingId) {
        const hasAttendance = t.attendance.some(a => String(a) === String(playerId))
        return {
          ...t,
          attendance: hasAttendance
            ? t.attendance.filter(id => id !== playerId)
            : [...t.attendance, playerId],
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

  return {
    isRTL,
    selectedPlayer, setSelectedPlayer,
    activeTab, setActiveTab,
    guideActive, setGuideActive,
    guideSession, setGuideSession,
    showTrainingModal, setShowTrainingModal,
    showEvaluationModal, setShowEvaluationModal,
    selectedTrainingForAttendance, setSelectedTrainingForAttendance,
    players, loading, error,
    trainings, trainingsLoading, trainingsError,
    attendanceRecords,
    performanceData, goalsData, monthlyPerformance,
    newTraining, setNewTraining,
    evaluation, setEvaluation,
    handleAddTraining, startGuide, toggleAttendance, handleSubmitEvaluation,
    COLORS,
  }
}