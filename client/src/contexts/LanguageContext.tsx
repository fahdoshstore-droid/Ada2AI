import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Language = "en" | "ar";

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "en",
  setLang: () => {},
  t: (k) => k,
  isRTL: false,
});

export const useLanguage = () => useContext(LanguageContext);

// ─── Translations ──────────────────────────────────────────────────────────────

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navbar
    "nav.product": "Product",
    "nav.partnerships": "Partnerships",
    "nav.governance": "Governance",
    "nav.dashboards": "Dashboards",
    "nav.training": "Training Hub",
    "nav.getStarted": "Get Started",
    "nav.login": "Login",
    "nav.logout": "Logout",
    "nav.subGov": "Sub-Governance",
    "nav.teamMembers": "Team Members",
    "nav.scoutDashboard": "Scout Dashboard",
    "nav.compare": "Compare Athletes",
    "nav.upload": "AI Analysis",
    "nav.sportId": "Sport ID",

    // Hero
    "hero.badge": "AI-Powered Sports Platform",
    "hero.headline1": "The AI Platform for",
    "hero.headline2": "Sport Talent Discovery",
    "hero.sub": "Discover, analyze, and develop athletes across all sports — no equipment, no experts, no barriers.",
    "hero.cta1": "Analyze an Athlete",
    "hero.cta2": "Explore Platform",
    "hero.stat1.val": "12+",
    "hero.stat1.label": "Performance Metrics",
    "hero.stat2.val": "Under 60s",
    "hero.stat2.label": "Analysis Time",
    "hero.stat3.val": "6",
    "hero.stat3.label": "Platform Modules",
    "hero.stat4.val": "Pilot",
    "hero.stat4.label": "Phase Active",

    // Sports
    "sports.title": "All Sports. One Platform.",
    "sports.sub": "From football pitches to swimming pools, from boxing rings to open water — ada2ai covers every sport.",
    "sports.football": "Football",
    "sports.basketball": "Basketball",
    "sports.boxing": "Boxing",
    "sports.swimming": "Swimming",
    "sports.freediving": "Free Diving",
    "sports.other": "Other Sports",

    // Problem
    "problem.badge": "The Challenge",
    "problem.title": "Talent Stays Hidden",
    "problem.sub": "Across Saudi Arabia and the MENA region, thousands of talented athletes go undiscovered every year — not because they lack ability, but because the infrastructure to find them doesn't exist at scale.",
    "problem.1.title": "Fragmented Discovery",
    "problem.1.desc": "Traditional scouting is manual, inconsistent, and limited to scouts who are physically present — missing thousands of talented athletes in underserved regions.",
    "problem.2.title": "Cost-Restricted Access",
    "problem.2.desc": "Professional scouting infrastructure is expensive — available only to large clubs, leaving grassroots athletes without any pathway to discovery.",
    "problem.3.title": "No Digital Identity",
    "problem.3.desc": "Athletes have no unified digital profile to showcase their abilities — making remote discovery by scouts, academies, and federations impossible.",
    "problem.4.title": "Siloed Data",
    "problem.4.desc": "Performance data is scattered across coaches and clubs with no unified system — preventing evidence-based decisions at scale.",

    // Solution
    "solution.badge": "The Solution",
    "solution.title": "Six Modules. One Mission.",
    "solution.sub": "ada2ai integrates six powerful modules into a single platform — from athlete identification to federation-level governance.",

    // How It Works
    "how.badge": "How It Works",
    "how.title": "From Upload to Insight in 5 Steps",
    "how.1.title": "Submit Athlete Media",
    "how.1.desc": "Upload a photo or video of any athlete. No special equipment needed — a smartphone is enough.",
    "how.2.title": "AI Analyzes Performance",
    "how.2.desc": "Our AI engine analyzes physical attributes, movement patterns, and sport-specific indicators.",
    "how.3.title": "Generate Sport ID",
    "how.3.desc": "Every analyzed athlete receives a verified digital Sport ID — their permanent athletic passport.",
    "how.4.title": "Scout & Compare",
    "how.4.desc": "Scouts access the dashboard to search, filter, and compare athletes across regions and sports.",
    "how.5.title": "Connect & Develop",
    "how.5.desc": "Athletes connect with academies, clubs, and federations through the platform's verified network.",

    // Product modules
    "module.sportId.title": "Sport Digital ID",
    "module.sportId.desc": "Every athlete gets a verified digital identity — a standardized profile with AI-analyzed performance data, QR code, and sport-specific metrics.",
    "module.aiEngine.title": "AI Analysis Engine",
    "module.aiEngine.desc": "Upload a photo or video and receive a comprehensive performance report based on international governance standards.",
    "module.scouts.title": "Scouts Dashboard",
    "module.scouts.desc": "A powerful search and filtering interface for scouts to discover, compare, and track athletes across all sports and regions.",
    "module.compare.title": "Compare Engine",
    "module.compare.desc": "Side-by-side athlete comparison with radar charts, metric breakdowns, and AI-generated scouting recommendations.",
    "module.institutes.title": "Sports Institutes",
    "module.institutes.desc": "A verified directory of sports clubs, academies, and gyms across Saudi Arabia — filterable by sport, city, and age group.",
    "module.training.title": "Training Hub",
    "module.training.desc": "AI-powered training management platform for coaches — generate personalized plans, track progress, manage matches, and get real-time coaching.",

    // Vision 2030
    "vision.badge": "Strategic Alignment",
    "vision.title": "Aligned with Vision 2030",
    "vision.sub": "ada2ai directly supports Saudi Arabia's Vision 2030 goals for sports development, digital transformation, and national talent discovery.",

    // CTA
    "cta.title": "Ready to Discover Tomorrow's Champions?",
    "cta.sub": "Join the ada2ai platform and transform how sports talent is discovered, developed, and connected across Saudi Arabia.",
    "cta.btn1": "Analyze an Athlete",
    "cta.btn2": "Learn More",

    // Footer
    "footer.tagline": "AI Sports Talent Discovery",
    "footer.rights": "© 2026 ada2ai · Saudi Innovation · Arabic-First Platform",

    // Dashboards page
    "dash.title": "Dashboards",
    "dash.sub": "All your analytics and scouting tools in one place.",
    "dash.scout": "Scout Dashboard",
    "dash.scout.desc": "Search, filter, and discover athletes across all sports and regions.",
    "dash.compare": "Compare Athletes",
    "dash.compare.desc": "Side-by-side comparison with radar charts and AI recommendations.",
    "dash.upload": "AI Analysis",
    "dash.upload.desc": "Upload athlete media for instant AI performance analysis.",
    "dash.sportid": "Sport ID",
    "dash.sportid.desc": "Generate and manage verified digital athlete identities.",

    // Scouts page
    "scouts.title": "Scout Dashboard",
    "scouts.sub": "Search, filter, and discover athletes across all sports and regions.",
    "scouts.search": "Search athletes...",
    "scouts.filter.sport": "Sport",
    "scouts.filter.region": "Region",
    "scouts.filter.age": "Age Group",
    "scouts.filter.all": "All",
    "scouts.col.name": "Athlete",
    "scouts.col.sport": "Sport",
    "scouts.col.age": "Age",
    "scouts.col.region": "Region",
    "scouts.col.score": "Score",
    "scouts.col.actions": "Actions",
    "scouts.viewProfile": "View Profile",
    "scouts.compare": "Compare",
    "scouts.noResults": "No athletes found matching your filters.",
    "scouts.total": "Total Athletes",
    "scouts.avgScore": "Avg. Score",
    "scouts.sports": "Sports",
    "scouts.regions": "Regions",

    // Compare page
    "compare.title": "Compare Athletes",
    "compare.sub": "Select two athletes to compare their performance metrics side by side.",
    "compare.select1": "Select Athlete 1",
    "compare.select2": "Select Athlete 2",
    "compare.placeholder": "Choose an athlete...",
    "compare.vs": "VS",
    "compare.metrics": "Performance Metrics",
    "compare.recommendation": "AI Recommendation",
    "compare.winner": "Recommended Pick",
    "compare.speed": "Speed",
    "compare.strength": "Strength",
    "compare.technique": "Technique",
    "compare.endurance": "Endurance",
    "compare.teamwork": "Teamwork",
    "compare.selectBoth": "Select two athletes above to see the comparison",

    // Upload page
    "upload.title": "AI Analysis Engine",
    "upload.sub": "Upload a photo or video of any athlete for instant AI performance analysis.",
    "upload.dropzone": "Drop your file here or click to browse",
    "upload.formats": "Supports JPG, PNG, MP4, MOV — max 50MB",
    "upload.btn": "Analyze Athlete",
    "upload.analyzing": "Analyzing...",
    "upload.results": "Analysis Results",
    "upload.score": "Overall Score",
    "upload.metrics": "Performance Metrics",
    "upload.report": "Full Report",
    "upload.newAnalysis": "New Analysis",
    "upload.sport": "Select Sport",
    "upload.position": "Position (optional)",

    // SportID page
    "sportid.title": "Sport Digital ID",
    "sportid.sub": "Generate a verified digital identity for any athlete.",
    "sportid.generate": "Generate Sport ID",
    "sportid.name": "Athlete Name",
    "sportid.sport": "Sport",
    "sportid.dob": "Date of Birth",
    "sportid.club": "Club / Academy",
    "sportid.position": "Position",
    "sportid.nationality": "Nationality",
    "sportid.preview": "ID Preview",
    "sportid.download": "Download ID",
    "sportid.share": "Share",
    "sportid.verified": "Verified",
    "sportid.issued": "Issued by ada2ai",
    "sportid.metrics": "Performance Metrics",

    // Academies page
    "academies.title": "Sports Institutes",
    "academies.sub": "Verified directory of sports clubs, academies, and gyms across Saudi Arabia.",
    "academies.search": "Search institutes...",
    "academies.filter.sport": "Sport",
    "academies.filter.city": "City",
    "academies.filter.age": "Age Group",
    "academies.filter.all": "All",
    "academies.students": "Students",
    "academies.rating": "Rating",
    "academies.contact": "Contact",
    "academies.viewMap": "View on Map",
    "academies.noResults": "No institutes found.",

    // Governance page
    "gov.title": "Governance",
    "gov.sub": "Transparent governance framework for the ada2ai platform.",
    "gov.sub-gov": "Sub-Governance",
    "gov.sub-gov.desc": "Regional and sport-specific governance structures.",
    "gov.team": "Team Members",
    "gov.team.desc": "Meet the people behind ada2ai.",
    "gov.framework": "Governance Framework",
    "gov.framework.desc": "Our commitment to transparency, accountability, and ethical AI in sports.",
    "gov.viewSubGov": "View Sub-Governance",
    "gov.viewTeam": "View Team",

    // Sub-Governance page
    "subgov.title": "Sub-Governance",
    "subgov.sub": "Regional and sport-specific governance structures ensuring fair representation.",
    "subgov.region": "Region",
    "subgov.sport": "Sport",
    "subgov.representative": "Representative",
    "subgov.role": "Role",
    "subgov.status": "Status",
    "subgov.active": "Active",
    "subgov.pending": "Pending",

    // Team Members page
    "team.title": "Team Members",
    "team.sub": "The people building the future of sports talent discovery.",
    "team.role": "Role",
    "team.linkedin": "LinkedIn",
    "team.email": "Email",

    // Common
    "common.openDashboard": "Open Dashboard",
    "common.learnMore": "Learn More",
    "common.viewAll": "View All",
    "common.comingSoon": "Coming Soon",
    "common.pilotPhase": "Pilot Phase",
    "common.new": "NEW",
    "common.back": "Back",
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.loading": "Loading...",
    "common.error": "An error occurred",
    "common.success": "Success",
    "common.submit": "Submit",
    "common.search": "Search",
    "common.filter": "Filter",
    "common.reset": "Reset",
    "common.export": "Export",
    "common.download": "Download",
    "common.share": "Share",
    "common.edit": "Edit",
    "common.delete": "Delete",
    "common.view": "View",
    "common.close": "Close",
    "common.yes": "Yes",
    "common.no": "No",
    "common.or": "or",
    "common.and": "and",
    "common.of": "of",
    "common.results": "results",
    "common.noData": "No data available",

    // Training Hub
    "training.title": "Training Hub",
    "training.sub": "AI-powered training management for coaches and athletes.",
    "training.dashboard": "Dashboard",
    "training.aiChat": "AI Assistant",
    "training.coach": "Coach Board",
    "training.players": "Players",
    "training.sessions": "Training",
    "training.progress": "Progress",
    "training.matches": "Matches",
    "training.settings": "Settings",
    "training.backToAda2ai": "Back to ada2ai",
  },

  ar: {
    // Navbar
    "nav.product": "المنتج",
    "nav.partnerships": "الشراكات",
    "nav.governance": "الحوكمة",
    "nav.dashboards": "لوحات التحكم",
    "nav.training": "مركز التدريب",
    "nav.getStarted": "ابدأ الآن",
    "nav.login": "تسجيل الدخول",
    "nav.logout": "تسجيل الخروج",
    "nav.subGov": "الحوكمة الفرعية",
    "nav.teamMembers": "أعضاء الفريق",
    "nav.scoutDashboard": "لوحة الكشافين",
    "nav.compare": "مقارنة الرياضيين",
    "nav.upload": "تحليل الذكاء الاصطناعي",
    "nav.sportId": "الهوية الرياضية",

    // Hero
    "hero.badge": "منصة رياضية بالذكاء الاصطناعي",
    "hero.headline1": "منصة الذكاء الاصطناعي",
    "hero.headline2": "لاكتشاف المواهب الرياضية",
    "hero.sub": "اكتشف وحلل وطور الرياضيين في جميع الرياضات — بدون معدات، بدون خبراء، بدون حواجز.",
    "hero.cta1": "تحليل رياضي",
    "hero.cta2": "استكشف المنصة",
    "hero.stat1.val": "+12",
    "hero.stat1.label": "معيار أداء",
    "hero.stat2.val": "أقل من 60 ثانية",
    "hero.stat2.label": "وقت التحليل",
    "hero.stat3.val": "6",
    "hero.stat3.label": "وحدات المنصة",
    "hero.stat4.val": "تجريبي",
    "hero.stat4.label": "المرحلة الحالية",

    // Sports
    "sports.title": "جميع الرياضات. منصة واحدة.",
    "sports.sub": "من ملاعب كرة القدم إلى حمامات السباحة، من حلبات الملاكمة إلى المياه المفتوحة — ada2ai تغطي كل رياضة.",
    "sports.football": "كرة القدم",
    "sports.basketball": "كرة السلة",
    "sports.boxing": "الملاكمة",
    "sports.swimming": "السباحة",
    "sports.freediving": "الغوص الحر",
    "sports.other": "رياضات أخرى",

    // Problem
    "problem.badge": "التحدي",
    "problem.title": "المواهب تبقى مجهولة",
    "problem.sub": "في جميع أنحاء المملكة العربية السعودية ومنطقة الشرق الأوسط وشمال أفريقيا، يبقى آلاف الرياضيين الموهوبين مجهولين كل عام — ليس لأنهم يفتقرون إلى القدرة، بل لأن البنية التحتية للعثور عليهم لا تتوفر على نطاق واسع.",
    "problem.1.title": "الكشف مجزأ",
    "problem.1.desc": "الكشف التقليدي يدوي وغير متسق ومحدود بالكشافين الموجودين فعلياً — مما يفوّت آلاف الرياضيين الموهوبين في المناطق المحرومة.",
    "problem.2.title": "الوصول مقيّد بالتكلفة",
    "problem.2.desc": "البنية التحتية للكشف الاحترافي باهظة التكلفة — متاحة فقط للأندية الكبرى، تاركةً الرياضيين الشعبيين بدون أي مسار للاكتشاف.",
    "problem.3.title": "لا هوية رقمية",
    "problem.3.desc": "لا يملك الرياضيون ملفاً رقمياً موحداً لعرض قدراتهم — مما يجعل اكتشافهم من قبل الكشافين والأكاديميات والاتحادات عن بُعد أمراً مستحيلاً.",
    "problem.4.title": "البيانات معزولة",
    "problem.4.desc": "بيانات الأداء مبعثرة بين المدربين والأندية بدون نظام موحد — مما يمنع اتخاذ قرارات مبنية على الأدلة على نطاق واسع.",

    // Solution
    "solution.badge": "الحل",
    "solution.title": "ست وحدات. مهمة واحدة.",
    "solution.sub": "تدمج ada2ai ست وحدات قوية في منصة واحدة — من تحديد الرياضيين إلى الحوكمة على مستوى الاتحادات.",

    // How It Works
    "how.badge": "كيف يعمل",
    "how.title": "من الرفع إلى التحليل في 5 خطوات",
    "how.1.title": "رفع وسائط الرياضي",
    "how.1.desc": "ارفع صورة أو فيديو لأي رياضي. لا تحتاج معدات خاصة — الهاتف الذكي كافٍ.",
    "how.2.title": "الذكاء الاصطناعي يحلل الأداء",
    "how.2.desc": "يحلل محرك الذكاء الاصطناعي الخصائص الجسدية وأنماط الحركة والمؤشرات الخاصة بكل رياضة.",
    "how.3.title": "إنشاء الهوية الرياضية",
    "how.3.desc": "يحصل كل رياضي محلَّل على هوية رياضية رقمية موثقة — جواز سفره الرياضي الدائم.",
    "how.4.title": "الكشف والمقارنة",
    "how.4.desc": "يصل الكشافون إلى لوحة التحكم للبحث والتصفية ومقارنة الرياضيين عبر المناطق والرياضات.",
    "how.5.title": "التواصل والتطوير",
    "how.5.desc": "يتواصل الرياضيون مع الأكاديميات والأندية والاتحادات من خلال الشبكة الموثقة للمنصة.",

    // Product modules
    "module.sportId.title": "الهوية الرياضية الرقمية",
    "module.sportId.desc": "يحصل كل رياضي على هوية رقمية موثقة — ملف موحد مع بيانات أداء محللة بالذكاء الاصطناعي ورمز QR ومقاييس خاصة بالرياضة.",
    "module.aiEngine.title": "محرك التحليل بالذكاء الاصطناعي",
    "module.aiEngine.desc": "ارفع صورة أو فيديو واحصل على تقرير أداء شامل بناءً على معايير الحوكمة الدولية.",
    "module.scouts.title": "لوحة الكشافين",
    "module.scouts.desc": "واجهة بحث وتصفية قوية للكشافين لاكتشاف الرياضيين ومقارنتهم وتتبعهم عبر جميع الرياضات والمناطق.",
    "module.compare.title": "محرك المقارنة",
    "module.compare.desc": "مقارنة جنباً إلى جنب بين الرياضيين مع مخططات الرادار وتفاصيل المقاييس وتوصيات الكشف المولدة بالذكاء الاصطناعي.",
    "module.institutes.title": "المعاهد الرياضية",
    "module.institutes.desc": "دليل موثق للأندية الرياضية والأكاديميات والصالات الرياضية في جميع أنحاء المملكة العربية السعودية — قابل للتصفية حسب الرياضة والمدينة والفئة العمرية.",
    "module.training.title": "مركز التدريب",
    "module.training.desc": "منصة إدارة تدريب بالذكاء الاصطناعي للمدربين — إنشاء خطط مخصصة وتتبع التقدم وإدارة المباريات والحصول على تدريب فوري.",

    // Vision 2030
    "vision.badge": "التوافق الاستراتيجي",
    "vision.title": "متوافق مع رؤية 2030",
    "vision.sub": "تدعم ada2ai مباشرةً أهداف رؤية المملكة العربية السعودية 2030 لتطوير الرياضة والتحول الرقمي واكتشاف المواهب الوطنية.",

    // CTA
    "cta.title": "هل أنت مستعد لاكتشاف أبطال الغد؟",
    "cta.sub": "انضم إلى منصة ada2ai وحوّل طريقة اكتشاف المواهب الرياضية وتطويرها وربطها في جميع أنحاء المملكة العربية السعودية.",
    "cta.btn1": "تحليل رياضي",
    "cta.btn2": "اعرف المزيد",

    // Footer
    "footer.tagline": "اكتشاف المواهب الرياضية بالذكاء الاصطناعي",
    "footer.rights": "© 2026 ada2ai · ابتكار سعودي · منصة عربية أولاً",

    // Dashboards page
    "dash.title": "لوحات التحكم",
    "dash.sub": "جميع أدوات التحليل والكشف في مكان واحد.",
    "dash.scout": "لوحة الكشافين",
    "dash.scout.desc": "ابحث وصفّ واكتشف الرياضيين عبر جميع الرياضات والمناطق.",
    "dash.compare": "مقارنة الرياضيين",
    "dash.compare.desc": "مقارنة جنباً إلى جنب مع مخططات الرادار وتوصيات الذكاء الاصطناعي.",
    "dash.upload": "تحليل الذكاء الاصطناعي",
    "dash.upload.desc": "ارفع وسائط الرياضي للحصول على تحليل أداء فوري بالذكاء الاصطناعي.",
    "dash.sportid": "الهوية الرياضية",
    "dash.sportid.desc": "إنشاء وإدارة الهويات الرياضية الرقمية الموثقة للرياضيين.",

    // Scouts page
    "scouts.title": "لوحة الكشافين",
    "scouts.sub": "ابحث وصفّ واكتشف الرياضيين عبر جميع الرياضات والمناطق.",
    "scouts.search": "ابحث عن رياضيين...",
    "scouts.filter.sport": "الرياضة",
    "scouts.filter.region": "المنطقة",
    "scouts.filter.age": "الفئة العمرية",
    "scouts.filter.all": "الكل",
    "scouts.col.name": "الرياضي",
    "scouts.col.sport": "الرياضة",
    "scouts.col.age": "العمر",
    "scouts.col.region": "المنطقة",
    "scouts.col.score": "النتيجة",
    "scouts.col.actions": "الإجراءات",
    "scouts.viewProfile": "عرض الملف",
    "scouts.compare": "مقارنة",
    "scouts.noResults": "لا يوجد رياضيون يطابقون معايير البحث.",
    "scouts.total": "إجمالي الرياضيين",
    "scouts.avgScore": "متوسط النتيجة",
    "scouts.sports": "الرياضات",
    "scouts.regions": "المناطق",

    // Compare page
    "compare.title": "مقارنة الرياضيين",
    "compare.sub": "اختر رياضيين لمقارنة مقاييس أدائهم جنباً إلى جنب.",
    "compare.select1": "اختر الرياضي الأول",
    "compare.select2": "اختر الرياضي الثاني",
    "compare.placeholder": "اختر رياضياً...",
    "compare.vs": "ضد",
    "compare.metrics": "مقاييس الأداء",
    "compare.recommendation": "توصية الذكاء الاصطناعي",
    "compare.winner": "الاختيار الموصى به",
    "compare.speed": "السرعة",
    "compare.strength": "القوة",
    "compare.technique": "التقنية",
    "compare.endurance": "التحمل",
    "compare.teamwork": "العمل الجماعي",
    "compare.selectBoth": "اختر رياضيين أعلاه لرؤية المقارنة",

    // Upload page
    "upload.title": "محرك التحليل بالذكاء الاصطناعي",
    "upload.sub": "ارفع صورة أو فيديو لأي رياضي للحصول على تحليل أداء فوري.",
    "upload.dropzone": "اسحب ملفك هنا أو انقر للتصفح",
    "upload.formats": "يدعم JPG, PNG, MP4, MOV — الحد الأقصى 50MB",
    "upload.btn": "تحليل الرياضي",
    "upload.analyzing": "جاري التحليل...",
    "upload.results": "نتائج التحليل",
    "upload.score": "النتيجة الإجمالية",
    "upload.metrics": "مقاييس الأداء",
    "upload.report": "التقرير الكامل",
    "upload.newAnalysis": "تحليل جديد",
    "upload.sport": "اختر الرياضة",
    "upload.position": "المركز (اختياري)",

    // SportID page
    "sportid.title": "الهوية الرياضية الرقمية",
    "sportid.sub": "إنشاء هوية رقمية موثقة لأي رياضي.",
    "sportid.generate": "إنشاء هوية رياضية",
    "sportid.name": "اسم الرياضي",
    "sportid.sport": "الرياضة",
    "sportid.dob": "تاريخ الميلاد",
    "sportid.club": "النادي / الأكاديمية",
    "sportid.position": "المركز",
    "sportid.nationality": "الجنسية",
    "sportid.preview": "معاينة الهوية",
    "sportid.download": "تحميل الهوية",
    "sportid.share": "مشاركة",
    "sportid.verified": "موثق",
    "sportid.issued": "صادر من ada2ai",
    "sportid.metrics": "مقاييس الأداء",

    // Academies page
    "academies.title": "المعاهد الرياضية",
    "academies.sub": "دليل موثق للأندية الرياضية والأكاديميات والصالات في جميع أنحاء المملكة العربية السعودية.",
    "academies.search": "ابحث عن معاهد...",
    "academies.filter.sport": "الرياضة",
    "academies.filter.city": "المدينة",
    "academies.filter.age": "الفئة العمرية",
    "academies.filter.all": "الكل",
    "academies.students": "الطلاب",
    "academies.rating": "التقييم",
    "academies.contact": "تواصل",
    "academies.viewMap": "عرض على الخريطة",
    "academies.noResults": "لا توجد معاهد.",

    // Governance page
    "gov.title": "الحوكمة",
    "gov.sub": "إطار حوكمة شفاف لمنصة ada2ai.",
    "gov.sub-gov": "الحوكمة الفرعية",
    "gov.sub-gov.desc": "هياكل الحوكمة الإقليمية والخاصة بكل رياضة.",
    "gov.team": "أعضاء الفريق",
    "gov.team.desc": "تعرف على الأشخاص وراء ada2ai.",
    "gov.framework": "إطار الحوكمة",
    "gov.framework.desc": "التزامنا بالشفافية والمساءلة والذكاء الاصطناعي الأخلاقي في الرياضة.",
    "gov.viewSubGov": "عرض الحوكمة الفرعية",
    "gov.viewTeam": "عرض الفريق",

    // Sub-Governance page
    "subgov.title": "الحوكمة الفرعية",
    "subgov.sub": "هياكل الحوكمة الإقليمية والخاصة بكل رياضة لضمان التمثيل العادل.",
    "subgov.region": "المنطقة",
    "subgov.sport": "الرياضة",
    "subgov.representative": "الممثل",
    "subgov.role": "الدور",
    "subgov.status": "الحالة",
    "subgov.active": "نشط",
    "subgov.pending": "قيد الانتظار",

    // Team Members page
    "team.title": "أعضاء الفريق",
    "team.sub": "الأشخاص الذين يبنون مستقبل اكتشاف المواهب الرياضية.",
    "team.role": "الدور",
    "team.linkedin": "لينكد إن",
    "team.email": "البريد الإلكتروني",

    // Common
    "common.openDashboard": "فتح لوحة التحكم",
    "common.learnMore": "اعرف المزيد",
    "common.viewAll": "عرض الكل",
    "common.comingSoon": "قريباً",
    "common.pilotPhase": "مرحلة تجريبية",
    "common.new": "جديد",
    "common.back": "رجوع",
    "common.save": "حفظ",
    "common.cancel": "إلغاء",
    "common.loading": "جاري التحميل...",
    "common.error": "حدث خطأ",
    "common.success": "تم بنجاح",
    "common.submit": "إرسال",
    "common.search": "بحث",
    "common.filter": "تصفية",
    "common.reset": "إعادة تعيين",
    "common.export": "تصدير",
    "common.download": "تحميل",
    "common.share": "مشاركة",
    "common.edit": "تعديل",
    "common.delete": "حذف",
    "common.view": "عرض",
    "common.close": "إغلاق",
    "common.yes": "نعم",
    "common.no": "لا",
    "common.or": "أو",
    "common.and": "و",
    "common.of": "من",
    "common.results": "نتائج",
    "common.noData": "لا توجد بيانات",

    // Training Hub
    "training.title": "مركز التدريب",
    "training.sub": "إدارة التدريب بالذكاء الاصطناعي للمدربين والرياضيين.",
    "training.dashboard": "لوحة التحكم",
    "training.aiChat": "مساعد AI",
    "training.coach": "لوحة المدرب",
    "training.players": "اللاعبون",
    "training.sessions": "التدريبات",
    "training.progress": "التقدم",
    "training.matches": "المباريات",
    "training.settings": "الإعدادات",
    "training.backToAda2ai": "العودة إلى ada2ai",
  },
};

// ─── Provider ──────────────────────────────────────────────────────────────────

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    const stored = localStorage.getItem("ada2ai-lang");
    return (stored === "ar" || stored === "en") ? stored : "en";
  });

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem("ada2ai-lang", newLang);
  };

  const t = (key: string): string => {
    return translations[lang][key] ?? translations["en"][key] ?? key;
  };

  const isRTL = lang === "ar";

  useEffect(() => {
    document.documentElement.dir = isRTL ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  }, [lang, isRTL]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, isRTL }}>
      {children}
    </LanguageContext.Provider>
  );
}
