'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import { GAME_MODES, isValidMode, getModeName } from '@/lib/game-modes'
import { DEFAULT_TIERS } from '@/lib/points'
import { cn } from '@/lib/utils'
import type { LeaderboardEntry } from '@/types'

const REGION_COLORS: Record<string, string> = {
  NA: '#3B82F6',
  EU: '#8B5CF6',
  AS: '#F59E0B',
  AU: '#22C55E',
}

const TIER_COLUMNS = [
  { num: 1, tiers: ['ht1', 'lt1'] },
  { num: 2, tiers: ['ht2', 'lt2'] },
  { num: 3, tiers: ['ht3', 'lt3'] },
  { num: 4, tiers: ['ht4', 'lt4'] },
  { num: 5, tiers: ['ht5', 'lt5'] },
]

const RANKING_MODES = GAME_MODES.filter(gm => gm.id !== 'overall')

function TierHead({ src, username }: { src: string; username: string }) {
  const [imgSrc, setImgSrc] = useState(src)
  return (
    <img
      src={imgSrc}
      alt={username}
      className="w-6 h-6 sm:w-7 sm:h-7 rounded object-cover bg-accent flex-shrink-0"
      onError={() => setImgSrc(`https://mc-heads.net/avatar/${username}/64`)}
    />
  )
}

function PlayerRow({ entry }: { entry: LeaderboardEntry }) {
  const regionColor = REGION_COLORS[entry.region ?? ''] ?? '#6B7280'
  const isHT = entry.tierKey?.startsWith('ht')
  const tier = DEFAULT_TIERS.find(t => t.key === entry.tierKey)
  const tierColor = tier?.color ?? '#888'
  return (
    <Link
      href={`/player/${entry.playerId}`}
      className={cn(
        'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-colors group/row min-w-0',
        isHT ? 'bg-white/[0.04] hover:bg-white/[0.08]' : 'hover:bg-white/5'
      )}
    >
      <span
        className="text-[10px] font-bold leading-none flex-shrink-0 rounded px-1.5 py-0.5"
        style={{
          backgroundColor: `${tierColor}20`,
          color: '#fff',
          textShadow: '0 1px 2px rgba(0,0,0,0.4)',
        }}
      >
        {entry.tierKey?.toUpperCase()}
      </span>
      <TierHead src={entry.avatarUrl ?? `https://render.crafty.gg/renders/body/${entry.username}`} username={entry.username} />
      <span className="text-xs font-semibold truncate text-foreground/85 group-hover/row:text-amber-400 transition-colors flex-1 min-w-0">
        {entry.username}
      </span>
      {entry.region && (
        <span
          className="px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wide uppercase flex-shrink-0 leading-tight"
          style={{
            backgroundColor: `${regionColor}20`,
            color: '#fff',
            border: `1px solid ${regionColor}40`,
            textShadow: '0 1px 2px rgba(0,0,0,0.3)',
          }}
        >
          {entry.region}
        </span>
      )}
    </Link>
  )
}

export default function RankingModePage() {
  const params = useParams()
  const router = useRouter()
  const mode = params.mode as string

  const validMode = isValidMode(mode) ? mode : 'sword'

  useEffect(() => {
    if (!isValidMode(mode)) {
      router.replace('/ranking/sword')
    }
  }, [mode, router])

  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchLeaderboard()
  }, [validMode])

  async function fetchLeaderboard() {
    setLoading(true)
    try {
      const params = new URLSearchParams({ mode: validMode, sort: 'tier' })
      const res = await fetch(`/api/leaderboard?${params}`)
      const data = await res.json()
      setEntries(data.data ?? [])
    } catch {
      setEntries([])
    } finally {
      setLoading(false)
    }
  }

  const filtered = useMemo(() => {
    if (!search.trim()) return entries
    const q = search.toLowerCase()
    return entries.filter(e => e.username.toLowerCase().includes(q))
  }, [search, entries])

  const columnPlayers = useMemo(() => {
    const map: Record<number, LeaderboardEntry[]> = {}
    for (const col of TIER_COLUMNS) {
      const players: LeaderboardEntry[] = []
      for (const tierKey of col.tiers) {
        const tierPlayers = filtered.filter(e => e.tierKey === tierKey)
        players.push(...tierPlayers)
      }
      if (players.length > 0) map[col.num] = players
    }
    return map
  }, [filtered])

  const noResults = search.trim() && filtered.length === 0

  if (!isValidMode(mode)) return null

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            <span className="text-gradient-gold-static">{getModeName(validMode)}</span> Rankings
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Tier board — newest players first</p>
        </div>

        <div className="relative w-full sm:w-56">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search player..."
            className="w-full rounded-lg border border-border/50 bg-card/50 px-3 py-2 pl-9 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-amber-500/40 focus:ring-1 focus:ring-amber-500/20 transition-all"
          />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Game mode tabs */}
      <div className="rounded-xl border border-border/40 bg-card/40 p-1.5 mb-6">
        <div className="flex overflow-x-auto gap-0.5 -mx-1.5 px-1.5 sm:mx-0 sm:px-0 scrollbar-hide">
          {RANKING_MODES.map(gm => {
            const isActive = validMode === gm.id
            return (
              <Link
                key={gm.id}
                href={`/ranking/${gm.id}`}
                className={cn(
                  'relative flex items-center gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium whitespace-nowrap transition-all shrink-0 rounded-lg',
                  isActive
                    ? 'text-amber-400 bg-amber-500/10'
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/[0.04]'
                )}
              >
                <img src={gm.icon} alt={gm.name} className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span>{gm.name}</span>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Tier Board */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="rounded-xl border border-border/30 bg-card/30 p-4 space-y-3 animate-skeleton">
              <div className="h-5 w-20 rounded bg-card/50" />
              {[...Array(4)].map((_, j) => (
                <div key={j} className="h-7 rounded bg-card/50" />
              ))}
            </div>
          ))}
        </div>
      ) : noResults ? (
        <div className="text-center py-24 text-muted-foreground">No players found</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {TIER_COLUMNS.map(col => {
            const players = columnPlayers[col.num] || []
            const tier = DEFAULT_TIERS.find(t => t.key === col.tiers[0])
            return (
              <div key={col.num} className="rounded-xl border border-border/40 bg-card/40 p-3 sm:p-4">
                <div
                  className="text-xs font-bold tracking-wider mb-3 pb-2 border-b border-border/30"
                  style={{ color: tier?.color ?? '#888' }}
                >
                  Tier {col.num}
                </div>
                <div className="space-y-0.5">
                  {players.length === 0 && (
                    <p className="text-[10px] text-muted-foreground/60 px-2.5 py-2 italic">Empty</p>
                  )}
                  {players.map(p => (
                    <PlayerRow key={p.playerId} entry={p} />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}