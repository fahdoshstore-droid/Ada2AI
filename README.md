# Ada2ai — منصة اكتشاف المواهب الرياضية

> منصة سعودية لاكتشاف وتحليل المواهب الرياضية باستخدام الذكاء الاصطناعي

## البنية التقنية

| المكون | التقنية |
|--------|---------|
| **الواجهة** | React + TypeScript + Vite |
| **الخادم** | Express.js + Node.js |
| **قاعدة البيانات** | Supabase (PostgreSQL + RLS) |
| **الذكاء الاصطناعي** | Anthropic Claude (أساسي) → Ollama محلي (احتياطي) |
| **النشر** | Vercel (برودكشن) + PM2 (محلي) |
| **النماذج المحلية** | gemma3:4b (vision), qwen3:14b (text) |

## الميزات

- **DHEEB Eye** — تحليل بصري ذكي للشاشات التكتيلكية (Coach + FactCheck)
- **Scout Analysis** — تحليل لاعبين وفق معايير SAFF + FIFA مع رفع فيديوهات
- **Eye Vision** — بروتوكول إشارات مرئية (point, highlight, speak)
- **نظام المصادقة** — Supabase Auth + JWT + تسجيل دخول ضيف
- **تقييم رياضي آمن** — محرك calc آمن (Shunting Yard) بدون eval

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
```

## متغيرات البيئة

| المتغير | مطلوب | الوصف |
|---------|-------|-------|
| `SUPABASE_URL` | ✅ | رابط مشروع Supabase |
| `SUPABASE_ANON_KEY` | ✅ | مفتاح Supabase العام |
| `ANTHROPIC_API_KEY` | ❌ | مفتاح Anthropic (بدونه يستخدم Ollama محلي) |
| `OLLAMA_BASE_URL` | ❌ | رابط Ollama (افتراضي: localhost:11434) |
| `OLLAMA_VISION_MODEL` | ❌ | نموذج Vision (افتراضي: gemma3:4b) |
| `OLLAMA_TEXT_MODEL` | ❌ | نموذج النص (افتراضي: qwen3:14b) |
| `PORT` | ❌ | بورت الخادم (افتراضي: 3000) |

> **ملاحظة:** لا تحتاج ANTHROPIC_API_KEY — النظام يشتغل بنماذج Ollama المحلية تلقائياً.

## الذكاء الاصطناعي (AI Provider)

النظام يستخدم `server/_core/ai-provider.ts` كواجهة موحدة:

```
analyzeVision()        → رفع صورة + سؤال → JSON (Claude Sonnet → Ollama gemma3:4b)
analyzeText()          → سؤال نصي → JSON (Claude Sonnet → Ollama qwen3:14b)
analyzeVisionPremium() → تحليل متقدم (Claude Opus → Ollama gemma3:4b)
getProviderStatus()    → حالة المزود الحالي
```

**آلية العمل:**
1. إذا `ANTHROPIC_API_KEY` موجود → يستخدم Claude
2. إذا فشل Claude أو المفتاح غير موجود → ينتقل لـ Ollama محلي تلقائياً
3. لا إعداد إضافي مطلوب — Ollama يعمل على البورت 11434

## قاعدة البيانات (Supabase)

### الجداول

| الجدول | الأعمدة الرئيسية | الصفوف |
|--------|-----------------|--------|
| `users` | id, open_id, email, full_name, role, sport, is_active | 7 |
| `profiles` | id, email, full_name, role, user_type, phone, avatar_url | 7 |
| `waitlist` | id, name, email, role, sport, message | 0 |

### Migration

- `001_unified_schema.sql` — إنشاء الجداول الأساسية
- `002_alter_existing_schema.sql` — إضافة أعمدة + RLS + نقل البيانات

```bash
# تطبيق migration عبر Supabase CLI
supabase db push --linked
```

## النشر

### Vercel (برودكشن)
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

## الاختبارات

```bash
npx vitest run          # 63 اختبار
npx tsc --noEmit        # 0 أخطاء TypeScript
```

## API Endpoints

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

## الأمان

- Supabase RLS مفعّل على جميع الجداول
- مدخلات مصفّاة (Zod validation)
- `safeMathEval` — محرك حساب آمن بدون `eval()`
- كلمات مرور مشفّرة (bcrypt)
- متغيرات حساسة في `.env` فقط

## الترخيص

خاص — جميع الحقوق محفوظة © 2026