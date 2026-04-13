/**
 * DashboardLayout - Unified dashboard for all user types
 */
import React from 'react'
import { Link, useLocation } from 'wouter'
import { useDemoAuth } from '@/contexts/DemoAuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import {
  Home, Users, BarChart3, Video, Settings, LogOut,
  ChevronRight, Shield, Building2, UserCheck, Search, Heart
} from 'lucide-react'
import type { UserType } from '@/types/profiles'
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
  const { user, signOut, userType, setUserType } = useDemoAuth()
  const { isRTL } = useLanguage()
  const [location] = useLocation()
  const navItems = navItemsByType[userType as UserType] || navItemsByType.player

  const handleSignOut = async () => {
    await signOut()
    window.location.href = '/'
  }

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: '#000A0F'
    }}>
      {/* Sidebar */}
      <aside style={{
        width: '260px',
        backgroundColor: '#0A0E1A',
        borderRight: isRTL ? 'none' : '1px solid #1F2937',
        borderLeft: isRTL ? '1px solid #1F2937' : 'none',
        padding: '24px 16px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Logo */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{
            color: '#00DCC8',
            fontSize: '24px',
            fontWeight: 'bold',
            fontFamily: "'Orbitron', sans-serif"
          }}>
            Ada2AI
          </h1>
          <p style={{ color: '#6B7280', fontSize: '12px', marginTop: '4px' }}>
            {isRTL ? 'لوحة التحكم' : 'Dashboard'}
          </p>
        </div>

        {/* User Type Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '12px',
          backgroundColor: 'rgba(0,220,200,0.1)',
          borderRadius: '8px',
          marginBottom: '24px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            backgroundColor: '#00DCC8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#000A0F'
          }}>
            {userTypeIcons[userType]}
          </div>
          <div>
            <p style={{ color: '#EEEFEE', fontWeight: '600' }}>
              {user?.email}
            </p>
            <p style={{ color: '#00DCC8', fontSize: '12px' }}>
              {userTypeLabels[userType][isRTL ? 'ar' : 'en']}
            </p>
          </div>
        </div>

        {/* Notifications Bell */}
        <div style={{ marginBottom: '24px' }}>
          <NotificationBell />
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1 }}>
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <a style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                marginBottom: '8px',
                borderRadius: '8px',
                color: location === item.href ? '#00DCC8' : '#9CA3AF',
                backgroundColor: location === item.href ? 'rgba(0,220,200,0.1)' : 'transparent',
                textDecoration: 'none',
                transition: 'all 0.2s'
              }}>
                {item.icon}
                <span style={{ fontFamily: "'Cairo', sans-serif" }}>
                  {isRTL ? item.labelAr : item.labelEn}
                </span>
                {location === item.href && <ChevronRight size={16} style={{ marginRight: 'auto' }} />}
              </a>
            </Link>
          ))}
        </nav>

        {/* Settings & Logout */}
        <div style={{ borderTop: '1px solid #1F2937', paddingTop: '16px', marginTop: '16px' }}>
          <Link href="/dashboard/settings">
            <a style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              borderRadius: '8px',
              color: '#9CA3AF',
              textDecoration: 'none'
            }}>
              <Settings size={18} />
              <span style={{ fontFamily: "'Cairo', sans-serif" }}>
                {isRTL ? 'الإعدادات' : 'Settings'}
              </span>
            </a>
          </Link>
          <button
            onClick={handleSignOut}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              borderRadius: '8px',
              color: '#EF4444',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              width: '100%',
              fontSize: '14px'
            }}
          >
            <LogOut size={18} />
            <span style={{ fontFamily: "'Cairo', sans-serif" }}>
              {isRTL ? 'تسجيل الخروج' : 'Sign Out'}
            </span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '32px' }}>
        {children}
      </main>
    </div>
  )
}
