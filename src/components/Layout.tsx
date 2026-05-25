import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ChevronDown, LogOut, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { AdaLogo } from './AdaLogo';
import { motion, AnimatePresence } from 'framer-motion';

const navLinks = [
  { name: 'الرئيسية', path: '/' },
  { 
    name: 'المنتجات', 
    path: '#',
    dropdown: [
      { name: 'الهوية الرياضية', path: '/sport-id', icon: 'badge', desc: 'بطاقة FIFA لكل لاعب' },
      { name: 'لوحة الكشافين', path: '/scout', icon: 'person_search', desc: 'اكتشاف المواهب' },
      { name: 'لوحة المدربين', path: '/coach', icon: 'sports', desc: 'إدارة الفريق' },
      { name: 'لوحة المنشآت', path: '/organizations', icon: 'groups', desc: 'إدارة اللاعبين' },
      { name: 'نادي الروضة', path: '/club/rawdha', icon: 'stadium', desc: 'لوحة تحكم النادي' },
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
    <div className="min-h-screen bg-[#060d18] text-ice-white">
      {/* ── Header ── */}
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled 
            ? 'bg-[#060d18]/90 backdrop-blur-[40px] saturate-[180%] border-b border-teal-prime/8 shadow-lg shadow-black/20' 
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
                  onMouseEnter={() => link.dropdown && setDropdownOpen(true)}
                  onMouseLeave={() => link.dropdown && setDropdownOpen(false)}
                >
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
                  
                  {link.dropdown && dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full right-0 mt-2 w-72 glass-premium rounded-xl p-2 shadow-xl border border-white/[0.06]"
                    >
                      {link.dropdown.map((item) => (
                        <Link
                          key={item.path}
                          to={item.path}
                          className="flex items-start gap-3 p-3 rounded-lg hover:bg-teal-prime/8 transition-colors group/item"
                        >
                          <div className="w-10 h-10 rounded-lg bg-teal-prime/8 flex items-center justify-center flex-shrink-0 group-hover/item:bg-teal-prime/15 transition-colors border border-teal-prime/10">
                            <span className="text-teal-prime text-lg">
                              {item.icon === 'badge' && '\uEF3B'}
                              {item.icon === 'person_search' && '\uEF3C'}
                              {item.icon === 'sports' && '\uEA43'}
                              {item.icon === 'groups' && '\uEF3D'}
                              {item.icon === 'stadium' && '\uEA66'}
                            </span>
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
              className="lg:hidden bg-[#060d18]/95 backdrop-blur-[40px] saturate-[180%] border-t border-teal-prime/8 overflow-hidden"
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
                        className="block w-full text-center px-5 py-3 rounded-lg text-sm font-semibold bg-gradient-to-r from-teal-prime to-scout-blue text-[#060d18] arabic-text"
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
      <footer className="relative bg-[#060d18] border-t border-white/[0.04] overflow-hidden">
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
              <div className="flex items-center gap-3 pt-2">
                {['X', 'in', 'ig'].map((social) => (
                  <a 
                    key={social}
                    href="#" 
                    className="w-9 h-9 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-ice-muted/40 hover:text-teal-prime hover:border-teal-prime/20 hover:bg-teal-prime/5 transition-all"
                  >
                    {social === 'X' && <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>}
                    {social === 'in' && <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>}
                    {social === 'ig' && <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.468 2.373c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"/></svg>}
                  </a>
                ))}
              </div>
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
                  { name: 'مركز التطوير', path: '#' },
                  { name: 'المساعد الافتراضي', path: '#' },
                  { name: 'وثائق API', path: '#' },
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
                <li className="arabic-text">الرياض، المملكة العربية السعودية</li>
                <li className="arabic-text">البريد: info@ada2ai.sa</li>
                <li className="arabic-text">الدعم: support@ada2ai.sa</li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-white/[0.04] flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-ice-muted/40">
              &copy; 2026 Ada2AI. جميع الحقوق محفوظة.
            </p>
            <div className="flex items-center gap-6 text-sm text-ice-muted/40">
              <a href="#" className="hover:text-teal-prime transition-colors arabic-text">سياسة الخصوصية</a>
              <a href="#" className="hover:text-teal-prime transition-colors arabic-text">شروط الاستخدام</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}