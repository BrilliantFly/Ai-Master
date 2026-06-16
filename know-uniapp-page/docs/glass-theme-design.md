# Glass Theme — Visual Design Spec

> Date: 2026-06-08
> Status: Approved
> App: know-uniapp-page (smart home management)

---

## Overview

Add a 6th theme "Glass" to the existing 5-theme system. The Glass theme features a dark gradient background with frosted glass card surfaces, purple-violet accent gradients, and translucent UI elements — inspired by iOS control center, macOS Big Sur, and VisionOS aesthetics.

All 5 existing themes (纯白 white, 深空 dark, 暖阳 warm, 极光 aurora, 暗紫 purple) remain unchanged.

---

## Design Direction

| Attribute | Value |
|-----------|-------|
| Style | Glassmorphism / Frosted glass |
| Base | Dark gradient background |
| Accent | Purple-violet gradient (#667eea → #764ba2) |
| Surfaces | rgba(255,255,255,0.03-0.08) + backdrop-filter blur |
| Borders | 1px solid rgba(255,255,255,0.05-0.1) |
| Text | White with opacity tiers (0.95 / 0.6 / 0.35) |
| Inspiration | iOS Control Center, macOS Big Sur, Stripe dark mode |

---

## Color Palette

### Background Gradient
```css
background: linear-gradient(
  135deg,
  #0f0c1a 0%,    /* deep dark purple */
  #1e1a3e 40%,   /* mid purple */
  #2a1a4e 70%,   /* lighter purple */
  #0f0c1a 100%   /* back to deep */
);
```

### Accent Gradient
```css
--primary-gradient: linear-gradient(135deg, #667eea, #764ba2);
--primary: #667eea;
--primary-rgb: 102, 126, 234;
```

### Surface Tiers
| Surface | Background | Blur | Border | Usage |
|---------|-----------|------|--------|-------|
| Glass card | rgba(255,255,255,0.06) | blur(20px) | 1px solid rgba(255,255,255,0.08) | Cards, list items |
| Glass subtle | rgba(255,255,255,0.03) | blur(12px) | 1px solid rgba(255,255,255,0.05) | Secondary surfaces |
| Glass strong | rgba(255,255,255,0.08) | blur(24px) | 1px solid rgba(255,255,255,0.1) | Tab bar, nav bar |
| Glass accent | rgba(102,126,234,0.25) | — | 1px solid rgba(102,126,234,0.2) | Accent surfaces |

### Text Tiers
- Primary: `rgba(255,255,255,0.95)` — headings, primary content
- Secondary: `rgba(255,255,255,0.6)` — body text, descriptions
- Tertiary: `rgba(255,255,255,0.35)` — hints, timestamps, metadata

---

## Glass Effect Specification

All glass effects follow the same formula:

```css
.glass-card {
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}
```

Key rules:
- **No solid color backgrounds** — every surface uses rgba + backdrop-filter
- **No box-shadow on glass** — the blur + border combo provides depth
- **Gradient buttons** — primary actions use the accent gradient, not glass
- **Toggle switches** — active state uses accent gradient, inactive uses rgba white border

---

## Component Designs

### Status Bar
- Background: transparent (no bar background)
- Back button / menu button: 30×30px glass button
- Title: white primary text, 16px semibold
- Right icons: 30×30px glass buttons

### Search Bar
```css
background: rgba(255,255,255,0.06);
backdrop-filter: blur(16px);
border: 1px solid rgba(255,255,255,0.08);
border-radius: 12px;
padding: 10px 14px;
```

### Cards (all pages)
- border-radius: 14px
- Glass surface (rgba 0.06 + blur 20px)
- Internal badge/status elements: use glass-subtle or glass-accent

### Device List Items
- Horizontal layout: icon (44×44px gradient bg) + text + toggle switch
- Glass surface between items
- Toggle active: accent gradient background
- Toggle inactive: rgba(255,255,255,0.05) + border

### Quadrant Cards (Schedule Page)
- 2×2 grid layout
- Each quadrant: glass surface with colored accent top border or tag
- Color-coding preserved from existing design but on glass backgrounds

### Tab Bar
```css
background: rgba(255,255,255,0.08);
backdrop-filter: blur(24px);
border: 1px solid rgba(255,255,255,0.1);
border-radius: 20px;
padding: 6px 8px;
```
- Floating above content (not attached to bottom edge)
- Active tab: accent gradient icon + full opacity text
- Inactive tab: white border icon + 0.5 opacity text

### Buttons
- Primary: accent gradient background, no glass effect
- Secondary/ghost: glass surface
- Destructive (logout): glass surface with red-tinted text

### Input Fields (Login)
```css
background: rgba(255,255,255,0.06);
backdrop-filter: blur(16px);
border: 1px solid rgba(255,255,255,0.08);
border-radius: 12px;
```

---

## CSS Variable Mapping

New CSS custom properties for `html[data-theme="glass"]`:

```css
html[data-theme="glass"] {
  --bg: #0f0c1a;
  --bg-app: linear-gradient(135deg, #0f0c1a, #1e1a3e, #2a1a4e, #0f0c1a);
  --surface: rgba(255,255,255,0.06);
  --surface-soft: rgba(255,255,255,0.03);
  --surface-glass: rgba(255,255,255,0.08);
  --text: rgba(255,255,255,0.95);
  --text-secondary: rgba(255,255,255,0.6);
  --text-tertiary: rgba(255,255,255,0.35);
  --border: rgba(255,255,255,0.08);
  --border-light: rgba(255,255,255,0.05);
  --primary: #667eea;
  --primary-rgb: 102, 126, 234;
  --primary-gradient: linear-gradient(135deg, #667eea, #764ba2);
  --primary-soft: rgba(102,126,234,0.25);
  --primary-mist: rgba(102,126,234,0.1);
  --shadow-sm: none;
  --shadow-md: none;
  --shadow-lg: none;
  --blur-card: blur(20px);
  --blur-strong: blur(24px);
  --blur-soft: blur(12px);
}
```

No box-shadows needed — glass depth comes from backdrop-filter + border.

---

## Page Layouts (Glass Theme)

All 6 pages maintain their existing HTML structure. Only CSS variables and class backgrounds change.

### Home Page
- Carousel banner → glass card with pagination dots
- Quick action grid (2×2) → glass cards
- Scene recommendation → glass card with gradient accent strip

### Devices Page
- Device list → glass card per device
- Toggle switches → accent gradient when active

### Schedule Page
- 2×2 quadrant grid → glass cards per quadrant
- Quadrant headers use reduced opacity white text

### Profile Page
- User avatar section → glass card with centered avatar (gradient ring)
- Menu items → glass card group with chevron indicators
- Logout → glass card with red-tinted text

### Customer Page
- Customer list → glass card per customer
- Avatar in each card: gradient circle

### Login Page
- App logo: gradient circle with icon
- Input fields: glass surface
- Login button: accent gradient (solid, no glass)
- Background: uses --bg-app gradient

---

## Theme Switcher Integration

- Theme panel already exists in status bar
- Add `data-theme="glass"` option with:
  - Swatch: gradient preview (small dark gradient square)
  - Label: "Glass" or "玻璃"
- Theme selection persists in localStorage key `know-theme`
- On page load: `document.documentElement.setAttribute('data-theme', savedTheme)`

---

## Implementation Order

1. Add `html[data-theme="glass"]` CSS variable block in `styles.css`
2. Update components that use solid backgrounds to use glass variables
3. Add glass-specific styles for tab bar, search bar, buttons
4. Update theme switcher HTML in all 6 pages to include "Glass" option
5. Test all pages with Glass theme active
6. Verify no regression on existing 5 themes

---

## Design Decisions

| Decision | Rationale |
|----------|-----------|
| No box-shadows | Glass blur + border provides sufficient depth; shadows would muddy the translucent effect |
| Keep existing themes | Users may prefer clean light themes for daytime use; Glass is an optional "premium" mode |
| Gradient background | Flat dark feels dead; subtle gradient creates depth behind the glass layers |
| Fixed glass surface values | Consistent rgba alpha values across all components for visual cohesion |
| Chrome/Edge only for full effect | backdrop-filter has limited Safari support for some combinations; test on Chromium browsers |
