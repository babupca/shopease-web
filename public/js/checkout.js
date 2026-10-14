ShopEase.requireLogin();

function formValues() {
  return {
    region: document.getElementById('region').value,
    promoCode: document.getElementById('promo').value.trim() || undefined,
    cardToken: document.getElementById('card').value
  };
}

function showResult(text, ok) {
  const el = document.getElementById('checkout-result');
  el.setAttribute('role', ok ? 'status' : 'alert');
  el.textContent = text;
  el.className = ok ? 'success' : 'error';
}

async function showQuote() {
  try {
    const q = await ShopEase.call('/checkout/quote', { method: 'POST', body: formValues() });
    document.getElementById('summary').innerHTML = `
      <p>Subtotal: <span data-testid="quote-subtotal">${ShopEase.money(q.subtotal)}</span></p>
      <p>Discount: <span data-testid="quote-discount">-${ShopEase.money(q.discount)}</span></p>
      <p>Shipping: <span data-testid="quote-shipping">${ShopEase.money(q.shipping)}</span></p>
      <p>Tax: <span data-testid="quote-tax">${ShopEase.money(q.tax)}</span></p>
      <p><strong>Total: <span data-testid="quote-total">${ShopEase.money(q.total)}</span></strong></p>`;
  } catch (err) {
    showResult(err.message, false);
  }
}

async function placeOrder(express) {
  try {
    const order = await ShopEase.call('/checkout', { method: 'POST', body: { ...formValues(), express } });
    showResult(`Order ${order.id} confirmed. Total ${ShopEase.money(order.total)}`, true);
  } catch (err) {
    showResult(err.message, false);
  }
}

document.getElementById('quote-btn').addEventListener('click', showQuote);
document.getElementById('checkout-form').addEventListener('submit', (e) => { e.preventDefault(); placeOrder(false); });
document.getElementById('express-btn').addEventListener('click', () => placeOrder(true));

document.addEventListener('DOMContentLoaded', async () => {
  const health = await ShopEase.call('/health');
  document.getElementById('express-btn').hidden = !(health.features && health.features.expressCheckout);
});
