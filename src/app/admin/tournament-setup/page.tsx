'use client'

import { useState, useEffect } from 'react'

export default function AdminTournamentSetup() {
  const [entries, setEntries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')

  const [nextDate, setNextDate] = useState('')
  const [dateInput, setDateInput] = useState('')
  const [savingDate, setSavingDate] = useState(false)
  const [dateMsg, setDateMsg] = useState('')

  const [prize1, setPrize1] = useState('')
  const [prize2, setPrize2] = useState('')
  const [prize3, setPrize3] = useState('')
  const [prizeMsg, setPrizeMsg] = useState('')

  const [addUsername, setAddUsername] = useState('')
  const [addDiscord, setAddDiscord] = useState('')
  const [addTier, setAddTier] = useState('')
  const [addEarnings, setAddEarnings] = useState('0')

  const [approveEarnings, setApproveEarnings] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchAll()
    fetchDate()
  }, [])

  async function fetchDate() {
    try {
      const r = await fetch('/api/settings')
      const d = await r.json()
      if (d.nextMatchDate) { setNextDate(d.nextMatchDate); setDateInput(d.nextMatchDate) }
      if (d.prize1) setPrize1(d.prize1)
      if (d.prize2) setPrize2(d.prize2)
      if (d.prize3) setPrize3(d.prize3)
    } catch {}
  }

  async function fetchAll() {
    setLoading(true)
    try {
      const r = await fetch('/api/tournament/entries')
      const d = await r.json()
      setEntries(d.data ?? [])
      const earnings: Record<string, string> = {}
      ;(d.data ?? []).forEach((e: any) => { earnings[e.id] = String(e.earnings ?? '0') })
      setApproveEarnings(earnings)
    } catch {}
    setLoading(false)
  }

  async function saveDate() {
    setSavingDate(true); setDateMsg('')
    const r = await fetch('/api/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nextMatchDate: dateInput || null }),
    })
    if (r.ok) { setNextDate(dateInput); setDateMsg('Saved!') } else { setDateMsg('Failed') }
    setSavingDate(false)
  }

  async function addEntry() {
    if (!addUsername.trim()) return
    setMsg('')
    const r = await fetch('/api/tournament/entries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: addUsername.trim(),
        discordName: addDiscord.trim() || undefined,
        tier: addTier || undefined,
        earnings: parseFloat(addEarnings) || 0,
        status: 'approved',
      }),
    })
    if (r.ok) {
      setMsg(`Added ${addUsername} to tournament!`)
      setAddUsername(''); setAddDiscord(''); setAddTier(''); setAddEarnings('0')
      fetchAll()
    } else {
      const d = await r.json()
      setMsg(d.error ?? 'Failed')
    }
  }

  async function updateEntry(id: string, data: any) {
    setMsg('')
    const r = await fetch(`/api/tournament/entries/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (r.ok) { setMsg('Updated!'); fetchAll() } else { setMsg('Failed to update') }
  }

  async function deleteEntry(id: string) {
    setMsg('')
    const r = await fetch(`/api/tournament/entries/${id}`, { method: 'DELETE' })
    if (r.ok) { setMsg('Deleted!'); fetchAll() } else { setMsg('Failed to delete') }
  }

  async function clearAll() {
    if (!confirm('Clear ALL tournament entries?')) return
    setMsg('')
    const r = await fetch('/api/tournament/entries', { method: 'DELETE' })
    if (r.ok) { setMsg('Tournament cleared!'); fetchAll() } else { setMsg('Failed to clear') }
  }

  const pending = entries.filter(e => e.status === 'pending')
  const approved = entries.filter(e => e.status === 'approved')
  const rejected = entries.filter(e => e.status === 'rejected')

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black">Tournament Setup</h1>
          <p className="text-sm text-foreground/70 mt-1">Manage tournament date, roster, and applications</p>
        </div>
        <button onClick={fetchAll} className="text-xs text-amber-400 hover:text-amber-300">↻ Refresh</button>
      </div>

      {msg && (
        <div className="mb-4 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-400">{msg}</div>
      )}

      {/* Date Panel */}
      <div className="mb-6 rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-amber-500/10 p-6">
        <h2 className="font-bold text-lg mb-3">Tournament Date</h2>
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
          <input type="datetime-local" value={dateInput} onChange={e => setDateInput(e.target.value)} className="w-full sm:w-auto rounded-lg border border-border/50 bg-card px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-amber-500/50" />
          <button onClick={saveDate} disabled={savingDate} className="rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-bold text-black hover:bg-amber-400 transition-all disabled:opacity-50">
            {savingDate ? 'Saving...' : 'Save Date'}
          </button>
          {nextDate && (
            <button onClick={async () => { setDateInput(''); const r = await fetch('/api/settings', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nextMatchDate: null }) }); if (r.ok) { setNextDate(''); setDateMsg('Cleared!') } }} className="text-xs text-red-400 hover:text-red-300">Clear</button>
          )}
        </div>
        {dateMsg && <p className="text-xs text-emerald-400 mt-2">{dateMsg}</p>}
        {nextDate && <p className="text-xs text-foreground/70 mt-2">Current: <span className="text-amber-400 font-medium">{new Date(nextDate).toLocaleString()}</span></p>}
      </div>

      {/* Prizes Panel */}
      <div className="mb-6 rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-amber-500/10 p-6">
        <h2 className="font-bold text-lg mb-3">Tournament Prizes</h2>
        <div className="grid gap-3 sm:grid-cols-3 mb-3">
          <div>
            <label className="block text-xs text-foreground/70 mb-1">1st Prize</label>
            <input value={prize1} onChange={e => setPrize1(e.target.value)} placeholder="$100" className="w-full rounded-lg border border-amber-500/30 bg-card px-3 py-2 text-sm font-mono focus:outline-none focus:border-amber-500/50" />
          </div>
          <div>
            <label className="block text-xs text-foreground/70 mb-1">2nd Prize</label>
            <input value={prize2} onChange={e => setPrize2(e.target.value)} placeholder="$50" className="w-full rounded-lg border border-amber-500/30 bg-card px-3 py-2 text-sm font-mono focus:outline-none focus:border-amber-500/50" />
          </div>
          <div>
            <label className="block text-xs text-foreground/70 mb-1">3rd Prize</label>
            <input value={prize3} onChange={e => setPrize3(e.target.value)} placeholder="$25" className="w-full rounded-lg border border-amber-500/30 bg-card px-3 py-2 text-sm font-mono focus:outline-none focus:border-amber-500/50" />
          </div>
        </div>
        <button
          onClick={async () => {
            setPrizeMsg('')
            const r = await fetch('/api/settings', {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ prize1, prize2, prize3 }),
            })
            if (r.ok) setPrizeMsg('Prizes saved!')
            else setPrizeMsg('Failed to save')
          }}
          className="rounded-lg bg-amber-500 px-5 py-2 text-sm font-bold text-black hover:bg-amber-400 transition-all"
        >
          Save Prizes
        </button>
        {prizeMsg && <p className="text-xs text-emerald-400 mt-2">{prizeMsg}</p>}
      </div>

      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {/* Add Player Directly */}
        <div className="rounded-xl border border-border/50 bg-card/50 p-6">
          <h2 className="font-bold text-lg mb-4">Add Player to Tournament</h2>
          <div className="space-y-3">
            <input value={addUsername} onChange={e => setAddUsername(e.target.value)} placeholder="Minecraft Username" className="w-full rounded-lg border border-border/50 bg-card px-3 py-2 text-sm focus:outline-none focus:border-amber-500/50" />
            <input value={addDiscord} onChange={e => setAddDiscord(e.target.value)} placeholder="Discord Name (optional)" className="w-full rounded-lg border border-border/50 bg-card px-3 py-2 text-sm focus:outline-none focus:border-amber-500/50" />
            <div className="grid grid-cols-2 gap-3">
              <input value={addTier} onChange={e => setAddTier(e.target.value)} placeholder="Tier (optional)" className="w-full rounded-lg border border-border/50 bg-card px-3 py-2 text-sm focus:outline-none focus:border-amber-500/50" />
              <input type="number" value={addEarnings} onChange={e => setAddEarnings(e.target.value)} placeholder="Earnings" className="w-full rounded-lg border border-border/50 bg-card px-3 py-2 text-sm focus:outline-none focus:border-amber-500/50" />
            </div>
            <button onClick={addEntry} className="w-full rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2 text-sm font-bold text-black hover:from-amber-400 hover:to-amber-500 transition-all">
              Add to Tournament
            </button>
          </div>
        </div>

        {/* Pending Applications */}
        <div className="rounded-xl border border-border/50 bg-card/50 p-6">
          <h2 className="font-bold text-lg mb-4">Pending Applications ({pending.length})</h2>
          {loading ? (
            <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="h-12 rounded-lg bg-card/30 animate-skeleton" />)}</div>
          ) : pending.length === 0 ? (
            <p className="text-sm text-foreground/50 py-8 text-center">No pending applications</p>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {pending.map(e => (
                <div key={e.id} className="rounded-lg bg-card/70 px-3 py-2 border border-border/30">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="font-medium text-sm">{e.username}</span>
                      {e.discordName && <span className="text-[10px] text-foreground/50 ml-2">{e.discordName}</span>}
                    </div>
                    <span className="text-[10px] text-foreground/50">{e.tier}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="number" value={approveEarnings[e.id] ?? '0'} onChange={e2 => setApproveEarnings(prev => ({ ...prev, [e.id]: e2.target.value }))} className="w-16 rounded border border-border/50 bg-card px-1.5 py-1 text-xs font-mono text-right focus:outline-none focus:border-amber-500/50" placeholder="$" />
                    <button onClick={() => updateEntry(e.id, { status: 'approved', earnings: parseFloat(approveEarnings[e.id]) || 0 })} className="rounded-md bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-1 text-xs font-medium text-emerald-400 hover:bg-emerald-500/30 transition-all">Approve</button>
                    <button onClick={() => updateEntry(e.id, { status: 'rejected' })} className="rounded-md bg-red-500/20 border border-red-500/30 px-2.5 py-1 text-xs font-medium text-red-400 hover:bg-red-500/30 transition-all">Reject</button>
                    <button onClick={() => deleteEntry(e.id)} className="text-[10px] text-foreground/50 hover:text-red-400 ml-auto">✕</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Approved Roster */}
        <div className="rounded-xl border border-border/50 bg-card/50 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg">Tournament Roster ({approved.length})</h2>
            {approved.length > 0 && (
              <button onClick={clearAll} className="text-xs text-red-400 hover:text-red-300">Clear All</button>
            )}
          </div>
          {loading ? (
            <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="h-12 rounded-lg bg-card/30 animate-skeleton" />)}</div>
          ) : approved.length === 0 ? (
            <p className="text-sm text-foreground/50 py-8 text-center">No players in tournament</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {approved.map(e => (
                <div key={e.id} className="flex items-center justify-between rounded-lg bg-card/70 px-3 py-2 border border-border/30">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-medium text-sm truncate">{e.username}</span>
                    <span className="text-[10px] text-foreground/50 whitespace-nowrap">{e.tier}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <input type="number" value={approveEarnings[e.id] ?? e.earnings} onChange={e2 => setApproveEarnings(prev => ({ ...prev, [e.id]: e2.target.value }))} className="w-16 rounded border border-border/50 bg-card px-1.5 py-1 text-xs font-mono text-right focus:outline-none focus:border-amber-500/50" />
                    <button onClick={() => updateEntry(e.id, { earnings: parseFloat(approveEarnings[e.id]) || 0 })} className="rounded-md bg-amber-500/20 border border-amber-500/30 px-2 py-1 text-xs font-medium text-amber-400 hover:bg-amber-500/30 transition-all">$</button>
                    <button onClick={() => updateEntry(e.id, { status: 'pending' })} className="rounded-md bg-yellow-500/20 border border-yellow-500/30 px-2 py-1 text-xs font-medium text-yellow-400 hover:bg-yellow-500/30 transition-all" title="Move to pending">↩</button>
                    <button onClick={() => deleteEntry(e.id)} className="rounded-md bg-red-500/20 border border-red-500/30 px-2 py-1 text-xs font-medium text-red-400 hover:bg-red-500/30 transition-all">✕</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Rejected */}
      {rejected.length > 0 && (
        <div className="mt-6 rounded-xl border border-border/50 bg-card/50 p-6">
          <h2 className="font-bold text-lg mb-4">Rejected ({rejected.length})</h2>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {rejected.map(e => (
              <div key={e.id} className="flex items-center justify-between rounded-lg bg-card/70 px-3 py-1.5 border border-border/30">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-foreground/70">{e.username}</span>
                  {e.discordName && <span className="text-[10px] text-foreground/50">{e.discordName}</span>}
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => updateEntry(e.id, { status: 'pending' })} className="text-[10px] text-amber-400 hover:text-amber-300">Restore</button>
                  <button onClick={() => deleteEntry(e.id)} className="text-[10px] text-red-400 hover:text-red-300">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
