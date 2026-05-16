import { initCursor, initLoader, initNav, initReveal, initSmoothScroll, initToast } from "./site.js";
import { addToCart } from "./cart-store.js";
import { getProducts, getProductById } from "../data/products.js";
import { formatMoney } from "./utils/money.js";

initLoader();
initCursor();
initNav();
initSmoothScroll();
const revealObserver = initReveal();

const showToast = initToast();

const addProductToCart = async productId => {
  const product = await getProductById(productId);
  addToCart(productId, 1);
  const name = product ? product.name : "Item";
  showToast(`"${name}" added to cart`);
};

window.addToCart = addProductToCart;

const catalogGrid = document.getElementById("catalogGrid");
const catalogCount = document.getElementById("catalogCount");
const catalogChips = document.querySelectorAll("[data-filter]");
const catalogSortToggle = document.getElementById("catalogSortToggle");

const initCatalog = async () => {
  if (!catalogGrid) {
    return;
  }

  const catalogProducts = await getProducts();
  const pageSize = 12;
  let activeFilter = "all";
  let visibleCount = pageSize;
  const defaultDirectionByFilter = {
    price: "asc",
    views: "desc",
    likes: "desc",
    bought: "desc"
  };
  let sortDirection = defaultDirectionByFilter[activeFilter] || "desc";

  const sortedProducts = (filter, direction) => {
    const baseList = [...catalogProducts];
    if (filter === "price") {
      return baseList.sort((a, b) => direction === "asc" ? a.priceCents - b.priceCents : b.priceCents - a.priceCents);
    }
    if (filter === "views") {
      return baseList.sort((a, b) => direction === "asc" ? a.views - b.views : b.views - a.views);
    }
    if (filter === "likes") {
      return baseList.sort((a, b) => direction === "asc" ? a.likes - b.likes : b.likes - a.likes);
    }
    if (filter === "bought") {
      return baseList.sort((a, b) => direction === "asc" ? a.bought - b.bought : b.bought - a.bought);
    }
    return baseList;
  };

  const updateSortToggle = () => {
    if (!catalogSortToggle) {
      return;
    }
    const isAscending = sortDirection === "asc";
    const icon = catalogSortToggle.querySelector(".catalog-toggle-icon");
    const text = catalogSortToggle.querySelector(".catalog-toggle-text");
    if (icon) {
      icon.textContent = isAscending ? "^" : "v";
    }
    if (text) {
      text.textContent = isAscending ? "Increase" : "Decrease";
    }
    catalogSortToggle.setAttribute("aria-pressed", isAscending ? "true" : "false");
    catalogSortToggle.disabled = activeFilter === "all";
  };

  const renderCatalog = filter => {
    const filteredProducts = sortedProducts(filter, sortDirection);
    const visibleProducts = filteredProducts.slice(0, visibleCount);

    catalogGrid.innerHTML = visibleProducts.map(product => {
      return `
        <article class="catalog-product reveal visible">
          <div class="catalog-media">
            <div class="img-placeholder">
              <svg width="34" height="34" fill="none" stroke="currentColor" stroke-width="1" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              Image placeholder
            </div>
            <button class="catalog-add-btn" type="button" data-product-id="${product.id}" aria-label="Add ${product.name} to cart">
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
            <div class="catalog-product-price-row">
              <div class="catalog-product-price">${formatMoney(product.priceCents)}</div>
              <a class="catalog-product-link" href="index.html#collection">View</a>
            </div>
          </div>
        </article>
      `;
    }).join("");

    if (catalogCount) {
      catalogCount.textContent = `${visibleProducts.length} of ${filteredProducts.length} products visible`;
    }

    const catalogMore = document.getElementById("catalogMore");
    if (catalogMore) {
      catalogMore.style.display = visibleCount < filteredProducts.length ? "inline-flex" : "none";
    }

    catalogGrid.querySelectorAll(".catalog-add-btn").forEach(button => {
      button.addEventListener("click", () => addProductToCart(button.dataset.productId));
    });

    if (revealObserver) {
      catalogGrid.querySelectorAll(".reveal").forEach(node => revealObserver.observe(node));
    }
  };

  const setActiveFilter = filter => {
    activeFilter = filter;
    visibleCount = pageSize;
    if (defaultDirectionByFilter[filter]) {
      sortDirection = defaultDirectionByFilter[filter];
    }
    catalogChips.forEach(chip => chip.classList.toggle("active", chip.dataset.filter === filter));
    updateSortToggle();
    renderCatalog(activeFilter);
  };

  catalogChips.forEach(chip => {
    chip.addEventListener("click", () => setActiveFilter(chip.dataset.filter));
  });

  if (catalogSortToggle) {
    catalogSortToggle.addEventListener("click", () => {
      sortDirection = sortDirection === "asc" ? "desc" : "asc";
      updateSortToggle();
      renderCatalog(activeFilter);
    });
  }

  const catalogMore = document.getElementById("catalogMore");
  if (catalogMore) {
    catalogMore.addEventListener("click", () => {
      visibleCount = Math.min(visibleCount + 8, catalogProducts.length);
      renderCatalog(activeFilter);
    });
  }

  updateSortToggle();
  renderCatalog(activeFilter);
};

initCatalog();
