# Extract Redundant CSS and Refactor Styles

This plan addresses the cleanup of duplicated CSS across the individual page style files (`cart.css`, `checkout.css`, `collection.css`, `tracking.css`, and `index.css`).

## Proposed Changes

Currently, all the page-specific CSS files duplicate the same global resets, `:root` variables, custom cursor logic, loading animations, and button styles. Some also duplicate internal hero elements (`.hero-card`, `.hero-kicker`, etc.).

### 1. Create `styles/components/global.css`
I will extract the following duplicated styles into a single shared file:
- Global resets (`*, *::before, *::after`) and `:root` variables.
- Base `html` and `body` styles (including smooth scroll and font-family).
- Custom cursor styles (`#cursor`, `#cursor-ring`).
- Image placeholder logic (`.img-placeholder`).
- Page loader logic (`#loader`, animations).
- Global button classes (`.btn-primary`, `.btn-outline`, `.btn-secondary`).
- Global animations (e.g., `@keyframes fadeUp`).

### 2. Create `styles/components/page-hero.css`
I will extract the duplicated hero components from the secondary pages (`cart`, `checkout`, `collection`, `tracking`) into a shared file:
- `.hero-grid`, `.hero-copy`, `.hero-right-col`
- `.hero-title`, `.hero-desc`, `.hero-kicker`
- `.hero-stat`, `.hero-stat-divider`, `.hero-actions`
- `.hero-card`, `.hero-card-label`, `.hero-card-title`, `.hero-card-desc`, `.hero-card-meta`

### 3. Clean up existing files
For `index.css`, `cart.css`, `checkout.css`, `collection.css`, and `tracking.css`:
- Add `@import url("components/global.css");` at the top.
- Add `@import url("components/page-hero.css");` (to the 4 secondary pages).
- **[DELETE]** Remove the hundreds of lines of duplicated CSS from these files.

## User Review Required
> [!IMPORTANT]
> Since this is a wide-reaching architectural change across all CSS files, please review this plan and let me know if you approve these refactoring steps. Once approved, I will implement the changes and verify that the UI remains completely intact!

## Verification Plan
After making the changes, I will visually inspect the HTML pages (using `view_file` to verify the CSS) and ensure the final design matches the exact look it had prior to the cleanup.
