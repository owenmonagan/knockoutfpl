import { test, expect } from '@playwright/test';

/**
 * Authentication E2E Tests
 *
 * Tags:
 * @smoke - Critical smoke tests that should always pass
 * @auth - Authentication-related tests
 * @critical - Critical user flows
 */

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing auth state
    await page.context().clearCookies();
    await page.context().clearPermissions();
  });

  test('should display signup form with all required fields @smoke @auth', async ({ page }) => {
    await page.goto('/signup');
    await page.waitForLoadState('networkidle');

    // Check all form fields are present
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Display Name')).toBeVisible();
    await expect(page.getByLabel(/^Password$/)).toBeVisible();
    await expect(page.getByLabel('Confirm Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign Up' })).toBeVisible();
  });

  test('should display login form with all required fields @smoke @auth', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    // Check all form fields are present
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Log In' })).toBeVisible();
  });

  test('should show validation error when passwords do not match @auth', async ({ page }) => {
    await page.goto('/signup');

    // Fill form with mismatched passwords
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Display Name').fill('Test User');
    await page.getByLabel(/^Password$/).fill('password123');
    await page.getByLabel('Confirm Password').fill('password456');

    // Submit form
    await page.getByRole('button', { name: 'Sign Up' }).click();

    // Check for validation error
    await expect(page.getByText('Passwords do not match')).toBeVisible();
  });

  test('should prevent submission with empty required fields @auth', async ({ page }) => {
    await page.goto('/signup');
    await page.waitForLoadState('networkidle');

    // Try to submit without filling any fields
    await page.getByRole('button', { name: 'Sign Up' }).click();

    // Browser should prevent submission due to HTML5 required attribute
    // We should still be on the signup page
    await expect(page).toHaveURL('/signup');

    // Check form is still visible (not submitted)
    await expect(page.getByRole('button', { name: 'Sign Up' })).toBeVisible();
  });

  test('should show error on signup with invalid email format @auth', async ({ page }) => {
    await page.goto('/signup');

    // Fill form with invalid email
    await page.getByLabel('Email').fill('notanemail');
    await page.getByLabel('Display Name').fill('Test User');
    await page.getByLabel(/^Password$/).fill('password123');
    await page.getByLabel('Confirm Password').fill('password123');

    // Try to submit
    await page.getByRole('button', { name: 'Sign Up' }).click();

    // HTML5 validation should prevent submission
    // We should still be on the signup page
    await expect(page).toHaveURL('/signup');
  });

  test('should show error on signup with weak password @auth', async ({ page }) => {
    await page.goto('/signup');

    // Fill form with weak password (< 6 characters)
    await page.getByLabel('Email').fill('test@example.com');
    await page.getByLabel('Display Name').fill('Test User');
    await page.getByLabel(/^Password$/).fill('12345');
    await page.getByLabel('Confirm Password').fill('12345');

    // Submit form
    await page.getByRole('button', { name: 'Sign Up' }).click();

    // Firebase should reject with weak password error (displayed in Alert component)
    await expect(page.getByRole('alert')).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole('alert')).toContainText(/password/i);
  });

  test('should show error message on invalid login @auth @critical', async ({ page }) => {
    await page.goto('/login');

    // Try to login with invalid credentials
    await page.getByLabel('Email').fill('invalid@example.com');
    await page.getByLabel('Password').fill('wrongpassword');
    await page.getByRole('button', { name: 'Log In' }).click();

    // Wait for error message (Firebase auth error displayed in Alert component)
    await expect(page.getByRole('alert')).toBeVisible({ timeout: 5000 });
  });

  test('should have no console errors on signup page @smoke @auth', async ({ page }) => {
    const consoleErrors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/signup');
    await page.waitForLoadState('networkidle');

    expect(consoleErrors).toHaveLength(0);
  });

  test('should have no console errors on login page @smoke @auth', async ({ page }) => {
    const consoleErrors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await page.goto('/login');
    await page.waitForLoadState('networkidle');

    expect(consoleErrors).toHaveLength(0);
  });

  // TODO: Add test for successful signup flow when Firebase emulators are set up
  // test('should successfully sign up new user and redirect to dashboard @auth @critical', async ({ page }) => {
  //   // This requires Firebase emulators to be running
  // });

  // TODO: Add test for successful login flow when Firebase emulators are set up
  // test('should successfully login existing user and redirect to dashboard @auth @critical', async ({ page }) => {
  //   // This requires Firebase emulators to be running
  // });
});
