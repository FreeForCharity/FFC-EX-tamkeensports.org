import { test, expect } from '@playwright/test'
import { team } from '../src/data/team'

/**
 * Footer-Only Template Smoke Tests
 *
 * The template's own home page renders a Team section above the Footer. A fork
 * is free to replace the home page with its own content (this one did), so the
 * Team assertions run only when the page actually renders that section.
 *
 * The previous version of this file asserted a fixed roster of five named Free
 * For Charity people on `/`. That is the template's sample data, not a property
 * of the template, so it failed on every correct rebrand.
 */

test.describe('Footer-only template', () => {
  test('should render the Team section when the home page includes it', async ({ page }) => {
    await page.goto('/')

    const teamSection = page.locator('#team')

    if ((await teamSection.count()) === 0) {
      test.skip(true, "This site's home page does not render the Team section.")
      return
    }

    // Cards render an initials monogram, not a photo — there are no team images.
    await expect(page.locator('#team img')).toHaveCount(0)

    // One name heading per configured member; a member with a safe LinkedIn URL
    // has their whole card linked.
    for (const member of team) {
      await expect(page.getByRole('heading', { level: 3, name: member.name })).toBeVisible()
      if (member.linkedinUrl) {
        await expect(page.getByRole('link', { name: `${member.name} on LinkedIn` })).toBeVisible()
      }
    }

    await expect(page.locator('#team').getByRole('heading', { level: 3 })).toHaveCount(team.length)
  })

  // This site ships the FFC attribution footer (src/components/ffc-footer),
  // not the template's three-column marketing footer: the captured pages keep
  // their own visual footer, and the strip below it carries the attribution
  // and policy links. Assert that footer's contract, not the template's
  // "Quick Links" / "Contact Us" headings, which it never renders.
  test('should render the Footer', async ({ page }) => {
    await page.goto('/')

    const footer = page.locator('footer')
    await expect(footer).toBeVisible()
    await expect(footer.getByRole('link', { name: 'Supported Charity Login' })).toBeVisible()
    await expect(footer.getByRole('link', { name: 'Privacy Policy', exact: true })).toBeVisible()
    await expect(footer.getByText('Supported by')).toBeVisible()
  })

  test('should render a home page with a single top-level heading', async ({ page }) => {
    await page.goto('/')

    // Whatever a fork puts on `/`, it must still be a well-formed page.
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1)
    await expect(page.locator('main#main-content')).toBeVisible()
  })
})
