'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ players: 0, matches: 0, pending: 0 })
  const router = useRouter()

  useEffect(() => {
    fetchStats()
  }, [])

  async function fetchStats() {
    try {
      const [pRes, mRes] = await Promise.all([
        fetch('/api/players'),
        fetch('/api/matches'),
      ])
      const pData = await pRes.json()
      const mData = await mRes.json()
      setStats({
        players: pData.data?.length ?? 0,
        matches: mData.data?.length ?? 0,
        pending: mData.data?.filter((m: any) => m.status === 'PENDING').length ?? 0,
      })
    } catch {}
  }

  async function handleLogout() {
    await fetch('/api/admin/auth', { method: 'DELETE' })
    router.push('/admin/login')
  }

  const links = [
    { href: '/admin/players', label: 'Players', desc: 'Add, edit, delete players', icon: '👤', color: 'from-blue-500 to-cyan-500' },
    { href: '/admin/tournament-setup', label: 'Tournament Setup', desc: 'Manage tournament roster, applications, and dates', icon: '🏆', color: 'from-amber-500 to-orange-500' },
    { href: '/admin/applicants', label: 'Applicants', desc: 'View applicants with IP and tier', icon: '📋', color: 'from-emerald-500 to-teal-500' },
    { href: '/admin/matches', label: 'Matches', desc: 'Submit, approve, reject matches', icon: '⚔️', color: 'from-red-500 to-orange-500' },
    { href: '/admin/tiers', label: 'Rankings', desc: 'Tier config, point values', icon: '📊', color: 'from-yellow-500 to-amber-500' },
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
