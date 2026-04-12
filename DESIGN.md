# Ada2AI - Design System Documentation
# DESIGN.md - Multi-Agent Sports Intelligence Platform

## 🎨 Visual Theme & Atmosphere

**Mood:** Professional, Athletic, High-Tech, Data-Driven
**Density:** Medium-High (Information-rich dashboard)
**Design Philosophy:** "Empowering Athletic Performance Through AI"

---

## 🌈 Color Palette & Roles

### Primary Colors

| Name | Hex | OKLCH | Role |
|------|-----|-------|------|
| **Primary Teal** | `#00DCC8` | oklch(0.80 0.15 180) | Movement & Pulse - CTAs, highlights |
| **Deep Ocean** | `#007ABA` | oklch(0.52 0.14 230) | Stability - Headers, primary actions |
| **Navy Abyss** | `#000A0F` | oklch(0.05 0.01 240) | Background - Main BG, surfaces |
| **Pure Tech** | `#EEEFEE` | oklch(0.95 0.002 100) | High Contrast - Text, icons |

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

---

## 📝 Typography Rules

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
/* Arabic text should use Cairo */
.arabic {
  font-family: 'Cairo', 'Noto Sans Arabic', sans-serif;
  direction: rtl;
  text-align: right;
}

/* Mixed content */
.mixed-content {
  font-family: 'Cairo', 'Orbitron', sans-serif;
  unicode-bidi: plaintext;
}
```

---

## 🧩 Component Styling

### Buttons

#### Primary Button
```css
.btn-primary {
  background: linear-gradient(135deg, #007ABA, #00DCC8);
  color: #EEEFEE;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 16px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 122, 186, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 122, 186, 0.4);
}
```

#### Secondary Button
```css
.btn-secondary {
  background: transparent;
  border: 1px solid #00DCC8;
  color: #00DCC8;
  padding: 12px 24px;
  border-radius: 12px;
}

.btn-secondary:hover {
  background: rgba(0, 220, 200, 0.1);
}
```

### Cards

```css
.card {
  background: rgba(10, 14, 26, 0.8);
  border: 1px solid rgba(0, 220, 200, 0.2);
  border-radius: 16px;
  padding: 24px;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.card:hover {
  border-color: rgba(0, 220, 200, 0.4);
  box-shadow: 0 8px 24px rgba(0, 220, 200, 0.1);
}
```

### Inputs

```css
.input {
  background: rgba(0, 10, 15, 0.6);
  border: 1px solid rgba(0, 220, 200, 0.3);
  border-radius: 12px;
  padding: 12px 16px;
  color: #EEEFEE;
  font-size: 16px;
  transition: all 0.2s ease;
}

.input:focus {
  outline: none;
  border-color: #00DCC8;
  box-shadow: 0 0 0 3px rgba(0, 220, 200, 0.2);
}
```

---

## 📐 Layout Principles

### Spacing Scale

| Size | Value | Usage |
|------|-------|-------|
| **xs** | 4px | Tight spacing, inline elements |
| **sm** | 8px | Compact spacing |
| **md** | 16px | Default spacing |
| **lg** | 24px | Section spacing |
| **xl** | 32px | Large gaps |
| **2xl** | 48px | Major section breaks |
| **3xl** | 64px | Page sections |

### Grid System

```css
.container {
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 24px;
}

.grid-dashboard {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
}

/* Sidebar Layout */
.layout-with-sidebar {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 24px;
}
```

### Whitespace Philosophy

- **Generous margins** around major sections (48-64px)
- **Consistent padding** within components (24px)
- **Breathing room** for data-heavy dashboards
- **RTL-friendly** spacing (logical properties)

---

## 🎭 Depth & Elevation

### Shadow System

```css
/* Elevation levels */
.elevation-1 { box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); }
.elevation-2 { box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); }
.elevation-3 { box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2); }
.elevation-4 { box-shadow: 0 16px 48px rgba(0, 0, 0, 0.25); }

/* Glowing accents */
.glow-teal { box-shadow: 0 0 20px rgba(0, 220, 200, 0.3); }
.glow-ocean { box-shadow: 0 0 20px rgba(0, 122, 186, 0.3); }
```

### Surface Hierarchy

1. **Base**: `#000A0F` - Main background
2. **Surface**: `#0A0E1A` - Cards, panels
3. **Elevated**: `#111827` - Modals, dropdowns
4. **Overlay**: `rgba(0, 10, 15, 0.95)` - Backdrops

---

## ✅ Do's and Don'ts

### Do's ✅

- ✅ Use consistent RTL support for Arabic
- ✅ Maintain high contrast (4.5:1 minimum)
- ✅ Use gradients sparingly for emphasis
- ✅ Provide hover states for all interactive elements
- ✅ Use loading skeletons for data-heavy components
- ✅ Implement smooth transitions (200-300ms)

### Don'ts ❌

- ❌ Don't use pure black backgrounds (use Navy Abyss)
- ❌ Don't mix too many colors in one view
- ❌ Don't use low contrast text
- ❌ Don't forget mobile responsiveness
- ❌ Don't use jarring animations
- ❌ Don't ignore RTL layout for Arabic

---

## 📱 Responsive Behavior

### Breakpoints

| Breakpoint | Width | Target |
|------------|-------|--------|
| **Mobile** | < 640px | Phones |
| **Tablet** | 640px - 1024px | Tablets |
| **Desktop** | > 1024px | Laptops/Desktops |
| **Wide** | > 1440px | Large screens |

### Mobile Adaptations

```css
/* Stack layout on mobile */
@media (max-width: 640px) {
  .layout-with-sidebar {
    grid-template-columns: 1fr;
  }
  
  .grid-dashboard {
    grid-template-columns: 1fr;
  }
  
  h1 { font-size: 28px; }
  h2 { font-size: 20px; }
}
```

### Touch Targets

- Minimum touch target: **44x44px**
- Spacing between targets: **8px minimum**

---

## 🤖 Agent Prompt Guide

### Quick Color Reference

```markdown
Use these colors:
- Background: #000A0F
- Primary CTA: #00DCC8
- Secondary: #007ABA
- Text: #EEEFEE
- Borders: rgba(0, 220, 200, 0.3)
```

### Ready-to-Use Prompts

#### For New Page
```markdown
Create a new page for Ada2AI with:
- Dark background (#000A0F)
- Teal gradient CTAs (#007ABA → #00DCC8)
- Cairo font for Arabic text
- Orbitron for headlines and numbers
- Card-based layout with glassmorphism
- RTL support
- Following the design system above
```

#### For Dashboard Component
```markdown
Build a dashboard card for Ada2AI:
- Dark glassmorphic card (rgba(10, 14, 26, 0.8))
- Teal border accent
- Large metric number in Orbitron
- Arabic label in Cairo
- Hover glow effect
- Responsive grid layout
```

#### For Form
```markdown
Create a form following Ada2AI design:
- Dark input fields (#000A0F with teal border)
- Cairo font for labels
- Primary button with gradient
- RTL layout
- Validation states with color feedback
```

---

## 📚 Implementation Notes

### Tailwind Config

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'navy-abyss': '#000A0F',
        'ocean': '#007ABA',
        'teal': '#00DCC8',
        'tech-white': '#EEEFEE',
      },
      fontFamily: {
        'display': ['Orbitron', 'sans-serif'],
        'body': ['Cairo', 'sans-serif'],
      },
    },
  },
}
```

### CSS Variables

```css
:root {
  --color-background: #000A0F;
  --color-primary: #00DCC8;
  --color-secondary: #007ABA;
  --color-text: #EEEFEE;
  --font-display: 'Orbitron', sans-serif;
  --font-body: 'Cairo', sans-serif;
}
```

---

## 🔗 Resources

- **Fonts**: [Google Fonts - Orbitron](https://fonts.google.com/specimen/Orbitron), [Cairo](https://fonts.google.com/specimen/Cairo)
- **Icons**: [Lucide Icons](https://lucide.dev/)
- **Animations**: [Tailwind Animate](https://github.com/jamiebuilds/tailwindcss-animate)

---

**Last Updated:** April 5, 2026
**Version:** 1.0
**Project:** Ada2AI - Multi-Agent Sports Intelligence Platform
