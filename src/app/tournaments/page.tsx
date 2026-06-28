'use client'

import { useState, useEffect } from 'react'
import { getCombatRankFromPoints } from '@/lib/points'
import { RANK_EMBLEMS } from '@/lib/rank-emblems'

export default function TournamentsPage() {
  const [entries, setEntries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [nextDate, setNextDate] = useState<string | null>(null)
  const [prize1, setPrize1] = useState('')
  const [prize2, setPrize2] = useState('')
  const [prize3, setPrize3] = useState('')
  const [activeTab, setActiveTab] = useState<'approved' | 'pending' | 'winners'>('winners')

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    fetch('/api/tournament/entries')
      .then(res => res.json())
      .then(d => {
        setEntries(d.data ?? [])
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
  }

  const winners = entries.filter(e => e.status === 'winner').sort((a: any, b: any) => (b.earnings ?? 0) - (a.earnings ?? 0))
  const approved = entries.filter(e => e.status === 'approved').sort((a: any, b: any) => (b.earnings ?? 0) - (a.earnings ?? 0))
  const pending = entries.filter(e => e.status === 'pending')

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

      {/* Prizes + Leaderboard */}
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
                <span>Create a ticket in the <strong># 🎫︱ᴛᴏᴜʀɴᴀᴍᴇɴᴛ-ᴛɪᴄᴋᴇᴛ</strong> channel to apply for the tournament</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold shrink-0">3.</span>
                <span>In your ticket, include your <strong>in-game name (IGN)</strong> and <strong>ticket type</strong> (e.g. tournament)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 font-bold shrink-0">4.</span>
                <span>Wait for staff to approve your entry — you will see your name on the leaderboard once approved</span>
              </li>
            </ol>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-1 rounded-xl border border-border/50 bg-card/30 p-1">
            <button onClick={() => setActiveTab('winners')} className={`flex-1 rounded-lg px-3 py-2 text-xs font-bold transition-all ${activeTab === 'winners' ? 'bg-purple-500/20 text-purple-400 shadow-sm' : 'text-foreground/60 hover:text-foreground/80'}`}>
              Winners ({winners.length})
            </button>
            <button onClick={() => setActiveTab('approved')} className={`flex-1 rounded-lg px-3 py-2 text-xs font-bold transition-all ${activeTab === 'approved' ? 'bg-emerald-500/20 text-emerald-400 shadow-sm' : 'text-foreground/60 hover:text-foreground/80'}`}>
              Approved ({approved.length})
            </button>
            <button onClick={() => setActiveTab('pending')} className={`flex-1 rounded-lg px-3 py-2 text-xs font-bold transition-all ${activeTab === 'pending' ? 'bg-amber-500/20 text-amber-400 shadow-sm' : 'text-foreground/60 hover:text-foreground/80'}`}>
              Pending ({pending.length})
            </button>
          </div>

          {/* Table */}
          {loading ? (
            <div className="space-y-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-14 rounded-xl bg-card/30 border border-border/30 animate-skeleton" />
              ))}
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-border/50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-card/50">
                <h2 className="font-bold text-sm">
                  {activeTab === 'winners' ? 'Tournament Winners' : activeTab === 'approved' ? 'Approved Players' : 'Pending Applications'}
                </h2>
                <span className="text-xs text-foreground/60">
                  {activeTab === 'winners' ? winners.length : activeTab === 'approved' ? approved.length : pending.length} players
                </span>
              </div>
              {activeTab === 'winners' && (
                winners.length === 0 ? (
                  <div className="text-center py-16 text-foreground/50">No winners yet</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border/30">
                          <th className="px-4 py-2.5 text-left font-semibold text-foreground/70 w-10">#</th>
                          <th className="px-4 py-2.5 text-left font-semibold text-foreground/70">Player</th>
                          <th className="px-4 py-2.5 text-center font-semibold text-foreground/70 hidden sm:table-cell">Rank</th>
                          <th className="px-4 py-2.5 text-center font-semibold text-foreground/70">Tier</th>
                          <th className="px-4 py-2.5 text-center font-semibold text-foreground/70">Points</th>
                          <th className="px-4 py-2.5 text-right font-semibold text-foreground/70">Earnings</th>
                        </tr>
                      </thead>
                      <tbody>
                        {winners.map((e: any, i: number) => {
                          const rankInfo = getCombatRankFromPoints(e.points ?? 0)
                          const Emblem = rankInfo ? RANK_EMBLEMS[rankInfo.key] : null
                          return (
                            <tr key={e.id} className="border-b border-purple-500/20 bg-purple-500/5 transition-colors hover:bg-purple-500/10">
                              <td className="px-4 py-3">
                                <span className="text-sm">{['🥇','🥈','🥉'][i] || '🏅'}</span>
                              </td>
                              <td className="px-4 py-3 font-medium">{e.username}</td>
                              <td className="px-4 py-3 text-center hidden sm:table-cell">
                                {Emblem && (
                                  <div className="inline-flex items-center gap-1.5" title={`${rankInfo.name} (${e.points ?? 0} pts)`}>
                                    <Emblem size={20} />
                                    <span className="text-[10px] font-bold text-foreground/60">{rankInfo.name}</span>
                                  </div>
                                )}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-white/5 text-foreground/80">{e.tier}</span>
                              </td>
                              <td className="px-4 py-3 text-center font-mono font-bold text-purple-400">{e.points ?? 0}</td>
                              <td className="px-4 py-3 text-right font-mono font-bold text-emerald-400">${(e.earnings ?? 0).toFixed(2)}</td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )
              )}
              {activeTab === 'approved' && (
                approved.length === 0 ? (
                  <div className="text-center py-16 text-foreground/50">No approved players yet</div>
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
                        {approved.map((e: any, i: number) => {
                          const rankInfo = getCombatRankFromPoints(e.points ?? 0)
                          const Emblem = rankInfo ? RANK_EMBLEMS[rankInfo.key] : null
                          return (
                            <tr key={e.id} className="border-b border-border/30 transition-colors hover:bg-accent/20">
                              <td className="px-4 py-3 text-xs font-bold text-foreground/60">{i + 1}</td>
                              <td className="px-4 py-3 font-medium">{e.username}</td>
                              <td className="px-4 py-3 text-center hidden sm:table-cell">
                                {Emblem && (
                                  <div className="inline-flex items-center gap-1.5">
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
                )
              )}
              {activeTab === 'pending' && (
                pending.length === 0 ? (
                  <div className="text-center py-16 text-foreground/50">No pending applications</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border/30">
                          <th className="px-4 py-2.5 text-left font-semibold text-foreground/70">Player</th>
                          <th className="px-4 py-2.5 text-center font-semibold text-foreground/70 hidden sm:table-cell">Discord</th>
                          <th className="px-4 py-2.5 text-center font-semibold text-foreground/70">Tier</th>
                          <th className="px-4 py-2.5 text-right font-semibold text-foreground/70">Applied</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pending.map((e: any) => (
                          <tr key={e.id} className="border-b border-border/30 transition-colors hover:bg-accent/20">
                            <td className="px-4 py-3 font-medium">{e.username}</td>
                            <td className="px-4 py-3 text-center hidden sm:table-cell text-foreground/60 text-xs">{e.discordName || '—'}</td>
                            <td className="px-4 py-3 text-center">
                              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400">{e.tier}</span>
                            </td>
                            <td className="px-4 py-3 text-right text-xs text-foreground/50">{new Date(e.createdAt).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
