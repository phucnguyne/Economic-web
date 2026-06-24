const ORDER_KEY = "libra_lumina_order";

const saveOrder = order => {
  localStorage.setItem(ORDER_KEY, JSON.stringify(order));
};

const getOrder = () => {
  try {
    const raw = localStorage.getItem(ORDER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const clearOrder = () => {
  localStorage.removeItem(ORDER_KEY);
};

export { saveOrder, getOrder, clearOrder };
