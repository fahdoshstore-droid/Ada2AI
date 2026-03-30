import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler } from 'chart.js'
import { Line } from 'react-chartjs-2'
import { Users, TrendingUp, Star, Calendar, Plus, FileText, ClipboardList, Trophy } from 'lucide-react'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler)

const mockTeam = {
  name: 'أكاديمية الاتحاد',
  totalPlayers: 24,
  avgRating: 78,
  topPerformer: 'أحمد الشمراني',
}

const mockPlayers = [
  { name: 'أحمد الشمراني', position: 'وسط', rating: 87, status: 'جاهز', trend: '+3' },
  { name: 'خالد العتيبي', position: 'مهاجم', rating: 82, status: 'جاهز', trend: '+1' },
  { name: 'فهد القحطاني', position: 'مدافع', rating: 79, status: 'مصاب', trend: '-2' },
  { name: 'سعود الدوسري', position: 'حارس', rating: 85, status: 'جاهز', trend: '+5' },
  { name: 'عبدالله الشهري', position: 'جناح', rating: 76, status: 'إيقاف', trend: '0' },
]

const mockSchedule = [
  { day: 'الأحد', time: '16:00', type: 'تدريب لياقة', color: '#00d4ff' },
  { day: 'الاثنين', time: '17:00', type: 'تدريب تكتيكي', color: '#d4af37' },
  { day: 'الأربعاء', time: '16:30', type: 'مباراة ودية', color: '#ef4444' },
  { day: 'الخميس', time: '15:00', type: 'تدريب مهاري', color: '#00d4ff' },
]

function CoachDashboard() {
  const lineData = {
    labels: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'],
    datasets: [{
      label: 'متوسط التقييم',
      data: [72, 74, 73, 76, 78, 78],
      borderColor: '#00d4ff',
      backgroundColor: 'rgba(0, 212, 255, 0.1)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#d4af37',
      pointRadius: 5,
    }]
  }

  const lineOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      x: { ticks: { color: '#a8b4c4', font: { family: 'Cairo' } }, grid: { color: 'rgba(0, 212, 255, 0.05)' } },
      y: { ticks: { color: '#a8b4c4' }, grid: { color: 'rgba(0, 212, 255, 0.05)' }, min: 60, max: 100 }
    }
  }

  const statusColor = (s: string) => {
    if (s === 'جاهز') return 'text-[#00d4ff] bg-[#00d4ff]/10 border-[#00d4ff]/30'
    if (s === 'مصاب') return 'text-red-400 bg-red-400/10 border-red-400/30'
    return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30'
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6" dir="rtl">
      <h1 className="text-3xl font-bold">
        <span className="bg-gradient-to-r from-[#d4af37] to-[#e8c84a] bg-clip-text text-transparent">لوحة المدرب</span>
        <span className="text-gray-400 text-lg mr-3">{mockTeam.name}</span>
      </h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'اللاعبين', value: mockTeam.totalPlayers, icon: Users, color: '#00d4ff' },
          { label: 'متوسط التقييم', value: mockTeam.avgRating, icon: TrendingUp, color: '#d4af37' },
          { label: 'الأفضل أداءً', value: mockTeam.topPerformer, icon: Star, color: '#d4af37', small: true },
          { label: 'التدريبات القادمة', value: mockSchedule.length, icon: Calendar, color: '#00d4ff' },
        ].map((s, i) => (
          <div key={i} className="bg-[#0a1f3d]/50 backdrop-blur-xl border border-[#00d4ff]/10 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <s.icon className="w-5 h-5" style={{ color: s.color }} />
              <span className="text-gray-400 text-sm">{s.label}</span>
            </div>
            <div className={`${s.small ? 'text-lg' : 'text-2xl'} font-bold text-white`}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Players Table */}
        <div className="md:col-span-2 bg-[#0a1f3d]/50 backdrop-blur-xl border border-[#00d4ff]/10 rounded-xl p-5">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-[#00d4ff]" /> قائمة اللاعبين
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 border-b border-[#00d4ff]/10">
                  <th className="text-right pb-3">اللاعب</th>
                  <th className="text-right pb-3">المركز</th>
                  <th className="text-right pb-3">التقييم</th>
                  <th className="text-right pb-3">الحالة</th>
                  <th className="text-right pb-3">الاتجاه</th>
                </tr>
              </thead>
              <tbody>
                {mockPlayers.map((p, i) => (
                  <tr key={i} className="border-b border-[#00d4ff]/5 hover:bg-white/5 transition">
                    <td className="py-3 font-medium text-white">{p.name}</td>
                    <td className="py-3 text-gray-400">{p.position}</td>
                    <td className="py-3"><span className="text-[#00d4ff] font-bold">{p.rating}</span></td>
                    <td className="py-3"><span className={`px-2 py-1 rounded-full text-xs border ${statusColor(p.status)}`}>{p.status}</span></td>
                    <td className={`py-3 font-bold ${p.trend.startsWith('+') ? 'text-[#d4af37]' : p.trend.startsWith('-') ? 'text-red-400' : 'text-gray-400'}`}>{p.trend}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Schedule */}
        <div className="bg-[#0a1f3d]/50 backdrop-blur-xl border border-[#00d4ff]/10 rounded-xl p-5">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#d4af37]" /> الجدول
          </h3>
          <div className="space-y-3">
            {mockSchedule.map((s, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-[#041329]/50 border border-[#00d4ff]/5">
                <div className="w-1 h-10 rounded-full" style={{ backgroundColor: s.color }} />
                <div>
                  <div className="text-white text-sm font-medium">{s.type}</div>
                  <div className="text-gray-400 text-xs">{s.day} - {s.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Chart */}
      <div className="bg-[#0a1f3d]/50 backdrop-blur-xl border border-[#00d4ff]/10 rounded-xl p-5">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-[#00d4ff]" /> اتجاه الأداء
        </h3>
        <Line data={lineData} options={lineOptions} />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'إضافة لاعب', icon: Plus, color: '#00d4ff' },
          { label: 'جدول تدريب', icon: ClipboardList, color: '#d4af37' },
          { label: 'تقرير أداء', icon: FileText, color: '#00d4ff' },
        ].map((a, i) => (
          <button key={i} className="flex items-center justify-center gap-2 py-3 bg-[#0a1f3d]/50 backdrop-blur-xl border border-[#00d4ff]/10 rounded-xl text-white hover:bg-white/5 transition">
            <a.icon className="w-5 h-5" style={{ color: a.color }} />
            <span>{a.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default CoachDashboard
