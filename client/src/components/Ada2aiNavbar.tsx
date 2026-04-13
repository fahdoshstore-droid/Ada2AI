import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, ChevronDown, Globe } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { useLanguage } from "@/contexts/LanguageContext";

// Ada2ai Logo SVG — Teal rounded square with "A" + wordmark
function Ada2aiLogo({ size = 32 }: { size?: number }) {
  return (
    <div className="flex items-center gap-2.5 select-none">
      <div
        className="flex items-center justify-center"
        style={{
          width: size,
          height: size,
          background: "linear-gradient(135deg, #00DCC8, #007ABA)",
          borderRadius: "8px",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontFamily: "'Orbitron', sans-serif",
            fontWeight: 900,
            fontSize: size * 0.55,
            color: "#000A0F",
            lineHeight: 1,
          }}
        >
          A
        </span>
      </div>
      <span
        style={{
          fontFamily: "'Orbitron', sans-serif",
          fontWeight: 700,
          fontSize: size * 0.65,
          letterSpacing: "0.02em",
          lineHeight: 1,
        }}
      >
        <span style={{ color: "#EEEFEE" }}>ada</span>
        <span style={{ color: "#00DCC8" }}>2</span>
        <span style={{ color: "#EEEFEE" }}>ai</span>
      </span>
    </div>
  );
}

export default function Ada2aiNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [govOpen, setGovOpen] = useState(false);
  const [dashOpen, setDashOpen] = useState(false);
  const [location] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const { t, lang, setLang, isRTL } = useLanguage();
  const govRef = useRef<HTMLDivElement>(null);
  const dashRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setGovOpen(false);
    setDashOpen(false);
  }, [location]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (govRef.current && !govRef.current.contains(e.target as Node)) setGovOpen(false);
      if (dashRef.current && !dashRef.current.contains(e.target as Node)) setDashOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const governanceItems = [
    { label: t("nav.subGov"), href: "/governance/sub" },
    { label: t("nav.teamMembers"), href: "/governance/team" },
  ];

  const dashboardItems = [
    { label: t("nav.scoutDashboard"), href: "/scouts" },
    { label: t("nav.sportId"), href: "/sport-id" },
    { label: t("nav.upload"), href: "/upload" },
    { label: t("nav.training"), href: "/training" },
    { label: t("nav.compare"), href: "/compare" },
    { label: t("nav.partnerships"), href: "/academies" },
    { label: isRTL ? "🏆 Demo نادي النهضة" : "🏆 Nahda FC Demo", href: "/demo/nahda" },
  ];

  const navLinks = [
    { label: t("nav.dashboards"), href: null, dropdown: dashboardItems, key: "dashboards" },
    { label: t("nav.product"), href: "/product" },
    { label: t("nav.governance"), href: null, dropdown: governanceItems, key: "governance" },
  ];

  const navLinkStyle = (isActive: boolean) => ({
    fontFamily: isRTL ? "'Cairo', sans-serif" : "'Cairo', sans-serif",
    fontWeight: isActive ? 600 : 500,
    fontSize: "14px",
    color: isActive ? "#00DCC8" : "rgba(238, 239, 238, 0.82)",
    background: isActive ? "rgba(0, 220, 200, 0.08)" : "transparent",
  });

  const DropdownMenu = ({
    items,
    isOpen,
    align = "left",
  }: {
    items: { label: string; href: string }[];
    isOpen: boolean;
    align?: "left" | "right";
  }) => {
    if (!isOpen) return null;
    return (
      <div
        className="absolute top-full mt-1.5 rounded-lg overflow-hidden z-50"
        style={{
          background: "rgba(0, 10, 15, 0.97)",
          border: "1px solid rgba(0, 220, 200, 0.18)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
          minWidth: "190px",
          left: align === "left" ? 0 : "auto",
          right: align === "right" ? 0 : "auto",
        }}
      >
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="block px-5 py-3 text-sm transition-all duration-150"
            style={{
              fontFamily: isRTL ? "'Cairo', sans-serif" : "'Cairo', sans-serif",
              fontWeight: 500,
              fontSize: "13px",
              color: "rgba(238,239,238,0.75)",
              borderBottom: "1px solid rgba(255,255,255,0.04)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.color = "#00DCC8";
              (e.currentTarget as HTMLElement).style.background = "rgba(0,220,200,0.06)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.color = "rgba(238,239,238,0.75)";
              (e.currentTarget as HTMLElement).style.background = "transparent";
            }}
          >
            {item.label}
          </Link>
        ))}
      </div>
    );
  };

  return (
    <>
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        dir={isRTL ? "rtl" : "ltr"}
        style={{
          background: scrolled ? "rgba(0, 10, 15, 0.96)" : "rgba(0, 10, 15, 0.72)",
          backdropFilter: "blur(18px)",
          borderBottom: scrolled ? "1px solid rgba(0, 220, 200, 0.18)" : "1px solid transparent",
          boxShadow: scrolled ? "0 4px 30px rgba(0, 0, 0, 0.5)" : "none",
        }}
      >
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/">
              <Ada2aiLogo size={32} />
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-0.5">
              {navLinks.map((link) => {
                if (link.key === "governance") {
                  return (
                    <div key="governance" className="relative" ref={govRef}>
                      <button
                        className="px-3 py-2 rounded-md flex items-center gap-1.5 transition-all duration-200"
                        style={navLinkStyle(location.startsWith("/governance"))}
                        onClick={() => { setGovOpen((v) => !v); setDashOpen(false); }}
                      >
                        {link.label}
                        <ChevronDown
                          size={13}
                          style={{
                            transform: govOpen ? "rotate(180deg)" : "rotate(0deg)",
                            transition: "transform 0.2s",
                            color: "rgba(238,239,238,0.4)",
                          }}
                        />
                      </button>
                      <DropdownMenu items={governanceItems} isOpen={govOpen} />
                    </div>
                  );
                }

                if (link.key === "dashboards") {
                  const isActive = ["/scouts", "/compare", "/upload", "/sport-id"].includes(location);
                  return (
                    <div key="dashboards" className="relative" ref={dashRef}>
                      <button
                        className="px-3 py-2 rounded-md flex items-center gap-1.5 transition-all duration-200"
                        style={navLinkStyle(isActive)}
                        onClick={() => { setDashOpen((v) => !v); setGovOpen(false); }}
                      >
                        {link.label}
                        <ChevronDown
                          size={13}
                          style={{
                            transform: dashOpen ? "rotate(180deg)" : "rotate(0deg)",
                            transition: "transform 0.2s",
                            color: "rgba(238,239,238,0.4)",
                          }}
                        />
                      </button>
                      <DropdownMenu items={dashboardItems} isOpen={dashOpen} align="right" />
                    </div>
                  );
                }

                const isActive = location === link.href;
                return (
                  <Link
                    key={link.href!}
                    href={link.href!}
                    className="px-3 py-2 rounded-md transition-all duration-200"
                    style={navLinkStyle(isActive)}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        (e.currentTarget as HTMLElement).style.color = "#EEEFEE";
                        (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        (e.currentTarget as HTMLElement).style.color = "rgba(238, 239, 238, 0.82)";
                        (e.currentTarget as HTMLElement).style.background = "transparent";
                      }
                    }}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>

            {/* Desktop Right: Language Toggle + Auth */}
            <div className="hidden lg:flex items-center gap-2">
              {/* Language Toggle */}
              <button
                onClick={() => setLang(lang === "en" ? "ar" : "en")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all duration-200"
                style={{
                  fontFamily: "'Cairo', sans-serif",
                  fontSize: "13px",
                  color: "rgba(238,239,238,0.7)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "rgba(255,255,255,0.04)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.color = "#00DCC8";
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,220,200,0.3)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.color = "rgba(238,239,238,0.7)";
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.1)";
                }}
              >
                <Globe size={13} />
                <span>{lang === "en" ? "العربية" : "English"}</span>
              </button>

              {/* Auth */}
              {isAuthenticated ? (
                <div className="flex items-center gap-2">
                  <span
                    className="text-sm"
                    style={{ color: "rgba(238,239,238,0.6)", fontFamily: "'Cairo', sans-serif" }}
                  >
                    {user?.name || user?.email}
                  </span>
                  <button
                    onClick={logout}
                    className="text-sm px-3 py-1.5 rounded-md transition-all"
                    style={{
                      fontFamily: "'Cairo', sans-serif",
                      color: "rgba(238,239,238,0.6)",
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                  >
                    {t("nav.logout")}
                  </button>
                </div>
              ) : (
                <Link href="/login">
                  <button className="btn-ada-primary text-sm px-4 py-2">
                    {t("nav.getStarted")}
                  </button>
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden p-2 rounded-md"
              style={{ color: "#EEEFEE" }}
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div
            className="lg:hidden"
            style={{
              background: "rgba(0, 10, 15, 0.98)",
              borderTop: "1px solid rgba(0, 220, 200, 0.1)",
            }}
          >
            <div className="container mx-auto px-4 py-4 flex flex-col gap-1">
              {/* Language toggle mobile */}
              <button
                onClick={() => setLang(lang === "en" ? "ar" : "en")}
                className="flex items-center gap-2 px-4 py-3 rounded-md text-sm mb-1"
                style={{
                  fontFamily: "'Cairo', sans-serif",
                  color: "#00DCC8",
                  background: "rgba(0,220,200,0.06)",
                  border: "1px solid rgba(0,220,200,0.15)",
                }}
              >
                <Globe size={14} />
                {lang === "en" ? "التبديل إلى العربية" : "Switch to English"}
              </button>

              {navLinks.map((link) => {
                if (link.key === "governance") {
                  return (
                    <div key="governance-mobile">
                      <button
                        className="w-full text-left px-4 py-3 rounded-md text-sm flex items-center justify-between"
                        style={{
                          fontFamily: "'Cairo', sans-serif",
                          fontSize: "15px",
                          color: "rgba(238, 239, 238, 0.8)",
                          fontWeight: 500,
                        }}
                        onClick={() => setGovOpen((v) => !v)}
                      >
                        {link.label}
                        <ChevronDown size={14} style={{ transform: govOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
                      </button>
                      {govOpen && (
                        <div className="ml-4 flex flex-col gap-0.5">
                          {governanceItems.map((item) => (
                            <Link
                              key={item.href}
                              href={item.href}
                              className="px-4 py-2.5 rounded-md text-sm"
                              style={{ fontFamily: "'Cairo', sans-serif", fontSize: "14px", color: "rgba(238,239,238,0.65)" }}
                            >
                              {item.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }

                if (link.key === "dashboards") {
                  return (
                    <div key="dashboards-mobile">
                      <button
                        className="w-full text-left px-4 py-3 rounded-md text-sm flex items-center justify-between"
                        style={{
                          fontFamily: "'Cairo', sans-serif",
                          fontSize: "15px",
                          color: "rgba(238, 239, 238, 0.8)",
                          fontWeight: 500,
                        }}
                        onClick={() => setDashOpen((v) => !v)}
                      >
                        {link.label}
                        <ChevronDown size={14} style={{ transform: dashOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
                      </button>
                      {dashOpen && (
                        <div className="ml-4 flex flex-col gap-0.5">
                          {dashboardItems.map((item) => (
                            <Link
                              key={item.href}
                              href={item.href}
                              className="px-4 py-2.5 rounded-md text-sm"
                              style={{ fontFamily: "'Cairo', sans-serif", fontSize: "14px", color: "rgba(238,239,238,0.65)" }}
                            >
                              {item.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }

                const isActive = location === link.href;
                return (
                  <Link
                    key={link.href!}
                    href={link.href!}
                    className="px-4 py-3 rounded-md text-sm transition-all"
                    style={{
                      fontFamily: "'Cairo', sans-serif",
                      fontSize: "15px",
                      color: isActive ? "#00DCC8" : "rgba(238, 239, 238, 0.8)",
                      background: isActive ? "rgba(0, 220, 200, 0.08)" : "transparent",
                      fontWeight: isActive ? 600 : 500,
                    }}
                  >
                    {link.label}
                  </Link>
                );
              })}

              <div className="mt-3 pt-3 border-t border-white/10 flex gap-3">
                {isAuthenticated ? (
                  <button
                    onClick={logout}
                    className="flex-1 py-2.5 text-sm rounded-md"
                    style={{ fontFamily: "'Cairo', sans-serif", color: "rgba(238,239,238,0.6)", border: "1px solid rgba(255,255,255,0.1)" }}
                  >
                    {t("nav.logout")}
                  </button>
                ) : (
                  <Link href="/login" className="flex-1">
                    <button className="btn-ada-primary w-full text-sm py-2.5">
                      {t("nav.getStarted")}
                    </button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
      {/* Spacer for fixed navbar */}
      <div style={{ height: "64px" }} />
    </>
  );
}

export { Ada2aiLogo };
