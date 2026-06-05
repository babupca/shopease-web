// Product listing page: search, filter, sort and add-to-cart.
async function loadCategories() {
  const select = document.getElementById('category');
  (await ShopEase.call('/categories')).forEach((c) => select.add(new Option(c, c)));
}

async function loadProducts() {
  const params = new URLSearchParams();
  const search = document.getElementById('search').value.trim();
  const category = document.getElementById('category').value;
  const sort = document.getElementById('sort').value;
  if (search) params.set('search', search);
  if (category) params.set('category', category);
  if (sort) params.set('sort', sort);
  params.set('pageSize', '50');
  const { items } = await ShopEase.call(`/products?${params}`);
  const grid = document.getElementById('grid');
  document.getElementById('message').textContent = items.length ? '' : 'No products match your search.';
  grid.innerHTML = items.map((p) => `
    <article class="card" data-testid="product-card" data-product-id="${p.id}">
      <h3 data-testid="product-name">${p.name}</h3>
      <p class="muted">${p.category} · ★ ${p.rating}</p>
      <p class="price" data-testid="product-price">${ShopEase.money(p.price)}</p>
      <button data-testid="add-to-cart" data-id="${p.id}" ${p.stock === 0 ? 'disabled' : ''}>
        ${p.stock === 0 ? 'Out of stock' : 'Add to cart'}</button>
    </article>`).join('');
  grid.querySelectorAll('[data-testid="add-to-cart"]').forEach((btn) => btn.addEventListener('click', () => addToCart(btn.dataset.id)));
}

async function addToCart(productId) {
  if (!ShopEase.token()) return ShopEase.requireLogin();
  try {
    await ShopEase.call('/cart/items', { method: 'POST', body: { productId, qty: 1 } });
    document.getElementById('message').textContent = 'Added to cart';
  } catch (err) {
    document.getElementById('message').textContent = err.message;
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  await loadCategories();
  await loadProducts();
  ['search', 'category', 'sort'].forEach((id) => document.getElementById(id).addEventListener('input', loadProducts));
});
