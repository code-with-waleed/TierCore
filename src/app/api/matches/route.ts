import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getPointsForTier } from '@/lib/points'
import { emitLeaderboardUpdate, emitMatchUpdate } from '@/lib/socket'

export async function GET() {
  try {
    const matches = await prisma.match.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        player1: { select: { username: true } },
        player2: { select: { username: true } },
      },
    })
    return NextResponse.json({ data: matches })
  } catch {
    return NextResponse.json({ data: [] })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { player1Id, player2Id, winner, mode = 'sword', proof, submittedById } = body

    if (!player1Id || !player2Id || !winner) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const [player1, player2] = await Promise.all([
      prisma.player.findUnique({ where: { id: player1Id }, include: { currentTier: true } }),
      prisma.player.findUnique({ where: { id: player2Id }, include: { currentTier: true } }),
    ])

    if (!player1 || !player2) {
      return NextResponse.json({ error: 'Player not found' }, { status: 404 })
    }

    const loserTierKey = winner === 'player1'
      ? (player2.currentTier?.key ?? 'lt5')
      : winner === 'player2'
        ? (player1.currentTier?.key ?? 'lt5')
        : 'lt5'
    const pointsAwarded = winner === 'draw' ? 0 : getPointsForTier(loserTierKey)

    const match = await prisma.match.create({
      data: {
        player1Id, player2Id,
        player1Points: player1.points, player2Points: player2.points,
        winner, mode, proof, submittedById,
        status: 'PENDING',
        pointsChange: pointsAwarded,
      },
    })

    await prisma.matchParticipant.createMany({
      data: [
        { matchId: match.id, playerId: player1Id, isWinner: winner === 'player1', pointsBefore: player1.points, pointsAfter: player1.points + (winner === 'player1' ? pointsAwarded : 0) },
        { matchId: match.id, playerId: player2Id, isWinner: winner === 'player2', pointsBefore: player2.points, pointsAfter: player2.points + (winner === 'player2' ? pointsAwarded : 0) },
      ],
    })

    await prisma.rankingHistory.createMany({
      data: [
        { playerId: player1Id, points: player1.points + (winner === 'player1' ? pointsAwarded : 0), matchId: match.id, reason: `Match ${match.id}` },
        { playerId: player2Id, points: player2.points + (winner === 'player2' ? pointsAwarded : 0), matchId: match.id, reason: `Match ${match.id}` },
      ],
    })

    emitMatchUpdate(match.id, { status: 'created', match })
    emitLeaderboardUpdate({ type: 'match_submitted', matchId: match.id })

    return NextResponse.json({ data: match, pointsAwarded }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to submit match' }, { status: 500 })
  }
}
