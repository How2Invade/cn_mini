import { test, expect } from '@playwright/test';

test.describe('Smart Adaptive Campus Network Simulator Overhaul E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Monitor console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error(`Browser console error: ${msg.text()}`);
      }
    });
    await page.goto('http://localhost:4173');
    await expect(page).toHaveTitle(/Smart Adaptive Campus Network Simulator/);
  });

  test('Shell layout, rail navigation, and presets drawer', async ({ page }) => {
    // Check left rail is visible
    const rail = page.locator('aside[aria-label="Navigation Rail"]');
    await expect(rail).toBeVisible();

    // Open Presets Drawer from rail
    await page.getByRole('button', { name: 'Presets' }).click();
    await expect(page.locator('text=Network Scenarios')).toBeVisible();

    // Click Baseline preset card
    await page.locator('h4', { hasText: '1. Research Paper Baseline' }).click();
    await expect(page.locator('.react-flow__node').filter({ hasText: 'R-Core (Gateway)' })).toBeVisible();

    // Click Enhanced preset card
    await page.locator('h4', { hasText: '2. Enhanced Campus Network' }).click();
    await expect(page.locator('.react-flow__node').filter({ hasText: 'Core L3 SW1' })).toBeVisible();

    // Check Auto-Layout button
    await page.getByRole('button', { name: /Auto-Layout/i }).click();

    // Check zoom display chip (minimap removed per user design request)
    await expect(page.locator('text=Zoom:')).toBeVisible();
  });

  test('Bottom dock tabs: Terminal shell and NS-2 generator', async ({ page }) => {
    // Switch dock tab to Terminal & NS-2
    await page.getByRole('button', { name: /Terminal & NS-2/i }).click();
    await expect(page.locator('text=Simulated diagnostic shell (not Cisco IOS)')).toBeVisible();
    await expect(page.locator('text=campus-sim>')).toBeVisible();

    // Execute help in terminal
    const input = page.locator('input[placeholder*="e.g. help"]');
    await input.fill('help');
    await page.getByRole('button', { name: 'Send', exact: true }).click();
    await expect(page.locator('text=Available commands:')).toBeVisible();

    // Switch to NS-2 script sub-tab
    await page.getByRole('button', { name: 'NS-2 Script & Trace View' }).click();
    await expect(page.locator('text=Generated NS-2 equivalent: not executed by this app')).toBeVisible();
    await expect(page.locator('text=campus_simulation.nam')).toBeVisible();
  });

  test('Bottom dock tabs: Packet lane and Bento Analytics', async ({ page }) => {
    // Switch to Packet Lane
    await page.getByRole('button', { name: /Packet Lane/i }).click();
    await expect(page.locator('text=Real-Time Packet Flow Lanes')).toBeVisible();

    // Dispatch traffic via top bar
    await page.getByRole('button', { name: /Send Traffic/i }).click();
    await page.getByRole('button', { name: 'Send Now' }).click();

    // Switch to Analytics Grid
    await page.getByRole('button', { name: /Analytics Grid/i }).click();
    await expect(page.locator('text=Delivered %')).toBeVisible();
    await expect(page.locator('text=Per-Link Utilization')).toBeVisible();
    await expect(page.locator('text=Real-Time Packet Inspection Table')).toBeVisible();
  });

  test('Mode toggles, command palette, and full-page rail views', async ({ page }) => {
    // Toggle Nerd mode
    const nerdBtn = page.getByRole('button', { name: /Simple Mode/i });
    await nerdBtn.click();
    await expect(page.getByRole('button', { name: /Nerd Mode/i })).toBeVisible();

    // Command palette test
    await page.getByRole('button', { name: /Search.../i }).click();
    await expect(page.locator('input[placeholder*="Type a command"]')).toBeVisible();
    await page.keyboard.press('Escape');

    // Rail navigation: Comparison page
    await page.getByRole('button', { name: 'Compare' }).click();
    await expect(page.locator('text=Architectural Comparison')).toBeVisible();

    // Rail navigation: Research page
    await page.getByRole('button', { name: 'Research' }).click();
    await expect(page.locator('text=Research & Academic Attribution')).toBeVisible();

    // Rail navigation: FAQ page
    await page.getByRole('button', { name: 'FAQ' }).click();
    await expect(page.locator('text=Frequently Asked Questions')).toBeVisible();
  });
});

