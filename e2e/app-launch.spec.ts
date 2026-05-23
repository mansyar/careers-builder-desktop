import { test, expect, type ElectronApplication, type Page } from '@playwright/test';
import { _electron as electron } from 'playwright';
import { join } from 'path';

let electronApp: ElectronApplication;
let page: Page;

test.beforeAll(async () => {
  electronApp = await electron.launch({
    args: [join(__dirname, '../out/main/index.js')],
  });
  page = await electronApp.firstWindow();
  // Wait for React to render
  await page.waitForLoadState('domcontentloaded');
});

test.afterAll(async () => {
  await electronApp.close();
});

test('app launches with correct title', async () => {
  const title = await page.title();
  expect(title).toBe('Careers Builder');
});

test('window has correct default size', async () => {
  const windowBounds = await electronApp.evaluate(({ BrowserWindow }) => {
    const win = BrowserWindow.getAllWindows()[0];
    if (!win) return null;
    const bounds = win.getBounds();
    return { width: bounds.width, height: bounds.height };
  });
  // Allow 1px tolerance for OS window decorations
  expect(windowBounds?.width).toBeGreaterThanOrEqual(1199);
  expect(windowBounds?.width).toBeLessThanOrEqual(1201);
  expect(windowBounds?.height).toBeGreaterThanOrEqual(799);
  expect(windowBounds?.height).toBeLessThanOrEqual(801);
});

test('sidebar navigation items are visible', async () => {
  // Wait for React content to render
  await page.waitForTimeout(2000);
  const bodyText = await page.locator('body').innerText();
  expect(bodyText).toContain('Careers Builder');
  expect(bodyText).toContain('Home');
  expect(bodyText).toContain('CV Builder');
  expect(bodyText).toContain('Job Search');
  expect(bodyText).toContain('Settings');
});
