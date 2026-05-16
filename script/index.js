import { initCursor, initLoader, initNav, initReveal, initSmoothScroll, initToast } from "./site.js";
import { addToCart } from "./cart-store.js";
import { getProductById } from "../data/products.js";

initLoader();
initCursor();
initNav();
initReveal();
initSmoothScroll();

const showToast = initToast();

const addProductToCart = async productId => {
  const product = await getProductById(productId);
  addToCart(productId, 1);
  const name = product ? product.name : "Item";
  showToast(`"${name}" added to cart`);
};

window.addToCart = addProductToCart;

const logos = [
  { mark: "A", name: "Arthaus Studio" },
  { mark: "N", name: "Nordic Light Co" },
  { mark: "M", name: "Maison Eclat" },
  { mark: "V", name: "Vantage Living" },
  { mark: "L", name: "Lux Interieurs" },
  { mark: "O", name: "Orbit Objects" },
  { mark: "F", name: "Form & Fire" },
  { mark: "H", name: "Haven Home" },
  { mark: "E", name: "Ember Design" },
  { mark: "C", name: "Celo Collective" }
];

const track = document.getElementById("tickerTrack");
if (track) {
  const doubled = [...logos, ...logos];
  doubled.forEach(logo => {
    const el = document.createElement("div");
    el.className = "ticker-logo";
    el.innerHTML = `<span class="logo-mark">${logo.mark}</span>${logo.name}`;
    el.addEventListener("mouseenter", () => {
      track.style.animationPlayState = "paused";
    });
    el.addEventListener("mouseleave", () => {
      track.style.animationPlayState = "running";
    });
    track.appendChild(el);
  });
}

const reviewViewport = document.querySelector(".testi-viewport");
const reviewPrev = document.querySelector(".review-prev");
const reviewNext = document.querySelector(".review-next");

if (reviewViewport) {
  const step = () => Math.max(320, Math.round(reviewViewport.clientWidth * 0.86));
  const scrollReviews = direction => {
    reviewViewport.scrollBy({ left: direction * step(), behavior: "smooth" });
  };

  if (reviewPrev) {
    reviewPrev.addEventListener("click", () => scrollReviews(-1));
  }
  if (reviewNext) {
    reviewNext.addEventListener("click", () => scrollReviews(1));
  }
}
