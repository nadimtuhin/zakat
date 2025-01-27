import { test, expect } from '@playwright/test';

test.describe('Zakat Calculator', () => {
  test('should load the calculator', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Zakat Calculator')).toBeVisible();
  });

  test('should calculate zakat for cash assets', async ({ page }) => {
    await page.goto('/');
    
    // Select USD as currency
    await page.selectOption('select', 'United States');
    
    // Add cash amount
    const cashInput = page.getByPlaceholder('Enter amount').first();
    await cashInput.fill('100000');

    // Check if zakat is calculated correctly (2.5% of 100000)
    const zakatAmount = page.getByText('$2,500.00');
    await expect(zakatAmount).toBeVisible();
  });

  test('should calculate gold value', async ({ page }) => {
    await page.goto('/');
    
    // Select USD as currency
    await page.selectOption('select', 'United States');
    
    // Add gold weight
    const goldWeightInput = page.getByPlaceholder('Enter weight in g').first();
    await goldWeightInput.fill('100');

    // Verify that current value is displayed
    const currentValue = page.getByText('Current value:');
    await expect(currentValue).toBeVisible();
  });

  test('should reset calculator', async ({ page }) => {
    await page.goto('/');
    
    // Add some values
    const cashInput = page.getByPlaceholder('Enter amount').first();
    await cashInput.fill('100000');

    // Click reset button
    await page.getByText('Reset').click();

    // Verify values are reset
    await expect(cashInput).toHaveValue('0');
  });
}); 