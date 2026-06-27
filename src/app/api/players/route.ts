import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTierFromPoints, DEFAULT_TIERS } from '@/lib/points'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search')
    const includeStats = searchParams.get('includeStats') === 'true'
    const showAll = searchParams.get('showAll') === 'true'
    const matchPlayers = searchParams.get('matchPlayers') === 'true'

    const where: any = {}
    if (!showAll) {
      where.isActive = true
      where.isBanned = false
    }
    if (search) where.username = { contains: search }
    if (matchPlayers) where.isMatchPlayer = true

    const players = await prisma.player.findMany({
      where,
      orderBy: { points: 'desc' },
      take: 100,
      include: {
        currentTier: true,
        modeStats: includeStats ? { include: { tier: true } } : false,
      },
    })

    return NextResponse.json({
      data: players.map((p, i) => ({
        rank: i + 1,
        id: p.id,
        username: p.username,
        avatarUrl: p.avatarUrl,
        points: p.points,
        earnings: p.earnings,
        tier: p.currentTier?.shortName ?? 'Unranked',
        region: p.region,
        ipAddress: p.ipAddress,
        isActive: p.isActive,
        isMatchPlayer: p.isMatchPlayer,
        currentTier: p.currentTier,
        createdAt: p.createdAt,
        modeStats: includeStats ? (p.modeStats as any[]).map(ms => ({
          mode: ms.mode,
          points: ms.points,
          tier: ms.tier?.shortName ?? 'Unranked',
          tierColor: ms.tier?.color ?? '#777777',
        })) : undefined,
      })),
    })
  } catch (error: any) {
    return NextResponse.json({ data: [], error: error?.message ?? 'Failed to fetch players' })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { username, region, mode, tierKey, points } = body

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 })
    }

    if (!/^[a-zA-Z0-9_]{1,16}$/.test(username)) {
      return NextResponse.json({ error: 'Invalid Minecraft username. Use only letters, numbers, and underscores.' }, { status: 400 })
    }

    const modeToUse = mode ?? 'overall'
    const pts = points ?? 1
    let tierKeyToUse = tierKey
    if (!tierKeyToUse) {
      const computed = getTierFromPoints(pts)
      if (computed) tierKeyToUse = computed.key
    }
    const tier = tierKeyToUse ? await prisma.tier.findUnique({ where: { key: tierKeyToUse } }) : null

    const existing = await prisma.player.findUnique({
      where: { username },
      include: { modeStats: true },
    })
    if (existing) {
      const alreadyInMode = existing.modeStats.some(ms => ms.mode === modeToUse)
      if (alreadyInMode) {
        const modeName = modeToUse.charAt(0).toUpperCase() + modeToUse.slice(1)
        return NextResponse.json({ error: `${username} already exists in ${modeName}` }, { status: 409 })
      }

      const updated = await prisma.player.update({
        where: { id: existing.id },
        data: {
          modeStats: {
            create: {
              mode: modeToUse === 'overall' ? 'overall' : modeToUse,
              points: pts,
              peakPoints: pts,
              currentTierId: tier?.id ?? null,
            },
          },
        },
        include: { currentTier: true, modeStats: true },
      })

      const totalPoints = existing.modeStats.reduce((sum, ms) => sum + ms.points, 0) + pts
      const computedTier = getTierFromPoints(totalPoints, DEFAULT_TIERS)
      const overallTier = computedTier ? (await prisma.tier.findUnique({ where: { key: computedTier.key } }))?.id ?? null : null

      await prisma.player.update({
        where: { id: existing.id },
        data: {
          points: totalPoints,
          currentTierId: overallTier,
        },
      })

      return NextResponse.json({
        data: { ...updated, points: totalPoints, currentTierId: overallTier },
      }, { status: 201 })
    }

    const player = await prisma.player.create({
      data: {
        username,
        region: region ?? null,
        points: pts,
        currentTierId: tier?.id ?? null,
        modeStats: {
          create: {
            mode: modeToUse === 'overall' ? 'overall' : modeToUse,
            points: pts,
            peakPoints: pts,
            currentTierId: tier?.id ?? null,
          },
        },
      },
      include: { currentTier: true, modeStats: true },
    })

    return NextResponse.json({ data: player }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? 'Failed to create player' }, { status: 500 })
  }
}
