import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const { mode } = body

    if (!mode) {
      return NextResponse.json({ error: 'Mode is required' }, { status: 400 })
    }

    const player = await prisma.player.findUnique({ where: { id } })
    if (!player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 })
    }

    await prisma.playerModeStats.deleteMany({
      where: { playerId: id, mode },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to remove player from mode' }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const { mode, tierKey, points, region } = body

    if (!mode) {
      return NextResponse.json({ error: 'Mode is required' }, { status: 400 })
    }

    const player = await prisma.player.findUnique({ where: { id } })
    if (!player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 })
    }

    const tier = tierKey ? await prisma.tier.findUnique({ where: { key: tierKey } }) : null
    const pts = points ?? player.points

    if (region) {
      await prisma.player.update({ where: { id }, data: { region } })
    }

    if (mode === 'overall') {
      await prisma.player.update({
        where: { id },
        data: {
          points: pts,
          currentTierId: tier?.id ?? player.currentTierId,
        },
      })
    } else {
      await prisma.playerModeStats.upsert({
        where: { playerId_mode: { playerId: id, mode } },
        update: {
          points: pts,
          currentTierId: tier?.id ?? null,
        },
        create: {
          playerId: id,
          mode,
          points: pts,
          peakPoints: pts,
          currentTierId: tier?.id ?? null,
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update player' }, { status: 500 })
  }
}
