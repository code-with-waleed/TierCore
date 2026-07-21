'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

export default function AdminMatchesPage() {
  const [players, setPlayers] = useState<any[]>([])
  const [matches, setMatches] = useState<any[]>([])
  const [p1, setP1] = useState(''); const [p2, setP2] = useState('')
  const [winner, setWinner] = useState<'player1' | 'player2' | 'draw'>('player1')
  const [mode, setMode] = useState('sword')
  const [msg, setMsg] = useState('')
  const [tab, setTab] = useState<'submit' | 'list' | 'remove'>('list')

  const MODES = ['sword', 'axe', 'pot', 'nethpot', 'uhc', 'mace', 'smp', 'vanilla']

  // Remove panel state
  const [removeSearch, setRemoveSearch] = useState('')
  const [removeResults, setRemoveResults] = useState<any[]>([])
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null)
  const [removing, setRemoving] = useState(false)
  const [confirmAll, setConfirmAll] = useState<'none' | 'first' | 'second'>('none')

  useEffect(() => {
    fetchPlayers(); fetchMatches()
  }, [])

  async function fetchPlayers() {
    try { const r = await fetch('/api/players'); const d = await r.json(); setPlayers(d.data ?? []) } catch { setPlayers([]) }
  }
  async function fetchMatches() {
    try { const r = await fetch('/api/matches'); const d = await r.json(); setMatches(d.data ?? []) } catch { setMatches([]) }
  }

  async function submitMatch() {
    if (!p1 || !p2) return
    const pl1 = players.find(p => p.username.toLowerCase() === p1.toLowerCase())
    const pl2 = players.find(p => p.username.toLowerCase() === p2.toLowerCase())
    if (!pl1 || !pl2) { setMsg('❌ Player not found'); return }
    const r = await fetch('/api/matches', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ player1Id: pl1.id, player2Id: pl2.id, winner, mode }),
    })
    if (r.ok) { setMsg('✅ Match submitted!'); setP1(''); setP2(''); fetchMatches() }
    else { const e = await r.json(); setMsg(`❌ ${e.error}`) }
  }

  async function approveMatch(id: string) {
    const r = await fetch(`/api/matches/${id}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'approve' }),
    })
    if (r.ok) { setMsg('✅ Match approved!'); fetchMatches(); fetchPlayers() }
    else setMsg('❌ Failed to approve')
  }

  async function rejectMatch(id: string) {
    const r = await fetch(`/api/matches/${id}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reject', reason: 'Rejected by admin' }),
    })
    if (r.ok) { setMsg('✅ Match rejected!'); fetchMatches() }
    else setMsg('❌ Failed to reject')
  }

  async function removePlayerMatches() {
    if (!selectedPlayer) return
    setRemoving(true); setMsg('')
    try {
      const r = await fetch('/api/admin/clear-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId: selectedPlayer.id }),
      })
      if (r.ok) {
        setMsg(`✅ Removed all matches for ${selectedPlayer.username}`)
        setSelectedPlayer(null); setRemoveSearch(''); setRemoveResults([])
        fetchMatches(); fetchPlayers()
      } else { setMsg('❌ Failed to remove matches') }
    } catch { setMsg('❌ Failed to remove matches') }
    setRemoving(false)
  }

  async function removeAllMatches() {
    setRemoving(true); setMsg('')
    try {
      const r = await fetch('/api/admin/clear-data', { method: 'POST' })
      if (r.ok) {
        setMsg('✅ All matches cleared!')
        setConfirmAll('none')
        fetchMatches(); fetchPlayers()
      } else { setMsg('❌ Failed to clear matches') }
    } catch { setMsg('❌ Failed to clear matches') }
    setRemoving(false)
  }

  function searchPlayers(query: string) {
    setRemoveSearch(query)
    if (!query || query.length < 1) { setRemoveResults([]); return }
    const q = query.toLowerCase()
    const results = players.filter(p => p.username.toLowerCase().includes(q)).slice(0, 10)
    setRemoveResults(results)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-black mb-6">Match Management</h1>

      <div className="flex gap-2 mb-6">
        <button onClick={() => setTab('list')} className={cn('rounded-lg px-4 py-2 text-sm font-medium transition-colors', tab === 'list' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-card border border-border/50 text-muted-foreground')}>Match List</button>
        <button onClick={() => setTab('submit')} className={cn('rounded-lg px-4 py-2 text-sm font-medium transition-colors', tab === 'submit' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-card border border-border/50 text-muted-foreground')}>Submit Match</button>
        <button onClick={() => setTab('remove')} className={cn('rounded-lg px-4 py-2 text-sm font-medium transition-colors', tab === 'remove' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-card border border-border/50 text-muted-foreground')}>Remove Matches</button>
      </div>

      {msg && (
        <div className={cn('mb-4 rounded-lg border px-4 py-2 text-sm', msg.startsWith('✅') ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' : 'border-red-500/30 bg-red-500/10 text-red-400')}>
          {msg}
        </div>
      )}

      {tab === 'submit' && (
        <div className="rounded-xl border border-border/50 bg-card/50 p-6">
          <h2 className="font-bold text-lg mb-4">Submit Match</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 items-end">
            <div><label className="block text-xs text-muted-foreground mb-1">Player 1</label><input value={p1} onChange={e => setP1(e.target.value)} placeholder="Username" className="w-full rounded-lg border border-border/50 bg-card px-3 py-2 text-sm focus:outline-none focus:border-amber-500/50" /></div>
            <div><label className="block text-xs text-muted-foreground mb-1">Player 2</label><input value={p2} onChange={e => setP2(e.target.value)} placeholder="Username" className="w-full rounded-lg border border-border/50 bg-card px-3 py-2 text-sm focus:outline-none focus:border-amber-500/50" /></div>
            <div><label className="block text-xs text-muted-foreground mb-1">Winner</label>
              <select value={winner} onChange={e => setWinner(e.target.value as any)} className="w-full rounded-lg border border-border/50 bg-card px-3 py-2 text-sm">
                <option value="player1">Player 1</option>
                <option value="player2">Player 2</option>
                <option value="draw">Draw</option>
              </select>
            </div>
            <div><label className="block text-xs text-muted-foreground mb-1">Mode</label>
              <select value={mode} onChange={e => setMode(e.target.value)} className="w-full rounded-lg border border-border/50 bg-card px-3 py-2 text-sm">
                {MODES.map(m => <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>)}
              </select>
            </div>
          </div>
          <button onClick={submitMatch} className="mt-4 rounded-lg bg-amber-500 px-5 py-2 text-sm font-bold text-black hover:bg-amber-400 transition-all">Submit Match</button>
        </div>
      )}

      {tab === 'list' && (
        <div className="rounded-xl border border-border/50 bg-card/50 p-6 overflow-x-auto">
          <h2 className="font-bold text-lg mb-4">All Matches</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 text-muted-foreground">
                <th className="px-3 py-2 text-left">P1</th>
                <th className="px-3 py-2 text-center">vs</th>
                <th className="px-3 py-2 text-left">P2</th>
                <th className="px-3 py-2 text-center">Mode</th>
                <th className="px-3 py-2 text-center">Status</th>
                <th className="px-3 py-2 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {matches.map((m: any) => (
                <tr key={m.id} className="border-b border-border/30 hover:bg-accent/20">
                  <td className="px-3 py-2 font-medium">{m.player1?.username ?? m.player1Id?.slice(0,8)}</td>
                  <td className="px-3 py-2 text-center font-bold">
                    <span className={cn('rounded px-2 py-0.5 text-xs', m.winner === 'player1' ? 'bg-green-500/20 text-green-400' : m.winner === 'player2' ? 'bg-red-500/20 text-red-400' : 'bg-gray-500/20 text-gray-400')}>
                      {m.winner === 'player1' ? '1-0' : m.winner === 'player2' ? '0-1' : 'D'}
                    </span>
                  </td>
                  <td className="px-3 py-2 font-medium">{m.player2?.username ?? m.player2Id?.slice(0,8)}</td>
                  <td className="px-3 py-2 text-center text-xs text-muted-foreground uppercase">{m.mode}</td>
                  <td className="px-3 py-2 text-center">
                    <span className={cn('rounded px-2 py-0.5 text-xs font-medium', m.status === 'APPROVED' && 'bg-green-500/20 text-green-400', m.status === 'PENDING' && 'bg-yellow-500/20 text-yellow-400', m.status === 'REJECTED' && 'bg-red-500/20 text-red-400')}>{m.status}</span>
                  </td>
                  <td className="px-3 py-2 text-center">
                    {m.status === 'PENDING' && (
                      <div className="flex gap-1 justify-center">
                        <button onClick={() => approveMatch(m.id)} className="rounded bg-green-500/20 px-2 py-1 text-xs text-green-400 hover:bg-green-500/30 transition-colors">✓</button>
                        <button onClick={() => rejectMatch(m.id)} className="rounded bg-red-500/20 px-2 py-1 text-xs text-red-400 hover:bg-red-500/30 transition-colors">✗</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {matches.length === 0 && <tr><td colSpan={6} className="px-3 py-6 text-center text-muted-foreground">No matches yet</td></tr>}
            </tbody>
          </table>
          <button onClick={fetchMatches} className="mt-4 text-xs text-amber-400 hover:text-amber-300 transition-colors">↻ Refresh</button>
        </div>
      )}

      {tab === 'remove' && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Remove by player */}
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6">
            <h2 className="font-bold text-lg mb-4 text-red-400">Remove Matches by Player</h2>
            <p className="text-xs text-foreground/50 mb-4">Find a player and remove all their match history. Player stats (points, tiers) will not be affected.</p>

            <input
              value={removeSearch}
              onChange={e => searchPlayers(e.target.value)}
              placeholder="Search player..."
              className="w-full rounded-lg border border-border/50 bg-card px-3 py-2 text-sm focus:outline-none focus:border-red-500/50 mb-3"
            />
            {removeResults.length > 0 && (
              <div className="mb-3 rounded-lg border border-border/50 bg-card max-h-32 overflow-y-auto">
                {removeResults.map((p: any) => (
                  <button
                    key={p.id}
                    onClick={() => { setSelectedPlayer(p); setRemoveResults([]); setRemoveSearch(p.username) }}
                    className="w-full px-3 py-1.5 text-left text-sm hover:bg-accent transition-colors"
                  >
                    {p.username} {p.region ? `(${p.region})` : ''}
                  </button>
                ))}
              </div>
            )}

            {selectedPlayer && (
              <div className="mb-3 rounded-lg bg-red-500/10 border border-red-500/30 px-3 py-2 text-sm text-red-400 flex items-center justify-between">
                <span>Remove all matches for <strong>{selectedPlayer.username}</strong>?</span>
                <button onClick={() => { setSelectedPlayer(null); setRemoveSearch('') }} className="text-xs text-foreground/50 hover:text-foreground">Cancel</button>
              </div>
            )}

            <button
              onClick={removePlayerMatches}
              disabled={!selectedPlayer || removing}
              className="w-full rounded-lg bg-red-500/20 border border-red-500/30 px-4 py-2.5 text-sm font-bold text-red-400 hover:bg-red-500/30 transition-all disabled:opacity-40"
            >
              {removing ? 'Removing...' : selectedPlayer ? `Remove ${selectedPlayer.username}'s Matches` : 'Select a player first'}
            </button>
          </div>

          {/* Remove ALL matches */}
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6">
            <h2 className="font-bold text-lg mb-4 text-red-400">Remove ALL Matches</h2>
            <p className="text-xs text-foreground/50 mb-4">This will permanently delete every match in the database. Player points and tier data will be preserved.</p>

            {confirmAll === 'none' && (
              <button
                onClick={() => setConfirmAll('first')}
                className="w-full rounded-lg bg-red-500 px-4 py-3 text-sm font-bold text-white hover:bg-red-400 transition-all"
              >
                Clear All Matches
              </button>
            )}

            {confirmAll === 'first' && (
              <div className="space-y-3">
                <div className="rounded-lg bg-red-500/20 border border-red-500/40 px-4 py-3">
                  <p className="text-sm text-red-400 font-medium">Are you sure? This will delete ALL matches. This cannot be undone.</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setConfirmAll('second')}
                    className="flex-1 rounded-lg bg-red-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-400 transition-all"
                  >
                    Yes, Delete All
                  </button>
                  <button
                    onClick={() => setConfirmAll('none')}
                    className="rounded-lg border border-border/50 px-4 py-2.5 text-sm font-bold text-foreground/70 hover:text-foreground transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {confirmAll === 'second' && (
              <div className="space-y-3">
                <div className="rounded-lg bg-red-500/30 border border-red-500/50 px-4 py-3">
                  <p className="text-sm text-red-300 font-bold">⚠️ FINAL WARNING: This will permanently remove ALL matches!</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={removeAllMatches}
                    disabled={removing}
                    className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-red-500 transition-all disabled:opacity-50"
                  >
                    {removing ? 'Deleting...' : 'I Understand, Delete Everything'}
                  </button>
                  <button
                    onClick={() => setConfirmAll('none')}
                    className="rounded-lg border border-border/50 px-4 py-2.5 text-sm font-bold text-foreground/70 hover:text-foreground transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
