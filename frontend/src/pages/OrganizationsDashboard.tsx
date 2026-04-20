import { useState } from 'react'
import { Search, Filter, Users, ChevronDown, Crown, BadgeCheck } from 'lucide-react'

// Mock club data - all players affiliated with the club
const mockClubPlayers = [
  { id: 1, name: 'أحمد الشمراني', position: 'وسط', status: 'منتسب', age: 16, rating: 87, speed: 90, technique: 86, city: 'جدة' },
  { id: 2, name: 'سعود الدوسري', position: 'حارس', status: 'منتسب', age: 17, rating: 85, speed: 75, technique: 88, city: 'الرياض' },
  { id: 3, name: 'خالد العتيبي', position: 'مهاجم', status: 'قيد الانتساب', age: 15, rating: 82, speed: 92, technique: 80, city: 'الرياض' },
  { id: 4, name: 'فهد القحطاني', position: 'مدافع', status: 'منتسب', age: 16, rating: 79, speed: 78, technique: 77, city: 'جدة' },
  { id: 5, name: 'عبدالله الشهري', position: 'جناح', status: 'منتسب', age: 18, rating: 76, speed: 88, technique: 74, city: 'الرياض' },
  { id: 6, name: 'محمد الغامدي', position: 'وسط', status: 'قيد الانتساب', age: 17, rating: 81, speed: 82, technique: 84, city: 'الدمام' },
  { id: 7, name: 'عبدالرحمن القحطاني', position: 'مدافع', status: 'منتسب', age: 14, rating: 74, speed: 71, technique: 73, city: 'مكة' },
  { id: 8, name: 'فيصل السالم', position: 'حارس', status: 'منتسب', age: 16, rating: 78, speed: 69, technique: 81, city: 'جدة' },
]

const positions = ['الكل', 'حارس', 'مدافع', 'وسط', 'جناح', 'مهاجم']
const statusOptions = ['الكل', 'منتسب', 'قيد الانتساب']

function OrganizationsDashboard() {
  const [search, setSearch] = useState('')
  const [posFilter, setPosFilter] = useState('الكل')
  const [statusFilter, setStatusFilter] = useState('الكل')

  const filtered = mockClubPlayers.filter(p => {
    const matchSearch = p.name.includes(search) || p.city.includes(search)
    const matchPos = posFilter === 'الكل' || p.position === posFilter
    const matchStatus = statusFilter === 'الكل' || p.status === statusFilter
    return matchSearch && matchPos && matchStatus
  })

  const stats = {
    total: mockClubPlayers.length,
    registered: mockClubPlayers.filter(p => p.status === 'منتسب').length,
    pending: mockClubPlayers.filter(p => p.status === 'قيد الانتساب').length,
    avgRating: Math.round(mockClubPlayers.reduce((acc, p) => acc + p.rating, 0) / mockClubPlayers.length),
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6" dir="rtl">
      <h1 className="text-3xl font-bold flex items-center gap-3">
        <Crown className="w-8 h-8 text-[#d4af37]" />
        <span className="bg-gradient-to-r from-[#d4af37] to-[#e8c84a] bg-clip-text text-transparent">لوحة النوادي والمؤسسات</span>
      </h1>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card" style={{ border: '1px solid rgba(0, 212, 255, 0.2)' }}>
          <div className="text-3xl font-bold text-[#00d4ff]">{stats.total}</div>
          <div className="text-sm text-gray-400">إجمالي اللاعبين</div>
        </div>
        <div className="glass-card" style={{ border: '1px solid rgba(212, 175, 55, 0.2)' }}>
          <div className="text-3xl font-bold text-[#d4af37]">{stats.registered}</div>
          <div className="text-sm text-gray-400">منتسبين</div>
        </div>
        <div className="glass-card" style={{ border: '1px solid rgba(255, 165, 0, 0.2)' }}>
          <div className="text-3xl font-bold text-orange-400">{stats.pending}</div>
          <div className="text-sm text-gray-400">قيد الانتساب</div>
        </div>
        <div className="glass-card" style={{ border: '1px solid rgba(16, 185, 129, 0.2)' }}>
          <div className="text-3xl font-bold text-green-400">{stats.avgRating}</div>
          <div className="text-sm text-gray-400">متوسط التقييم</div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="ابحث عن لاعب..."
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
        <div className="flex gap-2">
          {statusOptions.map(status => (
            <button key={status} onClick={() => setStatusFilter(status)}
              className={`px-4 py-3 rounded-xl text-sm transition ${statusFilter === status ? 'bg-[#d4af37]/20 border border-[#d4af37]/30 text-[#d4af37]' : 'bg-[#0a1f3d]/50 border border-[#d4af37]/10 text-gray-400 hover:bg-white/5'}`}>
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Players Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#00d4ff]/10">
                <th className="text-right p-4 text-gray-400 font-medium">اللاعب</th>
                <th className="text-right p-4 text-gray-400 font-medium">المركز</th>
                <th className="text-right p-4 text-gray-400 font-medium">المدينة</th>
                <th className="text-right p-4 text-gray-400 font-medium">العمر</th>
                <th className="text-right p-4 text-gray-400 font-medium">الحالة</th>
                <th className="text-right p-4 text-gray-400 font-medium">التقييم</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(player => (
                <tr key={player.id} className="border-b border-[#00d4ff]/5 hover:bg-white/5 transition">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00d4ff] to-[#007aba] flex items-center justify-center text-white font-bold">
                        {player.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-white">{player.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-gray-300">{player.position}</td>
                  <td className="p-4 text-gray-300">{player.city}</td>
                  <td className="p-4 text-gray-300">{player.age}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs ${
                      player.status === 'منتسب' 
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                        : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                    }`}>
                      {player.status === 'منتسب' && <BadgeCheck className="w-3 h-3 inline ml-1" />}
                      {player.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-[#0a1f3d] rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-[#d4af37] to-[#e8c84a] rounded-full"
                          style={{ width: `${player.rating}%` }}
                        />
                      </div>
                      <span className="text-[#d4af37] font-bold">{player.rating}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filtered.length === 0 && (
          <div className="p-8 text-center text-gray-400">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>لا يوجد لاعبين يطابقون البحث</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default OrganizationsDashboard
