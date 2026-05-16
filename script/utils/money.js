const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2
});

const formatMoney = cents => currencyFormatter.format(cents / 100);

const calcSubtotal = lineItems => lineItems.reduce((sum, item) => sum + item.priceCents * item.quantity, 0);

const calcShipping = subtotalCents => {
  if (subtotalCents === 0) {
    return 0;
  }
  return subtotalCents >= 30000 ? 0 : 2500;
};

const calcTax = subtotalCents => Math.round(subtotalCents * 0.05);

const calcTotal = (subtotalCents, shippingCents, taxCents) => subtotalCents + shippingCents + taxCents;

export { formatMoney, calcSubtotal, calcShipping, calcTax, calcTotal };
