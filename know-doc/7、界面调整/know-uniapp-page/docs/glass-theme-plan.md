# Glass Theme Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a 6th "Glass" glassmorphism theme to the existing 5-theme system, with dark gradient background, frosted glass surfaces, and purple-violet accent gradient.

**Architecture:** New `html[data-theme="glass"]` CSS variable block + theme-scoped override rules for glass-specific styles (backdrop-filter, rgba backgrounds). The theme-switcher HTML in all 6 pages gets one additional option. No new files needed.

**Tech Stack:** CSS custom properties, backdrop-filter, SVG icons, vanilla JS

---

### Files to Modify

| File | Change |
|------|--------|
| `styles.css` | Add `html[data-theme="glass"]` block (~80 lines) + theme-scoped glass override rules (~60 lines) + `.sw-glass` swatch class |
| `home.html` | Add Glass theme option to theme panel (1 line) |
| `devices.html` | Add Glass theme option to theme panel (1 line) |
| `schedule.html` | Add Glass theme option to theme panel (1 line) |
| `profile.html` | Add Glass theme option to theme panel (1 line) |
| `customer.html` | Add Glass theme option to theme panel (1 line) |
| `login.html` | Add Glass theme option to theme panel (1 line) |

**No new files. No HTML structural changes.**

---

### Task 1: Add Glass theme CSS variables

**Files:** Modify `styles.css`

Add the `html[data-theme="glass"]` block after the existing purple theme block (after line 179).

The block must define all variables that the existing CSS references:

```css
html[data-theme="glass"] {
  /* Background gradient */
  --bg: #0f0c1a;
  --bg-app: #0f0c1a;

  /* Glass surfaces (semi-transparent rgba, no solid colors) */
  --surface: rgba(255,255,255,0.06);
  --surface-soft: rgba(255,255,255,0.03);

  /* White text with opacity tiers */
  --text: rgba(255,255,255,0.95);
  --text-secondary: rgba(255,255,255,0.6);
  --text-tertiary: rgba(255,255,255,0.35);

  /* Borders — subtle white on dark */
  --border: rgba(255,255,255,0.08);
  --border-light: rgba(255,255,255,0.05);

  /* Purple-violet accent */
  --primary: #667eea;
  --primary-rgb: 102, 126, 234;
  --primary-soft: rgba(102,126,234,0.2);
  --primary-mist: rgba(102,126,234,0.08);
  --accent-gradient: linear-gradient(135deg, #667eea, #764ba2);

  /* No shadows — glass uses blur instead */
  --shadow-sm: none;
  --shadow-md: none;
  --shadow-lg: none;
  --shadow-glow: none;

  /* Semantic colors */
  --success: #22b573;
  --warning: #f0a020;
  --danger: #e85a5a;
  --success-soft: rgba(34,181,115,0.15);
  --warning-soft: rgba(240,160,32,0.15);
  --danger-soft: rgba(232,90,90,0.15);
}
```

- [ ] **Step 1.1: Add the `html[data-theme="glass"]` CSS variable block**

Insert after line 179 (`}` of `html[data-theme="purple"]` block), before the blank line before `body {`.

- [ ] **Step 1.2: Add glass swatch CSS rule**

After the existing swatch rules (after line 664), add:
```css
.sw-glass::after { background: linear-gradient(135deg, #667eea, #764ba2); }
```

---

### Task 2: Add glass-specific component override rules

**Files:** Modify `styles.css`

These rules activate only when `html[data-theme="glass"]` is set. They override existing component styles to add `backdrop-filter` and adjust surfaces for the glass effect.

Add after the `html[data-theme="glass"]` variable block (before the `body` rule at line 181).

```css
/* ===== Glass Theme Component Overrides ===== */
html[data-theme="glass"] .card,
html[data-theme="glass"] .stats-card,
html[data-theme="glass"] .wallet-card,
html[data-theme="glass"] .menu-group,
html[data-theme="glass"] .service-banner,
html[data-theme="glass"] .device-card,
html[data-theme="glass"] .schedule-card,
html[data-theme="glass"] .recommend-card,
html[data-theme="glass"] .stat-card,
html[data-theme="glass"] .tool-card,
html[data-theme="glass"] .quick-item {
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255,255,255,0.08);
  box-shadow: none;
}

/* Search bar glass */
html[data-theme="glass"] .search-bar {
  background: rgba(255,255,255,0.06);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255,255,255,0.08);
}

html[data-theme="glass"] .search-bar:focus-within {
  border-color: rgba(102,126,234,0.4);
  background: rgba(102,126,234,0.08);
  box-shadow: 0 0 0 4px rgba(102,126,234,0.12);
}

/* Filter tabs glass */
html[data-theme="glass"] .filter-tab {
  background: rgba(255,255,255,0.06);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255,255,255,0.08);
}

/* Header buttons glass */
html[data-theme="glass"] .header-btn {
  background: rgba(255,255,255,0.06);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.08);
}

html[data-theme="glass"] .header-btn:hover {
  background: rgba(102,126,234,0.2);
}

/* Bottom tab bar glass */
html[data-theme="glass"] .bottom-tab {
  background: rgba(255,255,255,0.08);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border-top: none;
  margin: 0 12px;
  border-radius: 20px;
  margin-bottom: 12px;
}

/* Theme panel glass */
html[data-theme="glass"] .theme-panel {
  background: rgba(15,12,26,0.85);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  border: 1px solid rgba(255,255,255,0.08);
  box-shadow: none;
}

html[data-theme="glass"] .theme-option:hover {
  background: rgba(255,255,255,0.06);
}

/* Tags glass */
html[data-theme="glass"] .tag-neutral {
  background: rgba(255,255,255,0.04);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255,255,255,0.06);
}

/* Profile hero — glass theme specific */
html[data-theme="glass"] .profile-hero {
  background: var(--bg-app);
}

html[data-theme="glass"] .profile-hero .header-btn {
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.1);
}

/* Logout button glass */
html[data-theme="glass"] .logout-btn {
  background: rgba(255,255,255,0.04);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.06);
}

html[data-theme="glass"] .logout-btn:hover {
  background: rgba(232,90,90,0.1);
  border-color: rgba(232,90,90,0.2);
}
```

- [ ] **Step 2.1: Add glass component override rules**

Insert the above block after the `html[data-theme="glass"]` variable block and before the `body` rule.

---

### Task 3: Add background gradient for Glass theme

**Files:** Modify `styles.css`

The `.app` container currently uses `background: var(--bg-app)`. We need the Glass theme to have a gradient background. The simplest approach: add a theme-scoped override.

```css
/* Glass theme background gradient */
html[data-theme="glass"] .app {
  background: linear-gradient(
    135deg,
    #0f0c1a 0%,
    #1e1a3e 40%,
    #2a1a4e 70%,
    #0f0c1a 100%
  );
}
```

- [ ] **Step 3.1: Add gradient background rule**

Insert after the glass component override rules.

---

### Task 4: Add "Glass" theme option to all 6 HTML pages

**Files:** `home.html`, `devices.html`, `schedule.html`, `profile.html`, `customer.html`, `login.html`

Each page has a theme panel with 5 options like:
```html
<div class="theme-option" data-theme="purple" onclick="setTheme('purple')"><span class="swatch sw-purple"></span><span>暗紫</span><span class="check">✓</span></div>
```

Add a 6th option after the purple one in each page:
```html
<div class="theme-option" data-theme="glass" onclick="setTheme('glass')"><span class="swatch sw-glass"></span><span>玻璃</span><span class="check">✓</span></div>
```

- [ ] **Step 4.1: Add Glass option to home.html**
- [ ] **Step 4.2: Add Glass option to devices.html**
- [ ] **Step 4.3: Add Glass option to schedule.html**
- [ ] **Step 4.4: Add Glass option to profile.html**
- [ ] **Step 4.5: Add Glass option to customer.html**
- [ ] **Step 4.6: Add Glass option to login.html**

---

### Task 5: Verify all pages

- [ ] **Step 5.1: Open each HTML page and verify Glass theme loads**
- [ ] **Step 5.2: Verify backdrop-filter glass effect appears on cards**
- [ ] **Step 5.3: Toggle between themes and confirm no regression**
- [ ] **Step 5.4: Verify theme persists across page navigation (localStorage)**

---

### Edge Cases & Notes

1. **backdrop-filter support**: Works in Chrome/Edge 76+, Safari 9+, Firefox 70+. No fallback needed — if unsupported, surfaces appear as semi-transparent tints (the rgba backgrounds still work without blur).

2. **Profile hero section**: The profile page has a hardcoded gradient in `.profile-hero` (`background:linear-gradient(135deg,#5b5bd6 0%,#8980f0 50%,#a7a0f8 100%)`). In Glass theme, this is overridden by `html[data-theme="glass"] .profile-hero { background: var(--bg-app); }` to match the dark theme.

3. **Login page**: The login page has its own layout (no status bar). The theme trigger is inside `.container` with `position:relative`. Add the Glass option to its theme panel the same way.

4. **Icons & Emoji**: Some cards use hardcoded emoji icons — these work fine on glass backgrounds.

5. **Tab bar bottom margin**: The glass tab bar uses `margin-bottom: 12px` — this may need adjustment if the page already has safe-area bottom padding.
