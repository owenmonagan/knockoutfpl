import { test } from '@playwright/test';

/**
 * Returning User Journey E2E Tests
 *
 * Tests the returning user experience checking tournament status.
 * Based on: docs/business/product/journeys/returning-user.md
 *
 * Tags:
 * @journey - User journey tests
 * @dashboard - Dashboard tests
 * @critical - Critical user flows
 */

test.describe('Returning User Journey @journey @dashboard', () => {
  test.describe('Authentication', () => {
    test.todo('should auto-redirect to dashboard when authenticated');
  });

  test.describe('Dashboard Display', () => {
    test.todo('should display all user leagues with tournament status');
    test.todo('should show active match with current scores');
    test.todo('should handle user with no tournaments gracefully');
  });

  test.describe('Tournament Status', () => {
    test.todo('should indicate eliminated status when user is out');
    test.todo('should show winner celebration when tournament complete');
  });
});
