import { useState, useEffect } from 'react'
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js'
import { Radar } from 'react-chartjs-2'
import { Share2, Star, MapPin, Trophy, Loader2, AlertCircle } from 'lucide-react'

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend)

interface Player {
  id: string
  name: string
  name_ar?: string
  age: number | null
  position: string | null
  photo_url: string | null
  jersey_number: number | null
  sport?: string
  region?: string
  rating?: number
  speed?: number
  agility?: number
  technique?: number
  badge?: string
  badge_color?: string
}

interface PlayerWithPassport {
  player: Player
  passport: {
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
  } | null
}

const FALLBACK_PLAYER: PlayerWithPassport = {
  player: { id: '0', name: 'لم يتم العثور على لاعب', age: null, position: null, photo_url: null, jersey_number: null },
  passport: null
}

function SportID() {
  const [data, setData] = useState<PlayerWithPassport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [allPlayers, setAllPlayers] = useState<Player[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)

  useEffect(() => {
    async function fetchPlayers() {
      try {
        const res = await fetch('/api/players')
        const json = await res.json()

        if (Array.isArray(json) && json.length > 0) {
          const players: Player[] = json
          setAllPlayers(players)
          selectPlayer(players[0])
        } else {
          setData(FALLBACK_PLAYER)
        }
      } catch (err) {
        console.error('[SportID] Fetch error:', err)
        setError('فشل في تحميل البيانات')
        setData(FALLBACK_PLAYER)
      } finally {
        setLoading(false)
      }
    }
    fetchPlayers()
  }, [])

  function selectPlayer(player: Player) {
    const speed = player.speed || 0
    const agility = player.agility || 0
    const technique = player.technique || 0
    const rating = player.rating || 50

    setData({
      player,
      passport: {
        overall_score: rating,
        pace_score: speed,
        shooting_score: Math.round(technique * 0.9),
        passing_score: technique,
        dribbling_score: agility,
        defending_score: Math.round(rating * 0.4),
        physical_score: Math.round((speed + agility) / 2),
        total_matches: 0,
        total_goals: 0,
        total_assists: 0
      }
    })
  }

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
    responsive: true,
    scales: {
      r: {
        min: 0,
        max: 100,
        ticks: { stepSize: 20, display: false },
        grid: { color: 'rgba(255,255,255,0.1)' },
        angleLines: { color: 'rgba(255,255,255,0.1)' },
        pointLabels: { color: '#fff', font: { size: 11 } }
      }
    },
    plugins: { legend: { display: false } }
  }

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <Loader2 className="w-12 h-12 text-[#00d4ff] animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-l from-[#00d4ff]/20 to-transparent border-b border-[#00d4ff]/20 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#00d4ff]">SPORT ID</h1>
            <p className="text-gray-400 text-sm">منصة تحليل المواهب الرياضية</p>
          </div>
          <div className="flex gap-2">
            {allPlayers.slice(0, 5).map((p, i) => (
              <button
                key={p.id}
                onClick={() => { setSelectedIndex(i); selectPlayer(p); }}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  selectedIndex === i ? 'bg-[#00d4ff] text-black' : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {p.name?.charAt(0)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="bg-red-500/20 border border-red-500/40 rounded-lg px-4 py-2 flex items-center gap-2 text-red-400">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        </div>
      )}

      {data && (
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Player Card */}
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <div className="w-24 h-24 bg-gradient-to-br from-[#00d4ff] to-[#d4af37] rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <span className="text-4xl font-bold text-black">
                  {data.player.name?.charAt(0) || '?'}
                </span>
              </div>
              <h2 className="text-xl font-bold text-center mb-1">
                {data.player.name_ar || data.player.name}
              </h2>
              <p className="text-gray-400 text-center text-sm mb-4">{data.player.name}</p>

              <div className="space-y-3">
                <div className="flex justify-between"><span className="text-gray-400">العمر</span><span className="font-semibold">{data.player.age || '—'}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">المركز</span><span className="font-semibold">{data.player.position || '—'}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">التقييم</span><span className="font-bold text-[#d4af37]">{data.player.rating || 0}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">الرياضة</span><span className="font-semibold">{data.player.sport || '—'}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">المنطقة</span><span className="font-semibold flex items-center gap-1"><MapPin className="w-3 h-3"/>{data.player.region || '—'}</span></div>
                {data.player.badge && (
                  <div className="mt-3 pt-3 border-t border-white/10 text-center">
                    <span className="text-xs px-3 py-1 rounded-full" style={{ backgroundColor: data.player.badge_color + '30', color: data.player.badge_color }}>
                      {data.player.badge}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Radar Chart */}
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10 flex flex-col items-center">
              <h3 className="text-lg font-bold mb-4">التقييم التفصيلي</h3>
              <Radar data={radarData} options={radarOptions as any} className="w-full max-w-sm" />
              {data.passport && (
                <div className="mt-4 bg-[#d4af37]/10 rounded-xl px-4 py-2">
                  <span className="text-[#d4af37] font-bold text-lg">التقييم العام: {data.passport.overall_score}</span>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Trophy className="w-5 h-5 text-[#d4af37]"/>الإحصائيات</h3>
              {data.passport ? (
                <div className="space-y-4">
                  <div className="bg-white/5 rounded-xl p-4 text-center">
                    <p className="text-3xl font-bold text-[#00d4ff]">{data.passport.total_matches}</p>
                    <p className="text-gray-400 text-sm">مباريات</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/5 rounded-xl p-3 text-center">
                      <p className="text-xl font-bold text-[#d4af37]">{data.passport.total_goals}</p>
                      <p className="text-gray-400 text-xs">أهداف</p>
                    </div>
                    <div className="bg-white/5 rounded-xl p-3 text-center">
                      <p className="text-xl font-bold text-[#00d4ff]">{data.passport.total_assists}</p>
                      <p className="text-gray-400 text-xs">تمريرات</p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">لا توجد إحصائيات</p>
              )}
            </div>
          </div>

          {/* Player Selector */}
          {allPlayers.length > 1 && (
            <div className="mt-8">
              <h3 className="text-lg font-bold mb-4">اللاعبون ({allPlayers.length})</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {allPlayers.map((p, i) => (
                  <button
                    key={p.id}
                    onClick={() => { setSelectedIndex(i); selectPlayer(p); }}
                    className={`p-3 rounded-xl text-center transition-all ${
                      selectedIndex === i
                        ? 'bg-[#00d4ff]/20 border border-[#00d4ff]'
                        : 'bg-white/5 border border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-[#00d4ff] to-[#d4af37] rounded-full mx-auto mb-2 flex items-center justify-center text-lg font-bold text-black">
                      {p.name?.charAt(0)}
                    </div>
                    <p className="text-sm font-semibold truncate">{p.name_ar || p.name}</p>
                    <p className="text-xs text-gray-400">{p.position} · {p.rating || 0}</p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default SportID
