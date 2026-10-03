import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'export',
  // Ensures static export writes privacy-policy/index.html instead of privacy-policy.html
  // so the local preview server (`serve -s out`) resolves paths correctly.
  trailingSlash: true,
  // Images configuration. Every image this site serves is in public/ (the
  // capture localized the WordPress uploads under public/_ffc-assets), so no
  // remote host is allowed; the template's sample hosts were removed.
  images: {
    unoptimized: true,
  },
  // Optional: base path and asset prefix if using a subdirectory deployment
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
  assetPrefix: process.env.NEXT_PUBLIC_BASE_PATH || '',
}

export default nextConfig
