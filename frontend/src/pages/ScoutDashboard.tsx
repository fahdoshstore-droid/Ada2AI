import { useState } from 'react'
import { Search, Filter, Heart, Star, MapPin, Users, ChevronDown } from 'lucide-react'

const mockPlayers = [
  { id: 1, name: 'أحمد الشمراني', position: 'وسط', team: 'الاتحاد', city: 'جدة', age: 16, rating: 87, speed: 90, technique: 86 },
  { id: 2, name: 'سعود الدوسري', position: 'حارس', team: 'الهلال', city: 'الرياض', age: 17, rating: 85, speed: 75, technique: 88 },
  { id: 3, name: 'خالد العتيبي', position: 'مهاجم', team: 'النصر', city: 'الرياض', age: 15, rating: 82, speed: 92, technique: 80 },
  { id: 4, name: 'فهد القحطاني', position: 'مدافع', team: 'الأهلي', city: 'جدة', age: 16, rating: 79, speed: 78, technique: 77 },
  { id: 5, name: 'عبدالله الشهري', position: 'جناح', team: 'الشباب', city: 'الرياض', age: 18, rating: 76, speed: 88, technique: 74 },
  { id: 6, name: 'محمد الغامدي', position: 'وسط', team: 'الاتفاق', city: 'الدمام', age: 17, rating: 81, speed: 82, technique: 84 },
]

const positions = ['الكل', 'حارس', 'مدافع', 'وسط', 'جناح', 'مهاجم']

function ScoutDashboard() {
  const [search, setSearch] = useState('')
  const [posFilter, setPosFilter] = useState('الكل')
  const [shortlist, setShortlist] = useState<number[]>([])
  const [compareIds, setCompareIds] = useState<number[]>([])

  const filtered = mockPlayers.filter(p => {
    const matchSearch = p.name.includes(search) || p.team.includes(search)
    const matchPos = posFilter === 'الكل' || p.position === posFilter
    return matchSearch && matchPos
  })

  const toggleShortlist = (id: number) => {
    setShortlist(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const toggleCompare = (id: number) => {
    setCompareIds(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id)
      if (prev.length >= 2) return [prev[1], id]
      return [...prev, id]
    })
  }

  const comparePlayers = compareIds.map(id => mockPlayers.find(p => p.id === id)!).filter(Boolean)

  return (
    <div className="max-w-6xl mx-auto space-y-6" dir="rtl">
      <h1 className="text-3xl font-bold">
        <span className="bg-gradient-to-r from-[#d4af37] to-[#e8c84a] bg-clip-text text-transparent">لوحة الكشاف</span>
      </h1>

      {/* Search & Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="ابحث عن لاعب أو نادي..."
            className="w-full pr-10 pl-4 py-3 bg-[#0a1f3d]/50 backdrop-blur-xl border border-[#00d4ff]/15 rounded-xl text-white placeholder-gray-500 outline-none focus:border-[#00d4ff]/40"
          />
        </div>
        <div className="flex gap-2">
          {positions.map(pos => (
            <button key={pos} onClick={() => setPosFilter(pos)}
              className={`px-4 py-3 rounded-xl text-sm transition ${posFilter === pos ? 'bg-[#00d4ff]/20 border border-[#00d4ff]/30 text-[#00d4ff]' : 'bg-[#0a1f3d]/50 border border-[#00d4ff]/10 text-gray-400 hover:bg-white/5'}`}>
              {pos}
            </button>
          ))}
        </div>
      </div>

      {/* Player Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(player => (
          <div key={player.id} className="bg-[#0a1f3d]/50 backdrop-blur-xl border border-[#00d4ff]/10 rounded-xl p-5 hover:border-[#00d4ff]/30 transition group">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-lg font-bold text-white">{player.name}</h3>
                <div className="flex items-center gap-2 text-gray-400 text-sm mt-1">
                  <span>{player.team}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{player.city}</span>
                </div>
              </div>
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#d4af37] to-[#e8c84a] flex items-center justify-center">
                <span className="text-2xl font-black text-[#041329]">{player.rating}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-3">
              <span className="px-2 py-1 bg-[#00d4ff]/10 border border-[#00d4ff]/30 rounded-full text-[#00d4ff] text-xs">{player.position}</span>
              <span className="text-gray-400 text-xs">{player.age} سنة</span>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="bg-[#041329]/50 rounded-lg p-2 text-center">
                <div className="text-[#00d4ff] font-bold">{player.speed}</div>
                <div className="text-gray-500 text-xs">السرعة</div>
              </div>
              <div className="bg-[#041329]/50 rounded-lg p-2 text-center">
                <div className="text-[#d4af37] font-bold">{player.technique}</div>
                <div className="text-gray-500 text-xs">التقنية</div>
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={() => toggleShortlist(player.id)}
                className={`flex-1 py-2 rounded-lg text-sm flex items-center justify-center gap-1 transition ${shortlist.includes(player.id) ? 'bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/30' : 'bg-[#0a1f3d] text-gray-400 border border-[#00d4ff]/10 hover:bg-white/5'}`}>
                <Heart className="w-4 h-4" fill={shortlist.includes(player.id) ? '#d4af37' : 'none'} /> المفضلة
              </button>
              <button onClick={() => toggleCompare(player.id)}
                className={`flex-1 py-2 rounded-lg text-sm flex items-center justify-center gap-1 transition ${compareIds.includes(player.id) ? 'bg-[#00d4ff]/20 text-[#00d4ff] border border-[#00d4ff]/30' : 'bg-[#0a1f3d] text-gray-400 border border-[#00d4ff]/10 hover:bg-white/5'}`}>
                <Users className="w-4 h-4" /> مقارنة
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Comparison */}
      {comparePlayers.length === 2 && (
        <div className="bg-[#0a1f3d]/50 backdrop-blur-xl border border-[#d4af37]/30 rounded-xl p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-[#d4af37]" /> المقارنة
          </h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-xl font-bold text-white">{comparePlayers[0].name}</div>
              <div className="text-gray-400 text-sm">{comparePlayers[0].team}</div>
            </div>
            <div className="text-gray-500 text-sm">VS</div>
            <div>
              <div className="text-xl font-bold text-white">{comparePlayers[1].name}</div>
              <div className="text-gray-400 text-sm">{comparePlayers[1].team}</div>
            </div>
            {['rating', 'speed', 'technique'].map(stat => {
              const labels: Record<string, string> = { rating: 'التقييم', speed: 'السرعة', technique: 'التقنية' }
              const v1 = comparePlayers[0][stat as keyof typeof comparePlayers[0]] as number
              const v2 = comparePlayers[1][stat as keyof typeof comparePlayers[1]] as number
              return (
                <div key={stat} className="contents">
                  <div className={`text-lg font-bold ${v1 > v2 ? 'text-[#d4af37]' : 'text-gray-400'}`}>{v1}</div>
                  <div className="text-gray-500 text-xs self-center">{labels[stat]}</div>
                  <div className={`text-lg font-bold ${v2 > v1 ? 'text-[#d4af37]' : 'text-gray-400'}`}>{v2}</div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Shortlist */}
      {shortlist.length > 0 && (
        <div className="bg-[#0a1f3d]/50 backdrop-blur-xl border border-[#00d4ff]/10 rounded-xl p-5">
          <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
            <Star className="w-5 h-5 text-[#d4af37]" /> القائمة المختصرة ({shortlist.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {shortlist.map(id => {
              const p = mockPlayers.find(x => x.id === id)!
              return (
                <span key={id} className="px-3 py-1 bg-[#d4af37]/10 border border-[#d4af37]/30 rounded-full text-[#d4af37] text-sm">
                  {p.name} ({p.rating})
                </span>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default ScoutDashboard
