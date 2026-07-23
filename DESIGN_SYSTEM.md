# Ada2AI — Design System Documentation
# Generated: 2026-06-12
# Source: ~/OKComputer/app (ada2ai.com)

---

## الهوية البصرية

### الألوان الأساسية

| Token | القيمة | الاستخدام |
|---|---|---|
| `teal-prime` | `#00DCC8` | اللون الرئيسي — أزرار، روابط، accents |
| `teal-glow` | `#00F0D0` | تأثيرات التوهج، hover states |
| `teal-dark` | `#009E8A` | Teal داكن |
| `scout-blue` | `#007ABA` | التدرج الثانوي، روابط |
| `scout-light` | `#0095E0` | Scout hover |
| `scout-dark` | `#005F8F` | Scout داكن |
| `navy-dark` / `deep-navy` | `#000A0F` | الخلفية الرئيسية |
| `navy-light` | `#0D1E35` | خلفية البطاقات |
| `ice-white` | `#EEEFEE` | النص الرئيسي |
| `ice-muted` | `#6B7280` | النص الثانوي |
| `gold` | `#D4AF37` | دور coach |
| `gold-light` | `#E5C84B` | Coach hover |

### ألوان الأدوار (Role Colors)

| الدور | اللون |
|---|---|
| `player` | `#00DCC8` (teal) |
| `coach` | `#D4AF37` (gold) |
| `scout` | `#007ABA` (scout-blue) |
| `admin` | `#9B59B6` (purple) |

### ألوان الحالات (Status Colors)

| الحالة | اللون | الخلفية | الحد |
|---|---|---|---|
| queued / في الانتظار | `#F59E0B` | `rgba(245,158,11,0.1)` | `rgba(245,158,11,0.2)` |
| processing / جارٍ التحليل | `#3B82F6` | `rgba(59,130,246,0.1)` | `rgba(59,130,246,0.2)` |
| completed / مكتمل | `#00DCC8` | `rgba(0,220,200,0.1)` | `rgba(0,220,200,0.2)` |
| failed / فشل | `#EF4444` | `rgba(239,68,68,0.1)` | `rgba(239,68,68,0.2)` |
| pending / معلق | `#a0b4cc` | `rgba(160,180,204,0.1)` | `rgba(160,180,204,0.2)` |

### Shadcn/UI HSL Tokens

| Token | القيمة |
|---|---|
| `--background` | `210 50% 5%` (#000A0F range) |
| `--foreground` | `213 50% 97%` (near white) |
| `--card` | `210 45% 8%` |
| `--primary` | `170 100% 38%` (teal) |
| `--muted` | `210 30% 15%` |
| `--border` | `210 30% 18%` |

---

## الخطوط

| الاستخدام | الخط | الأوزان |
|---|---|---|
| **العناوين (display)** | `Orbitron` | 400–900 |
| **النص العربي** | `Cairo` | 300–900 |
| **النص اللاتيني** | `Space Grotesk` | 400–700 |
| **فallback** | `system-ui, sans-serif` | — |

### CSS Classes
- `.font-display` → `Orbitron, system-ui, sans-serif` (letter-spacing: -0.02em)
- `.arabic-text` → `Cairo, system-ui, sans-serif` (RTL)
- `body` → `Cairo, system-ui, sans-serif`

---

## Glass Cards

| الكلاس | الوصف |
|---|---|
| `.glass-card` | `bg rgba(13,31,53,0.6)`, blur 20px, border `rgba(0,220,200,0.15)` |
| `.glass-premium` | `bg rgba(0,10,15,0.8)`, blur 40px + saturate, border `rgba(0,220,200,0.1)` |
| `.op-card` | `bg rgba(13,31,53,0.6)`, blur 20px, border `rgba(0,194,168,0.12)`, radius 16px |
| `.glass-card-hover` | hover → bg أغمق، border أوضح، translateY -4px |
| `.card-depth-hover` | hover → translateY -4px, glow shadow |

---

## الأزرار

| الكلاس | الوصف |
|---|---|
| `.btn-primary` | Gradient teal→scout-blue, dark text, hover glow + translateY |
| `.btn-ghost` | Border teal, text teal, hover bg teal/8% |
| `.btn-ghost-interactive` | أصغر، border أخف، hover glow |
| `.btn-magnetic` | hover scale 1.02, active scale 0.98 |

---

## تأثيرات بصرية

| الكلاس | الوصف |
|---|---|
| `.text-gradient-teal` | Gradient 135deg teal→scout-blue |
| `.text-gradient-hero` | Gradient white→teal→scout-blue |
| `.text-gradient-shimmer` | Animated shimmer gradient |
| `.bg-gradient-radial` | Radial teal glow center |
| `.grain-overlay` | SVG noise texture, opacity 3% |
| `.grid-pattern` | 60px teal grid lines, opacity 3% |
| `.grid-pattern-fine` | 40px teal grid lines, opacity 5% |
| `.glow-teal` | Box shadow teal glow |
| `.border-glow` | Hover gradient border |

---

## الحركات (Animations)

| الاسم | المدة | الوصف |
|---|---|---|
| `float` | 6s ease-in-out | translateY 0→-20px |
| `pulse-slow` | 4s ease-in-out | opacity 0.4→0.8 |
| `shimmer` | 2s linear | background-position animation |
| `fadeInUp` | 0.8s ease-out | opacity 0→1, translateY 30→0 |
| `slideInRight` | 0.8s ease-out | opacity 0→1, translateX 50→0 |
| `pulse-status` | 2s ease-in-out | opacity 1→0.7→1 |
| `shimmer-text` | 3s linear | gradient text animation |
| `count-up` | — | opacity + translateY |

### Easing Functions (CSS Variables)
- `--duration-fast`: 150ms
- `--duration-normal`: 300ms
- `--duration-slow`: 500ms
- `--ease-out-expo`: cubic-bezier(0.16, 1, 0.3, 1)
- `--ease-spring`: cubic-bezier(0.34, 1.56, 0.64, 1)

---

## Shadows

| الكلاس | القيمة |
|---|---|
| `--shadow-xs` | 0 1px 2px rgba(0,0,0,0.3) |
| `--shadow-sm` | 0 2px 4px rgba(0,0,0,0.2), 0 4px 12px rgba(0,0,0,0.15) |
| `--shadow-md` | 0 4px 6px rgba(0,0,0,0.1), 0 25px 50px rgba(0,0,0,0.4) |
| `--shadow-lg` | 0 8px 16px rgba(0,0,0,0.15), 0 32px 64px rgba(0,0,0,0.3) |
| `--shadow-glow` | 0 0 20px rgba(0,220,200,0.15), 0 0 60px rgba(0,220,200,0.05) |

---

## الصفحات والمسارات (20 صفحة)

| المسار | المكوّن | محمية | الأدوار |
|---|---|---|---|
| `/` | LandingPage | ❌ | — |
| `/login` | LoginPage | ❌ | — |
| `/welcome` | WelcomePage | ✅ | — |
| `/sport-id` | SportID | ✅ | — |
| `/scout` | ScoutDashboard | ✅ | scout |
| `/coach` | CoachDashboard | ✅ | coach |
| `/coach/evaluate/:playerId` | EvaluationForm | ✅ | coach |
| `/coach/workspace` | CoachWorkspace | ✅ | coach |
| `/organizations` | OrganizationsDashboard | ✅ | — |
| `/video-analysis` | VideoAnalysis | ✅ | — |
| `/rankings` | Rankings | ✅ | — |
| `/player-analysis` | PlayerAnalysis | ✅ | — |
| `/player/onboarding` | PlayerOnboarding | ✅ | player |
| `/player/dashboard` | PlayerDashboard | ✅ | player |
| `/player/:id` | PlayerProfile | ✅ | — |
| `/player/upload` | PlayerUpload | ✅ | player |
| `/club/rawdha` | RawdhaDashboard | ✅ | — |
| `/admin` | AdminDashboard | ✅ | admin |
| `/privacy` | PrivacyPolicy | ❌ | — |
| `*` | NotFound | ❌ | — |

---

## المكونات المشتركة (13 مكون)

### عامة
| المكون | الوصف |
|---|---|
| `AdaLogo` | شعار ADA2AI SVG مع gradient teal→blue، 3 variants (dark/light/gradient) |
| `Logo` | شعار بديل |
| `Layout` | التخطيط الرئيسي — navbar + dropdown + footer + Outlet |
| `ProtectedRoute` | حماية المسارات بـ auth + role guard |
| `AdminRoute` | حماية مسارات admin |
| `ErrorBoundary` | التقاط الأخطاء |
| `SectionHeader` | عناوين الأقسام |
| `StatusBadge` | شارات الحالة العربية (في الانتظار/جارٍ التحليل/مكتمل/فشل) |

### مدرب (coach/)
| المكون | الوصف |
|---|---|
| `AnalysisResultsView` | عرض نتائج التحليل |
| `NotesEditor` | محرر الملاحظات |
| `PitchView` | عرض التشكيل التفاعلي |
| `StatBar` | أشرطة الإحصائيات |

---

## StatusBadge

```tsx
interface StatusBadgeProps {
  status: StatusKey  // 'queued' | 'processing' | 'completed' | 'failed' | 'pending'
  className?: string
}
```

يستخدم `statusColors` و `statusLabels` من `src/lib/tokens.ts`:
- `queued` → "في الانتظار" (amber)
- `processing` → "جارٍ التحليل" (blue, animated pulse)
- `completed` → "مكتمل" (teal)
- `failed` → "فشل" (red)
- `pending` → "معلق" (muted blue)

---

## AdaLogo

```tsx
interface AdaLogoProps {
  size?: number       // default: 40
  showText?: boolean  // default: true
  className?: string
  variant?: 'dark' | 'light' | 'gradient'
}
```

SVG hexagon path مع gradient `#00DCC8` → `#007ABA`.

---

## CoachWorkspace — التبويبات (3)

1. **التحليلات** (`workspace`) — تحليلات قيد الانتظار + تشكيل الفريق + نتائج مكتملة
2. **تحليل المنافس** (`opponent`) — رفع فيديو منافس
3. **تحليل لاعب** (`player-analysis`) ✨ — رفع فيديو لاعب

---

## ملاحظات مهمة

1. **لا تستخدم** `#00C2A8` — اللون الصحيح `#00DCC8`
2. **لا تستخدم** Barlow, Plus Jakarta, Noto Kufi
3. **لا تستخدم** `#f0f6ff` أو `#0A1628`
4. الخطوط: Orbitron (عناوين) + Cairo (عربي) فقط
5. Surface hierarchy: `#000A0F` (bg) → `#0D1E35` (card) → `rgba(13,31,53,0.6)` (glass)
6. Status عربي فقط في DB: `قيد المعالجة`, `مكتمل`, `فشل`
7. `.arabic-text` = direction rtl, text-align right
8. `font-display` = Orbitron, letter-spacing -0.02em

---

_آخر تحديث: 2026-06-12 — صانع_