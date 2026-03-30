import { useState } from 'react'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js'
import { Bar } from 'react-chartjs-2'
import { Trophy, Medal, TrendingUp, TrendingDown, Minus, Filter } from 'lucide-react'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

const mockRankings = [
  { rank: 1, name: 'أحمد الشمراني', team: 'الاتحاد', position: 'وسط', rating: 87, trend: 'up', region: 'غرب' },
  { rank: 2, name: 'سعود الدوسري', team: 'الهلال', position: 'حارس', rating: 85, trend: 'up', region: 'وسط' },
  { rank: 3, name: 'محمد الغامدي', team: 'الاتفاق', position: 'وسط', rating: 81, trend: 'same', region: 'شرق' },
  { rank: 4, name: 'خالد العتيبي', team: 'النصر', position: 'مهاجم', rating: 82, trend: 'up', region: 'وسط' },
  { rank: 5, name: 'فهد القحطاني', team: 'الأهلي', position: 'مدافع', rating: 79, trend: 'down', region: 'غرب' },
  { rank: 6, name: 'عبدالله الشهري', team: 'الشباب', position: 'جناح', rating: 76, trend: 'down', region: 'وسط' },
  { rank: 7, name: 'يوسف الحربي', team: 'الفتح', position: 'مهاجم', rating: 75, trend: 'up', region: 'شرق' },
  { rank: 8, name: 'ناصر المالكي', team: 'الرائد', position: 'مدافع', rating: 74, trend: 'same', region: 'وسط' },
  { rank: 9, name: 'تركي السبيعي', team: 'التعاون', position: 'وسط', rating: 73, trend: 'up', region: 'وسط' },
  { rank: 10, name: 'بدر الزهراني', team: 'الحزم', position: 'جناح', rating: 72, trend: 'down', region: 'وسط' },
]

function Rankings() {
  const [posFilter, setPosFilter] = useState('الكل')
  const positions = ['الكل', 'حارس', 'مدافع', 'وسط', 'جناح', 'مهاجم']

  const filtered = mockRankings.filter(p => posFilter === 'الكل' || p.position === posFilter)
  const top3 = filtered.slice(0, 3)

  const barData = {
    labels: ['90+', '80-89', '70-79', '60-69', '< 60'],
    datasets: [{
      label: 'عدد اللاعبين',
      data: [1, 3, 4, 2, 0],
      backgroundColor: ['#d4af37', '#00d4ff', '#00d4ff80', '#0a1f3d', '#041329'],
      borderColor: ['#d4af37', '#00d4ff', '#00d4ff', '#00d4ff30', '#00d4ff15'],
      borderWidth: 1,
      borderRadius: 8,
    }]
  }

  const barOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      x: { ticks: { color: '#a8b4c4', font: { family: 'Cairo' } }, grid: { display: false } },
      y: { ticks: { color: '#a8b4c4', stepSize: 1 }, grid: { color: 'rgba(0, 212, 255, 0.05)' } }
    }
  }

  const trendIcon = (t: string) => {
    if (t === 'up') return <TrendingUp className="w-4 h-4 text-[#d4af37]" />
    if (t === 'down') return <TrendingDown className="w-4 h-4 text-red-400" />
    return <Minus className="w-4 h-4 text-gray-500" />
  }

  const podiumColors = ['from-[#d4af37] to-[#e8c84a]', 'from-gray-300 to-gray-400', 'from-amber-600 to-amber-700']
  const podiumHeights = ['h-32', 'h-24', 'h-20']
  const podiumOrder = [1, 0, 2]

  return (
    <div className="max-w-5xl mx-auto space-y-6" dir="rtl">
      <h1 className="text-3xl font-bold">
        <span className="bg-gradient-to-r from-[#d4af37] to-[#e8c84a] bg-clip-text text-transparent">ترتيب المواهب</span>
      </h1>

      {/* Podium */}
      {top3.length >= 3 && (
        <div className="bg-[#0a1f3d]/50 backdrop-blur-xl border border-[#00d4ff]/10 rounded-2xl p-8">
          <div className="flex items-end justify-center gap-4">
            {podiumOrder.map(idx => {
              const p = top3[idx]
              if (!p) return null
              return (
                <div key={idx} className="flex flex-col items-center">
                  <div className="text-center mb-3">
                    <div className="text-white font-bold text-sm">{p.name}</div>
                    <div className="text-gray-400 text-xs">{p.team}</div>
                    <div className={`mt-1 inline-block px-3 py-1 rounded-full bg-gradient-to-r ${podiumColors[idx]} text-[#041329] text-sm font-black`}>
                      {p.rating}
                    </div>
                  </div>
                  <div className={`w-24 ${podiumHeights[idx]} bg-gradient-to-t ${podiumColors[idx]} rounded-t-xl flex items-start justify-center pt-3`}>
                    {idx === 0 ? <Trophy className="w-8 h-8 text-[#041329]" /> : <Medal className="w-6 h-6 text-[#041329]" />}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <Filter className="w-5 h-5 text-gray-400" />
        {positions.map(pos => (
          <button key={pos} onClick={() => setPosFilter(pos)}
            className={`px-4 py-2 rounded-xl text-sm transition ${posFilter === pos ? 'bg-[#00d4ff]/20 border border-[#00d4ff]/30 text-[#00d4ff]' : 'bg-[#0a1f3d]/50 border border-[#00d4ff]/10 text-gray-400 hover:bg-white/5'}`}>
            {pos}
          </button>
        ))}
      </div>

      {/* Rankings Table */}
      <div className="bg-[#0a1f3d]/50 backdrop-blur-xl border border-[#00d4ff]/10 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-gray-400 border-b border-[#00d4ff]/10 bg-[#041329]/50">
              <th className="text-right p-4">#</th>
              <th className="text-right p-4">اللاعب</th>
              <th className="text-right p-4">النادي</th>
              <th className="text-right p-4">المركز</th>
              <th className="text-right p-4">المنطقة</th>
              <th className="text-right p-4">التقييم</th>
              <th className="text-right p-4">الاتجاه</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p, i) => (
              <tr key={i} className="border-b border-[#00d4ff]/5 hover:bg-white/5 transition">
                <td className="p-4">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${p.rank <= 3 ? 'bg-gradient-to-r from-[#d4af37] to-[#e8c84a] text-[#041329]' : 'bg-[#041329] text-gray-400 border border-[#00d4ff]/10'}`}>
                    {p.rank}
                  </span>
                </td>
                <td className="p-4 font-medium text-white">{p.name}</td>
                <td className="p-4 text-gray-400">{p.team}</td>
                <td className="p-4"><span className="px-2 py-1 bg-[#00d4ff]/10 border border-[#00d4ff]/20 rounded-full text-[#00d4ff] text-xs">{p.position}</span></td>
                <td className="p-4 text-gray-400">{p.region}</td>
                <td className="p-4"><span className="text-[#d4af37] font-bold text-lg">{p.rating}</span></td>
                <td className="p-4">{trendIcon(p.trend)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Distribution Chart */}
      <div className="bg-[#0a1f3d]/50 backdrop-blur-xl border border-[#00d4ff]/10 rounded-xl p-5">
        <h3 className="text-lg font-semibold text-white mb-4">توزيع التقييمات</h3>
        <Bar data={barData} options={barOptions} />
      </div>
    </div>
  )
}

export default Rankings
