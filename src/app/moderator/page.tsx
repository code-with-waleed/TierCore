'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'

const modNav = [
  { href: '/moderator', label: 'Overview', icon: '📊' },
  { href: '/moderator/matches', label: 'Pending Matches', icon: '⏳' },
  { href: '/moderator/flags', label: 'Anti-Cheat Flags', icon: '🚩' },
]

export default function ModeratorPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-black">Moderator Dashboard</h1>
        <p className="mt-1 text-muted-foreground">Review matches and monitor player activity</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        <div className="space-y-1 lg:col-span-1">
          <nav className="rounded-xl border border-border/50 bg-card/50 p-2">
            {modNav.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <span>{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="lg:col-span-3 space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-border/50 bg-card/50 p-5">
              <div className="text-sm text-muted-foreground">Pending Approval</div>
              <div className="text-2xl font-black text-yellow-400 mt-1">23</div>
            </div>
            <div className="rounded-xl border border-border/50 bg-card/50 p-5">
              <div className="text-sm text-muted-foreground">Active Flags</div>
              <div className="text-2xl font-black text-red-400 mt-1">7</div>
            </div>
            <div className="rounded-xl border border-border/50 bg-card/50 p-5">
              <div className="text-sm text-muted-foreground">Approved Today</div>
              <div className="text-2xl font-black text-green-400 mt-1">156</div>
            </div>
          </div>

          <div className="rounded-xl border border-border/50 bg-card/50 p-6">
            <h2 className="font-bold text-lg mb-4">Pending Matches</h2>
            <div className="space-y-3">
              {[
                { p1: 'PlayerX', p2: 'PlayerY', mode: 'sword', submitted: '5m ago' },
                { p1: 'AcePvP', p2: 'NinjaBoi', mode: 'axe', submitted: '12m ago' },
                { p1: 'Pro123', p2: 'NoobSlayer', mode: 'pot', submitted: '23m ago' },
              ].map((match, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg bg-card p-3 text-sm">
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{match.p1}</span>
                    <span className="text-muted-foreground">vs</span>
                    <span className="font-medium">{match.p2}</span>
                    <span className="rounded bg-accent px-2 py-0.5 text-xs text-muted-foreground uppercase">{match.mode}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground">{match.submitted}</span>
                    <button className="rounded-lg bg-green-500/20 px-3 py-1 text-xs font-medium text-green-400 hover:bg-green-500/30 transition-colors">
                      Approve
                    </button>
                    <button className="rounded-lg bg-red-500/20 px-3 py-1 text-xs font-medium text-red-400 hover:bg-red-500/30 transition-colors">
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border/50 bg-card/50 p-6">
            <h2 className="font-bold text-lg mb-4">Anti-Cheat Flags</h2>
            <div className="space-y-3">
              {[
                { player: 'SuspiciousPvP', reason: 'Unusual win rate spike', severity: 'high' as const },
                { player: 'NewAcc123', reason: 'New account, high points', severity: 'medium' as const },
                { player: 'VPNUser', reason: 'Multiple accounts from same IP', severity: 'low' as const },
              ].map((flag, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg bg-card p-3 text-sm">
                  <div className="flex items-center gap-3">
                    <span className={cn(
                      'h-2 w-2 rounded-full',
                      flag.severity === 'high' && 'bg-red-500',
                      flag.severity === 'medium' && 'bg-yellow-500',
                      flag.severity === 'low' && 'bg-gray-500',
                    )} />
                    <span className="font-medium">{flag.player}</span>
                    <span className="text-muted-foreground">{flag.reason}</span>
                  </div>
                  <button className="rounded-lg bg-accent px-3 py-1 text-xs font-medium hover:bg-accent/80 transition-colors">
                    Review
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
