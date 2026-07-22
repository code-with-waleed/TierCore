import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const entries = await prisma.tournamentEntry.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ data: entries })
  } catch (error: any) {
    return NextResponse.json({ data: [], error: error?.message ?? 'Failed to fetch' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { username, discordId, discordName, tier, earnings, points, reward, status: bodyStatus } = body

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 })
    }

    const existing = await prisma.tournamentEntry.findFirst({
      where: { discordId: discordId ?? undefined, username: { equals: username, mode: 'insensitive' } },
    })
    if (existing) {
      return NextResponse.json({ error: 'Entry already exists' }, { status: 409 })
    }

    const entry = await prisma.tournamentEntry.create({
      data: {
        username,
        discordId: discordId ?? null,
        discordName: discordName ?? null,
        tier: tier ?? 'Unranked',
        earnings: typeof earnings === 'number' ? earnings : 0,
        points: typeof points === 'number' ? points : 0,
        reward: reward ?? '',
        status: bodyStatus ?? 'pending',
      },
    })

    return NextResponse.json({ data: entry }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? 'Failed to create' }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    await prisma.tournamentEntry.deleteMany({})
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? 'Failed to clear' }, { status: 500 })
  }
}
