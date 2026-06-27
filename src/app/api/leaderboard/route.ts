import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { TIER_ORDER, DEFAULT_TIERS } from '@/lib/points'

const VALID_MODES = ['overall', 'sword', 'axe', 'pot', 'nethpot', 'uhc', 'mace', 'smp', 'vanilla'] as const

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') ?? '50')))
    const mode = searchParams.get('mode') ?? 'sword'
    const search = searchParams.get('search')
    const sort = searchParams.get('sort') ?? 'points'

    if (mode === 'overall') {
      const where: any = { isActive: true, isBanned: false }
      if (search) where.username = { contains: search }

      if (sort === 'tier') {
        const players = await prisma.player.findMany({
          where,
          include: {
            currentTier: true,
            modeStats: {
              include: { tier: true },
              where: { mode: { in: ['sword', 'axe', 'pot', 'nethpot', 'uhc', 'mace', 'smp', 'vanilla'] } },
            },
          },
        })

        const tierOrderMap: Record<string, number> = {}
        TIER_ORDER.forEach((key, i) => { tierOrderMap[key] = i })

        const sorted = players
          .filter(p => p.currentTier)
          .sort((a, b) => {
            const aOrder = tierOrderMap[a.currentTier!.key] ?? 999
            const bOrder = tierOrderMap[b.currentTier!.key] ?? 999
            if (aOrder !== bOrder) return aOrder - bOrder
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          })

        const unranked = players.filter(p => !p.currentTier)

        return NextResponse.json({
          data: [...sorted, ...unranked].map((player, i) => ({
            rank: i + 1,
            playerId: player.id,
            username: player.username,
            avatarUrl: player.avatarUrl ?? `https://render.crafty.gg/renders/body/${player.username}`,
            points: player.points,
            overallPoints: player.points,
            tier: player.currentTier?.shortName ?? 'Unranked',
            tierKey: player.currentTier?.key ?? null,
            tierColor: player.currentTier?.color ?? '#777777',
            region: player.region,
            createdAt: player.createdAt,
            modeStats: player.modeStats.map(ms => ({
              mode: ms.mode,
              points: ms.points,
              tier: ms.tier?.shortName ?? null,
              tierKey: ms.tier?.key ?? null,
              tierColor: ms.tier?.color ?? null,
            })),
          })),
          meta: { page: 1, limit: sorted.length + unranked.length, total: sorted.length + unranked.length, totalPages: 1 },
        })
      }

      const orderBy = sort === 'recent' ? { createdAt: 'desc' as const } : { points: 'desc' as const }

      const [players, total] = await Promise.all([
        prisma.player.findMany({
          where,
          orderBy,
          skip: (page - 1) * limit,
          take: limit,
          include: {
            currentTier: true,
            modeStats: {
              include: { tier: true },
              where: { mode: { in: ['sword', 'axe', 'pot', 'nethpot', 'uhc', 'mace', 'smp', 'vanilla'] } },
            },
          },
        }),
        prisma.player.count({ where }),
      ])

      return NextResponse.json({
        data: players.map((player, i) => ({
          rank: (page - 1) * limit + i + 1,
          playerId: player.id,
          username: player.username,
          avatarUrl: player.avatarUrl ?? `https://render.crafty.gg/renders/body/${player.username}`,
          points: player.points,
          overallPoints: player.points,
          tier: player.currentTier?.shortName ?? 'Unranked',
          tierKey: player.currentTier?.key ?? null,
          tierColor: player.currentTier?.color ?? '#777777',
          region: player.region,
          createdAt: player.createdAt,
          modeStats: player.modeStats.map(ms => ({
            mode: ms.mode,
            points: ms.points,
            tier: ms.tier?.shortName ?? null,
            tierKey: ms.tier?.key ?? null,
            tierColor: ms.tier?.color ?? null,
          })),
        })),
        meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
      })
    }

    if (!VALID_MODES.includes(mode as any)) {
      return NextResponse.json({
        data: [],
        meta: { page: 1, limit: 50, total: 0, totalPages: 0 },
      })
    }

    const modeWhere: any = { mode, player: { isActive: true, isBanned: false } }
    if (search) modeWhere.player.username = { contains: search }

    if (sort === 'tier') {
      const allStats = await prisma.playerModeStats.findMany({
        where: modeWhere,
        include: {
          player: {
            include: {
              currentTier: true,
              modeStats: {
                include: { tier: true },
                where: { mode: { in: ['sword', 'axe', 'pot', 'nethpot', 'uhc', 'mace', 'smp', 'vanilla'] } },
              },
            },
          },
          tier: true,
        },
      })

      const tierOrderMap: Record<string, number> = {}
      TIER_ORDER.forEach((key, i) => { tierOrderMap[key] = i })

      const sorted = allStats
        .filter(s => s.tier)
        .sort((a, b) => {
          const aOrder = tierOrderMap[a.tier!.key] ?? 999
          const bOrder = tierOrderMap[b.tier!.key] ?? 999
          if (aOrder !== bOrder) return aOrder - bOrder
          return new Date(b.player.createdAt).getTime() - new Date(a.player.createdAt).getTime()
        })

      const unranked = allStats.filter(s => !s.tier)

      return NextResponse.json({
        data: [...sorted, ...unranked].map((stat, i) => ({
          rank: i + 1,
          playerId: stat.player.id,
          username: stat.player.username,
          avatarUrl: stat.player.avatarUrl ?? `https://render.crafty.gg/renders/body/${stat.player.username}`,
          points: stat.points,
          overallPoints: stat.player.points,
          tier: stat.tier?.shortName ?? 'Unranked',
          tierKey: stat.tier?.key ?? null,
          tierColor: stat.tier?.color ?? '#777777',
          region: stat.player.region,
          createdAt: stat.player.createdAt,
          modeStats: stat.player.modeStats.map(ms => ({
            mode: ms.mode,
            points: ms.points,
            tier: ms.tier?.shortName ?? null,
            tierKey: ms.tier?.key ?? null,
            tierColor: ms.tier?.color ?? null,
          })),
        })),
        meta: { page: 1, limit: sorted.length + unranked.length, total: sorted.length + unranked.length, totalPages: 1 },
      })
    }

    const orderBy = sort === 'recent' ? { player: { createdAt: 'desc' as const } } : { points: 'desc' as const }

    const [stats, total] = await Promise.all([
      prisma.playerModeStats.findMany({
        where: modeWhere,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          player: {
            include: {
              currentTier: true,
              modeStats: {
                include: { tier: true },
                where: { mode: { in: ['sword', 'axe', 'pot', 'nethpot', 'uhc', 'mace', 'smp', 'vanilla'] } },
              },
            },
          },
          tier: true,
        },
      }),
      prisma.playerModeStats.count({ where: modeWhere }),
    ])

    return NextResponse.json({
      data: stats.map((stat, i) => ({
        rank: (page - 1) * limit + i + 1,
        playerId: stat.player.id,
        username: stat.player.username,
        avatarUrl: stat.player.avatarUrl ?? `https://render.crafty.gg/renders/body/${stat.player.username}`,
        points: stat.points,
        overallPoints: stat.player.points,
        tier: stat.tier?.shortName ?? 'Unranked',
        tierKey: stat.tier?.key ?? null,
        tierColor: stat.tier?.color ?? '#777777',
        region: stat.player.region,
        createdAt: stat.player.createdAt,
        modeStats: stat.player.modeStats.map(ms => ({
          mode: ms.mode,
          points: ms.points,
          tier: ms.tier?.shortName ?? null,
          tierKey: ms.tier?.key ?? null,
          tierColor: ms.tier?.color ?? null,
        })),
      })),
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    })
  } catch {
    return NextResponse.json({ data: [], meta: { page: 1, limit: 50, total: 0, totalPages: 0 } })
  }
}
