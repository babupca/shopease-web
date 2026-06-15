ShopEase.requireLogin();

async function render() {
  const cart = await ShopEase.call('/cart');
  document.getElementById('subtotal').textContent = ShopEase.money(cart.subtotal);
  document.getElementById('cart-body').innerHTML = cart.items.length
    ? cart.items.map((l) => `
      <tr data-testid="cart-row" data-product-id="${l.productId}">
        <td>${l.name}</td><td>${ShopEase.money(l.unitPrice)}</td>
        <td><input type="number" min="0" max="10" value="${l.qty}" data-testid="cart-qty" data-id="${l.productId}" aria-label="Quantity for ${l.name}"></td>
        <td data-testid="line-total">${ShopEase.money(l.lineTotal)}</td>
        <td><button data-testid="remove-item" data-id="${l.productId}">Remove</button></td>
      </tr>`).join('')
    : '<tr><td colspan="5" data-testid="cart-empty">Your cart is empty</td></tr>';

  document.querySelectorAll('[data-testid="cart-qty"]').forEach((input) => input.addEventListener('change', async () => {
    await mutate(`/cart/items/${input.dataset.id}`, 'PATCH', { qty: Number(input.value) });
  }));
  document.querySelectorAll('[data-testid="remove-item"]').forEach((btn) => btn.addEventListener('click', async () => {
    await mutate(`/cart/items/${btn.dataset.id}`, 'DELETE');
  }));
}

async function mutate(path, method, body) {
  const msg = document.getElementById('cart-message');
  msg.textContent = '';
  try {
    await ShopEase.call(path, { method, body });
  } catch (err) {
    msg.textContent = err.message;
  }
  await render();
}

document.addEventListener('DOMContentLoaded', render);
