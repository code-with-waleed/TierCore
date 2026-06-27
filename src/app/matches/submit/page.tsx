'use client'

import { useState, useEffect } from 'react'
import MagneticButton from '@/components/ui/MagneticButton'

export default function ApplyPage() {
  const [ign, setIgn] = useState('')
  const [discordName, setDiscordName] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null)

  const [applicant, setApplicant] = useState<any | null>(null)
  const [checking, setChecking] = useState(true)
  const [justApplied, setJustApplied] = useState(false)

  useEffect(() => {
    fetch('/api/apply')
      .then(r => r.json())
      .then(d => {
        if (d.data) setApplicant(d.data)
      })
      .catch(() => {})
      .finally(() => setChecking(false))
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!ign.trim()) return
    setLoading(true)
    setResult(null)
    try {
      const r = await fetch('/api/apply', {
        method: applicant ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: ign.trim(),
          discordName: discordName.trim() || undefined,
        }),
      })
      const d = await r.json()
      if (r.ok) {
        setResult({ ok: true, msg: d.message ?? 'Saved!' })
        setApplicant(d.data)
        setJustApplied(true)
        setIgn('')
        setDiscordName('')
      } else {
        setResult({ ok: false, msg: d.error ?? 'Something went wrong' })
      }
    } catch {
      setResult({ ok: false, msg: 'Failed to connect' })
    } finally {
      setLoading(false)
    }
  }

  if (checking) return (
    <div className="mx-auto max-w-lg px-4 py-12 sm:px-6">
      <div className="text-center text-muted-foreground animate-skeleton">Loading...</div>
    </div>
  )

  const isEdit = !!applicant || justApplied

  return (
    <div className="mx-auto max-w-lg px-4 py-12 sm:px-6">
      <div className="mb-8 text-center">
        {isEdit ? (
          <>
            <h1 className="text-3xl font-black">Edit Profile</h1>
            <p className="mt-1 text-muted-foreground">
              Current IGN: <span className="text-amber-400 font-medium">{(applicant?.username) || (justApplied ? ign : '')}</span>
            </p>
          </>
        ) : (
          <>
            <h1 className="text-3xl font-black">Apply</h1>
            <p className="mt-1 text-muted-foreground">Enter your details to join the rankings</p>
          </>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1.5">
            Minecraft Username {isEdit ? <span className="text-muted-foreground font-normal">(leave blank to keep)</span> : ''}
          </label>
          <input
            type="text"
            value={ign}
            onChange={e => setIgn(e.target.value)}
            placeholder={isEdit ? 'New IGN (optional)' : 'Your IGN...'}
            maxLength={16}
            className="w-full rounded-xl border border-border/50 bg-card px-4 py-3 text-sm text-center focus:outline-none focus:border-amber-500/50"
          />
          <p className="text-[10px] text-muted-foreground mt-1 text-center">Letters, numbers, and underscores. Max 16 chars.</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">
            Discord Name {isEdit ? <span className="text-muted-foreground font-normal">(leave blank to keep)</span> : ''}
          </label>
          <input
            type="text"
            value={discordName}
            onChange={e => setDiscordName(e.target.value)}
            placeholder={applicant?.discordName || 'e.g. user#0000'}
            className="w-full rounded-xl border border-border/50 bg-card px-4 py-3 text-sm text-center focus:outline-none focus:border-amber-500/50"
          />
        </div>

        <MagneticButton strength={0.2}>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 py-3 text-sm font-bold text-black hover:from-amber-400 hover:to-amber-500 transition-all disabled:opacity-50 btn-shimmer hover-bounce"
          >
            {loading ? 'Saving...' : isEdit ? 'Edit your name' : 'Apply Now'}
          </button>
        </MagneticButton>
      </form>

      {result && (
        <div className={`mt-5 rounded-xl border p-4 text-sm text-center ${result.ok ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' : 'border-red-500/30 bg-red-500/10 text-red-400'}`}>
          {result.msg}
        </div>
      )}

      {isEdit && (
        <p className="mt-6 text-center text-[11px] text-muted-foreground">
          Applied as <span className="text-amber-400 font-medium">{applicant?.username || ign}</span>. One application per IP.
        </p>
      )}
    </div>
  )
}