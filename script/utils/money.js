const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0
});

const formatMoney = amount => currencyFormatter.format(amount);

const calcSubtotal = lineItems => lineItems.reduce((sum, item) => sum + item.priceCents * item.quantity, 0);

const calcShipping = subtotalCents => {
  if (subtotalCents === 0) {
    return 0;
  }
  return 50000; // Flat fee of 50,000 ₫
};

const calcTax = subtotalCents => Math.round(subtotalCents * 0.05);

const calcTotal = (subtotalCents, shippingCents, taxCents) => subtotalCents + shippingCents + taxCents;

export { formatMoney, calcSubtotal, calcShipping, calcTax, calcTotal };
