import Ada2aiNavbar from "@/components/Ada2aiNavbar";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRef, useState, useEffect } from "react";
import { MapView } from "@/components/Map";
import BackButton from "@/components/BackButton";


import { MapPin, Star, Users, Phone, MessageCircle, Filter, Search, X } from "lucide-react";

// 10 local academies in Eastern Province
const academies = [
  {
    id: 1,
    name: "أكاديمية كابتن",
    city: "دمام",
    sport: "كرة القدم",
    ageRange: "6-18",
    rating: 4.8,
    students: 320,
    phone: "+966501234567",
    address: "حي الشاطئ، دمام",
    lat: 26.4207,
    lng: 50.0888,
    tags: ["كرة قدم", "تدريب احترافي", "Professional Standards معتمد"],
    description: "من أبرز أكاديميات كرة القدم في المنطقة الشرقية، تأسست عام 2010 وخرّجت عدداً من اللاعبين الاحترافيين.",
    color: "#1db954",
  },
  {
    id: 2,
    name: "أكاديمية الظهران الرياضية",
    city: "ظهران",
    sport: "كرة القدم",
    ageRange: "8-20",
    rating: 4.6,
    students: 280,
    phone: "+966502345678",
    address: "حي الفيصلية، ظهران",
    lat: 26.2794,
    lng: 50.1521,
    tags: ["كرة قدم", "تطوير مهارات", "بطولات محلية"],
    description: "أكاديمية متخصصة في تطوير مهارات الشباب وإعدادهم للمستوى الاحترافي.",
    color: "#1db954",
  },
  {
    id: 3,
    name: "أكاديمية الموهبة الكروية",
    city: "خبر",
    sport: "كرة القدم",
    ageRange: "5-16",
    rating: 4.7,
    students: 210,
    phone: "+966503456789",
    address: "حي العزيزية، الخبر",
    lat: 26.2172,
    lng: 50.1971,
    tags: ["كرة قدم", "براعم", "تدريب متخصص"],
    description: "تركز على اكتشاف المواهب المبكرة وتأهيل اللاعبين من سن 5 سنوات.",
    color: "#1db954",
  },
  {
    id: 4,
    name: "نادي الاتحاد الرياضي",
    city: "دمام",
    sport: "متعدد",
    ageRange: "10-25",
    rating: 4.5,
    students: 450,
    phone: "+966504567890",
    address: "حي الروضة، دمام",
    lat: 26.4367,
    lng: 50.1033,
    tags: ["كرة قدم", "كرة سلة", "سباحة"],
    description: "نادٍ رياضي شامل يضم أقساماً متعددة للرياضات المختلفة.",
    color: "#f59e0b",
  },
  {
    id: 5,
    name: "أكاديمية النجوم الصاعدة",
    city: "خبر",
    sport: "كرة القدم",
    ageRange: "7-17",
    rating: 4.4,
    students: 180,
    phone: "+966505678901",
    address: "حي الثقبة، الخبر",
    lat: 26.2419,
    lng: 50.2147,
    tags: ["كرة قدم", "تدريب فني", "معسكرات"],
    description: "تتميز بمناهج تدريبية متطورة وكوادر تدريبية مؤهلة دولياً.",
    color: "#1db954",
  },
  {
    id: 6,
    name: "مدرسة الأبطال الرياضية",
    city: "دمام",
    sport: "كرة القدم",
    ageRange: "6-14",
    rating: 4.3,
    students: 150,
    phone: "+966506789012",
    address: "حي المريكبات، دمام",
    lat: 26.4012,
    lng: 50.0756,
    tags: ["براعم", "ناشئين", "تأسيس"],
    description: "متخصصة في المرحلة التأسيسية لكرة القدم للأطفال والناشئين.",
    color: "#1db954",
  },
  {
    id: 7,
    name: "أكاديمية الخليج للرياضة",
    city: "ظهران",
    sport: "متعدد",
    ageRange: "8-22",
    rating: 4.6,
    students: 380,
    phone: "+966507890123",
    address: "حي الدوحة، ظهران",
    lat: 26.2956,
    lng: 50.1689,
    tags: ["كرة قدم", "تنس", "سباحة"],
    description: "أكاديمية شاملة تقدم برامج رياضية متنوعة بمستوى عالمي.",
    color: "#f59e0b",
  },
  {
    id: 8,
    name: "أكاديمية الشرقية للكرة",
    city: "خبر",
    sport: "كرة القدم",
    ageRange: "9-19",
    rating: 4.5,
    students: 220,
    phone: "+966508901234",
    address: "حي الصفا، الخبر",
    lat: 26.2283,
    lng: 50.2089,
    tags: ["كرة قدم", "تكتيك", "لياقة بدنية"],
    description: "تعتمد أساليب تدريب حديثة مع التركيز على الجانب التكتيكي والبدني.",
    color: "#1db954",
  },
  {
    id: 9,
    name: "نادي الفتح الرياضي",
    city: "دمام",
    sport: "كرة القدم",
    ageRange: "12-25",
    rating: 4.9,
    students: 500,
    phone: "+966509012345",
    address: "ملعب الأمير محمد بن فهد، دمام",
    lat: 26.4552,
    lng: 50.1198,
    tags: ["احترافي", "دوري", "Professional Standards"],
    description: "الفريق الاحترافي الأبرز في المنطقة الشرقية مع أكاديمية شبابية متكاملة.",
    color: "#ef4444",
  },
  {
    id: 10,
    name: "أكاديمية الرياضة والتميز",
    city: "ظهران",
    sport: "متعدد",
    ageRange: "6-20",
    rating: 4.4,
    students: 260,
    phone: "+966500123456",
    address: "حي العمل، ظهران",
    lat: 26.3112,
    lng: 50.1445,
    tags: ["كرة قدم", "ألعاب قوى", "تطوير شامل"],
    description: "تجمع بين التميز الأكاديمي والرياضي لبناء جيل واعد من الرياضيين.",
    color: "#f59e0b",
  },
];

const cities = ["الكل", "دمام", "خبر", "ظهران"];
const sports = ["الكل", "كرة القدم", "متعدد"];
const ageGroups = ["الكل", "5-10", "10-15", "15-25"];

export default function Academies() {
  const { isRTL, t, lang } = useLanguage();
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const [selectedCity, setSelectedCity] = useState("الكل");
  const [selectedSport, setSelectedSport] = useState("الكل");
  const [selectedAge, setSelectedAge] = useState("الكل");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAcademy, setSelectedAcademy] = useState<typeof academies[0] | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const filtered = academies.filter((a) => {
    const cityMatch = selectedCity === "الكل" || a.city === selectedCity;
    const sportMatch = selectedSport === "الكل" || a.sport === selectedSport;
    const searchMatch =
      searchQuery === "" ||
      a.name.includes(searchQuery) ||
      a.city.includes(searchQuery);
    const ageMatch =
      selectedAge === "الكل" ||
      (selectedAge === "5-10" && parseInt(a.ageRange) <= 10) ||
      (selectedAge === "10-15" && parseInt(a.ageRange) >= 8 && parseInt(a.ageRange.split("-")[1]) >= 12) ||
      (selectedAge === "15-25" && parseInt(a.ageRange.split("-")[1]) >= 15);
    return cityMatch && sportMatch && searchMatch && ageMatch;
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
    academies.forEach((academy) => {
      const markerEl = document.createElement("div");
      markerEl.innerHTML = `
        <div style="
          background: ${academy.color};
          color: #0d1117;
          border-radius: 50%;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          font-size: 14px;
          box-shadow: 0 0 15px ${academy.color}88;
          cursor: pointer;
          font-family: 'Space Grotesk', sans-serif;
          border: 2px solid rgba(255,255,255,0.2);
        ">${academy.id}</div>
      `;

      const marker = new google.maps.marker.AdvancedMarkerElement({
        map,
        position: { lat: academy.lat, lng: academy.lng },
        title: academy.name,
        content: markerEl,
      });

      marker.addListener("click", () => {
        setSelectedAcademy(academy);
        map.panTo({ lat: academy.lat, lng: academy.lng });
        map.setZoom(14);
      });

      markersRef.current.push(marker);
    });
  };

  const focusAcademy = (academy: typeof academies[0]) => {
    setSelectedAcademy(academy);
    if (mapRef.current) {
      mapRef.current.panTo({ lat: academy.lat, lng: academy.lng });
      mapRef.current.setZoom(15);
    }
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
              {filtered.map((academy) => (
                <div
                  key={academy.id}
                  onClick={() => focusAcademy(academy)}
                  className={`card-dark rounded-xl p-4 cursor-pointer transition-all duration-300 ${
                    selectedAcademy?.id === academy.id ? "neon-border" : "hover:border-white/20"
                  }`}
                  style={{
                    borderRight: `3px solid ${academy.color}`,
                  }}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3
                      className="text-[#EEEFEE] font-bold text-base leading-tight"
                      style={{ fontFamily: "'Tajawal', sans-serif" }}
                    >
                      {academy.name}
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
                        {academy.students}+
                      </span>
                    </div>
                    <span className="tag-green text-xs">{academy.sport}</span>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {academy.tags.slice(0, 2).map((tag, i) => (
                      <span
                        key={i}
                        className="bg-white/5 text-[#EEEFEE]/40 text-xs px-2 py-0.5 rounded"
                        style={{ fontFamily: "'Tajawal', sans-serif" }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <a
                      href={`https://wa.me/${academy.phone.replace("+", "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                      style={{
                        background: "oklch(0.65 0.2 145 / 0.1)",
                        border: "1px solid oklch(0.65 0.2 145 / 0.25)",
                        color: "oklch(0.65 0.2 145)",
                        fontFamily: "'Tajawal', sans-serif",
                      }}
                    >
                      <MessageCircle size={12} />
                      واتساب
                    </a>
                    <a
                      href={`tel:${academy.phone}`}
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all bg-white/5 border border-white/10 text-[#EEEFEE]/50 hover:text-[#EEEFEE]"
                      style={{ fontFamily: "'Tajawal', sans-serif" }}
                    >
                      <Phone size={12} />
                      اتصل
                    </a>
                  </div>
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
                  style={{ border: `1px solid ${selectedAcademy.color}44` }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4
                        className="text-[#EEEFEE] font-bold text-base mb-1"
                        style={{ fontFamily: "'Tajawal', sans-serif" }}
                      >
                        {selectedAcademy.name}
                      </h4>
                      <p
                        className="text-[#EEEFEE]/50 text-xs mb-2"
                        style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}
                      >
                        {selectedAcademy.description}
                      </p>
                      <div className="flex items-center gap-2 text-[#EEEFEE]/40 text-xs">
                        <MapPin size={11} />
                        <span style={{ fontFamily: "'Tajawal', sans-serif" }}>{selectedAcademy.address}</span>
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
