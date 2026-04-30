import { useState, useEffect } from 'react'
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js'
import { Radar } from 'react-chartjs-2'
import { Share2, Printer, Star, MapPin, Calendar, Trophy, Loader2, AlertCircle } from 'lucide-react'

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend)

// ─── Types ───
interface Player {
  id: number
  name: string
  name_ar?: string
  age: number | null
  team: string | null
  position: string | null
  photo_url: string | null
  jersey_number: number | null
  nationality: string | null
  dominant_foot: string | null
}

interface SportPassport {
  id: number
  player_id: number
  overall_score: number
  pace_score: number
  shooting_score: number
  passing_score: number
  dribbling_score: number
  defending_score: number
  physical_score: number
  total_matches: number
  total_goals: number
  total_assists: number
}

interface PlayerWithPassport {
  player: Player
  passport: SportPassport | null
}

const MOCK_PLAYER: PlayerWithPassport = {
  player: {
    id: 1,
    name: 'أحمد المحمدي',
    age: 23,
    team: 'النصر',
    position: 'وسط مهاجم',
    photo_url: null,
    jersey_number: 10,
    nationality: 'سعودي',
    dominant_foot: 'right'
  },
  passport: {
    id: 1,
    player_id: 1,
    overall_score: 86,
    pace_score: 88,
    shooting_score: 82,
    passing_score: 92,
    dribbling_score: 85,
    defending_score: 45,
    physical_score: 79,
    total_matches: 47,
    total_goals: 23,
    total_assists: 18
  }
}

const FALLBACK_PLAYER: PlayerWithPassport = {
  player: {
    id: 0,
    name: 'لم يتم العثور على لاعب',
    age: null,
    team: null,
    position: null,
    photo_url: null,
    jersey_number: null,
    nationality: null,
    dominant_foot: null
  },
  passport: null
}

function SportID() {
  const [data, setData] = useState<PlayerWithPassport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchPlayer() {
      try {
        const res = await fetch('/api/sportid/players')
        const json = await res.json()

        if (json.success && json.data?.length > 0) {
          // Fetch full details + passport for first player
          const playerId = json.data[0].id
          const detailRes = await fetch(`/api/sportid/players/${playerId}`)
          const detailJson = await detailRes.json()

          if (detailJson.success) {
            setData(detailJson.data)
          } else {
            // Use list data with minimal passport
            setData({
              player: json.data[0],
              passport: null
            })
          }
        } else {
          // No data — use mock for demo
          setData(MOCK_PLAYER)
        }
      } catch (err) {
        console.error('[SportID] Fetch error:', err)
        // Fallback to mock on network error
        setData(MOCK_PLAYER)
      } finally {
        setLoading(false)
      }
    }

    fetchPlayer()
  }, [])

  const radarData = {
    labels: ['السرعة', 'التسريع', 'الرشاقة', 'التكتيك', 'التحمل', 'التقنية'],
    datasets: [{
      label: 'التقييم',
      data: data?.passport
        ? [
            data.passport.pace_score,
            Math.round(data.passport.pace_score * 0.94),
            Math.round(data.passport.pace_score * 0.97),
            data.passport.passing_score,
            data.passport.physical_score,
            data.passport.dribbling_score
          ]
        : [0, 0, 0, 0, 0, 0],
      backgroundColor: 'rgba(0, 212, 255, 0.15)',
      borderColor: '#00d4ff',
      borderWidth: 2,
      pointBackgroundColor: '#d4af37',
      pointBorderColor: '#d4af37',
      pointRadius: 4,
    }]
  }

  const radarOptions = {
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        ticks: { display: false },
        grid: { color: 'rgba(0, 212, 255, 0.1)' },
        angleLines: { color: 'rgba(0, 212, 255, 0.1)' },
        pointLabels: { color: '#a8b4c4', font: { family: 'Cairo', size: 12 } }
      }
    },
    plugins: { legend: { display: false } },
    responsive: true,
    maintainAspectRatio: true,
  }

  const getRatingColor = (rating: number) => {
    if (rating >= 85) return 'from-[#d4af37] to-[#e8c84a]'
    if (rating >= 70) return 'from-[#00d4ff] to-[#33ddff]'
    return 'from-gray-400 to-gray-500'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-[#00d4ff]" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px] gap-2 text-red-400">
        <AlertCircle className="w-5 h-5" />
        <span>حدث خطأ في تحميل البيانات</span>
      </div>
    )
  }

  const { player, passport } = data
  const overall = passport?.overall_score ?? 0

  return (
    <div className="max-w-2xl mx-auto" dir="rtl">
      <h1 className="text-3xl font-bold mb-6">
        <span className="bg-gradient-to-r from-[#d4af37] to-[#e8c84a] bg-clip-text text-transparent">الهوية الرياضية</span>
      </h1>

      {/* Player Card */}
      <div className="bg-[#0a1f3d]/50 backdrop-blur-xl border border-[#00d4ff]/15 rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0a1f3d] to-[#041329] p-6 flex items-center gap-6">
          {/* Overall Rating */}
          <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${getRatingColor(overall)} flex items-center justify-center flex-shrink-0`}>
            <span className="text-4xl font-black text-[#041329]">{overall || '—'}</span>
          </div>

          {/* Player Info */}
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white">{player.name}</h2>
            {player.name_ar && player.name !== player.name_ar && (
              <p className="text-[#00d4ff] text-sm">{player.name_ar}</p>
            )}
            <div className="flex items-center gap-4 mt-2 text-gray-400 text-sm">
              {player.team && <span className="flex items-center gap-1"><Trophy className="w-4 h-4 text-[#d4af37]" />{player.team}</span>}
              {player.nationality && <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{player.nationality}</span>}
              {player.age && <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{player.age} سنة</span>}
            </div>
            {player.position && (
              <span className="inline-block mt-2 px-3 py-1 bg-[#00d4ff]/10 border border-[#00d4ff]/30 rounded-full text-[#00d4ff] text-xs">{player.position}</span>
            )}
          </div>
        </div>

        {/* Stats Summary */}
        {passport && (
          <div className="px-6 py-3 border-t border-[#00d4ff]/10 bg-[#041329]/30">
            <div className="flex flex-wrap gap-4 text-xs text-gray-400">
              <span>المباريات: <strong className="text-white">{passport.total_matches}</strong></span>
              <span>الأهداف: <strong className="text-white">{passport.total_goals}</strong></span>
              <span>التمريرات: <strong className="text-white">{passport.total_assists}</strong></span>
              {passport.dominant_foot && <span>القدم: <strong className="text-white">{passport.dominant_foot === 'right' ? 'اليمنى' : passport.dominant_foot === 'left' ? 'اليسرى' : passport.dominant_foot}</strong></span>}
            </div>
          </div>
        )}

        {/* Radar Chart */}
        <div className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-[#d4af37]" />
            مخطط القدرات
          </h3>
          <div className="max-w-sm mx-auto">
            <Radar data={radarData} options={radarOptions} />
          </div>
        </div>

        {/* Stats Grid */}
        {passport && (
          <div className="px-6 pb-6">
            <div className="grid grid-cols-3 gap-3">
              {[
                { key: 'pace_score', label: 'السرعة', value: passport.pace_score },
                { key: 'passing_score', label: 'التمرير', value: passport.passing_score },
                { key: 'dribbling_score', label: 'المراوغة', value: passport.dribbling_score },
                { key: 'shooting_score', label: 'التسديد', value: passport.shooting_score },
                { key: 'physical_score', label: 'اللياقة', value: passport.physical_score },
                { key: 'defending_score', label: 'الدفاع', value: passport.defending_score },
              ].map(({ key, label, value }) => (
                <div key={key} className="bg-[#041329]/50 rounded-xl p-3 text-center border border-[#00d4ff]/10">
                  <div className="text-2xl font-bold text-[#00d4ff]">{value}</div>
                  <div className="text-xs text-gray-400 mt-1">{label}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="px-6 pb-6 flex gap-3">
          <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-[#d4af37] to-[#e8c84a] rounded-xl text-[#041329] font-bold hover:opacity-90 transition">
            <Share2 className="w-5 h-5" /> مشاركة
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#00d4ff]/10 border border-[#00d4ff]/30 rounded-xl text-[#00d4ff] font-bold hover:bg-[#00d4ff]/20 transition">
            <Printer className="w-5 h-5" /> طباعة
          </button>
        </div>
      </div>
    </div>
  )
}

export default SportID
