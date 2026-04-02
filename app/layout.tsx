import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'FinFlow – Personal Finance',
  description: 'ติดตามการเงินส่วนตัวอย่างชาญฉลาด',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  )
}
