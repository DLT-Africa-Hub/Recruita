import { test, expect } from '@playwright/test';

/**
 * Example test file - can be used as a template for new tests
 * This file demonstrates basic Playwright patterns
 */

test.describe('Example Test Suite', () => {
  test('should load the home page', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check page title or key element
    const title = page.locator('h1, [role="heading"]').first();
    await expect(title).toBeVisible();
  });

  test('should navigate to login page', async ({ page }) => {
    await page.goto('/');
    
    // Click login link/button
    const loginLink = page.locator('a:has-text("Login"), button:has-text("Login")').first();
    await loginLink.click();
    
    // Verify navigation
    await expect(page).toHaveURL(/.*login/);
    
    // Verify login form is present
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    await expect(emailInput).toBeVisible();
  });
});

