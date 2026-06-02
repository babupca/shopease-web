// Shared API client used by every page.
const ShopEase = {
  token() { return localStorage.getItem('shopease.token'); },
  setToken(t) { if (t) localStorage.setItem('shopease.token', t); else localStorage.removeItem('shopease.token'); },
  async call(path, { method = 'GET', body } = {}) {
    const headers = { 'Content-Type': 'application/json' };
    if (this.token()) headers.Authorization = `Bearer ${this.token()}`;
    const res = await fetch(`/api${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
    const data = res.status === 204 ? null : await res.json();
    if (!res.ok) throw Object.assign(new Error(data.error.message), { code: data.error.code, status: res.status });
    return data;
  },
  money(v) { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v); },
  requireLogin() { if (!this.token()) window.location.href = '/login.html'; },
  renderNav() {
    const el = document.querySelector('[data-testid="nav-auth"]');
    if (!el) return;
    if (this.token()) {
      el.textContent = 'Log out';
      el.href = '#';
      el.onclick = async (e) => { e.preventDefault(); try { await this.call('/auth/logout', { method: 'POST' }); } catch (_) {} this.setToken(null); window.location.href = '/'; };
    }
  }
};
document.addEventListener('DOMContentLoaded', () => ShopEase.renderNav());
