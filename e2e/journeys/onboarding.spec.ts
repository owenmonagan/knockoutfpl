import { test } from '@playwright/test';

/**
 * Onboarding Journey E2E Tests
 *
 * Tests the complete onboarding flow from landing page to league selection.
 * Based on: docs/business/product/journeys/onboarding.md
 *
 * Tags:
 * @journey - User journey tests
 * @onboarding - Onboarding flow
 * @critical - Critical user flows
 */

test.describe('Onboarding Journey @journey @onboarding', () => {
  test.describe('Landing Page', () => {
    test.todo('should display landing page with Enter the Arena CTA');
    test.todo('should navigate to team entry on CTA click');
  });

  test.describe('Team Entry', () => {
    test.todo('should find team by FPL Team ID');
    test.todo('should show team found confirmation with auto-advance');
    test.todo('should handle invalid FPL Team ID with error message');
    test.todo('should show help modal for finding Team ID');
  });

  test.describe('Existing Tournaments', () => {
    test.todo('should display existing tournaments if user is in any');
    test.todo('should show "arena awaits" state when no tournaments exist');
  });

  test.describe('League Selection', () => {
    test.todo('should display mini leagues with create/view options');
  });
});
