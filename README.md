# Libra Lumina — Light, Elevated

A static, no-build front end for a single-product-family storefront: browse a catalog, add to cart, check out, and track the order — four pages wired together through `localStorage`, with no backend beyond a static JSON file.

## What this codebase actually is right now

The site is mid-rebrand, and the repo shows both halves at once. `index.html`'s `<title>` reads **"Libra Lumina — Light, Elevated"**, the hero headline is **"Light, Elevated"**, and the footer tagline calls it *"Crafting light objects that live at the intersection of art and function."* Every page chrome (`nav`, footer, loader) says **Libra Lumina**. That's the brand a visitor sees.

But the brand the *code* runs on is different. `script/cart-store.js` and `script/order-store.js` persist state under the keys `lamplix_cart` and `lamplix_order`, and `script/checkout.js` stamps every order with an ID like `LPX-7F3K2A` — `LPX` for **Lamplix**. The display name and the system name never got reconciled.

There's a second, larger seam: `fix.js` (checked into the repo root, with a hardcoded Windows path to one developer's desktop) is a one-time migration script. It rewrites `backend/products.json` and `main.js`, swapping vocabulary: `lamp → keyboard`, `pendant → mouse`, `table → monitor`, `floor → headset`, `desk → webcam`, `glow → RGB`. It also flips the currency from USD to VND and multiplies every `priceCents` by 10. Running it turns this from a **lamp store into a gaming-peripherals store** — but it only touched two files. The result, as the repo sits today:

- `backend/products.json` already has the new names — e.g. `"Aura Glass Keyboard"`, category `"monitor"`, `priceCents: 630000` — but the **descriptions still describe lamps** ("Hand-blown glass with a warm core RGB", "Tall diffuser with a warm halo edge"), and every `img` path still points at a lamp filename (`img/aura-glass-lamp.jpg`).
- `collection.html`'s hand-written hero cards were never touched, so they still say `"Aura Glass Lamp"`, `"Velvet Shine Lamp"`, `"A full catalog of lamps, framed like an editorial collection."`
- `index.html`'s footer nav still lists `All Lamps / Table Lamps / Floor Lamps / Pendants`.
- `fix.js` was never run against `script/cart.js`, `script/checkout.js`, or the other CSS/HTML, so most of the site's copy is still lamp language sitting on top of a keyboard/mouse/monitor data model.

None of this is invented — it's the literal state of the strings in the repo. Any redesign work has to either pick a side (finish the rebrand, or revert it) rather than design around copy that doesn't exist yet in either form.

There's also a live calculation bug worth flagging: `script/utils/money.js#calcShipping` still checks `subtotalCents >= 30000` for free shipping. That threshold was correct when it meant "$300.00" in USD cents. After `fix.js` switched the currency to VND and multiplied prices by 10, the same number now means **"above 30,000 ₫"** — about the price of a coffee — so free shipping triggers on almost every order.

## The product's native shape: a four-stage pipeline, not a set of sections

Reading `script/checkout.js` and `script/tracking.js` together, the site isn't a landing page with sections — it's a **linear order pipeline**, and the data model enforces the order:

```
Collection (catalog: browse / sort / filter)
   → Cart (localStorage line items, by product id + quantity)
      → Checkout (customer form + shipping method → subtotal/shipping/tax/total)
         → Order (saved once, immutable, id = LPX-XXXXXX)
            → Tracking (5-step delivery timeline rendered against today's date)
```

The tracking timeline itself is generated at checkout time, not fetched later — `buildTimeline()` in `checkout.js` hard-codes the five stages (**Order placed, Packed, Shipped, Out for delivery, Delivered**) and computes their dates from day-offsets that differ by shipping method (`[0,1,3,4,6]` standard vs `[0,1,2,3,4]` express). `tracking.js` then just compares those stored dates to `Date.now()` to decide which step is `done` vs `current`. There is no order status update mechanism — the whole journey is precomputed the moment the order is placed.

This shape — catalog → cart → checkout → timeline — should organize any visual redesign before any "hero section / features section / testimonials section" template gets applied. The cart and checkout pages are already built as a 1.6fr/0.8fr items-and-summary grid for exactly this reason; the tracking page is built as a 1.3fr/0.7fr details-and-timeline grid. Both layouts mirror the pipeline stage they represent.

## What the homepage leads with

`index.html`'s hero is unambiguous about priority. Before the catalog grid, before the testimonials, before the CTA banner, the page puts:

- Eyebrow: **"New Collection 2025"**
- Headline: **"Light, Elevated"**
- A floating product card for one specific SKU: **Aura Glass Lamp, $630.00**, marked *Bestseller*
- That same SKU reappears later as the dedicated **"Featured Product"** spotlight section, with full specs (Borosilicate Glass, 6W LED, 25,000 hr lifespan, 5-year warranty) and its own `$630.00` add-to-cart button.

The Aura Glass piece is the page's anchor product, referenced twice before anything else gets real estate. Any redesign should give it the dominant visual weight the README... or rather, the homepage itself, already establishes — not a generic hero-then-grid template.

## Critical files

| File | Role |
|---|---|
| `backend/products.json` | Canonical 30-SKU catalog. Fields: `id, name, category, priceCents, badge, description, views, likes, bought, img`. Source of truth for the catalog page — currently using the post-`fix.js` (keyboard/mouse/monitor/headset/webcam) vocabulary. |
| `data/products.js` | Fetches and caches `products.json`; exposes `getProducts()` / `getProductById()`. Every page goes through this, never the JSON directly. |
| `script/cart-store.js` | `localStorage`-backed cart (`lamplix_cart`). Stores only `{id, quantity}` pairs — product detail is always re-joined from `products.json` at render time. |
| `script/order-store.js` | `localStorage`-backed single order (`lamplix_order`). One order at a time; placing a new one overwrites the last. |
| `script/checkout.js` | Joins cart → products, computes subtotal/shipping/tax/total, builds the 5-stage delivery timeline, writes the order, redirects to `tracking.html`. |
| `script/tracking.js` | Reads the saved order and renders it — no live status, just date-vs-now comparison against the timeline computed at checkout. |
| `script/collection.js` | The catalog engine: filter chips (`all / price / views / likes / bought`), an asc/desc toggle, 12-item pages with a "View more products" +8 loader. |
| `script/utils/money.js` | All money math: `vi-VN` / `VND` formatting, `calcShipping` (free over 30,000 — see bug above), `calcTax` (flat 5%), `calcTotal`. |
| `script/site.js` | Shared chrome behavior used on every page: custom cursor, page loader, nav scroll state, intersection-observer scroll-reveal, smooth-scroll, toast. |
| `fix.js` | Dev-only, one-time migration script (not loaded by any page). Documents the intended pivot from lamps to gaming peripherals and from USD to VND — useful as a record of *intent*, not as running code. |
| `styles/*.css` | One token set shared across all six pages: `--bg, --dark, --dark2, --amber, --amber-light, --amber-glow, --cream, --text-dark, --text-muted, --radius (20px), --radius-sm (12px)`. Typography currently Noto Serif Display for both display and body text. |

## Open goals (visible directly in the code, not assumed)

1. **Resolve the brand name.** Pages say Libra Lumina; storage keys and order IDs say Lamplix. Pick one and propagate it everywhere, including the `mailto:hello@Libra Lumina.com` link and the `LPX-` order prefix.
2. **Finish or revert the lamp → peripheral migration.** Either re-run an equivalent of `fix.js` across `collection.html`, `index.html`'s footer nav, and the product descriptions/img paths, or restore the lamp copy in `products.json` and `main.js` to match everything else.
3. **Fix the shipping threshold.** `calcShipping`'s `30000` needs to scale with the same ×10 the prices got, or be redefined intentionally in VND terms.
4. **Source real product photography.** `img/` is empty by design — every `.img-placeholder` in every template is a deliberate placeholder, not a missing file. Replacing the brand's primary SKU image (Aura Glass) should happen before any of the 30 catalog placeholders, given the weight the homepage already puts on it.
