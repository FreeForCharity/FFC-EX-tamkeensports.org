import { test, expect } from '@playwright/test'
import { testConfig } from './test.config'

/**
 * Social Links Tests
 *
 * These tests verify that:
 * 1. Social media links are present and functional
 * 2. Defunct platforms (like Google+) are not present
 * 3. All social icons link to correct destinations
 *
 * Expectations come from test.config.ts, which derives them from
 * src/lib/site.config.ts — so which platforms appear, and how many, follow the
 * charity's own configuration instead of the template's original four.
 */

test.describe('Footer Social Links', () => {
  test('should not contain Google+ social link', async ({ page }) => {
    // Navigate to the homepage
    await page.goto('/')

    // Check that Google+ link is not present
    const googlePlusLink = page.locator('footer a[href*="plus.google.com"]')
    await expect(googlePlusLink).toHaveCount(0)

    // Also check that Google Plus label is not present
    const googlePlusLabel = page.locator('footer a[aria-label="Google Plus"]')
    await expect(googlePlusLabel).toHaveCount(0)
  })

  test('should display active social media links', async ({ page }) => {
    await page.goto('/')

    // A fork may disable every social link (an empty href is the documented
    // "off" state in SiteConfig), and that is a correct configuration, not a
    // failure. Requiring at least one made such a fork fail here.
    test.skip(
      testConfig.socialLinks.length === 0,
      'No social links are enabled for this site; the disabled-icon case is asserted below.'
    )

    // This site's social links live in the captured page's own footer (a
    // WordPress social-links block, whose accessible name is a screen-reader
    // span), not in the FFC attribution <footer>, which renders no icons. So
    // they are located page-wide by destination and checked for an accessible
    // name that names the platform.
    for (const social of testConfig.socialLinks) {
      const link = page.locator(`a[href*="${social.url}"]`).first()
      await expect(link).toBeVisible()
      await expect(link).toHaveAccessibleName(new RegExp(social.ariaLabel, 'i'))
    }
  })

  test('should render exactly the configured social icons', async ({ page }) => {
    await page.goto('/')

    // Every platform the config declares, enabled or not, must appear exactly
    // when it is enabled: an enabled platform with no link on the page, or a
    // disabled one that still links out, both fail here.
    const enabled = new Set(testConfig.socialLinks.map((social) => social.ariaLabel))
    for (const label of testConfig.allSocialLabels) {
      const links = page.getByRole('link', { name: new RegExp(`^${label}$`, 'i') })
      await expect(links).toHaveCount(enabled.has(label) ? 1 : 0)
    }
  })
})
