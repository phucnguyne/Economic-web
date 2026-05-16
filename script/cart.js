import { initCursor, initLoader, initNav } from "./site.js";
import { getCart, updateQuantity, removeFromCart } from "./cart-store.js";
import { getProducts } from "../data/products.js";
import { formatMoney, calcSubtotal, calcShipping, calcTax, calcTotal } from "./utils/money.js";

initLoader();
initCursor();
initNav();

const cartItems = document.getElementById("cartItems");
const cartEmpty = document.getElementById("cartEmpty");
const subtotalValue = document.getElementById("subtotalValue");
const shippingValue = document.getElementById("shippingValue");
const taxValue = document.getElementById("taxValue");
const totalValue = document.getElementById("totalValue");
const checkoutBtn = document.getElementById("checkoutBtn");
const heroCheckoutBtn = document.getElementById("heroCheckoutBtn");

let cachedProductMap = null;

const ensureProductMap = async () => {
  if (cachedProductMap) {
    return cachedProductMap;
  }
  const products = await getProducts();
  cachedProductMap = new Map(products.map(product => [product.id, product]));
  return cachedProductMap;
};

const buildLineItems = async cart => {
  const productMap = await ensureProductMap();
  return cart
    .map(item => {
      const product = productMap.get(item.id);
      if (!product) {
        return null;
      }
      return { ...product, quantity: item.quantity };
    })
    .filter(Boolean);
};

const updateSummary = lineItems => {
  const subtotalCents = calcSubtotal(lineItems);
  const shippingCents = calcShipping(subtotalCents);
  const taxCents = calcTax(subtotalCents);
  const totalCents = calcTotal(subtotalCents, shippingCents, taxCents);

  if (subtotalValue) {
    subtotalValue.textContent = formatMoney(subtotalCents);
  }
  if (shippingValue) {
    shippingValue.textContent = shippingCents === 0 ? "Free" : formatMoney(shippingCents);
  }
  if (taxValue) {
    taxValue.textContent = formatMoney(taxCents);
  }
  if (totalValue) {
    totalValue.textContent = formatMoney(totalCents);
  }

  const isEmpty = lineItems.length === 0;
  if (checkoutBtn) {
    checkoutBtn.disabled = isEmpty;
  }
  if (heroCheckoutBtn) {
    heroCheckoutBtn.disabled = isEmpty;
  }
};

const renderCart = async () => {
  if (!cartItems) {
    return;
  }
  const cart = getCart();
  const lineItems = await buildLineItems(cart);

  if (cartEmpty) {
    cartEmpty.classList.toggle("is-visible", lineItems.length === 0);
  }

  cartItems.innerHTML = lineItems
    .map(item => {
      return `
        <article class="cart-item" data-id="${item.id}">
          <div class="cart-item-media">
            <div class="img-placeholder">
              <svg width="30" height="30" fill="none" stroke="currentColor" stroke-width="1" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              Lamp image
            </div>
          </div>
          <div class="cart-item-info">
            <div class="cart-item-title">${item.name}</div>
            <div class="cart-item-sub">${item.description}</div>
            <div class="cart-item-meta">
              <span>${item.badge} pick</span>
              <span>${formatMoney(item.priceCents)} each</span>
            </div>
          </div>
          <div class="cart-item-actions">
            <div class="qty-control">
              <button type="button" data-action="decrease" data-id="${item.id}" aria-label="Decrease quantity">-</button>
              <span class="qty-value">${item.quantity}</span>
              <button type="button" data-action="increase" data-id="${item.id}" aria-label="Increase quantity">+</button>
            </div>
            <div class="cart-item-price">${formatMoney(item.priceCents * item.quantity)}</div>
            <button class="cart-remove" type="button" data-action="remove" data-id="${item.id}">Remove</button>
          </div>
        </article>
      `;
    })
    .join("");

  updateSummary(lineItems);
};

if (cartItems) {
  cartItems.addEventListener("click", event => {
    const actionButton = event.target.closest("[data-action]");
    if (!actionButton) {
      return;
    }
    const productId = actionButton.dataset.id;
    if (!productId) {
      return;
    }
    const cart = getCart();
    const item = cart.find(entry => entry.id === productId);
    if (!item) {
      return;
    }

    if (actionButton.dataset.action === "increase") {
      updateQuantity(productId, item.quantity + 1);
    }
    if (actionButton.dataset.action === "decrease") {
      if (item.quantity <= 1) {
        removeFromCart(productId);
      } else {
        updateQuantity(productId, item.quantity - 1);
      }
    }
    if (actionButton.dataset.action === "remove") {
      removeFromCart(productId);
    }
    renderCart();
  });
}

const goToCheckout = () => {
  const cart = getCart();
  if (!cart.length) {
    return;
  }
  window.location.href = "checkout.html";
};

if (checkoutBtn) {
  checkoutBtn.addEventListener("click", goToCheckout);
}
if (heroCheckoutBtn) {
  heroCheckoutBtn.addEventListener("click", goToCheckout);
}

renderCart();
