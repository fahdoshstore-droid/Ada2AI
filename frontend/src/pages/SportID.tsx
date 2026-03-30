import { useState } from 'react'
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js'
import { Radar } from 'react-chartjs-2'
import { Share2, Printer, Star, MapPin, Calendar, Trophy } from 'lucide-react'

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend)

const mockPlayer = {
  name: 'أحمد الشمراني',
  nameEn: 'Ahmed Al-Shamrani',
  position: 'وسط ميداني',
  team: 'الاتحاد',
  age: 16,
  city: 'جدة',
  overall: 87,
  stats: {
    speed: 90, acceleration: 85, agility: 88,
    tactical: 80, stamina: 82, technique: 86
  }
}

function SportID() {
  const [player] = useState(mockPlayer)

  const radarData = {
    labels: ['السرعة', 'التسارع', 'الرشاقة', 'التكتيك', 'التحمل', 'التقنية'],
    datasets: [{
      label: 'التقييم',
      data: [player.stats.speed, player.stats.acceleration, player.stats.agility, player.stats.tactical, player.stats.stamina, player.stats.technique],
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
          <div className={`w-24 h-24 rounded-2xl bg-gradient-to-br ${getRatingColor(player.overall)} flex items-center justify-center flex-shrink-0`}>
            <span className="text-4xl font-black text-[#041329]">{player.overall}</span>
          </div>

          {/* Player Info */}
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white">{player.name}</h2>
            <p className="text-[#00d4ff] text-sm">{player.nameEn}</p>
            <div className="flex items-center gap-4 mt-2 text-gray-400 text-sm">
              <span className="flex items-center gap-1"><Trophy className="w-4 h-4 text-[#d4af37]" />{player.team}</span>
              <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{player.city}</span>
              <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{player.age} سنة</span>
            </div>
            <span className="inline-block mt-2 px-3 py-1 bg-[#00d4ff]/10 border border-[#00d4ff]/30 rounded-full text-[#00d4ff] text-xs">{player.position}</span>
          </div>
        </div>

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
        <div className="px-6 pb-6">
          <div className="grid grid-cols-3 gap-3">
            {Object.entries(player.stats).map(([key, value]) => {
              const labels: Record<string, string> = {
                speed: 'السرعة', acceleration: 'التسارع', agility: 'الرشاقة',
                tactical: 'التكتيك', stamina: 'التحمل', technique: 'التقنية'
              }
              return (
                <div key={key} className="bg-[#041329]/50 rounded-xl p-3 text-center border border-[#00d4ff]/10">
                  <div className="text-2xl font-bold text-[#00d4ff]">{value}</div>
                  <div className="text-xs text-gray-400 mt-1">{labels[key]}</div>
                </div>
              )
            })}
          </div>
        </div>

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
