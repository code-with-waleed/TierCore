import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function getClientIp(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? req.headers.get('x-real-ip')
    ?? req.headers.get('cf-connecting-ip')
    ?? 'unknown'
}

export async function GET(req: NextRequest) {
  try {
    const ip = getClientIp(req)
    if (ip === 'unknown') {
      return NextResponse.json({ data: null })
    }
    const applicant = await prisma.player.findFirst({
      where: { ipAddress: ip, isActive: false },
    })
    return NextResponse.json({ data: applicant ?? null })
  } catch {
    return NextResponse.json({ data: null })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { username, discordName } = body

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 })
    }

    if (!/^[a-zA-Z0-9_]{1,16}$/.test(username)) {
      return NextResponse.json({ error: 'Invalid Minecraft username. Use only letters, numbers, and underscores.' }, { status: 400 })
    }

    const ip = getClientIp(req)

    if (ip !== 'unknown') {
      const existingByIp = await prisma.player.findFirst({
        where: { ipAddress: ip },
      })
      if (existingByIp) {
        return NextResponse.json({
          error: `This IP already applied as "${existingByIp.username}". You can edit your IGN instead.`,
        }, { status: 409 })
      }
    }

    const existing = await prisma.player.findUnique({ where: { username } })
    if (existing) {
      return NextResponse.json({
        error: `"${username}" is already taken.`,
      }, { status: 409 })
    }

    const player = await prisma.player.create({
      data: {
        username,
        discordName: discordName || null,
        ipAddress: ip !== 'unknown' ? ip : null,
        points: 0,
        isActive: false,
      },
    })

    return NextResponse.json({ data: player, message: `Application submitted for ${username}!` }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to process application' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const { username, discordName } = body

    const ip = getClientIp(req)
    if (ip === 'unknown') {
      return NextResponse.json({ error: 'Could not identify your IP' }, { status: 400 })
    }

    const applicant = await prisma.player.findFirst({
      where: { ipAddress: ip, isActive: false },
    })
    if (!applicant) {
      return NextResponse.json({ error: 'No application found for this IP' }, { status: 404 })
    }

    const data: any = {}
    if (username) {
      if (!/^[a-zA-Z0-9_]{1,16}$/.test(username)) {
        return NextResponse.json({ error: 'Invalid Minecraft username' }, { status: 400 })
      }
      const existing = await prisma.player.findUnique({ where: { username } })
      if (existing && existing.id !== applicant.id) {
        return NextResponse.json({ error: `"${username}" is already taken.` }, { status: 409 })
      }
      data.username = username
    }
    if (discordName !== undefined) {
      data.discordName = discordName || null
    }

    const updated = await prisma.player.update({
      where: { id: applicant.id },
      data,
    })

    return NextResponse.json({ data: updated, message: 'Profile updated!' })
  } catch {
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
}