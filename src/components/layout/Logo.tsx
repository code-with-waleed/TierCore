'use client'

import Link from 'next/link'

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={className}>
      <img className="logo" src="/hex-logo.png" alt="Logo image" />
    </Link>
  )
}
