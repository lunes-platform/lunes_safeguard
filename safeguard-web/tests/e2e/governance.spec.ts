import { test, expect } from '@playwright/test';

test.describe('Governance Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/governanca');
  });

  test('should load governance page successfully', async ({ page }) => {
    await expect(page).toHaveTitle(/Governança/);
    await expect(page.locator('h1')).toContainText('Governança');
  });

  test('should display proposal filters', async ({ page }) => {
    // Check filter buttons
    await expect(page.getByRole('button', { name: 'Todas' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Ativas' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Finalizadas' })).toBeVisible();
  });

  test('should filter proposals by status', async ({ page }) => {
    // Click on "Ativas" filter
    await page.getByRole('button', { name: 'Ativas' }).click();
    
    // Check that only active proposals are shown
    const proposalCards = page.locator('[data-testid="proposal-card"]');
    await expect(proposalCards.first()).toBeVisible();
    
    // Verify active status
    await expect(proposalCards.first().locator('.bg-green-100')).toBeVisible();
  });

  test('should have working search functionality', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Buscar propostas...');
    await expect(searchInput).toBeVisible();
    
    await searchInput.fill('Atualização');
    await page.keyboard.press('Enter');
    
    // Check filtered results
    const proposalCards = page.locator('[data-testid="proposal-card"]');
    await expect(proposalCards).toHaveCount(1);
  });

  test('should display proposal details', async ({ page }) => {
    const firstProposal = page.locator('[data-testid="proposal-card"]').first();
    await expect(firstProposal).toBeVisible();
    
    // Check proposal elements
    await expect(firstProposal.locator('h3')).toBeVisible();
    await expect(firstProposal.locator('[data-testid="proposal-status"]')).toBeVisible();
    await expect(firstProposal.locator('[data-testid="voting-stats"]')).toBeVisible();
  });

  test('should show voting statistics', async ({ page }) => {
    const votingStats = page.locator('[data-testid="voting-stats"]').first();
    await expect(votingStats).toBeVisible();
    
    // Check for voting percentages
    await expect(votingStats.locator('text=Sim:')).toBeVisible();
    await expect(votingStats.locator('text=Não:')).toBeVisible();
    await expect(votingStats.locator('text=Quórum:')).toBeVisible();
  });

  test('should open vote modal when vote button is clicked', async ({ page }) => {
    const voteButton = page.getByRole('button', { name: 'Votar' }).first();
    await voteButton.click();
    
    // Check if vote modal opens
    await expect(page.locator('[data-testid="vote-modal"]')).toBeVisible();
    await expect(page.getByText('Votar na Proposta')).toBeVisible();
  });

  test('should be accessible via keyboard navigation', async ({ page }) => {
    // Tab through interactive elements
    await page.keyboard.press('Tab'); // Skip link
    await page.keyboard.press('Tab'); // First filter button
    
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toHaveText('Todas');
    
    // Continue tabbing to search
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toHaveAttribute('placeholder', 'Buscar propostas...');
  });
});
