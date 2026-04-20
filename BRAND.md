# Ada2AI Brand Identity System

> منصة سعودية لاكتشاف وتحليل المواهب الرياضية باستخدام الذكاء الاصطناعي
> **Source:** DESIGN.md — Multi-Agent Sports Intelligence Platform

## Logo Prompt (AI Image Generation)

```
Modern sports scouting platform logo for "Ada2AI" — Arabic sports talent discovery platform.

Design Requirements:
- Primary: Stylized eye combined with Arabic letter "ض" (Dhad) for Ada
- Colors: Teal #00DCC8 + Deep Ocean #007ABA + Navy Abyss #000A0F
- Style: Tech-forward Arabic modern design, clean geometric shapes
- Mood: Professional, Athletic, High-Tech, Data-Driven
- Usage: App icon, dark backgrounds, minimal
- Add text: "Ada2AI" in bold sans-serif, Arabic subtitle "منصة اكتشاف المواهب"
- Flat design, subtle gradients acceptable, scalable vector feel
- NO English-only designs — must honor Arabic typography
```

## Brand Name

- **Name:** Ada2AI
- **Origin:** "Ada" from Arabic查出 (discover) + AI
- **Tagline:** "نبني المواهب بالذكاء الاصطناعي"
- **Alt Taglines:**
  - "اكتشف النجوم قبل الجميع"
  - "حيث تلتقي الموهبة بالتقنية"

## Color System

### Primary Colors

| Name | Hex | OKLCH | Usage |
|------|-----|-------|-------|
| **Primary Teal** | `#00DCC8` | oklch(0.80 0.15 180) | CTAs, highlights, movement |
| **Deep Ocean** | `#007ABA` | oklch(0.52 0.14 230) | Headers, primary actions |
| **Navy Abyss** | `#000A0F` | oklch(0.05 0.01 240) | Main background |
| **Pure Tech** | `#EEEFEE` | oklch(0.95 0.002 100) | Text, icons |

### Secondary Colors

| Name | Hex | Usage |
|------|-----|-------|
| **Success Green** | `#10B981` | Positive metrics, confirmations |
| **Warning Orange** | `#F59E0B` | Alerts, attention needed |
| **Error Red** | `#EF4444` | Errors, critical alerts |
| **Muted Gray** | `#6B7280` | Secondary text, borders |

### Gradients

```css
/* Primary Gradient */
background: linear-gradient(135deg, #007ABA 0%, #00DCC8 100%);

/* Accent Gradient */
background: linear-gradient(135deg, #00DCC8 0%, #FFA500 100%);

/* Dark Gradient */
background: linear-gradient(180deg, #000A0F 0%, #0A0E1A 100%);
```

## Typography

### Font Families

| Usage | Font | Weight | Fallback |
|-------|------|--------|----------|
| **Headlines** | Orbitron | 900 (Black), 700 (Bold) | Inter |
| **Body/UI** | Cairo | 400 (Regular), 600 (SemiBold) | Inter, Arabic |
| **Numbers/Data** | Orbitron | 500 (Medium), 700 (Bold) | JetBrains Mono |

### Type Scale

| Element | Size | Weight | Line Height | Letter Spacing |
|---------|------|--------|-------------|----------------|
| **H1** | 36px (2.25rem) | 900 | 1.2 | -0.02em |
| **H2** | 24px (1.5rem) | 700 | 1.3 | -0.01em |
| **H3** | 20px (1.25rem) | 700 | 1.4 | 0 |
| **H4** | 18px (1.125rem) | 600 | 1.4 | 0 |
| **Body** | 16px (1rem) | 400 | 1.5 | 0 |
| **Small** | 14px (0.875rem) | 400 | 1.5 | 0 |
| **Caption** | 12px (0.75rem) | 400 | 1.4 | 0 |

### Arabic Typography

```css
.arabic {
  font-family: 'Cairo', 'Noto Sans Arabic', sans-serif;
  direction: rtl;
  text-align: right;
}
```

## Logo Variations

### 1. Full Logo (Header)
```
┌─────────────────────────────────┐
│  👁️ ADA2AI                      │
│      منصة اكتشاف المواهب            │
└─────────────────────────────────┘
```

### 2. Icon Only (App Icon, Favicon)
```
┌─────┐
│  ض👁 │
│ADA2AI│
└─────┘
```

### 3. Horizontal (Website Header)
```
👁️ Ada2AI | منصة اكتشاف المواهب الرياضية
```

### 4. Stacked (Mobile Splash)
```
┌─────────┐
│   👁️    │
│  Ada2AI │
│arabic.. │
└─────────┘
```

## Sports Context Elements

- Football field line patterns
- Jersey/sport badge styling
- Motion lines for speed indicators
- Star ratings for player scores
- Podium/medal imagery for rankings
- Performance radar charts

## Brand Voice

### Tone
- Professional + Arabic warmth
- Formal but approachable
- Data-driven confidence
- Arabic-first with English support

### Messaging

| Context | Arabic | English |
|---------|--------|---------|
| Hero | اكتشف موهبتك الرياضية | Discover Your Sports Talent |
| CTA | ابدأ الآن | Get Started |
| Feature | تحليل ذكي | AI-Powered Analysis |
| Trust | ١٠٠٪ دقيق | 100% Accurate |

## Motion Guidelines

| Animation | Duration | Easing | Usage |
|-----------|----------|--------|-------|
| Page transitions | 300ms | ease | Page changes |
| Hover states | 200ms | ease | Interactive elements |
| Loading pulse | 1500ms | ease-in-out | Loading states |
| Success burst | 500ms | spring | Completion |
| Chart reveal | 600ms | stagger | Data visualization |
| Star fill | 400ms | ease-out | Rating animation |

## Grid System

| Breakpoint | Columns | Gutter | Max-width |
|------------|---------|--------|-----------|
| Mobile | 4 | 16px | - |
| Tablet | 8 | 24px | - |
| Desktop | 12 | 24px | 1440px |

## Design Tokens (CSS Variables)

```css
:root {
  /* Brand Colors */
  --color-primary: #00DCC8;
  --color-secondary: #007ABA;
  --color-background: #000A0F;
  --color-text: #EEEFEE;
  
  /* Status Colors */
  --color-success: #10B981;
  --color-warning: #F59E0B;
  --color-danger: #EF4444;
  --color-muted: #6B7280;
  
  /* Gradients */
  --gradient-primary: linear-gradient(135deg, #007ABA 0%, #00DCC8 100%);
  --gradient-accent: linear-gradient(135deg, #00DCC8 0%, #FFA500 100%);
  --gradient-dark: linear-gradient(180deg, #000A0F 0%, #0A0E1A 100%);
  
  /* Typography */
  --font-display: 'Orbitron', sans-serif;
  --font-body: 'Cairo', sans-serif;
  
  /* Spacing */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-2xl: 48px;
  --space-3xl: 64px;
  
  /* Borders */
  --radius-sm: 6px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-full: 9999px;
  
  /* Shadows */
  --shadow-elevation-1: 0 2px 8px rgba(0, 0, 0, 0.1);
  --shadow-elevation-2: 0 4px 12px rgba(0, 0, 0, 0.15);
  --shadow-elevation-3: 0 8px 24px rgba(0, 0, 0, 0.2);
  --glow-teal: 0 0 20px rgba(0, 220, 200, 0.3);
  --glow-ocean: 0 0 20px rgba(0, 122, 186, 0.3);
}
```

## Surface Hierarchy

| Level | Color | Usage |
|-------|-------|-------|
| **Base** | `#000A0F` | Main background |
| **Surface** | `#0A0E1A` | Cards, panels |
| **Elevated** | `#111827` | Modals, dropdowns |
| **Overlay** | `rgba(0, 10, 15, 0.95)` | Backdrops |

## Application Guidelines

### App Icon
- Eye + Dhad on navy background
- Teal icon elements
- Rounded corners (iOS/Android standard)
- Sizes: 1024x1024 (source), all required sizes

### Splash Screen
- Logo centered
- Navy Abyss background (#000A0F)
- Subtle gradient overlay
- No loading indicators

### Empty States
- Illustrated sports scenes
- Arabic + English text
- Clear CTA button

### Loading States
- Pulsing glow on icon
- Progress bar for uploads
- Skeleton screens for lists

### Error States
- Red accent (#EF4444)
- Clear error message in Arabic
- Retry CTA button

### Success States
- Teal burst animation
- Checkmark effect
- Confetti for achievements

## Sport-Specific Elements

### Player Cards
- Radar chart for stats
- Star rating (1-5)
- Position badge
- Club academy logo

### Scout Dashboard
- Performance metrics grid
- Talent pipeline visualization
- Match comparison view

### Video Analysis
- Timeline scrubber
- Frame-by-frame controls
- Heat map overlay option

---

_Last updated: 2026-04-19_
_Source: DESIGN.md (v1.0, April 5, 2026)_
