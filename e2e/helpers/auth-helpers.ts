import { Page, expect } from '@playwright/test';
import { TEST_USERS, TestUser } from './test-users';

/**
 * Robust login helper that detects auth errors early and fails fast
 */
export async function loginUser(
  page: Page,
  user: TestUser = TEST_USERS.standard
): Promise<void> {
  // Navigate to login if not already there
  if (!page.url().includes('/login')) {
    await page.goto('/login');
  }

  // Wait for login form to be ready
  await expect(page.getByLabel('Email')).toBeVisible({ timeout: 5000 });

  // Fill credentials
  await page.getByLabel('Email').fill(user.email);
  await page.getByLabel('Password').fill(user.password);

  // Click login button
  await page.getByRole('button', { name: /log in/i }).click();

  // Wait for either success (navigation) or error
  await Promise.race([
    // Success: navigated away from login
    page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 10000 }),
    // Error: auth error message appears
    page.locator('text=/Firebase.*Error|auth\\/|error|failed/i').waitFor({ timeout: 10000 }),
  ]);

  // Check if we're still on login page (indicates error)
  if (page.url().includes('/login')) {
    // Look for error message
    const errorText = await page.locator('[role="alert"], .error, [class*="error"]').textContent().catch(() => null);
    const pageText = await page.locator('body').textContent();

    // Extract error from page
    const errorMatch = pageText?.match(/Firebase.*Error.*\)|auth\/[a-z-]+/i);
    const errorMessage = errorMatch?.[0] || errorText || 'Unknown login error';

    throw new Error(`Login failed for ${user.email}: ${errorMessage}`);
  }
}

/**
 * Robust signup helper that detects auth errors early and fails fast
 */
export async function signupUser(
  page: Page,
  email: string,
  password: string,
  displayName?: string
): Promise<void> {
  // Navigate to signup if not already there
  if (!page.url().includes('/signup')) {
    await page.goto('/signup');
  }

  // Wait for signup form to be ready
  await expect(page.getByLabel('Email')).toBeVisible({ timeout: 5000 });

  // Fill form
  await page.getByLabel('Email').fill(email);
  await page.getByLabel(/^Password$/).fill(password);
  await page.getByLabel('Confirm Password').fill(password);

  if (displayName) {
    const nameField = page.getByLabel(/display name|name/i);
    if (await nameField.isVisible()) {
      await nameField.fill(displayName);
    }
  }

  // Click signup button
  await page.getByRole('button', { name: /sign up|create account|register/i }).click();

  // Wait for either success (navigation) or error
  await Promise.race([
    // Success: navigated away from signup
    page.waitForURL((url) => !url.pathname.includes('/signup'), { timeout: 10000 }),
    // Error: auth error message appears
    page.locator('text=/Firebase.*Error|auth\\/|error|failed/i').waitFor({ timeout: 10000 }),
  ]);

  // Check if we're still on signup page (indicates error)
  if (page.url().includes('/signup')) {
    const pageText = await page.locator('body').textContent();
    const errorMatch = pageText?.match(/Firebase.*Error.*\)|auth\/[a-z-]+/i);
    const errorMessage = errorMatch?.[0] || 'Unknown signup error';

    throw new Error(`Signup failed for ${email}: ${errorMessage}`);
  }
}

/**
 * Checks if currently logged in by looking for auth indicators
 */
export async function isLoggedIn(page: Page): Promise<boolean> {
  // Check for common logged-in indicators
  const logoutButton = page.getByRole('button', { name: /log out|sign out|logout/i });
  const dashboardLink = page.getByRole('link', { name: /dashboard/i });
  const userMenu = page.locator('[data-testid="user-menu"], [aria-label*="user"], [aria-label*="profile"]');

  return (
    await logoutButton.isVisible().catch(() => false) ||
    await dashboardLink.isVisible().catch(() => false) ||
    await userMenu.isVisible().catch(() => false)
  );
}

/**
 * Logs out the current user
 */
export async function logoutUser(page: Page): Promise<void> {
  const logoutButton = page.getByRole('button', { name: /log out|sign out|logout/i });

  if (await logoutButton.isVisible()) {
    await logoutButton.click();
    // Wait for navigation to login or home
    await page.waitForURL((url) =>
      url.pathname.includes('/login') || url.pathname === '/'
    , { timeout: 5000 });
  }
}

/**
 * Waits for auth-related loading to complete
 */
export async function waitForAuthReady(page: Page): Promise<void> {
  // Wait for any loading spinners to disappear
  const loadingIndicators = page.locator('[class*="loading"], [class*="spinner"], [aria-busy="true"]');
  await loadingIndicators.waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});

  // Small delay for auth state to settle
  await page.waitForTimeout(500);
}
