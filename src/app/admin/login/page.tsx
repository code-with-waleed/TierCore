'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import MagneticButton from '@/components/ui/MagneticButton'

export default function AdminLoginPage() {
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!password) return
    setLoading(true)
    setErr('')
    try {
      const r = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (r.ok) {
        router.push('/admin')
      } else {
        const d = await r.json()
        setErr(d.error ?? 'Incorrect password')
      }
    } catch {
      setErr('Failed to connect')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-24">
      <div className="rounded-xl border border-border/50 bg-card/50 p-8 text-center">
        <h1 className="text-2xl font-black mb-2">Admin Panel</h1>
        <p className="text-sm text-foreground/70 mb-6">Enter password to continue</p>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full rounded-lg border border-border/50 bg-card px-4 py-2.5 text-sm text-center text-foreground focus:outline-none focus:border-amber-500/50"
            autoFocus
          />
          {err && <p className="text-sm text-red-400">{err}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-bold text-black hover:bg-amber-400 transition-all disabled:opacity-50"
          >
            {loading ? 'Checking...' : 'Unlock'}
          </button>
        </form>
      </div>
    </div>
  )
}
