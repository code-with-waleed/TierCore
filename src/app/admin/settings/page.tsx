'use client'

import { useState, useEffect } from 'react'
import { DEFAULT_TIERS, TIER_POINTS, TIER_ORDER, COMBAT_RANKS } from '@/lib/points'
import { GAME_MODES } from '@/lib/game-modes'
import { RANK_EMBLEMS } from '@/lib/rank-emblems'

export default function AdminSettingsPage() {
  const [tab, setTab] = useState<'tiers' | 'modes' | 'ranks'>('tiers')
  const [serverIp, setServerIp] = useState('')
  const [totalTournaments, setTotalTournaments] = useState('0')
  const [ipSaved, setIpSaved] = useState(false)
  const [tournamentSaved, setTournamentSaved] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  async function fetchSettings() {
    try {
      const r = await fetch('/api/settings')
      const d = await r.json()
      if (d.serverIp) setServerIp(d.serverIp)
      if (d.totalTournaments !== undefined) setTotalTournaments(String(d.totalTournaments))
    } catch {}
  }

  async function saveServerIp() {
    setIpSaved(false)
    try {
      const r = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serverIp }),
      })
      if (r.ok) setIpSaved(true)
    } catch {}
  }

  async function saveTotalTournaments() {
    setTournamentSaved(false)
    try {
      const r = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ totalTournaments: parseInt(totalTournaments) || 0 }),
      })
      if (r.ok) { setTournamentSaved(true); setTotalTournaments(String(parseInt(totalTournaments) || 0)) }
    } catch {}
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-black mb-6">Settings</h1>

      {/* Server IP */}
      <div className="mb-6 rounded-xl border border-border/50 bg-card/50 p-6 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="font-bold text-sm">Server IP</h2>
          <p className="text-xs text-foreground/60 mt-0.5">Shown in the header copy button</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            value={serverIp}
            onChange={e => { setServerIp(e.target.value); setIpSaved(false) }}
            className="rounded-lg border border-border/50 bg-card px-3 py-2 text-sm w-56 focus:outline-none focus:border-amber-500/50"
          />
          <button onClick={saveServerIp} className="rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2 text-sm font-bold text-black hover:from-amber-400 hover:to-amber-500 transition-all">
            {ipSaved ? 'Saved' : 'Save'}
          </button>
        </div>
      </div>

      {/* Total Tournaments */}
      <div className="mb-6 rounded-xl border border-border/50 bg-card/50 p-6 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="font-bold text-sm">Total Tournaments</h2>
          <p className="text-xs text-foreground/60 mt-0.5">Shown on the tournaments page</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={totalTournaments}
            onChange={e => { setTotalTournaments(e.target.value); setTournamentSaved(false) }}
            className="rounded-lg border border-border/50 bg-card px-3 py-2 text-sm w-24 focus:outline-none focus:border-amber-500/50"
          />
          <button onClick={saveTotalTournaments} className="rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2 text-sm font-bold text-black hover:from-amber-400 hover:to-amber-500 transition-all">
            {tournamentSaved ? 'Saved' : 'Save'}
          </button>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        <button onClick={() => setTab('tiers')} className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${tab === 'tiers' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-card border border-border/50 text-foreground/70'}`}>Tiers</button>
        <button onClick={() => setTab('modes')} className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${tab === 'modes' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-card border border-border/50 text-foreground/70'}`}>Game Modes</button>
        <button onClick={() => setTab('ranks')} className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${tab === 'ranks' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-card border border-border/50 text-foreground/70'}`}>Ranks</button>
      </div>

      {tab === 'tiers' && (
        <div className="rounded-xl border border-border/50 bg-card/50 p-6 overflow-x-auto">
          <h2 className="font-bold text-lg mb-4">Tier Configuration</h2>
          <p className="text-sm text-foreground/70 mb-4">Order: LT5 → HT5 → LT4 → HT4 → LT3 → HT3 → LT2 → HT2 → LT1 → HT1</p>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 text-foreground/70">
                <th className="px-3 py-2 text-left">#</th>
                <th className="px-3 py-2 text-left">Tier</th>
                <th className="px-3 py-2 text-right">Points Required</th>
                <th className="px-3 py-2 text-right">Points per Win</th>
                <th className="px-3 py-2 text-center">Color</th>
              </tr>
            </thead>
            <tbody>
              {TIER_ORDER.filter(k => !k.startsWith('r')).map((key, i) => {
                const t = DEFAULT_TIERS.find(t => t.key === key)!
                return (
                  <tr key={key} className="border-b border-border/30">
                    <td className="px-3 py-2 text-foreground/70">{i + 1}</td>
                    <td className="px-3 py-2 font-bold" style={{ color: t.color }}>{t.shortName}</td>
                    <td className="px-3 py-2 text-right font-mono">{t.minPoints}{t.maxPoints !== t.minPoints ? `–${t.maxPoints === 9999 ? '∞' : t.maxPoints}` : ''}</td>
                    <td className="px-3 py-2 text-right font-mono font-bold" style={{ color: t.color }}>+{TIER_POINTS[key]}</td>
                    <td className="px-3 py-2 text-center"><span className="inline-block h-4 w-4 rounded-full border border-border/50" style={{ backgroundColor: t.color }} /></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'modes' && (
        <div className="rounded-xl border border-border/50 bg-card/50 p-6">
          <h2 className="font-bold text-lg mb-4">Game Modes</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {GAME_MODES.map(mode => (
              <div key={mode.id} className="flex items-center gap-3 rounded-lg bg-card p-4">
                <img src={mode.icon} alt={mode.name} className="w-8 h-8" />
                <div>
                  <div className="font-medium text-sm">{mode.name}</div>
                  <div className="text-xs text-foreground/70">{mode.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'ranks' && (
        <div className="space-y-4">
          <div className="rounded-xl border border-border/50 bg-card/50 p-6">
            <h2 className="font-bold text-lg mb-1">Combat Ranks</h2>
            <p className="text-sm text-foreground/70 mb-6">Total points determine your combat rank. Each badge is a mark of prestige.</p>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {COMBAT_RANKS.map(rank => {
                const Emblem = RANK_EMBLEMS[rank.key]
                return (
                  <div key={rank.key} className="group relative overflow-hidden rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl" style={{
                    borderColor: `${rank.color}40`,
                    background: `linear-gradient(135deg, ${rank.color}12 0%, transparent 50%, ${rank.color}08 100%)`,
                  }}>
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{
                      background: `radial-gradient(600px circle at 50% 0%, ${rank.color}15 0%, transparent 70%)`,
                    }} />
                    <div className="relative z-10 flex items-center gap-4">
                      <div className="flex-shrink-0">
                        {Emblem && <Emblem size={52} glow />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-black tracking-tight" style={{ color: rank.color }}>{rank.name}</h3>
                          <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full" style={{
                            backgroundColor: `${rank.color}20`,
                            color: rank.color,
                            border: `1px solid ${rank.color}30`,
                          }}>
                            Rank
                          </span>
                        </div>
                        <div className="mt-1 flex items-center gap-2">
                          <span className="font-mono text-sm font-bold" style={{ color: rank.color }}>{rank.minPoints}</span>
                          <span className="text-foreground/40 text-xs">—</span>
                          <span className="font-mono text-sm font-bold" style={{ color: rank.color }}>{rank.maxPoints}</span>
                          <span className="text-foreground/50 text-xs ml-1">points</span>
                        </div>
                        <div className="mt-2 flex items-center gap-1.5">
                          <div className="h-1.5 flex-1 rounded-full overflow-hidden" style={{ backgroundColor: `${rank.color}20` }}>
                            <div className="h-full rounded-full transition-all duration-500" style={{
                              width: '100%',
                              background: `linear-gradient(90deg, ${rank.color}40, ${rank.color})`,
                            }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="rounded-xl border border-border/50 bg-card/50 p-6">
            <h2 className="font-bold text-lg mb-1">Tag Preview</h2>
            <p className="text-sm text-foreground/70 mb-6">How rank tags appear on leaderboards and profiles.</p>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {[...COMBAT_RANKS].reverse().slice(0, 6).map(rank => {
                const Emblem = RANK_EMBLEMS[rank.key]
                return (
                  <div key={rank.key} className="flex items-center gap-3 rounded-xl border p-3" style={{
                    borderColor: `${rank.color}25`,
                    background: `linear-gradient(135deg, ${rank.color}08 0%, transparent 100%)`,
                  }}>
                    <div className="flex-shrink-0">{Emblem && <Emblem size={36} />}</div>
                    <div className="flex-1">
                      <div className="text-sm font-bold" style={{ color: rank.color }}>{rank.name}</div>
                      <div className="text-[10px] text-foreground/50 font-mono">{rank.minPoints}–{rank.maxPoints} pts</div>
                    </div>
                    <div className="px-3 py-1 rounded-lg text-xs font-bold shadow-sm" style={{
                      backgroundColor: `${rank.color}18`,
                      color: rank.color,
                      border: `1px solid ${rank.color}30`,
                      boxShadow: `0 0 8px ${rank.color}20`,
                    }}>
                      {rank.name}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
