# Pocket - Figma Design Specification

## Design Philosophy

**Japanese-Inspired Minimalism**

- **Ma (間)**: Embrace negative space - generous padding and margins
- **Wabi-sabi**: Beauty in simplicity - restrained color palette
- **Shibui**: Subtle, understated elegance - no decorative flourishes

---

## Color System

### Light Mode (Default)

| Token | OKLCH | HEX (approx) | Usage |
|-------|-------|--------------|-------|
| **Background** | `oklch(0.975 0.005 80)` | `#F7F5F2` | Page background (shiro-neri) |
| **Foreground** | `oklch(0.18 0.01 60)` | `#2C2825` | Primary text (sumi) |
| **Card** | `oklch(0.99 0.003 80)` | `#FDFCFB` | Card surfaces (washi) |
| **Secondary** | `oklch(0.94 0.008 75)` | `#EDEBE8` | Subtle backgrounds (usuzumi) |
| **Muted Foreground** | `oklch(0.45 0.01 60)` | `#6B6560` | Secondary text (nezumi) |
| **Accent** | `oklch(0.52 0.12 35)` | `#A85A3B` | Primary accent (bengara/terracotta) |
| **Border** | `oklch(0.90 0.006 80)` | `#E3E0DC` | Dividers and borders |

### Dark Mode

| Token | OKLCH | HEX (approx) | Usage |
|-------|-------|--------------|-------|
| **Background** | `oklch(0.12 0.008 60)` | `#1C1A18` | Page background (yoru) |
| **Foreground** | `oklch(0.92 0.005 80)` | `#EBE8E5` | Primary text (tsuki) |
| **Card** | `oklch(0.16 0.008 60)` | `#282523` | Card surfaces |
| **Secondary** | `oklch(0.22 0.008 60)` | `#3A3633` | Subtle backgrounds |
| **Muted Foreground** | `oklch(0.58 0.008 60)` | `#8F8985` | Secondary text |
| **Accent** | `oklch(0.60 0.12 38)` | `#C06A48` | Primary accent (lighter bengara) |
| **Border** | `oklch(0.26 0.008 60)` | `#454140` | Dividers and borders |

### Chart/Category Colors

| Name | OKLCH | HEX (approx) | Usage |
|------|-------|--------------|-------|
| Bengara | `oklch(0.52 0.12 35)` | `#A85A3B` | Transport markers |
| Asagi | `oklch(0.55 0.06 180)` | `#5A8A8A` | Food markers |
| Kon | `oklch(0.40 0.04 220)` | `#4A5A6A` | Temple markers |
| Kitsune | `oklch(0.65 0.10 85)` | `#B89A5A` | Sightseeing markers |
| Kuchiba | `oklch(0.60 0.08 70)` | `#A08050` | Nature markers |

---

## Typography

### Font Families

| Type | Family | Fallback |
|------|--------|----------|
| **Sans** | Geist | system-ui, sans-serif |
| **Mono** | Geist Mono | monospace |

### Type Scale

| Name | Size | Weight | Letter Spacing | Line Height | Usage |
|------|------|--------|----------------|-------------|-------|
| **Page Title** | 24-30px | 300 (Light) | -0.01em (tight) | 1.2 | Main headings |
| **Section Title** | 18-20px | 400 (Normal) | -0.01em | 1.3 | Day headers |
| **Body** | 13-14px | 400 (Normal) | 0 | 1.5-1.6 | Content text |
| **Label** | 10-11px | 400 (Mono) | 0.15-0.3em | 1.2 | Tags, labels, timestamps |
| **Caption** | 9-10px | 400 (Mono) | 0.1-0.2em | 1.2 | Small labels |

### Typography Rules

- **Headlines**: Use `font-light` (300) with `tracking-tight` (-0.01em)
- **Labels**: Use `font-mono` with `tracking-[0.15em]` to `tracking-[0.3em]`, `uppercase`
- **Body**: Use `leading-relaxed` (1.625) for readability
- **Time displays**: Large numerals (20-24px), light weight, mono spacing

---

## Spacing System

Based on 4px grid with emphasis on generous whitespace.

| Token | Value | Usage |
|-------|-------|-------|
| **xs** | 4px | Icon gaps |
| **sm** | 8px | Tight component padding |
| **md** | 16px | Standard padding |
| **lg** | 24px | Section gaps |
| **xl** | 32px | Large section gaps |
| **2xl** | 48px | Major section divisions |
| **3xl** | 64px | Page-level spacing |
| **4xl** | 80px | Hero spacing |

### Page Margins

- Mobile: 24px horizontal
- Desktop: 24px horizontal, max-width 512px (xl) or 640px (2xl) centered

### Vertical Rhythm

- Page top padding: 80-128px
- Section gaps: 64-80px
- Component gaps: 24-40px
- Element gaps: 8-16px

---

## Border Radius

**Minimal rounding for crisp, clean edges**

| Token | Value | Usage |
|-------|-------|-------|
| **Default** | 2px | Buttons, cards, inputs |
| **None** | 0px | Timeline markers, icons |

---

## Components

### Bottom Navigation Bar

```
Height: 64px + safe-area
Background: card/95 with backdrop-blur
Border: 1px top, border/40 opacity
Shadow: subtle

Items:
- Icon: 20x20px
- Label: 9px mono, tracking 0.1em, uppercase
- Gap: 4px between icon and label
- Active: accent color
- Inactive: muted-foreground, 60% opacity
```

### Floating Action Button (Edit Toggle)

```
Position: fixed, top-24px, right-24px
Padding: 16px horizontal, 10px vertical
Background: card (view mode), accent (edit mode)
Border: 1px, border or accent
Typography: 10px mono, tracking 0.15em, uppercase
Icon: 16x16px
Gap: 8px
```

### Floating Add Button

```
Position: fixed, right-24px, bottom-96px
Padding: 20px horizontal, 12px vertical
Background: accent
Typography: 11px mono, tracking 0.1em, uppercase
Icon: 16x16px
Gap: 8px
Shadow: lg
Transition: scale on hover (1.05), active (0.95)
```

### Day Carousel

```
Layout: flex, justify-between, items-center
Margin bottom: 40px

Navigation arrows:
- Size: 36x36px
- Background: secondary
- Icon: 16x16px
- Hover: foreground color

Day indicator:
- Date: 20px, light weight
- Label: 10px mono, tracking 0.15em, uppercase, muted
- Gap: 4px

Progress dots:
- Size: 6x6px (8x8px active)
- Background: border (inactive), accent (active)
- Gap: 8px
```

### Timeline Item

```
Layout: flex, gap-32px
Padding bottom: 40px

Time column:
- Width: 48px
- Numerals: 20px mono, light weight
- Period: 9px mono, tracking 0.15em, muted

Content column:
- Title: 15px, normal weight
- Location: 13px, muted, with MapPin icon (12px)
- Tags: flex, gap-6px, margin-top-8px
- Notes: 13px, muted, left border accent/40

Icon:
- Size: 36x36px square (no radius)
- Background: secondary (inactive), accent (active)
- Icon: 16x16px
```

### Tag/Badge

```
Padding: 4px horizontal, 2px vertical
Background: secondary
Typography: 9px mono, tracking 0.1em, uppercase
Color: muted-foreground
```

### Trip Card (Homepage)

```
Padding: 16px
Background: card
Border: 1px, border/50
Hover: border accent/30

Layout:
- Title: 15px, normal weight
- Dates: 12px, muted
- Destination: 11px mono, uppercase, muted
- Status badge: see Tag component
```

### Map View Controls

```
Floating elements:
- Z-index: 1000
- Background: card/95 with backdrop-blur
- Border: 1px, border/60
- Shadow: sm

Back button:
- Position: top-16px, left-16px
- Icon: ChevronLeft 16px
- Label: 10px mono

Day filter:
- Position: top-16px, centered
- Padding: 4px
- Buttons: 12px horizontal, 6px vertical
- Active: accent background

Legend:
- Position: bottom-24px, left-16px
- Items: vertical stack, gap-6px
- Icon: 20x20px square with type color
- Label: 9px mono, uppercase
```

---

## Icons

Using Lucide React icon set.

| Icon | Usage |
|------|-------|
| `CalendarDays` | Plan tab |
| `Receipt` | Expense tab |
| `Briefcase` | Package/Luggage tab |
| `ShoppingCart` | Cart/Wishlist tab |
| `ChevronLeft/Right` | Navigation |
| `Pencil` | Edit mode |
| `Eye` | View mode |
| `Plus` | Add item |
| `Map` | Map view |
| `MapPin` | Location |
| `Train` | Transport activity |
| `Utensils` | Food activity |
| `Camera` | Sightseeing activity |
| `Building2` | Temple/Building activity |
| `TreePine` | Nature activity |
| `Check` | Completed/Purchased |

---

## Animation & Transitions

| Property | Duration | Easing |
|----------|----------|--------|
| **Color/opacity** | 300ms | ease-out |
| **Transform** | 300-500ms | ease-out |
| **Page transitions** | 500ms | ease-out |

### Micro-interactions

- Hover opacity: 0.6 -> 0.9 -> 1.0
- Button scale: hover 1.05, active 0.95
- Slide up: translateY(16px) -> translateY(0)
- Fade: opacity 0 -> 1

---

## Layout Patterns

### Mobile-First Responsive

```
Base: 100% width, 24px padding
sm (640px): max-width 512px centered
md (768px): no change
lg (1024px): max-width 640px centered
```

### Page Structure

```
<main>
  <header> — Page title, subtitle
  <section> — Stats/Overview
  <section> — Day carousel
  <section> — Content (timeline/list)
</main>
<nav> — Bottom navigation (fixed)
<aside> — Floating controls (fixed)
```

---

## Figma Setup Recommendations

### Color Styles

Create color styles with semantic names:
- `background/default`, `background/card`
- `text/primary`, `text/secondary`, `text/muted`
- `accent/default`, `accent/foreground`
- `border/default`, `border/subtle`

### Text Styles

- `heading/page` (24px, light, tight)
- `heading/section` (18px, normal, tight)
- `body/default` (14px, normal)
- `body/small` (13px, normal)
- `label/default` (10px, mono, wide)
- `label/small` (9px, mono, wide)

### Component Variants

Create components with variants for:
- **State**: default, hover, active, disabled
- **Mode**: light, dark
- **Size**: sm, md, lg (where applicable)

### Auto Layout

Use auto layout with:
- 8px base spacing
- Consistent padding (16px, 24px)
- Hug contents for buttons/tags
- Fill container for cards/sections
