'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getCombatRankFromPoints } from '@/lib/points'
import { RANK_EMBLEMS } from '@/lib/rank-emblems'

export default function MatchesPage() {
  const [players, setPlayers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [nextMatchDate, setNextMatchDate] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/players?showAll=true&matchPlayers=true')
      .then(res => res.json())
      .then(d => {
        const matchP = (d.data ?? []).filter((p: any) => p.isMatchPlayer)
        matchP.sort((a: any, b: any) => (b.earnings ?? 0) - (a.earnings ?? 0))
        setPlayers(matchP)
      })
      .catch(() => setPlayers([]))
      .finally(() => setLoading(false))

    fetch('/api/settings')
      .then(r => r.json())
      .then(d => {
        if (d.nextMatchDate) setNextMatchDate(d.nextMatchDate)
      })
      .catch(() => {})
  }, [])

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      {nextMatchDate && (
        <div className="mb-6 rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-amber-500/10 p-6 text-center animate-slide-up">
          <div className="text-xs font-medium text-amber-400/80 uppercase tracking-widest mb-1">Next Tournament</div>
          <div className="text-3xl sm:text-4xl font-black text-amber-400">
            {new Date(nextMatchDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
          <div className="text-lg font-bold text-amber-400/80 mt-1">
            {new Date(nextMatchDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-black">Match Leaderboard</h1>
        <p className="mt-1 text-foreground/70">Players ranked by tournament earnings</p>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-14 rounded-xl bg-card/30 border border-border/30 animate-skeleton" />
          ))}
        </div>
      ) : players.length === 0 ? (
        <div className="text-center py-24 text-foreground/50 bg-card/30 rounded-xl border border-border/30">No match players yet</div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border/50">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 bg-card/50">
                  <th className="px-4 py-3 text-left font-semibold text-foreground/70 w-10">#</th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground/70">Player</th>
                  <th className="px-4 py-3 text-center font-semibold text-foreground/70 hidden sm:table-cell">Rank</th>
                  <th className="px-4 py-3 text-center font-semibold text-foreground/70">Points</th>
                  <th className="px-4 py-3 text-right font-semibold text-foreground/70">Earnings</th>
                </tr>
              </thead>
              <tbody>
                {players.map((p: any, i: number) => {
                  const rankInfo = getCombatRankFromPoints(p.earnings ?? 0)
                  const Emblem = rankInfo ? RANK_EMBLEMS[rankInfo.key] : null
                  return (
                    <tr key={p.id} className="border-b border-border/30 transition-colors hover:bg-accent/20">
                      <td className="px-4 py-3 text-foreground/60 text-xs font-bold">{i + 1}</td>
                      <td className="px-4 py-3">
                        <Link href={`/player/${p.id}`} className="font-medium text-foreground hover:text-amber-400 transition-colors">
                          {p.username}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-center hidden sm:table-cell">
                        {Emblem && (
                          <div className="inline-flex items-center gap-1.5" title={`${rankInfo.name} (${p.earnings ?? 0} pts)`}>
                            <Emblem size={20} />
                            <span className="text-[10px] font-bold text-foreground/60">{rankInfo.name}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center font-bold text-amber-400">{p.points}</td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-emerald-400">${(p.earnings ?? 0).toFixed(2)}</td>
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
