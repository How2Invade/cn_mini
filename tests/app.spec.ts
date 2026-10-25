import { test, expect } from '@playwright/test';

test.describe('Smart Adaptive Campus Network Simulator E2E', () => {
  test('Startup, Presets, and Traffic Injection', async ({ page }) => {
    // 1. Visit App
    await page.goto('http://localhost:4173');
    await expect(page).toHaveTitle(/Smart Adaptive Campus Network Simulator/);

    // 2. Assert Hero and Presets
    const heroTitle = page.locator('h1');
    await expect(heroTitle).toContainText('Smart Adaptive Campus Network Simulator');

    // 3. Click Preset 1 Baseline
    await page.getByRole('button', { name: /1\. Research Paper Baseline/i }).click();
    await expect(page.locator('.react-flow__node').filter({ hasText: 'R-Core (Gateway)' })).toBeVisible();

    // 4. Click Preset 2 Enhanced
    await page.getByRole('button', { name: /2\. Enhanced Campus Network/i }).click();
    await expect(page.locator('.react-flow__node').filter({ hasText: 'Core L3 SW1' })).toBeVisible();

    // 5. Inject Traffic
    await page.getByRole('button', { name: /Inject Traffic/i }).click();
    await page.getByRole('button', { name: /Run Simulation/i }).click();
    await page.waitForTimeout(600);

    // 6. Mode Toggle (Simple to Nerd Mode)
    await page.getByRole('button', { name: 'Simple Mode', exact: true }).click();
    await expect(page.locator('text=Nerd Mode: ON')).toBeVisible();
    await expect(page.locator('text=Deterministic Accounting Equations:')).toBeVisible();

    // 7. Verify Guided Demo
    await page.locator('text=7-Step Interactive Guided Scenario Tour').scrollIntoViewIfNeeded();
    await expect(page.locator('text=Step 1: Normal Dual-Core Campus Operation')).toBeVisible();
    await page.getByRole('button', { name: /Next Step/i }).click();
    await expect(page.locator('text=Step 2: Dispatch Steady-State Student Traffic')).toBeVisible();
  });
});
