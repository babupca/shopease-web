const { test, expect, uiLogin } = require('./fixtures');

test.describe('Login & session', () => {
  test('[E2E-AUTH-001] invalid credentials show an error', async ({ page }) => {
    await page.goto('/login.html');
    await page.getByTestId('login-email').fill('alice@shopease.example');
    await page.getByTestId('login-password').fill('wrong');
    await page.getByTestId('login-submit').click();
    await expect(page.getByTestId('login-error')).toHaveText('Invalid credentials');
  });

  test('[E2E-AUTH-002] logout returns to an anonymous session', async ({ page }) => {
    await uiLogin(page);
    await page.getByTestId('nav-auth').click();
    await expect(page.getByTestId('nav-auth')).toHaveText('Log in');
  });

  test('[E2E-AUTH-003] protected pages redirect to login after logout', async ({ page }) => {
    await uiLogin(page);
    await page.getByTestId('nav-auth').click();
    await expect(page.getByTestId('nav-auth')).toHaveText('Log in');
    await page.goto('/orders.html');
    await expect(page).toHaveURL(/login\.html/);
  });
});
