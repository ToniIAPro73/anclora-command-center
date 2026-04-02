```markdown
# Design System Document: The Digital Atelier of Precision

## 1. Overview & Creative North Star
This design system is built upon the philosophy of **"The Digital Atelier of Precision."** It is designed to bridge the gap between high-end editorial craftsmanship and technical architectural depth. We move away from the rigid, centered grids of generic SaaS platforms in favor of a "curated" aesthetic—one that feels intentional, quiet, and exceptionally premium.

### The Creative North Star: The Digital Atelier
*   **Editorial Elegance:** We use asymmetry and expansive breathing room (whitespace) to signal luxury. Elements are not always centered; they are placed with the intent of a gallery wall.
*   **Architectural Depth:** Rather than using lines to box things in, we use "tonal layering." The UI is treated as a 3D space where importance is defined by elevation through color shifts.
*   **Quiet Luxury:** We avoid loud gradients, heavy drop shadows, and "click-me" neon buttons. High-performance utility is delivered through sophisticated contrast and razor-sharp typography.

---

## 2. Colors & Surface Philosophy

The color logic follows a strict "No-Line" rule. Boundaries are defined by the physical property of the surfaces, not by 1px strokes.

### The Light Mode Palette (Warm Neutrals & Teal)
*   **Background (`#fbf9f4`):** Our base "canvas"—a warm, off-white that reduces eye strain and feels like high-quality paper.
*   **Primary (`#003331` / `#004b49`):** A deep, intellectual teal. Use this for moments of high authority.
*   **Tonal Tiering:** 
    *   `surface_container_low`: For subtle grouping.
    *   `surface_container_high`: For elevated focal points.
    *   *Rule:* To separate a sidebar from a main feed, transition from `surface` to `surface_container_low`. Do not draw a line.

### The Dark Mode Strategy (Midnight & Gold)
*   **Base:** Midnight navy (`#0a192f`) and deep charcoal.
*   **Accents:** Muted Gold (`#d4af37`) used sparingly for critical path actions or "Member-Only" status indicators.

### The "Glass & Gradient" Rule
To add "soul" to the precision:
*   **Glassmorphism:** For floating menus or navigation bars, use `surface_container` tokens at 80% opacity with a `24px` backdrop blur. This allows the architectural layers beneath to bleed through, maintaining a sense of place.
*   **Signature Textures:** For primary CTAs, use a subtle linear gradient from `primary` (#003331) to `primary_container` (#004b49) at a 135-degree angle. This provides a tactile "sheen" without looking dated.

---

## 3. Typography: Editorial Authority

We use a high-contrast pairing to balance heritage with future-facing utility.

*   **Headlines: Newsreader (Serif)**
    *   **Character:** Authoritative, timeless, and intellectual.
    *   **Usage:** Use for `display-lg` through `headline-sm`. 
    *   **The Signature Shift:** For `display-lg` titles, use a negative tracking of `-0.02em` to make the serif feel "tight" and custom-set.
*   **Body & UI: Manrope (Sans-Serif)**
    *   **Character:** Modern, geometric, and highly legible at small scales.
    *   **Usage:** All functional UI, labels, and long-form body text.
    *   **The Utility Rule:** Use `title-md` in Manrope for interactive elements (buttons, nav links) to maintain a distinct "tool-like" feel amidst the editorial serifs.

---

## 4. Elevation & Depth: Tonal Layering

Traditional shadows and borders are replaced by a "Stacking Principle."

*   **The Layering Principle:** 
    *   `surface_container_lowest` (the bottom sheet)
    *   `surface` (the main work area)
    *   `surface_container_high` (the card/interactive element)
*   **Ambient Shadows:** If an element must float (e.g., a modal), use an ultra-diffused shadow: `box-shadow: 0 20px 40px rgba(27, 28, 25, 0.06);`. The shadow color must be a tinted version of `on_surface`, never pure black.
*   **The "Ghost Border":** If accessibility requires a container edge (e.g., in high-glare environments), use `outline_variant` at **15% opacity**. It should be felt, not seen.

---

## 5. Components

### Buttons: The Weighted Interaction
*   **Primary:** Solid `primary` background with `on_primary` text. No border. Use `md` (0.375rem) roundedness to keep the architectural "sharpness."
*   **Secondary:** `surface_container_high` background. This creates a "recessed" look rather than a bordered look.
*   **Tertiary:** Text-only in `primary`, using `0.7rem` tracking for a sophisticated, airy feel.

### Input Fields: The Sculpted Form
*   **Style:** No outer border. Use a `surface_container_highest` background with a `1px` bottom-only highlight in `primary` when focused.
*   **Layout:** Label (Manrope, `label-md`) should be placed with generous top-padding (`1.4rem`) to allow the form to breathe.

### Cards: The Asymmetric Block
*   Avoid the "grid of boxes." Use varying widths (e.g., a 60/40 split) for cards in a row. 
*   **Separation:** Use a vertical `spacing-12` (4rem) between card groups instead of a divider line.

### Editorial Modular Blocks
*   **The "Pull-Quote" Block:** A combination of a `display-sm` Newsreader headline offset to the left, with `body-lg` Manrope text taking up the right 50% of the container. 

---

## 6. Do’s and Don’ts

### Do
*   **Do** embrace "White Space as Content." If a section feels crowded, double the spacing token (e.g., move from `spacing-8` to `spacing-16`).
*   **Do** use `primary_fixed_dim` for subtle hover states on dark backgrounds.
*   **Do** use asymmetrical margins. A hero image can bleed off the right edge of the screen while text stays pinned to the left grid.

### Don't
*   **Don’t use 1px solid borders.** This is the quickest way to break the "Atelier" feel. Use color shifts.
*   **Don’t use standard "SaaS Blue."** Stick strictly to the Teal and Midnight Navy spectrum.
*   **Don’t center-align everything.** Perfect symmetry is the enemy of the curated editorial look. Offset your headers.
*   **Don’t use heavy shadows.** If the surface shift isn't enough, your color choices need more contrast, not more shadow.

---

## 7. Spacing & Rhythm
We use a base-7 system to create a non-standard rhythm that feels more "human" and less "bootstrap."
*   **Micro-padding:** `0.7rem` (2) and `1rem` (3).
*   **Section Breaks:** `5.5rem` (16) and `7rem` (20).
*   **Asymmetric Offset:** When layering blocks, use `2.75rem` (8) of overlap to create architectural depth.```