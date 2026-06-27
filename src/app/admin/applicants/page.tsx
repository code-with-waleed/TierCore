'use client'

import { useState, useEffect } from 'react'
import { DEFAULT_TIERS } from '@/lib/points'

export default function AdminApplicantsPage() {
  const [players, setPlayers] = useState<any[]>([])

  useEffect(() => {
    fetchPlayers()
  }, [])

  async function fetchPlayers() {
    try {
      const r = await fetch('/api/players?includeStats=true&showAll=true')
      const d = await r.json()
      setPlayers((d.data ?? []).filter((p: any) => p.ipAddress && !p.isActive))
    } catch {
      setPlayers([])
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black">Applicants</h1>
          <p className="text-sm text-muted-foreground mt-1">Players who applied with their IGN (not on leaderboard until activated)</p>
        </div>
        <button onClick={fetchPlayers} className="text-xs text-amber-400 hover:text-amber-300 transition-colors">↻ Refresh</button>
      </div>

      <div className="overflow-hidden rounded-xl border border-border/50">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 bg-card/50">
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">#</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Username</th>
                <th className="px-4 py-3 text-left font-semibold text-muted-foreground">IP Address</th>
                <th className="px-4 py-3 text-center font-semibold text-muted-foreground">Tier</th>
                <th className="px-4 py-3 text-right font-semibold text-muted-foreground">Points</th>
              </tr>
            </thead>
            <tbody>
              {players.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">No applicants yet</td></tr>
              ) : players.map((p: any, i: number) => {
                const tierKey = p.currentTier?.key ?? null
                const tier = DEFAULT_TIERS.find(t => t.key === tierKey)
                const tierColor = tier?.color ?? '#666'
                return (
                  <tr key={p.id} className="border-b border-border/30 hover:bg-accent/20 transition-colors">
                    <td className="px-4 py-3 text-muted-foreground text-xs">{i + 1}</td>
                    <td className="px-4 py-3 font-medium">{p.username}</td>
                    <td className="px-4 py-3 font-mono text-[11px] text-muted-foreground">{p.ipAddress ?? '—'}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-xs font-bold" style={{ color: tierColor }}>
                        {tier?.shortName ?? '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-muted-foreground">{p.points}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}