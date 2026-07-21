'use client'

import { useState, useEffect } from 'react'

export function Preloader() {
  const [visible, setVisible] = useState(true)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => prev >= 100 ? 100 : prev + 1)
    }, 25)
    const timeout = setTimeout(() => setVisible(false), 3200)
    return () => { clearInterval(interval); clearTimeout(timeout) }
  }, [])

  if (!visible) return null

  return (
    <div className="preloader">
      <div className="preloader__loader">
        <div className="preloader-loader-container">
          <div className="preloader-loader-scene">
            <div className="preloader-loader-cuboid">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="preloader-loader-cuboid__side" />
              ))}
            </div>
            <div className="preloader-loader-jumper" />
            <div className="preloader-loader-scaler" />
            <div className="preloader-loader-spinner" />
          </div>
          <div className="preloader-loader-shadow" />
        </div>
      </div>
      <div className="preloader__progress">
        <div className="preloader__loading-text">loading...</div>
        <p className="preloader__progress-digits">{progress} %</p>
      </div>
    </div>
  )
}
