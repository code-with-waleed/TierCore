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
  const [addPoints, setAddPoints] = useState('0')
  const [addReward, setAddReward] = useState('')

  const [approveRewards, setApproveRewards] = useState<Record<string, string>>({})
  const [approvePoints, setApprovePoints] = useState<Record<string, string>>({})

  const [pendingSearch, setPendingSearch] = useState('')
  const [winnerInputs, setWinnerInputs] = useState<Record<string, boolean>>({})

  const [clearConfirm, setClearConfirm] = useState(false)

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
      const rewards: Record<string, string> = {}
      const points: Record<string, string> = {}
      ;(d.data ?? []).forEach((e: any) => {
        rewards[e.id] = e.reward ?? ''
        points[e.id] = String(e.points ?? '0')
      })
      setApproveRewards(rewards)
      setApprovePoints(points)
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
        points: parseInt(addPoints) || 0,
        reward: addReward.trim() || undefined,
        status: 'pending',
      }),
    })
    if (r.ok) {
      setMsg(`Added ${addUsername} (pending)!`)
      setAddUsername(''); setAddDiscord(''); setAddTier(''); setAddPoints('0'); setAddReward('')
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

  async function markWinner(id: string) {
    const pts = parseInt(approvePoints[id]) || 0
    const reward = approveRewards[id] ?? ''
    await updateEntry(id, { status: 'winner', points: pts, reward })
    setWinnerInputs(prev => ({ ...prev, [id]: false }))
  }

  async function deleteEntry(id: string) {
    setMsg('')
    const r = await fetch(`/api/tournament/entries/${id}`, { method: 'DELETE' })
    if (r.ok) { setMsg('Deleted!'); fetchAll() } else { setMsg('Failed to delete') }
  }

  async function clearAll() {
    setMsg('')
    const r = await fetch('/api/tournament/entries', { method: 'DELETE' })
    if (r.ok) { setMsg('Tournament cleared!'); fetchAll(); setClearConfirm(false) } else { setMsg('Failed to clear') }
  }

  const pending = entries.filter(e => e.status === 'pending')
  const approved = entries.filter(e => e.status === 'approved')
  const rejected = entries.filter(e => e.status === 'rejected')
  const winners = entries.filter(e => e.status === 'winner')

  const filteredPending = pending.filter(e =>
    e.username.toLowerCase().includes(pendingSearch.toLowerCase()) ||
    (e.discordName && e.discordName.toLowerCase().includes(pendingSearch.toLowerCase()))
  )

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
        {/* Add Player Directly → Pending */}
        <div className="rounded-xl border border-border/50 bg-card/50 p-6">
          <h2 className="font-bold text-lg mb-4">Add Player (Pending)</h2>
          <div className="space-y-3">
            <input value={addUsername} onChange={e => setAddUsername(e.target.value)} placeholder="Minecraft Username" className="w-full rounded-lg border border-border/50 bg-card px-3 py-2 text-sm focus:outline-none focus:border-amber-500/50" />
            <input value={addDiscord} onChange={e => setAddDiscord(e.target.value)} placeholder="Discord Name (optional)" className="w-full rounded-lg border border-border/50 bg-card px-3 py-2 text-sm focus:outline-none focus:border-amber-500/50" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input value={addTier} onChange={e => setAddTier(e.target.value)} placeholder="Tier" className="w-full rounded-lg border border-border/50 bg-card px-3 py-2 text-sm focus:outline-none focus:border-amber-500/50" />
              <input type="number" value={addPoints} onChange={e => setAddPoints(e.target.value)} placeholder="Points" className="w-full rounded-lg border border-border/50 bg-card px-3 py-2 text-sm focus:outline-none focus:border-amber-500/50" />
              <input value={addReward} onChange={e => setAddReward(e.target.value)} placeholder="Reward (e.g. $50 + Sword)" className="w-full rounded-lg border border-border/50 bg-card px-3 py-2 text-sm focus:outline-none focus:border-amber-500/50" />
            </div>
            <button onClick={addEntry} className="w-full rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2 text-sm font-bold text-black hover:from-amber-400 hover:to-amber-500 transition-all">
              Add to Pending
            </button>
          </div>
        </div>

        {/* Pending Applications */}
        <div className="rounded-xl border border-border/50 bg-card/50 p-6">
          <h2 className="font-bold text-lg mb-4">Pending Applications ({pending.length})</h2>
          <input
            value={pendingSearch}
            onChange={e => setPendingSearch(e.target.value)}
            placeholder="Search pending..."
            className="w-full mb-3 rounded-lg border border-border/50 bg-card px-3 py-2 text-sm focus:outline-none focus:border-amber-500/50"
          />
          {loading ? (
            <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="h-14 rounded-lg bg-card/30 animate-skeleton" />)}</div>
          ) : filteredPending.length === 0 ? (
            <p className="text-sm text-foreground/50 py-8 text-center">{pendingSearch ? 'No matching pending applications' : 'No pending applications'}</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredPending.map(e => (
                <div key={e.id} className="rounded-lg bg-card/70 px-3 py-2 border border-border/30">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="font-medium text-sm">{e.username}</span>
                      {e.discordName && <span className="text-[10px] text-foreground/50 ml-2">{e.discordName}</span>}
                    </div>
                    <span className="text-[10px] text-foreground/50">{e.tier}</span>
                  </div>

                  {winnerInputs[e.id] ? (
                    <div className="space-y-2">
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        <input type="number" value={approvePoints[e.id] ?? '0'} onChange={e2 => setApprovePoints(prev => ({ ...prev, [e.id]: e2.target.value }))} className="w-full rounded border border-amber-500/50 bg-card px-2 py-1.5 text-xs font-mono focus:outline-none focus:border-amber-500" placeholder="Tournament Points" />
                        <input value={approveRewards[e.id] ?? ''} onChange={e2 => setApproveRewards(prev => ({ ...prev, [e.id]: e2.target.value }))} className="w-full rounded border border-amber-500/50 bg-card px-2 py-1.5 text-xs focus:outline-none focus:border-amber-500" placeholder="Reward (e.g. $50 + Sword)" />
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => markWinner(e.id)} className="flex-1 rounded-md bg-purple-500/30 border border-purple-500/40 px-2.5 py-1.5 text-xs font-bold text-purple-400 hover:bg-purple-500/40 transition-all">Confirm Winner</button>
                        <button onClick={() => setWinnerInputs(prev => ({ ...prev, [e.id]: false }))} className="text-[10px] text-foreground/50 hover:text-foreground">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center gap-1.5">
                      <button onClick={() => updateEntry(e.id, { status: 'approved', points: parseInt(approvePoints[e.id]) || 0, reward: approveRewards[e.id] || '' })} className="rounded-md bg-emerald-500/20 border border-emerald-500/30 px-2 py-1 text-xs font-medium text-emerald-400 hover:bg-emerald-500/30 transition-all">Approve</button>
                      <button onClick={() => updateEntry(e.id, { status: 'rejected' })} className="rounded-md bg-red-500/20 border border-red-500/30 px-2 py-1 text-xs font-medium text-red-400 hover:bg-red-500/30 transition-all">Reject</button>
                      <button onClick={() => setWinnerInputs(prev => ({ ...prev, [e.id]: true }))} className="rounded-md bg-purple-500/20 border border-purple-500/30 px-2 py-1 text-xs font-medium text-purple-400 hover:bg-purple-500/30 transition-all">Winner</button>
                      <button onClick={() => deleteEntry(e.id)} className="text-[10px] text-foreground/50 hover:text-red-400">✕</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Approved Roster */}
        <div className="rounded-xl border border-border/50 bg-card/50 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg">Approved ({approved.length})</h2>
          </div>
          {loading ? (
            <div className="space-y-2">{[...Array(3)].map((_, i) => <div key={i} className="h-12 rounded-lg bg-card/30 animate-skeleton" />)}</div>
          ) : approved.length === 0 ? (
            <p className="text-sm text-foreground/50 py-8 text-center">No approved players</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {approved.map(e => (
                <div key={e.id} className="flex flex-col sm:flex-row sm:items-center justify-between rounded-lg bg-card/70 px-3 py-2 border border-border/30 gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-medium text-sm truncate">{e.username}</span>
                    <span className="text-[10px] text-foreground/50 whitespace-nowrap">{e.tier}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <input type="number" value={approvePoints[e.id] ?? e.points} onChange={e2 => setApprovePoints(prev => ({ ...prev, [e.id]: e2.target.value }))} className="w-14 rounded border border-border/50 bg-card px-1.5 py-1 text-xs font-mono text-right focus:outline-none focus:border-amber-500/50" title="Points" />
                    <input value={approveRewards[e.id] ?? e.reward} onChange={e2 => setApproveRewards(prev => ({ ...prev, [e.id]: e2.target.value }))} className="w-20 sm:w-24 rounded border border-border/50 bg-card px-1.5 py-1 text-xs focus:outline-none focus:border-amber-500/50" title="Reward" placeholder="Reward" />
                    <button onClick={() => updateEntry(e.id, { points: parseInt(approvePoints[e.id]) || 0, reward: approveRewards[e.id] || '' })} className="rounded-md bg-amber-500/20 border border-amber-500/30 px-2 py-1 text-xs font-medium text-amber-400 hover:bg-amber-500/30 transition-all" title="Save">Save</button>
                    <button onClick={() => updateEntry(e.id, { status: 'pending' })} className="rounded-md bg-yellow-500/20 border border-yellow-500/30 px-2 py-1 text-xs font-medium text-yellow-400 hover:bg-yellow-500/30 transition-all" title="Move to pending">↩</button>
                    <button onClick={() => deleteEntry(e.id)} className="rounded-md bg-red-500/20 border border-red-500/30 px-2 py-1 text-xs font-medium text-red-400 hover:bg-red-500/30 transition-all">✕</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Winners */}
        {winners.length > 0 && (
          <div className="rounded-xl border border-purple-500/40 bg-purple-500/5 p-6">
            <h2 className="font-bold text-lg mb-4 text-purple-400">Winners ({winners.length})</h2>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {winners.map((e, i) => (
                <div key={e.id} className="flex flex-col sm:flex-row sm:items-center justify-between rounded-lg bg-card/70 px-3 py-2 border border-purple-500/30 gap-1 sm:gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-purple-400 text-sm">{['🥇','🥈','🥉'][i] || '🏅'}</span>
                    <span className="font-medium text-sm">{e.username}</span>
                    <span className="text-[10px] text-foreground/50">{e.tier}</span>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 text-xs">
                    <span className="text-purple-400 font-mono font-bold">{e.points} pts</span>
                    <span className="text-emerald-400 font-medium truncate max-w-[120px]">{e.reward || `$${(e.earnings ?? 0).toFixed(2)}`}</span>
                    <button onClick={() => deleteEntry(e.id)} className="text-[10px] text-red-400 hover:text-red-300 shrink-0">✕</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Rejected */}
      {rejected.length > 0 && (
        <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/5 p-6">
          <h2 className="font-bold text-lg mb-4 text-red-400">Rejected ({rejected.length})</h2>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {rejected.map(e => (
              <div key={e.id} className="flex items-center justify-between rounded-lg bg-card/70 px-3 py-1.5 border border-red-500/20">
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

      {/* Clear All with double confirm */}
      <div className="mt-6 flex justify-end">
        {clearConfirm ? (
          <div className="flex items-center gap-3 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3">
            <span className="text-sm text-red-400 font-medium">Are you sure? This will remove ALL entries.</span>
            <button onClick={clearAll} className="rounded-md bg-red-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-400 transition-all">Yes, Clear All</button>
            <button onClick={() => setClearConfirm(false)} className="text-xs text-foreground/70 hover:text-foreground">Cancel</button>
          </div>
        ) : (
          <button onClick={() => setClearConfirm(true)} className="rounded-lg bg-red-500/20 border border-red-500/30 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/30 transition-all">
            Clear All Entries
          </button>
        )}
      </div>
    </div>
  )
}
