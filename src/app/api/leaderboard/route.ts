import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { TIER_ORDER, DEFAULT_TIERS } from '@/lib/points'

const VALID_MODES = ['overall', 'sword', 'axe', 'pot', 'nethpot', 'uhc', 'mace', 'smp', 'vanilla'] as const

const MODE_LIST = ['sword', 'axe', 'pot', 'nethpot', 'uhc', 'mace', 'smp', 'vanilla']

function computeTotalPoints(modeStats: { points: number }[]): number {
  return modeStats.reduce((sum, ms) => sum + ms.points, 0)
}

function formatPlayer(player: any, rank: number) {
  const totalPoints = computeTotalPoints(player.modeStats ?? [])
  return {
    rank,
    playerId: player.id,
    username: player.username,
    avatarUrl: player.avatarUrl ?? `https://render.crafty.gg/renders/body/${player.username}`,
    points: totalPoints,
    overallPoints: totalPoints,
    tier: player.currentTier?.shortName ?? 'Unranked',
    tierKey: player.currentTier?.key ?? null,
    tierColor: player.currentTier?.color ?? '#777777',
    region: player.region,
    createdAt: player.createdAt,
    modeStats: (player.modeStats ?? []).map((ms: any) => ({
      mode: ms.mode,
      points: ms.points,
      peakPoints: ms.peakPoints,
      wins: ms.wins,
      losses: ms.losses,
      draws: ms.draws,
      totalMatches: ms.totalMatches,
      tier: ms.tier?.shortName ?? null,
      tierKey: ms.tier?.key ?? null,
      tierColor: ms.tier?.color ?? null,
    })),
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
    const limit = Math.max(1, Math.min(200, parseInt(searchParams.get('limit') ?? '200') || 200))
    const mode = searchParams.get('mode') ?? 'sword'
    const search = searchParams.get('search')
    const sort = searchParams.get('sort') ?? 'points'

    const baseWhere: any = { isActive: true, isBanned: false }
    if (search) baseWhere.username = { contains: search }

    const playerInclude = {
      currentTier: true,
      modeStats: {
        include: { tier: true },
        where: { mode: { in: MODE_LIST } },
      },
    }

    if (mode === 'overall') {
      const allPlayers = await prisma.player.findMany({
        where: baseWhere,
        include: playerInclude,
      })

      const withTotal = allPlayers.map(p => ({ ...p, _total: computeTotalPoints(p.modeStats ?? []) }))

      if (sort === 'tier') {
        const tierOrderMap: Record<string, number> = {}
        TIER_ORDER.forEach((key, i) => { tierOrderMap[key] = i })

        withTotal.sort((a, b) => {
          const aTier = a.currentTier?.key
          const bTier = b.currentTier?.key
          if (aTier && bTier && aTier !== bTier) return tierOrderMap[aTier] - tierOrderMap[bTier]
          if (aTier && !bTier) return -1
          if (!aTier && bTier) return 1
          return b._total - a._total
        })
      } else if (sort === 'recent') {
        withTotal.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      } else {
        withTotal.sort((a, b) => b._total - a._total)
      }

      const total = withTotal.length
      const paged = withTotal.slice((page - 1) * limit, page * limit)

      return NextResponse.json({
        data: paged.map((p, i) => formatPlayer(p, (page - 1) * limit + i + 1)),
        meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
      })
    }

    if (!VALID_MODES.includes(mode as any)) {
      return NextResponse.json({
        data: [],
        meta: { page: 1, limit: 50, total: 0, totalPages: 0 },
      })
    }

    const modeWhere: any = { mode, player: { ...baseWhere } }
    if (search) modeWhere.player.username = { contains: search }

    const allStats = await prisma.playerModeStats.findMany({
      where: modeWhere,
      include: {
        player: { include: playerInclude },
        tier: true,
      },
    })

    const withTotal = allStats.map(s => ({ ...s, _total: computeTotalPoints(s.player.modeStats ?? []) }))

    if (sort === 'tier') {
      const tierOrderMap: Record<string, number> = {}
      TIER_ORDER.forEach((key, i) => { tierOrderMap[key] = i })

      withTotal.sort((a, b) => {
        const aTier = a.tier?.key
        const bTier = b.tier?.key
        if (aTier && bTier && aTier !== bTier) return tierOrderMap[aTier] - tierOrderMap[bTier]
        if (aTier && !bTier) return -1
        if (!aTier && bTier) return 1
        return b._total - a._total
      })
    } else if (sort === 'recent') {
      withTotal.sort((a, b) => new Date(b.player.createdAt).getTime() - new Date(a.player.createdAt).getTime())
    } else {
      withTotal.sort((a, b) => b._total - a._total)
    }

    const total = withTotal.length
    const paged = withTotal.slice((page - 1) * limit, page * limit)

    return NextResponse.json({
      data: paged.map((s, i) => ({
        ...formatPlayer(s.player, (page - 1) * limit + i + 1),
        points: s.points,
      })),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch (e) {
    console.error('[Leaderboard API]', e)
    return NextResponse.json({ data: [], meta: { page: 1, limit: 50, total: 0, totalPages: 0 } })
  }
}
