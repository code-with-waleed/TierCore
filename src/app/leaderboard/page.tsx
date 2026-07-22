'use client'

import { useState } from 'react'
import Link from 'next/link'
import useSWR from 'swr'
import { GAME_MODES } from '@/lib/game-modes'
import { getCombatRankFromPoints, TIER_ORDER } from '@/lib/points'
import { RANK_EMBLEMS } from '@/lib/rank-emblems'
import { swrFetcher } from '@/lib/utils'
import { PlayerContextMenu } from '@/components/ui/PlayerContextMenu'
import type { LeaderboardEntry, ModeStatInfo } from '@/types'

const REGION_COLORS: Record<string, string> = {
  NA: '#3B82F6',
  EU: '#8B5CF6',
  AS: '#F59E0B',
  AU: '#22C55E',
}

const GAME_MODE_KEYS = ['sword', 'axe', 'pot', 'nethpot', 'uhc', 'mace', 'smp', 'vanilla'] as const
const MODE_IMAGES: Record<string, string> = Object.fromEntries(
  GAME_MODES.filter(m => m.id !== 'overall').map(m => [m.id, m.icon])
)

function Avatar({ src, username }: { src: string; username: string }) {
  const [imgSrc, setImgSrc] = useState(src)
  return (
    <div className="relative w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0">
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-amber-600/10 rounded-lg" />
      <img
        src={imgSrc}
        alt={username}
        className="w-full h-full rounded-lg object-cover bg-accent"
        onError={() => setImgSrc(`https://mc-heads.net/avatar/${username}/64`)}
      />
    </div>
  )
}

function GameModeRow({ modeStats, mode }: { modeStats: ModeStatInfo[]; mode?: string }) {
  const statsMap = new Map(modeStats.map(s => [s.mode, s]))
  const keysToShow = mode && mode !== 'overall' ? [mode] : GAME_MODE_KEYS
  const sortedKeys = [...keysToShow].sort((a, b) => {
    const aHas = statsMap.has(a) ? 0 : 1
    const bHas = statsMap.has(b) ? 0 : 1
    return aHas - bHas
  })
  return (
    <div className="flex items-center gap-1 sm:gap-2">
      {sortedKeys.map(key => {
        const stat = statsMap.get(key)
        const hasTier = stat && stat.tier && stat.tierColor
        return (
          <div
            key={key}
            className={`relative flex flex-col items-center gap-1 group/icon transition-all duration-200 ${hasTier ? 'hover:scale-110 hover:-translate-y-0.5' : ''}`}
          >
            {/* Tooltip */}
            <div className="absolute bottom-full mb-2.5 left-1/2 -translate-x-1/2 pointer-events-none opacity-0 group-hover/icon:opacity-100 transition-all duration-200 z-50">
              <div className="bg-[#0a0806] border border-border/60 rounded-lg px-3 py-2 shadow-xl shadow-black/50 whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: hasTier ? stat!.tierColor! : '#555' }} />
                  <span className={`text-xs font-bold ${!hasTier ? 'text-muted-foreground/60' : 'text-foreground'}`}>{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[11px] font-bold" style={{ color: hasTier ? stat!.tierColor! : '#888' }}>
                    {stat?.tier ?? 'Unranked'}
                  </span>
                  <span className="text-[10px] text-muted-foreground/50">|</span>
                  <span className="text-[11px] font-mono font-bold text-foreground/80">{stat?.points ?? 0}</span>
                  <span className="text-[9px] text-muted-foreground/50">points</span>
                </div>
              </div>
              <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-[#0a0806] border-r border-b border-border/60 rotate-45 -mt-1" />
            </div>
            <div
              className={`w-9 h-9 sm:w-16 sm:h-16 tier-icon-circle ${!hasTier ? 'opacity-30 grayscale' : ''}`}
              style={{
                backgroundColor: hasTier ? `${stat!.tierColor!}15` : 'transparent',
                color: hasTier ? stat!.tierColor! : '#ffffff40',
                borderColor: hasTier ? stat!.tierColor! : 'rgba(255,255,255,0.06)',
                boxShadow: hasTier ? `0 0 10px ${stat!.tierColor!}30` : 'none',
              }}
            >
              <img
                src={MODE_IMAGES[key]}
                alt={key}
                className="w-3.5 h-3.5 sm:w-7 sm:h-7 object-contain"
              />
            </div>
            <span
              className={`text-[7px] sm:text-[10px] font-bold leading-tight transition-all duration-200 ${!hasTier ? 'opacity-30' : ''}`}
              style={{
                color: hasTier ? stat!.tierColor! : '#ffffff20',
                textShadow: hasTier ? `0 0 4px ${stat!.tierColor!}40` : 'none',
              }}
            >
              {stat?.tier ?? '--'}
            </span>
          </div>
        )
      })}
    </div>
  )
}

function CombatRankDisplay(props: { rankKey: string; rankName: string; points: number }) {
  const Emblem = RANK_EMBLEMS[props.rankKey]
  if (!Emblem) return null
  return (
    <div className="relative group/rank">
      <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 pointer-events-none opacity-0 group-hover/rank:opacity-100 transition-all duration-200 z-50">
        <div className="bg-[#0a0806] border border-border/60 rounded-lg px-3 py-2 shadow-xl shadow-black/50 whitespace-nowrap">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold" style={{ color: getCombatRankFromPoints(props.points).color }}>{props.rankName}</span>
            <span className="text-[10px] text-muted-foreground/50">|</span>
            <span className="text-[11px] font-mono font-bold text-foreground/80">{props.points.toLocaleString()}</span>
            <span className="text-[9px] text-muted-foreground/50">points</span>
          </div>
        </div>
        <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-[#0a0806] border-r border-b border-border/60 rotate-45 -mt-1" />
      </div>
      <div className="transition-all duration-200 hover:scale-110">
        <Emblem size={44} glow />
      </div>
    </div>
  )
}

export default function LeaderboardPage() {
  const [search, setSearch] = useState('')

  const params = new URLSearchParams({ limit: '50', mode: 'overall' })
  if (search) params.set('search', search)
  const { data, isLoading: loading } = useSWR<{ data: LeaderboardEntry[] }>(
    `/api/leaderboard?${params}`,
    swrFetcher,
    { revalidateOnFocus: false, dedupingInterval: 5000 }
  )
  const entries: LeaderboardEntry[] = data?.data ?? []

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Leaderboard</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 bg-card/50 px-3 py-1 rounded-md border border-border/40 inline-block">Top players this season</p>
        </div>
        <div className="flex items-center gap-3">
          <form onSubmit={handleSearch} className="relative w-full sm:w-56">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search player..."
              className="w-full rounded-lg border border-border/50 bg-card/50 px-3 py-2 pl-9 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-amber-500/40 focus:ring-1 focus:ring-amber-500/20 transition-all"
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </form>
          <div className="text-sm text-muted-foreground bg-card/50 px-3 py-1.5 rounded-lg border border-border/50 flex-shrink-0">
            {entries.length} players
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-[120px] sm:h-[100px] rounded-xl bg-card/30 border border-border/30 animate-skeleton" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-24 text-muted-foreground bg-card/30 rounded-xl border border-border/30">No players yet</div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry, i) => {
            const combatRank = getCombatRankFromPoints(entry.overallPoints ?? entry.points)
            const regionColor = REGION_COLORS[entry.region ?? ''] ?? '#6B7280'
            const tierSummary = `${combatRank.name} (${entry.points.toLocaleString()} pts)`
            return (
              <PlayerContextMenu key={entry.playerId} username={entry.username} tiers={tierSummary}>
              <Link
                href={`/player/${entry.playerId}`}
                className="group flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 card-premium"
              >
                {/* Left Section: Rank + Avatar + Info */}
                <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto flex-1 min-w-0">
                  {/* Rank Number */}
                  <div className="w-8 sm:w-12 flex-shrink-0 text-center">
                    <span className={`text-lg sm:text-2xl font-black block leading-none ${
                      i === 0 ? 'text-yellow-400 drop-shadow-[0_0_8px_rgba(234,179,8,0.4)]' : i === 1 ? 'text-gray-300' : i === 2 ? 'text-amber-600' : 'text-muted-foreground/50'
                    }`}>
                      #{entry.rank}
                    </span>
                    <span className="text-[8px] sm:text-[10px] font-semibold tracking-wide mt-0.5 block" style={{ color: combatRank.color }}>
                      {combatRank.name}
                    </span>
                  </div>

                  {/* Avatar */}
                  <Avatar src={entry.avatarUrl ?? `https://render.crafty.gg/renders/body/${entry.username}`} username={entry.username} />

                  {/* Name + Points */}
                  <div className="min-w-0 flex-1">
                    <div className="text-base sm:text-lg font-bold truncate group-hover:text-amber-400 transition-colors">
                      {entry.username}
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold shadow-sm" style={{ backgroundColor: `${combatRank.color}18`, color: combatRank.color, border: `1px solid ${combatRank.color}30`, boxShadow: `0 0 8px ${combatRank.color}20` }}>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        <span className="tabular-nums">{entry.points.toLocaleString()}</span>
                      </span>
                    </div>
                    {/* Region Badge inline on mobile */}
                    <div className="flex sm:hidden items-center gap-2 mt-1">
                      <div
                        className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase"
                        style={{
                          backgroundColor: `${regionColor}18`,
                          color: regionColor,
                          border: `1px solid ${regionColor}30`,
                        }}
                      >
                        {entry.region ?? '--'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Section: Combat Rank Emblem + Game Mode Icons */}
                <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto sm:pl-0">
                  {/* Combat Rank SVG Emblem */}
                  <div className="hidden sm:flex flex-shrink-0">
                    <CombatRankDisplay
                      rankKey={combatRank.key}
                      rankName={combatRank.name}
                      points={entry.points}
                    />
                  </div>

                  {/* Game Mode Icons with Tier Badges */}
                  <GameModeRow modeStats={entry.modeStats} />

                  {/* Region Badge desktop */}
                  <div className="hidden sm:flex flex-shrink-0">
                    <div
                      className="px-2.5 py-1 rounded-md text-xs font-bold tracking-wide uppercase"
                      style={{
                        backgroundColor: `${regionColor}18`,
                        color: regionColor,
                        border: `1px solid ${regionColor}30`,
                      }}
                    >
                      {entry.region ?? '--'}
                    </div>
                  </div>
                </div>
              </Link>
              </PlayerContextMenu>
            )
          })}
        </div>
      )}
    </div>
  )
}
