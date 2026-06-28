import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Providers } from '@/components/layout/Providers'
import { OpeningAnimation } from '@/components/layout/OpeningAnimation'
import { cn } from '@/lib/utils'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {
    default: 'TierCore - Minecraft PvP Rankings',
    template: '%s | TierCore',
  },
  description: 'Competitive Minecraft PvP ranking platform. Climb the tiers, prove your skill.',
  keywords: ['minecraft', 'pvp', 'rankings', 'tier list', 'competitive', 'mc pvp'],
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
  },
  openGraph: {
    title: 'TierCore - Minecraft PvP Rankings',
    description: 'Competitive Minecraft PvP ranking platform. Climb the tiers, prove your skill.',
    siteName: 'TierCore',
    type: 'website',
    images: [{ url: '/images/tiercore.png', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TierCore - Minecraft PvP Rankings',
    description: 'Competitive Minecraft PvP ranking platform.',
    images: ['/images/tiercore.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(inter.variable, 'font-sans antialiased min-h-screen bg-background')}>
        <Providers>
          <OpeningAnimation>
            <div className="relative flex min-h-screen flex-col">
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </OpeningAnimation>
        </Providers>
      </body>
    </html>
  )
}
