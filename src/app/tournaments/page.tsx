'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getCombatRankFromPoints } from '@/lib/points'
import { RANK_EMBLEMS } from '@/lib/rank-emblems'

export default function TournamentsPage() {
  const [entries, setEntries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [nextDate, setNextDate] = useState<string | null>(null)
  const [prize1, setPrize1] = useState('')
  const [prize2, setPrize2] = useState('')
  const [prize3, setPrize3] = useState('')

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
      .then(d => {
        if (d.nextMatchDate) setNextDate(d.nextMatchDate)
        if (d.prize1) setPrize1(d.prize1)
        if (d.prize2) setPrize2(d.prize2)
        if (d.prize3) setPrize3(d.prize3)
      })
      .catch(() => {})
  }, [])

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      {/* Date Banner */}
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

      {/* Prizes + How to Participate */}
      <div className="grid gap-6 lg:grid-cols-3 mb-8">
        {/* Prize Podium */}
        <div className="lg:col-span-1">
          <div className="rounded-xl border border-border/50 bg-card/50 p-5 h-full">
            <h2 className="font-bold text-base mb-4 text-center">Prize Pool</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🥇</span>
                  <span className="font-bold text-sm">1st Place</span>
                </div>
                <span className="font-black text-amber-400">{prize1 || 'TBD'}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-gray-500/30 bg-gray-500/10 px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🥈</span>
                  <span className="font-bold text-sm">2nd Place</span>
                </div>
                <span className="font-black text-gray-300">{prize2 || 'TBD'}</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-amber-700/30 bg-amber-700/10 px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🥉</span>
                  <span className="font-bold text-sm">3rd Place</span>
                </div>
                <span className="font-black text-amber-700">{prize3 || 'TBD'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* How to Participate + Leaderboard */}
        <div className="lg:col-span-2 space-y-6">
          {/* How to Participate */}
          <div className="rounded-xl border border-amber-500/20 bg-gradient-to-r from-amber-500/5 via-yellow-500/5 to-amber-500/5 p-5">
            <h2 className="font-bold text-base mb-3">How to Participate</h2>
            <ol className="space-y-2 text-sm text-foreground/80">
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold shrink-0">1.</span>
                <span>Join our <a href="https://discord.gg/7J8jSHedS5" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 underline">Discord server</a></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold shrink-0">2.</span>
                <span>Create a ticket in the <strong>#create-ticket</strong> channel to apply for the tournament</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold shrink-0">3.</span>
                <span>Mention your ticket ID in your application so staff can review it</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold shrink-0">4.</span>
                <span>Wait for staff to approve your entry — you will see your name on the leaderboard once approved</span>
              </li>
            </ol>
          </div>

          {/* Leaderboard Table */}
          {loading ? (
            <div className="space-y-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-14 rounded-xl bg-card/30 border border-border/30 animate-skeleton" />
              ))}
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-border/50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-card/50">
                <h2 className="font-bold text-sm">Tournament Leaderboard</h2>
                <span className="text-xs text-foreground/60">{entries.length} players</span>
              </div>
              {entries.length === 0 ? (
                <div className="text-center py-16 text-foreground/50">No tournament players yet</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/30">
                        <th className="px-4 py-2.5 text-left font-semibold text-foreground/70 w-10">#</th>
                        <th className="px-4 py-2.5 text-left font-semibold text-foreground/70">Player</th>
                        <th className="px-4 py-2.5 text-center font-semibold text-foreground/70 hidden sm:table-cell">Rank</th>
                        <th className="px-4 py-2.5 text-center font-semibold text-foreground/70">Tier</th>
                        <th className="px-4 py-2.5 text-right font-semibold text-foreground/70">Earnings</th>
                      </tr>
                    </thead>
                    <tbody>
                      {entries.map((e: any, i: number) => {
                        const rankInfo = getCombatRankFromPoints(e.earnings ?? 0)
                        const Emblem = rankInfo ? RANK_EMBLEMS[rankInfo.key] : null
                        return (
                          <tr key={e.id} className="border-b border-border/30 transition-colors hover:bg-accent/20">
                            <td className={`px-4 py-3 text-xs font-bold ${i === 0 ? 'text-amber-400' : i === 1 ? 'text-gray-400' : i === 2 ? 'text-amber-700' : 'text-foreground/60'}`}>{i + 1}</td>
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
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
