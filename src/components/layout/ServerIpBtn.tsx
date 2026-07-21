'use client'

import { useState, useCallback } from 'react'

export function ServerIpBtn({ ip, classes }: { ip: string; classes?: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(ip).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [ip])
  return (
    <button className={`server-ip-btn ${classes || ''}`} onClick={handleCopy}>
      <p className="server-ip-btn__title">Server ip:</p>
      <div className="server-ip-btn__tile">
        <div className="server-ip-btn__hover-tile" />
        <div className="server-ip-btn__ip">
          <div className="server-ip-btn__ip-icon" />
          <span className="server-ip-btn__ip-text">{copied ? 'copied!' : ip}</span>
        </div>
      </div>
      <div className="server-ip-btn__shadow" />
    </button>
  )
}
