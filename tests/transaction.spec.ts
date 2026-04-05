import { expect, test } from '@playwright/test'

/**
 * E2E test: Transaction creation flow
 *
 * Ensures that the "Add Transaction" modal submits successfully
 * without UUID casting errors (the "cat-4" bug) or other DB errors.
 *
 * Prerequisite: a demo user must exist and the dev server must be running.
 * The Playwright config's webServer block handles starting the dev server.
 */

const DEMO_EMAIL    = 'demo@finflow.com'
const DEMO_PASSWORD = 'demo1234'

test.describe('Transaction flow', () => {

  test.beforeEach(async ({ page }) => {
    // Ensure the demo account exists
    await page.request.post('/api/demo/ensure-account')

    // Log in as demo user
    await page.goto('/login')
    await page.fill('input[type="email"]', DEMO_EMAIL)
    await page.fill('input[type="password"]', DEMO_PASSWORD)
    await page.click('button[type="submit"]')

    // Wait for redirect to dashboard
    await page.waitForURL('**/dashboard', { timeout: 15_000 })
  })

  test('can create a transaction without UUID errors', async ({ page }) => {
    // Navigate to transactions page
    await page.goto('/transactions')
    await page.waitForLoadState('networkidle')

    // Open the "Add Transaction" modal
    const addButton = page.getByRole('button', { name: /เพิ่มรายการ/ })
    await addButton.click()

    // Wait for modal to appear
    const modal = page.locator('[role="dialog"]')
    await expect(modal).toBeVisible({ timeout: 5_000 })

    // Fill in the amount
    const amountInput = modal.locator('input[type="number"]')
    await amountInput.fill('150')

    // Select the first available account (real UUID from DB)
    const accountSelect = modal.locator('select').first()
    await accountSelect.selectOption({ index: 1 }) // index 0 is the placeholder

    // Set the transaction type to "expense" (default) and pick a category
    // The category dropdown is the second <select> in the modal
    const categorySelect = modal.locator('select').nth(1)
    const categoryOptions = await categorySelect.locator('option').all()

    // If categories exist, select the first real one (index 1 skips placeholder)
    if (categoryOptions.length > 1) {
      await categorySelect.selectOption({ index: 1 })
    }

    // Submit the form
    const saveButton = modal.getByRole('button', { name: /บันทึกรายการ/ })
    await saveButton.click()

    // The modal should close on success (no UUID error)
    await expect(modal).toBeHidden({ timeout: 10_000 })

    // Verify no error banner appeared on the page
    const errorBanner = page.locator('text=invalid input syntax')
    await expect(errorBanner).toHaveCount(0)
  })

  test('validates required fields before submit', async ({ page }) => {
    await page.goto('/transactions')
    await page.waitForLoadState('networkidle')

    // Open modal
    await page.getByRole('button', { name: /เพิ่มรายการ/ }).click()
    const modal = page.locator('[role="dialog"]')
    await expect(modal).toBeVisible()

    // Try to submit without filling anything
    await modal.getByRole('button', { name: /บันทึกรายการ/ }).click()

    // Should show a validation error, not close
    await expect(modal).toBeVisible()
    const errorMsg = modal.locator('text=กรุณา')
    await expect(errorMsg).toBeVisible()
  })
})
