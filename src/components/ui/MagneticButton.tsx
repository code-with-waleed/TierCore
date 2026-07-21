'use client'

import { useRef, useState, useEffect, memo, type ReactNode } from 'react'

interface MagneticButtonProps {
  children: ReactNode
  className?: string
  as?: 'button' | 'a' | 'div'
  href?: string
  onClick?: () => void
  strength?: number
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
}

function MagneticButtonInner({
  children,
  className = '',
  as = 'button',
  href,
  onClick,
  strength = 0.25,
  disabled = false,
  type = 'button',
}: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [hover, setHover] = useState(false)
  const isTouch = useRef(false)

  useEffect(() => {
    isTouch.current = 'ontouchstart' in window || navigator.maxTouchPoints > 0
  }, [])

  function handleMove(e: React.MouseEvent) {
    if (!ref.current || disabled || isTouch.current) return
    const r = ref.current.getBoundingClientRect()
    const cx = r.left + r.width / 2
    const cy = r.top + r.height / 2
    setPos({
      x: (e.clientX - cx) * strength,
      y: (e.clientY - cy) * strength,
    })
  }

  function handleLeave() {
    setPos({ x: 0, y: 0 })
    setHover(false)
  }

  const style = hover && !isTouch.current
    ? { transform: `translate(${pos.x}px, ${pos.y}px)`, transition: 'transform 0.12s ease-out', willChange: 'transform' as const }
    : { transform: 'translate(0px, 0px)', transition: 'transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)', willChange: 'transform' as const }

  const child = (
    <div
      ref={ref}
      className={className}
      style={style}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      onMouseEnter={() => !isTouch.current && setHover(true)}
    >
      {children}
    </div>
  )

  if (as === 'a' && href) {
    return <a href={href} onClick={onClick} style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>{child}</a>
  }
  if (as === 'div') {
    return <div onClick={onClick} style={{ cursor: onClick ? 'pointer' : undefined }}>{child}</div>
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} style={{ display: 'inline-flex', background: 'none', border: 'none', padding: 0, cursor: disabled ? 'default' : 'pointer' }}>
      {child}
    </button>
  )
}

export default memo(MagneticButtonInner)
