---
name: Lumina Productivity
colors:
  surface: '#fcf9f8'
  surface-dim: '#dcd9d9'
  surface-bright: '#fcf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f2'
  surface-container: '#f0eded'
  surface-container-high: '#eae7e7'
  surface-container-highest: '#e5e2e1'
  on-surface: '#1c1b1b'
  on-surface-variant: '#5a4136'
  inverse-surface: '#313030'
  inverse-on-surface: '#f3f0ef'
  outline: '#8e7164'
  outline-variant: '#e2bfb0'
  surface-tint: '#a04100'
  primary: '#a04100'
  on-primary: '#ffffff'
  primary-container: '#ff6b00'
  on-primary-container: '#572000'
  inverse-primary: '#ffb693'
  secondary: '#7c5800'
  on-secondary: '#ffffff'
  secondary-container: '#feb700'
  on-secondary-container: '#6b4b00'
  tertiary: '#625f50'
  on-tertiary: '#ffffff'
  tertiary-container: '#9d9989'
  on-tertiary-container: '#333125'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbcc'
  primary-fixed-dim: '#ffb693'
  on-primary-fixed: '#351000'
  on-primary-fixed-variant: '#7a3000'
  secondary-fixed: '#ffdea8'
  secondary-fixed-dim: '#ffba20'
  on-secondary-fixed: '#271900'
  on-secondary-fixed-variant: '#5e4200'
  tertiary-fixed: '#e8e2d0'
  tertiary-fixed-dim: '#ccc6b5'
  on-tertiary-fixed: '#1e1c11'
  on-tertiary-fixed-variant: '#4a4739'
  background: '#fcf9f8'
  on-background: '#1c1b1b'
  surface-variant: '#e5e2e1'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  edge-margin: 20px
  gutter: 12px
---

## Brand & Style

This design system is built for high-velocity productivity, blending the systematic efficiency of cloud storage platforms with the functional density of modern editors. The brand personality is **productive, energetic, and professional**. It aims to evoke a sense of organized momentum—where the interface stays out of the way until needed, then responds with vibrant clarity.

The aesthetic follows a **Refined Minimalist** approach. It leverages heavy white space to reduce cognitive load while using high-energy accents to guide the user's eye toward primary actions. The interface feels light and airy, but retains structural integrity through card-based containers and soft, deliberate depth.

## Colors

The palette is dominated by a 60% white base to maintain a clean, "paper-like" digital workspace. 

- **Primary Orange (#FF6B00):** Used for critical actions, active states, and primary buttons. It provides the "energetic" spark within the professional framework.
- **Warm Yellow (#FFB800):** Utilized for highlights, secondary status indicators, and starring/favoriting items. 
- **Soft Amber (#FFF9E6):** A tertiary wash used for subtle backgrounds, "new" item indicators, or selected list item states to provide warmth without the vibration of pure white.
- **Deep Neutral (#1A1A1A):** Reserved for high-contrast typography and essential iconography to ensure maximum legibility.

## Typography

This design system utilizes **Inter** exclusively to achieve a systematic, utilitarian aesthetic that remains highly readable at small sizes. 

- **Headlines:** Use Bold weights with slight negative letter-spacing for a modern, compact feel.
- **Body:** Standardized on 16px for primary reading and 14px for secondary data descriptions to mimic editor-style density.
- **Labels:** Uppercase styling is applied to `label-md` for section headers and categories to create clear visual anchors within data-heavy screens.

## Layout & Spacing

The system uses a **4px baseline grid** to ensure mathematical harmony across all components. 

- **Mobile Grid:** A 4-column fluid grid with 20px outside margins. 
- **Density:** Components use "Comfortable" vertical padding (16px) for main navigation but "Compact" padding (8px) within editor tools and file lists to maximize information density.
- **Containers:** Content is grouped into cards that span the full width of the margins or sit side-by-side with a 12px gutter.

## Elevation & Depth

To maintain a clean and flat appearance, this design system uses **Ambient Shadows** sparingly. Depth is used to indicate interactivity and hierarchy rather than realism.

- **Level 0 (Base):** Pure white background (#FFFFFF).
- **Level 1 (Cards/Lists):** A subtle 1px border (#F0F0F0) or a very soft shadow (Y: 2px, Blur: 8px, 4% Opacity) to separate cards from the background.
- **Level 2 (Floating Actions/Modals):** A more pronounced shadow (Y: 4px, Blur: 16px, 10% Opacity) to indicate high-priority interactive layers.
- **Tonal Layering:** The Warm Yellow-ish tones are used as "low-elevation" fills for highlighted rows, removing the need for shadows in dense lists.

## Shapes

The shape language is defined by **Soft Geometric** forms. 

- **Primary Radius:** A default of 12px is used for standard cards and input fields to feel approachable yet professional.
- **Large Radius:** 24px or fully rounded (pill) shapes are used for primary buttons and floating action buttons (FABs) to make them stand out as distinct interactive elements.
- **Consistency:** All nested elements (like inner image previews) should have a radius that is 4px smaller than their parent container to maintain visual nesting logic.

## Components

### Buttons
- **Primary:** Solid Orange (#FF6B00) fill with white text. Pill-shaped.
- **Secondary:** White fill with 1px Orange border or Warm Yellow background with dark text for lower-priority actions.
- **Ghost:** No fill or border; used for secondary toolbar actions within the editor.

### Cards
- White background, 12px border radius, and a subtle Level 1 shadow. Cards should include a 16px internal padding.

### Inputs
- Bordered style (1px, #E0E0E0) that shifts to a 2px Orange border on focus. Labels sit just above the input field in `label-md` style.

### Chips & Tags
- Used for categories and status. They feature a soft-tint background (using the Warm Yellow or Primary Orange at 10% opacity) with high-contrast text.

### Lists
- Files and items are displayed in rows with a 1px bottom divider. Active or selected items receive the Soft Amber (#FFF9E6) background fill.

### Floating Action Button (FAB)
- A signature component for mobile productivity. Large, circular, and using the Primary Orange color with a Level 2 shadow, typically placed in the bottom right.