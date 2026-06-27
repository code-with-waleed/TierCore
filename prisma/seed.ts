import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const TIER_POINTS = {
  lt5: 1, ht5: 2, lt4: 3, ht4: 4, lt3: 6,
  ht3: 10, lt2: 20, ht2: 30, lt1: 45, ht1: 60,
  rlt3: 6, rht3: 10, rlt2: 20, rht2: 30, rlt1: 45, rht1: 60,
}

const tiersData = [
  { key: 'lt5', name: 'LT5', shortName: 'LT5', displayOrder: 1, minPoints: 1, maxPoints: 1, color: '#655B79', category: 'LT' },
  { key: 'ht5', name: 'HT5', shortName: 'HT5', displayOrder: 2, minPoints: 2, maxPoints: 2, color: '#8F82A8', category: 'HT' },
  { key: 'lt4', name: 'LT4', shortName: 'LT4', displayOrder: 3, minPoints: 3, maxPoints: 3, color: '#655B79', category: 'LT' },
  { key: 'ht4', name: 'HT4', shortName: 'HT4', displayOrder: 4, minPoints: 4, maxPoints: 4, color: '#81749A', category: 'HT' },
  { key: 'lt3', name: 'LT3', shortName: 'LT3', displayOrder: 5, minPoints: 6, maxPoints: 6, color: '#C67B42', category: 'LT' },
  { key: 'ht3', name: 'HT3', shortName: 'HT3', displayOrder: 6, minPoints: 10, maxPoints: 10, color: '#F89F5A', category: 'HT' },
  { key: 'lt2', name: 'LT2', shortName: 'LT2', displayOrder: 7, minPoints: 20, maxPoints: 20, color: '#A0A7B2', category: 'LT' },
  { key: 'ht2', name: 'HT2', shortName: 'HT2', displayOrder: 8, minPoints: 30, maxPoints: 30, color: '#C4D3E7', category: 'HT' },
  { key: 'lt1', name: 'LT1', shortName: 'LT1', displayOrder: 9, minPoints: 45, maxPoints: 45, color: '#D5B355', category: 'LT' },
  { key: 'ht1', name: 'HT1', shortName: 'HT1', displayOrder: 10, minPoints: 60, maxPoints: 60, color: '#E8BA3A', category: 'HT' },
  { key: 'rlt3', name: 'RLT3', shortName: 'RLT3', displayOrder: 11, minPoints: 6, maxPoints: 6, color: '#A2D6FF', category: 'LT' },
  { key: 'rht3', name: 'RHT3', shortName: 'RHT3', displayOrder: 12, minPoints: 10, maxPoints: 10, color: '#A2D6FF', category: 'HT' },
  { key: 'rlt2', name: 'RLT2', shortName: 'RLT2', displayOrder: 13, minPoints: 20, maxPoints: 20, color: '#A2D6FF', category: 'LT' },
  { key: 'rht2', name: 'RHT2', shortName: 'RHT2', displayOrder: 14, minPoints: 30, maxPoints: 30, color: '#A2D6FF', category: 'HT' },
  { key: 'rlt1', name: 'RLT1', shortName: 'RLT1', displayOrder: 15, minPoints: 45, maxPoints: 45, color: '#A2D6FF', category: 'LT' },
  { key: 'rht1', name: 'RHT1', shortName: 'RHT1', displayOrder: 16, minPoints: 60, maxPoints: 60, color: '#A2D6FF', category: 'HT' },
]

async function main() {
  console.log('[Seed] Starting database seed...')

  for (const tier of tiersData) {
    await prisma.tier.upsert({
      where: { key: tier.key },
      update: tier,
      create: tier,
    })
  }
  console.log('[Seed] Tiers created')

  const existingSeason = await prisma.season.findFirst()
  if (!existingSeason) {
    await prisma.season.create({
      data: {
        name: 'Season 1',
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-12-31'),
        isActive: true,
        pointSoftReset: 0,
      },
    })
    console.log('[Seed] Season created')
  }

  await prisma.setting.upsert({
    where: { key: 'points_config' },
    update: { value: JSON.stringify({ tierPoints: TIER_POINTS }) },
    create: { key: 'points_config', value: JSON.stringify({ tierPoints: TIER_POINTS }) },
  })

  await prisma.setting.upsert({
    where: { key: 'site_config' },
    update: { value: JSON.stringify({ siteName: 'TierCore', version: '2.0.0', maintenanceMode: false, serverIp: 'play.tiercore.net' }) },
    create: { key: 'site_config', value: JSON.stringify({ siteName: 'TierCore', version: '2.0.0', maintenanceMode: false, serverIp: 'play.tiercore.net' }) },
  })

  console.log('[Seed] Settings created')
  console.log('[Seed] Seed completed successfully')
}

main()
  .catch(e => {
    console.error('[Seed] Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
