import { initCursor, initLoader, initNav } from "./site.js";
import { getCart, clearCart } from "./cart-store.js";
import { getProducts } from "../data/products.js";
import { formatMoney, calcSubtotal, calcShipping, calcTax, calcTotal } from "./utils/money.js";
import { saveOrder } from "./order-store.js";

initLoader();
initCursor();
initNav();

const checkoutForm = document.getElementById("checkoutForm");
const checkoutEmpty = document.getElementById("checkoutEmpty");
const summaryItems = document.getElementById("summaryItems");
const summarySubtotal = document.getElementById("summarySubtotal");
const summaryShipping = document.getElementById("summaryShipping");
const summaryTax = document.getElementById("summaryTax");
const summaryTotal = document.getElementById("summaryTotal");
const placeOrderBtn = document.getElementById("placeOrderBtn");

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

const getShippingMethod = () => {
  const selection = document.querySelector("input[name='shippingMethod']:checked");
  return selection ? selection.value : "standard";
};

const getShippingCents = subtotalCents => {
  const baseShipping = calcShipping(subtotalCents);
  const method = getShippingMethod();
  return method === "express" ? baseShipping + 2500 : baseShipping;
};

const updateSummary = async () => {
  const cart = getCart();
  const lineItems = await buildLineItems(cart);

  if (checkoutEmpty) {
    checkoutEmpty.classList.toggle("is-visible", lineItems.length === 0);
  }
  if (checkoutForm) {
    checkoutForm.style.display = lineItems.length === 0 ? "none" : "grid";
  }
  if (placeOrderBtn) {
    placeOrderBtn.disabled = lineItems.length === 0;
  }

  if (summaryItems) {
    summaryItems.innerHTML = lineItems
      .map(item => `
        <div class="summary-item">
          <span>${item.name} x ${item.quantity}</span>
          <span>${formatMoney(item.priceCents * item.quantity)}</span>
        </div>
      `)
      .join("");
  }

  const subtotalCents = calcSubtotal(lineItems);
  const shippingCents = getShippingCents(subtotalCents);
  const taxCents = calcTax(subtotalCents);
  const totalCents = calcTotal(subtotalCents, shippingCents, taxCents);

  if (summarySubtotal) {
    summarySubtotal.textContent = formatMoney(subtotalCents);
  }
  if (summaryShipping) {
    summaryShipping.textContent = shippingCents === 0 ? "Free" : formatMoney(shippingCents);
  }
  if (summaryTax) {
    summaryTax.textContent = formatMoney(taxCents);
  }
  if (summaryTotal) {
    summaryTotal.textContent = formatMoney(totalCents);
  }

  return { lineItems, subtotalCents, shippingCents, taxCents, totalCents };
};

const buildTimeline = (createdAt, method) => {
  const baseDate = new Date(createdAt);
  const dayOffsets = method === "express" ? [0, 1, 2, 3, 4] : [0, 1, 3, 4, 6];
  const labels = ["Order placed", "Packed", "Shipped", "Out for delivery", "Delivered"];

  return labels.map((label, index) => {
    const date = new Date(baseDate.getTime() + dayOffsets[index] * 24 * 60 * 60 * 1000);
    return { label, date: date.toISOString() };
  });
};

if (checkoutForm) {
  checkoutForm.addEventListener("submit", async event => {
    event.preventDefault();
    const { lineItems, subtotalCents, shippingCents, taxCents, totalCents } = await updateSummary();
    if (!lineItems.length) {
      return;
    }

    const formData = new FormData(checkoutForm);
    const shippingMethod = getShippingMethod();
    const createdAt = new Date().toISOString();

    const order = {
      id: `LL-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
      createdAt,
      shippingMethod,
      customer: {
        fullName: formData.get("fullName"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        address: formData.get("address"),
        city: formData.get("city"),
        country: formData.get("country"),
        postal: formData.get("postal")
      },
      items: lineItems,
      totals: {
        subtotalCents,
        shippingCents,
        taxCents,
        totalCents
      },
      timeline: buildTimeline(createdAt, shippingMethod)
    };

    saveOrder(order);
    clearCart();
    window.location.href = "tracking.html";
  });
}

const shippingInputs = document.querySelectorAll("input[name='shippingMethod']");
shippingInputs.forEach(input => {
  input.addEventListener("change", () => updateSummary());
});

updateSummary();
