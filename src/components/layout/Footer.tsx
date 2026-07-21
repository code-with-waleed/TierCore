import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-border/50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-3">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-yellow-400 to-amber-600">
                <span className="text-[10px] font-black text-black">TC</span>
              </div>
              <span className="text-base font-bold text-gradient-gold">TierCore</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Competitive Minecraft PvP ranking platform. Climb the tiers, prove your skill.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-3">Platform</h3>
            <div className="flex flex-col gap-2">
              <Link href="/ranking/overall" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Ranking</Link>
              <Link href="/ranking/sword" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Ranking</Link>
              <Link href="/matches" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Matches</Link>
              <Link href="/api/docs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">API Docs</Link>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-3">Community</h3>
            <div className="flex flex-col gap-2">
              <a href="https://discord.gg/7J8jSHedS5" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Discord</a>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-border/50 pt-6 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} TierCore. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
