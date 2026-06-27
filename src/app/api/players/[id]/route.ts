import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const player = await prisma.player.findUnique({
      where: { id },
      include: {
        currentTier: true,
        team: true,
        modeStats: { include: { tier: true } },
        achievements: { include: { achievement: true } },
        rankingHistory: { orderBy: { createdAt: 'desc' }, take: 50 },
        seasonRecords: { include: { season: true, tier: true } },
      },
    })

    if (!player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 })
    }

    const recentMatches = await prisma.match.findMany({
      where: {
        OR: [{ player1Id: player.id }, { player2Id: player.id }],
        status: 'APPROVED',
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        player1: { select: { username: true } },
        player2: { select: { username: true } },
      },
    })

    return NextResponse.json({
      data: {
        ...player,
        recentMatches: recentMatches.map(m => ({
          id: m.id,
          opponent: m.player1Id === player.id ? m.player2.username : m.player1.username,
          result: m.winner === (m.player1Id === player.id ? 'player1' : 'player2') ? 'win' : m.winner === null ? 'draw' : 'loss',
          pointsChange: m.pointsChange ?? 0,
          mode: m.mode,
          date: m.createdAt,
        })),
      },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch player' }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()

    const player = await prisma.player.findUnique({ where: { id } })
    if (!player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 })
    }

    const data: any = {}
    if (body.username !== undefined) {
      if (!/^[a-zA-Z0-9_]{1,16}$/.test(body.username)) {
        return NextResponse.json({ error: 'Invalid Minecraft username' }, { status: 400 })
      }
      data.username = body.username
    }
    if (body.totalMatches !== undefined) data.totalMatches = body.totalMatches
    if (body.wins !== undefined) data.wins = body.wins
    if (body.losses !== undefined) data.losses = body.losses
    if (body.points !== undefined) data.points = body.points
    if (body.earnings !== undefined) data.earnings = body.earnings
    if (body.region !== undefined) data.region = body.region
    if (body.isMatchPlayer !== undefined) data.isMatchPlayer = body.isMatchPlayer

    const updated = await prisma.player.update({
      where: { id },
      data,
      include: { currentTier: true },
    })

    return NextResponse.json({ data: updated })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update player' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const player = await prisma.player.findUnique({ where: { id } })
    if (!player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 })
    }

    await prisma.player.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete player' }, { status: 500 })
  }
}
