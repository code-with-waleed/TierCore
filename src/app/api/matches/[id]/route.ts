import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getPointsForTier } from '@/lib/points'
import { emitLeaderboardUpdate, emitPlayerUpdate, emitGlobalNotification } from '@/lib/socket'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const { action, userId } = body

    const match = await prisma.match.findUnique({
      where: { id },
      include: {
        player1: { include: { currentTier: true } },
        player2: { include: { currentTier: true } },
        participants: true,
      },
    })

    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 })
    }

    if (action === 'approve') {
      const loserTierKey = match.winner === 'player1'
        ? (match.player2.currentTier?.key ?? 'lt5')
        : match.winner === 'player2'
          ? (match.player1.currentTier?.key ?? 'lt5')
          : 'lt5'
      const pointsAwarded = match.winner === null ? 0 : getPointsForTier(loserTierKey)

      const p1NewPoints = match.player1.points + (match.winner === 'player1' ? pointsAwarded : 0)
      const p2NewPoints = match.player2.points + (match.winner === 'player2' ? pointsAwarded : 0)
      const p1PeakPoints = Math.max(match.player1.peakPoints, p1NewPoints)
      const p2PeakPoints = Math.max(match.player2.peakPoints, p2NewPoints)

      const allTiers = await prisma.tier.findMany()
      const findTierId = (points: number) => {
        const t = allTiers.find(t => points >= t.minPoints && points <= t.maxPoints)
        return t?.id ?? null
      }

      await prisma.$transaction([
        prisma.match.update({
          where: { id },
          data: {
            status: 'APPROVED',
            approvedById: userId,
            approvedAt: new Date(),
            pointsChange: pointsAwarded,
          },
        }),
        prisma.player.update({
          where: { id: match.player1Id },
          data: {
            points: p1NewPoints,
            peakPoints: p1PeakPoints,
            wins: { increment: match.winner === 'player1' ? 1 : 0 },
            losses: { increment: match.winner === 'player2' ? 1 : 0 },
            draws: { increment: match.winner === null ? 1 : 0 },
            totalMatches: { increment: 1 },
            currentTierId: findTierId(p1NewPoints) ?? match.player1.currentTierId,
          },
        }),
        prisma.player.update({
          where: { id: match.player2Id },
          data: {
            points: p2NewPoints,
            peakPoints: p2PeakPoints,
            wins: { increment: match.winner === 'player2' ? 1 : 0 },
            losses: { increment: match.winner === 'player1' ? 1 : 0 },
            draws: { increment: match.winner === null ? 1 : 0 },
            totalMatches: { increment: 1 },
            currentTierId: findTierId(p2NewPoints) ?? match.player2.currentTierId,
          },
        }),
        prisma.rankingHistory.createMany({
          data: [
            {
              playerId: match.player1Id,
              points: p1NewPoints,
              matchId: id,
              reason: 'Match approved',
              tierId: findTierId(p1NewPoints),
            },
            {
              playerId: match.player2Id,
              points: p2NewPoints,
              matchId: id,
              reason: 'Match approved',
              tierId: findTierId(p2NewPoints),
            },
          ],
        }),
        prisma.matchParticipant.updateMany({
          where: { matchId: id, playerId: match.player1Id },
          data: { pointsAfter: p1NewPoints },
        }),
        prisma.matchParticipant.updateMany({
          where: { matchId: id, playerId: match.player2Id },
          data: { pointsAfter: p2NewPoints },
        }),
      ])

      const p1TierName = allTiers.find(t => t.id === findTierId(p1NewPoints))?.shortName
      const p2TierName = allTiers.find(t => t.id === findTierId(p2NewPoints))?.shortName
      emitPlayerUpdate(match.player1Id, { points: p1NewPoints, tier: p1TierName })
      emitPlayerUpdate(match.player2Id, { points: p2NewPoints, tier: p2TierName })
      emitLeaderboardUpdate({ type: 'match_approved', matchId: id })
      emitGlobalNotification({
        type: 'match_approved',
        message: `Match ${id.slice(0, 8)} approved`,
      })

      return NextResponse.json({ data: match, pointsAwarded })
    }

    if (action === 'reject') {
      await prisma.match.update({
        where: { id },
        data: {
          status: 'REJECTED',
          approvedById: userId,
          approvedAt: new Date(),
          rejectedReason: body.reason,
        },
      })

      return NextResponse.json({ data: match })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to process match' }, { status: 500 })
  }
}
