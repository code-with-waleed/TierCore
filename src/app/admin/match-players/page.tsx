'use client'

import { useState, useEffect } from 'react'
import { GAME_MODES } from '@/lib/game-modes'

export default function AdminMatchPlayersPage() {
  const [matchPlayers, setMatchPlayers] = useState<any[]>([])
  const [allPlayers, setAllPlayers] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')

  const [nextMatchDate, setNextMatchDate] = useState('')
  const [nextMatchDateInput, setNextMatchDateInput] = useState('')
  const [savingDate, setSavingDate] = useState(false)
  const [dateMsg, setDateMsg] = useState('')

  const [editEarnings, setEditEarnings] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchAll()
    fetchSettings()
  }, [])

  async function fetchSettings() {
    try {
      const r = await fetch('/api/settings')
      const d = await r.json()
      if (d.nextMatchDate) { setNextMatchDate(d.nextMatchDate); setNextMatchDateInput(d.nextMatchDate) }
    } catch {}
  }

  async function fetchAll() {
    setLoading(true)
    try {
      const [mr, pr] = await Promise.all([
        fetch('/api/players?showAll=true&matchPlayers=true'),
        fetch('/api/players?showAll=true'),
      ])
      const md = await mr.json()
      const pd = await pr.json()
      const matchP = (md.data ?? []).filter((p: any) => p.isMatchPlayer)
      setMatchPlayers(matchP)
      setAllPlayers(pd.data ?? [])
      const earnings: Record<string, string> = {}
      matchP.forEach((p: any) => { earnings[p.id] = String(p.earnings ?? '0') })
      setEditEarnings(earnings)
    } catch {}
    setLoading(false)
  }

  async function addToMatches(playerId: string) {
    setMsg('')
    const r = await fetch(`/api/players/${playerId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isMatchPlayer: true }),
    })
    if (r.ok) {
      setMsg('Player added to matches!')
      fetchAll()
    } else {
      setMsg('Failed to add player')
    }
  }

  async function removeFromMatches(playerId: string) {
    setMsg('')
    const r = await fetch(`/api/players/${playerId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isMatchPlayer: false }),
    })
    if (r.ok) {
      setMsg('Player removed from matches!')
      fetchAll()
    } else {
      setMsg('Failed to remove player')
    }
  }

  async function saveEarnings(playerId: string) {
    setMsg('')
    const val = parseFloat(editEarnings[playerId])
    if (isNaN(val)) return
    const r = await fetch(`/api/players/${playerId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ earnings: val }),
    })
    if (r.ok) {
      setMsg('Earnings updated!')
      fetchAll()
    } else {
      setMsg('Failed to update earnings')
    }
  }

  async function saveNextMatchDate() {
    setSavingDate(true)
    setDateMsg('')
    const r = await fetch('/api/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nextMatchDate: nextMatchDateInput || null }),
    })
    if (r.ok) {
      setNextMatchDate(nextMatchDateInput)
      setDateMsg('Saved!')
    } else {
      setDateMsg('Failed to save')
    }
    setSavingDate(false)
  }

  const filtered = allPlayers.filter(p =>
    p.username?.toLowerCase().includes(search.toLowerCase()) && !p.isMatchPlayer
  ).slice(0, 20)

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black">Match Players</h1>
          <p className="text-sm text-foreground/70 mt-1">Manage the match roster and tournament dates</p>
        </div>
        <button onClick={fetchAll} className="text-xs text-amber-400 hover:text-amber-300 transition-colors">↻ Refresh</button>
      </div>

      {msg && (
        <div className="mb-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-400">{msg}</div>
      )}

      {/* Date Panel */}
      <div className="mb-6 rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-amber-500/10 p-6">
        <h2 className="font-bold text-lg mb-3">Next Tournament / Match Date</h2>
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
          <div className="flex-1 w-full sm:w-auto">
            <input
              type="datetime-local"
              value={nextMatchDateInput}
              onChange={e => setNextMatchDateInput(e.target.value)}
              className="w-full rounded-lg border border-border/50 bg-card px-4 py-2.5 text-sm font-mono text-foreground focus:outline-none focus:border-amber-500/50"
            />
          </div>
          <button
            onClick={saveNextMatchDate}
            disabled={savingDate}
            className="rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-bold text-black hover:bg-amber-400 transition-all disabled:opacity-50"
          >
            {savingDate ? 'Saving...' : 'Save Date'}
          </button>
          {nextMatchDate && (
            <button
              onClick={async () => { setNextMatchDateInput(''); const r = await fetch('/api/settings', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nextMatchDate: null }) }); if (r.ok) { setNextMatchDate(''); setDateMsg('Cleared!') } }}
              className="text-xs text-red-400 hover:text-red-300"
            >
              Clear
            </button>
          )}
        </div>
        {dateMsg && <p className="text-xs text-emerald-400 mt-2">{dateMsg}</p>}
        {nextMatchDate && (
          <p className="text-xs text-foreground/70 mt-2">
            Current: <span className="text-amber-400 font-medium">{new Date(nextMatchDate).toLocaleString()}</span>
          </p>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Add Players */}
        <div className="rounded-xl border border-border/50 bg-card/50 p-6">
          <h2 className="font-bold text-lg mb-4">Add Player to Matches</h2>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search players..."
            className="w-full rounded-lg border border-border/50 bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:border-amber-500/50 mb-3"
          />
          <div className="space-y-1 max-h-80 overflow-y-auto">
            {search && filtered.length === 0 && (
              <p className="text-sm text-foreground/50 py-4 text-center">No players found</p>
            )}
            {filtered.map(p => (
              <div key={p.id} className="flex items-center justify-between rounded-lg bg-card/70 px-3 py-2 border border-border/30">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm">{p.username}</span>
                  <span className="text-[10px] text-foreground/50">{p.points} pts</span>
                </div>
                <button
                  onClick={() => addToMatches(p.id)}
                  className="rounded-md bg-emerald-500/20 border border-emerald-500/30 px-3 py-1 text-xs font-medium text-emerald-400 hover:bg-emerald-500/30 transition-all"
                >
                  Add
                </button>
              </div>
            ))}
            {!search && (
              <p className="text-sm text-foreground/50 py-4 text-center">Type to search players</p>
            )}
          </div>
        </div>

        {/* Current Match Players */}
        <div className="rounded-xl border border-border/50 bg-card/50 p-6">
          <h2 className="font-bold text-lg mb-4">Current Match Roster ({matchPlayers.length})</h2>
          {loading ? (
            <div className="space-y-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-12 rounded-lg bg-card/30 animate-skeleton" />
              ))}
            </div>
          ) : matchPlayers.length === 0 ? (
            <p className="text-sm text-foreground/50 py-8 text-center">No players in matches yet</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {matchPlayers.map(p => (
                <div key={p.id} className="flex items-center justify-between rounded-lg bg-card/70 px-3 py-2 border border-border/30">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-medium text-sm truncate">{p.username}</span>
                    <span className="text-[10px] text-foreground/50 whitespace-nowrap">{p.points} pts</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <input
                      type="number"
                      value={editEarnings[p.id] ?? '0'}
                      onChange={e => setEditEarnings(prev => ({ ...prev, [p.id]: e.target.value }))}
                      className="w-20 rounded-md border border-border/50 bg-card px-2 py-1 text-xs font-mono text-foreground text-right focus:outline-none focus:border-amber-500/50"
                      placeholder="$"
                    />
                    <button
                      onClick={() => saveEarnings(p.id)}
                      className="rounded-md bg-amber-500/20 border border-amber-500/30 px-2 py-1 text-xs font-medium text-amber-400 hover:bg-amber-500/30 transition-all"
                    >
                      $
                    </button>
                    <button
                      onClick={() => removeFromMatches(p.id)}
                      className="rounded-md bg-red-500/20 border border-red-500/30 px-2 py-1 text-xs font-medium text-red-400 hover:bg-red-500/30 transition-all"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
