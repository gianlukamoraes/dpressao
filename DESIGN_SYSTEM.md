# dPressão Design System

## 🎨 Aesthetic Direction: "Azul Ardósia + Verde Saúde"

Fundo azul-ardósia suave, bordas cinza discretas, ação principal em verde saúde. Números ousados, muito espaço, confiável e acolhedor.

---

## Color Palette

### Backgrounds
- **Primary Background:** `#EEF2F7` (Azul Ardósia)
- **Surface (Cards):** `#F8FAFC` (Quase branco)
- **Surface Light:** `#F1F5F9` (Cinza azulado sutil)

### Text Hierarchy
- **Text (Primary):** `#0F172A` (Azul quase-preto)
- **Text Secondary:** `#64748B` (Slate médio)
- **Text Muted:** `#94A3B8` (Slate claro)

### Ações
- **Primary Action:** `#16A34A` (Verde Saúde — CTAs positivos)
- **Danger Action:** `#DC3545` (Vermelho — exclusivamente destrutivo: excluir, cancelar)
- **Border:** `#E2E8F0` (Cinza suave — substituiu preto #000000)

### Medical Status Colors
- **Normal:** `#22C55E` (Bright green)
- **Elevated:** `#FBBF24` (Amber)
- **Hypertension 1:** `#FB923C` (Orange)
- **Hypertension 2:** `#EF4444` (Red)
- **Crisis:** `#A855F7` (Purple)

### Design Tokens
```typescript
primary: '#16A34A'        // Verde Saúde — ações CTA
danger: '#DC3545'         // Vermelho — ações destrutivas
text: '#0F172A'           // Azul quase-preto
textSecondary: '#64748B'  // Slate
textMuted: '#94A3B8'      // Slate claro
border: '#E2E8F0'         // Bordas suaves
background: '#EEF2F7'     // Azul Ardósia
surface: '#F8FAFC'        // Cards
```

---

## Typography

### Font Strategy
- **Display/Titles:** Bold sans-serif (fontWeight: 900)
  - Greeting: 32px, weight 900
  - Section titles: 24px, weight 900
  - Large numbers: 48-64px, weight 900

- **Data/Numbers:** Monospace-style (weight 900)
  - Latest BP value: 64px, weight 900
  - Card BP values: 48px, weight 900
  - Statistics: 32px, weight 900

- **Body/Secondary:** Regular weights (500-700)
  - Subtitles: 14px, weight 400
  - Labels: 12px, weight 700

### Letter Spacing
- **Uppercase labels:** 1.5px tracking
- **Titles:** -0.5px (tracking) for tighter feel

---

## Layout & Spacing

### Spacing Scale
```
xs:  4px   (minimal gaps)
sm:  8px   (small elements)
md:  16px  (standard)
lg:  24px  (generous)
xl:  32px  (large sections)
xxl: 48px  (huge gaps)
```

**Default screen padding:** `lg` (24px) instead of `md`
**Card internal padding:** `lg` (24px)
**Gap between sections:** `lg` (24px)

### Borders & Radius
- **Border width:** 1.5px (main), 2px (status cards)
- **Border color:** `#E2E8F0` (cinza suave) — status cards mantêm cor do status
- **Border radius:** 6-8px (sm/md), 12-16px (lg/xl), 999 (full pill)
- **Sombra suave:** `shadowOpacity: 0.04–0.08` em todos os cards

---

## Component Specifications

### Cards
```
- Background: #F8FAFC (surface)
- Border: 1.5px solid #E2E8F0
- Border radius: 8px (md)
- Padding: 24px (lg)
- Shadow: shadowOpacity 0.04–0.08, radius 3–8
```

### Buttons
```
- Primary (Action): #16A34A background, sem border, sombra verde
- Danger (Destrutivo): #DC3545 background
- Secondary: #F8FAFC surface + #E2E8F0 border (1.5px)
- Border radius: 8px (md)
- Padding: 24px horizontal, 16px vertical (lg)
```

### Badges
```
- Border: 1.5px solid (color from classification)
- Background: Subtle color (light tint)
- Border radius: 999 (pill)
- Padding: 16px horizontal, 8px vertical
```

### Numbers (Data Display)
- Font size: 48-64px
- Font weight: 900
- Color: #1A1A1A
- Line height: 1.2 (tight)

---

## Key Design Principles

### 1. **Bold Typography**
Numbers and titles are LARGE and heavy (weight 900). This creates visual hierarchy and emphasizes important data.

✓ Do: 64px, weight 900 for BP values
✗ Don't: 28px, weight 600 (too small and light)

### 2. **Bordas Suaves**
Cards usam `1.5px solid #E2E8F0` com sombra suave. Cards de status mantêm borda colorida `2px` na cor da classificação.

✓ Do: `borderWidth: 1.5, borderColor: '#E2E8F0', elevation: 1`
✗ Don't: `borderWidth: 2, borderColor: '#000000'`

### 3. **Generous Whitespace**
Spacing between elements is generous. This creates breathing room and emphasizes each element.

✓ Do: 24px gaps, 24px padding inside cards
✗ Don't: Cramped spacing, condensed layouts

### 4. **Color Status Indicators**
The medical colors (green/amber/orange/red/purple) are vibrant and immediate. They cut through the minimal palette.

✓ Do: Use exact status colors #22C55E, #FBBF24, etc.
✗ Don't: Mute or desaturate these colors

### 5. **Profundidade Sutil**
Sombras suaves criam hierarquia sem peso visual. Cards flutuam levemente.

✓ Do: `shadowOpacity: 0.05, shadowRadius: 3, elevation: 1`
✗ Don't: Sombras pesadas ou ausência total de profundidade

---

## Visual Hierarchy

### Level 1: Page Title
- Size: 48px
- Weight: 900
- Color: #1A1A1A
- Letter spacing: -0.5px

### Level 2: Section Title
- Size: 24px
- Weight: 900
- Color: #1A1A1A

### Level 3: Large Data (BP)
- Size: 48-64px
- Weight: 900
- Color: status color OR #1A1A1A

### Level 4: Medium Data (Stats)
- Size: 32px
- Weight: 900
- Color: #1A1A1A

### Level 5: Body/Labels
- Size: 14-16px
- Weight: 500-700
- Color: #5A5A5A or #888888

---

## State Interactions

### Button States
- **Default:** Black border (#000000), white background
- **Active/Pressed:** Black border, primary color background
- **Disabled:** Black border, gray background, reduced opacity

### Card States
- **Default:** Black border (2px), white background
- **Focused:** Black border (3px), white background
- **Status colored:** Border color matches status (red/green/orange)

---

## Accessibility Notes

✓ **High Contrast:** Black borders on white surfaces
✓ **Large Typography:** 48-64px for critical numbers
✓ **Clear Labels:** All buttons and fields are labeled
✓ **Status Colors:** Never rely on color alone; use icons/text too
✓ **Touch Targets:** Minimum 44px x 44px for buttons

---

## Mobile Optimization

- **Screen padding:** 24px on all sides
- **Touch targets:** Minimum 56px height for buttons
- **Card spacing:** 24px between cards
- **Number sizes:** Scale up 1.2x on small screens

---

## Extension & Customization

### Adding New Components

Follow these principles:
1. **Use black borders** (2px) for visual consistency
2. **Use generous spacing** (lg/24px default)
3. **Use bold typography** for hierarchy (weight 900)
4. **Use the color palette** exactly as specified
5. **Keep it flat** (no shadows)

### Color Variations

New status or semantic colors should:
- Be vibrant and distinct
- Have sufficient contrast with white background
- Work well with black borders

---

## Design Tokens

```typescript
// Colors
primary: '#DC3545'        // Warm medical red
accent: '#C9A961'         // Gold highlight
text: '#1A1A1A'           // Primary text
textSecondary: '#5A5A5A'  // Secondary text
textMuted: '#888888'      // Muted text
border: '#000000'         // Black borders
background: '#FAFAF8'     // Off-white
surface: '#FFFFFF'        // Card surface

// Typography
fontWeightBold: 900       // Headlines
fontWeightMedium: 700     // Secondary
fontWeightRegular: 500    // Body

// Spacing
spacing.lg: 24px          // Default

// Borders
borderWidth: 2px
borderColor: '#000000'
borderRadius: 4-8px
```

---

## Rationale

**Why Brutalist + Warmth?**

1. **Medical Context:** Brutalism conveys trust, precision, clinical rigor
2. **Data Visualization:** Bold numbers cut through UI noise
3. **Accessibility:** High contrast, large type, generous spacing
4. **Memorability:** Black borders + warm colors are distinctive
5. **Warmth:** Despite severity, the color palette (reds, golds) feels human and approachable

This combination creates an app that feels:
- **Trustworthy** (clinical aesthetic)
- **Accessible** (large text, high contrast)
- **Modern** (minimalist, intentional)
- **Distinctive** (not generic AI slop)

---

## Implementation Checklist

- [ ] All cards use 2px black borders
- [ ] Section titles are 24px, weight 900
- [ ] Numbers are 48-64px, weight 900
- [ ] Padding inside cards is 24px (lg)
- [ ] Gaps between cards are 24px (lg)
- [ ] No shadows or gradients
- [ ] Medical colors are vibrant and exact
- [ ] Touch targets are minimum 56px
- [ ] All borders are #000000
- [ ] Background is #FAFAF8, surfaces are #FFFFFF
