'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

interface PlayerContextMenuProps {
  username: string
  tiers?: string
  children: React.ReactNode
}

export function PlayerContextMenu({ username, tiers, children }: PlayerContextMenuProps) {
  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null)
  const [copied, setCopied] = useState<'username' | 'tiers' | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const longPressRef = useRef<ReturnType<typeof setTimeout>>()
  const targetRef = useRef<HTMLDivElement>(null)

  const showMenu = useCallback((x: number, y: number) => {
    setMenu({ x, y })
    setCopied(null)
  }, [])

  const hideMenu = useCallback(() => {
    setMenu(null)
    setCopied(null)
  }, [])

  useEffect(() => {
    if (!menu) return
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        hideMenu()
      }
    }
    const handleScroll = () => hideMenu()
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') hideMenu()
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('scroll', handleScroll, true)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('scroll', handleScroll, true)
      document.removeEventListener('keydown', handleKey)
    }
  }, [menu, hideMenu])

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    showMenu(e.clientX, e.clientY)
  }

  const handleTouchStart = () => {
    longPressRef.current = setTimeout(() => {
      if (targetRef.current) {
        const rect = targetRef.current.getBoundingClientRect()
        showMenu(rect.left + rect.width / 2, rect.top + rect.height / 2)
      }
    }, 500)
  }

  const handleTouchEnd = () => {
    if (longPressRef.current) clearTimeout(longPressRef.current)
  }

  const handleTouchMove = () => {
    if (longPressRef.current) clearTimeout(longPressRef.current)
  }

  const copy = async (type: 'username' | 'tiers') => {
    const text = type === 'username' ? username : tiers ?? ''
    try {
      await navigator.clipboard.writeText(text)
      setCopied(type)
      setTimeout(() => hideMenu(), 600)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = text
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setCopied(type)
      setTimeout(() => hideMenu(), 600)
    }
  }

  return (
    <div
      ref={targetRef}
      onContextMenu={handleContextMenu}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
      className="relative"
    >
      {children}

      {menu && (
        <div
          ref={menuRef}
          className="fixed z-[99999] min-w-[160px] rounded-lg border border-white/10 bg-[#0d0d1a] shadow-2xl shadow-black/60 backdrop-blur-xl py-1"
          style={{ left: menu.x, top: menu.y, transform: 'translate(-50%, 8px)' }}
        >
          <button
            onClick={() => copy('username')}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-white/80 hover:text-white hover:bg-white/5 transition-colors text-left"
          >
            <svg className="w-3.5 h-3.5 text-amber-400/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
            </svg>
            {copied === 'username' ? (
              <span className="text-green-400">Copied!</span>
            ) : (
              <span>Copy Username</span>
            )}
          </button>
          {tiers && (
            <button
              onClick={() => copy('tiers')}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-white/80 hover:text-white hover:bg-white/5 transition-colors text-left"
            >
              <svg className="w-3.5 h-3.5 text-amber-400/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
              {copied === 'tiers' ? (
                <span className="text-green-400">Copied!</span>
              ) : (
                <span>Copy Tiers</span>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
