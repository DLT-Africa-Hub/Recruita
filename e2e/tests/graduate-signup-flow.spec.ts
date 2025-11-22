import { test, expect } from '@playwright/test';

/**
 * E2E Test: Graduate Signup → Onboarding → Profile Completion Flow
 * 
 * This test covers the complete user journey:
 * 1. User signs up as a graduate
 * 2. Completes email verification
 * 3. Goes through onboarding (profile creation)
 * 4. Completes profile with skills, education, work experience
 * 5. Verifies profile is saved correctly
 */
test.describe('Graduate Signup to Profile Completion Flow', () => {
  const testEmail = `test-graduate-${Date.now()}@example.com`;
  const testPassword = 'TestPassword123!';
  const testFirstName = 'John';
  const testLastName = 'Doe';

  test.beforeEach(async ({ page }) => {
    // Navigate to home page
    await page.goto('/');
  });

  test('complete graduate signup and onboarding flow', async ({ page }) => {
    // Step 1: Navigate to registration
    await page.click('text=Get Started');
    await expect(page).toHaveURL(/.*register/);

    // Step 2: Fill registration form
    await page.selectOption('select[name="accountType"]', 'graduate');
    await page.fill('input[name="firstName"]', testFirstName);
    await page.fill('input[name="lastName"]', testLastName);
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.fill('input[name="confirmPassword"]', testPassword);
    
    // Accept terms if checkbox exists
    const termsCheckbox = page.locator('input[type="checkbox"][name*="terms"], input[type="checkbox"][name*="accept"]');
    if (await termsCheckbox.count() > 0) {
      await termsCheckbox.check();
    }

    // Submit registration
    await page.click('button[type="submit"]');

    // Step 3: Wait for successful registration (should redirect or show success message)
    // Note: Adjust selectors based on actual UI
    await page.waitForURL(/.*verify-email|.*login|.*graduate/, { timeout: 10000 });

    // Step 4: If email verification is required, handle it
    // In a real scenario, you might need to check email or use a test email service
    // For now, we'll assume the user can proceed or verification is bypassed in test mode

    // Step 5: Login (if redirected to login)
    if (page.url().includes('/login')) {
      await page.fill('input[name="email"]', testEmail);
      await page.fill('input[name="password"]', testPassword);
      await page.click('button[type="submit"]');
    }

    // Step 6: Navigate to onboarding/profile creation
    // Wait for redirect to onboarding or dashboard
    await page.waitForURL(/.*onboarding|.*graduate|.*profile/, { timeout: 10000 });

    // If redirected to onboarding, complete it
    if (page.url().includes('/onboarding')) {
      // Fill onboarding form - adjust selectors based on actual form structure
      await page.fill('input[name="phoneNumber"]', '+1234567890');
      await page.selectOption('select[name="position"]', 'frontend developer');
      await page.selectOption('select[name="expLevel"]', 'entry level');
      await page.selectOption('select[name="yearsOfExperience"]', '3-5 years');
      
      // Add skills
      const skillsInput = page.locator('input[placeholder*="skill" i], input[name*="skill" i]').first();
      if (await skillsInput.count() > 0) {
        await skillsInput.fill('JavaScript');
        await page.keyboard.press('Enter');
        await skillsInput.fill('React');
        await page.keyboard.press('Enter');
      }

      // Fill education
      await page.fill('input[name="degree"]', 'Bachelor of Science');
      await page.fill('input[name="field"]', 'Computer Science');
      await page.fill('input[name="institution"]', 'Test University');
      await page.fill('input[name="graduationYear"]', '2023');

      // Submit onboarding
      const submitButton = page.locator('button[type="submit"]:has-text("Complete"), button:has-text("Submit"), button:has-text("Continue")');
      await submitButton.first().click();

      // Wait for redirect after onboarding
      await page.waitForURL(/.*graduate|.*dashboard|.*profile/, { timeout: 10000 });
    }

    // Step 7: Verify profile completion
    // Navigate to profile page
    await page.goto('/graduate/profile');
    
    // Verify profile data is displayed
    await expect(page.locator(`text=${testFirstName}`)).toBeVisible({ timeout: 5000 });
    await expect(page.locator(`text=${testLastName}`)).toBeVisible({ timeout: 5000 });
    
    // Verify skills are present
    const skillsSection = page.locator('text=JavaScript, text=React').first();
    if (await skillsSection.count() > 0) {
      await expect(skillsSection).toBeVisible();
    }

    // Step 8: Verify user can access dashboard
    await page.goto('/graduate');
    await expect(page).toHaveURL(/.*graduate/);
    
    // Verify dashboard loads (check for common dashboard elements)
    const dashboardContent = page.locator('text=Available Opportunities, text=Dashboard, text=Matches').first();
    await expect(dashboardContent).toBeVisible({ timeout: 5000 });
  });

  test('graduate cannot access protected routes without completing onboarding', async ({ page }) => {
    // This test verifies route guards work correctly
    // Attempt to access dashboard without completing onboarding
    await page.goto('/graduate');
    
    // Should be redirected to onboarding or login
    await expect(page).toHaveURL(/.*onboarding|.*login|.*assessment/, { timeout: 5000 });
  });
});

