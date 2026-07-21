'use client'

import { useState, useEffect } from 'react'

let hasShown = false

const particles = Array.from({ length: 12 }, (_, i) => ({
  angle: (i / 12) * 360,
  dist: 60 + (i % 3) * 25,
  size: 2 + (i % 2),
  delay: 0.5 + (i % 4) * 0.03,
}))

export function OpeningAnimation({ children }: { children: React.ReactNode }) {
  const [show, setShow] = useState(true)
  const [faded, setFaded] = useState(false)

  useEffect(() => {
    if (hasShown) {
      setShow(false)
      return
    }

    hasShown = true
    const fadeTimer = setTimeout(() => setFaded(true), 2200)
    const removeTimer = setTimeout(() => setShow(false), 2800)
    return () => { clearTimeout(fadeTimer); clearTimeout(removeTimer) }
  }, [])

  return (
    <>
      {show && (
        <div className={`opening-overlay ${faded ? 'opening-overlay--fade' : ''}`}>
          <div className="opening-ambient" />

          {/* Flash */}
          <div className="opening-flash" />

          {/* Particles */}
          {particles.map((p, i) => (
            <div
              key={i}
              className="opening-particle"
              style={{
                '--angle': `${p.angle}deg`,
                '--dist': `${p.dist}px`,
                '--size': `${p.size}px`,
                animationDelay: `${p.delay}s`,
              } as React.CSSProperties}
            />
          ))}

          <div className="opening-content">
            {/* Rings */}
            <div className="opening-ring opening-ring--1" />
            <div className="opening-ring opening-ring--2" />

            {/* Logo */}
            <div className="opening-logo-wrap">
              <div className="opening-logo-glow" />
              <img src="/images/logo.png" alt="TierCore" className="opening-logo" />
            </div>

            {/* Line */}
            <div className="opening-line-wrap">
              <div className="opening-line" />
            </div>

            {/* Tagline */}
            <p className="opening-tagline">Where Champions Rise</p>
          </div>
        </div>
      )}
      <div className={`page-content ${!show ? 'page-content--visible' : ''}`}>
        {children}
      </div>
    </>
  )
}

