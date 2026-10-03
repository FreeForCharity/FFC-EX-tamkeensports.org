import { test, expect } from '@playwright/test'

/**
 * Captured navigation: the mobile overlay menu
 *
 * The captured pages carry the WordPress core navigation block, whose mobile
 * overlay is driven in WordPress by the Interactivity API runtime -- which the
 * capture does not ship. `src/components/clone-enhance` replaces that runtime.
 * Without it the hamburger is a dead control and a phone visitor has no
 * navigation at all, which is the regression this spec exists to catch.
 *
 * The hamburger only renders below the block's 600px breakpoint, so the open
 * and close assertions run on the mobile project and the desktop project
 * asserts the inline menu instead.
 */

test.describe('Captured navigation', () => {
  test('desktop shows the inline menu and no hamburger', async ({ page, isMobile }) => {
    test.skip(!!isMobile, 'Desktop layout only.')
    await page.goto('/')

    await expect(page.getByRole('button', { name: 'Open menu' })).toBeHidden()
    await expect(
      page.locator('.wp-block-navigation__responsive-container').getByRole('link').first()
    ).toBeVisible()
  })

  test('mobile hamburger opens and closes the overlay menu', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Mobile layout only.')
    await page.goto('/')

    // The overlay is `position: fixed; inset: 0`, so it is exactly as wide as
    // the layout viewport -- and a page that overflows horizontally widens
    // that viewport past the screen, which puts the overlay's close button
    // (top right) off the visible edge. Measured here before the capture's
    // CSS scoper was fixed: a 500px form on a 393px phone, and the close
    // button at x=476. A phone has no Escape key, so that overlay had no
    // visible way out.
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
    ).toBeLessThanOrEqual(0)

    const opener = page.getByRole('button', { name: 'Open menu' })
    const container = page.locator('.wp-block-navigation__responsive-container')
    const links = container.getByRole('link')

    // Closed: the control is there, the menu is not.
    await expect(opener).toBeVisible()
    await expect(opener).toHaveAttribute('aria-expanded', 'false')
    await expect(links.first()).toBeHidden()

    // Open: the overlay renders every link and is announced as a dialog.
    await opener.click()
    await expect(container).toHaveClass(/is-menu-open/)
    await expect(opener).toHaveAttribute('aria-expanded', 'true')
    await expect(page.getByRole('dialog', { name: 'Menu' })).toBeVisible()
    await expect(links.first()).toBeVisible()
    expect(await links.count()).toBeGreaterThan(1)
    await expect(page.locator('html')).toHaveClass(/has-modal-open/)

    // The close button closes it and the scroll lock is released.
    await page.getByRole('button', { name: 'Close menu' }).click()
    await expect(container).not.toHaveClass(/is-menu-open/)
    await expect(opener).toHaveAttribute('aria-expanded', 'false')
    await expect(links.first()).toBeHidden()
    await expect(page.locator('html')).not.toHaveClass(/has-modal-open/)

    // Escape closes it too, and returns focus to the hamburger.
    await opener.click()
    await expect(container).toHaveClass(/is-menu-open/)
    await page.keyboard.press('Escape')
    await expect(container).not.toHaveClass(/is-menu-open/)
    await expect(opener).toBeFocused()
  })
})
