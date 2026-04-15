# تقرير تدقيق أمني شامل — Ada2AI
**تاريخ التدقيق:** 15 أبريل 2026  
**النظام الأساسي:** منصة اكتشاف المواهب الرياضية السعودية  
**التقنيات:** Express + tRPC, React, Supabase, Anthropic Claude, Ollama, Vercel + PM2  

---

## ملخص النتائج

| التصنيف | العدد |
|---------|-------|
| حرج | 5 |
| مهم | 7 |
| اقتراح | 5 |

---

## 1. أسرار في Git (Secrets in Git)

### 1.1 ملف .env.backup مُدرج في المستودع — حرج 🔴

يوجد ملف `.env.backup` في جذر المشروع يحتوي على:
```
DATABASE_URL=file:./local.db
JWT_SECRET=***
```
رغم أن القيم تبدو مموهة، إلا أن وجود ملف `.env.backup` في المستودع يشكل خطراً. الملف غير مُدرج في `.gitignore` وتم تتبعه في Git. يجب إزالته من التاريخ فوراً.

### 1.2 ملفات .pem في تاريخ Git — مهم 🟡

تم العثور على ملفات `cacert.pem` في تاريخ Git (من `ai-service/venv/lib/python3.9/site-packages/certifi/cacert.pem`). رغم أنها شهادات CA عامة وليست أسراراً، إلا أنها تبين أن `venv/` كان مُدرجاً سابقاً في Git. `.gitignore` الحالي يغطي هذا الآن عبر `__pycache__/` لكن لا يوجد استبعاد صريح لـ `venv/`.

---

## 2. تسريب مفاتيح VITE_ (Client-Side Exposure)

### 2.1 VITE_APP_ID و VITE_OAUTH_PORTAL_URL في العميل — اقتراح 🟢

الملف `client/src/const.ts` يستخدم `VITE_APP_ID` و `VITE_OAUTH_PORTAL_URL`. هاتان قيمتان غير حساستين (App ID عام وليس سراً)، لكن يجب التأكد من عدم تسريب أي مفتاح API خادمي عبر بادئة VITE_.

### 2.2 VITE_FRONTEND_FORGE_API_KEY في Map.tsx — مهم 🟡

الملف `client/src/components/Map.tsx` (سطر 89) يستخدم `VITE_FRONTEND_FORGE_API_KEY` كـ `API_KEY`. إذا كان هذا المفتاح يمنح صلاحيات غير قراءة عامة (مثل كتابة أو وصول لبيانات حساسة)، فهو مشكلة. يجب التأكد من أن هذا المفتاح محدود الصلاحيات (read-only / maps-proxy فقط).

### 2.3 لا يوجد VITE_ANTHROPIC_API_KEY — جيد ✅

الاختبارات الأمنية في `server/env-security.test.ts` تتحقق من عدم وجود `VITE_ANTHROPIC_API_KEY`. مفتاح Anthropic موجود فقط في الخادم بدون بادئة VITE_ — هذا صحيح.

---

## 3. حقن الأوامر (Command Injection)

### 3.1 execFile/execFileSync في scoutAnalysis.ts — مهم 🟡

الملف `server/scoutAnalysis.ts` يستورد ويستخدم `execFile` و `execFileSync` من `child_process`:

- **execFileAsync** (سطر 142-145): يستخدم لاستدعاء `ffprobe` مع مسار ملف. المسار يمر عبر `sanitizeVideoPath()` الذي يتحقق من الامتداد و `path.resolve()` — **هذا آمن نسبياً**.
- **execFileAsync** (سطر 158-161): يستخدم لاستدعاء `ffmpeg` مع مسارات ملفات مُصححة — **آمن نسبياً**.
- **execFileSync** (سطر 329): يستخدم `which ffmpeg` — **آمن** (أمر ثابت).

**لكن** `sanitizeVideoPath()` لا يمنع مسارات like `../../etc/passwd.mp4`. الدالة تتحقق من الامتداد فقط دون التأكد أن المسار داخل `os.tmpdir()`. يمكن لمهاجم التحكم بـ `mimeType` في الطلب لتغيير الامتداد.

**التوصية:** أضف تحقق أن `resolved` يبدأ بـ `os.tmpdir()`:
```ts
if (!resolved.startsWith(os.tmpdir())) throw new Error("Path outside tmpdir");
```

---

## 4. حقن الكود (Code Injection)

### 4.1 innerHTML في Academies.tsx — مهم 🟡

الملف `client/src/pages/Academies.tsx` (سطر 111) يستخدم `markerEl.innerHTML` لإنشاء عناصر الخريطة:
```js
markerEl.innerHTML = `<div style="background: ${color}; ...">`;
```
المتغير `color` يأتي من مصفوفة ثابتة `["#1db954", "#f59e0b", "#ef4444", "#3b82f6"]` — لذلك **لا يوجد خطر حالي**. لكن الاستخدام المستقبلي قد يمرر بيانات مستخدم.

### 4.2 dangerouslySetInnerHTML في chart.tsx — اقتراح 🟢

الملف `client/src/components/ui/chart.tsx` (سطر 81) يستخدم `dangerouslySetInnerHTML` لحقن أنماط CSS من ثوابت `THEMES`. البيانات ثابتة ولا تأتي من مدخلات مستخدم — **خطر منخفض**.

### 4.3 لا يوجد eval() أو new Function() — جيد ✅

لم يتم العثور على `eval()` أو `new Function()` في أي ملفات العميل. دالة `safeMathEval` في `chat.ts` تستخدم خوارزمية Shunting-yard بدلاً من `eval()` — ممتاز.

---

## 5. حقن SQL (SQL Injection)

### 5.1 ilike مع مدخلات مُدمجة مباشرة في API الخادم — حرج 🔴

في ملفات الخادم (`server/apiPlayers.ts`, `server/apiScouts.ts`, `server/apiAcademies.ts`)، يتم بناء نمط البحث كالتالي:
```ts
const pattern = `%${req.query.search}%`;
query = query.or(`name.ilike.${pattern},name_ar.ilike.${pattern}`);
```
Supabase JS client يمرر هذا كجزء من سلسلة `.or()` بدون تطهير. رغم أن Supabase يستخدم parameterized queries داخلياً للقيم `.eq()`، إلا أن بناء سلسلة `.or()` يدوياً يمكن أن يعرض لـ Postgres pattern injection (استخدام `%` و `_` كـ wildcards) أو ما هو أسوأ إذا تم استغلال صيغة `.or()`.

**مثال هجوم:** إدخال `%; DROP TABLE players;--` لن يسقط الجدول (بسبب Parameterized queries) لكن `%_*` قد يكشف بيانات غير مقصودة.

### 5.2 نفس المشكلة في Vercel Serverless API — حرج 🔴

الملفات `api/academies.ts` و `api/players.ts` و `api/scouts.ts` بها نفس المشكلة:
```ts
query = query.or(`name.ilike.%${search}%,name_ar.ilike.%${search}%`);
```
هنا القيمة `search` تُدمج مباشرة بدون تطهير `%` أو `_` من مدخلات المستخدم.

**التوصية:** استخدم Supabase `textSearch()` أو طبق `sanitizePattern()`:
```ts
const sanitized = search.replace(/[%_]/g, '\\$&');
```

---

## 6. المصادقة على جميع النقاط (Auth on All Endpoints)

### 6.1 نقاط API عامة بدون مصادقة — حرج 🔴

في `server/_core/index.ts`:

| المسار | مصادقة | تقييد سرعة |
|--------|--------|------------|
| `/api/chat` | ✅ requireAuth | ✅ rateLimit |
| `/api/scout/*` | ✅ requireAuth | ✅ rateLimit + validateUploadSize |
| `/api/eye/*` | ✅ requireAuth | ✅ rateLimit |
| `/api/v1/football/*` | ✅ requireAuth | ✅ rateLimit |
| **`/api/players`** | ❌ بدون مصادقة | ✅ rateLimit فقط |
| **`/api/academies`** | ❌ بدون مصادقة | ✅ rateLimit فقط |
| **`/api/scouts`** | ❌ بدون مصادقة | ✅ rateLimit فقط |
| **`/api/oauth/callback`** | ❌ بدون مصادقة | ❌ بدون تقييد |
| **`/api/trpc`** | ❌ بدون middleware | — |

نقاط `/api/players`, `/api/academies`, `/api/scouts` عامة بالكامل. الأهم أن نقطة **POST /api/players** (إنشاء لاعب) و **DELETE /api/players/:id** (حذف لاعب) متاحة بدون مصادقة! هذا يعني أن أي شخص يمكنه إضافة أو حذف لاعبين من قاعدة البيانات.

### 6.2 Vercel Serverless API بدون حماية — حرج 🔴

جميع ملفات `api/` (Vercel edge functions) لا تحتوي على أي middleware مصادقة:
- `api/analyze.ts`: نقطة تحليل رياضي بدون مصادقة + CORS `*`
- `api/players.ts`: إنشاء وحذف لاعبين بدون مصادقة
- `api/academies.ts` و `api/scouts.ts`: قراءة بدون مصادقة

### 6.3 tRPC يستخدم publicProcedure فقط — مهم 🟡

في `server/routers.ts`، جميع الإجراءات تستخدم `publicProcedure` بما فيها:
- `auth.me` و `auth.logout`
- `waitlist.join`
- `voice.transcribe`

رغم أن `protectedProcedure` و `adminProcedure` معرفان في `trpc.ts`، لا يتم استخدامهما.

### 6.4 requireAuth يتجاوز المصادقة في وضع التطوير — مهم 🟡

في `server/_core/auth.ts` (سطر 36-39):
```ts
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn("[Auth] ... skipping auth (dev mode)");
    (req as any).user = { id: "dev-user", email: "dev@localhost" };
    return next();
}
```
إذا لم تُعرّف متغيرات Supabase (بسبب خطأ نشر أو نسيان)، سيتحول الخادم تلقائياً لتخطي المصادقة. يجب إضافة تحقق صارم في الإنتاج.

---

## 7. إعدادات CORS

### 7.1 CORS_ALLOW_ORIGIN = "*" في api/analyze.ts — حرج 🔴

الملف `api/analyze.ts` (سطر 142):
```ts
res.setHeader("Access-Control-Allow-Origin", "*");
```
هذا يسمح لأي موقع ويب باستدعاء نقطة تحليل Athlete مباشرة. بما أن هذه النقطة تستخدم مفتاح Anthropic API (يطالب بالمال)، فتحها عبر CORS `*` يعني أن أي موقع يمكنه استنزاف حصة API الخاصة بك.

### 7.2 لا يوجد CORS middleware في الخادم الأساسي — اقتراح 🟢

خادم Express الرئيسي (`server/_core/index.ts`) لا يحدد CORS headers. هذا يعتمد على Vercel للتعامل مع CORS. يجب إضافة `cors` middleware محصور بالنطاق المناسب.

---

## 8. تقييد السرعة (Rate Limiting)

### 8.1 Rate limiter في الذاكرة فقط — مهم 🟡

التنفيذ في `server/_core/auth.ts` يستخدم `Map` في الذاكرة:
- 20 طلب/دقيقة لكل مستخدم
- تنظيف كل 5 دقائق

**مشاكل:**
- لا يعمل عبر عمليات متعددة أو خوادم PM2 cluster
- يُ_reset عند إعادة تشغيل الخادم
- يستخدم `req.ip` كبديل إذا لم يكن المستخدم مصادق عليه — قد لا يعمل خلف proxy بدون `trust proxy`

### 8.2 no rate limiting على /api/oauth/callback — اقتراح 🟢

نقطة callback OAuth ليس عليها تقييد سرعة. يمكن أن تُستخدم لهجمات brute force أو DoS.

---

## 9. التحقق من رفع الملفات (File Upload Validation)

### 9.1 لا يوجد تحقق من نوع MIME في /api/scout/upload — مهم 🟡

في `server/scoutAnalysis.ts` (سطر 181-213):
- `mimeType` يأتي من `req.body` مباشرة بدون تحقق
- لا يوجد فحص لامتداد الملف الحقيقي مقابل المحتوى
- لا يوجد تحقق من توقيع الملف (magic bytes)
- `express.json({ limit: "50mb" })` يحد الحجم لكن يمكن تجاوزه عبر الطلبات المتعددة

**ملاحظة إيجابية:** الدالة `sanitizeVideoPath()` تتحقق من امتدادات الفيديو المسموحة (`mp4`, `mov`, `webm`, `avi`, `mkv`) — لكن فقط للفيديو. رفع الصور لا يخضع لأي فحص نوع.

### 9.2 لا يوجد أنتيفايروس أو فحص محتوى — اقتراح 🟢

الملفات المرفوعة تُخزن مباشرة عبر storage proxy بدون فحص محتوى ضار. يمكن رفع ملفات ضارة (SVG يحتوي JS، HTML، إلخ).

---

## 10. مقارنة .env و .env.example

### 10.1 مفتاح JWT_SECRET بدون قيمة قوية — مهم 🟡

في `.env`:
```
JWT_SECRET=${JWT_...ion}
```
هذا يبدو كمرجع لمتغير آخر وليس قيمة فعلية. إذا لم يُعرّف `JWT_...ion` كمتغير في بيئة النشر، فستكون قيمة JWT_SECRET هي السلسلة الحرفية `${JWT_...ion}` — ضعيفة جداً.

### 10.2 SUPABASE_ANON_KEY متطابق في client و server — اقتراح 🟢

في `.env`:
```
VITE_SUPABASE_ANON_KEY=sb_publishable_0SW1Q7ENJNjpu-27GJdd5g_-nZRE5nO
SUPABASE_ANON_KEY=sb_publishable_0SW1Q7ENJNjpu-27GJdd5g_-nZRE5nO
```
القيمة تبدو publishable key (العنوان يبدأ بـ `sb_publishable_`) — هذا طبيعي في Supabase. المفتاح الحساس هو `service_role` key الذي لا يظهر في `.env` — جيد.

### 10.3 ANTHROPIC_API_KEY غير حقيقي — اقتراح 🟢

```
ANTHROPIC_API_KEY=*** Manus OAuth
```
القيمة `*** Manus OAuth` ليست مفتاح API حقيقي لـ Anthropic. يبدو أن المشروع يعتمد على Forge API proxy للوصول لـ Claude. يجب التأكد من أن `BUILT_IN_FORGE_API_KEY` و `BUILT_IN_FORGE_API_URL` مُعرّفان في بيئة Vercel.

---

## 11. اكتمال .gitignore

### 11.1 .env.backup غير مُستثنى — مهم 🟡

`.gitignore` يستثني:
```
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
```
لكن **لا يستثني** `.env.backup` أو `.env.*` بشكل عام. الملف `.env.backup` موجود في المستودع ويحتوي على بيانات حساسة محتملة.

### 11.2 venv/ غير مستثنى صراحة — اقتراح 🟢

رغم أن `__pycache__/` و `*.pyc` مستثناة، إلا أن `venv/` كامل غير مستثنى صراحة. تاريخ Git يثبت أنه تم تتبعه سابقاً. أضف:
```
venv/
.env.*
!.env.example
```

### 11.3 .uploads/ غير مستثنى — اقتراح 🟢

المجلد `.uploads/` موجود في المشروع لكن غير مُستثنى في `.gitignore`. إذا رُفعت ملفات محلية، قد تُضاف للـ Git.

---

## 12. scoutAnalysis.ts — هل يستخدم ai-provider؟

### 12.1 scoutAnalysis.ts يستخدم ai-provider.ts بشكل صحيح ✅

الملف `server/scoutAnalysis.ts` يستورد من `./_core/ai-provider`:
```ts
import { analyzeVisionPremium, getProviderStatus } from "./_core/ai-provider";
```
ويستخدم `analyzeVisionPremium()` (سطر 268). لا يوجد استدعاء مباشر لـ Anthropic SDK في هذا الملف — **ممتاز**.

**ملاحظة:** يستخدم `execFile` من `child_process` لـ ffmpeg/ffprobe — هذا لازم للوظيفة وليس مشكلة في نفسها.

---

## 13. eyeVision.ts — هل يستخدم ai-provider؟

### 13.1 server/_core/eyeVision.ts — يستدعي Anthropic SDK مباشرة — حرج 🔴

الملف `server/_core/eyeVision.ts` ينشئ عميل Anthropic خاص به:
```ts
import Anthropic from "@anthropic-ai/sdk";
// ...
let anthropicClient: Anthropic | null = null;
function getAnthropicClient(): Anthropic { ... }
const response = await client.messages.create({ ... });
```
هذا **يتجاوز** `ai-provider.ts` بالكامل! لا يوجد fallback لـ Ollama، ولا إعادة استخدام لعميل AI مركزي.

### 13.2 server/eyeVision.ts (النسخة الجديدة) — تستخدم ai-provider بشكل صحيح ✅

الملف `server/eyeVision.ts` (خارج `_core/`) يستخدم:
```ts
import { analyzeVision, getProviderStatus } from "./_core/ai-provider";
```
هذا صحيح ويتضمن fallback لـ Ollama.

**المشكلة:** الملفان موجودان معاً! `server/_core/eyeVision.ts` (النسخة القديمة التي تستخدم Anthropic مباشرة) و `server/eyeVision.ts` (النسخة الجديدة مع ai-provider). في `server/_core/index.ts` (سطر 9):
```ts
import { registerEyeVisionRoutes } from "./eyeVision";
```
هذا يستورد من `./eyeVision` (أي `server/_core/eyeVision.ts`) — **النسخة القديمة المتجاوزة!**  
بينما `server/eyeVision.ts` (النسخة الصحيحة) **لا يُستخدم من index.ts**.

**التوصية:** احذف `server/_core/eyeVision.ts` أو حدّثه لاستخدام `ai-provider.ts`.

---

## ملخص النتائج الحرجة (Require Immediate Action)

| # | المشكلة | التصنيف |
|---|---------|---------|
| 1 | POST/DELETE `/api/players` بدون مصادقة — يمكن لأي شخص حذف/إضافة لاعبين | حرج |
| 2 | Vercel `api/` endpoints بدون مصادقة أو حماية | حرج |
| 3 | CORS `*` في api/analyze.ts يكشف مفتاح Anthropic API | حرج |
| 4 | `server/_core/eyeVision.ts` يتجاوز ai-provider ويستدعي Anthropic مباشرة | حرج |
| 5 | `.env.backup` في Git بدون استثنائه في .gitignore | حرج |

## ملخص النتائج المهمة (Should Fix Soon)

| # | المشكلة | التصنيف |
|---|---------|---------|
| 1 | Supabase `.or()` مع ilike يدعم pattern injection | مهم |
| 2 | `sanitizeVideoPath()` لا يتحقق من المسار داخل tmpdir | مهم |
| 3 | `requireAuth` يتجاوز المصادقة تلقائياً إذا لم تُعرّف متغيرات Supabase | مهم |
| 4 | Rate limiter في الذاكرة فقط — لا يعمل عبر PM2 cluster | مهم |
| 5 | لا تحقق من MIME type/magic bytes في ملفات الرفع | مهم |
| 6 | JWT_SECRET قد يكون قيمة غير صحيحة | مهم |
| 7 | tRPC يستخدم publicProcedure فقط | مهم |

---

*تم إعداد هذا التقرير بواسطة تدقيق أمني آلي عميق. يُنصح بمراجعة يدوية إضافية قبل الإنتاج.*