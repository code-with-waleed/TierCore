'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { LeaderboardEntry } from '@/types'

const REGION_FLAGS: Record<string, string> = {
  NA: '/images/region-na.svg',
  EU: '/images/region-eu.svg',
  AS: '/images/region-as.svg',
  AU: '/images/region-au.svg',
}

const CARD_CLIP = 'polygon(0% 0%, calc(100% - 1.2rem) 0%, 100% 1.2rem, 100% calc(100% - 1.2rem), calc(100% - 1.2rem) 100%, 1.2rem 100%, 0% calc(100% - 1.2rem), 0% 1.2rem)'

const HEADER_BG: Record<number, string> = {
   1: 'linear-gradient(352deg, #fbe67b -3.54%, #fbe67b 29.36%, #fcfbe7 50.62%, #f7d14e 74.34%, #d4a041 97.61%)',
  2: 'linear-gradient(172deg, rgb(194,212,225) 2.28%, rgb(194,212,225) 19.8%, rgb(194,212,225) 32.94%, rgb(255,255,255) 50.16%, rgb(212,222,229) 62.15%, rgb(171,189,200), rgb(171,189,200) 95.24%)',
  3: 'linear-gradient(172deg, rgb(161,80,61) 2.28%, rgb(161,80,61) 21.75%, rgb(226,170,157) 50.95%, rgb(161,80,61) 83.07%, rgb(161,80,61) 95.24%)',
  4: 'linear-gradient(172deg, rgb(90,4,13) 2.28%, rgb(90,4,13) 21.75%, rgb(255,112,127) 50.95%, rgb(90,4,13) 83.07%, rgb(90,4,13) 95.24%)',
   5: 'linear-gradient(172deg, #bcbbc1 2.28%, #bcbbc1 19.8%, #bcbbc1 32.94%, #d3d3d3 50.16%, #bcbbc1 62.15%, #bcbbc1, #bcbbc1 95.24%)',
}

const HEADER_TEXT: Record<number, string> = {
  1: '#1a1a2e',
  2: '#1a1a2e',
  3: '#1a1a2e',
  4: '#fff',
  5: '#1a1a2e',
}

const HT_COLORS: Record<string, string> = {
  ht1: '#E8BA3A',
  ht2: '#C4D3E7',
  ht3: '#F89F5A',
  ht4: '#81749A',
  ht5: '#8F82A8',
}

const HT_BG: Record<string, string> = {
  ht1: 'linear-gradient(135deg, rgba(60,40,0,0.55) 0%, rgba(80,55,0,0.40) 15%, rgba(140,100,20,0.25) 35%, rgba(212,175,55,0.15) 55%, rgba(240,208,96,0.20) 72%, rgba(255,242,200,0.35) 88%, rgba(255,248,220,0.20) 100%)',
  ht2: 'linear-gradient(135deg, rgba(40,42,46,0.55) 0%, rgba(60,64,70,0.40) 15%, rgba(120,128,136,0.25) 35%, rgba(180,188,196,0.15) 55%, rgba(210,218,225,0.20) 72%, rgba(237,242,246,0.35) 88%, rgba(255,255,255,0.20) 100%)',
  ht3: 'linear-gradient(135deg, rgba(50,15,5,0.55) 0%, rgba(80,30,12,0.40) 15%, rgba(140,65,35,0.25) 35%, rgba(195,110,65,0.15) 55%, rgba(220,150,100,0.20) 72%, rgba(242,201,168,0.35) 88%, rgba(255,225,200,0.20) 100%)',
  ht4: 'linear-gradient(135deg, rgba(30,0,5,0.55) 0%, rgba(60,5,15,0.40) 15%, rgba(110,18,30,0.25) 35%, rgba(160,35,50,0.15) 55%, rgba(210,70,85,0.20) 72%, rgba(240,144,152,0.35) 88%, rgba(255,200,205,0.20) 100%)',
  ht5: 'linear-gradient(135deg, rgba(30,32,35,0.55) 0%, rgba(50,52,56,0.40) 15%, rgba(100,104,110,0.25) 35%, rgba(155,160,165,0.15) 55%, rgba(190,195,200,0.20) 72%, rgba(224,228,232,0.35) 88%, rgba(245,248,250,0.20) 100%)',
}

const HT_BG_HOVER: Record<string, string> = {
  ht1: 'linear-gradient(135deg, rgba(60,40,0,0.70) 0%, rgba(80,55,0,0.55) 15%, rgba(140,100,20,0.38) 35%, rgba(212,175,55,0.25) 55%, rgba(240,208,96,0.32) 72%, rgba(255,242,200,0.50) 88%, rgba(255,248,220,0.32) 100%)',
  ht2: 'linear-gradient(135deg, rgba(40,42,46,0.70) 0%, rgba(60,64,70,0.55) 15%, rgba(120,128,136,0.38) 35%, rgba(180,188,196,0.25) 55%, rgba(210,218,225,0.32) 72%, rgba(237,242,246,0.50) 88%, rgba(255,255,255,0.32) 100%)',
  ht3: 'linear-gradient(135deg, rgba(50,15,5,0.70) 0%, rgba(80,30,12,0.55) 15%, rgba(140,65,35,0.38) 35%, rgba(195,110,65,0.25) 55%, rgba(220,150,100,0.32) 72%, rgba(242,201,168,0.50) 88%, rgba(255,225,200,0.32) 100%)',
  ht4: 'linear-gradient(135deg, rgba(30,0,5,0.70) 0%, rgba(60,5,15,0.55) 15%, rgba(110,18,30,0.38) 35%, rgba(160,35,50,0.25) 55%, rgba(210,70,85,0.32) 72%, rgba(240,144,152,0.50) 88%, rgba(255,200,205,0.32) 100%)',
  ht5: 'linear-gradient(135deg, rgba(30,32,35,0.70) 0%, rgba(50,52,56,0.55) 15%, rgba(100,104,110,0.38) 35%, rgba(155,160,165,0.25) 55%, rgba(190,195,200,0.32) 72%, rgba(224,228,232,0.50) 88%, rgba(245,248,250,0.32) 100%)',
}

interface TierLevel {
  level: number
  label: string
  htKey: string
  ltKey: string
}

const TIER_LEVELS: TierLevel[] = [
  { level: 1, label: 'Tier #1', htKey: 'ht1', ltKey: 'lt1' },
  { level: 2, label: 'Tier #2', htKey: 'ht2', ltKey: 'lt2' },
  { level: 3, label: 'Tier #3', htKey: 'ht3', ltKey: 'lt3' },
  { level: 4, label: 'Tier #4', htKey: 'ht4', ltKey: 'lt4' },
  { level: 5, label: 'Tier #5', htKey: 'ht5', ltKey: 'lt5' },
]

function TierRow({ entry, tierKey }: { entry: LeaderboardEntry; tierKey: string }) {
  const isHT = tierKey.startsWith('ht')
  const htColor = HT_COLORS[tierKey]
  const htBg = HT_BG[tierKey]
  const region = entry.region
  const flagSrc = region ? REGION_FLAGS[region] : null

  return (
    <Link
      href={`/player/${entry.playerId}`}
      className="group flex items-center gap-3 px-3 py-2.5 cursor-pointer relative overflow-hidden"
      style={{
        background: isHT ? htBg : 'rgba(255,255,255,0.015)',
      }}
    >
      {/* Hover overlay — opacity transition only, no repaint */}
      <div
        className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 will-change-transform"
        style={{
          background: isHT ? HT_BG_HOVER[tierKey] : 'rgba(255,255,255,0.06)',
        }}
      />
      {/* Silver line at bottom */}
      <div
        className="absolute bottom-0 left-3 right-3 h-px pointer-events-none"
        style={{
          background: isHT
            ? 'linear-gradient(90deg, transparent, rgba(192,192,192,0.6), transparent)'
            : 'linear-gradient(90deg, transparent, rgba(192,192,192,0.15), transparent)',
        }}
      />
      <div className="w-7 h-7 rounded flex-shrink-0 overflow-hidden bg-black/40">
        <img
          src={`https://mc-heads.net/avatar/${entry.username}/32`}
          alt={entry.username}
          className="w-full h-full object-cover"
          loading="lazy"
          decoding="async"
        />
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-xs font-black truncate block text-white">
          {entry.username}
        </span>
      </div>
      <span className="text-[9px] font-bold uppercase tracking-wider flex-shrink-0" style={{ color: isHT ? htColor : '#555' }}>
        {tierKey.toUpperCase()}
      </span>
      {flagSrc && (
        <div className="w-[28px] h-[28px] flex-shrink-0 flex items-center justify-center rounded-sm overflow-hidden border border-white/10 bg-black/20 relative">
          <img src={flagSrc} alt={region!} className="w-full h-full object-cover absolute inset-0" loading="lazy" decoding="async" />
          <span className="relative z-10 text-[8px] font-black uppercase leading-none" style={{ color: '#fff', textShadow: '0 0 2px #000' }}>{region}</span>
        </div>
      )}
    </Link>
  )
}

function TierColumn({ level, label, htKey, ltKey, htPlayers, ltPlayers }: TierLevel & { htPlayers: LeaderboardEntry[]; ltPlayers: LeaderboardEntry[] }) {
  const headerBg = HEADER_BG[level]
  const headerColor = HEADER_TEXT[level]
  const hasPlayers = htPlayers.length > 0 || ltPlayers.length > 0
  const [collapsed, setCollapsed] = useState(true)

  return (
    <div className="relative flex flex-col">
      {/* Silver border template */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, rgba(192,192,196,0.5) 0%, rgba(128,128,132,0.3) 25%, rgba(192,192,196,0.15) 50%, rgba(220,220,224,0.4) 75%, rgba(255,255,255,0.5) 100%)',
          clipPath: level === 1
            ? 'polygon(0% 0%, calc(100% - 1.2rem) 0%, 100% 1.2rem, 100% calc(100% - 1.2rem), calc(100% - 1.2rem) 100%, 1.2rem 100%, 0% calc(100% - 1.2rem), 0% 1.2rem)'
            : level === 5
              ? 'polygon(1.2rem 0%, 100% 0%, 100% calc(100% - 1.2rem), calc(100% - 1.2rem) 100%, 1.2rem 100%, 0% calc(100% - 1.2rem), 0% 1.2rem)'
              : 'polygon(1.2rem 0%, calc(100% - 1.2rem) 0%, 100% 1.2rem, 100% calc(100% - 1.2rem), calc(100% - 1.2rem) 100%, 1.2rem 100%, 0% calc(100% - 1.2rem), 0% 1.2rem)',
        }}
      />
      {/* Inner background */}
      <div
        className="absolute inset-[1px] pointer-events-none"
        style={{
          background: 'linear-gradient(227deg, rgb(0,0,0) 2.99%, rgb(28,28,28))',
          clipPath: CARD_CLIP,
        }}
      />
      {/* Header — clickable to toggle */}
      <div
        className="relative z-10 flex items-center justify-center px-4 cursor-pointer select-none"
        onClick={() => setCollapsed(c => !c)}
        style={{
          minHeight: '3.4rem',
          height: '3.4rem',
          background: headerBg,
          borderRadius: '0',
          clipPath: level === 1
            ? 'polygon(0% 0%, calc(100% - 1.2rem) 0%, 100% 1.2rem, 100% 100%, 0% 100%)'
            : level === 5
              ? 'polygon(1.2rem 0%, 100% 0%, 100% 100%, 0% 100%, 0% 1.2rem)'
              : 'polygon(1.2rem 0%, calc(100% - 1.2rem) 0%, 100% 1.2rem, 100% 100%, 0% 100%, 0% 1.2rem)',
          textShadow: level === 3 ? '0 0 8px rgba(161,80,61,0.4)' : level === 4 ? '0 0 8px rgba(255,112,127,0.3)' : 'none',
          boxShadow: level === 1 ? '0 4px 6px #fff9 inset' : undefined,
        }}
      >
        <span
          className="text-sm sm:text-base font-black uppercase tracking-[0.15em]"
          style={{ color: headerColor }}
        >
          {label}
        </span>
        {/* Toggle icon + hint — mobile only */}
        <div className="ml-auto flex items-center gap-1.5 md:hidden">
          <span className="text-[10px] text-black/50 font-medium uppercase tracking-wider">{collapsed ? 'tap to open' : 'tap to close'}</span>
          <svg
            className="w-4 h-4 text-black/40 transition-transform duration-200"
            style={{ transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)' }}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {/* Body */}
      <div className={`relative z-10 pb-3 ${collapsed ? 'hidden md:block' : ''}`}>
        {!hasPlayers ? (
          <div className="px-4 py-8 text-center">
            <span className="text-[10px] text-white/15 font-medium uppercase tracking-widest">No Ranked Players</span>
          </div>
        ) : (
          <>
            {htPlayers.map(p => (
              <TierRow key={p.playerId} entry={p} tierKey={htKey} />
            ))}
            {ltPlayers.map(p => (
              <TierRow key={p.playerId} entry={p} tierKey={ltKey} />
            ))}
          </>
        )}
      </div>
    </div>
  )
}

export function GamemodeRanking({ entries, mode }: { entries: LeaderboardEntry[]; mode: string }) {
  const grouped = useMemo(() => {
    const map: Record<string, { ht: LeaderboardEntry[]; lt: LeaderboardEntry[] }> = {}
    for (const tl of TIER_LEVELS) {
      map[tl.htKey] = { ht: [], lt: [] }
    }

    for (const entry of entries) {
      const modeStat = entry.modeStats.find(s => s.mode === mode)
      if (!modeStat) continue
      const tk = modeStat.tierKey
      if (!tk) continue

      for (const tl of TIER_LEVELS) {
        if (tk === tl.htKey) {
          map[tl.htKey].ht.push(entry)
          break
        }
        if (tk === tl.ltKey) {
          map[tl.htKey].lt.push(entry)
          break
        }
      }
    }

    return TIER_LEVELS.map(tl => ({
      ...tl,
      htPlayers: map[tl.htKey]?.ht ?? [],
      ltPlayers: map[tl.htKey]?.lt ?? [],
    }))
  }, [entries, mode])

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-5">
      {grouped.map(col => (
        <TierColumn key={col.level} {...col} />
      ))}
    </div>
  )
}
