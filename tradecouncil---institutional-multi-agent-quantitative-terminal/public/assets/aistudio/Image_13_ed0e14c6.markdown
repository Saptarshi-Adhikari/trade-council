---
name: Institutional Quantitative Terminal
colors:
  surface: '#0a141c'
  surface-dim: '#0a141c'
  surface-bright: '#313a43'
  surface-container-lowest: '#060f17'
  surface-container-low: '#131d25'
  surface-container: '#172129'
  surface-container-high: '#212b34'
  surface-container-highest: '#2c363f'
  on-surface: '#dae4ef'
  on-surface-variant: '#bdc9c5'
  inverse-surface: '#dae4ef'
  inverse-on-surface: '#28313a'
  outline: '#88938f'
  outline-variant: '#3e4946'
  surface-tint: '#81d6c4'
  primary: '#8ce1cf'
  on-primary: '#003730'
  primary-container: '#70c5b4'
  on-primary-container: '#005146'
  inverse-primary: '#006b5d'
  secondary: '#c2c7cf'
  on-secondary: '#2c3137'
  secondary-container: '#42474e'
  on-secondary-container: '#b1b5bd'
  tertiary: '#ffc4b6'
  on-tertiary: '#571e11'
  tertiary-container: '#f89f8a'
  on-tertiary-container: '#743425'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#9df2e0'
  primary-fixed-dim: '#81d6c4'
  on-primary-fixed: '#00201b'
  on-primary-fixed-variant: '#005046'
  secondary-fixed: '#dee3eb'
  secondary-fixed-dim: '#c2c7cf'
  on-secondary-fixed: '#171c22'
  on-secondary-fixed-variant: '#42474e'
  tertiary-fixed: '#ffdad2'
  tertiary-fixed-dim: '#ffb4a3'
  on-tertiary-fixed: '#3b0902'
  on-tertiary-fixed-variant: '#733425'
  background: '#0a141c'
  on-background: '#dae4ef'
  surface-variant: '#2c363f'
  bg-base: '#101317'
  surface-sidebar: '#15191E'
  surface-panel: '#191E24'
  border-divider: '#2B323B'
  text-primary: '#E8EAEC'
  text-secondary: '#98A2AD'
  indicator-bullish: '#4EAA8C'
  indicator-bearish: '#D77972'
  indicator-warning: '#D6AC64'
typography:
  headline-xl:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Geist
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 22px
    letterSpacing: -0.005em
  headline-sm:
    fontFamily: Geist
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 18px
    letterSpacing: 0.02em
  body-lg:
    fontFamily: DM Sans
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 22px
  body-md:
    fontFamily: DM Sans
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  body-sm:
    fontFamily: DM Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-lg:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: -0.01em
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 10px
    fontWeight: '400'
    lineHeight: 12px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 0.5rem
  margin: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
---

## Brand & Style

This design system establishes an institutional fintech environment tailored for multi-agent algorithmic research, execution strategies, and quantitative terminal workflows. The aesthetic conveys clinical precision, analytical rigor, and quiet operational stability.

The visual style blends institutional minimalism with high-density analyst terminal mechanics. Surfaces prioritize low sensory fatigue during sustained multi-hour sessions, avoiding pure blacks, harsh saturated contrasts, or superficial visual ornamentation. Information hierarchy is expressed strictly through typographic scale, 1px structural boundaries, tabular alignment, and disciplined semantic status cues. The resulting interface feels engineered, calm, and mission-critical.

## Colors

The palette is engineered exclusively around dark-mode operational ergonomics. Background surfaces establish deep slate containment without ever collapsing into pure `#000000`. Structural depth relies on subtle steps across the graphite spectrum: the base viewport rests at `#101317`, secondary structural sidebars at `#15191E`, and interactable research panels at `#191E24`.

Borders and grid demarcations utilize `#2B323B` at 1px thickness to anchor spatial boundaries without introducing visual vibration. Text relies on `#E8EAEC` for high-legibility headings and tabular outputs, while `#98A2AD` renders secondary metadata, units, and structural keys. 

Chromatics are strictly reserved for operational semantics:
- Subdued teal (`#70C5B4`) acts as the single primary interactive accent, driving active agent tabs, focus frames, and critical interactive affordances.
- Bullish metrics and positive returns apply muted green-teal (`#4EAA8C`).
- Bearish drawdowns, short signals, and execution warnings apply restrained terracotta (`#D77972`).
- Model drift, exposure warnings, and execution buffers apply amber (`#D6AC64`).

Never introduce ambient colored blooms, neon glows, or saturated gradients into any analytical view.

## Typography

Typographic roles adhere strictly to functional divisions:

- **Structural UI & Headings (Geist):** Structural window headers, module titles, navigation controls, and agent status banners utilize Geist. Weights are kept restrained at 600 for emphasis and 500 for secondary headers. Tight negative letter-spacing guarantees crisp mechanical clarity.
- **Body & Analyst Notes (DM Sans):** Research notes, strategy hypotheses, and natural-language model logs are set in DM Sans. Its humanist geometry balances technical density with effortless long-form reading.
- **Numerical Data, Tickers, Code, & Identifiers (JetBrains Mono):** Financial values, PnL percentages, execution latencies, UNIX timestamps, ticker symbols, and model memory hashes are strictly rendered in JetBrains Mono. Tabular figures must remain locked to fixed character widths to ensure absolute vertical scan alignment across dense rows.

Emojis are categorically prohibited across all system surfaces, logs, and notification feeds.

## Layout & Spacing

Layout architecture operates on an 8px grid (with a strict 4px micro-increment for compact terminal controls). Density is optimized for multi-pane split-screen configurations where screen real estate is critical.

- **Grid Alignment:** Fluid panel layouts utilize CSS Grid and flex containers with 8px (`0.5rem`) gaps between analyst docks, terminal panels, and charting blocks.
- **Outer Shell Margins:** Fixed viewports allocate 16px (`1rem`) outer margins on desktop displays. When collapsed to mobile, margins scale to 8px (`0.5rem`) with single-pane stacked views.
- **Component Padding Scale:**
  - Micro metrics and table cells: `space-xs` (4px vertical, 8px horizontal).
  - Standard action buttons and compact form controls: `space-sm` (8px) to `space-md` (12px).
  - Module containers and card inner gutters: `space-lg` (16px).
  - Primary section framing: `space-xl` (24px).

## Elevation & Depth

Spatial hierarchy is defined primarily through tonal surface tiers and razor-sharp 1px structural outlines rather than heavy drop shadows:

- **Tier 0 (Canvas Base):** Deep graphite `#101317` acts as the recessed root background.
- **Tier 1 (Structural Sidebars & Docks):** Surface `#15191E` with a 1px border of `#2B323B` on adjacent edges.
- **Tier 2 (Workstation Panels & Data Cards):** Primary panel background `#191E24` framed completely in 1px `#2B323B`.
- **Tier 3 (Floating Menus & Command Palette):** Command palettes, order entry overlays, and contextual dropdowns sit on `#191E24` elevated with a 1px border of `#2B323B` paired with a restrained, non-tinted analytical shadow: `0 4px 16px rgba(0, 0, 0, 0.40)`.

Interactive focus is conveyed strictly through 1px border transitions to `#70C5B4` or an understated 1px inset ring. Heavy ambient glows, blurred drop shadows, and neon halos are entirely omitted to maintain a clean terminal finish.

## Shapes

The shape vocabulary maintains disciplined geometry:
- Standard inputs, buttons, chips, and table row groupings apply subtle 6px to 8px radii.
- Large analyst panels and modular chart frames apply an 8px radius to preserve sharp quadrant divisions across high-density layouts.
- Circular elements (such as agent pulse indicators or micro status pills) are restricted to small-scale utilitarian badges. 

Avoid oversized pill radiuses on primary interactive actions or structural layout containers.

## Components

### Buttons
- **Primary Action:** Solid `#70C5B4` fill, text `#101317` (using `Geist` medium, 12px), 6px border radius, 6px vertical by 12px horizontal padding. Hover shifts to `#5BB4A2`. Active state compresses slightly without shadow bloom.
- **Secondary / Panel Action:** Background `#15191E`, 1px border `#2B323B`, text `#E8EAEC`. Hover updates border to `#70C5B4` and background to `#191E24`.
- **Destructive Action:** Background `transparent`, 1px border `#D77972`, text `#D77972`. Hover fills with `rgba(215, 121, 114, 0.12)`.

### Chips & Agent Status Badges
- **Status Indicators:** Pill or 4px radius with 2px vertical by 8px horizontal padding. Composed of `JetBrains Mono` 11px uppercase.
- **Agent Active:** Background `rgba(112, 197, 180, 0.10)`, text `#70C5B4`, 1px border `rgba(112, 197, 180, 0.25)`. Includes a 6px static circle dot (`#70C5B4`).
- **Risk / Halt:** Background `rgba(215, 121, 114, 0.10)`, text `#D77972`, 1px border `rgba(215, 121, 114, 0.25)`.
- **Idle / Backtesting:** Background `#15191E`, text `#98A2AD`, 1px border `#2B323B`.

### Tables & Tabular Logs
- **Header:** Height 32px, text `#98A2AD` in `JetBrains Mono` 11px uppercase, border-bottom 1px solid `#2B323B`, surface background `#15191E`.
- **Data Rows:** Height 36px, border-bottom 1px solid `#2B323B`, hover state `#191E24`.
- **Data Cells:** Numbers and ticker strings right-aligned using `JetBrains Mono` 13px tabular figures (`font-variant-numeric: tabular-nums`). Text descriptions left-aligned using `DM Sans` 13px.

### Input Fields & Parameter Steppers
- **Default:** Background `#101317`, 1px border `#2B323B`, 6px radius, 8px vertical by 10px horizontal padding. Text is `#E8EAEC` in `JetBrains Mono` 12px. Placeholder text `#98A2AD`.
- **Focus:** 1px border `#70C5B4`, zero exterior glow. Optional unit suffix (e.g., `USD`, `BPS`, `DELTA`) pinned right in `#98A2AD`.

### Analyst Cards & Modular Workstations
- Surfaces utilize `#191E24` framed with a 1px `#2B323B` perimeter. Header zones feature a discrete 36px toolbar containing the panel title (`Geist` 13px bold), agent state badge, and layout dock controls, separated from card contents by a 1px bottom border `#2B323B`.

### Checkboxes & Segmented Toggles
- **Checkboxes:** 14px square, 3px corner radius, 1px border `#2B323B`, background `#101317`. Checked state fills `#70C5B4` with a `#101317` check icon.
- **Segmented Range Toggles (e.g., 1M, 5M, 1H, 1D):** Enclosed in a 1px `#2B323B` frame on `#15191E`. Active option fills `#191E24` with text `#70C5B4` and 4px radius.