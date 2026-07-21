'use client'

import { useState, useEffect, useRef, memo, useMemo } from 'react'
import Link from 'next/link'
import { GAME_MODES } from '@/lib/game-modes'
import { DEFAULT_TIERS, TIER_POINTS } from '@/lib/points'
import MagneticButton from '@/components/ui/MagneticButton'

const STATIC_GAME_MODES = GAME_MODES

function StatsBar({ loading, playerCount, totalTournaments }: { loading: boolean; playerCount: number; totalTournaments: number }) {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 -mt-8 relative z-10">
      <div className="relative animate-slide-up anim-delay-4">
        {/* Border layer */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'linear-gradient(180deg,rgba(212,175,55,0.25),rgba(212,175,55,0.06),rgba(212,175,55,0.12))',
          clipPath: 'polygon(1rem 0%,100% 0%,100% calc(100% - 1rem),calc(100% - 1rem) 100%,0% 100%,0% 1rem)',
        }} />
        {/* Shine layer */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'linear-gradient(133deg,rgba(255,255,255,0.15),transparent)',
          clipPath: 'polygon(1rem 0%,100% 0%,100% calc(100% - 1rem),calc(100% - 1rem) 100%,0% 100%,0% 1rem)',
        }} />
        {/* Inner background */}
        <div className="absolute inset-[1px] pointer-events-none" style={{
          background: 'linear-gradient(133deg,#000 2.99%,#1c1c1c)',
          clipPath: 'polygon(1rem 0%,100% 0%,100% calc(100% - 1rem),calc(100% - 1rem) 100%,0% 100%,0% 1rem)',
        }} />
        {/* Content */}
        <div className="relative z-10 grid grid-cols-2 gap-4 p-6 sm:p-8">
          <div className="text-center">
            <div className="text-3xl font-black text-gradient-gold">{loading ? <span className="animate-skeleton">...</span> : playerCount}</div>
            <div className="text-sm text-muted-foreground mt-1">Active Players</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-black text-gradient-gold">{loading ? <span className="animate-skeleton">...</span> : totalTournaments}</div>
            <div className="text-sm text-muted-foreground mt-1">Total Tournaments</div>
          </div>
        </div>
      </div>
    </section>
  )
}

const StatsBarMemo = memo(StatsBar)

function GameModeGrid() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 mt-12 section-lazy">
      <h2 className="text-2xl font-black mb-6 animate-slide-up anim-delay-5">Game Modes</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 anim-stagger-row">
        {STATIC_GAME_MODES.map((mode, i) => (
          <Link
            key={mode.id}
            href={`/ranking/${mode.id}`}
            className="group relative block"
            style={{ animationDelay: `${0.6 + i * 0.08}s` }}
          >
            {/* Border layer */}
            <div className="absolute inset-0 pointer-events-none transition-opacity duration-300" style={{
              background: 'linear-gradient(180deg,rgba(212,175,55,0.25),rgba(212,175,55,0.06),rgba(212,175,55,0.12))',
            }} />
            {/* Shine layer */}
            <div className="absolute inset-0 pointer-events-none" style={{
              background: 'linear-gradient(133deg,rgba(255,255,255,0.15),transparent)',
            }} />
            {/* Inner background */}
            <div className="absolute inset-[1px] pointer-events-none transition-all duration-300 group-hover:brightness-110" style={{
              background: 'linear-gradient(133deg,#000 2.99%,#1c1c1c)',
            }} />
            {/* Content */}
            <div className="relative z-10 p-5 transition-transform duration-300 group-hover:scale-[1.01]">
              <div className="flex items-center gap-4">
                <div className="flex h-20 w-20 items-center justify-center bg-white/[0.03] group-hover:bg-amber-500/10 transition-colors">
                  <img src={mode.icon} alt={mode.name} className="w-14 h-14" loading="lazy" />
                </div>
                <div>
                  <div className="font-bold text-base">{mode.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{mode.desc}</div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}

const GameModeGridMemo = memo(GameModeGrid)

function TierSystem() {
  const tiers = useMemo(() => [1, 2, 3, 4, 5], [])
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 mt-16 mb-16 section-lazy">
      <h2 className="text-2xl font-black mb-8 text-center animate-slide-up">Tier System</h2>
      <div className="flex flex-wrap justify-center gap-4 sm:gap-6 animate-slide-up anim-delay-1">
        {tiers.map((line, i) => {
          const htKey = `ht${line}`
          const ltKey = `lt${line}`
          const htTier = DEFAULT_TIERS.find(t => t.key === htKey)!
          const ltTier = DEFAULT_TIERS.find(t => t.key === ltKey)!
          return (
            <div key={line} className="flex flex-col gap-2 w-[120px] sm:w-[140px]">
              <div
                className="p-3 text-center rounded-xl border card-premium"
                style={{ '--glow-color': htTier.color, animationDelay: `${0.8 + i * 0.1}s` } as React.CSSProperties}
              >
                <div className="text-base sm:text-lg font-black" style={{ color: htTier.color }}>{htTier.shortName}</div>
                <div className="text-[10px] text-muted-foreground/80">{htTier.minPoints} pts</div>
                <div className="text-[9px] mt-1 font-bold" style={{ color: htTier.color }}>+{TIER_POINTS[htKey]} pts/win</div>
              </div>
              <div
                className="p-3 text-center rounded-xl border card-premium"
                style={{ '--glow-color': ltTier.color, animationDelay: `${0.9 + i * 0.1}s` } as React.CSSProperties}
              >
                <div className="text-base sm:text-lg font-black" style={{ color: ltTier.color }}>{ltTier.shortName}</div>
                <div className="text-[10px] text-muted-foreground/80">{ltTier.minPoints} pts</div>
                <div className="text-[9px] mt-1 font-bold" style={{ color: ltTier.color }}>+{TIER_POINTS[ltKey]} pts/win</div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

const TierSystemMemo = memo(TierSystem)

export default function HomePage() {
  const [playerCount, setPlayerCount] = useState(0)
  const [totalTournaments, setTotalTournaments] = useState(0)
  const [loading, setLoading] = useState(true)
  const intervalRef = useRef<ReturnType<typeof setInterval>>()

  useEffect(() => {
    let cancelled = false
    async function fetchStats() {
      try {
        const [playersRes, settingsRes] = await Promise.all([
          fetch('/api/players'),
          fetch('/api/settings'),
        ])
        if (cancelled) return
        const players = await playersRes.json()
        const settings = await settingsRes.json()
        if (cancelled) return
        setPlayerCount(players.data?.length ?? 0)
        setTotalTournaments(settings.totalTournaments ?? 0)
      } catch {
        if (cancelled) return
        setPlayerCount(0)
        setTotalTournaments(0)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchStats()
    intervalRef.current = setInterval(fetchStats, 60000)
    return () => { cancelled = true; clearInterval(intervalRef.current) }
  }, [])

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-yellow-500/20 bg-yellow-500/10 px-4 py-1 text-sm text-yellow-400 mb-6 animate-slide-up">
              <span className="h-1.5 w-1.5 rounded-full bg-yellow-400 animate-pulse" />
              Season 1 is live
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black tracking-tight animate-slide-up anim-delay-1">
              Minecraft PvP
              <br />
              <span>Rankings</span>
            </h1>
            <p className="mt-4 text-base text-foreground/80 max-w-2xl mx-auto animate-slide-up anim-delay-2">
              Compete across {GAME_MODES.length - 1} game modes. Climb through the ranks from LT5 to HT1.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4 animate-slide-up anim-delay-3">
              <MagneticButton strength={0.2}>
                <Link
                  href="/ranking/overall"
                  className="block rounded-xl bg-gradient-to-r from-yellow-500 to-amber-500 px-5 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base font-bold text-black hover:from-yellow-400 hover:to-amber-400 transition-all shadow-lg shadow-yellow-500/25 hover-lift btn-press btn-shimmer btn-gradient-shift hover-bounce"
                >
                  View Leaderboard
                </Link>
              </MagneticButton>
              <MagneticButton strength={0.2}>
                <Link
                  href="/tournaments"
                  className="block rounded-xl bg-gradient-to-r from-emerald-500 to-green-500 px-5 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base font-bold text-black hover:from-emerald-400 hover:to-green-400 transition-all shadow-lg shadow-emerald-500/25 hover-lift btn-press btn-shimmer hover-bounce"
                >
                  Tournaments
                </Link>
              </MagneticButton>
              <MagneticButton strength={0.15}>
                <Link
                  href="/ranking/overall"
                  className="block rounded-xl border border-border bg-card/80 px-5 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base font-medium text-foreground hover:bg-accent transition-all hover-lift btn-press hover-bounce"
                >
                  Rankings
                </Link>
              </MagneticButton>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <StatsBarMemo loading={loading} playerCount={playerCount} totalTournaments={totalTournaments} />

      {/* Game Mode Grid */}
      <GameModeGridMemo />

      {/* Tier System */}
      <TierSystemMemo />
    </div>
  )
}
