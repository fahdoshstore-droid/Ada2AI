import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, Sparkles, LogOut, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

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
    ]
  },
  { name: 'الترتيب', path: '/rankings' },
  { name: 'تحليل الفيديو', path: '/video-analysis' },
];

export default function Layout() {
  const { user, signOut } = useAuth()
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    setDropdownOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-navy text-ice-white">
      {/* Header */}
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled 
            ? 'bg-navy-dark/90 backdrop-blur-xl border-b border-teal-prime/10 shadow-lg shadow-teal-prime/5' 
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative w-10 h-10 lg:w-12 lg:h-12">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-prime to-scout-blue rounded-xl rotate-45 scale-75 group-hover:scale-85 transition-transform duration-300" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-lg lg:text-xl font-bold tracking-tight text-gradient-teal">Ada2AI</span>
                <span className="text-[10px] lg:text-xs text-ice-muted -mt-1 arabic-text hidden sm:block">منصة اكتشاف المواهب</span>
              </div>
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
                    className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                      location.pathname === link.path
                        ? 'text-teal-prime bg-teal-prime/10'
                        : 'text-ice-muted hover:text-ice-white hover:bg-white/5'
                    }`}
                  >
                    {link.name}
                    {link.dropdown && <ChevronDown className="w-4 h-4" />}
                  </Link>
                  
                  {link.dropdown && dropdownOpen && (
                    <div className="absolute top-full right-0 mt-2 w-72 glass-card rounded-xl p-2 shadow-xl shadow-black/20">
                      {link.dropdown.map((item) => (
                        <Link
                          key={item.path}
                          to={item.path}
                          className="flex items-start gap-3 p-3 rounded-lg hover:bg-teal-prime/10 transition-colors group/item"
                        >
                          <div className="w-10 h-10 rounded-lg bg-teal-prime/10 flex items-center justify-center flex-shrink-0 group-hover/item:bg-teal-prime/20 transition-colors">
                            <span className="text-teal-prime text-lg">
                              {item.icon === 'badge' && '\uEf3b'}
                              {item.icon === 'person_search' && '\uEf3c'}
                              {item.icon === 'sports' && '\uEA43'}
                              {item.icon === 'groups' && '\uEf3d'}
                            </span>
                          </div>
                          <div>
                            <div className="font-semibold text-ice-white text-sm group-hover/item:text-teal-prime transition-colors">
                              {item.name}
                            </div>
                            <div className="text-xs text-ice-muted mt-0.5">{item.desc}</div>
                          </div>
                        </Link>
                      ))}
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
                    onClick={() => signOut()}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all duration-300"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="arabic-text">خروج</span>
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/sport-id" 
                    className="px-5 py-2.5 rounded-lg text-sm font-semibold border border-teal-prime/30 text-teal-prime hover:bg-teal-prime/10 transition-all duration-300"
                  >
                    تحليل اللاعب
                  </Link>
                  <Link 
                    to="/login" 
                    className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-gradient-to-r from-teal-prime to-scout-blue text-navy-dark hover:shadow-lg hover:shadow-teal-prime/25 transition-all duration-300"
                  >
                    تسجيل الدخول
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
        {mobileMenuOpen && (
          <div className="lg:hidden bg-navy-dark/95 backdrop-blur-xl border-t border-teal-prime/10">
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <div key={link.name}>
                  {link.dropdown ? (
                    <div className="space-y-1">
                      <div className="px-4 py-2 text-sm font-semibold text-ice-muted">{link.name}</div>
                      {link.dropdown.map((item) => (
                        <Link
                          key={item.path}
                          to={item.path}
                          className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm hover:bg-teal-prime/10 transition-colors"
                        >
                          <span className="text-teal-prime">{item.desc}</span>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <Link
                      to={link.path}
                      className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                        location.pathname === link.path
                          ? 'text-teal-prime bg-teal-prime/10'
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
                      className="block text-center px-5 py-3 rounded-lg text-sm font-semibold border border-teal-prime/30 text-teal-prime"
                    >
                      <span className="arabic-text">مرحباً، {user.email}</span>
                    </Link>
                    <button 
                      onClick={() => signOut()}
                      className="block w-full text-center px-5 py-3 rounded-lg text-sm font-semibold border border-red-500/30 text-red-400 hover:bg-red-500/10"
                    >
                      خروج
                    </button>
                  </>
                ) : (
                  <>
                    <Link 
                      to="/sport-id" 
                      className="block text-center px-5 py-3 rounded-lg text-sm font-semibold border border-teal-prime/30 text-teal-prime"
                    >
                      تحليل اللاعب
                    </Link>
                    <Link 
                      to="/login"
                      className="block w-full text-center px-5 py-3 rounded-lg text-sm font-semibold bg-gradient-to-r from-teal-prime to-scout-blue text-navy-dark"
                    >
                      تسجيل الدخول
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="pt-16 lg:pt-20">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="relative bg-navy-dark border-t border-teal-prime/10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial opacity-50" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* Brand */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-teal-prime to-scout-blue rounded-xl flex items-center justify-center rotate-45 scale-75">
                  <Sparkles className="w-5 h-5 text-white -rotate-45" />
                </div>
                <span className="text-xl font-bold text-gradient-teal">Ada2AI</span>
              </div>
              <p className="text-ice-muted text-sm leading-relaxed arabic-text">
                منصة سعودية رائدة في اكتشاف وتحليل المواهب الرياضية باستخدام الذكاء الاصطناعي. نبني المواهب بالتقنية.
              </p>
              <div className="flex items-center gap-3 pt-2">
                {['X', 'in', 'ig'].map((social) => (
                  <a 
                    key={social}
                    href="#" 
                    className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-ice-muted hover:text-teal-prime hover:bg-teal-prime/10 transition-all"
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
                    <Link to={item.path} className="text-sm text-ice-muted hover:text-teal-prime transition-colors arabic-text">
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
                    <Link to={item.path} className="text-sm text-ice-muted hover:text-teal-prime transition-colors arabic-text">
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold text-ice-white mb-4 arabic-text">تواصل معنا</h4>
              <ul className="space-y-3 text-sm text-ice-muted">
                <li className="flex items-center gap-2">
                  <span className="arabic-text">الرياض، المملكة العربية السعودية</span>
                </li>
                <li className="arabic-text">البريد: info@ada2ai.sa</li>
                <li className="arabic-text">الدعم: support@ada2ai.sa</li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-ice-muted">
              &copy; 2026 Ada2AI. جميع الحقوق محفوظة.
            </p>
            <div className="flex items-center gap-6 text-sm text-ice-muted">
              <a href="#" className="hover:text-teal-prime transition-colors arabic-text">سياسة الخصوصية</a>
              <a href="#" className="hover:text-teal-prime transition-colors arabic-text">شروط الاستخدام</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
