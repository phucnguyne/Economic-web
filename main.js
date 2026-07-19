// ── LOADER ──
window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  if (loader) {
    setTimeout(() => loader.classList.add('gone'), 1800);
  }
});

// ── CUSTOM CURSOR ──
const cursor = document.getElementById('cursor');
const ring = document.getElementById('cursor-ring');
if (cursor && ring) {
  document.addEventListener('mousemove', e => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
    setTimeout(() => {
      ring.style.left = e.clientX + 'px';
      ring.style.top = e.clientY + 'px';
    }, 60);
  });

  let cursorActiveTimer;
  const clearCursorActive = () => {
    clearTimeout(cursorActiveTimer);
    document.body.classList.remove('cursor-active');
  };
  const isClickable = target => Boolean(target.closest('button, a'));

  document.addEventListener('pointerdown', event => {
    if (!isClickable(event.target)) {
      return;
    }
    clearTimeout(cursorActiveTimer);
    document.body.classList.add('cursor-active');
  });

  document.addEventListener('pointerup', () => {
    if (!document.body.classList.contains('cursor-active')) {
      return;
    }
    clearTimeout(cursorActiveTimer);
    cursorActiveTimer = setTimeout(clearCursorActive, 220);
  });

  document.addEventListener('pointercancel', clearCursorActive);
  window.addEventListener('blur', clearCursorActive);
}

// ── NAV SCROLL ──
const navbar = document.getElementById('navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  });
}

// ── SCROLL REVEAL ──
const reveals = document.querySelectorAll('.reveal');
if (reveals.length) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); } });
  }, { threshold: 0.12 });
  reveals.forEach(r => observer.observe(r));
}

// ── TICKER ──
const logos = [
  { mark: 'A', name: 'Arthaus Studio' },
  { mark: 'N', name: 'Nordic Light Co' },
  { mark: 'M', name: 'Maison Éclat' },
  { mark: 'V', name: 'Vantage Living' },
  { mark: 'L', name: 'Lux Intérieurs' },
  { mark: 'O', name: 'Orbit Objects' },
  { mark: 'F', name: 'Form & Fire' },
  { mark: 'H', name: 'Haven Home' },
  { mark: 'E', name: 'Ember Design' },
  { mark: 'C', name: 'Celo Collective' },
];
const track = document.getElementById('tickerTrack');
if (track) {
  const doubled = [...logos, ...logos];
  doubled.forEach(l => {
    const el = document.createElement('div');
    el.className = 'ticker-logo';
    el.innerHTML = `<span class="logo-mark">${l.mark}</span>${l.name}`;
    el.addEventListener('mouseenter', () => track.style.animationPlayState = 'paused');
    el.addEventListener('mouseleave', () => track.style.animationPlayState = 'running');
    track.appendChild(el);
  });
}

// ── TOAST ──
const toast = document.getElementById('toast');
const toastMsg = document.getElementById('toastMsg');
let toastTimer;
function showToast(msg) {
  if (!toast || !toastMsg) {
    return;
  }
  toastMsg.innerHTML = msg;
  toast.style.transform = 'translateY(0)';
  toast.style.opacity = '1';
  toast.style.pointerEvents = 'auto';
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.style.transform = 'translateY(80px)';
    toast.style.opacity = '0';
    toast.style.pointerEvents = 'none';
  }, 5000);
}
// ── CART STORAGE ── (shared with cart.js via same localStorage key)
const CART_KEY = 'libra_lumina_cart';
const readCart = () => {
  try { const raw = localStorage.getItem(CART_KEY); const parsed = raw ? JSON.parse(raw) : []; return Array.isArray(parsed) ? parsed : []; } catch { return []; }
};
const saveCart = cart => { localStorage.setItem(CART_KEY, JSON.stringify(cart)); };
window.getCartCount = () => readCart().reduce((sum, item) => sum + item.quantity, 0);

function addToCart(triggerOrName, maybeName) {
  // Back-compat: addToCart('Product Name') still works with no color context.
  const hasTrigger = triggerOrName instanceof Element;
  const trigger = hasTrigger ? triggerOrName : null;
  const name = hasTrigger ? maybeName : triggerOrName;
  const card = trigger ? trigger.closest('[data-product-card]') : null;
  const selectedSwatch = card ? card.querySelector('.color-swatch[aria-pressed="true"]') : null;
  const colorName = selectedSwatch ? selectedSwatch.dataset.name : null;

  // Actually save to localStorage cart
  const productId = name.toLowerCase().replace(/\s+/g, '-');
  const cart = readCart();
  const existing = cart.find(item => item.id === productId);
  if (existing) { existing.quantity += 1; } else { cart.push({ id: productId, quantity: 1 }); }
  saveCart(cart);

  const toastHTML = `
    <span>${colorName ? `"${name}" — ${colorName} added to cart ✓` : `"${name}" added to cart ✓`}</span>
    <span class="toast-actions">
      <a href="cart.html" class="toast-btn">View Cart</a>
      <a href="checkout.html" class="toast-btn toast-btn--primary">Checkout</a>
    </span>
  `;
  showToast(toastHTML);
}
function showCartToast() { showToast('Opening collection...'); }

// ── COLOR SWATCHES ──
// A small palette of lamp finishes/glass tones drawn from the brand's own
// tokens, so every swatch reads as "a real material option" rather than an
// arbitrary rainbow bolted onto the cards.
const COLOR_PALETTE = [
  { name: 'Amber Glass', hex: '#B8860B' },
  { name: 'Honey Glass', hex: '#D4AF37' },
  { name: 'Smoked Grey', hex: '#4A4A4A' },
  { name: 'Frosted Opal', hex: '#F5F0E6' },
  { name: 'Espresso Brass', hex: '#2C1E14' },
  { name: 'Warm Ivory', hex: '#EFE8D5' },
];

function colorsForIndex(index) {
  const a = COLOR_PALETTE[index % COLOR_PALETTE.length];
  const b = COLOR_PALETTE[(index + 2) % COLOR_PALETTE.length];
  const c = COLOR_PALETTE[(index + 4) % COLOR_PALETTE.length];
  return [a, b, c];
}

function renderSwatchesHTML(colors, { light = false } = {}) {
  const swatchClass = light ? 'color-swatch color-swatch--light' : 'color-swatch';
  const buttons = colors.map((c, i) => `
    <button type="button" class="${swatchClass}" style="--swatch:${c.hex}"
      data-name="${c.name}" aria-label="${c.name}" aria-pressed="${i === 0 ? 'true' : 'false'}"></button>
  `).join('');
  return `
    <div class="color-field${light ? ' color-field--light' : ''}">
      <div class="color-field-top">
        <span class="color-field-label">Color</span>
        <span class="color-field-value">${colors[0].name}</span>
      </div>
      <div class="color-swatches">${buttons}</div>
    </div>
  `;
}

// One delegated listener handles every swatch on every page (hero card,
// homepage tiles, spotlight, and the JS-rendered catalog grid alike).
document.addEventListener('click', e => {
  const swatch = e.target.closest('.color-swatch');
  if (!swatch) return;
  const group = swatch.closest('.color-swatches');
  const field = swatch.closest('.color-field');
  if (!group) return;
  group.querySelectorAll('.color-swatch').forEach(s => s.setAttribute('aria-pressed', 'false'));
  swatch.setAttribute('aria-pressed', 'true');
  const valueEl = field ? field.querySelector('.color-field-value') : null;
  if (valueEl) valueEl.textContent = swatch.dataset.name;
});

// ── HAMBURGER FAB + PANEL ──
const hamburgerFab = document.getElementById('hamburgerFab');
const hamburgerPanel = document.getElementById('hamburgerPanel');
const hamburgerOverlay = document.getElementById('hamburgerOverlay');
const hamburgerPanelClose = document.getElementById('hamburgerPanelClose');

function openHamburgerPanel() {
  if (!hamburgerPanel || !hamburgerOverlay) return;
  hamburgerPanel.setAttribute('aria-hidden', 'false');
  hamburgerPanel.classList.add('is-open');
  hamburgerOverlay.setAttribute('aria-hidden', 'false');
  hamburgerOverlay.classList.add('is-visible');
  if (hamburgerFab) {
    hamburgerFab.setAttribute('aria-pressed', 'true');
    const icon = hamburgerFab.querySelector('.hamburger-fab-icon');
    if (icon) icon.textContent = '✕';
  }
  document.body.style.overflow = 'hidden';
}

function closeHamburgerPanel() {
  if (!hamburgerPanel || !hamburgerOverlay) return;
  hamburgerPanel.setAttribute('aria-hidden', 'true');
  hamburgerPanel.classList.remove('is-open');
  hamburgerOverlay.setAttribute('aria-hidden', 'true');
  hamburgerOverlay.classList.remove('is-visible');
  if (hamburgerFab) {
    hamburgerFab.setAttribute('aria-pressed', 'false');
    const icon = hamburgerFab.querySelector('.hamburger-fab-icon');
    if (icon) icon.textContent = '☰';
  }
  document.body.style.overflow = '';
}

function toggleHamburgerPanel() {
  if (hamburgerPanel && hamburgerPanel.classList.contains('is-open')) {
    closeHamburgerPanel();
  } else {
    openHamburgerPanel();
  }
}

if (hamburgerFab) {
  hamburgerFab.addEventListener('click', toggleHamburgerPanel);
}
if (hamburgerOverlay) {
  hamburgerOverlay.addEventListener('click', closeHamburgerPanel);
}
if (hamburgerPanelClose) {
  hamburgerPanelClose.addEventListener('click', closeHamburgerPanel);
}
// Close on Escape key
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && hamburgerPanel && hamburgerPanel.classList.contains('is-open')) {
    closeHamburgerPanel();
  }
});

// ── SMOOTH SCROLL ──
function scrollTo(sel) {
  const el = document.querySelector(sel);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
  });
});

// ── REVIEW CAROUSEL ──
const reviewViewport = document.querySelector('.testi-viewport');
const reviewPrev = document.querySelector('.review-prev');
const reviewNext = document.querySelector('.review-next');
if (reviewViewport) {
  const step = () => Math.max(320, Math.round(reviewViewport.clientWidth * 0.86));
  const scrollReviews = direction => {
    reviewViewport.scrollBy({ left: direction * step(), behavior: 'smooth' });
  };

  if (reviewPrev) {
    reviewPrev.addEventListener('click', () => scrollReviews(-1));
  }
  if (reviewNext) {
    reviewNext.addEventListener('click', () => scrollReviews(1));
  }
}

// ── COLLECTION CATALOG ──
const catalogGrid = document.getElementById('catalogGrid');
const catalogCount = document.getElementById('catalogCount');
const catalogChips = document.querySelectorAll('[data-filter]');
const catalogSortToggle = document.getElementById('catalogSortToggle');

if (catalogGrid) {
  const catalogProducts = [
    { name: 'Aura Glass Lamp', category: 'table', price: 630000, badge: 'Bestseller', description: 'Hand-blown glass with a warm core glow.', featured: true, views: 18420, likes: 1240, bought: 356 },
    { name: 'Velvet Shine Lamp', category: 'table', price: 240000, badge: 'New', description: 'Soft presence for desks and side tables.', views: 14220, likes: 1080, bought: 241 },
    { name: 'Lumière Luxe Lamp', category: 'table', price: 210000, badge: 'Popular', description: 'Ambient Lamp with a calm silhouette.', views: 16640, likes: 980, bought: 188 },
    { name: 'Zenith Luxe Lamp', category: 'floor', price: 180000, badge: 'Sale', description: 'Tall, sculptural floor light for corners.', views: 12140, likes: 760, bought: 160 },
    { name: 'Halo desk Lamp', category: 'desk', price: 240000, badge: 'New', description: 'Compact and modern for focused work.', views: 11190, likes: 615, bought: 132 },
    { name: 'Moss floor Lamp', category: 'floor', price: 380000, badge: 'Editor', description: 'Warm vertical glow with grounded presence.', views: 15880, likes: 1180, bought: 299 },
    { name: 'Cove pendant', category: 'pendant', price: 210000, badge: 'Top pick', description: 'Sculptural pendant for dining and island spaces.', views: 17230, likes: 1390, bought: 312 },
    { name: 'Arc Ember table', category: 'table', price: 320000, badge: 'Craft', description: 'Rounded Lamp for softer interiors.', views: 10230, likes: 540, bought: 90 },
    { name: 'Nova Ring Light', category: 'desk', price: 190000, badge: 'Eco', description: 'Minimal Lamp built for compact spaces.', views: 9300, likes: 420, bought: 75 },
    { name: 'Dune floor glow', category: 'floor', price: 470000, badge: 'Limited', description: 'Tall diffuser with a warm halo edge.', views: 18910, likes: 1490, bought: 324 },
    { name: 'Orbit Reading Lamp', category: 'desk', price: 160000, badge: 'New', description: 'Directional Lamp for reading corners.', views: 8800, likes: 350, bought: 68 },
    { name: 'Luna pendant', category: 'pendant', price: 260000, badge: 'Popular', description: 'Quiet form that floats above the room.', views: 14320, likes: 970, bought: 210 },
    { name: 'Milo Brass Lamp', category: 'table', price: 295000, badge: 'Eco', description: 'Brass-accented glow for bedside use.', views: 11980, likes: 740, bought: 156 },
    { name: 'Sora floor Arc', category: 'floor', price: 520000, badge: 'Bestseller', description: 'Arched floor Lamp with editorial scale.', views: 20340, likes: 1670, bought: 410 },
    { name: 'Quill desk Beam', category: 'desk', price: 175000, badge: 'New', description: 'Precision lighting with a clean profile.', views: 8460, likes: 390, bought: 71 },
    { name: 'Pine pendant', category: 'pendant', price: 225000, badge: 'Craft', description: 'Natural balance for kitchen and lounge areas.', views: 14110, likes: 860, bought: 198 },
    { name: 'Aster Side Lamp', category: 'table', price: 205000, badge: 'Sale', description: 'Side-table companion with warm diffusion.', views: 10620, likes: 680, bought: 115 },
    { name: 'Echo floor Lamp', category: 'floor', price: 450000, badge: 'Editor', description: 'Low-contrast form that blends into interiors.', views: 14750, likes: 1020, bought: 206 },
    { name: 'Ridge desk Lamp', category: 'desk', price: 155000, badge: 'Eco', description: 'Small footprint with a focused beam.', views: 7900, likes: 310, bought: 54 },
    { name: 'Noa pendant', category: 'pendant', price: 240000, badge: 'Popular', description: 'A soft hanging sphere for gentle light.', views: 13020, likes: 890, bought: 186 },
    { name: 'Sol table Lamp', category: 'table', price: 275000, badge: 'New', description: 'Quiet glow with a clean circular form.', views: 11590, likes: 710, bought: 148 },
    { name: 'Harbor floor Lamp', category: 'floor', price: 560000, badge: 'Bestseller', description: 'A large anchor piece for open rooms.', views: 19720, likes: 1560, bought: 378 },
    { name: 'Bram desk Light', category: 'desk', price: 165000, badge: 'Craft', description: 'Slim task light with warm contrast.', views: 8200, likes: 340, bought: 61 },
    { name: 'Mira pendant', category: 'pendant', price: 230000, badge: 'Sale', description: 'Simple overhead light with soft edges.', views: 12340, likes: 765, bought: 137 },
    { name: 'Roon table Lamp', category: 'table', price: 310000, badge: 'Limited', description: 'Rounded base and diffused shade glow.', views: 11060, likes: 645, bought: 120 },
    { name: 'Ode floor Lamp', category: 'floor', price: 610000, badge: 'Editor', description: 'Architectural floor piece with presence.', views: 17680, likes: 1290, bought: 302 },
    { name: 'Crest desk Lamp', category: 'desk', price: 185000, badge: 'Popular', description: 'Work Lamp tuned for clean desk setups.', views: 9600, likes: 455, bought: 88 },
    { name: 'Fable pendant', category: 'pendant', price: 265000, badge: 'Eco', description: 'Gentle hanging light for layered rooms.', views: 12630, likes: 820, bought: 173 },
    { name: 'Elm table Lamp', category: 'table', price: 220000, badge: 'New', description: 'Compact glow for calm nightstands.', views: 10110, likes: 530, bought: 99 },
    { name: 'Boreal floor Lamp', category: 'floor', price: 590000, badge: 'Top pick', description: 'Tall Lamp with a gallery-like silhouette.', views: 18940, likes: 1410, bought: 337 },
  ].map((product, index) => ({ ...product, colors: colorsForIndex(index) }));
  const pageSize = 12;
  let activeFilter = 'all';
  let visibleCount = pageSize;
  const defaultDirectionByFilter = {
    price: 'asc',
    views: 'desc',
    likes: 'desc',
    bought: 'desc'
  };
  let sortDirection = defaultDirectionByFilter[activeFilter] || 'desc';

  const sortedProducts = (filter, direction) => {
    const baseList = [...catalogProducts];
    if (filter === 'price') return baseList.sort((a, b) => direction === 'asc' ? a.price - b.price : b.price - a.price);
    if (filter === 'views') return baseList.sort((a, b) => direction === 'asc' ? a.views - b.views : b.views - a.views);
    if (filter === 'likes') return baseList.sort((a, b) => direction === 'asc' ? a.likes - b.likes : b.likes - a.likes);
    if (filter === 'bought') return baseList.sort((a, b) => direction === 'asc' ? a.bought - b.bought : b.bought - a.bought);
    return baseList;
  };

  const updateSortToggle = () => {
    if (!catalogSortToggle) {
      return;
    }
    const isAscending = sortDirection === 'asc';
    const icon = catalogSortToggle.querySelector('.catalog-toggle-icon');
    const text = catalogSortToggle.querySelector('.catalog-toggle-text');
    if (icon) {
      icon.textContent = isAscending ? '↑' : '↓';
    }
    if (text) {
      text.textContent = isAscending ? 'Increase' : 'Decrease';
    }
    catalogSortToggle.setAttribute('aria-pressed', isAscending ? 'true' : 'false');
    catalogSortToggle.disabled = activeFilter === 'all';
  };

  const renderCatalog = filter => {
    const filteredProducts = sortedProducts(filter, sortDirection);
    const visibleProducts = filteredProducts.slice(0, visibleCount);

    catalogGrid.innerHTML = visibleProducts.map((product, index) => {
      const cardClasses = ['catalog-product'];

      return `
        <article class="${cardClasses.join(' ')} reveal visible" data-product-card>
          <div class="catalog-media">
            <div class="img-placeholder" role="img" aria-label="${product.name} product image" tabindex="0">
              <svg width="34" height="34" fill="none" stroke="currentColor" stroke-width="1" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              Product image
            </div>
            <button class="catalog-add-btn" type="button" aria-label="Add ${product.name} to cart" onclick="addToCart(this, '${product.name}')">
              <svg width="14" height="14" fill="none" stroke="#fff" stroke-width="2.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </button>
          </div>
          <div class="catalog-product-body">
            <div class="catalog-product-top">
              <div>
                <div class="catalog-product-title">${product.name}</div>
                <div class="catalog-product-subtitle">${product.description}</div>
              </div>
              <span class="catalog-product-badge">${product.badge}</span>
            </div>
            <div class="catalog-stats">
              <span>${product.views.toLocaleString()} views</span>
              <span>${product.likes.toLocaleString()} likes</span>
              <span>${product.bought} bought</span>
            </div>
            ${renderSwatchesHTML(product.colors, { light: true })}
            <div class="catalog-product-price-row">
              <div class="catalog-product-price">${product.price.toLocaleString('vi-VN')} ₫</div>
              <a class="catalog-product-link" href="index.html#collection">View</a>
            </div>
          </div>
        </article>
      `;
    }).join('');

    if (catalogCount) {
      catalogCount.textContent = `${visibleProducts.length} of ${filteredProducts.length} products visible`;
    }

    const catalogMore = document.getElementById('catalogMore');
    if (catalogMore) {
      catalogMore.style.display = visibleCount < filteredProducts.length ? 'inline-flex' : 'none';
    }

    if (typeof observer !== 'undefined' && observer) {
      catalogGrid.querySelectorAll('.reveal').forEach(node => observer.observe(node));
    }
  };

  const setActiveFilter = filter => {
    activeFilter = filter;
    visibleCount = pageSize;
    if (defaultDirectionByFilter[filter]) {
      sortDirection = defaultDirectionByFilter[filter];
    }
    catalogChips.forEach(chip => chip.classList.toggle('active', chip.dataset.filter === filter));
    updateSortToggle();
    renderCatalog(activeFilter);
  };

  catalogChips.forEach(chip => {
    chip.addEventListener('click', () => setActiveFilter(chip.dataset.filter));
  });

  if (catalogSortToggle) {
    catalogSortToggle.addEventListener('click', () => {
      sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
      updateSortToggle();
      renderCatalog(activeFilter);
    });
  }

  const catalogMore = document.getElementById('catalogMore');
  if (catalogMore) {
    catalogMore.addEventListener('click', () => {
      visibleCount = Math.min(visibleCount + 8, catalogProducts.length);
      renderCatalog(activeFilter);
    });
  }

  updateSortToggle();

  renderCatalog(activeFilter);
}