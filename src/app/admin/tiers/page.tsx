'use client'

import { DEFAULT_TIERS, TIER_POINTS, TIER_ORDER } from '@/lib/points'

export default function AdminRankingsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-black mb-6">Rankings &amp; Tiers</h1>

      <div className="rounded-xl border border-border/50 bg-card/50 p-6 mb-6 overflow-x-auto">
        <h2 className="font-bold text-lg mb-4">Tier Configuration</h2>
        <p className="text-sm text-muted-foreground mb-4">Order: LT5 → HT5 → LT4 → HT4 → LT3 → HT3 → LT2 → HT2 → LT1 → HT1</p>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/50 text-muted-foreground">
              <th className="px-3 py-2 text-left">#</th>
              <th className="px-3 py-2 text-left">Tier</th>
              <th className="px-3 py-2 text-right">Min Points</th>
              <th className="px-3 py-2 text-right">Max Points</th>
              <th className="px-3 py-2 text-right">Points/Win</th>
              <th className="px-3 py-2 text-center">Color</th>
            </tr>
          </thead>
          <tbody>
            {TIER_ORDER.map((key, i) => {
              const t = DEFAULT_TIERS.find(t => t.key === key)!
              return (
                <tr key={key} className="border-b border-border/30">
                  <td className="px-3 py-2 text-muted-foreground">{i + 1}</td>
                  <td className="px-3 py-2 font-bold" style={{ color: t.color }}>{t.shortName}</td>
                  <td className="px-3 py-2 text-right font-mono">{t.minPoints}</td>
                  <td className="px-3 py-2 text-right font-mono">{t.maxPoints}</td>
                  <td className="px-3 py-2 text-right font-mono font-bold" style={{ color: t.color }}>+{TIER_POINTS[key]}</td>
                  <td className="px-3 py-2 text-center"><span className="inline-block h-4 w-4 rounded-full border border-border/50" style={{ backgroundColor: t.color }} /></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="rounded-xl border border-border/50 bg-card/50 p-6">
        <h2 className="font-bold text-lg mb-4">Points Breakdown</h2>
        <p className="text-sm text-muted-foreground mb-4">Players earn points by winning matches. The points awarded depend on the loser&apos;s tier.</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {TIER_ORDER.map(key => {
            const t = DEFAULT_TIERS.find(t => t.key === key)!
            return (
              <div key={key} className="rounded-lg bg-card p-4 text-center border border-border/30">
                <div className="text-lg font-black" style={{ color: t.color }}>{t.shortName}</div>
                <div className="text-2xl font-black mt-2">+{TIER_POINTS[key]}</div>
                <div className="text-xs text-muted-foreground mt-1">points per win</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
