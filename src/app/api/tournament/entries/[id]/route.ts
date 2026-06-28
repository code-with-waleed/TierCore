import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const entry = await prisma.tournamentEntry.update({
      where: { id: params.id },
      data: body,
    })
    return NextResponse.json({ data: entry })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? 'Failed to update' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.tournamentEntry.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error?.message ?? 'Failed to delete' }, { status: 500 })
  }
}
