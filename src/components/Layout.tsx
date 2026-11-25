import { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ChevronDown, LogOut, User, Badge, UserSearch, Dumbbell, Users, type LucideIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { AdaLogo } from './AdaLogo';
import { motion, AnimatePresence } from 'framer-motion';

const navLinks = [
  { name: 'الرئيسية', path: '/' },
  { 
    name: 'المنتجات', 
    path: '/sport-id',
    dropdown: [
      { name: 'الهوية الرياضية', path: '/sport-id', icon: Badge as LucideIcon, desc: 'بطاقة رقمية لكل لاعب' },
      { name: 'لوحة الكشافين', path: '/scout', icon: UserSearch as LucideIcon, desc: 'اكتشاف المواهب' },
      { name: 'لوحة المدربين', path: '/coach', icon: Dumbbell as LucideIcon, desc: 'إدارة الفريق' },
      { name: 'لوحة المنشآت', path: '/organizations', icon: Users as LucideIcon, desc: 'إدارة اللاعبين' },
    ]
  },
  { name: 'الترتيب', path: '/rankings' },
  { name: 'تحليل الفيديو', path: '/video-analysis' },
];

export default function Layout() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  // Products menu: a short close delay lets the pointer travel from the
  // button to the panel; the last pointer type tells a mouse from a tap.
  const closeTimer = useRef<number | null>(null);
  const pointerType = useRef<string>('mouse');
  const openMenu = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    setDropdownOpen(true);
  };
  const closeMenuSoon = () => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setDropdownOpen(false), 180);
  };
  useEffect(() => {
    if (!dropdownOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setDropdownOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [dropdownOpen]);
  useEffect(() => () => { if (closeTimer.current) window.clearTimeout(closeTimer.current); }, []);
  const location = useLocation();

  const handleLogout = async () => {
    await signOut()
    navigate('/login', { replace: true })
  }

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setDropdownOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-[#000A0F] text-ice-white">
      {/* ── Header ── */}
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled 
            ? 'bg-[#000A0F]/90 backdrop-blur-[40px] saturate-[180%] border-b border-teal-prime/8 shadow-lg shadow-black/20' 
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <AdaLogo size={36} showText={true} />
              <span className="text-[10px] lg:text-xs text-ice-muted -mt-1 arabic-text hidden sm:block">منصة اكتشاف المواهب</span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <div 
                  key={link.name}
                  className="relative"
                  onPointerEnter={(e) => { if (link.dropdown && e.pointerType === 'mouse') openMenu(); }}
                  onPointerLeave={(e) => { if (link.dropdown && e.pointerType === 'mouse') closeMenuSoon(); }}
                >
                  {link.dropdown ? (
                    <button
                      type="button"
                      onPointerDown={(e) => { pointerType.current = e.pointerType; }}
                      // With a mouse the menu is already open from hovering, so a
                      // click keeps it open; taps and the keyboard toggle it.
                      onClick={() => (pointerType.current === 'mouse' ? openMenu() : setDropdownOpen((v) => !v))}
                      onKeyDown={() => { pointerType.current = 'keyboard'; }}
                      aria-haspopup="true"
                      aria-expanded={dropdownOpen}
                      className={`relative flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                        link.dropdown.some((d) => d.path === location.pathname)
                          ? 'text-teal-prime'
                          : 'text-ice-muted hover:text-ice-white'
                      }`}
                    >
                      {link.name}
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                  <Link
                    to={link.path}
                    className={`relative flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                      location.pathname === link.path
                        ? 'text-teal-prime'
                        : 'text-ice-muted hover:text-ice-white'
                    }`}
                  >
                    {link.name}
                    {link.dropdown && <ChevronDown className="w-3.5 h-3.5" />}
                    {location.pathname === link.path && (
                      <motion.div
                        layoutId="nav-indicator"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-prime rounded-full"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </Link>
                  )}
                  
                  {link.dropdown && dropdownOpen && (
                    // pt-2 (not mt-2): the gap belongs to the hover area, so moving
                    // the mouse from the button down to the panel keeps it open.
                    <div className="absolute top-full right-0 z-50 pt-2">
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.2 }}
                      className="w-72 glass-premium rounded-xl p-2 shadow-xl border border-white/[0.06] bg-[#000A0F]/95"
                    >
                      {link.dropdown.map((item) => (
                        <Link
                          key={item.path}
                          to={item.path}
                          className="flex items-start gap-3 p-3 rounded-lg hover:bg-teal-prime/8 transition-colors group/item"
                        >
                          <div className="w-10 h-10 rounded-lg bg-teal-prime/8 flex items-center justify-center flex-shrink-0 group-hover/item:bg-teal-prime/15 transition-colors border border-teal-prime/10">
                            <item.icon className="h-5 w-5 text-teal-prime" aria-hidden="true" />
                          </div>
                          <div>
                            <div className="font-semibold text-ice-white text-sm group-hover/item:text-teal-prime transition-colors">
                              {item.name}
                            </div>
                            <div className="text-xs text-ice-muted/60 mt-0.5">{item.desc}</div>
                          </div>
                        </Link>
                      ))}
                    </motion.div>
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* CTA Buttons */}
            <div className="hidden lg:flex items-center gap-3">
              {user ? (
                <>
                  <Link 
                    to="/sport-id" 
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-ice-muted hover:text-ice-white transition-colors"
                  >
                    <User className="w-4 h-4" />
                    <span className="arabic-text truncate max-w-[150px]">{user.email}</span>
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm border border-red-500/20 text-red-400 hover:bg-red-500/8 transition-all duration-300"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="arabic-text">خروج</span>
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/sport-id" 
                    className="btn-ghost-interactive"
                  >
                    تحليل اللاعب
                  </Link>
                  <Link 
                    to="/login" 
                    className="btn-primary text-sm"
                  >
                    <span>تسجيل الدخول</span>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="lg:hidden p-2 rounded-lg hover:bg-white/5 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="lg:hidden bg-[#000A0F]/95 backdrop-blur-[40px] saturate-[180%] border-t border-teal-prime/8 overflow-hidden"
            >
              <div className="px-4 py-4 space-y-1">
                {navLinks.map((link) => (
                  <div key={link.name}>
                    {link.dropdown ? (
                      <div className="space-y-1">
                        <div className="px-4 py-2 text-sm font-semibold text-ice-muted/60 arabic-text">{link.name}</div>
                        {link.dropdown.map((item) => (
                          <Link
                            key={item.path}
                            to={item.path}
                            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm hover:bg-teal-prime/8 transition-colors"
                          >
                            <span className="text-teal-prime arabic-text">{item.desc}</span>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <Link
                        to={link.path}
                        className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors arabic-text ${
                          location.pathname === link.path
                            ? 'text-teal-prime bg-teal-prime/8'
                            : 'text-ice-muted hover:text-ice-white hover:bg-white/5'
                        }`}
                      >
                        {link.name}
                      </Link>
                    )}
                  </div>
                ))}
                <div className="pt-4 flex flex-col gap-2">
                  {user ? (
                    <>
                      <Link 
                        to="/sport-id"
                        className="block text-center px-5 py-3 rounded-lg text-sm font-semibold border border-teal-prime/20 text-teal-prime arabic-text"
                      >
                        مرحباً، {user.email}
                      </Link>
                      <button 
                        onClick={handleLogout}
                        className="block w-full text-center px-5 py-3 rounded-lg text-sm font-semibold border border-red-500/20 text-red-400 hover:bg-red-500/8 arabic-text"
                      >
                        خروج
                      </button>
                    </>
                  ) : (
                    <>
                      <Link 
                        to="/sport-id" 
                        className="block text-center px-5 py-3 rounded-lg text-sm font-semibold border border-teal-prime/20 text-teal-prime arabic-text"
                      >
                        تحليل اللاعب
                      </Link>
                      <Link 
                        to="/login"
                        className="block w-full text-center px-5 py-3 rounded-lg text-sm font-semibold bg-gradient-to-r from-teal-prime to-scout-blue text-[#000A0F] arabic-text"
                      >
                        تسجيل الدخول
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ── Main Content ── */}
      <main className="pt-16 lg:pt-20">
        <Outlet />
      </main>

      {/* ── Footer ── */}
      <footer className="relative bg-[#000A0F] border-t border-white/[0.04] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial opacity-30" />
        <div className="grain-overlay" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* Brand */}
            <div className="space-y-4">
              <AdaLogo size={28} showText={true} />
              <p className="text-ice-muted/60 text-sm leading-relaxed arabic-text">
                منصة سعودية رائدة في اكتشاف وتحليل المواهب الرياضية باستخدام الذكاء الاصطناعي.
              </p>
            </div>

            {/* Products */}
            <div>
              <h4 className="font-semibold text-ice-white mb-4 arabic-text">المنتجات</h4>
              <ul className="space-y-3">
                {[
                  { name: 'الهوية الرياضية', path: '/sport-id' },
                  { name: 'لوحة الكشافين', path: '/scout' },
                  { name: 'لوحة المدربين', path: '/coach' },
                  { name: 'لوحة المنشآت', path: '/organizations' },
                  { name: 'تحليل الفيديو', path: '/video-analysis' },
                ].map((item) => (
                  <li key={item.path}>
                    <Link to={item.path} className="text-sm text-ice-muted/60 hover:text-teal-prime transition-colors arabic-text">
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="font-semibold text-ice-white mb-4 arabic-text">الموارد</h4>
              <ul className="space-y-3">
                {[
                  { name: 'ترتيب المواهب', path: '/rankings' },
                  { name: 'تحليل اللاعبين', path: '/player-analysis' },
                ].map((item) => (
                  <li key={item.name}>
                    <Link to={item.path} className="text-sm text-ice-muted/60 hover:text-teal-prime transition-colors arabic-text">
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold text-ice-white mb-4 arabic-text">تواصل معنا</h4>
              <ul className="space-y-3 text-sm text-ice-muted/60">
                <li className="arabic-text">الخبر، المملكة العربية السعودية</li>
                <li className="arabic-text">البريد: <a href="mailto:info@ada2ai.com" className="hover:text-teal-prime transition-colors" dir="ltr">info@ada2ai.com</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-white/[0.04] flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-ice-muted/40">
              &copy; 2026 Ada2AI. جميع الحقوق محفوظة.
            </p>
            <div className="flex items-center gap-6 text-sm text-ice-muted/40">
              <Link to="/privacy" className="hover:text-teal-prime transition-colors arabic-text">سياسة الخصوصية والاستخدام</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}