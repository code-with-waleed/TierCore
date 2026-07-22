'use client'

import { useState, useEffect } from 'react'
import useSWR from 'swr'
import Link from 'next/link'
import { GAME_MODES } from '@/lib/game-modes'
import { getCombatRankFromPoints } from '@/lib/points'
import { RANK_EMBLEMS } from '@/lib/rank-emblems'
import { formatRelativeTime, cn, swrFetcher } from '@/lib/utils'

const REGION_FLAGS: Record<string, string> = {
  NA: '/images/region-na.svg',
  EU: '/images/region-eu.svg',
  AS: '/images/region-as.svg',
  AU: '/images/region-au.svg',
}

const OCT_CLIP = 'polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)'

export default function PlayerPage({ params }: { params: Promise<{ id: string }> }) {
  const [resolvedId, setResolvedId] = useState<string | null>(null)

  useEffect(() => {
    params.then(({ id }) => setResolvedId(id))
  }, [params])

  const { data: player, error } = useSWR(
    resolvedId ? `/api/players/${resolvedId}` : null,
    swrFetcher,
    { revalidateOnFocus: false, dedupingInterval: 5000 }
  )

  const loading = !player && !error
  const playerData = player?.data
  const errMsg = error ? 'Failed to load player' : !loading && !playerData ? 'Player not found' : ''

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="flex flex-col items-center gap-6 mb-12">
          <div className="w-32 h-32 sm:w-44 sm:h-44 rounded-full bg-white/5 animate-pulse" />
          <div className="h-8 w-48 rounded bg-white/5 animate-pulse" />
          <div className="h-4 w-32 rounded bg-white/5 animate-pulse" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-white/5 animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-32 rounded-xl bg-white/5 animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (errMsg) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-24 text-center">
        <div className="text-6xl mb-4 opacity-30">!</div>
        <div className="text-lg text-red-400/80 font-medium">{errMsg}</div>
      </div>
    )
  }

  if (!playerData) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-24 text-center">
        <div className="text-6xl mb-4 opacity-30">?</div>
        <div className="text-lg text-white/40 font-medium">Player not found</div>
      </div>
    )
  }

  const mainModeIds = GAME_MODES.filter(m => m.id !== 'overall').map(m => m.id)

  const modeStatsMap: Record<string, any> = {}
  let totalPoints = 0
  let totalWins = 0
  let totalLosses = 0
  let totalDraws = 0
  for (const ms of playerData.modeStats ?? []) {
    if (!mainModeIds.includes(ms.mode)) continue
    modeStatsMap[ms.mode] = ms
    totalPoints += ms.points ?? 0
    totalWins += ms.wins ?? 0
    totalLosses += ms.losses ?? 0
    totalDraws += ms.draws ?? 0
  }
  const totalMatches = totalWins + totalLosses + totalDraws
  const winRate = totalMatches > 0 ? Math.round((totalWins / totalMatches) * 100) : 0

  const combatRank = getCombatRankFromPoints(totalPoints)
  const EmblemComp = RANK_EMBLEMS[combatRank.key]

  const displayModes = GAME_MODES.filter(m => m.id !== 'overall')
  const tierNum = playerData.currentTier?.key ? parseInt(playerData.currentTier.key.match(/\d+$/)?.[0] ?? '5') : null

  const flagSrc = playerData.region ? REGION_FLAGS[playerData.region] : null

  const resultColor = (r: string) =>
    r === 'win' ? '#22c55e' : r === 'loss' ? '#ef4444' : '#a1a1aa'

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      {/* ===== HERO ===== */}
      <div className="relative mb-10 sm:mb-14">
        {/* Background */}
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            background: `linear-gradient(135deg, ${combatRank.color}08 0%, transparent 50%, ${combatRank.color}04 100%)`,
            border: `1px solid ${combatRank.color}15`,
            clipPath: 'polygon(1.2rem 0%, 100% 0%, 100% calc(100% - 1.2rem), calc(100% - 1.2rem) 100%, 0% 100%, 0% 1.2rem)',
          }}
        />
        <div
          className="absolute inset-[1px] rounded-2xl pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, rgba(0,0,0,0.6) 0%, rgba(28,28,28,0.8) 100%)',
            clipPath: 'polygon(1.2rem 0%, 100% 0%, 100% calc(100% - 1.2rem), calc(100% - 1.2rem) 100%, 0% 100%, 0% 1.2rem)',
          }}
        />

        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-end gap-6 sm:gap-10 px-6 sm:px-10 py-8 sm:py-10">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div className="w-28 h-28 sm:w-40 sm:h-40 rounded-full overflow-hidden border-2 border-white/10 shadow-2xl shadow-black/60"
              style={{ borderColor: `${combatRank.color}40` }}>
              <img
                src={`https://render.crafty.gg/3d/bust/${playerData.username}`}
                alt={playerData.username}
                className="w-full h-full object-cover object-bottom scale-110 translate-y-2"
                onError={(e: any) => { e.target.src = `https://mc-heads.net/avatar/${playerData.username}/64` }}
              />
            </div>
            {EmblemComp && (
              <div className="absolute -bottom-2 -right-2 sm:-bottom-3 sm:-right-3 drop-shadow-xl">
                <EmblemComp size={40} />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 text-center sm:text-left min-w-0">
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              {playerData.username}
            </h1>
            <div className="flex items-center justify-center sm:justify-start gap-3 mt-2 sm:mt-3 flex-wrap">
              {/* Rank */}
              {EmblemComp && (
                <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded"
                  style={{
                    background: `${combatRank.color}15`,
                    color: combatRank.color,
                    border: `1px solid ${combatRank.color}30`,
                  }}>
                  {combatRank.name}
                </span>
              )}
              {/* Region */}
              {flagSrc && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}>
                  <div className="w-5 h-5 rounded-full overflow-hidden flex-shrink-0">
                    <img src={flagSrc} alt={playerData.region} className="w-full h-full object-cover" />
                  </div>
                  <span className="text-[11px] font-bold text-white/70">{playerData.region}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ===== STATS GRID ===== */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-10 sm:mb-14">
        {[
          { label: 'Total Points', value: totalPoints.toLocaleString(), color: combatRank.color },
          { label: 'Matches', value: totalMatches.toLocaleString(), color: '#a1a1aa' },
          { label: 'Win Rate', value: totalMatches > 0 ? `${winRate}%` : '—', color: winRate >= 50 ? '#22c55e' : '#ef4444' },
          { label: 'Best Mode', value: (() => { const b = [...(playerData.modeStats ?? [])].sort((a: any, b: any) => (b.points ?? 0) - (a.points ?? 0))[0]; return b ? (GAME_MODES.find(m => m.id === b.mode)?.name ?? b.mode) : '—' })(), color: '#fbbf24' },
        ].map(stat => (
          <div key={stat.label} className="relative group">
            <div className="absolute inset-0 rounded-xl pointer-events-none opacity-40 group-hover:opacity-70 transition-opacity"
              style={{
                background: `linear-gradient(135deg, ${stat.color}10, transparent)`,
                border: `1px solid ${stat.color}20`,
                clipPath: 'polygon(0.8rem 0%, 100% 0%, 100% calc(100% - 0.8rem), calc(100% - 0.8rem) 100%, 0% 100%, 0% 0.8rem)',
              }} />
            <div className="absolute inset-[1px] rounded-xl pointer-events-none"
              style={{
                background: 'rgba(0,0,0,0.6)',
                clipPath: 'polygon(0.8rem 0%, 100% 0%, 100% calc(100% - 0.8rem), calc(100% - 0.8rem) 100%, 0% 100%, 0% 0.8rem)',
              }} />
            <div className="relative z-10 px-4 sm:px-5 py-4 sm:py-5 text-center">
              <div className="text-xl sm:text-2xl font-black tracking-tight" style={{ color: stat.color }}>
                {stat.value}
              </div>
              <div className="text-[9px] sm:text-[10px] text-white/35 uppercase tracking-widest font-medium mt-1">
                {stat.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ===== MODE TIERS ===== */}
      <div className="mb-10 sm:mb-14">
        <div className="flex items-center gap-3 mb-5 sm:mb-6">
          <div className="h-px flex-1 bg-white/5" />
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">Game Modes</h2>
          <div className="h-px flex-1 bg-white/5" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {displayModes.map(mode => {
            const stat = modeStatsMap[mode.id]
            const tColor = stat?.tier?.color ?? '#555'
            const tName = stat?.tier?.shortName ?? null
            const pts = stat?.points ?? 0
            const w = stat?.wins ?? 0
            const l = stat?.losses ?? 0
            const d = stat?.draws ?? 0
            const tm = stat?.totalMatches ?? 0
            const peak = stat?.peakPoints ?? 0
            const wr = tm > 0 ? Math.round((w / tm) * 100) : 0
            const isRanked = !!tName

            return (
              <div key={mode.id} className="relative group">
                <div className="absolute inset-0 rounded-xl pointer-events-none"
                  style={{
                    background: isRanked ? `linear-gradient(135deg, ${tColor}08, transparent)` : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${isRanked ? `${tColor}20` : 'rgba(255,255,255,0.06)'}`,
                    clipPath: 'polygon(0.8rem 0%, 100% 0%, 100% calc(100% - 0.8rem), calc(100% - 0.8rem) 100%, 0% 100%, 0% 0.8rem)',
                  }} />
                <div className="absolute inset-[1px] rounded-xl pointer-events-none"
                  style={{
                    background: 'rgba(0,0,0,0.5)',
                    clipPath: 'polygon(0.8rem 0%, 100% 0%, 100% calc(100% - 0.8rem), calc(100% - 0.8rem) 100%, 0% 100%, 0% 0.8rem)',
                  }} />

                <div className="relative z-10 p-4 sm:p-5 flex flex-col items-center gap-3">
                  {/* Mode Icon */}
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center"
                    style={{
                      background: isRanked ? `${tColor}15` : 'rgba(255,255,255,0.03)',
                      border: `1.5px solid ${isRanked ? tColor : 'rgba(255,255,255,0.06)'}`,
                    }}>
                    <img src={mode.icon} alt={mode.name} className="w-6 h-6 sm:w-7 sm:h-7 object-contain" loading="lazy" decoding="async" />
                  </div>

                  {/* Tier Badge */}
                  {isRanked ? (
                    <div
                      className="flex items-center justify-center"
                      style={{
                        clipPath: OCT_CLIP,
                        background: `linear-gradient(180deg, ${tColor}, ${tColor}40 50%, transparent)`,
                        padding: '1px',
                        boxShadow: `0 0 6px ${tColor}30`,
                      }}
                    >
                      <div
                        className="flex items-center justify-center px-2 py-0.5 sm:px-2.5 sm:py-0.5"
                        style={{
                          background: '#000',
                          clipPath: OCT_CLIP,
                          boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.06)',
                        }}
                      >
                        <span className="text-[9px] sm:text-[10px] font-bold uppercase leading-none" style={{ color: tColor }}>
                          {tName}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <span className="text-[9px] sm:text-[10px] font-bold uppercase text-white/15">Unranked</span>
                  )}

                  {/* Stats */}
                  <div className="w-full space-y-1 pt-2 border-t border-white/5">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-white/40 font-medium">{mode.name}</span>
                      <span className="text-white/70 font-bold tabular-nums">{pts.toLocaleString()} <span className="text-white/30 font-normal">pts</span></span>
                    </div>
                    <div className="flex items-center justify-between text-[9px]">
                      <span className="text-white/30">{w}W / {l}L / {d}D</span>
                      <span className="font-bold" style={{ color: wr >= 50 ? '#22c55e' : '#ef4444' }}>{wr}%</span>
                    </div>
                    <div className="flex items-center justify-between text-[9px] text-white/20">
                      <span>{tm} matches</span>
                      <span>Peak {peak.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ===== RECENT MATCHES ===== */}
      <div>
        <div className="flex items-center gap-3 mb-5 sm:mb-6">
          <div className="h-px flex-1 bg-white/5" />
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">Recent Matches</h2>
          <div className="h-px flex-1 bg-white/5" />
        </div>

        {(!playerData.recentMatches || playerData.recentMatches.length === 0) ? (
          <div className="relative rounded-xl text-center py-12 sm:py-16">
            <div className="absolute inset-0 rounded-xl pointer-events-none" style={{
              border: '1px solid rgba(255,255,255,0.04)',
              clipPath: 'polygon(1rem 0%, 100% 0%, 100% calc(100% - 1rem), calc(100% - 1rem) 100%, 0% 100%, 0% 1rem)',
            }} />
            <div className="absolute inset-[1px] rounded-xl pointer-events-none" style={{
              background: 'rgba(0,0,0,0.3)',
              clipPath: 'polygon(1rem 0%, 100% 0%, 100% calc(100% - 1rem), calc(100% - 1rem) 100%, 0% 100%, 0% 1rem)',
            }} />
            <div className="relative z-10">
              <div className="text-4xl mb-3 opacity-20">⚔</div>
              <div className="text-sm text-white/25 font-medium">No matches played yet</div>
            </div>
          </div>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            {playerData.recentMatches.map((match: any, idx: number) => {
              const rColor = resultColor(match.result)
              return (
                <div key={match.id} className="relative group">
                  <div className="absolute inset-0 rounded-lg pointer-events-none"
                    style={{
                      border: `1px solid ${rColor}15`,
                      clipPath: 'polygon(0.6rem 0%, 100% 0%, 100% calc(100% - 0.6rem), calc(100% - 0.6rem) 100%, 0% 100%, 0% 0.6rem)',
                    }} />
                  <div className="absolute inset-[1px] rounded-lg pointer-events-none"
                    style={{
                      background: `linear-gradient(135deg, ${rColor}05, transparent)`,
                      clipPath: 'polygon(0.6rem 0%, 100% 0%, 100% calc(100% - 0.6rem), calc(100% - 0.6rem) 100%, 0% 100%, 0% 0.6rem)',
                    }} />
                  <div className="relative z-10 flex items-center gap-3 sm:gap-4 px-3 sm:px-5 py-3 sm:py-3.5">
                    {/* Result badge */}
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{
                        background: `${rColor}12`,
                        border: `1px solid ${rColor}25`,
                      }}>
                      <span className="text-xs sm:text-sm font-black" style={{ color: rColor }}>
                        {match.result === 'win' ? 'W' : match.result === 'loss' ? 'L' : 'D'}
                      </span>
                    </div>

                    {/* Opponent */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm font-bold text-white/80 truncate">
                          vs {match.opponent}
                        </span>
                        <span className="text-[9px] sm:text-[10px] font-medium uppercase text-white/25 flex-shrink-0">
                          {match.mode ?? ''}
                        </span>
                      </div>
                      <div className="text-[9px] text-white/20 mt-0.5 sm:hidden">
                        {formatRelativeTime(match.date)}
                      </div>
                    </div>

                    {/* Points */}
                    <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                      <span className="text-xs sm:text-sm font-black font-mono tabular-nums" style={{ color: rColor }}>
                        {match.result === 'win' ? '+' : match.result === 'loss' ? '' : '±'}{match.pointsChange ?? 0}
                      </span>
                      <span className="text-[9px] sm:text-[10px] text-white/25 hidden sm:inline whitespace-nowrap">
                        {formatRelativeTime(match.date)}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
