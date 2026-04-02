export type Lang = 'en' | 'ar';

export const translations = {
  // ── Global / Nav ──────────────────────────────────────────────
  appName:           { en: 'ada2ai',                             ar: 'ada2ai' },
  appSubtitle:       { en: 'Sport Passport ID',                  ar: 'الجواز الرياضي الرقمي' },
  vision2030:        { en: 'Vision 2030 Aligned',                ar: 'متوافق مع رؤية 2030' },
  exit:              { en: '← Exit',                             ar: 'خروج ←' },
  liveData:          { en: 'Live Data',                          ar: 'بيانات مباشرة' },

  // ── Landing ───────────────────────────────────────────────────
  heroTag:           { en: 'POC v1.0 · March 2026 · Confidential Use', ar: 'إثبات المفهوم · مارس 2026 · سري' },
  heroTitle1:        { en: 'Smart Grassroots',                   ar: 'النظام الرياضي' },
  heroTitle2:        { en: 'Sports Ecosystem',                   ar: 'الذكي للقاعدة الشعبية' },
  heroDesc:          { en: 'One unified digital identity connecting athletes, facilities, and government — built for Saudi Arabia.', ar: 'هوية رقمية موحدة تربط الرياضيين والمنشآت والحكومة — مبنية للمملكة العربية السعودية.' },
  selectRole:        { en: 'Select Your Role to Continue',       ar: 'اختر دورك للمتابعة' },
  selectRoleDesc:    { en: 'Choose a persona to explore the SportID Digital Passport', ar: 'اختر شخصية لاستكشاف الجواز الرقمي الرياضي' },
  techArch:          { en: 'Technical Architecture',             ar: 'البنية التقنية' },

  // Landing stats
  uptimeSLA:         { en: 'Uptime SLA',                        ar: 'اتفاقية التشغيل' },
  qrCheckin:         { en: 'QR Check-in',                       ar: 'تسجيل QR' },
  athletesYr1:       { en: 'Athletes Yr 1',                     ar: 'رياضي السنة 1' },
  roi:               { en: 'ROI',                               ar: 'العائد' },
  provinces:         { en: 'Provinces',                         ar: 'منطقة' },

  // Personas
  athleteRole:       { en: 'Athlete',                           ar: 'رياضي' },
  athleteName:       { en: 'Athlete',                           ar: 'رياضي' },
  athleteAge:        { en: 'Digital ID',                        ar: 'هوية رقمية' },
  athleteDesc:       { en: 'Access your digital passport, earn Sport Points & unlock your career pathway.', ar: 'استعرض جوازك الرقمي، اكسب النقاط الرياضية واكتشف مسارك المهني.' },

  facilityRole:      { en: 'Facility Manager',                  ar: 'مدير المنشأة' },
  facilityName:      { en: 'Ahmed Al-Dossari',                  ar: 'أحمد الدوسري' },
  facilityAge:       { en: '38 · Jeddah',                       ar: '38 · جدة' },
  facilityDesc:      { en: 'QR check-in system, real-time athlete verification & facility analytics.', ar: 'نظام تسجيل QR، التحقق الفوري من الرياضيين وتحليلات المنشأة.' },

  ministryRole:      { en: 'Ministry Official',                 ar: 'مسؤول الوزارة' },
  ministryName:      { en: 'Saad Al-Faridi',                    ar: 'سعد الفريدي' },
  ministryAge:       { en: '45 · Khobar',                       ar: '45 · الخبر' },
  ministryDesc:      { en: 'National KPI dashboard, Vision 2030 tracking & regional talent analytics.', ar: 'لوحة مؤشرات وطنية، تتبع رؤية 2030 وتحليلات المواهب الإقليمية.' },

  enterViaApp:       { en: 'Enter via App →',                  ar: '← الدخول عبر التطبيق' },

  // Cancel
  cancel:            { en: 'Cancel',                            ar: 'إلغاء' },

  // ── Athlete Nav ───────────────────────────────────────────────
  passport:          { en: 'Passport',                          ar: 'الجواز' },
  sportPoints:       { en: 'Sport Points',                      ar: 'النقاط الرياضية' },
  history:           { en: 'History',                           ar: 'السجل' },
  career:            { en: 'Career',                            ar: 'المسار المهني' },
  athletePortal:     { en: 'Digital Passport',                  ar: 'الجواز الرقمي' },

  // Athlete passport page
  goldAthlete:       { en: 'Gold Athlete',                      ar: 'رياضي ذهبي' },
  silverAthlete:     { en: 'Silver Athlete',                    ar: 'رياضي فضي' },
  bronzeAthlete:     { en: 'Bronze Athlete',                    ar: 'رياضي برونزي' },
  platinumAthlete:   { en: 'Platinum Athlete',                  ar: 'رياضي بلاتيني' },
  sportIdVerified:   { en: '🔐 SportID Verified',              ar: '🔐 موثق بهوية رياضية' },
  city:              { en: 'City',                              ar: 'المدينة' },
  age:               { en: 'Age',                              ar: 'العمر' },
  years:             { en: 'years',                             ar: 'سنة' },
  sports:            { en: 'Sports',                            ar: 'الرياضات' },
  ptsToNext:         { en: 'pts to',                            ar: 'نقطة للوصول إلى' },
  scanDesc:          { en: 'Scan for 2–3 sec verification',     ar: 'امسح للتحقق خلال 2-3 ثوانٍ' },
  simulateCheckin:   { en: '✅ Simulate Check-In',              ar: '✅ محاكاة تسجيل الحضور' },
  verifying:         { en: '⏳ Verifying...',                   ar: '⏳ جارٍ التحقق...' },
  checkedIn:         { en: '✓ Checked in · +10 Sport Points',  ar: '✓ تم التسجيل · +10 نقاط رياضية' },
  recentSessions:    { en: 'Recent Sessions',                   ar: 'الجلسات الأخيرة' },
  achievements:      { en: 'Achievements',                      ar: 'الإنجازات' },
  certifications:    { en: 'Certifications',                    ar: 'الشهادات' },

  // Points page
  totalSportPoints:  { en: 'Total Sport Points',                ar: 'إجمالي النقاط الرياضية' },
  currentLevel:      { en: 'Current Level',                     ar: 'المستوى الحالي' },
  fromSessions:      { en: 'From sessions',                     ar: 'من الجلسات' },
  howToEarn:         { en: 'How to Earn Points',                ar: 'كيفية كسب النقاط' },
  perCheckin:        { en: 'Per facility check-in',             ar: 'لكل تسجيل حضور' },
  registeredComp:    { en: 'Registered competition',            ar: 'مسابقة مسجلة' },
  verifiedCredential:{ en: 'Verified credential earned',        ar: 'شهادة موثقة مكتسبة' },
  rewardsCatalogue:  { en: 'Rewards Catalogue',                 ar: 'كتالوج المكافآت' },
  redeem:            { en: 'Redeem',                            ar: 'استرداد' },
  morePts:           { en: 'more pts',                          ar: 'نقطة إضافية' },
  trainingSession:   { en: 'Training Session',                  ar: 'جلسة تدريبية' },
  competitionEntry:  { en: 'Competition Entry',                 ar: 'دخول مسابقة' },
  certification:     { en: 'Certification',                     ar: 'شهادة' },
  trainingKit:       { en: 'Training Kit',                      ar: 'طقم تدريبي' },
  coachingSession:   { en: 'Coaching Session (1hr)',             ar: 'جلسة تدريب (ساعة)' },
  facilityAccess:    { en: 'Facility Premium Access',           ar: 'وصول مميز للمنشأة' },
  nationalInvite:    { en: 'National Team Tryout Invite',       ar: 'دعوة لتجارب المنتخب الوطني' },

  // Career page
  careerPathway:     { en: 'Career Pathway',                    ar: 'المسار المهني' },
  aiPowered:         { en: 'AI-powered career recommendations based on your SportID', ar: 'توصيات مهنية مدعومة بالذكاء الاصطناعي بناءً على هويتك الرياضية' },
  aiCareerScore:     { en: 'AI Career Score',                   ar: 'درجة المسار المهني بالذكاء الاصطناعي' },
  careerScoreDesc:   { en: 'Based on consistency, certifications, and competition performance', ar: 'بناءً على الانتظام والشهادات وأداء المنافسات' },
  devPathway:        { en: 'Development Pathway',               ar: 'مسار التطوير' },
  current:           { en: 'Current',                           ar: 'الحالي' },
  aiRecommendations: { en: 'AI Recommendations',                ar: 'توصيات الذكاء الاصطناعي' },
  aiPoweredBadge:    { en: 'AI Powered',                        ar: 'مدعوم بالذكاء الاصطناعي' },
  match:             { en: 'match',                             ar: 'تطابق' },
  apply:             { en: 'Apply',                             ar: 'تقدم' },
  deadline:          { en: 'Deadline',                          ar: 'الموعد النهائي' },
  trial:             { en: 'Trial',                             ar: 'تجارب' },
  development:       { en: 'Development',                       ar: 'تطوير' },
  competition:       { en: 'Competition',                       ar: 'مسابقة' },

  // History page
  fullHistory:       { en: 'Full Activity History',             ar: 'السجل الكامل للنشاط' },
  historyDesc:       { en: 'All sessions, achievements & certifications linked to your SportID', ar: 'جميع الجلسات والإنجازات والشهادات المرتبطة بهويتك الرياضية' },

  // ── Facility Nav ──────────────────────────────────────────────
  dashboard:         { en: 'Dashboard',                         ar: 'لوحة التحكم' },
  checkIn:           { en: 'Check-In',                          ar: 'تسجيل الحضور' },
  analytics:         { en: 'Analytics',                         ar: 'التحليلات' },
  facilityPortal:    { en: 'Manager Portal',                    ar: 'بوابة المدير' },

  // Facility dashboard
  sportidVerified:   { en: '🔐 ada2ai Verified Facility',      ar: '🔐 منشأة موثقة بهوية الرياضي' },
  activeAthletes:    { en: 'Active Athletes',                   ar: 'الرياضيون النشطون' },
  todayCheckins:     { en: "Today's Check-Ins",                 ar: 'تسجيلات اليوم' },
  monthlyRevenue:    { en: 'Monthly Revenue',                   ar: 'الإيرادات الشهرية' },
  avgCheckinTime:    { en: 'Avg Check-in Time',                 ar: 'متوسط وقت التسجيل' },
  liveCheckinFeed:   { en: 'Live Check-In Feed',                ar: 'تغذية تسجيل الحضور المباشر' },
  live:              { en: 'Live',                              ar: 'مباشر' },
  openQRScanner:     { en: '📷 Open QR Scanner',               ar: '📷 فتح ماسح QR' },
  simulateNew:       { en: '+ Simulate Check-In',               ar: '+ محاكاة تسجيل حضور' },
  scanning:          { en: '⏳ Scanning...',                    ar: '⏳ جارٍ المسح...' },
  qrVerified:        { en: '✓ Verified',                        ar: '✓ موثق' },
  ministryReporting: { en: 'Real-Time Ministry Reporting',      ar: 'تقارير فورية لوزارة الرياضة' },
  autoSynced:        { en: 'All check-ins auto-synced to Ministry of Sports dashboard', ar: 'جميع تسجيلات الحضور تتزامن تلقائياً مع لوحة وزارة الرياضة' },
  syncing:           { en: 'Syncing',                           ar: 'جارٍ المزامنة' },
  lastSync:          { en: 'Last sync',                         ar: 'آخر مزامنة' },
  sessionsToday:     { en: 'Sessions today',                    ar: 'جلسات اليوم' },
  pointsIssued:      { en: 'Points issued',                     ar: 'النقاط الممنوحة' },
  secAgo:            { en: '2 sec ago',                         ar: 'منذ ثانيتين' },

  // QR Checkin page
  qrScanner:         { en: '📷 QR Scanner',                    ar: '📷 ماسح رمز QR' },
  pointCameraDesc:   { en: "Point camera at athlete's QR code", ar: 'وجّه الكاميرا نحو رمز QR للرياضي' },
  scanAthlete1:      { en: '📷 Scan Athlete 1',                ar: '📷 مسح رياضي 1' },
  scanAthlete2:      { en: '📷 Scan Athlete 2',                ar: '📷 مسح رياضي 2' },
  manualLookup:      { en: 'Manual Athlete Lookup',           ar: 'البحث اليدوي عن رياضي' },
  enterNationalId:   { en: 'Enter Sport ID',                 ar: 'أدخل رقم الرياضي' },
  search:            { en: 'Search',                            ar: 'بحث' },
  athleteProfile:    { en: 'Athlete Profile',                   ar: 'ملف الرياضي' },
  scanToView:        { en: 'Scan a QR code to view athlete details', ar: 'امسح رمز QR لعرض تفاصيل الرياضي' },
  verifiedIn:        { en: 'Verified in 2.1 sec',               ar: 'تم التحقق في 2.1 ثانية' },
  confirmCheckin:    { en: '✅ Confirm Check-In (+10 pts)',      ar: '✅ تأكيد تسجيل الحضور (+10 نقاط)' },
  todayLog:          { en: "Today's Check-In Log",              ar: 'سجل تسجيل الحضور اليوم' },

  // Facility analytics
  facilityAnalytics: { en: 'Facility Analytics',                ar: 'تحليلات المنشأة' },
  todayRevenue:      { en: 'Today Revenue',                     ar: 'إيرادات اليوم' },
  capacityUsed:      { en: 'Capacity Used',                     ar: 'الطاقة المستخدمة' },
  avgSession:        { en: 'Avg Session',                       ar: 'متوسط الجلسة' },
  checkinsByHour:    { en: 'Check-ins by Hour (Today)',          ar: 'تسجيلات الحضور بالساعة (اليوم)' },
  weeklyRevenue:     { en: 'Weekly Revenue (SAR)',               ar: 'الإيرادات الأسبوعية (ريال)' },
  sportDistribution: { en: 'Sport Distribution (Today)',         ar: 'توزيع الرياضات (اليوم)' },
  sessions:          { en: 'sessions',                          ar: 'جلسات' },

  // ── Ministry Nav ──────────────────────────────────────────────
  regions:           { en: 'Regions',                           ar: 'المناطق' },
  sportsDisciplines: { en: 'Sports',                            ar: 'الرياضات' },
  ministryPortal:    { en: 'National Dashboard',                ar: 'لوحة التحكم الوطنية' },

  // Ministry dashboard
  nationalDashboard: { en: 'National Sports Dashboard',         ar: 'لوحة الرياضة الوطنية' },
  ministryOfSports:  { en: 'Ministry of Sports · Vision 2030 KPI Intelligence', ar: 'وزارة الرياضة · مؤشرات رؤية 2030' },
  vision2030Progress:{ en: 'Vision 2030 Progress',              ar: 'تقدم رؤية 2030' },
  vision2030Desc:    { en: 'Transforming Saudi Arabia through sports infrastructure', ar: 'تحويل المملكة العربية السعودية عبر البنية التحتية الرياضية' },
  youthEngagement:   { en: 'Youth Engagement',                  ar: 'مشاركة الشباب' },
  talentPipeline:    { en: 'Talent Pipeline',                   ar: 'خط المواهب' },
  nationalKPI:       { en: 'National KPI Score',                ar: 'مؤشر الأداء الوطني' },
  totalAthletes:     { en: 'Total Athletes',                    ar: 'إجمالي الرياضيين' },
  activeThisMonth:   { en: 'Active This Month',                 ar: 'النشطون هذا الشهر' },
  certFacilities:    { en: 'Certified Facilities',              ar: 'المنشآت المعتمدة' },
  totalSessions:     { en: 'Total Sessions',                    ar: 'إجمالي الجلسات' },
  growthChart:       { en: 'National Athlete & Session Growth',  ar: 'نمو الرياضيين والجلسات الوطنية' },
  athletesByRegion:  { en: 'Athletes by Region',                ar: 'الرياضيون حسب المنطقة' },
  athletesBySport:   { en: 'Athletes by Sport',                 ar: 'الرياضيون حسب الرياضة' },
  sportIdIntegration: { en: 'SportID Integration',               ar: 'تكامل هوية رياضية' },
  fullBiometric:     { en: 'Full digital ID linkage',           ar: 'ربط كامل بالهوية الرقمية' },
  dataCompliant:     { en: 'Saudi Data Law Compliant',          ar: 'متوافق مع نظام حماية البيانات' },
  dataDesc:          { en: 'All data stored in-Kingdom',        ar: 'جميع البيانات مخزنة داخل المملكة' },
  absherIntegration: { en: 'Absher Integration',                ar: 'تكامل أبشر' },
  guardianConsent:   { en: 'Guardian consent verified',         ar: 'موافقة ولي الأمر موثقة' },
  vsLastYear:        { en: '+18% vs last yr',                   ar: '+18% مقارنة بالعام الماضي' },
  participationRate: { en: '68% participation rate',            ar: '68% معدل المشاركة' },
  allProvinces:      { en: 'All 13 provinces',                  ar: 'جميع المناطق الـ 13' },
  sinceSep:          { en: 'Since Sep 2025',                    ar: 'منذ سبتمبر 2025' },

  // Ministry regions
  regionalBreakdown: { en: 'Regional Breakdown',                ar: 'التوزيع الإقليمي' },
  provincesDesc:     { en: 'All 13 provinces — Vision 2030 equity tracking', ar: 'جميع المناطق الـ 13 — تتبع عدالة رؤية 2030' },
  facilities:        { en: 'facilities',                        ar: 'منشأة' },
  sessPerAthlete:    { en: 'sess/athlete',                      ar: 'جلسة/رياضي' },

  // Ministry sports
  sportsIntel:       { en: 'Sports Intelligence',               ar: 'استخبارات الرياضة' },
  sportsIntelDesc:   { en: 'National participation data by discipline', ar: 'بيانات المشاركة الوطنية حسب الرياضة' },
  sessionsBySport:   { en: 'Sessions by Sport',                 ar: 'الجلسات حسب الرياضة' },
  athletes:          { en: 'Athletes',                          ar: 'رياضيون' },
  yoyGrowth:         { en: 'YoY',                              ar: 'سنوياً' },

  // Levels
  Bronze:            { en: 'Bronze',                            ar: 'برونزي' },
  Silver:            { en: 'Silver',                            ar: 'فضي' },
  Gold:              { en: 'Gold',                              ar: 'ذهبي' },
  Platinum:          { en: 'Platinum',                          ar: 'بلاتيني' },
} as const;

export type TranslationKey = keyof typeof translations;

export function t(key: TranslationKey, lang: Lang): string {
  return translations[key][lang];
}
