'use client'

import { useState, useEffect } from 'react'
import { getCombatRankFromPoints } from '@/lib/points'
import { RANK_EMBLEMS } from '@/lib/rank-emblems'

export default function TournamentsPage() {
  const [entries, setEntries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [nextDate, setNextDate] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/tournament/entries')
      .then(res => res.json())
      .then(d => {
        const approved = (d.data ?? []).filter((e: any) => e.status === 'approved')
        approved.sort((a: any, b: any) => (b.earnings ?? 0) - (a.earnings ?? 0))
        setEntries(approved)
      })
      .catch(() => setEntries([]))
      .finally(() => setLoading(false))

    fetch('/api/settings')
      .then(r => r.json())
      .then(d => { if (d.nextMatchDate) setNextDate(d.nextMatchDate) })
      .catch(() => {})
  }, [])

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      {nextDate && (
        <div className="mb-6 rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-amber-500/10 p-6 text-center animate-slide-up">
          <div className="text-xs font-medium text-amber-400/80 uppercase tracking-widest mb-1">Next Tournament</div>
          <div className="text-3xl sm:text-4xl font-black text-amber-400">
            {new Date(nextDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
          <div className="text-lg font-bold text-amber-400/80 mt-1">
            {new Date(nextDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-black">Tournament Leaderboard</h1>
        <p className="mt-1 text-foreground/70">Players ranked by tournament earnings</p>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-14 rounded-xl bg-card/30 border border-border/30 animate-skeleton" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-24 text-foreground/50 bg-card/30 rounded-xl border border-border/30">No tournament players yet</div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border/50">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 bg-card/50">
                  <th className="px-4 py-3 text-left font-semibold text-foreground/70 w-10">#</th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground/70">Player</th>
                  <th className="px-4 py-3 text-center font-semibold text-foreground/70 hidden sm:table-cell">Rank</th>
                  <th className="px-4 py-3 text-center font-semibold text-foreground/70">Tier</th>
                  <th className="px-4 py-3 text-right font-semibold text-foreground/70">Earnings</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((e: any, i: number) => {
                  const rankInfo = getCombatRankFromPoints(e.earnings ?? 0)
                  const Emblem = rankInfo ? RANK_EMBLEMS[rankInfo.key] : null
                  return (
                    <tr key={e.id} className="border-b border-border/30 transition-colors hover:bg-accent/20">
                      <td className="px-4 py-3 text-foreground/60 text-xs font-bold">{i + 1}</td>
                      <td className="px-4 py-3 font-medium">{e.username}</td>
                      <td className="px-4 py-3 text-center hidden sm:table-cell">
                        {Emblem && (
                          <div className="inline-flex items-center gap-1.5" title={`${rankInfo.name} (${e.earnings ?? 0} pts)`}>
                            <Emblem size={20} />
                            <span className="text-[10px] font-bold text-foreground/60">{rankInfo.name}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-white/5 text-foreground/80">{e.tier}</span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-emerald-400">${(e.earnings ?? 0).toFixed(2)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
