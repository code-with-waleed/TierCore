'use client'

import { useState, useEffect } from 'react'
import { GAME_MODES } from '@/lib/game-modes'
import { formatDateTime } from '@/lib/utils'

const REGION_COLORS: Record<string, string> = {
  NA: '#3B82F6',
  EU: '#8B5CF6',
  AS: '#F59E0B',
  AU: '#22C55E',
}

const DISPLAY_MODES = GAME_MODES.filter(m => m.id !== 'overall')

function SkinRender({ username }: { username: string }) {
  const [src, setSrc] = useState(`https://render.crafty.gg/renders/body/${username}`)
  return (
    <div className="relative">
      <img
        src={src}
        alt={username}
        className="h-28 w-28 sm:h-36 sm:w-36 object-contain drop-shadow-2xl"
        onError={() => setSrc(`https://mc-heads.net/avatar/${username}/64`)}
      />
    </div>
  )
}

export default function PlayerPage({ params }: { params: Promise<{ id: string }> }) {
  const [player, setPlayer] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    params.then(({ id }) => {
      fetch(`/api/players/${id}`)
        .then(res => res.json())
        .then(d => {
          if (d.data) setPlayer(d.data)
          else setError('Player not found')
        })
        .catch(() => setError('Failed to load player'))
        .finally(() => setLoading(false))
    })
  }, [params])

  if (loading) return <div className="mx-auto max-w-7xl px-4 py-12 text-center text-muted-foreground">Loading...</div>
  if (error) return <div className="mx-auto max-w-7xl px-4 py-12 text-center text-red-400">{error}</div>
  if (!player) return <div className="mx-auto max-w-7xl px-4 py-12 text-center text-muted-foreground">Player not found</div>

  const regionColor = REGION_COLORS[player.region ?? ''] ?? '#6B7280'

  const modeStatsMap: Record<string, { points: number; tier: any }> = {}
  for (const ms of player.modeStats ?? []) {
    modeStatsMap[ms.mode] = { points: ms.points, tier: ms.tier }
  }

  const tourneyEarnings = (player.seasonRecords ?? []).reduce((sum: number, sr: any) => sum + (sr.points ?? 0), 0)

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
      {/* Profile header */}
      <div className="rounded-xl border border-border/40 bg-card/40 p-5 sm:p-8 mb-5">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 text-center sm:text-left">
          <SkinRender username={player.username} />
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{player.username}</h1>
            <div className="flex items-center justify-center sm:justify-start gap-2.5 mt-2 flex-wrap">
              {player.region && (
                <span
                  className="text-[10px] font-bold tracking-wide uppercase px-2 py-0.5 rounded"
                  style={{
                    backgroundColor: `${regionColor}18`,
                    color: regionColor,
                    border: `1px solid ${regionColor}30`,
                  }}
                >
                  {player.region}
                </span>
              )}
              <span className="text-xs text-muted-foreground">
                {player.totalMatches ?? 0} matches played
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2.5 sm:gap-3 mb-5">
        <div className="rounded-xl border border-border/40 bg-card/40 p-3 sm:p-4 text-center">
          <div className="text-xl sm:text-2xl font-black text-gradient-gold">{player.points}</div>
          <div className="text-[9px] sm:text-[10px] text-muted-foreground mt-0.5 uppercase tracking-wider">Points</div>
        </div>
        <div className="rounded-xl border border-border/40 bg-card/40 p-3 sm:p-4 text-center">
          <div className="text-xl sm:text-2xl font-black text-amber-400">{player.totalMatches ?? 0}</div>
          <div className="text-[9px] sm:text-[10px] text-muted-foreground mt-0.5 uppercase tracking-wider">Matches</div>
        </div>
        <div className="rounded-xl border border-border/40 bg-card/40 p-3 sm:p-4 text-center">
          <div className="text-xl sm:text-2xl font-black text-emerald-400">{tourneyEarnings > 0 ? tourneyEarnings : '—'}</div>
          <div className="text-[9px] sm:text-[10px] text-muted-foreground mt-0.5 uppercase tracking-wider">Earned</div>
        </div>
      </div>

      {/* Game mode tiers */}
      <div className="rounded-xl border border-border/40 bg-card/40 p-4 sm:p-6 mb-5">
        <h2 className="text-xs font-bold tracking-wider uppercase text-muted-foreground mb-3 sm:mb-4">Game Mode Tiers</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          {DISPLAY_MODES.map(mode => {
            const stat = modeStatsMap[mode.id]
            const tier = stat?.tier
            const points = stat?.points ?? 0
            const tierColor = tier?.color ?? '#666'
            return (
              <div
                key={mode.id}
                className="rounded-lg border border-border/30 bg-card/50 p-2.5 sm:p-3 flex items-center gap-2.5 sm:gap-3"
              >
                <img src={mode.icon} alt={mode.name} className="w-5 h-5 sm:w-7 sm:h-7 flex-shrink-0" />
                <div className="min-w-0">
                  <div className="text-[10px] font-medium text-muted-foreground truncate leading-tight">{mode.name}</div>
                  <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                    <span className="text-[10px] sm:text-[11px] font-bold" style={{ color: tierColor }}>
                      {tier?.shortName ?? '—'}
                    </span>
                    <span className="text-[9px] text-muted-foreground whitespace-nowrap">{points}pts</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Match History */}
      {(player.recentMatches?.length > 0) && (
        <div className="rounded-xl border border-border/40 bg-card/40 p-4 sm:p-6">
          <h2 className="text-xs font-bold tracking-wider uppercase text-muted-foreground mb-3 sm:mb-4">Recent Matches</h2>
          <div className="space-y-1.5 sm:space-y-2">
            {player.recentMatches.map((match: any) => (
              <div key={match.id} className="flex items-center justify-between rounded-lg bg-card/60 p-2.5 sm:p-3 text-xs sm:text-sm gap-2">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <span className={`text-xs font-bold w-5 text-center flex-shrink-0 ${match.result === 'win' ? 'text-emerald-400' : match.result === 'loss' ? 'text-red-400' : 'text-muted-foreground'}`}>
                    {match.result === 'win' ? 'W' : match.result === 'loss' ? 'L' : 'D'}
                  </span>
                  <span className="font-medium truncate">vs {match.opponent}</span>
                  <span className="text-[9px] sm:text-[10px] text-muted-foreground uppercase flex-shrink-0">{match.mode ?? ''}</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                  <span className={`font-mono text-xs font-bold ${match.result === 'win' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {match.result === 'win' ? '+' : ''}{match.pointsChange ?? 0}
                  </span>
                  <span className="text-[9px] sm:text-[10px] text-muted-foreground hidden sm:inline">{formatDateTime(match.date)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}