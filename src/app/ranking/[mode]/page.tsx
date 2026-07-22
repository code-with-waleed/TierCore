'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import useSWR from 'swr'
import { GAME_MODES, isValidMode, getModeName } from '@/lib/game-modes'
import { getCombatRankFromPoints, COMBAT_RANKS, DEFAULT_TIERS, TIER_POINTS, TIER_ORDER } from '@/lib/points'
import { RANK_EMBLEMS } from '@/lib/rank-emblems'
import { cn, swrFetcher } from '@/lib/utils'
import { PlayerContextMenu } from '@/components/ui/PlayerContextMenu'
import type { LeaderboardEntry } from '@/types'
import { GamemodeRanking } from '@/components/ranking/GamemodeRanking'

const REGION_FLAGS: Record<string, string> = {
  NA: '/images/region-na.svg',
  EU: '/images/region-eu.svg',
  AS: '/images/region-as.svg',
  AU: '/images/region-au.svg',
}

const GAME_MODE_KEYS = ['sword', 'axe', 'pot', 'nethpot', 'uhc', 'mace', 'smp', 'vanilla'] as const
const MODE_IMAGES: Record<string, string> = Object.fromEntries(
  GAME_MODES.filter(m => m.id !== 'overall').map(m => [m.id, m.icon])
)

function RegionBadge({ region }: { region: string | null }) {
  const flagSrc = region ? REGION_FLAGS[region] : null
  if (!flagSrc || !region) return null
  return (
    <div className="relative w-8 h-8 sm:w-12 sm:h-12 flex-shrink-0">
      <div className="absolute inset-0 flex items-center justify-center">
        <img
          src={flagSrc}
          alt={region}
          className="w-full h-full object-contain drop-shadow-[0_0_6px_rgba(255,255,255,0.1)]"
        />
      </div>
      <span className="absolute inset-0 flex items-center justify-center text-[8px] sm:text-[11px] font-black text-white/90 tracking-tight leading-none">{region}</span>
    </div>
  )
}

function PortalTooltip({ children, iconRef, show, onEnter, onLeave }: { children: React.ReactNode; iconRef: React.RefObject<HTMLDivElement | null>; show: boolean; onEnter?: () => void; onLeave?: () => void }) {
  const [pos, setPos] = useState({ top: 0, left: 0 })

  useEffect(() => {
    if (!show || !iconRef.current) return
    const rect = iconRef.current.getBoundingClientRect()
    setPos({ top: rect.top - 8, left: rect.left + rect.width / 2 })
  }, [show, iconRef])

  if (!show || typeof document === 'undefined') return null

  return createPortal(
    <div
      className="fixed z-[99999]"
      style={{ top: pos.top, left: pos.left, transform: 'translate(-50%, -100%)' }}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      {children}
    </div>,
    document.body
  )
}

function TierIcon({ stat, modeKey }: { stat: { tier: string | null; tierColor: string | null; points: number; peakPoints: number; wins: number; losses: number; draws: number; totalMatches: number } | undefined; modeKey: string }) {
  const iconRef = useRef<HTMLDivElement>(null)
  const [hovered, setHovered] = useState(false)
  const hideTimerRef = useRef<ReturnType<typeof setTimeout>>()

  const show = () => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
    setHovered(true)
  }

  const hide = () => {
    hideTimerRef.current = setTimeout(() => setHovered(false), 250)
  }

  return (
    <div className={`flex flex-col items-center gap-0.5 sm:gap-1 ${!stat?.tier ? 'opacity-30 grayscale' : ''}`}>
      <div
        ref={iconRef}
        className="w-8 h-8 sm:w-14 sm:h-14 rounded-full flex items-center justify-center flex-shrink-0 relative z-10"
        style={{
          background: stat?.tier ? `${stat.tierColor!}20` : 'rgba(255,255,255,0.04)',
          border: `2px solid ${stat?.tier ? stat.tierColor! : 'rgba(255,255,255,0.06)'}`,
        }}
        onMouseEnter={show}
        onMouseLeave={hide}
      >
        <img src={MODE_IMAGES[modeKey]} alt={modeKey} className="w-4 h-4 sm:w-6 sm:h-6 object-contain" />
      </div>
      {/* Tier text inside octagon */}
      {stat?.tier && (() => {
        const tierNum = parseInt(stat.tier!.match(/\d+$/)?.[0] ?? '99', 10)
        const isT1 = tierNum <= 1
        const isT2 = tierNum === 2
        const bWidth = isT1 || isT2 ? '1.5px' : '1px'
        const bColor = isT1 ? '#f7bd32' : '#b7bcc2'
        return (
        <div
          className="flex items-center justify-center"
          style={{
            clipPath: 'polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)',
            background: `linear-gradient(180deg, ${bColor}, ${bColor}40 50%, transparent)`,
            padding: bWidth,
            boxShadow: `0 0 6px ${bColor}40`,
          }}
        >
          <div
            className="flex items-center justify-center px-1 py-0.5 sm:px-1.5 sm:py-0.5"
            style={{
              background: '#000',
              clipPath: 'polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)',
              boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.06)',
            }}
          >
            <span
              className="text-[9px] sm:text-sm font-bold uppercase leading-none whitespace-nowrap"
              style={{ color: stat.tierColor!, fontFamily: 'Technor, sans-serif' }}
            >
              {stat.tier}
            </span>
          </div>
        </div>
        )})()}
      {!stat?.tier && (
        <span className="text-[6px] sm:text-[10px] font-bold uppercase text-white/20 leading-none">---</span>
      )}
      <PortalTooltip iconRef={iconRef} show={hovered} onEnter={show} onLeave={hide}>
        <div className="relative px-3 py-2 shadow-xl shadow-black/60 whitespace-nowrap min-w-[180px]"
          style={{
            background: 'linear-gradient(90deg,#131313,#1c1c1c 123.09%)',
            clipPath: 'polygon(0.5rem 0%,100% 0%,100% calc(100% - 0.5rem),calc(100% - 0.5rem) 100%,0% 100%,0% 0.5rem)',
          }}
        >
          <div className="absolute inset-0 pointer-events-none" style={{
            background: 'linear-gradient(133deg,rgba(255,255,255,0.2),transparent)',
            clipPath: 'polygon(0.5rem 0%,100% 0%,100% calc(100% - 0.5rem),calc(100% - 0.5rem) 100%,0% 100%,0% 0.5rem)',
          }} />
          <div className="absolute inset-[1px] pointer-events-none" style={{
            background: 'linear-gradient(90deg,#131313,#1c1c1c 123.09%)',
            clipPath: 'polygon(0.5rem 0%,100% 0%,100% calc(100% - 0.5rem),calc(100% - 0.5rem) 100%,0% 100%,0% 0.5rem)',
          }} />

          <div className="relative z-10 flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: stat?.tierColor ?? '#555' }} />
              <span className="text-[10px] font-bold uppercase tracking-wider" style={{ fontFamily: 'Technor, sans-serif', color: stat?.tierColor ?? '#fff' }}>{modeKey}</span>
            </div>
            <span className="text-[9px] font-bold px-1.5 py-0.5 border" style={{ borderColor: `${stat?.tierColor ?? '#555'}40`, color: stat?.tierColor ?? '#888', backgroundColor: `${stat?.tierColor ?? '#555'}10` }}>
              {stat?.tier ?? 'UNRANKED'}
            </span>
          </div>

          <div className="relative z-10 flex items-baseline gap-2 mt-1.5">
            <span className="text-[13px] font-black" style={{ fontFamily: 'Technor, sans-serif' }}>{stat?.points ?? 0}</span>
            <span className="text-[7px] text-white/30 uppercase tracking-wider font-medium">PTS</span>
            <span className="ml-auto text-[8px] text-white/30">
              <span className="text-white/50">Peak </span>{stat?.peakPoints ?? 0}
            </span>
          </div>

          {(stat?.totalMatches ?? 0) > 0 && (
            <div className="relative z-10 mt-1.5 pt-1.5 border-t border-white/5 flex items-center gap-2.5 text-[9px]">
              <span className="text-white/40">{stat?.totalMatches ?? 0} <span className="text-white/20">mths</span></span>
              <span className="text-white/40">{stat?.wins ?? 0}<span className="text-white/20">W</span> <span className="text-white/30">/</span> {stat?.losses ?? 0}<span className="text-white/20">L</span></span>
              <span className="text-white/50 font-bold">{Math.round(((stat?.wins ?? 0) / Math.max(stat?.totalMatches ?? 1, 1)) * 100)}%</span>
            </div>
          )}
        </div>
        <div className="absolute top-full left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-[#1c1c1c] rotate-45 -mt-[5px] border-r border-b border-white/10" />
      </PortalTooltip>
    </div>
  )
}

function PlayerCard({ entry, rank }: { entry: LeaderboardEntry; rank: number }) {
  const combatRank = getCombatRankFromPoints(entry.overallPoints ?? entry.points)
  const EmblemComp = RANK_EMBLEMS[combatRank.key]
  const isTopThree = rank < 3

  const posClass = rank === 0 ? 'pos-1' : rank === 1 ? 'pos-2' : rank === 2 ? 'pos-3' : rank === 3 ? 'pos-4' : 'pos-5'

  const posGradients: Record<string, string> = {
    'pos-1': 'linear-gradient(180deg,#f7bd32,#efb12a 45%,#be8921 80%,#a06f16)',
    'pos-2': 'linear-gradient(180deg,#b7bcc2,#a2a8af 45%,#858b92 80%,#7b8087)',
    'pos-3': 'linear-gradient(180deg,#a1503d,#783f2f 45%,#653025 80%,#54261c)',
    'pos-4': 'linear-gradient(180deg,#944e2a,#793c1d 45%,#633116 80%,#542c19)',
    'pos-5': '#474a51',
  }
  const gradient = posGradients[posClass] ?? '#30333B'
  const isPos1 = rank === 0
  const isPos2 = rank === 1
  const isPos3 = rank === 2

  const statsMap = new Map(entry.modeStats.map(s => [s.mode, s]))
  const sortedKeys = [...GAME_MODE_KEYS].sort((a, b) => {
    const aHas = statsMap.has(a) ? 0 : 1
    const bHas = statsMap.has(b) ? 0 : 1
    return aHas - bHas
  })

  const clipPathOctPct = 'polygon(15% 0%, 85% 0%, 100% 15%, 100% 85%, 85% 100%, 15% 100%, 0% 85%, 0% 15%)'

  const tierSummary = `${combatRank.name} (${entry.overallPoints ?? entry.points} pts)`

  return (
    <PlayerContextMenu username={entry.username} tiers={tierSummary}>
      <Link
        href={`/player/${entry.playerId}`}
        className="group relative z-50 flex gap-1.5 sm:gap-3 cursor-pointer transition-all duration-200 hover:scale-[1.005]"
      >
      {/* Avatar section */}
      <div className="relative flex-shrink-0 w-20 h-20 sm:w-28 sm:h-28">
        <div className="absolute inset-0 shadow-lg shadow-black/40" style={{ background: gradient, clipPath: clipPathOctPct }} />
        <div className="absolute inset-[6%] flex items-center justify-center translate-y-2 sm:translate-y-2.5" style={{ clipPath: clipPathOctPct }}>
          <img
            src={`https://render.crafty.gg/3d/bust/${entry.username}`}
            alt={entry.username}
            className="w-full h-full object-cover object-bottom"
            onError={e => { (e.target as HTMLImageElement).src = `https://mc-heads.net/avatar/${entry.username}/64` }}
          />
        </div>


        {/* Position block - rotated square (hidden for top 3, shown by leaf) */}
        {!isTopThree && (
          <div
            className="absolute flex items-center justify-center sm:!right-[-0.8rem] sm:!top-[0.4rem] sm:!w-[1.7rem] sm:!h-[1.7rem]"
            style={{
              right: '-1rem',
              top: '0.25rem',
              width: '1.3rem',
              height: '1.3rem',
              transform: 'rotate(-45deg)',
              background: '#2a2a2a',
              border: '1.5px solid rgba(210,210,220,0.6)',
              boxShadow: '0 0 10px rgba(210,210,220,0.25)',
              zIndex: 10,
            }}
          >
            <span
              className="sm:hidden"
              style={{
                transform: 'rotate(45deg)',
                fontSize: '0.55rem',
                fontWeight: 900,
                fontFamily: 'Trap-Bold, sans-serif',
                lineHeight: 1,
                color: '#ffffffaa',
              }}
            >
              #{rank + 1}
            </span>
            <span
              className="hidden sm:inline"
              style={{
                transform: 'rotate(45deg)',
                fontSize: '0.8rem',
                fontWeight: 900,
                fontFamily: 'Trap-Bold, sans-serif',
                lineHeight: 1,
                color: '#ffffffaa',
              }}
            >
              #{rank + 1}
            </span>
          </div>
        )}

        {/* Leaf badge for top 3 */}
        {isTopThree && (
          <img
            src={`/images/rank${rank + 1}.png`}
            alt={`#${rank + 1}`}
            className="absolute object-cover object-bottom pointer-events-none sm:!top-[2.5rem] sm:!left-[-2.5rem] sm:!w-[12rem]"
            style={{
              top: '1.6rem',
              left: '-1.8rem',
              width: '7.5rem',
              aspectRatio: '1/1',
              zIndex: 5,
              filter: isPos1
                ? 'drop-shadow(0 0 32px rgba(251,183,82,0.8))'
                : isPos2
                  ? 'drop-shadow(0 0 20px rgba(147,171,203,0.5))'
                  : 'drop-shadow(0 0 20px rgba(127,75,38,0.5))',
            }}
          />
        )}
      </div>

      {/* Region - desktop only */}
      <div className="hidden sm:flex flex-col items-center absolute top-1/2 -translate-y-1/2 z-20" style={{ left: '35%', transform: 'translate(-50%, -50%)' }}>
        <RegionBadge region={entry.region} />
        <img src="/images/planet-DwX1jqVA.svg" alt="" className="w-7 h-7 mt-1 opacity-90 pointer-events-none" />
      </div>

      {/* Info panel */}
      <div
        className="relative flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4"
      >
        {/* Mobile cut-corner border layers */}
        <div className="sm:hidden">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: isPos1
                ? 'linear-gradient(180deg,#f7bd32,#fbe67b,#e5ba4c)'
                : isPos2
                  ? 'linear-gradient(180deg,#b7bcc2,#c2d4e1,#a2a8af)'
                  : isPos3
                    ? 'linear-gradient(180deg,#a1503d,#c2735a,#783f2f)'
                    : 'linear-gradient(180deg,rgba(212,175,55,0.25),rgba(212,175,55,0.06),rgba(212,175,55,0.12))',
              clipPath: 'polygon(0.5rem 0%,100% 0%,100% calc(100% - 0.5rem),calc(100% - 0.5rem) 100%,0% 100%,0% 0.5rem)',
            }}
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(133deg,rgba(255,255,255,0.15),transparent)',
              clipPath: 'polygon(0.5rem 0%,100% 0%,100% calc(100% - 0.5rem),calc(100% - 0.5rem) 100%,0% 100%,0% 0.5rem)',
            }}
          />
          <div
            className="absolute inset-[1px] pointer-events-none"
            style={{
              background: isPos1
                ? 'linear-gradient(133deg,#1a1200 2.99%,#1c1c1c)'
                : isPos2
                  ? 'linear-gradient(133deg,#0e1012 2.99%,#1c1c1c)'
                  : isPos3
                    ? 'linear-gradient(133deg,#120604 2.99%,#1c1c1c)'
                    : 'linear-gradient(133deg,#000 2.99%,#1c1c1c)',
              clipPath: 'polygon(0.5rem 0%,100% 0%,100% calc(100% - 0.5rem),calc(100% - 0.5rem) 100%,0% 100%,0% 0.5rem)',
            }}
          />
        </div>
        {/* Desktop cut-corner border layers */}
        <div className="hidden sm:block">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: isPos1
                ? 'linear-gradient(180deg,#f7bd32,#fbe67b,#e5ba4c)'
                : isPos2
                  ? 'linear-gradient(180deg,#b7bcc2,#c2d4e1,#a2a8af)'
                  : isPos3
                    ? 'linear-gradient(180deg,#a1503d,#c2735a,#783f2f)'
                    : 'linear-gradient(180deg,rgba(212,175,55,0.25),rgba(212,175,55,0.06),rgba(212,175,55,0.12))',
              clipPath: 'polygon(0.6rem 0%,100% 0%,100% calc(100% - 0.6rem),calc(100% - 0.6rem) 100%,0% 100%,0% 0.6rem)',
            }}
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(133deg,rgba(255,255,255,0.15),transparent)',
              clipPath: 'polygon(0.6rem 0%,100% 0%,100% calc(100% - 0.6rem),calc(100% - 0.6rem) 100%,0% 100%,0% 0.6rem)',
            }}
          />
          <div
            className="absolute inset-[1px] pointer-events-none"
            style={{
              background: isPos1
                ? 'linear-gradient(133deg,#1a1200 2.99%,#1c1c1c)'
                : isPos2
                  ? 'linear-gradient(133deg,#0e1012 2.99%,#1c1c1c)'
                  : isPos3
                    ? 'linear-gradient(133deg,#120604 2.99%,#1c1c1c)'
                    : 'linear-gradient(133deg,#000 2.99%,#1c1c1c)',
              clipPath: 'polygon(0.6rem 0%,100% 0%,100% calc(100% - 0.6rem),calc(100% - 0.6rem) 100%,0% 100%,0% 0.6rem)',
            }}
          />
        </div>
        <div className="relative z-10 flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4 px-2 sm:px-5 pt-1.5 pb-3 sm:py-2.5">

        {/* Row 1: username + pts | region (only on mobile) */}
        <div className="flex items-center justify-between sm:contents">
          {/* Left info block */}
          <div className="min-w-0 flex-1">
            <h2 className="text-sm sm:text-lg font-black truncate text-white group-hover:text-amber-400 transition-colors tracking-tight" style={{ fontFamily: 'Trap-Bold, Trap-Regular, sans-serif' }}>
              {entry.username}
            </h2>
            <div className="flex items-center gap-1.5 mt-0.5 sm:mt-1">
              {EmblemComp && (
                <>
                  <span className="sm:hidden flex-shrink-0 relative group/rank">
                    <EmblemComp size={26} />
                    <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 pointer-events-none opacity-0 group-hover/rank:opacity-100 transition-all duration-200 z-[9999]">
                      <div className="relative px-3 py-2 shadow-xl shadow-black/60 whitespace-nowrap"
                        style={{
                          background: 'linear-gradient(90deg,#131313,#1c1c1c 123.09%)',
                          clipPath: 'polygon(0.8rem 0%,100% 0%,100% calc(100% - 0.8rem),calc(100% - 0.8rem) 100%,0% 100%,0% 0.8rem)',
                        }}
                      >
                        <div className="absolute inset-0 pointer-events-none" style={{
                          background: 'linear-gradient(133deg,rgba(255,255,255,0.25),transparent)',
                          clipPath: 'polygon(0.8rem 0%,100% 0%,100% calc(100% - 0.8rem),calc(100% - 0.8rem) 100%,0% 100%,0% 0.8rem)',
                        }} />
                        <div className="absolute inset-[1px] pointer-events-none" style={{
                          background: 'linear-gradient(90deg,#131313,#1c1c1c 123.09%)',
                          clipPath: 'polygon(0.8rem 0%,100% 0%,100% calc(100% - 0.8rem),calc(100% - 0.8rem) 100%,0% 100%,0% 0.8rem)',
                        }} />
                        <span className="relative z-10 text-[11px] font-bold" style={{ color: combatRank.color }}>{combatRank.name}</span>
                      </div>
                      <div className="absolute top-full left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-[#1c1c1c] rotate-45 -mt-[5px] border-r border-b border-white/10" />
                    </div>
                  </span>
                  <span className="hidden sm:block flex-shrink-0 relative group/rank">
                    <EmblemComp size={56} />
                    <div className="absolute bottom-full mb-3 left-1/2 -translate-x-1/2 pointer-events-none opacity-0 group-hover/rank:opacity-100 transition-all duration-200 z-[9999]">
                      <div className="relative px-4 py-2.5 shadow-xl shadow-black/60 whitespace-nowrap"
                        style={{
                          background: 'linear-gradient(90deg,#131313,#1c1c1c 123.09%)',
                          clipPath: 'polygon(0.5rem 0%,100% 0%,100% calc(100% - 0.5rem),calc(100% - 0.5rem) 100%,0% 100%,0% 0.5rem)',
                        }}
                      >
                        <div className="absolute inset-0 pointer-events-none" style={{
                          background: 'linear-gradient(133deg,rgba(255,255,255,0.25),transparent)',
                          clipPath: 'polygon(0.5rem 0%,100% 0%,100% calc(100% - 0.5rem),calc(100% - 0.5rem) 100%,0% 100%,0% 0.5rem)',
                        }} />
                        <div className="absolute inset-[1px] pointer-events-none" style={{
                          background: 'linear-gradient(90deg,#131313,#1c1c1c 123.09%)',
                          clipPath: 'polygon(0.5rem 0%,100% 0%,100% calc(100% - 0.5rem),calc(100% - 0.5rem) 100%,0% 100%,0% 0.5rem)',
                        }} />
                        <span className="relative z-10 text-sm font-bold" style={{ color: combatRank.color }}>{combatRank.name}</span>
                      </div>
                      <div className="absolute top-full left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-[#1c1c1c] rotate-45 -mt-[5px] border-r border-b border-white/10" />
                    </div>
                  </span>
                </>
              )}
              <span className="text-[10px] sm:text-xs font-bold tabular-nums text-white/70">
                {entry.points.toLocaleString()} Points
              </span>
            </div>
          </div>

          {/* Region - shown inline on mobile right side */}
          <div className="flex-shrink-0 sm:hidden">
            <RegionBadge region={entry.region} />
          </div>
        </div>

        {/* Row 2: tier icons */}
        <div className="mt-0.5 sm:mt-0 flex flex-wrap items-start gap-x-1.5 sm:gap-x-3 gap-y-1 sm:gap-y-1.5">
          {sortedKeys.slice(0, 8).map((key) => (
            <TierIcon key={key} stat={statsMap.get(key)} modeKey={key} />
          ))}
        </div>
      </div>
      </div>
    </Link>
    </PlayerContextMenu>
  )
}

function OverallLeaderboard({ entries, loading }: { entries: LeaderboardEntry[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="space-y-5 sm:space-y-7">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-[88px] sm:h-[116px] rounded-xl bg-card/30 border border-border/30 animate-skeleton" />
        ))}
      </div>
    )
  }
  if (entries.length === 0) {
    return <div className="text-center py-24 text-muted-foreground bg-card/30 rounded-xl border border-border/30">No players yet</div>
  }
  return (
    <div className="space-y-5 sm:space-y-7">
      {entries.map((entry, i) => (
        <PlayerCard key={entry.playerId} entry={entry} rank={i} />
      ))}
    </div>
  )
}

export default function RankingModePage() {
  const params = useParams()
  const router = useRouter()
  const mode = params.mode as string

  const validMode = isValidMode(mode) ? mode : 'overall'

  useEffect(() => {
    if (!isValidMode(mode)) {
      router.replace('/ranking/overall')
    }
  }, [mode, router])

  const [search, setSearch] = useState('')
  const [showRanksInfo, setShowRanksInfo] = useState(false)

  useEffect(() => {
    if (showRanksInfo) document.body.classList.add('modal-open')
    else document.body.classList.remove('modal-open')
    return () => document.body.classList.remove('modal-open')
  }, [showRanksInfo])

  const isOverall = validMode === 'overall'

  const apiParams = new URLSearchParams({ mode: validMode, limit: '200', sort: '' })
  const { data: leaderboardData, isLoading: loading } = useSWR(
    `/api/leaderboard?${apiParams}`,
    swrFetcher,
    { revalidateOnFocus: false, dedupingInterval: 5000 }
  )
  const entries = leaderboardData?.data ?? []

  const filtered = useMemo(() => {
    if (!search.trim()) return entries
    const q = search.toLowerCase()
    return entries.filter((e: LeaderboardEntry) => e.username.toLowerCase().includes(q))
  }, [search, entries])

  if (!isValidMode(mode)) return null

  return (
    <div className={`mx-auto ${isOverall ? 'max-w-6xl sm:max-w-[90rem]' : 'max-w-[100rem]'} px-4 py-6 sm:px-6`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            <span className="text-gradient-gold-static">{getModeName(validMode)}</span> Rankings
          </h1>
          {!isOverall && <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Tier-based ranking — sorted by tier</p>}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-80">
          <div className="relative flex-1">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search player..."
              className="w-full rounded-lg border border-white/20 bg-black/60 px-3 py-2.5 pl-10 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/30 transition-all"
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <button
            onClick={() => setShowRanksInfo(true)}
            className="flex-shrink-0 w-9 h-9 rounded-lg border border-white/20 bg-black/60 flex items-center justify-center hover:bg-amber-500/10 hover:border-amber-400/40 transition-all group"
            title="Ranks info"
          >
            <svg className="w-4 h-4 text-white/50 group-hover:text-amber-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" />
            </svg>
          </button>
        </div>

        {/* Ranks info modal */}
        {showRanksInfo && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4" onClick={() => setShowRanksInfo(false)}>
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
            <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#0a0a14] p-4 sm:p-6 shadow-2xl custom-scrollbar" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-white">Rank &amp; Tier Guide</h2>
                  <p className="text-xs sm:text-sm text-white/50 mt-0.5">Total points determine your combat rank. Each badge is a mark of prestige.</p>
                </div>
                <button onClick={() => setShowRanksInfo(false)} className="flex-shrink-0 w-8 h-8 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6 sm:space-y-8">
                {/* Combat Ranks */}
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-amber-400 mb-3 sm:mb-4 uppercase tracking-wider flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l9 4.5v9L12 22l-9-4.5v-9L12 2z" />
                    </svg>
                    Combat Ranks
                  </h3>
                  <div className="grid gap-2.5 sm:gap-3 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
                    {[...COMBAT_RANKS].reverse().map(rank => {
                      const Emblem = RANK_EMBLEMS[rank.key]
                      return (
                        <div key={rank.key} className="group relative overflow-hidden rounded-xl sm:rounded-2xl border p-3 sm:p-4 transition-all duration-300 hover:-translate-y-0.5" style={{
                          borderColor: `${rank.color}35`,
                          background: `linear-gradient(135deg, ${rank.color}12 0%, transparent 50%, ${rank.color}06 100%)`,
                        }}>
                          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{
                            background: `radial-gradient(400px circle at 50% 0%, ${rank.color}12 0%, transparent 70%)`,
                          }} />
                          <div className="relative z-10 flex items-center gap-3 sm:gap-3.5">
                            <div className="flex-shrink-0">
                              {Emblem && <Emblem size={40} glow />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                                <h4 className="text-sm sm:text-base font-black tracking-tight" style={{ color: rank.color }}>{rank.name}</h4>
                                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest px-1.5 sm:px-2 py-0.5 rounded-full" style={{
                                  backgroundColor: `${rank.color}20`,
                                  color: rank.color,
                                  border: `1px solid ${rank.color}30`,
                                }}>
                                  Rank
                                </span>
                              </div>
                              <div className="mt-0.5 flex items-center gap-1.5 sm:gap-2">
                                <span className="font-mono text-xs sm:text-sm font-bold" style={{ color: rank.color }}>{rank.minPoints}</span>
                                <span className="text-white/30 text-xs">—</span>
                                <span className="font-mono text-xs sm:text-sm font-bold" style={{ color: rank.color }}>{rank.maxPoints}</span>
                                <span className="text-white/40 text-[10px] sm:text-xs ml-0.5">points</span>
                              </div>
                              <div className="mt-1.5 sm:mt-2 h-1 rounded-full overflow-hidden" style={{ backgroundColor: `${rank.color}15` }}>
                                <div className="h-full rounded-full" style={{
                                  width: '100%',
                                  background: `linear-gradient(90deg, ${rank.color}30, ${rank.color})`,
                                }} />
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Tier Points */}
                <div className="border-t border-white/5 pt-5 sm:pt-6">
                  <h3 className="text-xs sm:text-sm font-bold text-amber-400 mb-3 sm:mb-4 uppercase tracking-wider flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    Tier Points per Win
                  </h3>
                  <div className="grid gap-1.5 sm:gap-2 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
                    {TIER_ORDER.filter(k => !k.startsWith('r')).map(key => {
                      const t = DEFAULT_TIERS.find(t => t.key === key)!
                      return (
                        <div key={key} className="flex items-center justify-between sm:flex-col sm:items-start gap-1 rounded-xl border border-white/5 bg-white/[0.02] px-3 sm:px-4 py-2 sm:py-3 hover:bg-white/[0.04] transition-colors">
                          <span className="text-xs sm:text-sm font-bold" style={{ color: t.color }}>{t.shortName}</span>
                          <span className="text-xs sm:text-sm font-mono font-bold text-white/60" style={{ color: `${t.color}CC` }}>+{TIER_POINTS[key]}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Game mode tabs */}
      <div className="mb-10 sm:mb-12 max-w-max" style={{
        borderTop: '1px solid rgba(192,192,192,0.95)',
        borderRight: '1px solid rgba(192,192,192,0.6)',
        borderBottom: '1px solid rgba(192,192,192,0.2)',
        borderLeft: '1px solid rgba(192,192,192,0.6)',
      }}>
        <div className="flex overflow-x-auto flex-nowrap scrollbar-hide bg-card/40">
          <Link
            href="/ranking/overall"
            className={cn(
              'relative flex items-center justify-center gap-1.5 flex-1 px-8 sm:px-10 py-2 sm:py-2.5 text-xs sm:text-sm font-medium transition-all',
              isOverall
                ? 'text-amber-400 bg-amber-500/10'
                : 'text-muted-foreground hover:text-foreground hover:bg-white/[0.04]'
            )}
            style={{ borderRight: '1px solid rgba(192,192,192,0.4)' }}
          >
            <img src="/images/overall.svg" alt="Overall" className="w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0" decoding="async" />
            <span>Overall</span>
          </Link>
          {['vanilla', 'uhc', 'pot', 'nethpot', 'smp', 'sword', 'axe', 'mace'].map((id, idx) => {
            const gm = GAME_MODES.find(m => m.id === id)
            if (!gm) return null
            const isActive = validMode === gm.id
            return (
              <Link
                key={gm.id}
                href={`/ranking/${gm.id}`}
                className={cn(
                  'relative flex items-center justify-center gap-1.5 flex-1 px-8 sm:px-10 py-2 sm:py-2.5 text-xs sm:text-sm font-medium transition-all',
                  isActive
                    ? 'text-amber-400 bg-amber-500/10'
                    : 'text-muted-foreground hover:text-foreground hover:bg-white/[0.04]'
                )}
                style={idx < 7 ? { borderRight: '1px solid rgba(192,192,192,0.4)' } : {}}
              >
                <img src={gm.icon} alt={gm.name} className="w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0" decoding="async" />
                <span>{gm.name}</span>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Content */}
      {isOverall ? (
        <>
          <div className="relative flex items-center gap-1.5 sm:gap-3 mb-4 px-1 text-[10px] font-bold uppercase tracking-wider text-white">
            <div className="w-20 sm:w-28 flex-shrink-0 text-center">Rank</div>
            <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4">
              <div className="min-w-0 flex-1">
                <span className="hidden sm:inline sm:ml-5">Player</span>
              </div>
              <span className="hidden sm:inline">Points</span>
            </div>
            <span className="hidden sm:block absolute text-center" style={{ left: '35%', transform: 'translateX(-50%)' }}>
              🌏 Region
            </span>
            <span className="sm:hidden">🌏 Region</span>
          </div>
          <OverallLeaderboard entries={filtered} loading={loading} />
        </>
      ) : (
        <GamemodeRanking entries={filtered} mode={validMode} />
      )}
    </div>
  )
}