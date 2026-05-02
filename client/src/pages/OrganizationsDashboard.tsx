import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  Building2, Users, Trophy, TrendingUp, Award,
  ChevronRight, Star, Shield, Activity, BarChart3,
  Search, Filter, Plus, MoreVertical, Edit2, Trash2
} from "lucide-react";
import { motion } from "framer-motion";
import Ada2aiNavbar from "@/components/Ada2aiNavbar";
import { useLanguage } from "@/contexts/LanguageContext";
import BackButton from "@/components/BackButton";

// ── Mock Data ────────────────────────────────────────────────────────────────
interface Organization {
  id: string;
  name: string;
  name_ar: string;
  type: "club" | "academy" | "federation";
  sport: string;
  sport_ar: string;
  logo: string;
  players_count: number;
  teams_count: number;
  championships: number;
  rating: number;
  verified: boolean;
  region: string;
  region_ar: string;
  established: number;
}

interface Player {
  id: string;
  name: string;
  name_ar: string;
  sport: string;
  age: number;
  position: string;
  position_ar: string;
  team: string;
  rating: number;
  status: "active" | "injured" | "transferred";
  photo: string;
}

// ── Static mock data ─────────────────────────────────────────────────────────
const MOCK_ORGS: Organization[] = [
  {
    id: "org-1",
    name: "Al-Ittihad Club",
    name_ar: "نادي الاتحاد",
    type: "club",
    sport: "Football",
    sport_ar: "كرة قدم",
    logo: "https://d2xsxph8kpxj0f.cloudfront.net/115062705/gJEX8KKv2DgTKGvafGwXZn/ittihad_95c0f12a.png",
    players_count: 87,
    teams_count: 6,
    championships: 12,
    rating: 4.8,
    verified: true,
    region: "Jeddah",
    region_ar: "جدة",
    established: 1927,
  },
  {
    id: "org-2",
    name: "Al-Hilal Club",
    name_ar: "نادي الهلال",
    type: "club",
    sport: "Football",
    sport_ar: "كرة قدم",
    logo: "https://d2xsxph8kpxj0f.cloudfront.net/115062705/gJEX8KKv2DgTKGvafGwXZn/hilal_1234abcd.png",
    players_count: 92,
    teams_count: 7,
    championships: 18,
    rating: 4.9,
    verified: true,
    region: "Riyadh",
    region_ar: "الرياض",
    established: 1908,
  },
  {
    id: "org-3",
    name: "Al-Nassr Club",
    name_ar: "نادي النصر",
    type: "club",
    sport: "Football",
    sport_ar: "كرة قدم",
    logo: "https://d2xsxph8kpxj0f.cloudfront.net/115062705/gJEX8KKv2DgTKGvafGwXZn/nassr_5678efgh.png",
    players_count: 84,
    teams_count: 5,
    championships: 15,
    rating: 4.7,
    verified: true,
    region: "Riyadh",
    region_ar: "الرياض",
    established: 1955,
  },
  {
    id: "org-4",
    name: "Riyadh Academy",
    name_ar: "أكاديمية الرياض",
    type: "academy",
    sport: "Multi-Sport",
    sport_ar: "رياضات متعددة",
    logo: "https://d2xsxph8kpxj0f.cloudfront.net/115062705/gJEX8KKv2DgTKGvafGwXZn/academy_xyz.png",
    players_count: 320,
    teams_count: 18,
    championships: 8,
    rating: 4.5,
    verified: true,
    region: "Riyadh",
    region_ar: "الرياض",
    established: 2010,
  },
];

const MOCK_PLAYERS: Player[] = [
  { id: "p1", name: "Fahad Al-Rashidi", name_ar: "فهد الرشيدي", sport: "Football", age: 24, position: "Midfielder", position_ar: "وسط", team: "First Team", rating: 87, status: "active", photo: "https://i.pravatar.cc/150?img=11" },
  { id: "p2", name: "Youssef Al-Zahrani", name_ar: "يوسف الزرعاني", sport: "Football", age: 21, position: "Forward", position_ar: "مهاجم", team: "Youth", rating: 82, status: "active", photo: "https://i.pravatar.cc/150?img=12" },
  { id: "p3", name: "Mohammed Al-Qahtani", name_ar: "محمد القحطاني", sport: "Football", age: 19, position: "Defender", position_ar: "مدافع", team: "Youth", rating: 79, status: "injured", photo: "https://i.pravatar.cc/150?img=13" },
  { id: "p4", name: "Abdulrahman Al-Otaibi", name_ar: "عبدالرحمن العتيبي", sport: "Football", age: 26, position: "Goalkeeper", position_ar: "حارس مرمى", team: "First Team", rating: 85, status: "active", photo: "https://i.pravatar.cc/150?img=14" },
  { id: "p5", name: "Ahmed Al-Dossary", name_ar: "أحمد الدوسري", sport: "Football", age: 23, position: "Winger", position_ar: "جناح", team: "First Team", rating: 84, status: "active", photo: "https://i.pravatar.cc/150?img=15" },
];

// ── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon, value, label, color }: { icon: React.ReactNode; value: string | number; label: string; color: string }) {
  return (
    <div className="rounded-2xl border p-5" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.07)" }}>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
          {icon}
        </div>
        <span className="text-2xl font-black" style={{ color, fontFamily: "'Orbitron', sans-serif" }}>{value}</span>
      </div>
      <p className="text-xs" style={{ color: "rgba(238,239,238,0.5)", fontFamily: "'Cairo', sans-serif" }}>{label}</p>
    </div>
  );
}

// ── Player Row ───────────────────────────────────────────────────────────────
function PlayerRow({ player, isRTL }: { player: Player; isRTL: boolean }) {
  const statusColors = {
    active: { bg: "#00DCC820", text: "#00DCC8", label: isRTL ? "نشط" : "Active" },
    injured: { bg: "#FFA50020", text: "#FFA500", label: isRTL ? "مصاب" : "Injured" },
    transferred: { bg: "#007ABA20", text: "#007ABA", label: isRTL ? "منتقل" : "Transferred" },
  };
  const status = statusColors[player.status];

  return (
    <motion.div
      className="flex items-center gap-4 p-4 rounded-xl border"
      style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.07)" }}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
    >
      <img src={player.photo} alt={player.name} className="w-12 h-12 rounded-full object-cover" />
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm text-[#EEEFEE]" style={{ fontFamily: isRTL ? "'Cairo', sans-serif" : "'Orbitron', sans-serif" }}>
          {isRTL ? player.name_ar : player.name}
        </p>
        <p className="text-xs" style={{ color: "rgba(238,239,238,0.5)" }}>
          {player.position_ar} • {player.age} {isRTL ? "سنة" : "yrs"}
        </p>
      </div>
      <div className="text-center px-3">
        <div className="text-lg font-black" style={{ color: "#00DCC8", fontFamily: "'Orbitron', sans-serif" }}>{player.rating}</div>
        <p className="text-xs" style={{ color: "rgba(238,239,238,0.4)" }}>{isRTL ? "تقييم" : "Rating"}</p>
      </div>
      <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ background: status.bg, color: status.text }}>
        {status.label}
      </span>
      <div className="flex gap-2">
        <button className="p-2 rounded-lg hover:bg-white/5 transition-colors">
          <Edit2 size={16} style={{ color: "rgba(238,239,238,0.5)" }} />
        </button>
        <button className="p-2 rounded-lg hover:bg-white/5 transition-colors">
          <MoreVertical size={16} style={{ color: "rgba(238,239,238,0.5)" }} />
        </button>
      </div>
    </motion.div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────
export default function OrganizationsDashboard() {
  const { t, lang, isRTL } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(MOCK_ORGS[0]);
  const [activeTab, setActiveTab] = useState<"overview" | "players" | "teams">("overview");

  const filteredPlayers = MOCK_PLAYERS.filter(p => {
    const name = isRTL ? p.name_ar : p.name;
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-[#000A0F] text-[#EEEFEE]" dir={isRTL ? "rtl" : "ltr"}>
      <Ada2aiNavbar />
      <BackButton />

      <div className="container mx-auto px-4 pt-24 pb-12">
        {/* ── Header ──────────────────────────────────────────────────── */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: "#00DCC815", border: "1px solid #00DCC830" }}>
              <Building2 size={24} style={{ color: "#00DCC8" }} />
            </div>
            <div>
              <h1 className="text-2xl font-black font-orbitron" style={{ color: "#00DCC8" }}>
                {isRTL ? "المنشآت الرياضية" : "Organizations"}
              </h1>
              <p className="text-sm" style={{ color: "rgba(238,239,238,0.5)", fontFamily: "'Cairo', sans-serif" }}>
                {isRTL ? "إدارة الأندية والأكاديميات" : "Manage clubs, academies & federations"}
              </p>
            </div>
          </div>
        </motion.div>

        {/* ── Organization Selector ────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {MOCK_ORGS.map(org => (
            <motion.div
              key={org.id}
              className={`cursor-pointer rounded-2xl border p-4 transition-all ${selectedOrg?.id === org.id ? "border-[#00DCC8]/50" : "border-white/10"}`}
              style={{
                background: selectedOrg?.id === org.id ? "rgba(0,220,200,0.05)" : "rgba(255,255,255,0.02)",
              }}
              onClick={() => setSelectedOrg(org)}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center gap-3 mb-3">
                <img src={org.logo} alt={org.name} className="w-10 h-10 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-xs truncate" style={{ fontFamily: isRTL ? "'Cairo', sans-serif" : "'Orbitron', sans-serif" }}>
                    {isRTL ? org.name_ar : org.name}
                  </p>
                  <p className="text-xs" style={{ color: "rgba(238,239,238,0.4)" }}>{org.sport_ar}</p>
                </div>
                {org.verified && <Shield size={14} style={{ color: "#00DCC8" }} />}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs px-2 py-1 rounded-full" style={{ background: "rgba(0,220,200,0.1)", color: "#00DCC8" }}>
                  {isRTL ? "نادي" : "Club"}
                </span>
                <span className="text-xs font-semibold" style={{ color: "#FFD700" }}>★ {org.rating}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {selectedOrg && (
          <>
            {/* ── Stats Grid ─────────────────────────────────────────── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <StatCard icon={<Users size={20} style={{ color: "#00DCC8" }} />} value={selectedOrg.players_count} label={isRTL ? "لاعب" : "Players"} color="#00DCC8" />
              <StatCard icon={<Trophy size={20} style={{ color: "#FFD700" }} />} value={selectedOrg.teams_count} label={isRTL ? "فريق" : "Teams"} color="#FFD700" />
              <StatCard icon={<Award size={20} style={{ color: "#FFA500" }} />} value={selectedOrg.championships} label={isRTL ? "بطولة" : "Championships"} color="#FFA500" />
              <StatCard icon={<Activity size={20} style={{ color: "#007ABA" }} />} value={selectedOrg.established} label={isRTL ? "سنة التأسيس" : "Established"} color="#007ABA" />
            </div>

            {/* ── Tabs ──────────────────────────────────────────────── */}
            <div className="flex gap-2 mb-6 border-b border-white/10 pb-1">
              {(["overview", "players", "teams"] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="px-4 py-2 text-sm font-semibold rounded-t-lg transition-all"
                  style={{
                    background: activeTab === tab ? "rgba(0,220,200,0.1)" : "transparent",
                    color: activeTab === tab ? "#00DCC8" : "rgba(238,239,238,0.5)",
                    borderBottom: activeTab === tab ? "2px solid #00DCC8" : "2px solid transparent",
                    fontFamily: "'Cairo', sans-serif",
                  }}
                >
                  {tab === "overview" && (isRTL ? "نظرة عامة" : "Overview")}
                  {tab === "players" && (isRTL ? "اللاعبون" : "Players")}
                  {tab === "teams" && (isRTL ? "الفرق" : "Teams")}
                </button>
              ))}
            </div>

            {/* ── Tab Content ─────────────────────────────────────────── */}
            {activeTab === "overview" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Quick Actions */}
                  <div className="rounded-2xl border p-6" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.07)" }}>
                    <h3 className="font-bold text-sm mb-4" style={{ fontFamily: "'Orbitron', sans-serif", color: "#00DCC8" }}>
                      {isRTL ? "إجراءات سريعة" : "Quick Actions"}
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { icon: <Plus size={18} />, label: isRTL ? "إضافة لاعب" : "Add Player", color: "#00DCC8" },
                        { icon: <Users size={18} />, label: isRTL ? "إدارة الفرق" : "Manage Teams", color: "#007ABA" },
                        { icon: <BarChart3 size={18} />, label: isRTL ? "تقارير" : "Reports", color: "#FFA500" },
                        { icon: <Shield size={18} />, label: isRTL ? "صلاحيات" : "Permissions", color: "#FFD700" },
                      ].map((action, i) => (
                        <button
                          key={i}
                          className="flex items-center gap-2 p-3 rounded-xl border transition-all hover:scale-[1.02]"
                          style={{ background: `${action.color}08`, borderColor: `${action.color}30` }}
                        >
                          <span style={{ color: action.color }}>{action.icon}</span>
                          <span className="text-xs font-semibold" style={{ color: action.color, fontFamily: "'Cairo', sans-serif" }}>{action.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="rounded-2xl border p-6" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.07)" }}>
                    <h3 className="font-bold text-sm mb-4" style={{ fontFamily: "'Orbitron', sans-serif", color: "#00DCC8" }}>
                      {isRTL ? "النشاط الأخير" : "Recent Activity"}
                    </h3>
                    <div className="space-y-3">
                      {[
                        { text: isRTL ? "تم تسجيل لاعب جديد" : "New player registered", time: "2h ago", color: "#00DCC8" },
                        { text: isRTL ? "تحديث تقييم الفريق" : "Team rating updated", time: "5h ago", color: "#FFA500" },
                        { text: isRTL ? "بطولة جديدة" : "New championship", time: "1d ago", color: "#007ABA" },
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-lg" style={{ background: "rgba(255,255,255,0.02)" }}>
                          <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                          <div className="flex-1">
                            <p className="text-xs" style={{ color: "rgba(238,239,238,0.7)", fontFamily: "'Cairo', sans-serif" }}>{item.text}</p>
                          </div>
                          <span className="text-xs" style={{ color: "rgba(238,239,238,0.4)" }}>{item.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "players" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {/* Search */}
                <div className="flex gap-3 mb-6">
                  <div className="flex-1 relative">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "rgba(238,239,238,0.4)" }} />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder={isRTL ? "ابحث عن لاعب..." : "Search players..."}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border text-sm"
                      style={{
                        background: "rgba(255,255,255,0.05)",
                        borderColor: "rgba(255,255,255,0.1)",
                        color: "#EEEFEE",
                        fontFamily: "'Cairo', sans-serif",
                      }}
                    />
                  </div>
                  <button className="px-4 py-3 rounded-xl font-semibold text-sm transition-all hover:scale-[1.02]" style={{ background: "#00DCC8", color: "#000A0F" }}>
                    {isRTL ? "+ إضافة" : "+ Add"}
                  </button>
                </div>

                {/* Player List */}
                <div className="space-y-3">
                  {filteredPlayers.map(player => (
                    <PlayerRow key={player.id} player={player} isRTL={isRTL} />
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === "teams" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { name: isRTL ? "الفريق الأول" : "First Team", players: 28, rating: 4.8, sport: "Football" },
                    { name: isRTL ? "فريق الشباب" : "Youth Team", players: 22, rating: 4.2, sport: "Football" },
                    { name: isRTL ? "الأولمبي" : "Olympic Team", players: 18, rating: 4.5, sport: "Football" },
                    { name: isRTL ? "فريق الناشئين" : "Junior Team", players: 24, rating: 3.9, sport: "Football" },
                  ].map((team, i) => (
                    <motion.div
                      key={i}
                      className="rounded-2xl border p-5 cursor-pointer"
                      style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(255,255,255,0.07)" }}
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-bold text-sm" style={{ fontFamily: isRTL ? "'Cairo', sans-serif" : "'Orbitron', sans-serif" }}>{team.name}</h4>
                        <span className="text-xs px-2 py-1 rounded-full" style={{ background: "rgba(0,220,200,0.1)", color: "#00DCC8" }}>{team.players} {isRTL ? "لاعب" : "players"}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs" style={{ color: "rgba(238,239,238,0.5)" }}>{team.sport}</span>
                        <span className="text-sm font-bold" style={{ color: "#FFD700" }}>★ {team.rating}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
