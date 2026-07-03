ShopEase.requireLogin();

async function render() {
  const orders = await ShopEase.call('/orders');
  document.getElementById('orders-message').textContent = orders.length ? '' : 'You have no orders yet.';
  document.getElementById('orders-body').innerHTML = orders.map((o) => `
    <tr data-testid="order-row" data-order-id="${o.id}">
      <td>${o.id}</td><td>${new Date(o.createdAt).toLocaleDateString()}</td>
      <td data-testid="order-status">${o.status}</td>
      <td data-testid="order-total">${ShopEase.money(o.total)}</td>
      <td>${['PENDING', 'PAID'].includes(o.status) ? `<button data-testid="cancel-order" data-id="${o.id}">Cancel</button>` : ''}</td>
    </tr>`).join('');
  document.querySelectorAll('[data-testid="cancel-order"]').forEach((btn) => btn.addEventListener('click', async () => {
    await ShopEase.call(`/orders/${btn.dataset.id}/cancel`, { method: 'POST' });
    await render();
  }));
}

document.addEventListener('DOMContentLoaded', render);
