import { initCursor, initLoader, initNav } from "./site.js";
import { getOrder } from "./order-store.js";
import { formatMoney } from "./utils/money.js";

initLoader();
initCursor();
initNav();

const trackingEmpty = document.getElementById("trackingEmpty");
const trackingDetails = document.getElementById("trackingDetails");
const orderIdEl = document.getElementById("orderId");
const orderDateEl = document.getElementById("orderDate");
const orderTotalEl = document.getElementById("orderTotal");
const orderAddressEl = document.getElementById("orderAddress");
const trackingItems = document.getElementById("trackingItems");
const trackingTimeline = document.getElementById("trackingTimeline");
const deliveryEstimate = document.getElementById("deliveryEstimate");

const order = getOrder();

const formatDate = value => {
  const date = new Date(value);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

if (!order) {
  if (trackingEmpty) {
    trackingEmpty.classList.add("is-visible");
  }
  if (trackingDetails) {
    trackingDetails.style.display = "none";
  }
} else {
  if (trackingEmpty) {
    trackingEmpty.classList.remove("is-visible");
  }
  if (trackingDetails) {
    trackingDetails.style.display = "grid";
  }

  if (orderIdEl) {
    orderIdEl.textContent = order.id;
  }
  if (orderDateEl) {
    orderDateEl.textContent = `Placed ${formatDate(order.createdAt)}`;
  }
  if (orderTotalEl) {
    orderTotalEl.textContent = formatMoney(order.totals.totalCents);
  }
  if (orderAddressEl) {
    orderAddressEl.textContent = `${order.customer.fullName} - ${order.customer.address}, ${order.customer.city} - ${order.customer.country}`;
  }
  if (trackingItems) {
    trackingItems.innerHTML = order.items
      .map(item => `
        <div class="details-item">
          <span>${item.name} x ${item.quantity}</span>
          <span>${formatMoney(item.priceCents * item.quantity)}</span>
        </div>
      `)
      .join("");
  }

  if (trackingTimeline) {
    const now = Date.now();
    const timeline = order.timeline || [];
    let currentIndex = 0;
    timeline.forEach((step, index) => {
      if (new Date(step.date).getTime() <= now) {
        currentIndex = index;
      }
    });

    trackingTimeline.innerHTML = timeline
      .map((step, index) => {
        const stateClass = index < currentIndex ? "done" : index === currentIndex ? "current" : "";
        return `
          <li class="timeline-step ${stateClass}">
            <span class="timeline-dot"></span>
            <div class="timeline-content">
              <strong>${step.label}</strong>
              <span>${formatDate(step.date)}</span>
            </div>
          </li>
        `;
      })
      .join("");

    if (deliveryEstimate && timeline.length) {
      const lastStep = timeline[timeline.length - 1];
      deliveryEstimate.textContent = `Estimated delivery: ${formatDate(lastStep.date)}`;
    }
  }
}
