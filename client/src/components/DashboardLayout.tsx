/**
 * DashboardLayout - Unified dashboard for all user types
 * Responsive: sidebar on desktop, drawer overlay on mobile (RTL: from right)
 */
import React, { useState, useEffect, useCallback } from 'react'
import { Link, useLocation } from 'wouter'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { supabase, getProfile } from '@/lib/supabase'
import {
  Home, Users, BarChart3, Video, Settings, LogOut,
  ChevronRight, Shield, Building2, UserCheck, Search, Heart, Menu, X
} from 'lucide-react'
import type { UserType, Profile } from '@/types/profiles'
import NotificationBell from '@/components/NotificationBell'

const userTypeIcons: Record<UserType, React.ReactNode> = {
  player: <Users size={20} />,
  club: <Building2 size={20} />,
  coach: <UserCheck size={20} />,
  scout: <Search size={20} />,
  parent: <Heart size={20} />,
}

const userTypeLabels: Record<string, { ar: string; en: string }> = {
  player: { ar: 'لاعب', en: 'Player' },
  club: { ar: 'نادي', en: 'Club' },
  coach: { ar: 'مدرب', en: 'Coach' },
  scout: { ar: 'كشاف', en: 'Scout' },
  parent: { ar: 'ولي أمر', en: 'Parent' },
}

interface NavItem {
  href: string
  icon: React.ReactNode
  labelAr: string
  labelEn: string
}

const navItemsByType: Record<UserType, NavItem[]> = {
  player: [
    { href: '/dashboard', icon: <Home size={18} />, labelAr: 'الرئيسية', labelEn: 'Home' },
    { href: '/dashboard/profile', icon: <Users size={18} />, labelAr: 'ملفي', labelEn: 'My Profile' },
    { href: '/dashboard/stats', icon: <BarChart3 size={18} />, labelAr: 'إحصائياتي', labelEn: 'My Stats' },
    { href: '/dashboard/videos', icon: <Video size={18} />, labelAr: 'فيديوهاتي', labelEn: 'My Videos' },
  ],
  club: [
    { href: '/dashboard', icon: <Home size={18} />, labelAr: 'الرئيسية', labelEn: 'Home' },
    { href: '/dashboard/team', icon: <Users size={18} />, labelAr: 'الفريق', labelEn: 'Team' },
    { href: '/dashboard/analysis', icon: <BarChart3 size={18} />, labelAr: 'تحليلات', labelEn: 'Analysis' },
    { href: '/dashboard/scouts', icon: <Search size={18} />, labelAr: 'الكشافة', labelEn: 'Scouts' },
  ],
  coach: [
    { href: '/dashboard', icon: <Home size={18} />, labelAr: 'الرئيسية', labelEn: 'Home' },
    { href: '/dashboard/players', icon: <Users size={18} />, labelAr: 'اللاعبين', labelEn: 'Players' },
    { href: '/dashboard/training', icon: <BarChart3 size={18} />, labelAr: 'التدريب', labelEn: 'Training' },
    { href: '/dashboard/analysis', icon: <Video size={18} />, labelAr: 'تحليل المباريات', labelEn: 'Match Analysis' },
  ],
  scout: [
    { href: '/dashboard', icon: <Home size={18} />, labelAr: 'الرئيسية', labelEn: 'Home' },
    { href: '/dashboard/discover', icon: <Search size={18} />, labelAr: 'اكتشف', labelEn: 'Discover' },
    { href: '/dashboard/favorites', icon: <Heart size={18} />, labelAr: 'المفضلة', labelEn: 'Favorites' },
    { href: '/dashboard/reports', icon: <BarChart3 size={18} />, labelAr: 'تقاريري', labelEn: 'Reports' },
  ],
  parent: [
    { href: '/dashboard', icon: <Home size={18} />, labelAr: 'الرئيسية', labelEn: 'Home' },
    { href: '/dashboard/children', icon: <Users size={18} />, labelAr: 'أبنائي', labelEn: 'My Children' },
    { href: '/dashboard/training', icon: <BarChart3 size={18} />, labelAr: 'التدريب', labelEn: 'Training' },
    { href: '/dashboard/messages', icon: <Settings size={18} />, labelAr: 'الرسائل', labelEn: 'Messages' },
  ],
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, signOut: authSignOut } = useAuth()
  const { isRTL } = useLanguage()
  const [location] = useLocation()
  const [userType, setUserType] = useState<UserType>('player')
  const [profile, setProfile] = useState<Profile | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  // Fetch user profile to get userType
  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const { data } = await getProfile(user.id)
        if (data) {
          setProfile(data)
          setUserType((data.user_type as UserType) || 'player')
        }
      }
    }
    fetchProfile()
  }, [user])

  // Close drawer on route change
  useEffect(() => {
    setDrawerOpen(false)
  }, [location])

  // Close drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDrawerOpen(false)
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [drawerOpen])

  const navItems = navItemsByType[userType] || navItemsByType.player

  const handleSignOut = async () => {
    await authSignOut()
    window.location.href = '/'
  }

  const toggleDrawer = useCallback(() => setDrawerOpen(prev => !prev), [])
  const closeDrawer = useCallback(() => setDrawerOpen(false), [])

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="mb-8">
        <h1 className="text-[#00DCC8] text-2xl font-bold" style={{ fontFamily: "'Orbitron', sans-serif" }}>
          Ada2AI
        </h1>
        <p className="text-gray-500 text-xs mt-1">
          {isRTL ? 'لوحة التحكم' : 'Dashboard'}
        </p>
      </div>

      {/* User Type Badge */}
      <div className="flex items-center gap-3 p-3 rounded-lg mb-6" style={{ backgroundColor: 'rgba(0,220,200,0.1)' }}>
        <div className="w-10 h-10 rounded-lg bg-[#00DCC8] flex items-center justify-center text-[#000A0F]">
          {userTypeIcons[userType]}
        </div>
        <div className="min-w-0">
          <p className="text-[#EEEFEE] font-semibold truncate">
            {user?.email}
          </p>
          <p className="text-[#00DCC8] text-xs">
            {userTypeLabels[userType][isRTL ? 'ar' : 'en']}
          </p>
        </div>
      </div>

      {/* Notifications Bell */}
      <div className="mb-6">
        <NotificationBell />
      </div>

      {/* Navigation */}
      <nav className="flex-1">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <a className={`flex items-center gap-3 p-3 mb-2 rounded-lg no-underline transition-all duration-200 ${location === item.href ? 'text-[#00DCC8] bg-[rgba(0,220,200,0.1)]' : 'text-gray-400 hover:text-[#00DCC8]'}`}>
              {item.icon}
              <span style={{ fontFamily: "'Cairo', sans-serif" }}>
                {isRTL ? item.labelAr : item.labelEn}
              </span>
              {location === item.href && <ChevronRight size={16} className="ml-auto" />}
            </a>
          </Link>
        ))}
      </nav>

      {/* Settings & Logout */}
      <div className="border-t border-gray-700 pt-4 mt-4">
        <Link href="/dashboard/settings">
          <a className="flex items-center gap-3 p-3 rounded-lg text-gray-400 no-underline hover:text-[#00DCC8] transition-colors">
            <Settings size={18} />
            <span style={{ fontFamily: "'Cairo', sans-serif" }}>
              {isRTL ? 'الإعدادات' : 'Settings'}
            </span>
          </a>
        </Link>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 p-3 rounded-lg text-red-500 bg-transparent border-none cursor-pointer w-full text-sm hover:text-red-400 transition-colors"
        >
          <LogOut size={18} />
          <span style={{ fontFamily: "'Cairo', sans-serif" }}>
            {isRTL ? 'تسجيل الخروج' : 'Sign Out'}
          </span>
        </button>
      </div>
    </>
  )

  return (
    <div className="flex min-h-screen bg-[#000A0F]">
      {/* Desktop Sidebar — hidden on mobile */}
      <aside className={`hidden md:flex flex-col w-[260px] shrink-0 bg-[#0A0E1A] p-6 ${isRTL ? 'border-l border-l-gray-700' : 'border-r border-r-gray-700'}`}>
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60"
            onClick={closeDrawer}
            aria-hidden="true"
          />
          {/* Drawer panel — slides from the right for RTL */}
          <aside
            className={`absolute top-0 h-full w-[280px] max-w-[85vw] bg-[#0A0E1A] p-6 flex flex-col shadow-2xl ${
              isRTL ? 'right-0 border-l border-l-gray-700' : 'left-0 border-r border-r-gray-700'
            }`}
            role="dialog"
            aria-modal="true"
            aria-label={isRTL ? 'القائمة الجانبية' : 'Sidebar menu'}
          >
            {/* Close button */}
            <button
              onClick={closeDrawer}
              className="absolute top-4 left-4 text-gray-400 hover:text-white bg-transparent border-none cursor-pointer p-1"
              aria-label={isRTL ? 'إغلاق القائمة' : 'Close menu'}
            >
              <X size={24} />
            </button>
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Top Bar — visible only on mobile */}
        <header className="flex md:hidden items-center justify-between px-4 py-3 bg-[#0A0E1A] border-b border-b-gray-700">
          <h1 className="text-[#00DCC8] text-lg font-bold" style={{ fontFamily: "'Orbitron', sans-serif" }}>
            Ada2AI
          </h1>
          <button
            onClick={toggleDrawer}
            className="text-gray-300 hover:text-white bg-transparent border-none cursor-pointer p-2 rounded-lg hover:bg-white/10 transition-colors"
            aria-label={isRTL ? 'فتح القائمة' : 'Open menu'}
          >
            <Menu size={24} />
          </button>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}