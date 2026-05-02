import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Trophy, Medal, TrendingUp, TrendingDown, Minus, Filter } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function Rankings() {
  const [rankings, setRankings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [posFilter, setPosFilter] = useState('الكل')
  const positions = ['الكل', 'حارس', 'مدافع', 'وسط', 'جناح', 'مهاجم']

  useEffect(() => {
    const fetchRankings = async () => {
      setLoading(true)
      const { data } = await supabase
        .from('players')
        .select('*, profile:profiles(full_name, region)')
        .order('created_at', { ascending: false })
        .limit(50)
      if (data) setRankings(data)
      setLoading(false)
    }
    fetchRankings()
  }, [])

  const filtered = rankings.filter((p: any) => posFilter === 'الكل' || p.position === posFilter)
  const top3 = filtered.slice(0, 3)

  const barData = [
    { range: '90+', count: rankings.filter((p: any) => (p.stats?.rating || 0) >= 90).length },
    { range: '80-89', count: rankings.filter((p: any) => (p.stats?.rating || 0) >= 80 && (p.stats?.rating || 0) < 90).length },
    { range: '70-79', count: rankings.filter((p: any) => (p.stats?.rating || 0) >= 70 && (p.stats?.rating || 0) < 80).length },
    { range: '60-69', count: rankings.filter((p: any) => (p.stats?.rating || 0) >= 60 && (p.stats?.rating || 0) < 70).length },
    { range: '< 60', count: rankings.filter((p: any) => (p.stats?.rating || 0) < 60).length },
  ]

  const barColors = ['#d4af37', '#00d4ff', '#00d4ff80', '#0a1f3d', '#041329']

  const trendIcon = (t: string) => {
    if (t === 'up') return <TrendingUp className="w-4 h-4 text-[#d4af37]" />
    if (t === 'down') return <TrendingDown className="w-4 h-4 text-red-400" />
    return <Minus className="w-4 h-4 text-gray-500" />
  }

  const podiumColors = ['from-[#d4af37] to-[#e8c84a]', 'from-gray-300 to-gray-400', 'from-amber-600 to-amber-700']
  const podiumHeights = ['h-32', 'h-24', 'h-20']
  const podiumOrder = [1, 0, 2]

  return (
    <div className="max-w-5xl mx-auto space-y-6 p-6" dir="rtl">
      <h1 className="text-3xl font-bold">
        <span className="bg-gradient-to-r from-[#d4af37] to-[#e8c84a] bg-clip-text text-transparent">ترتيب المواهب</span>
      </h1>

      {loading ? (
        <div className="text-center py-12 text-gray-400">جاري التحميل...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400">لا توجد بيانات</div>
      ) : (
      <>
      {top3.length >= 3 && (
        <div className="bg-[#0a1f3d]/50 backdrop-blur-xl border border-[#00d4ff]/10 rounded-2xl p-8">
          <div className="flex items-end justify-center gap-4">
            {podiumOrder.map(idx => {
              const p = top3[idx]
              if (!p) return null
              return (
                <div key={idx} className="flex flex-col items-center">
                  <div className="text-center mb-3">
                    <div className="text-white font-bold text-sm">{p.profile?.full_name || 'لاعب'}</div>
                    <div className="text-gray-400 text-xs">{p.club_name || p.academy_name || 'فريق'}</div>
                    <div className={`mt-1 inline-block px-3 py-1 rounded-full bg-gradient-to-r ${podiumColors[idx]} text-[#041329] text-sm font-black`}>
                      {p.stats?.rating || 0}
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

      <div className="flex items-center gap-3 flex-wrap">
        <Filter className="w-5 h-5 text-gray-400" />
        {positions.map(pos => (
          <button key={pos} onClick={() => setPosFilter(pos)}
            className={`px-4 py-2 rounded-xl text-sm transition ${posFilter === pos ? 'bg-[#00d4ff]/20 border border-[#00d4ff]/30 text-[#00d4ff]' : 'bg-[#0a1f3d]/50 border border-[#00d4ff]/10 text-gray-400 hover:bg-white/5'}`}>
            {pos}
          </button>
        ))}
      </div>

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
            {filtered.map((p: any, i: number) => (
              <tr key={i} className="border-b border-[#00d4ff]/5 hover:bg-white/5 transition">
                <td className="p-4">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${i + 1 <= 3 ? 'bg-gradient-to-r from-[#d4af37] to-[#e8c84a] text-[#041329]' : 'bg-[#041329] text-gray-400 border border-[#00d4ff]/10'}`}>
                    {i + 1}
                  </span>
                </td>
                <td className="p-4 font-medium text-white">{p.profile?.full_name || 'لاعب'}</td>
                <td className="p-4 text-gray-400">{p.club_name || p.academy_name || '—'}</td>
                <td className="p-4"><span className="px-2 py-1 bg-[#00d4ff]/10 border border-[#00d4ff]/20 rounded-full text-[#00d4ff] text-xs">{p.position || '—'}</span></td>
                <td className="p-4 text-gray-400">{p.profile?.region || '—'}</td>
                <td className="p-4"><span className="text-[#d4af37] font-bold text-lg">{p.stats?.rating || 0}</span></td>
                <td className="p-4"><Minus className="w-4 h-4 text-gray-500" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-[#0a1f3d]/50 backdrop-blur-xl border border-[#00d4ff]/10 rounded-xl p-5">
        <h3 className="text-lg font-semibold text-white mb-4">توزيع التقييمات</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={barData}>
            <XAxis dataKey="range" tick={{ fill: '#a8b4c4', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#a8b4c4', fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ background: '#0a1f3d', border: '1px solid rgba(0,212,255,0.1)', borderRadius: 8, color: '#fff' }}
              cursor={{ fill: 'rgba(0,212,255,0.05)' }}
            />
            <Bar dataKey="count" radius={[8, 8, 0, 0]}>
              {barData.map((_, index) => (
                <Cell key={index} fill={barColors[index]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      </>
      )}
    </div>
  )
}
