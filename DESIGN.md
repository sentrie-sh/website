# Sentrie - Style Reference

> A technical manual on blueprint paper. A near-white gridded page, held together by one deep ink blue and a light geometric sans, so every page reads like a chapter in a well-printed reference.

**Theme:** light first, with a matching dark mode

This is the design system for sentrie.sh: the landing page and the docs. The tokens live in `src/styles/tokens.css`, and `src/styles/theme.css` maps them onto Starlight's variables. Change a value here and there together.

Sentrie reads as an open-source engineering notebook: a near-white grid canvas, a single ink blue that carries headings and links, and chrome that stays almost entirely text and hairline borders. Typography is the personality. One geometric sans sets the headlines at a light weight and carries UI and body copy at a regular one, and a wide-tracked mono marks commands and labels. Components are sharp-cornered (2px radius), compact (6px gaps) and almost shadowless. Structure comes from 1px borders, 2px inset lines and the faint dotted grid beneath the landing page. The primary call to action is the only saturated fill on a page, and everything around it stays quiet and typographic, closer to a technical whitepaper than a SaaS landing page.

## Tokens - Colors

| Name | Value | Token | Role |
|------|-------|-------|------|
| Ink Blue | `#1348dc` | `--color-ink-blue` | Headlines, primary text links, the wordmark. The single chromatic anchor that carries identity across the site |
| Signal Blue | `#2b7fff` | `--color-signal-blue` | Fill of the primary call to action, and nothing else |
| Sky Tint | `#8ec5ff` | `--color-sky-tint` | Headlines and links in dark mode, low-frequency decorative accents in light mode |
| Frost | `#bedbff` | `--color-frost` | Hairline blue borders and tag outlines that should read as on-brand rather than neutral |
| Slate Blue | `#74ade8` | `--color-slate-blue` | Icon strokes, secondary blue text, active markers |
| Ice Wash | `#e6effe` | `--color-ice-wash` | Selected sidebar item, hover wash, soft blue tints |
| Deep Cobalt | `#053794` | `--color-deep-cobalt` | Link hover, the 2px inset line on the active nav item |
| Silver Mist | `#e5e7eb` | `--color-silver-mist` | Dominant border color and the landing page grid |
| Pure White | `#ffffff` | `--color-pure-white` | Docs page surface, cards, raised panels |
| Off-White | `#f4f4f2` | `--color-off-white` | Warm surface for the docs sidebar, inline code and command chips |
| Graphite | `#3a3d43` | `--color-graphite` | Primary body text, the wordmark in neutral contexts |
| Charcoal | `#464b57` | `--color-charcoal` | Strong body text, button text on light fills |
| Slate | `#5d636f` | `--color-slate` | Secondary text, nav labels, supporting copy |
| Pewter | `#6a7282` | `--color-pewter` | Tertiary text, helper copy, footer links |
| Ash | `#878a98` | `--color-ash` | Muted icons, placeholder strokes |
| Steel | `#b2b5bb` | `--color-steel` | Very low-emphasis labels and icon outlines |
| Fog | `#cccfd3` | `--color-fog` | Ghost button and input borders at rest |
| Mist | `#dadde2` | `--color-mist` | Hairline dividers between rows |
| Onyx | `#282c33` | `--color-onyx` | Code block and code preview surface, in both modes |
| Midnight | `#2f343e` | `--color-midnight` | Code frame chrome (title bar, tab strip), dark mode borders |

### Code syntax colors

Code sits on Onyx in both light and dark mode, which makes it the one dark object on a light page.

| Role | Value |
|------|-------|
| Strings | `#a1c181` |
| Keywords | `#d07277` |
| Types | `#dec184` |
| Functions | `#6eb4bf` |
| Variables | `#b477cf` |
| Constants and numbers | `#bf956a` |
| Comments | `#878a98` |
| Plain text | `#dce0e5` |

### Dark mode

Dark mode keeps the same structure and swaps the neutrals. The blue hierarchy moves one step lighter so it holds contrast on a dark canvas.

| Role | Light | Dark |
|------|-------|------|
| Canvas | `#f8f9fa` with grid | `#16181d` with grid |
| Surface (docs page, cards) | `#ffffff` | `#1c1f25` |
| Warm surface (sidebar, chips) | `#f4f4f2` | `#21252b` |
| Text, primary | `#3a3d43` | `#dce0e5` |
| Text, secondary | `#5d636f` | `#a3a9b5` |
| Hairline | `#e5e7eb` | `#2f343e` |
| Headline and link | `#1348dc` | `#8ec5ff` |
| Link hover | `#053794` | `#bedbff` |
| Selected wash | `#e6effe` | `#1b2a45` |
| Primary call to action | `#2b7fff` | `#2b7fff` |

## Tokens - Typography

Both families are open source (SIL Open Font License 1.1) and self-hosted from `@fontsource-variable` packages, so the site makes no third-party font requests.

### Montserrat - UI, body and headlines

`--font-sans` for UI and body copy, and `--font-display` (the same family) for headlines. One geometric sans carries the whole page, and weight and color do the work of hierarchy.

- **Body and UI:** weight 400, 500 for emphasis in UI only. Sizes 11-16px, with slight negative tracking (-0.01em). At 11-12px it is micro-copy and tag text; at 14-16px it carries body paragraphs.
- **Display:** weight 340 for the landing page headline (48px) and docs page titles (36px), an unusually light cut that whispers rather than shouts, with tight -0.02em tracking. This is what keeps the site editorial rather than promotional. Montserrat is a variable font, so 340 is a real weight, not a rounding.
- **Headings:** weight 500 at 26px for in-content and section headings, 17-20px for sub-headings, so they separate from 400 body text.
- **Line height:** 1.10 for display, 1.25 for headings, 1.50-1.71 for body.

### JetBrains Mono - Code, commands and labels

`--font-mono`. Code blocks and inline code use it at normal tracking. Command chips, eyebrow labels and code frame tabs use +0.05em tracking, which widens the letterforms so they read as labels rather than syntax.

- **Weights:** 400
- **Sizes:** 11px, 12px, 13px, 14px
- **Line height:** 1.50, 1.67
- **Letter spacing:** 0 for code, 0.05em for labels

### Type Scale

| Role | Family | Weight | Size | Line Height | Letter Spacing | Token |
|------|--------|--------|------|-------------|----------------|-------|
| caption | sans | 400 | 12px | 1.5 | -0.3px | `--text-caption` |
| body | sans | 400 | 14px (landing), 16px (docs) | 1.5 / 1.71 | -0.35px | `--text-body` |
| heading-sm | display | 500 | 26px | 1.25 | -0.52px | `--text-heading-sm` |
| heading | display | 340 | 48px | 1.1 | -0.96px | `--text-heading` |

Docs body copy runs at 16px with a 1.71 line height, because long-form reading needs more room than landing page copy.

## Tokens - Spacing & Shapes

**Density:** compact

### Spacing Scale

`4, 6, 8, 10, 12, 14, 16, 20, 24, 32, 40, 48, 64, 80` px, as `--space-<n>`.

### Border Radius

| Element | Value |
|---------|-------|
| Tags, chips | 2px |
| Cards | 2px |
| Inputs | 2px |
| Buttons | 2px |
| Code frames | 6px |

Nothing goes above 6px.

### Shadows

| Name | Value | Use |
|------|-------|-----|
| inset-line | `rgba(111, 123, 144, 0.1) 0px -2px 0px 0px inset` | Button bottom edge, subtle separators |
| active-nav | `rgb(5, 55, 148) 0px 2px 0px 0px inset` | Active header nav item |
| raised | `rgba(0, 0, 0, 0.1) 0px 1px 3px 0px, rgba(0, 0, 0, 0.1) 0px 1px 2px -1px` | Primary button only |
| frame | `rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.1) 0px 4px 6px -4px` | Landing page code preview only |

### Layout

- **Page max-width:** 1200px (landing page)
- **Section gap:** 64-80px
- **Card padding:** 24px
- **Element gap:** 6px

## Components

### Header

White surface (dark mode: the dark surface), 1px hairline bottom border, about 60px tall. Left: the Sentrie mark and wordmark in the sans at 16px, Graphite. Then the docs search. Right: GitHub link and theme switcher in Slate. On the landing page the header also carries a short nav (Docs, Reference, CLI) in the sans at 14px, Slate, 24px apart. The active item gets the 2px Deep Cobalt inset line and an Ice Wash background.

### Primary Action Button

Signal Blue fill, white text in the sans at 14px weight 500, 2px radius, 10px 16px padding, 6px gap to a trailing arrow. The raised shadow sits under it. It is the only saturated fill on the page; everything else recedes behind it. On the landing page it reads "Get started" and leads to installation.

### Ghost Button

Transparent background, 1px Fog border, sans 14px Graphite text, 2px radius, 10px 16px padding, 6px gap to a leading icon. Sits 8px to the right of the primary button, never alone in a row. On the landing page it reads "Read the docs".

### Hero Section

Full-width canvas with the dotted grid (1px dots every 16px, in Silver Mist). Centered stack: a mono eyebrow label, the display headline at 48px weight 340 in Ink Blue with -0.96px tracking, sans 16px Slate subtext, the primary and ghost buttons 8px apart, then a command chip showing the install command. 16-24px gaps between elements. No card and no panel: the grid paper is the hero.

### Code Preview Frame

The landing page's main visual: a real Sentrie policy, highlighted with the code syntax colors. Onyx surface, 6px radius, the frame shadow lifting it off the grid. A 32px Midnight title bar with three muted dots on the left and a tab strip in mono 12px with label tracking (`policy.sentrie`, `pack.toml`). Below the code, a result strip shows the command and its decision, for example `sentrie exec` followed by the rule's output. Centered, up to 960px wide.

### Three-Column Feature Row

Three equal columns on the canvas, 32px gap, about 80px vertical padding. Each column: a display 17px weight 500 Ink Blue title, sans 14px Slate description at 1.5 line height, then a sans 14px Ink Blue "Learn more" link with a trailing arrow. No cards, borders or icons: pure typographic separation. Two rows of three cover the six features.

### Two-Column Feature Section

1200px content. Left column (about 40%): display 26px Ink Blue heading, sans 16px Slate description, sans 14px Ink Blue link. Right column (about 60%): a code preview frame showing a second example, such as a TypeScript module call or `sentrie serve` with an HTTP request. 80px above and below.

### Command Chip

Mono 12px Graphite text, 0.05em tracking, 1px Fog border, Off-White background, 2px radius, 4px 8px padding. Used for install commands and CLI references next to feature descriptions. The wide tracking is what distinguishes it from inline code: it reads as a label, not as syntax.

### Docs Page

Pure White content surface, Off-White sidebar separated by a 1px hairline. Page titles in the display face at 36px weight 340, Ink Blue. In-content headings at 26px and 20px weight 500, Graphite. Body in the sans at 16px. Links in Ink Blue, underlined on hover. Inline code in mono on Off-White with a 1px Mist border and 2px radius. The selected sidebar entry gets an Ice Wash background, Ink Blue text and a 2px Ink Blue line on its left edge. Asides use a 2px left border in their semantic color over a faint tint, with 2px radius.

### Footer

Canvas continuing from the page, 1px hairline top border, 48px vertical padding. Sans 13px Pewter links. The wordmark in the sans at 14px Graphite sits at the bottom left with the license line.

## Do's and Don'ts

### Do

- Set display headlines at weight 340 with -0.02em tracking. The light display weight is the signature.
- Use Signal Blue fill for the primary call to action, and keep it the only saturated fill on the screen.
- Build cards, buttons, tags and inputs with a 2px radius. Sharp corners are part of the editorial feel.
- Use 6px as the default element gap and 64-80px between landing page sections.
- Pair every primary button with a ghost button 8px to its right.
- Express structure with 1px hairlines and 2px inset lines, not drop shadows.
- Show real Sentrie code that parses and runs. The code preview is the product.
- Use the mono with 0.05em tracking for command chips and labels.

### Don't

- Don't set display headlines (the hero and page titles) above weight 400. The lightness is the point.
- Don't introduce a second saturated color for buttons, tags or accents. Ink Blue and Signal Blue are the only chromatic UI colors, apart from the semantic colors of asides.
- Don't put drop shadows on cards, the header or text blocks. Only the primary button and the code preview frame cast one.
- Don't round any corner beyond 6px.
- Don't use blue for body text. Blue is for headlines, links and the call to action; body text is Graphite or Slate.
- Don't add social proof the project doesn't have: no logo walls, testimonials or invented usage numbers.
- Don't add decorative gradients, glassmorphism or background images. The dotted grid is the only texture.

## Surfaces

| Level | Name | Light | Dark | Purpose |
|-------|------|-------|------|---------|
| 0 | Canvas | `#f8f9fa` | `#16181d` | Landing page background, with the dotted grid |
| 1 | Surface | `#ffffff` | `#1c1f25` | Docs content, header, cards |
| 2 | Warm Surface | `#f4f4f2` | `#21252b` | Docs sidebar, inline code, command chips |
| 3 | Blue Wash | `#e6effe` | `#1b2a45` | Selected sidebar item, hover |
| 4 | Code | `#282c33` | `#282c33` | Code blocks and code preview frames |

## Imagery

Imagery is one element: real Sentrie code in a code preview frame, with a title bar, tabs and syntax highlighting, as a deliberate dark contrast to the light page. There is no photography, illustration or abstract graphic. The grid canvas is the only texture, and the Sentrie mark is the only logo.

## Layout

Landing page content is centered in a 1200px column on a full-width gridded canvas, with no alternating colored bands. The hero is a centered typographic stack. Sections below follow a rhythm of centered headlines over content: the code preview frame, two rows of the three-column feature row, a two-column feature section, and a closing call to action. 64-80px between sections, 6-16px within them.

The docs keep Starlight's three-part layout (sidebar, content, table of contents) and take the tokens: Pure White content, Off-White sidebar, hairline separators, light display titles, Onyx code.

At phone widths every multi-column row collapses to one column, the hero headline drops to 36px, and the code preview frame scrolls horizontally inside itself rather than widening the page.

## Quick Start

### CSS Custom Properties

```css
:root {
  /* Colors */
  --color-ink-blue: #1348dc;
  --color-signal-blue: #2b7fff;
  --color-sky-tint: #8ec5ff;
  --color-frost: #bedbff;
  --color-slate-blue: #74ade8;
  --color-ice-wash: #e6effe;
  --color-deep-cobalt: #053794;
  --color-silver-mist: #e5e7eb;
  --color-pure-white: #ffffff;
  --color-off-white: #f4f4f2;
  --color-graphite: #3a3d43;
  --color-charcoal: #464b57;
  --color-slate: #5d636f;
  --color-pewter: #6a7282;
  --color-ash: #878a98;
  --color-steel: #b2b5bb;
  --color-fog: #cccfd3;
  --color-mist: #dadde2;
  --color-onyx: #282c33;
  --color-midnight: #2f343e;

  /* Font families */
  --font-sans: "Montserrat Variable", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  --font-display: var(--font-sans);
  --font-mono: "JetBrains Mono Variable", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;

  /* Type scale */
  --text-caption: 12px;
  --text-body: 14px;
  --text-heading-sm: 26px;
  --text-heading: 48px;
  --tracking-sans: -0.01em;
  --tracking-display: -0.02em;
  --tracking-label: 0.05em;

  /* Radius */
  --radius-sm: 2px;
  --radius-md: 6px;

  /* Shadows */
  --shadow-inset-line: rgba(111, 123, 144, 0.1) 0px -2px 0px 0px inset;
  --shadow-active-nav: rgb(5, 55, 148) 0px 2px 0px 0px inset;
  --shadow-raised: rgba(0, 0, 0, 0.1) 0px 1px 3px 0px, rgba(0, 0, 0, 0.1) 0px 1px 2px -1px;
  --shadow-frame: rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.1) 0px 4px 6px -4px;

  /* Layout */
  --page-max-width: 1200px;
}
```
