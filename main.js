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
  toastMsg.textContent = msg;
  toast.style.transform = 'translateY(0)';
  toast.style.opacity = '1';
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.style.transform = 'translateY(80px)';
    toast.style.opacity = '0';
  }, 2800);
}
function addToCart(name) { showToast(`"${name}" added to cart ✓`); }
function showCartToast() { showToast('Opening collection...'); }

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

if (catalogGrid) {
  const catalogProducts = [
    { name: 'Aura Glass Lamp', category: 'table', price: 630, badge: 'Bestseller', description: 'Hand-blown glass with a warm core glow.', featured: true, views: 18420, likes: 1240, bought: 356 },
    { name: 'Velvet Shine Lamp', category: 'table', price: 240, badge: 'New', description: 'Soft presence for desks and side tables.', views: 14220, likes: 1080, bought: 241 },
    { name: 'Lumière Luxe Lamp', category: 'table', price: 210, badge: 'Popular', description: 'Ambient lamp with a calm silhouette.', views: 16640, likes: 980, bought: 188 },
    { name: 'Zenith Luxe Lamp', category: 'floor', price: 180, badge: 'Sale', description: 'Tall, sculptural floor light for corners.', views: 12140, likes: 760, bought: 160 },
    { name: 'Halo Desk Lamp', category: 'desk', price: 240, badge: 'New', description: 'Compact and modern for focused work.', views: 11190, likes: 615, bought: 132 },
    { name: 'Moss Floor Lamp', category: 'floor', price: 380, badge: 'Editor', description: 'Warm vertical glow with grounded presence.', views: 15880, likes: 1180, bought: 299 },
    { name: 'Cove Pendant', category: 'pendant', price: 210, badge: 'Top pick', description: 'Sculptural pendant for dining and island spaces.', views: 17230, likes: 1390, bought: 312 },
    { name: 'Arc Ember Table', category: 'table', price: 320, badge: 'Craft', description: 'Rounded lamp for softer interiors.', views: 10230, likes: 540, bought: 90 },
    { name: 'Nova Ring Light', category: 'desk', price: 190, badge: 'Eco', description: 'Minimal lamp built for compact spaces.', views: 9300, likes: 420, bought: 75 },
    { name: 'Dune Floor Glow', category: 'floor', price: 470, badge: 'Limited', description: 'Tall diffuser with a warm halo edge.', views: 18910, likes: 1490, bought: 324 },
    { name: 'Orbit Reading Lamp', category: 'desk', price: 160, badge: 'New', description: 'Directional lamp for reading corners.', views: 8800, likes: 350, bought: 68 },
    { name: 'Luna Pendant', category: 'pendant', price: 260, badge: 'Popular', description: 'Quiet form that floats above the room.', views: 14320, likes: 970, bought: 210 },
    { name: 'Milo Brass Lamp', category: 'table', price: 295, badge: 'Eco', description: 'Brass-accented glow for bedside use.', views: 11980, likes: 740, bought: 156 },
    { name: 'Sora Floor Arc', category: 'floor', price: 520, badge: 'Bestseller', description: 'Arched floor lamp with editorial scale.', views: 20340, likes: 1670, bought: 410 },
    { name: 'Quill Desk Beam', category: 'desk', price: 175, badge: 'New', description: 'Precision lighting with a clean profile.', views: 8460, likes: 390, bought: 71 },
    { name: 'Pine Pendant', category: 'pendant', price: 225, badge: 'Craft', description: 'Natural balance for kitchen and lounge areas.', views: 14110, likes: 860, bought: 198 },
    { name: 'Aster Side Lamp', category: 'table', price: 205, badge: 'Sale', description: 'Side-table companion with warm diffusion.', views: 10620, likes: 680, bought: 115 },
    { name: 'Echo Floor Lamp', category: 'floor', price: 450, badge: 'Editor', description: 'Low-contrast form that blends into interiors.', views: 14750, likes: 1020, bought: 206 },
    { name: 'Ridge Desk Lamp', category: 'desk', price: 155, badge: 'Eco', description: 'Small footprint with a focused beam.', views: 7900, likes: 310, bought: 54 },
    { name: 'Noa Pendant', category: 'pendant', price: 240, badge: 'Popular', description: 'A soft hanging sphere for gentle light.', views: 13020, likes: 890, bought: 186 },
    { name: 'Sol Table Lamp', category: 'table', price: 275, badge: 'New', description: 'Quiet glow with a clean circular form.', views: 11590, likes: 710, bought: 148 },
    { name: 'Harbor Floor Lamp', category: 'floor', price: 560, badge: 'Bestseller', description: 'A large anchor piece for open rooms.', views: 19720, likes: 1560, bought: 378 },
    { name: 'Bram Desk Light', category: 'desk', price: 165, badge: 'Craft', description: 'Slim task light with warm contrast.', views: 8200, likes: 340, bought: 61 },
    { name: 'Mira Pendant', category: 'pendant', price: 230, badge: 'Sale', description: 'Simple overhead light with soft edges.', views: 12340, likes: 765, bought: 137 },
    { name: 'Roon Table Lamp', category: 'table', price: 310, badge: 'Limited', description: 'Rounded base and diffused shade glow.', views: 11060, likes: 645, bought: 120 },
    { name: 'Ode Floor Lamp', category: 'floor', price: 610, badge: 'Editor', description: 'Architectural floor piece with presence.', views: 17680, likes: 1290, bought: 302 },
    { name: 'Crest Desk Lamp', category: 'desk', price: 185, badge: 'Popular', description: 'Work lamp tuned for clean desk setups.', views: 9600, likes: 455, bought: 88 },
    { name: 'Fable Pendant', category: 'pendant', price: 265, badge: 'Eco', description: 'Gentle hanging light for layered rooms.', views: 12630, likes: 820, bought: 173 },
    { name: 'Elm Table Lamp', category: 'table', price: 220, badge: 'New', description: 'Compact glow for calm nightstands.', views: 10110, likes: 530, bought: 99 },
    { name: 'Boreal Floor Lamp', category: 'floor', price: 590, badge: 'Top pick', description: 'Tall lamp with a gallery-like silhouette.', views: 18940, likes: 1410, bought: 337 },
  ];
  const pageSize = 12;
  let activeFilter = 'all';
  let visibleCount = pageSize;

  const sortedProducts = filter => {
    const baseList = [...catalogProducts];
    if (filter === 'price') return baseList.sort((a, b) => a.price - b.price);
    if (filter === 'views') return baseList.sort((a, b) => b.views - a.views);
    if (filter === 'likes') return baseList.sort((a, b) => b.likes - a.likes);
    if (filter === 'bought') return baseList.sort((a, b) => b.bought - a.bought);
    return baseList;
  };

  const renderCatalog = filter => {
    const filteredProducts = sortedProducts(filter);
    const visibleProducts = filteredProducts.slice(0, visibleCount);

    catalogGrid.innerHTML = visibleProducts.map((product, index) => {
      const cardClasses = ['catalog-product'];

      return `
        <article class="${cardClasses.join(' ')} reveal visible">
          <div class="img-placeholder">
            <svg width="34" height="34" fill="none" stroke="currentColor" stroke-width="1" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            Image placeholder
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
            <div class="catalog-product-price-row">
              <div class="catalog-product-price">$${product.price}</div>
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
    catalogChips.forEach(chip => chip.classList.toggle('active', chip.dataset.filter === filter));
    renderCatalog(activeFilter);
  };

  catalogChips.forEach(chip => {
    chip.addEventListener('click', () => setActiveFilter(chip.dataset.filter));
  });

  const catalogMore = document.getElementById('catalogMore');
  if (catalogMore) {
    catalogMore.addEventListener('click', () => {
      visibleCount = Math.min(visibleCount + 8, catalogProducts.length);
      renderCatalog(activeFilter);
    });
  }

  renderCatalog(activeFilter);
}
