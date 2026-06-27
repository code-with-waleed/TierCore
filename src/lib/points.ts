import type { TierConfig } from '@/types'

export const TIER_POINTS: Record<string, number> = {
  lt5: 1,
  ht5: 2,
  lt4: 3,
  ht4: 4,
  lt3: 6,
  ht3: 10,
  lt2: 20,
  ht2: 30,
  lt1: 45,
  ht1: 60,
  rlt3: 6,
  rht3: 10,
  rlt2: 20,
  rht2: 30,
  rlt1: 45,
  rht1: 60,
}

export const DEFAULT_TIERS: TierConfig[] = [
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

export const TIER_ORDER = ['lt5', 'ht5', 'lt4', 'ht4', 'lt3', 'ht3', 'lt2', 'ht2', 'lt1', 'ht1', 'rlt3', 'rht3', 'rlt2', 'rht2', 'rlt1', 'rht1']

export function getPointsForTier(tierKey: string): number {
  return TIER_POINTS[tierKey] ?? 0
}

export function getTierFromPoints(points: number, tiers: TierConfig[] = DEFAULT_TIERS): TierConfig | null {
  if (points <= 0) return null
  const sorted = [...tiers].sort((a, b) => a.displayOrder - b.displayOrder)
  for (const tier of sorted) {
    if (points >= tier.minPoints && points <= tier.maxPoints) {
      return tier
    }
  }
  return sorted[sorted.length - 1] ?? null
}

export function calculatePoints(points: number, opponentTierKey: string): number {
  return points + getPointsForTier(opponentTierKey)
}

export function calculateWinRate(wins: number, losses: number, draws: number = 0): number {
  const total = wins + losses + draws
  if (total === 0) return 0
  return Math.round((wins / total) * 10000) / 100
}

export function calculateKdr(wins: number, losses: number): number {
  if (losses === 0) return wins > 0 ? Infinity : 0
  return Math.round((wins / losses) * 100) / 100
}

export interface CombatRank {
  key: string
  name: string
  minPoints: number
  maxPoints: number
  color: string
}

export const COMBAT_RANKS: CombatRank[] = [
  { key: 'bronze', name: 'Bronze', minPoints: 1, maxPoints: 5, color: '#CD7F32' },
  { key: 'silver', name: 'Silver', minPoints: 6, maxPoints: 20, color: '#C0C0C0' },
  { key: 'gold', name: 'Gold', minPoints: 21, maxPoints: 50, color: '#FFD700' },
  { key: 'platinum', name: 'Platinum', minPoints: 51, maxPoints: 100, color: '#A8D8EA' },
  { key: 'diamond', name: 'Diamond', minPoints: 101, maxPoints: 180, color: '#66D9FF' },
  { key: 'master', name: 'Master', minPoints: 181, maxPoints: 300, color: '#B388FF' },
  { key: 'apex', name: 'Apex', minPoints: 301, maxPoints: 480, color: '#FF6B35' },
]

export function getCombatRankFromPoints(points: number): CombatRank {
  if (points <= 0) return COMBAT_RANKS[0]
  for (const rank of COMBAT_RANKS) {
    if (points >= rank.minPoints && points <= rank.maxPoints) return rank
  }
  return COMBAT_RANKS[COMBAT_RANKS.length - 1]
}
