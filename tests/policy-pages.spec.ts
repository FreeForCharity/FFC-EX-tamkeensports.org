import { test, expect } from '@playwright/test'
import { testConfig } from './test.config'

/**
 * Policy page smoke tests
 *
 * Verifies that all legal/policy pages load correctly, render their headings,
 * and are reachable from the footer with correct href attributes.
 */

const policyPages = [
  { path: '/privacy-policy', heading: 'Privacy Policy' },
  { path: '/cookie-policy', heading: 'Cookie Policy' },
  { path: '/terms-of-service', heading: 'Terms of Service' },
  { path: '/donation-policy', heading: 'Donation Policy' },
  { path: '/free-for-charity-donation-policy', heading: 'Free For Charity Donation Policy' },
  { path: '/security-acknowledgements', heading: 'Security Acknowledgements' },
  {
    path: '/vulnerability-disclosure-policy',
    heading: 'Vulnerability Disclosure Policy',
  },
]

// This site ships the FFC attribution footer (src/components/ffc-footer),
// whose policy links are labelled by page name, with FFC's own policy
// abbreviated to "FFC Donation Policy". With trailingSlash enabled, Next.js
// Link renders hrefs with trailing slashes.
const footerPolicyLinks = [
  { name: 'FFC Donation Policy', href: '/free-for-charity-donation-policy/' },
  // The charity's own donation policy. Matched with exact names below so this
  // does not also match "FFC Donation Policy".
  { name: 'Donation Policy', href: '/donation-policy/' },
  { name: 'Privacy Policy', href: '/privacy-policy/' },
  { name: 'Cookie Policy', href: '/cookie-policy/' },
  { name: 'Terms of Service', href: '/terms-of-service/' },
  { name: 'Vulnerability Disclosure', href: '/vulnerability-disclosure-policy/' },
  { name: 'Security Acknowledgements', href: '/security-acknowledgements/' },
]

test.describe('Policy pages', () => {
  for (const { path, heading } of policyPages) {
    test(`${heading} page loads and renders heading`, async ({ page }) => {
      const response = await page.goto(path)
      expect(response?.status()).toBe(200)

      const h = page.getByRole('heading', { name: heading }).first()
      await expect(h).toBeVisible()
    })
  }

  test('footer contains policy links with correct hrefs', async ({ page }) => {
    await page.goto('/')
    const footer = page.locator('footer')

    for (const { name, href } of footerPolicyLinks) {
      // exact: true — "Donation Policy" is a substring of "Free For Charity
      // Donation Policy", so substring matching would hit both links.
      const link = footer.getByRole('link', { name, exact: true })
      await expect(link).toBeVisible()
      await expect(link).toHaveAttribute('href', href)
    }
  })
})
