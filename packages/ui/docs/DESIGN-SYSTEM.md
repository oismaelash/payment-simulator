# 🎨 Design System — Payment Simulator Landing Page

This document describes the design system used in the **Payment Simulator** landing page, an open-source tool for developers.

---

## Table of Contents

- [Design Philosophy](#design-philosophy)
- [Color Palette](#color-palette)
- [Typography](#typography)
- [Spacing and Layout](#spacing-and-layout)
- [Components](#components)
  - [Buttons](#buttons)
  - [Cards](#cards)
  - [Code block / terminal](#code-block--terminal)
  - [Badges](#badges)
  - [Navbar](#navbar)
- [Visual Effects](#visual-effects)
- [Animations](#animations)
- [Utility Classes](#utility-classes)
- [Inspiration References](#inspiration-references)
- [Consistency Checklist](#consistency-checklist)
- [Implementation Notes](#implementation-notes)

---

## Design Philosophy

| Principle | Description |
| --- | --- |
| **Dark Mode First** | Dark interface as default, reducing visual fatigue |
| **Developer-Centric** | Aesthetic of development tools (terminals, CLI) |
| **Technical Minimalism** | No generic illustrations, focus on diagrams and code |
| **Clarity** | Clear visual hierarchy, no noise |
| **Consistency** | Reusable components with defined patterns |

---

## Color Palette

### Primary Colors

| Token | HSL | Usage |
| --- | --- | --- |
| `--background` | `222 47% 6%` | Main page background |
| `--foreground` | `210 40% 98%` | Main text |
| `--primary` | `172 66% 50%` | Accent color (teal/cyan) |
| `--primary-foreground` | `222 47% 6%` | Text on primary elements |

### Secondary Colors

| Token | HSL | Usage |
| --- | --- | --- |
| `--secondary` | `217 33% 12%` | Secondary elements, cards |
| `--secondary-foreground` | `210 40% 98%` | Text on secondary |
| `--muted` | `217 33% 15%` | Subtle backgrounds |
| `--muted-foreground` | `215 20% 55%` | Less important text |

### Interface Colors

| Token | HSL | Usage |
| --- | --- | --- |
| `--border` | `217 33% 18%` | Card borders and separators |
| `--ring` | `172 66% 50%` | Focus and interaction states |
| `--accent` | `217 33% 15%` | Subtle highlights |
| `--accent-foreground` | `210 40% 98%` | Text on accent |

### Semantic Colors

| Token | HSL | Usage |
| --- | --- | --- |
| `--destructive` | `0 63% 31%` | Destructive actions, errors |
| `--success` | `142 76% 36%` | Success, confirmations |
| `--warning` | `38 92% 50%` | Warnings |

### Special Colors

| Token | HSL | Usage |
| --- | --- | --- |
| `--code-bg` | `220 27% 10%` | Code block background |
| `--glow` | `172 66% 50%` | Glow effects |

### HEX Equivalents (Quick Reference)

- **Background**: `#0a0f1a`
- **Foreground**: `#f8fafc`
- **Primary (teal)**: `#2dd4bf`
- **Secondary**: `#151c2c`
- **Border**: `#1e293b`
- **Muted text**: `#64748b`
- **Success**: `#22c55e`
- **Warning**: `#f59e0b`
- **Destructive**: `#7f1d1d`

---

## Typography

### Font Families

| Type | Font | Fallback | Usage |
| --- | --- | --- | --- |
| `font-sans` | Inter | system-ui, sans-serif | General text, titles, paragraphs |
| `font-mono` | JetBrains Mono | Consolas, monospace | Code, CLI commands, terminal |

### Typographic Scale

| Class | Size | Weight | Usage |
| --- | --- | --- | --- |
| `text-5xl md:text-7xl` | 3rem / 4.5rem | `font-bold` | Hero headline |
| `text-3xl md:text-4xl` | 1.875rem / 2.25rem | `font-bold` | Section titles |
| `text-xl` | 1.25rem | `font-normal` | Subtitles |
| `text-lg` | 1.125rem | `font-medium` | Card titles |
| `text-base` | 1rem | `font-normal` | Body text |
| `text-sm` | 0.875rem | `font-normal` | Secondary text, labels |
| `text-xs` | 0.75rem | `font-medium` | Badges, tags |

### Line Height

- **Titles**: `leading-tight` (1.25)
- **Body**: `leading-relaxed` (1.625)

---

## Spacing and Layout

### Main Container

```css
.section-container {
  max-width: 72rem; /* max-w-6xl = 1152px */
  margin: 0 auto;
  padding-left: 1rem; /* px-4 */
  padding-right: 1rem;
}

@media (min-width: 640px) {
  .section-container {
    padding-left: 1.5rem; /* sm:px-6 */
    padding-right: 1.5rem;
  }
}

@media (min-width: 1024px) {
  .section-container {
    padding-left: 2rem; /* lg:px-8 */
    padding-right: 2rem;
  }
}
```

### Section Vertical Spacing

| Usage | Class | Mobile | Desktop |
| --- | --- | --- | --- |
| Main section | `py-20 md:py-28` | 5rem | 7rem |
| Secondary section | `py-16 md:py-20` | 4rem | 5rem |

### Default Gap

| Usage | Class | Value |
| --- | --- | --- |
| Between cards | `gap-6` or `gap-8` | 1.5rem / 2rem |
| Between inline elements | `gap-4` | 1rem |
| Between texts | `space-y-4` | 1rem |

### Border Radius

| Token / Class | Value | Usage |
| --- | --- | --- |
| `--radius` | 0.75rem | Cards, buttons, inputs |
| `rounded-xl` | 0.75rem | Main cards |
| `rounded-lg` | 0.5rem | Smaller elements |
| `rounded-full` | 9999px | Badges, avatars |

---

## Components

### Buttons

#### Available Variants

| Variant | Description | Usage |
| --- | --- | --- |
| `default` | Primary background, dark text | Default CTAs |
| `outline` | Border, transparent background | Secondary actions |
| `hero` | Primary with glow effect | Hero main CTA |
| `hero-outline` | Outline with hover glow | Hero secondary CTA |
| `ghost` | No background, subtle hover | Navigation, links |
| `link` | Link style with underline | Inline links |
| `destructive` | Red for dangerous actions | Delete, cancel |

#### Sizes

| Size | Height | Padding | Usage |
| --- | --- | --- | --- |
| `sm` | 2.25rem | `px-3` | Compact buttons |
| `default` | 2.5rem | `px-4 py-2` | General use |
| `lg` | 2.75rem | `px-8` | Main CTAs |
| `icon` | 2.5rem × 2.5rem | — | Icon buttons |

#### Examples

```tsx
// Main CTA
<Button variant="hero" size="lg">
  Run locally in minutes
</Button>

// Secondary CTA
<Button variant="hero-outline" size="lg">
  View on GitHub
</Button>
```

### Cards

#### Feature card (CSS)

```css
.feature-card {
  background: hsl(var(--secondary));
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius);
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.feature-card:hover {
  border-color: hsl(var(--primary) / 0.3);
  transform: translateY(-2px);
}
```

#### Structure (JSX)

```tsx
<div className="bg-secondary border border-border rounded-xl p-6 hover:border-primary/30 transition-all">
  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
    <Icon className="w-6 h-6 text-primary" />
  </div>
  <h3 className="text-lg font-semibold mb-2">Title</h3>
  <p className="text-muted-foreground text-sm">Description</p>
</div>
```

### Code block / terminal

#### Code block (CSS)

```css
.code-block {
  background: hsl(var(--code-bg));
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius);
  padding: 1rem;
  font-family: "JetBrains Mono", monospace;
  font-size: 0.875rem;
  overflow-x: auto;
}
```

#### Terminal preview (JSX)

```tsx
<div className="bg-code-bg border border-border rounded-xl overflow-hidden">
  {/* Terminal bar */}
  <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
    <div className="w-3 h-3 rounded-full bg-red-500" />
    <div className="w-3 h-3 rounded-full bg-yellow-500" />
    <div className="w-3 h-3 rounded-full bg-green-500" />
    <span className="ml-2 text-xs text-muted-foreground">terminal</span>
  </div>

  {/* Content */}
  <div className="p-4 font-mono text-sm">
    <span className="text-muted-foreground">$</span>
    <span className="text-primary ml-2">npx payment-simulator start</span>
  </div>
</div>
```

### Badges

```tsx
// Default badge
<span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
  Open Source
</span>

// Status badge
<span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-success/10 text-success">
  Free
</span>
```

### Navbar

```tsx
<nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
  <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex items-center justify-between h-16">
      {/* Logo */}
      {/* Links */}
      {/* CTA */}
    </div>
  </div>
</nav>
```

---

## Visual Effects

### Glow (shine)

```css
/* Default glow */
.glow {
  box-shadow:
    0 0 20px hsl(var(--glow) / 0.3),
    0 0 40px hsl(var(--glow) / 0.2),
    0 0 60px hsl(var(--glow) / 0.1);
}

/* Small glow */
.glow-sm {
  box-shadow:
    0 0 10px hsl(var(--glow) / 0.2),
    0 0 20px hsl(var(--glow) / 0.1);
}
```

### Terminal Shadow

```css
.terminal-shadow {
  box-shadow:
    0 25px 50px -12px rgba(0, 0, 0, 0.5),
    0 0 0 1px hsl(var(--border));
}
```

### Gradients

```css
/* Text gradient */
.text-gradient {
  background: linear-gradient(135deg, hsl(var(--primary)), hsl(172 66% 70%));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Hero background gradient */
.hero-gradient {
  background: radial-gradient(
    ellipse 80% 50% at 50% -20%,
    hsl(var(--primary) / 0.15),
    transparent
  );
}
```

### Background Patterns

```css
/* Grid pattern */
.bg-grid-pattern {
  background-image:
    linear-gradient(hsl(var(--border) / 0.3) 1px, transparent 1px),
    linear-gradient(90deg, hsl(var(--border) / 0.3) 1px, transparent 1px);
  background-size: 50px 50px;
}

/* Dot pattern */
.bg-dot-pattern {
  background-image: radial-gradient(hsl(var(--border) / 0.5) 1px, transparent 1px);
  background-size: 20px 20px;
}
```

### Glassmorphism

```css
.glass {
  background: hsl(var(--background) / 0.8);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}
```

---

## Animations

### Defined Keyframes

```css
@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes pulse-glow {
  0%,
  100% {
    box-shadow: 0 0 20px hsl(var(--glow) / 0.3);
  }
  50% {
    box-shadow: 0 0 40px hsl(var(--glow) / 0.5);
  }
}

@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
```

### Animation Classes

| Class | Duration | Usage |
| --- | --- | --- |
| `animate-float` | 3s infinite | Floating elements |
| `animate-pulse-glow` | 2s infinite | Pulsing highlight |
| `animate-slide-up` | 0.5s ease-out | Element entrance |
| `animate-fade-in` | 0.3s ease-out | Smooth fade in |

### Existing Animations (Tailwind)

- `animate-accordion-down` / `animate-accordion-up`
- `animate-scale-in` / `animate-scale-out`
- `animate-slide-in-right` / `animate-slide-out-right`

---

## Utility Classes

### Text

```css
/* Gradient text */
.text-gradient {
  @apply bg-gradient-to-r from-primary to-teal-300 bg-clip-text text-transparent;
}

/* Muted text */
.text-muted {
  @apply text-muted-foreground;
}
```

### Interactivity

```css
/* Hover scale */
.hover-scale {
  @apply transition-transform duration-200 hover:scale-105;
}

/* Link with animated underline */
.story-link {
  @apply relative inline-block;
}

.story-link::after {
  content: "";
  @apply absolute w-full scale-x-0 h-0.5 bottom-0 left-0 bg-primary origin-bottom-right transition-transform duration-300;
}

.story-link:hover::after {
  @apply scale-x-100 origin-bottom-left;
}
```

### Focus States

```css
.focus-ring {
  @apply focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background;
}
```

---

## Inspiration References

| Product | Inspired Element |
| --- | --- |
| Firebase Emulator Suite | Simulator UI, organization |
| Stripe Docs | Technical clarity, code blocks |
| Vercel Dashboard | Dark mode, minimalism |
| Linear | Glow effects, smooth animations |
| Raycast | Developer-first aesthetic |

---

## Consistency Checklist

- Always use **`font-mono`** for code
- Maintain minimum contrast of **4.5:1** for text
- Use **`border-border`** for all borders
- Apply **`transition-all`** on interactive elements
- Use **`rounded-xl`** for cards and **`rounded-lg`** for smaller elements
- Maintain consistent vertical spacing between sections

---

## Implementation Notes

- **Dark Mode**: This design is dark-first; no light mode is implemented.
- **Responsiveness**: Components use `sm`, `md`, `lg` breakpoints.
- **Accessibility**: Use `sr-only` for icon labels.
- **Performance**: Animations use `transform` and `opacity` for better GPU usage.

---

Design System v1.0 — Payment Simulator Landing Page
