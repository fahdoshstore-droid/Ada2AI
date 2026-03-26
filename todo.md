# Scout AI / SportScout Platform — TODO

## Completed Features

- [x] صفحة رئيسية مع فيديو خلفية تلقائي (Hero Section)
- [x] قسم المشكلة، الحل، كيف يعمل، السوق، التقنية
- [x] قسم الميزة التنافسية (جدول مقارنة)
- [x] قسم الأسعار (4 خطط)
- [x] قسم رؤية 2030
- [x] نموذج تواصل مع واتساب
- [x] دليل الأكاديميات مع فلاتر (مدينة/رياضة/عمر)
- [x] صفحة العرض التجريبي (Demo) مع Radar Chart تفاعلي
- [x] لوحة الكشافين مع بحث متقدم وجدول اللاعبين
- [x] صفحة رفع الفيديو مع محاكاة تحليل AI
- [x] صفحة مقارنة اللاعبين مع Radar Chart مزدوج
- [x] صفحة SportID مع جواز السفر الرياضي وQR Code
- [x] Demo Mode لـ SportID بدون OTP
- [x] محرك تحليل AI بمعايير FIFA + الاتحاد السعودي (18 معياراً)
- [x] تكامل Claude AI الحقيقي لتحليل الصور (scoutAnalysis.ts)
- [x] برومبت FIFA/SAFF الكامل: PLAYER VISUAL SCOUT REPORT
- [x] عرض تقرير PLAYER VISUAL SCOUT REPORT في صفحة النتائج
- [x] رفع الصور إلى S3 وتحليلها بـ Claude Vision
- [x] Navbar مع قوائم منسدلة لجميع الصفحات
- [x] Footer مع روابط جميع الصفحات
- [x] Dark Mode سعودي (Saudi Tech Noir)
- [x] دعم اللغة العربية + خطوط Tajawal + Space Grotesk
- [x] تصميم Mobile-responsive
- [x] Scroll reveal animations

## Pending / Future Features

- [ ] تسجيل دخول حقيقي (Supabase Auth / Manus OAuth)
- [ ] خريطة Google Maps حقيقية في صفحة الأكاديميات
- [ ] صفحة لاعب فردي (Scout AI + SportID معاً)
- [ ] قسم شهادات من الأكاديميات
- [ ] تفعيل QR للحضور الحقيقي
- [ ] تحليل الفيديو الحقيقي (يتطلب video processing API)
- [ ] صفحة مدونة/أخبار لتحسين SEO

## Bug Fixes & New Features (Current Sprint)

- [x] إصلاح مشكلة عدم اكتمال تحليل الصورة بـ Claude AI (إزالة patchedFetch المسبب للتوقف)
- [x] بناء نظام تحليل الفيديو الحقيقي (استخراج إطارات + Claude Vision)
- [x] تحسين معالجة أخطاء الـ API وعرضها للمستخدم
- [x] إصلاح حساب elapsed time في frontend لضمان اكتمال الـ animation

## Ada2ai Rebrand Sprint

- [x] تغيير اسم المنصة من Scout AI إلى ada2ai
- [x] تطبيق نظام ألوان Ada2ai الكامل (#000A0F, #00DCC8, #007ABA, #FFA500)
- [x] تطبيق خطوط Ada2ai (Orbitron للعناوين + Cairo للعربي)
- [x] بناء Ada2aiNavbar مع sticky top nav وجميع الروابط الـ 8
- [x] إعادة بناء الصفحة الرئيسية (Home) بهوية ada2ai الكاملة ونطاق جميع الرياضات
- [x] إنشاء صفحة Product مع عرض الـ 6 وحدات بتصميم ada2ai
- [x] إنشاء صفحة Players (قاعدة بيانات الرياضيين) مع فلاتر متقدمة
- [x] تحديث جميع الصفحات الـ 6 (Demo, Scouts, Compare, Academies, Upload, SportID) بـ Ada2aiNavbar
- [x] تحديث ألوان الخلفية في جميع الصفحات إلى #000A0F
- [x] تحديث عنوان HTML إلى ada2ai
- [x] توسيع النطاق من كرة القدم إلى جميع الرياضات

## 19-Item UX & Content Update Sprint

- [x] تحديث الـ Navigation: 5 عناصر فقط، نص أكبر، استبدال Academies بـ Partnerships
- [x] إضافة قائمة منسدلة Governance (Sub-Governance + Team Members)
- [x] حذف For Scouts / Player Database / Compare من الـ nav
- [x] تحديث Hero Headline: "The AI Platform for Sport Talent Discovery"
- [x] تحديث Hero Subtitle: منصة متعددة الرياضات، بدون معدات، بدون خبراء
- [x] استبدال Sports Tags: Football, Athletics, Swimming, Basketball, Tennis, Volleyball, Cycling, Combat Sports
- [x] تحويل CTA إلى زر واحد: "Analyze an Athlete"
- [x] تحديث Stats: 18 Metrics → 12+ Metrics، 8 ثوانٍ → Under 60s، إضافة Pilot Phase badge
- [x] حذف جميع مراجع FIFA/SAFF من واجهة المستخدم
- [x] تحديث Problem Section: 4 مشاكل جديدة لجميع الرياضات
- [x] تحديث Solution Section: 6 وحدات مع Sport ID أولاً
- [x] تحديث Technology Section: إزالة "Claude Vision"، Sport ID أولاً
- [x] تحديث Geography Section: "Across Saudi Arabia's Emerging Sports Ecosystems"
- [x] تحديث How It Works: 5 خطوات متعددة الرياضات
- [x] تحديث Multi-Sport Section: 8 رياضات مع أيقونات وألوان مخصصة
- [x] تحديث Business Benefits: 3 فئات (Athletes, Academies, Federations)
- [x] تحديث Digital ID Section: "Sport Digital ID" بدلاً من "Sport Passport"
- [x] تحديث Pathways Section: مسارات للرياضيين في جميع الرياضات
- [x] تحديث Strategic Alignment Section: رؤية 2030 + القطاع الرياضي
- [x] إضافة Partnerships Section جديد
- [x] إنشاء صفحة Governance مع Sub-Governance و Team Members
- [x] استبدال جميع مراجع "Claude Vision" بـ "AI Vision" في جميع الصفحات
- [x] استبدال "FIFA/SAFF" بـ "Professional Standards" في جميع الصفحات المرئية
- [x] استبدال "Passport" بـ "Digital ID" في جميع الصفحات

## Home & Product Enhancement Sprint (Clipboard 0 & 1)

### Home Page
- [x] Add background video at the start of the landing page hero
- [x] Remove all Arabic text from the English version (pure English)
- [x] Update sports icons list: Football, Basketball, Boxing, Cycling, Swimming, Free Diving, Other Sports
- [x] Replace Problem section icons with creative unique icons per box
- [x] Rewrite "High Cost Barrier" problem card to focus on scouting process
- [x] Update Solution section: match ada2ai logo color scheme
- [x] Replace Demo module card in Solution section with a core platform statement tied to the 6 modules
- [x] How It Works: remove "recording" from step 1, remove "18" from analyzing step
- [x] Multi-Sport section: sync sports list with hero section list
- [x] Multi-Sport section: remove "AI analysis" after "ada2ai's"

### Product Page
- [x] Change "Ada2ai" text in first section to follow logo color scheme (teal gradient)
- [x] Switch order: Sport ID first, then AI Analysis Engine
- [x] Unify all "Passport" references to "Digital ID" on Product page
- [x] AI Analysis Engine: remove "8" from "8 seconds", remove "18" from "performance metrics"
- [x] AI Analysis Engine: revise icon in the right section box
- [x] Change "25-field FIFA/SAFF standardized report" to "Sport-related governance standards"
- [x] Add Pilot Phase box/circle near Standardized Report: "Pilot phase Football — 25-field FIFA/SAFF standardized report — 10 Sport DNA position prediction"
- [x] Scouts Dashboard: remove "18" from metrics, remove "from Riyadh to Abha"
- [x] Compare Engine: remove "18" from metric reference
- [x] Academies Directory: rename to "Sports Institutes", add "sports clubs, academies, and gyms" in text
- [x] Demo section: replace demo module card with core platform statement matching home page
- [x] Technology section: change "FIFA SAFF standards" to "International federations related Standards"

## Full Site Redesign Sprint (Bilingual + Imagery + Sport Logos)

### Assets & Setup
- [ ] Generate custom sport logos/icons for 6 sports (Football, Basketball, Boxing, Swimming, Free Diving, Other Sports)
- [ ] Search and download professional sports imagery
- [ ] Search and download sports background video for Hero

### Language System
- [ ] Create LanguageContext.tsx (AR/EN toggle with localStorage persistence)
- [ ] Create translations/en.ts with all English strings
- [ ] Create translations/ar.ts with all Arabic strings
- [ ] Add language toggle button to Ada2aiNavbar (AR / EN)

### Page Redesigns
- [ ] Home page: full bilingual redesign with video hero + sport logos + professional imagery
- [ ] Product page: bilingual module cards with visual imagery
- [ ] Scouts Dashboard: bilingual player cards and filters
- [ ] Upload/AI Analysis page: bilingual upload flow
- [ ] SportID page: bilingual digital ID card
- [ ] Compare page: bilingual comparison UI
- [ ] Academies/Partnerships page: bilingual directory with imagery
- [ ] Training Hub page: bilingual training platform preview
- [ ] Governance pages: bilingual content
- [ ] Navbar: language toggle + all routes updated

## Training Hub Full App Integration Sprint

- [ ] Create client/src/training-hub/ directory with all sub-components
- [ ] Create Sidebar component for Training Hub
- [ ] Create Dashboard page for Training Hub
- [ ] Create AIChat page for Training Hub
- [ ] Create Players page for Training Hub
- [ ] Create Training page for Training Hub
- [ ] Create Progress page for Training Hub
- [ ] Create Matches page for Training Hub
- [ ] Create CoachDashboard page for Training Hub
- [ ] Create Settings page for Training Hub
- [ ] Rewrite TrainingHub.tsx as self-contained app with internal routing
- [ ] Restore original Home page structure (all sections + Navbar)
- [ ] Save checkpoint

## CoachDashboard Feature Expansion (Mar 18, 2026)
- [ ] Custom opponent team input form (name, formation, strengths, weaknesses)
- [ ] Save/load formations to DB via tRPC
- [ ] Real player assignment from /data/players.ts to pitch positions
- [ ] Video analysis upload panel with API integration (POST /api/v1/football/analyze-football)
- [ ] Possession bars display from analysis results
- [ ] Voronoi field visualization from analysis results
- [ ] JSON results display panel

## Suggested Improvements Sprint (Mar 24, 2026)
- [x] Find and integrate a real Saudi athlete image for the Products page hero card
- [x] Add waitlist signup form to bottom of Products page with DB storage
- [x] Create individual module detail pages for all 6 modules
- [x] Register module routes in App.tsx
- [x] Update module cards to link to their detail pages
- [x] Add #اطلق_قدراتك_الخارقة initiative section after Hero in Home.tsx

## Real Claude Vision Analysis Integration (Mar 26, 2026)
- [x] Install @anthropic-ai/sdk and add ANTHROPIC_API_KEY secret
- [x] Rewrite scoutAnalysis.ts to use Anthropic SDK directly (claude-opus-4-5)
- [x] Add detectedSport, secondPosition, benchmarkNote fields to AIScoutReport type
- [x] Add uploadedImageUrl state to track S3 URL of uploaded image
- [x] Add FIFA SportID card (FifaCard component) in Upload results after Claude AI report
- [x] Card auto-maps Claude scores to FIFA card stats (speed, passing, shooting, defense, skill, strength)
- [x] Card level auto-assigned based on overallRating (Platinum/Gold/Silver/Bronze)
- [x] SportID code auto-generated: SA-{birthYear}-{initials}-{rating}
- [x] Player avatar uses uploaded image URL from S3

## Upload Page & Card Redesign Sprint (Mar 26, 2026)
- [x] Remove player data form from /upload — make upload direct (no name/age/position/city fields)
- [x] Update scoutAnalysis.ts with exact SAFF+FIFA prompt (9 sections, Arabic output)
- [x] Update AIScoutReport type to match new 9-section report structure
- [x] Remove all "وضع المحاكاة" disclaimers from results page
- [x] Remove simulated analysis section — show only real Claude AI report
- [x] Redesign FifaCard to match gold hexagonal Ada2ai card (hexagon shape, gold border, glow, Ada2ai logo, QR code)
- [x] Add QR code to FifaCard using qrcode.react or similar
- [x] Parse Claude Arabic text report into structured scores for card stats
