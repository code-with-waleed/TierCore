'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const navLinks = [
  { href: '/', label: 'Home', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { href: '/ranking/overall', label: 'Rankings', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  { href: '/tournaments', label: 'Tournaments', icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z' },
  { href: 'https://discord.gg/7J8jSHedS5', label: 'Discord', icon: 'M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.1776-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z', external: true },
  { href: 'https://yugsh.craftingstore.net/', label: 'Store', icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z', external: true },
]

const menuItems = [
  { href: '/', label: 'Home', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { href: '/ranking/overall', label: 'Ranking', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  { href: '/tournaments', label: 'Tournaments', icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z' },
  { href: 'https://discord.gg/7J8jSHedS5', label: 'Discord', icon: 'M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.1776-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z', external: true },
  { href: 'https://yugsh.craftingstore.net/', label: 'Store', icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z', external: true },
  { href: 'https://www.youtube.com/@ITS_YUG_XD', label: 'YouTube', icon: 'M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z', external: true },
]

function DesktopNavLink({ href, label, icon, pathname, external }: { href: string; label: string; icon: string; pathname: string; external?: boolean }) {
  const isActive = href === '/ranking/sword'
    ? pathname.startsWith('/ranking/')
    : href === '/ranking/overall'
      ? pathname.startsWith('/ranking/')
      : href === '/tournaments'
        ? pathname.startsWith('/tournaments')
        : href === '/leaderboard'
          ? pathname.startsWith('/leaderboard')
          : pathname === href

  const Comp = external ? 'a' : Link
  const extraProps = external ? { target: '_blank', rel: 'noopener noreferrer' } as any : {}

  return (
    <Comp
      href={href}
      {...extraProps}
      className={cn(
        'group relative flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium transition-all duration-200 border overflow-hidden',
        isActive
          ? 'bg-[#b45309]/15 border-[#d97706]/30 text-amber-400 shadow-[0_0_12px_rgba(217,119,6,0.15)]'
          : 'bg-transparent border-transparent text-zinc-400 hover:bg-white/[0.04] hover:border-zinc-700/30 hover:text-zinc-200'
      )}
    >
      <div
        className={cn(
          'absolute inset-0 pointer-events-none',
          isActive ? 'nav-sheen-active' : 'nav-sheen-hover'
        )}
        style={{
          backgroundImage: 'linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.08) 45%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.08) 55%, transparent 70%)',
          backgroundSize: '300% 100%',
          backgroundRepeat: 'no-repeat',
        }}
      />
      <svg className="relative w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d={icon} />
      </svg>
      <span className="relative">{label}</span>
    </Comp>
  )
}

function MobileMenuLink({ item, pathname, onClick }: { item: typeof menuItems[number]; pathname: string; onClick: () => void }) {
  const isActive = 'href' in item && item.href === '/ranking/sword'
    ? pathname.startsWith('/ranking/')
    : pathname === item.href

  if ('external' in item && item.external) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClick}
        className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl text-muted-foreground hover:text-foreground hover:bg-amber-500/10 transition-all duration-200"
      >
        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <path d={item.icon} />
        </svg>
        <span>{item.label}</span>
      </a>
    )
  }

  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200',
        isActive
          ? 'bg-gradient-to-r from-amber-500/15 to-amber-600/5 text-amber-400 border border-amber-500/20'
          : 'text-muted-foreground hover:text-foreground hover:bg-amber-500/10'
      )}
    >
      <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d={item.icon} />
      </svg>
      <span>{item.label}</span>
    </Link>
  )
}

export function Header() {
  const pathname = usePathname()
  const [serverIp, setServerIp] = useState('play.tiercore.net')
  const [copied, setCopied] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const hamburgerRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(d => { if (d.serverIp) setServerIp(d.serverIp) })
      .catch(() => {})
  }, [])

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(serverIp)
      .then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500) })
      .catch(() => {})
  }, [serverIp])

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    if (menuOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [menuOpen])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        menuOpen &&
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        hamburgerRef.current &&
        !hamburgerRef.current.contains(e.target as Node)
      ) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [menuOpen])

  return (
    <header className="sticky top-0 z-50">
      {/* Desktop header */}
      <div className="hidden md:block">
        <div className="mx-auto max-w-[1480px] px-6 pt-3">
          <div className="flex h-[72px] items-center bg-[#0E0E0E] border border-zinc-800 shadow-lg shadow-black/20 px-6 relative">
            <div className="absolute bottom-0 left-0 right-0 h-px" style={{
              background: 'linear-gradient(90deg, transparent, rgba(180,185,195,0.35) 15%, rgba(180,185,195,0.18) 50%, rgba(180,185,195,0.35) 85%, transparent)',
            }} />
            <div className="absolute top-0 left-0 right-0 h-px" style={{
              background: 'linear-gradient(90deg, transparent, rgba(180,185,195,0.18) 15%, rgba(180,185,195,0.08) 50%, rgba(180,185,195,0.18) 85%, transparent)',
            }} />
            <div className="w-[200px]">
              <Link href="/" className="flex items-center">
                <img src="/images/tiercore-logo.svg" alt="TierCore" className="h-9 w-auto" />
              </Link>
            </div>

            <nav className="flex items-center justify-center flex-1">
              {navLinks.map(link => (
                <DesktopNavLink
                  key={link.href}
                  href={link.href}
                  label={link.label}
                  icon={link.icon}
                  pathname={pathname}
                  external={link.external}
                />
              ))}
            </nav>

            <div className="w-[200px] flex justify-end">
              <div className="relative">
                <div className="absolute -inset-[3px] opacity-70 blur-[3px]" style={{
                  background: 'linear-gradient(135deg, rgba(251,191,36,0.25), transparent 50%)',
                }} />
                <div className="absolute -inset-px" style={{
                  background: 'linear-gradient(180deg, rgba(200,210,220,0.5) 0%, rgba(200,210,220,0.12) 40%, rgba(200,210,220,0.02) 100%)',
                }} />
                <button
                  onClick={handleCopy}
                  className="relative flex items-center gap-2 px-3 py-1.5 text-xs font-medium transition-all cursor-pointer hover:brightness-125"
                  style={{
                    background: 'linear-gradient(180deg, rgba(12,12,15,0.9), rgba(5,5,8,0.95))',
                    boxShadow: 'inset 0 1px 0 rgba(220,225,235,0.06), 0 0 16px rgba(251,191,36,0.07), 0 2px 4px rgba(0,0,0,0.4)',
                    color: 'rgba(210,215,225,0.85)',
                  }}
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400/70" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <span className="relative">{copied ? 'Copied!' : serverIp}</span>
                  <span className="relative text-[10px] uppercase tracking-wider ml-0.5" style={{ color: 'rgba(160,165,175,0.35)' }}>COPY</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile header */}
      <div className="md:hidden">
        <div className="relative mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <div className="absolute bottom-0 left-0 right-0 h-px" style={{
            background: 'linear-gradient(90deg, transparent, rgba(180,185,195,0.25) 15%, rgba(180,185,195,0.12) 50%, rgba(180,185,195,0.25) 85%, transparent)',
          }} />
          <Link href="/" className="flex items-center gap-2.5 group">
            <img src="/images/tiercore-logo.svg" alt="TierCore" className="h-8 w-auto" />
          </Link>

          <div className="flex items-center gap-1.5">
            <button
              ref={hamburgerRef}
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex h-8 w-8 items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
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
      </div>

      {/* Mobile dropdown menu */}
      <div
        className={cn(
          'fixed inset-0 z-[9999] md:hidden transition-opacity duration-300',
          menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
      >
        <div
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={() => setMenuOpen(false)}
        />

        <div
          ref={menuRef}
          className={cn(
            'absolute left-3 right-3 top-4 max-h-[calc(100vh-2rem)] overflow-y-auto',
            'bg-[#0d0b14] border border-[#d4af37]/15 rounded-2xl shadow-2xl shadow-black/80',
            'transition-all duration-300 ease-out',
            menuOpen ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0'
          )}
        >
          <div className="p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/20">Navigation</span>
              <button
                onClick={() => setMenuOpen(false)}
                className="flex h-8 w-8 items-center justify-center text-white/30 hover:text-white/70 hover:bg-white/5 transition-all"
                aria-label="Close menu"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <nav className="flex flex-col gap-1">
              {menuItems.map(item => (
                <MobileMenuLink
                  key={item.href}
                  item={item}
                  pathname={pathname}
                  onClick={() => setMenuOpen(false)}
                />
              ))}
            </nav>

            <div className="mt-3 pt-3 border-t border-[#d4af37]/10">
              <button
                onClick={() => { handleCopy(); setMenuOpen(false) }}
                className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl text-muted-foreground hover:text-amber-400 hover:bg-amber-500/10 transition-all duration-200"
              >
                <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                </svg>
                <span className="flex-1 text-left">{copied ? 'Copied!' : serverIp}</span>
                <span className="text-[10px] text-amber-400/60 font-medium uppercase tracking-wider">Copy IP</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
