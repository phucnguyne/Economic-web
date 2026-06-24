const CART_KEY = "libra_lumina_cart";

const readCart = () => {
  try {
    const raw = localStorage.getItem(CART_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveCart = cart => {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
};

const getCart = () => readCart();

const addToCart = (productId, quantity = 1) => {
  const cart = readCart();
  const existing = cart.find(item => item.id === productId);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({ id: productId, quantity });
  }
  saveCart(cart);
  return cart;
};

const updateQuantity = (productId, quantity) => {
  const cart = readCart().map(item => ({ ...item }));
  const target = cart.find(item => item.id === productId);
  if (!target) {
    return cart;
  }
  target.quantity = Math.max(1, quantity);
  saveCart(cart);
  return cart;
};

const removeFromCart = productId => {
  const cart = readCart().filter(item => item.id !== productId);
  saveCart(cart);
  return cart;
};

const clearCart = () => {
  localStorage.removeItem(CART_KEY);
};

const getCartCount = () => readCart().reduce((sum, item) => sum + item.quantity, 0);

export { getCart, addToCart, updateQuantity, removeFromCart, clearCart, getCartCount };
