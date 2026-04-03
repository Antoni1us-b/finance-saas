import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // ✅ compress responses → ลด bandwidth ~60-70%
  compress: true,

  // ✅ ลด JS bundle size
  experimental: {
    optimizePackageImports: [
      'lucide-react',   // import เฉพาะ icon ที่ใช้ แทน import ทั้ง lib
      'recharts',       // tree-shake chart components
    ],
  },

  // ✅ Security headers → ไม่ต้องใช้ middleware เพิ่ม
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options',  value: 'nosniff' },
          { key: 'X-Frame-Options',          value: 'DENY' },
          { key: 'Referrer-Policy',          value: 'strict-origin-when-cross-origin' },
        ],
      },
      {
        // ✅ Cache static assets นาน → ลด bandwidth Vercel
        source: '/_next/static/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ]
  },

  // Landing page is now at / — no root redirect needed
}

export default nextConfig
