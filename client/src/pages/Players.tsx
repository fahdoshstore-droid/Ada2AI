import { useState } from "react";
import { Link, useLocation } from "wouter";
import {
  Search, Filter, Star, MapPin, Trophy, Activity,
  ChevronRight, Users, Zap, ArrowRight, SlidersHorizontal
} from "lucide-react";
import Ada2aiNavbar from "@/components/Ada2aiNavbar";
import BackButton from "@/components/BackButton";

// Sample athlete data representing the database
const sampleAthletes = [
  {
    id: 1, name: "Mohammed Al-Qahtani", nameAr: "محمد القحطاني",
    sport: "Football", position: "RW", age: 17, region: "Riyadh",
    rating: 84, speed: 88, agility: 82, technique: 85,
    badge: "TOP TALENT", badgeColor: "#00DCC8",
    academy: "Al-Hilal Academy",
  },
  {
    id: 2, name: "Khalid Al-Ghamdi", nameAr: "خالد الغامدي",
    sport: "Football", position: "CM", age: 19, region: "Jeddah",
    rating: 78, speed: 74, agility: 80, technique: 79,
    badge: "RISING STAR", badgeColor: "#007ABA",
    academy: "Al-Ittihad Academy",
  },
  {
    id: 3, name: "Faisal Al-Shehri", nameAr: "فيصل الشهري",
    sport: "Athletics", position: "Sprint", age: 16, region: "Dammam",
    rating: 81, speed: 92, agility: 85, technique: 76,
    badge: "VERIFIED", badgeColor: "#00DCC8",
    academy: "Eastern Province Sports",
  },
  {
    id: 4, name: "Omar Al-Dosari", nameAr: "عمر الدوسري",
    sport: "Basketball", position: "PG", age: 18, region: "Riyadh",
    rating: 76, speed: 79, agility: 83, technique: 72,
    badge: "PROSPECT", badgeColor: "#FFA500",
    academy: "Saudi Basketball Federation",
  },
  {
    id: 5, name: "Abdullah Al-Harbi", nameAr: "عبدالله الحربي",
    sport: "Football", position: "ST", age: 20, region: "Mecca",
    rating: 82, speed: 85, agility: 78, technique: 84,
    badge: "TOP TALENT", badgeColor: "#00DCC8",
    academy: "Al-Ahli Academy",
  },
  {
    id: 6, name: "Nawaf Al-Mutairi", nameAr: "نواف المطيري",
    sport: "Swimming", position: "Freestyle", age: 15, region: "Riyadh",
    rating: 79, speed: 88, agility: 80, technique: 77,
    badge: "RISING STAR", badgeColor: "#007ABA",
    academy: "Saudi Aquatics Federation",
  },
  {
    id: 7, name: "Turki Al-Zahrani", nameAr: "تركي الزهراني",
    sport: "Football", position: "CB", age: 18, region: "Abha",
    rating: 75, speed: 72, agility: 76, technique: 74,
    badge: "PROSPECT", badgeColor: "#FFA500",
    academy: "Al-Wahda Academy",
  },
  {
    id: 8, name: "Saleh Al-Otaibi", nameAr: "صالح العتيبي",
    sport: "Football", position: "GK", age: 17, region: "Medina",
    rating: 77, speed: 68, agility: 79, technique: 80,
    badge: "VERIFIED", badgeColor: "#00DCC8",
    academy: "Al-Taawoun Academy",
  },
];

const sports = ["All Sports", "Football", "Athletics", "Basketball", "Swimming", "Tennis", "Volleyball"];
const regions = ["All Regions", "Riyadh", "Jeddah", "Dammam", "Mecca", "Medina", "Abha"];
const ageGroups = ["All Ages", "U15", "U17", "U19", "U21", "Senior"];

function RatingBar({ value, color = "#00DCC8" }: { value: number; color?: string }) {
  return (
    <div className="ada-progress-bar w-full">
      <div className="ada-progress-fill" style={{ width: `${value}%`, background: `linear-gradient(90deg, #007ABA, ${color})` }} />
    </div>
  );
}

function AthleteCard({ athlete }: { athlete: (typeof sampleAthletes)[number] }) {
  const [, navigate] = useLocation();
  return (
    <div className="ada-card p-5 flex flex-col gap-4 cursor-pointer group">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar placeholder */}
          <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(0,220,200,0.1)", border: "1px solid rgba(0,220,200,0.2)" }}>
            <span className="font-orbitron font-bold text-sm" style={{ color: "#00DCC8" }}>
              {athlete.name.split(" ").map(n => n[0]).join("").substring(0, 2)}
            </span>
          </div>
          <div>
            <div className="font-semibold text-sm text-[#EEEFEE]" style={{ fontFamily: "'Cairo', sans-serif" }}>
              {athlete.name}
            </div>
            <div className="text-xs" style={{ color: "rgba(238,239,238,0.45)", fontFamily: "'Cairo', sans-serif" }}>
              {athlete.nameAr}
            </div>
          </div>
        </div>
        <span className="text-xs px-2 py-0.5 rounded"
          style={{
            background: `${athlete.badgeColor}18`,
            color: athlete.badgeColor,
            border: `1px solid ${athlete.badgeColor}40`,
            fontFamily: "'Orbitron', sans-serif",
            fontWeight: 700,
            fontSize: "0.55rem",
            letterSpacing: "0.06em",
          }}>
          {athlete.badge}
        </span>
      </div>

      {/* Info row */}
      <div className="flex flex-wrap gap-2">
        <span className="text-xs px-2 py-0.5 rounded-full"
          style={{ background: "rgba(0,220,200,0.08)", color: "#00DCC8", border: "1px solid rgba(0,220,200,0.15)", fontFamily: "'Cairo', sans-serif" }}>
          {athlete.sport}
        </span>
        <span className="text-xs px-2 py-0.5 rounded-full"
          style={{ background: "rgba(255,255,255,0.05)", color: "rgba(238,239,238,0.6)", border: "1px solid rgba(255,255,255,0.08)", fontFamily: "'Cairo', sans-serif" }}>
          {athlete.position}
        </span>
        <span className="text-xs px-2 py-0.5 rounded-full"
          style={{ background: "rgba(255,255,255,0.05)", color: "rgba(238,239,238,0.6)", border: "1px solid rgba(255,255,255,0.08)", fontFamily: "'Cairo', sans-serif" }}>
          Age {athlete.age}
        </span>
        <span className="text-xs flex items-center gap-1"
          style={{ color: "rgba(238,239,238,0.45)", fontFamily: "'Cairo', sans-serif" }}>
          <MapPin size={10} /> {athlete.region}
        </span>
      </div>

      {/* Rating */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs" style={{ color: "rgba(238,239,238,0.5)", fontFamily: "'Orbitron', sans-serif" }}>Overall Rating</span>
          <span className="ada-stat-number text-xl">{athlete.rating}</span>
        </div>
        <RatingBar value={athlete.rating} />
      </div>

      {/* Sub-metrics */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Speed", value: athlete.speed },
          { label: "Agility", value: athlete.agility },
          { label: "Technique", value: athlete.technique },
        ].map((m) => (
          <div key={m.label} className="text-center">
            <div className="text-sm font-bold mb-0.5" style={{ fontFamily: "'Orbitron', sans-serif", color: "#00DCC8" }}>{m.value}</div>
            <div className="text-xs" style={{ color: "rgba(238,239,238,0.4)", fontFamily: "'Cairo', sans-serif" }}>{m.label}</div>
          </div>
        ))}
      </div>

      {/* Academy */}
      <div className="pt-2 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
        <div className="text-xs" style={{ color: "rgba(238,239,238,0.4)", fontFamily: "'Cairo', sans-serif" }}>
          🏫 {athlete.academy}
        </div>
      </div>

      {/* CTA */}
      <button className="flex items-center gap-1.5 text-xs font-semibold transition-all group-hover:gap-2.5"
        onClick={() => navigate(`/sport-id`)}
        style={{ color: "#00DCC8", fontFamily: "'Orbitron', sans-serif" }}>
        View Full Report <ArrowRight size={12} />
      </button>
    </div>
  );
}

export default function Players() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSport, setSelectedSport] = useState("All Sports");
  const [selectedRegion, setSelectedRegion] = useState("All Regions");
  const [selectedAge, setSelectedAge] = useState("All Ages");

  const filtered = sampleAthletes.filter((a) => {
    const matchSearch = searchQuery === "" ||
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.nameAr.includes(searchQuery) ||
      a.position.toLowerCase().includes(searchQuery.toLowerCase());
    const matchSport = selectedSport === "All Sports" || a.sport === selectedSport;
    const matchRegion = selectedRegion === "All Regions" || a.region === selectedRegion;
    return matchSearch && matchSport && matchRegion;
  });

  return (
    <div className="min-h-screen bg-[#000A0F] text-[#EEEFEE]">
      <Ada2aiNavbar />

      {/* Header */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 ada-grid-bg opacity-30 pointer-events-none" />
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(0,122,186,0.08) 0%, transparent 70%)" }} />
        <div className="relative container mx-auto px-4">
          <BackButton fallbackRoute="/" />
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div>
              <span className="badge-pro mb-3 inline-block">Player Database</span>
              <h1 className="font-orbitron font-bold text-3xl lg:text-4xl mb-3 text-[#EEEFEE]">
                Top Talents
              </h1>
              <p className="text-base" style={{ color: "rgba(238,239,238,0.6)", fontFamily: "'Cairo', sans-serif" }}>
                Discover verified athletes across all sports and regions of Saudi Arabia.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="ada-card px-4 py-3 text-center">
                <div className="ada-stat-number text-2xl">{sampleAthletes.length}</div>
                <div className="text-xs" style={{ color: "rgba(238,239,238,0.45)", fontFamily: "'Cairo', sans-serif" }}>Athletes</div>
              </div>
              <div className="ada-card px-4 py-3 text-center">
                <div className="ada-stat-number text-2xl">8</div>
                <div className="text-xs" style={{ color: "rgba(238,239,238,0.45)", fontFamily: "'Cairo', sans-serif" }}>Sports</div>
              </div>
              <div className="ada-card px-4 py-3 text-center">
                <div className="ada-stat-number text-2xl">6</div>
                <div className="text-xs" style={{ color: "rgba(238,239,238,0.45)", fontFamily: "'Cairo', sans-serif" }}>Regions</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-6 sticky top-16 z-40"
        style={{ background: "rgba(0,10,15,0.95)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(0,220,200,0.08)" }}>
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: "rgba(238,239,238,0.35)" }} />
              <input
                type="text"
                placeholder="Search athletes by name, position..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm outline-none"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(0,220,200,0.15)",
                  color: "#EEEFEE",
                  fontFamily: "'Cairo', sans-serif",
                }}
              />
            </div>

            {/* Sport filter */}
            <select
              value={selectedSport}
              onChange={(e) => setSelectedSport(e.target.value)}
              className="px-4 py-2.5 rounded-lg text-sm outline-none"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(0,220,200,0.15)",
                color: "#EEEFEE",
                fontFamily: "'Cairo', sans-serif",
                minWidth: "140px",
              }}
            >
              {sports.map((s) => <option key={s} value={s} style={{ background: "#0D1E35" }}>{s}</option>)}
            </select>

            {/* Region filter */}
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="px-4 py-2.5 rounded-lg text-sm outline-none"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(0,220,200,0.15)",
                color: "#EEEFEE",
                fontFamily: "'Cairo', sans-serif",
                minWidth: "140px",
              }}
            >
              {regions.map((r) => <option key={r} value={r} style={{ background: "#0D1E35" }}>{r}</option>)}
            </select>

            {/* Age filter */}
            <select
              value={selectedAge}
              onChange={(e) => setSelectedAge(e.target.value)}
              className="px-4 py-2.5 rounded-lg text-sm outline-none"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(0,220,200,0.15)",
                color: "#EEEFEE",
                fontFamily: "'Cairo', sans-serif",
                minWidth: "120px",
              }}
            >
              {ageGroups.map((a) => <option key={a} value={a} style={{ background: "#0D1E35" }}>{a}</option>)}
            </select>
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="py-10">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm" style={{ color: "rgba(238,239,238,0.5)", fontFamily: "'Cairo', sans-serif" }}>
              Showing <span style={{ color: "#00DCC8" }}>{filtered.length}</span> athletes
            </p>
            <Link href="/upload">
              <button className="btn-ada-primary text-xs px-5 py-2.5 flex items-center gap-2">
                <Zap size={13} /> Add New Athlete
              </button>
            </Link>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-20">
              <Users size={48} className="mx-auto mb-4" style={{ color: "rgba(0,220,200,0.3)" }} />
              <p className="text-base mb-2 text-[#EEEFEE]" style={{ fontFamily: "'Orbitron', sans-serif" }}>No athletes found</p>
              <p className="text-sm" style={{ color: "rgba(238,239,238,0.45)", fontFamily: "'Cairo', sans-serif" }}>
                Try adjusting your search filters
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filtered.map((a) => <AthleteCard key={a.id} athlete={a} />)}
            </div>
          )}

          {/* Upload CTA */}
          <div className="mt-12 ada-card p-8 text-center"
            style={{ background: "rgba(0,220,200,0.03)", border: "1px solid rgba(0,220,200,0.12)" }}>
            <h3 className="font-orbitron font-bold text-xl mb-3 text-[#EEEFEE]">
              Add an Athlete to the Database
            </h3>
            <p className="text-sm mb-6"
              style={{ color: "rgba(238,239,238,0.6)", fontFamily: "'Cairo', sans-serif", lineHeight: 1.8 }}>
              Upload a photo or video and get a professional AI scout report. The athlete's profile will be added to the database automatically.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/upload">
                <button className="btn-ada-primary text-sm px-8 py-3 flex items-center gap-2">
                  <Zap size={15} /> Upload & Analyze
                </button>
              </Link>
              <Link href="/demo">
                <button className="btn-ada-outline text-sm px-8 py-3 flex items-center gap-2">
                  <Activity size={15} /> Try Demo First
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
