import { useState, useEffect, useRef } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { useLocation } from "wouter";

const homeNavLinks = [
  { href: "#problem", label: "المشكلة" },
  { href: "#solution", label: "الحل" },
  { href: "#how-it-works", label: "كيف يعمل" },
  { href: "#market", label: "السوق" },
  { href: "#pricing", label: "الأسعار" },
  { href: "#contact", label: "تواصل" },
];

const pageLinks = [
  { href: "/academies", label: "دليل الأكاديميات", desc: "10 أكاديميات بالخريطة" },
  { href: "/scouts", label: "لوحة الكشافين", desc: "12 لاعب موثق بالذكاء الاصطناعي" },
  { href: "/upload", label: "رفع فيديو", desc: "تحليل AI فوري" },
  { href: "/demo", label: "عرض تجريبي", desc: "جرب تقرير AI" },
  { href: "/compare", label: "مقارنة اللاعبين", desc: "Radar Chart مزدوج" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pagesOpen, setPagesOpen] = useState(false);
  const [location, navigate] = useLocation();
  const isHome = location === "/";
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setPagesOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleNavClick = (href: string) => {
    setMobileOpen(false);
    setPagesOpen(false);
    if (href.startsWith("#")) {
      if (!isHome) {
        navigate("/");
        setTimeout(() => {
          document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
        }, 300);
      } else {
        document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      navigate(href);
    }
  };

  const activePageLink = pageLinks.find((p) => p.href === location);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[oklch(0.08_0.02_240/0.95)] backdrop-blur-md border-b border-white/5"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button onClick={() => handleNavClick("/")} className="flex items-center gap-3 flex-shrink-0">
            <div className="w-9 h-9 rounded-lg bg-[oklch(0.65_0.2_145/0.15)] border border-[oklch(0.65_0.2_145/0.4)] flex items-center justify-center">
              <img
                src="https://d2xsxph8kpxj0f.cloudfront.net/115062705/gJEX8KKv2DgTKGvafGwXZn/scout-ai-brain-logo-CtBLNrDPCVHeGSTYrQgYk9.webp"
                alt="Scout AI"
                className="w-6 h-6 object-contain"
              />
            </div>
            <span className="font-bold text-xl text-white" style={{ fontFamily: "'Space Grotesk', sans-serif", direction: "ltr" }}>
              SCOUT <span className="neon-text">AI</span>
            </span>
          </button>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-4">
            {homeNavLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href)}
                className="text-sm text-white/55 hover:text-[oklch(0.65_0.2_145)] transition-colors duration-200"
                style={{ fontFamily: "'Tajawal', sans-serif" }}
              >
                {link.label}
              </button>
            ))}

            <div className="w-px h-4 bg-white/15" />

            {/* Pages dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setPagesOpen(!pagesOpen)}
                className={`flex items-center gap-1.5 text-sm transition-colors duration-200 ${
                  activePageLink ? "text-[oklch(0.65_0.2_145)]" : "text-white/70 hover:text-[oklch(0.65_0.2_145)]"
                }`}
                style={{ fontFamily: "'Tajawal', sans-serif" }}
              >
                {activePageLink ? activePageLink.label : "الصفحات"}
                <ChevronDown size={13} className={`transition-transform ${pagesOpen ? "rotate-180" : ""}`} />
              </button>

              {pagesOpen && (
                <div
                  className="absolute top-full mt-2 left-0 w-56 rounded-xl overflow-hidden shadow-2xl z-50"
                  style={{ background: "oklch(0.11 0.02 240)", border: "1px solid oklch(0.65 0.2 145 / 0.2)" }}
                >
                  {pageLinks.map((link) => (
                    <button
                      key={link.href}
                      onClick={() => handleNavClick(link.href)}
                      className={`w-full text-right px-4 py-3 transition-all hover:bg-[oklch(0.65_0.2_145/0.08)] border-b border-white/5 last:border-0 ${
                        location === link.href ? "bg-[oklch(0.65_0.2_145/0.1)]" : ""
                      }`}
                    >
                      <div className={`text-sm font-medium ${location === link.href ? "text-[oklch(0.65_0.2_145)]" : "text-white/80"}`} style={{ fontFamily: "'Tajawal', sans-serif" }}>
                        {link.label}
                        {location === link.href && <span className="mr-1 text-xs">●</span>}
                      </div>
                      <div className="text-white/30 text-xs mt-0.5" style={{ fontFamily: "'IBM Plex Sans Arabic', sans-serif" }}>{link.desc}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* CTA */}
          <div className="hidden lg:flex items-center gap-2">
            <button
              onClick={() => handleNavClick("/upload")}
              className="btn-outline-green text-sm px-4 py-2"
              style={{ fontFamily: "'Tajawal', sans-serif" }}
            >
              رفع فيديو
            </button>
            <button
              onClick={() => handleNavClick("#contact")}
              className="btn-primary text-sm px-4 py-2"
              style={{ fontFamily: "'Tajawal', sans-serif" }}
            >
              ابدأ الآن
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
        <div className="lg:hidden bg-[oklch(0.10_0.02_240/0.98)] backdrop-blur-md border-t border-white/5">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-1">
            {homeNavLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href)}
                className="text-right text-white/65 hover:text-[oklch(0.65_0.2_145)] py-2.5 border-b border-white/5 transition-colors text-sm"
                style={{ fontFamily: "'Tajawal', sans-serif" }}
              >
                {link.label}
              </button>
            ))}
            <div className="pt-2">
              <p className="text-white/25 text-xs mb-2 pt-1" style={{ fontFamily: "'Tajawal', sans-serif" }}>الصفحات</p>
              {pageLinks.map((link) => (
                <button
                  key={link.href}
                  onClick={() => handleNavClick(link.href)}
                  className={`w-full text-right py-2.5 border-b border-white/5 transition-colors text-sm ${
                    location === link.href ? "text-[oklch(0.65_0.2_145)]" : "text-white/75 hover:text-[oklch(0.65_0.2_145)]"
                  }`}
                  style={{ fontFamily: "'Tajawal', sans-serif" }}
                >
                  {link.label}
                </button>
              ))}
            </div>
            <div className="flex gap-2 mt-3">
              <button onClick={() => handleNavClick("/upload")} className="btn-outline-green flex-1 text-sm py-2" style={{ fontFamily: "'Tajawal', sans-serif" }}>رفع فيديو</button>
              <button onClick={() => handleNavClick("#contact")} className="btn-primary flex-1 text-sm py-2" style={{ fontFamily: "'Tajawal', sans-serif" }}>ابدأ الآن</button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
