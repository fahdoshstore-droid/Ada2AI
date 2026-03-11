import { useState, useEffect, useRef } from "react";
import { Menu, X, ChevronDown, Zap, Shield } from "lucide-react";
import { useLocation } from "wouter";

const homeNavLinks = [
  { href: "#problem", label: "المشكلة" },
  { href: "#solution", label: "الحل" },
  { href: "#how-it-works", label: "كيف يعمل" },
  { href: "#market", label: "السوق" },
  { href: "#pricing", label: "الأسعار" },
  { href: "#contact", label: "تواصل" },
];

const scoutLinks = [
  { href: "/demo", label: "عرض تجريبي", desc: "تقرير AI تفاعلي", icon: "🤖" },
  { href: "/scouts", label: "لوحة الكشافين", desc: "12 لاعب موثق", icon: "🔍" },
  { href: "/upload", label: "رفع فيديو", desc: "تحليل AI فوري", icon: "📹" },
  { href: "/compare", label: "مقارنة اللاعبين", desc: "Radar Chart مزدوج", icon: "⚖️" },
  { href: "/academies", label: "دليل الأكاديميات", desc: "10 أكاديميات بالخريطة", icon: "🗺️" },
];

const sportIDLinks = [
  { href: "/sportid", label: "جواز السفر الرياضي", desc: "هويتك الرقمية الموثقة", icon: "🪪" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scoutOpen, setScoutOpen] = useState(false);
  const [sportOpen, setSportOpen] = useState(false);
  const [location, navigate] = useLocation();
  const isHome = location === "/";
  const scoutRef = useRef<HTMLDivElement>(null);
  const sportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (scoutRef.current && !scoutRef.current.contains(e.target as Node)) setScoutOpen(false);
      if (sportRef.current && !sportRef.current.contains(e.target as Node)) setSportOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleNavClick = (href: string) => {
    setMobileOpen(false);
    setScoutOpen(false);
    setSportOpen(false);
    if (href.startsWith("#")) {
      if (!isHome) {
        navigate("/");
        setTimeout(() => document.querySelector(href)?.scrollIntoView({ behavior: "smooth" }), 300);
      } else {
        document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      navigate(href);
    }
  };

  const isScoutPage = scoutLinks.some((l) => l.href === location);
  const isSportPage = sportIDLinks.some((l) => l.href === location);

  const DropdownMenu = ({ links, color }: { links: typeof scoutLinks; color: string }) => (
    <div className="absolute top-full mt-2 right-0 w-60 rounded-xl overflow-hidden shadow-2xl z-50" style={{ background: "#0A1628", border: `1px solid ${color}30` }}>
      {links.map((link) => (
        <button key={link.href} onClick={() => handleNavClick(link.href)} className="w-full text-right px-4 py-3 transition-all border-b border-white/5 last:border-0 flex items-center gap-3 group" style={{ background: location === link.href ? `${color}10` : "transparent" }}>
          <span className="text-xl flex-shrink-0">{link.icon}</span>
          <div className="flex-1 text-right">
            <div className="text-sm font-medium transition-colors" style={{ color: location === link.href ? color : "rgba(255,255,255,0.8)", fontFamily: "'Tajawal', sans-serif" }}>{link.label}</div>
            <div className="text-white/30 text-xs mt-0.5" style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}>{link.desc}</div>
          </div>
        </button>
      ))}
    </div>
  );

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "backdrop-blur-md border-b border-white/5" : "bg-transparent"}`} style={{ background: scrolled ? "rgba(7,16,32,0.95)" : "transparent" }}>
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo — SportScout brand */}
          <button onClick={() => handleNavClick("/")} className="flex items-center gap-3 flex-shrink-0">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: "rgba(0,194,168,0.12)", border: "1px solid rgba(0,194,168,0.35)" }}>
              <span className="text-lg">⚽</span>
            </div>
            <div className="flex flex-col items-start">
              <span className="font-black text-lg text-white leading-none" style={{ fontFamily: "'Space Grotesk', sans-serif", direction: "ltr" }}>
                Sport<span style={{ color: "#00C2A8" }}>Scout</span>
              </span>
              <span className="text-white/30 text-[9px] leading-none" style={{ fontFamily: "'Tajawal', sans-serif" }}>Scout AI · SportID</span>
            </div>
          </button>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-3">
            {homeNavLinks.map((link) => (
              <button key={link.href} onClick={() => handleNavClick(link.href)} className="text-sm text-white/50 hover:text-white/90 transition-colors" style={{ fontFamily: "'Tajawal', sans-serif" }}>
                {link.label}
              </button>
            ))}

            <div className="w-px h-4 bg-white/15" />

            {/* Scout AI dropdown */}
            <div className="relative" ref={scoutRef}>
              <button onClick={() => { setScoutOpen(!scoutOpen); setSportOpen(false); }} className={`flex items-center gap-1.5 text-sm transition-colors px-3 py-1.5 rounded-lg ${isScoutPage || scoutOpen ? "text-[oklch(0.65_0.2_145)] bg-[oklch(0.65_0.2_145/0.1)]" : "text-white/60 hover:text-white"}`} style={{ fontFamily: "'Tajawal', sans-serif" }}>
                <Zap size={13} /> Scout AI <ChevronDown size={12} className={`transition-transform ${scoutOpen ? "rotate-180" : ""}`} />
              </button>
              {scoutOpen && <DropdownMenu links={scoutLinks} color="oklch(0.65 0.2 145)" />}
            </div>

            {/* SportID dropdown */}
            <div className="relative" ref={sportRef}>
              <button onClick={() => { setSportOpen(!sportOpen); setScoutOpen(false); }} className={`flex items-center gap-1.5 text-sm transition-colors px-3 py-1.5 rounded-lg ${isSportPage || sportOpen ? "text-[#00C2A8] bg-[rgba(0,194,168,0.1)]" : "text-white/60 hover:text-white"}`} style={{ fontFamily: "'Tajawal', sans-serif" }}>
                <Shield size={13} /> SportID <ChevronDown size={12} className={`transition-transform ${sportOpen ? "rotate-180" : ""}`} />
              </button>
              {sportOpen && <DropdownMenu links={sportIDLinks} color="#00C2A8" />}
            </div>
          </div>

          {/* CTA */}
          <div className="hidden lg:flex items-center gap-2">
            <button onClick={() => handleNavClick("/sportid")} className="text-sm px-4 py-2 rounded-xl font-semibold transition-all hover:opacity-90 flex items-center gap-1.5" style={{ background: "rgba(0,194,168,0.12)", border: "1px solid rgba(0,194,168,0.35)", color: "#00C2A8", fontFamily: "'Tajawal', sans-serif" }}>
              <Shield size={13} /> SportID
            </button>
            <button onClick={() => handleNavClick("/upload")} className="btn-primary text-sm px-4 py-2 flex items-center gap-1.5" style={{ fontFamily: "'Tajawal', sans-serif" }}>
              <Zap size={13} /> تحليل AI
            </button>
          </div>

          {/* Mobile Toggle */}
          <button className="lg:hidden text-white/70 hover:text-white" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden backdrop-blur-md border-t border-white/5" style={{ background: "rgba(7,16,32,0.98)" }}>
          <div className="container mx-auto px-4 py-4 flex flex-col gap-1">
            {homeNavLinks.map((link) => (
              <button key={link.href} onClick={() => handleNavClick(link.href)} className="text-right text-white/60 hover:text-white py-2.5 border-b border-white/5 transition-colors text-sm" style={{ fontFamily: "'Tajawal', sans-serif" }}>
                {link.label}
              </button>
            ))}

            <div className="pt-2">
              <p className="text-[oklch(0.65_0.2_145)] text-xs font-bold mb-1 pt-1 flex items-center gap-1" style={{ fontFamily: "'Tajawal', sans-serif" }}><Zap size={11} /> Scout AI</p>
              {scoutLinks.map((link) => (
                <button key={link.href} onClick={() => handleNavClick(link.href)} className={`w-full text-right py-2.5 border-b border-white/5 transition-colors text-sm flex items-center gap-2 ${location === link.href ? "text-[oklch(0.65_0.2_145)]" : "text-white/70"}`} style={{ fontFamily: "'Tajawal', sans-serif" }}>
                  <span>{link.icon}</span>{link.label}
                </button>
              ))}
            </div>

            <div className="pt-2">
              <p className="text-[#00C2A8] text-xs font-bold mb-1 pt-1 flex items-center gap-1" style={{ fontFamily: "'Tajawal', sans-serif" }}><Shield size={11} /> SportID</p>
              {sportIDLinks.map((link) => (
                <button key={link.href} onClick={() => handleNavClick(link.href)} className={`w-full text-right py-2.5 border-b border-white/5 transition-colors text-sm flex items-center gap-2 ${location === link.href ? "text-[#00C2A8]" : "text-white/70"}`} style={{ fontFamily: "'Tajawal', sans-serif" }}>
                  <span>{link.icon}</span>{link.label}
                </button>
              ))}
            </div>

            <div className="flex gap-2 mt-3">
              <button onClick={() => handleNavClick("/sportid")} className="flex-1 text-sm py-2.5 rounded-xl font-semibold flex items-center justify-center gap-1.5" style={{ background: "rgba(0,194,168,0.12)", border: "1px solid rgba(0,194,168,0.35)", color: "#00C2A8", fontFamily: "'Tajawal', sans-serif" }}>
                <Shield size={13} /> SportID
              </button>
              <button onClick={() => handleNavClick("/upload")} className="btn-primary flex-1 text-sm py-2.5 flex items-center justify-center gap-1.5" style={{ fontFamily: "'Tajawal', sans-serif" }}>
                <Zap size={13} /> تحليل AI
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
