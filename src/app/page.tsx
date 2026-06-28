'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { GAME_MODES } from '@/lib/game-modes'
import { DEFAULT_TIERS, TIER_POINTS } from '@/lib/points'
import MagneticButton from '@/components/ui/MagneticButton'

export default function HomePage() {
  const [playerCount, setPlayerCount] = useState(0)
  const [matchCount, setMatchCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const [playersRes, matchesRes] = await Promise.all([
          fetch('/api/players'),
          fetch('/api/matches'),
        ])
        const players = await playersRes.json()
        const matches = await matchesRes.json()
        setPlayerCount(players.data?.length ?? 0)
        setMatchCount(matches.data?.length ?? 0)
      } catch {
        setPlayerCount(0)
        setMatchCount(0)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-to-b from-yellow-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-yellow-500/20 bg-yellow-500/10 px-4 py-1 text-sm text-yellow-400 mb-6 animate-slide-up">
              <span className="h-1.5 w-1.5 rounded-full bg-yellow-400 animate-pulse" />
              Season 1 is live
            </div>
            <h1 className="text-4xl font-black tracking-tight sm:text-6xl animate-slide-up anim-delay-1">
              Minecraft PvP
              <br />
              <span className="text-gradient-gold">Rankings</span>
            </h1>
            <p className="mt-4 text-base text-foreground/80 max-w-2xl mx-auto animate-slide-up anim-delay-2">
              Compete across {GAME_MODES.length - 1} game modes. Climb through the ranks from LT5 to HT1.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4 animate-slide-up anim-delay-3">
              <MagneticButton strength={0.2}>
                <Link
                  href="/leaderboard"
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
                  href="/ranking/sword"
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
      <section className="mx-auto max-w-7xl px-4 sm:px-6 -mt-8 relative z-10">
        <div className="grid grid-cols-2 gap-4 rounded-2xl border border-border/50 bg-card/80 backdrop-blur-xl p-6 sm:p-8 animate-slide-up anim-delay-4">
          <div className="text-center">
            <div className="text-3xl font-black text-gradient-gold">{loading ? <span className="animate-skeleton">...</span> : playerCount}</div>
            <div className="text-sm text-muted-foreground mt-1">Active Players</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-black text-gradient-gold">{loading ? <span className="animate-skeleton">...</span> : matchCount}</div>
                <div className="text-sm text-muted-foreground mt-1">Total Tournaments</div>
          </div>
        </div>
      </section>

      {/* Game Mode Grid */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 mt-12">
        <h2 className="text-2xl font-black mb-6 animate-slide-up anim-delay-5">Game Modes</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 anim-stagger-row">
          {GAME_MODES.map((mode, i) => (
            <Link
              key={mode.id}
              href={`/leaderboard?mode=${mode.id}`}
              className={`group p-5 card-premium animate-bounce-in`}
              style={{ animationDelay: `${0.6 + i * 0.08}s` }}
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/50 group-hover:bg-amber-500/10 transition-colors">
                  <img src={mode.icon} alt={mode.name} className="w-7 h-7" />
                </div>
                <div>
                  <div className="font-bold text-base">{mode.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{mode.desc}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Tier System */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 mt-16 mb-16">
        <h2 className="text-2xl font-black mb-8 text-center animate-slide-up">Tier System</h2>
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6 animate-slide-up anim-delay-1">
          {[1, 2, 3, 4, 5].map((line, i) => {
            const htKey = `ht${line}`
            const ltKey = `lt${line}`
            const htTier = DEFAULT_TIERS.find(t => t.key === htKey)!
            const ltTier = DEFAULT_TIERS.find(t => t.key === ltKey)!
            return (
              <div key={line} className="flex flex-col gap-2 w-[120px] sm:w-[140px]">
                <div
                  className="p-3 text-center rounded-xl border card-premium animate-bounce-in"
                  style={{ '--glow-color': htTier.color, animationDelay: `${0.8 + i * 0.1}s` } as React.CSSProperties}
                >
                  <div className="text-base sm:text-lg font-black" style={{ color: htTier.color, textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>{htTier.shortName}</div>
                  <div className="text-[10px] text-muted-foreground/80">{htTier.minPoints} pts</div>
                  <div className="text-[9px] mt-1 font-bold" style={{ color: htTier.color, textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}>+{TIER_POINTS[htKey]} pts/win</div>
                </div>
                <div
                  className="p-3 text-center rounded-xl border card-premium animate-bounce-in"
                  style={{ '--glow-color': ltTier.color, animationDelay: `${0.9 + i * 0.1}s` } as React.CSSProperties}
                >
                  <div className="text-base sm:text-lg font-black" style={{ color: ltTier.color, textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>{ltTier.shortName}</div>
                  <div className="text-[10px] text-muted-foreground/80">{ltTier.minPoints} pts</div>
                  <div className="text-[9px] mt-1 font-bold" style={{ color: ltTier.color, textShadow: '0 1px 2px rgba(0,0,0,0.4)' }}>+{TIER_POINTS[ltKey]} pts/win</div>
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
