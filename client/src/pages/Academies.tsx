import Ada2aiNavbar from "@/components/Ada2aiNavbar";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRef, useState, useEffect } from "react";
import { MapView } from "@/components/Map";
import BackButton from "@/components/BackButton";

import { MapPin, Star, Users, Phone, MessageCircle, Filter, Search, X } from "lucide-react";

interface Academy {
  id: string;
  name: string;
  name_ar: string;
  sport: string;
  region: string;
  city: string;
  description: string;
  description_ar: string;
  rating: number;
  player_count: number;
  verified: boolean;
}

const cities = ["الكل", "دمام", "خبر", "ظهران"];
const sports = ["الكل", "كرة القدم", "متعدد"];
const ageGroups = ["الكل", "5-10", "10-15", "15-25"];

export default function Academies() {
  const { isRTL, t, lang } = useLanguage();
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const [academies, setAcademies] = useState<Academy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState("الكل");
  const [selectedSport, setSelectedSport] = useState("الكل");
  const [selectedAge, setSelectedAge] = useState("الكل");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAcademy, setSelectedAcademy] = useState<Academy | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);
    if (selectedCity !== "الكل") params.set("city", selectedCity);
    if (selectedSport !== "الكل") params.set("sport", selectedSport);
    const qs = params.toString();
    const url = `/api/academies${qs ? `?${qs}` : ""}`;

    setLoading(true);
    fetch(url)
      .then(r => r.json())
      .then(d => { setAcademies(d); setLoading(false); })
      .catch(e => { console.error('Academies fetch error:', e); setError(e.message); setLoading(false); });
  }, [searchQuery, selectedCity, selectedSport]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2" style={{ borderColor: "#00DCC8", borderTopColor: "transparent" }}></div>
      <span className="ml-3 text-sm" style={{ color: "rgba(238,239,238,0.6)", fontFamily: "'Cairo', sans-serif" }}>Loading academies...</span>
    </div>
  );
  if (error) return <div className="text-red-500 text-center p-8">Error: {error}</div>;

  const filtered = academies.filter((a) => {
    const cityMatch = selectedCity === "الكل" || a.city === selectedCity;
    const sportMatch = selectedSport === "الكل" || a.sport === selectedSport;
    const searchMatch =
      searchQuery === "" ||
      a.name.includes(searchQuery) ||
      (a.name_ar && a.name_ar.includes(searchQuery)) ||
      a.city.includes(searchQuery);
    return cityMatch && sportMatch && searchMatch;
  });

  const handleMapReady = (map: google.maps.Map) => {
    mapRef.current = map;

    // Dark map style
    map.setOptions({
      styles: [
        { elementType: "geometry", stylers: [{ color: "#0d1117" }] },
        { elementType: "labels.text.stroke", stylers: [{ color: "#0d1117" }] },
        { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
        { featureType: "road", elementType: "geometry", stylers: [{ color: "#1a1f2e" }] },
        { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#212a37" }] },
        { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#9ca5b3" }] },
        { featureType: "water", elementType: "geometry", stylers: [{ color: "#0a0e1a" }] },
        { featureType: "poi", stylers: [{ visibility: "off" }] },
      ],
    });

    // Add markers
    academies.forEach((academy, idx) => {
      // Default to Eastern Province center if no lat/lng from API
      const colors = ["#1db954", "#f59e0b", "#ef4444", "#3b82f6"];
      const color = colors[idx % colors.length];
      const lat = 26.35 + (idx * 0.015);
      const lng = 50.10 + (idx * 0.018);

      const markerEl = document.createElement("div");
      markerEl.innerHTML = `
        <div style="
          background: ${color};
          color: #0d1117;
          border-radius: 50%;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          font-size: 14px;
          box-shadow: 0 0 15px ${color}88;
          cursor: pointer;
          font-family: 'Space Grotesk', sans-serif;
          border: 2px solid rgba(255,255,255,0.2);
        ">${academy.id}</div>
      `;

      const marker = new google.maps.marker.AdvancedMarkerElement({
        map,
        position: { lat, lng },
        title: academy.name,
        content: markerEl,
      });

      marker.addListener("click", () => {
        setSelectedAcademy(academy);
        map.panTo({ lat, lng });
        map.setZoom(14);
      });

      markersRef.current.push(marker);
    });
  };

  const focusAcademy = (academy: Academy) => {
    setSelectedAcademy(academy);
    if (mapRef.current) {
      const idx = academies.findIndex(a => a.id === academy.id);
      const lat = 26.35 + (idx * 0.015);
      const lng = 50.10 + (idx * 0.018);
      mapRef.current.panTo({ lat, lng });
      mapRef.current.setZoom(15);
    }
  };

  const getAcademyColor = (idx: number) => {
    const colors = ["#1db954", "#f59e0b", "#ef4444", "#3b82f6"];
    return colors[idx % colors.length];
  };

  return (
    <div className="min-h-screen bg-[#000A0F] text-[#EEEFEE]" dir={isRTL ? "rtl" : "ltr"}>
      <Ada2aiNavbar />

      {/* Header */}
      <section className="pt-24 pb-10 relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-20" />
        <div className="container mx-auto px-4 relative z-10">
          <BackButton fallbackRoute="/" />
          <div className="text-center mb-8">
            <span className="tag-green mb-4">{lang === "ar" ? "دليل الأكاديميات" : "Academies Directory"}</span>
            <h1
              className="text-4xl md:text-5xl font-black text-[#EEEFEE] mb-3 mt-4"
              style={{ fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}
            >
              {lang === "ar" ? "أكاديميات المنطقة الشرقية" : "Eastern Province Academies"}
            </h1>
            <p
              className="text-[#EEEFEE]/50 text-lg"
              style={{ fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}
            >
              {lang === "ar" ? `${academies.length} أكاديمية ونادٍ في دمام، خبر، وظهران` : `${academies.length} academies and clubs in Dammam, Khobar, and Dhahran`}
            </p>
          </div>

          {/* Search + Filters */}
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-3 mb-4">
              <div className="flex-1 relative">
                <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#EEEFEE]/30" />
                <input
                  type="text"
                  placeholder={lang === "ar" ? "ابحث عن أكاديمية..." : "Search academies..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#0A1628] border border-white/10 rounded-lg pr-10 pl-4 py-2.5 text-[#EEEFEE] placeholder-white/30 text-sm focus:outline-none focus:border-[oklch(0.65_0.2_145/0.5)]"
                  style={{ fontFamily: "'Tajawal', sans-serif" }}
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                  showFilters
                    ? "bg-[oklch(0.65_0.2_145/0.15)] border-[oklch(0.65_0.2_145/0.5)] text-[oklch(0.65_0.2_145)]"
                    : "bg-[#0A1628] border-white/10 text-[#EEEFEE]/60"
                }`}
                style={{ fontFamily: "'Tajawal', sans-serif" }}
              >
                <Filter size={15} />
                {lang === "ar" ? "فلاتر" : "Filters"}
              </button>
            </div>

            {showFilters && (
              <div className="card-dark rounded-xl p-4 mb-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[#EEEFEE]/40 text-xs mb-2 block" style={{ fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>{lang === "ar" ? "المدينة" : "City"}</label>
                  <div className="flex flex-wrap gap-2">
                    {cities.map((c) => (
                      <button
                        key={c}
                        onClick={() => setSelectedCity(c)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                          selectedCity === c ? "bg-[oklch(0.65_0.2_145)] text-[oklch(0.08_0.02_240)]" : "bg-white/5 text-[#EEEFEE]/50 hover:bg-white/10"
                        }`}
                        style={{ fontFamily: "'Tajawal', sans-serif" }}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[#EEEFEE]/40 text-xs mb-2 block" style={{ fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>{lang === "ar" ? "الرياضة" : "Sport"}</label>
                  <div className="flex flex-wrap gap-2">
                    {sports.map((s) => (
                      <button
                        key={s}
                        onClick={() => setSelectedSport(s)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                          selectedSport === s ? "bg-[oklch(0.65_0.2_145)] text-[oklch(0.08_0.02_240)]" : "bg-white/5 text-[#EEEFEE]/50 hover:bg-white/10"
                        }`}
                        style={{ fontFamily: "'Tajawal', sans-serif" }}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[#EEEFEE]/40 text-xs mb-2 block" style={{ fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>{lang === "ar" ? "الفئة العمرية" : "Age Group"}</label>
                  <div className="flex flex-wrap gap-2">
                    {ageGroups.map((ag) => (
                      <button
                        key={ag}
                        onClick={() => setSelectedAge(ag)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                          selectedAge === ag ? "bg-[oklch(0.65_0.2_145)] text-[oklch(0.08_0.02_240)]" : "bg-white/5 text-[#EEEFEE]/50 hover:bg-white/10"
                        }`}
                        style={{ fontFamily: "'Tajawal', sans-serif", direction: "ltr" }}
                      >
                        {ag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="text-[#EEEFEE]/35 text-sm" style={{ fontFamily: isRTL ? "'Cairo', sans-serif" : "inherit" }}>
              {lang === "ar" ? `عرض ${filtered.length} من ${academies.length} أكاديمية` : `Showing ${filtered.length} of ${academies.length} academies`}
            </div>
          </div>
        </div>
      </section>

      {/* Map + List */}
      <section className="pb-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
            {/* Academies list */}
            <div className="lg:col-span-2 space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {filtered.map((academy, idx) => (
                <div
                  key={academy.id}
                  onClick={() => focusAcademy(academy)}
                  className={`card-dark rounded-xl p-4 cursor-pointer transition-all duration-300 ${
                    selectedAcademy?.id === academy.id ? "neon-border" : "hover:border-white/20"
                  }`}
                  style={{
                    borderRight: `3px solid ${getAcademyColor(idx)}`,
                  }}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3
                      className="text-[#EEEFEE] font-bold text-base leading-tight"
                      style={{ fontFamily: "'Tajawal', sans-serif" }}
                    >
                      {lang === "ar" && academy.name_ar ? academy.name_ar : academy.name}
                    </h3>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Star size={12} className="text-yellow-400 fill-yellow-400" />
                      <span
                        className="text-yellow-400 text-xs font-bold"
                        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                      >
                        {academy.rating}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center gap-1 text-[#EEEFEE]/45 text-xs">
                      <MapPin size={11} />
                      <span style={{ fontFamily: "'Tajawal', sans-serif" }}>{academy.city}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[#EEEFEE]/45 text-xs">
                      <Users size={11} />
                      <span style={{ fontFamily: "'Space Grotesk', sans-serif", direction: "ltr" }}>
                        {academy.player_count}+
                      </span>
                    </div>
                    <span className="tag-green text-xs">{academy.sport}</span>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <span className={`text-xs px-2 py-0.5 rounded ${academy.verified ? "bg-green-500/10 text-green-400 border border-green-500/30" : "bg-white/5 text-[#EEEFEE]/40"}`}>
                      {academy.verified ? "✓ Verified" : "Unverified"}
                    </span>
                  </div>

                  <p
                    className="text-[#EEEFEE]/50 text-xs mb-2 line-clamp-2"
                    style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
                  >
                    {lang === "ar" && academy.description_ar ? academy.description_ar : academy.description}
                  </p>
                </div>
              ))}

              {filtered.length === 0 && (
                <div className="text-center py-12 text-[#EEEFEE]/30">
                  <p style={{ fontFamily: "'Tajawal', sans-serif" }}>لا توجد نتائج للفلاتر المحددة</p>
                </div>
              )}
            </div>

            {/* Map */}
            <div className="lg:col-span-3 relative">
              <div className="rounded-2xl overflow-hidden neon-border" style={{ height: "600px" }}>
                <MapView
                  className="w-full h-full"
                  initialCenter={{ lat: 26.35, lng: 50.15 }}
                  initialZoom={11}
                  onMapReady={handleMapReady}
                />
              </div>

              {/* Selected academy popup */}
              {selectedAcademy && (
                <div
                  className="absolute bottom-4 left-4 right-4 card-dark rounded-xl p-4"
                  style={{ border: `1px solid ${getAcademyColor(academies.findIndex(a => a.id === selectedAcademy.id))}44` }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4
                        className="text-[#EEEFEE] font-bold text-base mb-1"
                        style={{ fontFamily: "'Tajawal', sans-serif" }}
                      >
                        {lang === "ar" && selectedAcademy.name_ar ? selectedAcademy.name_ar : selectedAcademy.name}
                      </h4>
                      <p
                        className="text-[#EEEFEE]/50 text-xs mb-2"
                        style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
                      >
                        {lang === "ar" && selectedAcademy.description_ar ? selectedAcademy.description_ar : selectedAcademy.description}
                      </p>
                      <div className="flex items-center gap-2 text-[#EEEFEE]/40 text-xs">
                        <MapPin size={11} />
                        <span style={{ fontFamily: "'Tajawal', sans-serif" }}>{selectedAcademy.city}, {selectedAcademy.region}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedAcademy(null)}
                      className="text-[#EEEFEE]/30 hover:text-[#EEEFEE] transition-colors flex-shrink-0"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      
    </div>
  );
}