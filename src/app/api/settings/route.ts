import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const setting = await prisma.setting.findUnique({ where: { key: 'site_config' } })
    const config = setting ? JSON.parse(setting.value) : {}
    return NextResponse.json({
      siteName: config.siteName ?? 'TierCore',
      version: config.version ?? '2.0.0',
      serverIp: config.serverIp ?? 'play.tiercore.net',
      maintenanceMode: config.maintenanceMode ?? false,
      nextMatchDate: config.nextMatchDate ?? null,
      prize1: config.prize1 ?? '',
      prize2: config.prize2 ?? '',
      prize3: config.prize3 ?? '',
      totalTournaments: config.totalTournaments ?? 0,
    })
  } catch {
    return NextResponse.json({ siteName: 'TierCore', version: '2.0.0', serverIp: 'play.tiercore.net', maintenanceMode: false, nextMatchDate: null, prize1: '', prize2: '', prize3: '', totalTournaments: 0 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json()
    const setting = await prisma.setting.findUnique({ where: { key: 'site_config' } })
    const config = setting ? JSON.parse(setting.value) : {}

    if (body.serverIp !== undefined) {
      config.serverIp = body.serverIp
    }
    if (body.siteName !== undefined) {
      config.siteName = body.siteName
    }
    if (body.nextMatchDate !== undefined) {
      config.nextMatchDate = body.nextMatchDate
    }
    if (body.prize1 !== undefined) {
      config.prize1 = body.prize1
    }
    if (body.prize2 !== undefined) {
      config.prize2 = body.prize2
    }
    if (body.prize3 !== undefined) {
      config.prize3 = body.prize3
    }
    if (body.totalTournaments !== undefined) {
      config.totalTournaments = body.totalTournaments
    }

    await prisma.setting.upsert({
      where: { key: 'site_config' },
      update: { value: JSON.stringify(config) },
      create: { key: 'site_config', value: JSON.stringify(config) },
    })

    return NextResponse.json({ success: true, ...config })
  } catch {
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}
