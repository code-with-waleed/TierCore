'use client'

import { useState, useEffect } from 'react'
import { GAME_MODES } from '@/lib/game-modes'
import { DEFAULT_TIERS, TIER_ORDER } from '@/lib/points'

const REGIONS = ['NA', 'EU', 'AS', 'AU']

const MC_USERNAME_RE = /^[a-zA-Z0-9_]{1,16}$/

function validateMcUsername(name: string): string | null {
  if (!name) return 'Username is required'
  if (name.length > 16) return 'Username must be 16 characters or less'
  if (!MC_USERNAME_RE.test(name)) return 'Minecraft usernames can only contain letters, numbers, and underscores (no spaces or special chars)'
  return null
}

export default function AdminPlayersPage() {
  const [msg, setMsg] = useState('')

  const modesNoOverall = GAME_MODES.filter(m => m.id !== 'overall')
  const [username, setUsername] = useState('')
  const [addMode, setAddMode] = useState(modesNoOverall[0].id)
  const [addRegion, setAddRegion] = useState('NA')
  const [addPoints, setAddPoints] = useState('1')
  const [addTier, setAddTier] = useState('')
  const [addError, setAddError] = useState('')

  const [removeSearch, setRemoveSearch] = useState('')
  const [removeResults, setRemoveResults] = useState<any[]>([])
  const [removePlayerId, setRemovePlayerId] = useState('')
  const [removePlayerLabel, setRemovePlayerLabel] = useState('')
  const [removeMode, setRemoveMode] = useState('overall')

  const [editSearch, setEditSearch] = useState('')
  const [editResults, setEditResults] = useState<any[]>([])
  const [editPlayerId, setEditPlayerId] = useState('')
  const [editPlayerLabel, setEditPlayerLabel] = useState('')
  const [editMode, setEditMode] = useState(modesNoOverall[0].id)
  const [editPoints, setEditPoints] = useState('1')
  const [editTier, setEditTier] = useState('')
  const [editRegion, setEditRegion] = useState('NA')

  async function searchPlayers(query: string, setResults: (r: any[]) => void) {
    if (!query || query.length < 1) { setResults([]); return }
    try {
      const r = await fetch(`/api/players?search=${encodeURIComponent(query)}`)
      const d = await r.json()
      setResults(d.data ?? [])
    } catch { setResults([]) }
  }

  async function addPlayer() {
    setAddError('')
    const err = validateMcUsername(username)
    if (err) { setAddError(err); return }
    if (!addPoints || parseInt(addPoints) < 0) { setAddError('Points must be 0 or more'); return }

    const tierKey = addTier || getTierKeyForPoints(parseInt(addPoints))

    const r = await fetch('/api/players', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username,
        region: addRegion,
        mode: addMode,
        tierKey,
        points: parseInt(addPoints),
      }),
    })
    if (r.ok) {
      setMsg(`Added ${username} to ${addMode}`)
      setUsername('')
      setAddPoints('1')
      setAddTier('')
    } else {
      const e = await r.json()
      setAddError(e.error ?? 'Failed to add player')
    }
  }

  function getTierKeyForPoints(pts: number): string {
    for (const key of TIER_ORDER) {
      const t = DEFAULT_TIERS.find(t => t.key === key)!
      if (pts >= t.minPoints && pts <= t.maxPoints) return key
    }
    return TIER_ORDER[TIER_ORDER.length - 1]
  }

  async function removePlayer() {
    if (!removePlayerId) return
    if (removeMode === 'overall') {
      const r = await fetch(`/api/players/${removePlayerId}`, { method: 'DELETE' })
      if (r.ok) { setMsg('Player deleted'); setRemovePlayerId(''); setRemovePlayerLabel(''); setRemoveSearch('') }
      else { const e = await r.json(); setMsg(`Error: ${e.error}`) }
    } else {
      const r = await fetch(`/api/players/${removePlayerId}/mode`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: removeMode }),
      })
      if (r.ok) { setMsg(`Removed from ${removeMode}`); setRemoveResults([]) }
      else { const e = await r.json(); setMsg(`Error: ${e.error}`) }
    }
  }

  async function editPlayer() {
    if (!editPlayerId) return
    const tierKey = editTier || getTierKeyForPoints(parseInt(editPoints) || 0)
    const r = await fetch(`/api/players/${editPlayerId}/mode`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode: editMode, tierKey, points: parseInt(editPoints) || 0, region: editRegion }),
    })
    if (r.ok) {
      setMsg('Player updated')
      setEditPlayerId(''); setEditPlayerLabel(''); setEditSearch(''); setEditTier('')
    } else { const e = await r.json(); setMsg(`Error: ${e.error}`) }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-black mb-6 animate-slide-up">Player Management</h1>
      {msg && (
        <div className="mb-4 rounded-lg bg-amber-500/10 border border-amber-500/30 px-4 py-2 text-sm text-amber-400 flex items-center justify-between animate-slide-up">
          <span>{msg}</span>
          <button onClick={() => setMsg('')} className="text-muted-foreground hover:text-foreground">&times;</button>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3 mb-8">
        {/* Add Player Panel */}
        <div className="p-6 animate-slide-up anim-delay-1 card-premium">
          <h2 className="font-bold text-lg mb-4">Add Player</h2>
          {addError && <p className="mb-3 text-xs text-red-400">{addError}</p>}
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Minecraft Username</label>
              <input
                value={username}
                onChange={e => { setUsername(e.target.value); setAddError('') }}
                placeholder="Enter username..."
                className="w-full rounded-lg border border-border/50 bg-card px-3 py-2 text-sm focus:outline-none focus:border-amber-500/50"
                onKeyDown={e => e.key === 'Enter' && addPlayer()}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Game Mode</label>
                <select value={addMode} onChange={e => setAddMode(e.target.value)} className="w-full rounded-lg border border-border/50 bg-card px-3 py-2 text-sm">
                  {modesNoOverall.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Region</label>
                <select value={addRegion} onChange={e => setAddRegion(e.target.value)} className="w-full rounded-lg border border-border/50 bg-card px-3 py-2 text-sm">
                  {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Points</label>
                <input type="number" min="0" value={addPoints} onChange={e => { setAddPoints(e.target.value); setAddTier('') }} className="w-full rounded-lg border border-border/50 bg-card px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Tier (optional)</label>
                <select value={addTier} onChange={e => setAddTier(e.target.value)} className="w-full rounded-lg border border-border/50 bg-card px-3 py-2 text-sm">
                  <option value="">Auto ({getTierKeyForPoints(parseInt(addPoints) || 0).toUpperCase()})</option>
                  {DEFAULT_TIERS.map(t => <option key={t.key} value={t.key}>{t.shortName}</option>)}
                </select>
              </div>
            </div>
            <button onClick={addPlayer} className="w-full rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2 text-sm font-bold text-black hover:from-amber-400 hover:to-amber-500 transition-all hover-lift btn-press btn-shimmer btn-gradient-shift">
              Add Player
            </button>
          </div>
        </div>

        {/* Remove Player Panel */}
        <div className="p-6 animate-slide-up anim-delay-2 card-premium">
          <h2 className="font-bold text-lg mb-4">Remove Player</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Find Player</label>
              <input
                value={removeSearch}
                onChange={e => { setRemoveSearch(e.target.value); if (e.target.value !== removeSearch) { setRemovePlayerId(''); setRemovePlayerLabel('') } searchPlayers(e.target.value, setRemoveResults) }}
                placeholder="Type username..."
                className="w-full rounded-lg border border-border/50 bg-card px-3 py-2 text-sm focus:outline-none focus:border-amber-500/50"
              />
              {removeResults.length > 0 && (
                <div className="mt-1 rounded-lg border border-border/50 bg-card max-h-32 overflow-y-auto">
                  {removeResults.map((p: any) => (
                    <button
                      key={p.id}
                      onClick={() => { setRemovePlayerId(p.id); setRemovePlayerLabel(p.username); setRemoveResults([]) }}
                      className="w-full px-3 py-1.5 text-left text-sm hover:bg-accent transition-colors"
                    >
                      {p.username} {p.region ? `(${p.region})` : ''}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {removePlayerLabel && (
              <div className="rounded-lg bg-amber-500/10 px-3 py-2 text-sm text-amber-400">
                Selected: {removePlayerLabel}
              </div>
            )}
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Remove From</label>
              <select value={removeMode} onChange={e => setRemoveMode(e.target.value)} className="w-full rounded-lg border border-border/50 bg-card px-3 py-2 text-sm">
                <option value="overall">All Game Modes (Delete Player)</option>
                {modesNoOverall.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
            <button
              onClick={removePlayer}
              className={`w-full rounded-lg px-4 py-2 text-sm font-bold transition-all btn-press ${
                removePlayerId
                  ? 'bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30'
                  : 'bg-red-500/10 border border-red-500/20 text-red-400/50'
              }`}
            >
              Remove
            </button>
          </div>
        </div>

        {/* Edit Player Panel */}
        <div className="p-6 animate-slide-up anim-delay-3 card-premium">
          <h2 className="font-bold text-lg mb-4">Edit Player</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-muted-foreground mb-1">Find Player</label>
              <input
                value={editSearch}
                onChange={e => { setEditSearch(e.target.value); if (e.target.value !== editSearch) { setEditPlayerId(''); setEditPlayerLabel('') } searchPlayers(e.target.value, setEditResults) }}
                placeholder="Type username..."
                className="w-full rounded-lg border border-border/50 bg-card px-3 py-2 text-sm focus:outline-none focus:border-amber-500/50"
              />
              {editResults.length > 0 && (
                <div className="mt-1 rounded-lg border border-border/50 bg-card max-h-32 overflow-y-auto">
                  {editResults.map((p: any) => (
                    <button
                      key={p.id}
                      onClick={() => { setEditPlayerId(p.id); setEditPlayerLabel(p.username); setEditRegion(p.region ?? 'NA'); setEditResults([]) }}
                      className="w-full px-3 py-1.5 text-left text-sm hover:bg-accent transition-colors"
                    >
                      {p.username} {p.region ? `(${p.region})` : ''}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {editPlayerLabel && (
              <div className="rounded-lg bg-blue-500/10 px-3 py-2 text-sm text-blue-400">
                Selected: {editPlayerLabel}
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Game Mode</label>
                <select value={editMode} onChange={e => setEditMode(e.target.value)} className="w-full rounded-lg border border-border/50 bg-card px-3 py-2 text-sm">
                  {modesNoOverall.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Region</label>
                <select value={editRegion} onChange={e => setEditRegion(e.target.value)} className="w-full rounded-lg border border-border/50 bg-card px-3 py-2 text-sm">
                  {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Points</label>
                <input type="number" min="0" value={editPoints} onChange={e => { setEditPoints(e.target.value); setEditTier('') }} className="w-full rounded-lg border border-border/50 bg-card px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-xs text-muted-foreground mb-1">Tier (optional)</label>
                <select value={editTier} onChange={e => setEditTier(e.target.value)} className="w-full rounded-lg border border-border/50 bg-card px-3 py-2 text-sm">
                  <option value="">Auto ({getTierKeyForPoints(parseInt(editPoints) || 0).toUpperCase()})</option>
                  {DEFAULT_TIERS.map(t => <option key={t.key} value={t.key}>{t.shortName}</option>)}
                </select>
              </div>
            </div>
            <button onClick={editPlayer} className={`w-full rounded-lg px-4 py-2 text-sm font-bold transition-all btn-press ${editPlayerId ? 'bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:bg-blue-500/30' : 'bg-blue-500/10 border border-blue-500/20 text-blue-400/50'}`}>
              Update Player
            </button>
          </div>
        </div>
      </div>

    </div>
  )
}
