# Ada2AI — منصة اكتشاف المواهب الرياضية

> منصة سعودية لاكتشاف وتحليل المواهب الرياضية باستخدام الذكاء الاصطناعي

## الروابط

| البيئة | الرابط |
|--------|-------|
| الإنتاج (Vercel) | https://ada2ai.vercel.app |
| محلي (PM2) | http://localhost:3002 |
| المستودع | github.com/fahdoshstore-droid/Ada2AI |

## حالة المشروع

| المقياس | النتيجة |
|---------|---------|
| صفحات الواجهة | 13 صفحة — كلها 200 ✅ |
| API Routes | 4 مسارات — بيانات حقيقية من Supabase ✅ |
| أخطاء TypeScript | 0 ✅ |
| الاختبارات | 63/63 ✅ |
| البناء | أخضر ✅ |
| النشر | Vercel + PM2 ✅ |

## البنية التقنية

| المكون | التقنية |
|--------|---------|
| الواجهة | React + TypeScript + Vite |
| الخادم المحلي | Express.js + Node.js (PM2 :3002) |
| الخادم السحابي | Vercel Edge Functions |
| قاعدة البيانات | Supabase (PostgreSQL + RLS) |
| الذكاء الاصطناعي | Anthropic Claude (أساسي) → Ollama محلي (احتياطي) |
| النماذج المحلية | gemma3:4b (vision), qwen3:14b (text) |

## المسارات (13 صفحة)

| المسار | الصفحة | مصدر البيانات |
|--------|--------|--------------|
| `/` | الرئيسية | ثابت |
| `/players` | اللاعبون | `/api/players` (Supabase) |
| `/academies` | الأكاديميات | `/api/academies` (Supabase) |
| `/scouts` | الكشافون | `/api/scouts` (Supabase) |
| `/dashboards` | لوحات التحكم | `/api/players` (Supabase) |
| `/compare` | مقارنة اللاعبين | `/api/players` |
| `/upload` | تحليل AI | Eye Vision API |
| `/product` | المنتجات | ثابت + waitlist |
| `/governance` | الحوكمة | ثابت |
| `/sport-id` | الهوية الرياضية | ثابت |
| `/training` | مركز التدريب | ثابت |
| `/demo` | العرض التوضيحي | ثابت |
| `/login` | تسجيل الدخول | Supabase Auth |

## API Routes

### Vercel Edge Functions

| Endpoint | Method | الوصف | البيانات |
|----------|--------|-------|----------|
| `/api/players` | GET | قائمة اللاعبين مع فلاتر | 10 لاعبين |
| `/api/players` | POST | إضافة لاعب | — |
| `/api/players` | DELETE | حذف لاعب (`?id=uuid`) | — |
| `/api/academies` | GET | قائمة الأكاديميات | 10 أكاديميات |
| `/api/scouts` | GET | قائمة الكشافين | 6 كشافين |
| `/api/trpc/*` | GET/POST | tRPC (auth, waitlist, system) | — |

### فلاتر API المدعومة

| الفلتر | المثال | الوصف |
|--------|--------|-------|
| `sport` | `/api/players?sport=Football` | فلتر حسب الرياضة |
| `region` | `/api/academies?region=Riyadh` | فلتر حسب المنطقة |
| `search` | `/api/scouts?search=ناصر` | بحث بالاسم (عربي/إنجليزي) |

### الخادم المحلي (PM2)

| Endpoint | Method | الوصف |
|----------|--------|-------|
| `/api/eye/vision` | POST | تحليل صورة بالذكاء الاصطناعي |
| `/api/eye/health` | GET | حالة مزود الذكاء الاصطناعي |
| `/api/scout/upload` | POST | رفع صورة/فيديو للاعب |
| `/api/scout/analyze` | POST | تحليل لاعب وفق SAFF+FIFA |
| `/api/scout/health` | GET | حالة خدمة Scout |
| `/api/auth/login` | POST | تسجيل دخول |
| `/api/auth/guest` | POST | دخول كضيف |
| `/api/health` | GET | حالة الخادم |
| `/api/players` | GET/POST/DELETE | CRUD للاعبين |
| `/api/academies` | GET | قائمة الأكاديميات |
| `/api/scouts` | GET | قائمة الكشافين |

## قاعدة البيانات (Supabase)

### الجداول (6)

| الجدول | الأعمدة الرئيسية | الصفوف |
|--------|-----------------|--------|
| `users` | id, open_id, email, full_name, role, sport, is_active | 7 |
| `profiles` | id, email, full_name, role, user_type, phone, avatar_url | 7 |
| `waitlist` | id, name, email, role, sport, message | 0 |
| `players` | id, name, name_ar, sport, position, age, region, rating, speed, agility, technique, badge, academy_name | 10 |
| `academies` | id, name, name_ar, sport, region, rating, players_count, founded, description | 10 |
| `scouts` | id, name, name_ar, sport, region, rating, experience, specializations | 6 |

### Migrations

- `001_unified_schema.sql` — إنشاء الجداول الأساسية
- `002_alter_existing_schema.sql` — إضافة أعمدة + RLS + نقل البيانات
- `003_add_players_academies_scouts.sql` — إنشاء جداول اللاعبين والأكاديميات والكشافين

### RLS

جميع الجداول عليها Row Level Security مفعّل.

## الذكاء الاصطناعي (AI Provider)

النظام يستخدم `server/_core/ai-provider.ts` كواجهة موحدة:

```
analyzeVision()        → رفع صورة + سؤال → JSON (Claude Sonnet → Ollama gemma3:4b)
analyzeText()          → سؤال نصي → JSON (Claude Sonnet → Ollama qwen3:14b)
analyzeVisionPremium() → تحليل متقدم (Claude Opus → Ollama gemma3:4b)
getProviderStatus()    → حالة المزود الحالي
```

آلية العمل:
1. إذا `ANTHROPIC_API_KEY` موجود → يستخدم Claude
2. إذا فشل Claude أو المفتاح غير موجود → ينتقل لـ Ollama محلي تلقائياً
3. لا إعداد إضافي مطلوب — Ollama يعمل على البورت 11434

## متغيرات البيئة

| المتغير | مطلوب | الوصف |
|---------|-------|-------|
| `SUPABASE_URL` | ✅ | رابط مشروع Supabase |
| `SUPABASE_ANON_KEY` | ✅ | مفتاح Supabase العام |
| `ANTHROPIC_API_KEY` | ❌ | مفتاح Anthropic (بدونه يستخدم Ollama محلي) |
| `OLLAMA_BASE_URL` | ❌ | رابط Ollama (افتراضي: localhost:11434) |
| `VITE_FRONTEND_FORGE_API_KEY` | ❌ | مفتاح Google Maps عبر proxy |
| `PORT` | ❌ | بورت الخادم (افتراضي: 3000) |

> **ملاحظة Vercel:** المفاتيح بدون `VITE_` prefix تعمل على Serverless Functions فقط. المفاتيح بـ `VITE_` prefix تعمل في المتصفح فقط.

## البدء السريع

```bash
# تثبيت
npm install

# وضع التطوير
npm run dev

# بناء للإنتاج
npm run build

# تشغيل الاختبارات
npx vitest run

# فحص TypeScript
npx tsc --noEmit
```

## النشر

### Vercel (إنتاج)
```bash
npx vercel --prod
```

### PM2 (محلي)
```bash
npm run build
pm2 start dist/index.js --name ada2ai
pm2 save
```

الخادم يعمل على `localhost:3002` مع إعادة تشغيل تلقائية.

### launchd (تشغيل مع الماك)
الملف: `~/Library/LaunchAgents/com.ada2ai.server.plist`

## الأمان

- Supabase RLS مفعّل على جميع الجداول
- مدخلات مصفّاة (Zod validation)
- `safeMathEval` — محرك حساب آمن بدون `eval()`
- كلمات مرور مشفرة (bcrypt)
- متغيرات حساسة في `.env` فقط
- `execFileAsync` + whitelist لمنع حقن الأوامر
- Rate limiter على API routes

## إعدادات Vercel المهمة

1. **vercel.json rewrites:** يجب استثناء `/api/*` من SPA catch-all:
   ```json
   { "source": "/((?!api/).*)", "destination": "/index.html" }
   ```

2. **Env vars:** أضف `SUPABASE_URL` + `SUPABASE_ANON_KEY` بدون `VITE_` prefix

3. **tRPC handler:** `api/trpc/[trpc].ts` — handler مبسط بدون Express dependencies

## الترخيص

خاص — جميع الحقوق محفوظة © 2026
