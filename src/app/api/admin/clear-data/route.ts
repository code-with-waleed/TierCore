import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const { playerId } = body

    const operations: any[] = []

    if (playerId) {
      const playerMatches = await prisma.match.findMany({
        where: {
          OR: [{ player1Id: playerId }, { player2Id: playerId }],
        },
        select: { id: true },
      })
      const matchIds = playerMatches.map(m => m.id)
      operations.push(prisma.matchParticipant.deleteMany({ where: { matchId: { in: matchIds } } }))
      operations.push(prisma.rankingHistory.deleteMany({ where: { matchId: { in: matchIds } } }))
      operations.push(prisma.match.deleteMany({ where: { id: { in: matchIds } } }))
    } else {
      operations.push(prisma.matchParticipant.deleteMany())
      operations.push(prisma.rankingHistory.deleteMany())
      operations.push(prisma.match.deleteMany())
    }

    await prisma.$transaction(operations)
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to clear data' }, { status: 500 })
  }
}
