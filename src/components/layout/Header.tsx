'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/leaderboard', label: 'Leaderboard' },
  { href: '/ranking/sword', label: 'Ranking' },
  { href: '/tournaments', label: 'Tournaments' },
]

function NavLink({ href, label, pathname, mobile, onClick }: { href: string; label: string; pathname: string; mobile?: boolean; onClick?: () => void }) {
  const isActive = href === '/ranking/sword'
    ? pathname.startsWith('/ranking/')
    : pathname === href

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        mobile
          ? 'block px-4 py-3 text-sm font-medium rounded-lg transition-colors'
          : 'relative px-3 py-1.5 text-sm font-medium transition-all duration-200 rounded-lg',
        isActive
          ? mobile ? 'text-amber-400 bg-amber-500/10' : 'text-amber-400'
          : mobile ? 'text-muted-foreground hover:text-foreground hover:bg-white/5' : 'text-muted-foreground hover:text-foreground'
      )}
    >
      {label}
      {isActive && !mobile && (
        <span className="absolute inset-x-2 -bottom-px h-0.5 bg-gradient-to-r from-amber-500/80 to-yellow-500/80 rounded-full" />
      )}
    </Link>
  )
}

export function Header() {
  const pathname = usePathname()
  const [serverIp, setServerIp] = useState('play.tiercore.net')
  const [copied, setCopied] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(d => {
        if (d.serverIp) setServerIp(d.serverIp)
      })
      .catch(() => {})
  }, [])

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(serverIp).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    }).catch(() => {})
  }, [serverIp])

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  return (
    <header className="sticky top-0 z-50 bg-[#0a080b]/70 backdrop-blur-2xl border-b border-white/5">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-6 sm:gap-10">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg shadow-amber-500/20 transition-transform duration-200 group-hover:scale-105">
              <span className="text-xs font-black text-black">TC</span>
            </div>
            <span className="text-base sm:text-lg font-black tracking-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500">
                TierCore
              </span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-0.5 md:flex">
            {navLinks.map(link => (
              <NavLink key={link.href} href={link.href} label={link.label} pathname={pathname} />
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Server IP */}
          <button
            onClick={handleCopy}
            className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-amber-500/15 bg-amber-500/6 px-2.5 py-1 text-[11px] font-medium text-amber-400/70 hover:text-amber-400 hover:bg-amber-500/12 hover:border-amber-500/25 transition-all cursor-pointer"
            title="Click to copy server IP"
          >
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
            </svg>
            {copied ? 'Copied!' : serverIp}
          </button>

          {/* Discord */}
          <a
            href="https://discord.gg/7J8jSHedS5"
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-indigo-400 hover:bg-indigo-500/10 transition-all"
            title="Join our Discord"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
              <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.1776-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z" />
            </svg>
          </a>

          {/* Hamburger button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex md:hidden h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all"
            aria-label="Toggle menu"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu backdrop + drawer */}
      {menuOpen && (
        <div className="fixed inset-0 top-14 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMenuOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-64 max-w-[75vw] bg-[#0a080b] border-l border-white/5 p-4 animate-slide-in-right shadow-2xl">
            <nav className="flex flex-col gap-1 pt-2">
              {navLinks.map(link => (
                <NavLink key={link.href} href={link.href} label={link.label} pathname={pathname} mobile onClick={() => setMenuOpen(false)} />
              ))}
            </nav>
            <div className="mt-6 border-t border-white/5 pt-4">
              <button
                onClick={() => { handleCopy(); setMenuOpen(false) }}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                </svg>
                {copied ? 'Copied!' : serverIp}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}