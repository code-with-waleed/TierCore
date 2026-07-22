'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import useSWR, { useSWRConfig } from 'swr'
import { swrFetcher } from '@/lib/utils'

export default function AdminDashboard() {
  const [clearing, setClearing] = useState(false)
  const [clearMsg, setClearMsg] = useState('')
  const [confirmClear, setConfirmClear] = useState(false)
  const router = useRouter()
  const { mutate } = useSWRConfig()

  const { data: pData, isLoading: pLoading } = useSWR('/api/players', swrFetcher, { refreshInterval: 10000, revalidateOnFocus: true })
  const { data: mData, isLoading: mLoading } = useSWR('/api/matches', swrFetcher, { refreshInterval: 10000, revalidateOnFocus: true })
  const stats = {
    players: pData?.data?.length ?? 0,
    matches: mData?.data?.length ?? 0,
    pending: mData?.data?.filter((m: any) => m.status === 'PENDING').length ?? 0,
  }
  const statsLoaded = !pLoading && !mLoading

  async function handleLogout() {
    await fetch('/api/admin/auth', { method: 'DELETE' })
    router.push('/admin/login')
  }

  async function clearAllData() {
    setClearing(true)
    setClearMsg('')
    try {
      const r = await fetch('/api/admin/clear-data', { method: 'POST' })
      if (r.ok) {
        setClearMsg('All matches and game data cleared!')
        setConfirmClear(false)
        mutate('/api/players'); mutate('/api/matches')
      } else {
        const d = await r.json()
        setClearMsg(`Error: ${d.error}`)
      }
    } catch {
      setClearMsg('Failed to clear data')
    }
    setClearing(false)
  }

  const links = [
    { href: '/admin/players', label: 'Players', desc: 'Add, edit, delete players', icon: '👤', color: 'from-blue-500 to-cyan-500' },
    { href: '/admin/match-players', label: 'Match Players', desc: 'Manage match roster and earnings', icon: '🎯', color: 'from-emerald-500 to-teal-500' },
    { href: '/admin/matches', label: 'Matches', desc: 'Submit, approve, reject matches', icon: '⚔️', color: 'from-red-500 to-orange-500' },
    { href: '/admin/tournament-setup', label: 'Tournament Setup', desc: 'Manage tournament roster, applications, and dates', icon: '🏆', color: 'from-amber-500 to-orange-500' },
    { href: '/admin/tiers', label: 'Tiers', desc: 'Tier config, point values', icon: '📊', color: 'from-yellow-500 to-amber-500' },
    { href: '/admin/settings', label: 'Settings', desc: 'Game modes, site info', icon: '⚙️', color: 'from-gray-500 to-slate-500' },
  ]

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black">Admin Dashboard</h1>
          <p className="mt-1 text-foreground/70">Manage your ranking platform</p>
        </div>
        <button onClick={handleLogout} className="rounded-lg border border-border/50 px-3 py-1.5 text-xs text-foreground/70 hover:text-foreground transition-colors">Lock</button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        <div className="rounded-xl border border-border/50 bg-card/50 p-5"><div className="text-sm text-foreground/70">Total Players</div><div className="text-2xl font-black mt-1">{stats.players}</div></div>
        <div className="rounded-xl border border-border/50 bg-card/50 p-5"><div className="text-sm text-foreground/70">Total Matches</div><div className="text-2xl font-black mt-1">{stats.matches}</div></div>
        <div className="rounded-xl border border-border/50 bg-card/50 p-5"><div className="text-sm text-foreground/70">Pending Approval</div><div className="text-2xl font-black text-yellow-400 mt-1">{stats.pending}</div></div>
      </div>

      {/* Clear data section */}
      <div className="mb-8 rounded-xl border border-red-500/20 bg-red-500/5 p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-red-400">Danger Zone</h3>
            <p className="text-xs text-foreground/50 mt-0.5">Clear all matches and game mode statistics</p>
          </div>
          {!confirmClear ? (
            <button
              onClick={() => setConfirmClear(true)}
              className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs font-bold text-red-400 hover:bg-red-500/20 transition-all"
            >
              Clear All Data
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs text-red-400 font-medium">Are you sure?</span>
              <button
                onClick={clearAllData}
                disabled={clearing}
                className="rounded-lg bg-red-500 px-4 py-2 text-xs font-bold text-white hover:bg-red-400 transition-all disabled:opacity-50"
              >
                {clearing ? 'Clearing...' : 'Yes, Clear'}
              </button>
              <button
                onClick={() => setConfirmClear(false)}
                className="rounded-lg border border-border/50 px-4 py-2 text-xs font-bold text-foreground/70 hover:text-foreground transition-all"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
        {clearMsg && <p className="mt-2 text-xs text-emerald-400">{clearMsg}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {links.map(link => (
          <Link key={link.href} href={link.href} className="group rounded-xl border border-border/50 bg-card/50 p-6 hover:border-amber-500/30 hover:bg-amber-500/5 transition-all hover-wobble">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{link.icon}</span>
              <h2 className="text-lg font-bold">{link.label}</h2>
            </div>
            <p className="text-sm text-foreground/70">{link.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
