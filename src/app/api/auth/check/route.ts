import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const authCookie = request.cookies.get('tc_admin_auth')
  return NextResponse.json({ admin: authCookie?.value === 'true' })
}
