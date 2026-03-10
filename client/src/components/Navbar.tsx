import { useState, useEffect } from "react";
import { Menu, X, ExternalLink } from "lucide-react";
import { useLocation } from "wouter";

const homeNavLinks = [
  { href: "#problem", label: "المشكلة" },
  { href: "#solution", label: "الحل" },
  { href: "#how-it-works", label: "كيف يعمل" },
  { href: "#market", label: "السوق" },
  { href: "#pricing", label: "الأسعار" },
  { href: "#tech", label: "التقنية" },
  { href: "#contact", label: "تواصل معنا" },
];

const pageLinks = [
  { href: "/academies", label: "دليل الأكاديميات" },
  { href: "/demo", label: "عرض تجريبي" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [location, navigate] = useLocation();
  const isHome = location === "/";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setMobileOpen(false);
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
          <button
            onClick={() => handleNavClick("/")}
            className="flex items-center gap-3"
          >
            <div className="w-9 h-9 rounded-lg bg-[oklch(0.65_0.2_145/0.15)] border border-[oklch(0.65_0.2_145/0.4)] flex items-center justify-center">
              <img
                src="https://d2xsxph8kpxj0f.cloudfront.net/115062705/gJEX8KKv2DgTKGvafGwXZn/scout-ai-brain-logo-CtBLNrDPCVHeGSTYrQgYk9.webp"
                alt="Scout AI"
                className="w-6 h-6 object-contain"
              />
            </div>
            <span
              className="font-bold text-xl text-white"
              style={{ fontFamily: "'Space Grotesk', sans-serif", direction: "ltr" }}
            >
              SCOUT <span className="neon-text">AI</span>
            </span>
          </button>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-5">
            {homeNavLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href)}
                className="text-sm text-white/60 hover:text-[oklch(0.65_0.2_145)] transition-colors duration-200 font-medium"
                style={{ fontFamily: "'Tajawal', sans-serif" }}
              >
                {link.label}
              </button>
            ))}
            <div className="w-px h-4 bg-white/15" />
            {pageLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href)}
                className={`text-sm transition-colors duration-200 font-medium flex items-center gap-1 ${
                  location === link.href
                    ? "text-[oklch(0.65_0.2_145)]"
                    : "text-white/80 hover:text-[oklch(0.65_0.2_145)]"
                }`}
                style={{ fontFamily: "'Tajawal', sans-serif" }}
              >
                {link.label}
                {location === link.href && (
                  <div className="w-1.5 h-1.5 rounded-full bg-[oklch(0.65_0.2_145)]" />
                )}
              </button>
            ))}
          </div>

          {/* CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <button
              onClick={() => handleNavClick("/demo")}
              className="btn-outline-green text-sm px-4 py-2"
              style={{ fontFamily: "'Tajawal', sans-serif" }}
            >
              عرض تجريبي
            </button>
            <button
              onClick={() => handleNavClick("#contact")}
              className="btn-primary text-sm px-5 py-2"
              style={{ fontFamily: "'Tajawal', sans-serif" }}
            >
              ابدأ الآن
            </button>
          </div>

          {/* Mobile Toggle */}
          <button
            className="lg:hidden text-white/70 hover:text-white"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
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
                className="text-right text-white/70 hover:text-[oklch(0.65_0.2_145)] py-2.5 border-b border-white/5 transition-colors text-sm"
                style={{ fontFamily: "'Tajawal', sans-serif" }}
              >
                {link.label}
              </button>
            ))}
            <div className="pt-2 pb-1">
              <p className="text-white/25 text-xs mb-2" style={{ fontFamily: "'Tajawal', sans-serif" }}>
                الصفحات
              </p>
              {pageLinks.map((link) => (
                <button
                  key={link.href}
                  onClick={() => handleNavClick(link.href)}
                  className={`w-full text-right py-2.5 border-b border-white/5 transition-colors text-sm flex items-center justify-between ${
                    location === link.href
                      ? "text-[oklch(0.65_0.2_145)]"
                      : "text-white/80 hover:text-[oklch(0.65_0.2_145)]"
                  }`}
                  style={{ fontFamily: "'Tajawal', sans-serif" }}
                >
                  {link.label}
                  <ExternalLink size={13} className="opacity-40" />
                </button>
              ))}
            </div>
            <button
              onClick={() => handleNavClick("#contact")}
              className="btn-primary text-sm mt-3"
              style={{ fontFamily: "'Tajawal', sans-serif" }}
            >
              ابدأ الآن
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
