'use client'

import { useState, useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

const QUOTES = [
  'Glory awaits the brave.',
  'Rise through the ranks.',
  'Your journey begins now.',
  'Prove your worth in battle.',
  'Every duel shapes your legacy.',
]

export function OpeningAnimation({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [show, setShow] = useState(true)
  const [quote, setQuote] = useState(QUOTES[0])
  const hasShown = useRef(false)

  useEffect(() => {
    setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)])

    if (pathname?.startsWith('/admin')) {
      setShow(false)
      return
    }

    if (hasShown.current) {
      setShow(false)
      return
    }

    hasShown.current = true
    const timer = setTimeout(() => setShow(false), 2800)
    return () => clearTimeout(timer)
  }, [pathname])

  if (!show) return <>{children}</>

  return (
    <>
      <div className="opening-overlay">
        <div className="text-center animate-opening">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-600 shadow-2xl shadow-amber-500/30">
              <span className="text-xl font-black text-black">TC</span>
            </div>
            <span className="text-4xl font-black tracking-tight text-gradient-gold">
              TierCore
            </span>
          </div>
          <div className="animate-opening-delay-1">
            <div className="mx-auto mb-8 h-0.5 w-32 rounded-full bg-gradient-to-r from-transparent via-amber-500 to-transparent" />
          </div>
          <div className="animate-opening-delay-2">
            <p className="text-sm text-muted-foreground italic tracking-wide">
              &ldquo;{quote}&rdquo;
            </p>
          </div>
          <div className="animate-opening-delay-3 mt-8">
            <div className="flex justify-center gap-1.5">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-2 w-2 rounded-full bg-amber-500 animate-pulse"
                  style={{ animationDelay: `${i * 0.3}s` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      <div style={{ opacity: 0, animation: 'fadeUp 1s ease-out 2.8s forwards' }}>
        {children}
      </div>
    </>
  )
}