import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load home page successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/SafeGard/);
    await expect(page.locator('h1')).toContainText('Primeiro protocolo descentralizado');
  });

  test('should have working navigation', async ({ page }) => {
    // Test header navigation
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Como Funciona' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Projetos' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Governança' })).toBeVisible();
  });

  test('should display protocol metrics', async ({ page }) => {
    // Check for metrics section
    await expect(page.locator('[data-testid="protocol-metrics"]')).toBeVisible();
    
    // Check for metric cards
    const metricCards = page.locator('[data-testid="metric-card"]');
    await expect(metricCards).toHaveCount(3);
  });

  test('should have language switcher', async ({ page }) => {
    const langSwitcher = page.locator('[data-testid="lang-switcher"]');
    await expect(langSwitcher).toBeVisible();
    
    // Test language switching
    await langSwitcher.click();
    await page.getByRole('button', { name: 'English' }).click();
    
    // Verify language changed
    await expect(page.locator('h1')).toContainText('First decentralized');
  });

  test('should have working CTAs', async ({ page }) => {
    // Test primary CTA
    const exploreButton = page.getByRole('link', { name: /explorar projetos/i });
    await expect(exploreButton).toBeVisible();
    await exploreButton.click();
    await expect(page).toHaveURL(/\/projetos/);
  });

  test('should be responsive', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check mobile menu
    const mobileMenuButton = page.locator('[data-testid="mobile-menu-button"]');
    await expect(mobileMenuButton).toBeVisible();
    
    await mobileMenuButton.click();
    const mobileMenu = page.locator('[data-testid="mobile-menu"]');
    await expect(mobileMenu).toBeVisible();
  });

  test('should have proper accessibility', async ({ page }) => {
    // Check skip link
    const skipLink = page.getByRole('link', { name: /pular para o conteúdo/i });
    await expect(skipLink).toBeHidden();
    
    // Focus skip link
    await page.keyboard.press('Tab');
    await expect(skipLink).toBeVisible();
    
    // Check main content landmark
    await expect(page.locator('main#main-content')).toBeVisible();
  });

  test('should load without console errors', async ({ page }) => {
    const consoleErrors: string[] = [];
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    expect(consoleErrors).toHaveLength(0);
  });
});
