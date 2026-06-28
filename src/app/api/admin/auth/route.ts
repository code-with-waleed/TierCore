import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'paniccrew010'

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json()
    if (password === ADMIN_PASSWORD) {
      const cookieStore = await cookies()
      cookieStore.set('tc_admin_auth', 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 2,
        path: '/',
      })
      return NextResponse.json({ success: true })
    }
    return NextResponse.json({ success: false, error: 'Incorrect password' }, { status: 401 })
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 })
  }
}

export async function DELETE() {
  const cookieStore = await cookies()
  cookieStore.delete('tc_admin_auth')
  return NextResponse.json({ success: true })
}
