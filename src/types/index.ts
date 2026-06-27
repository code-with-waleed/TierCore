export type GameMode = 'overall' | 'sword' | 'axe' | 'pot' | 'nethpot' | 'uhc' | 'mace' | 'smp' | 'vanilla'

export type TierCategory = 'LT' | 'HT'

export interface TierConfig {
  key: string
  name: string
  shortName: string
  displayOrder: number
  minPoints: number
  maxPoints: number
  color: string
  category: TierCategory
}

export interface ModeStatInfo {
  mode: string
  points: number
  tier: string | null
  tierKey: string | null
  tierColor: string | null
}

export interface LeaderboardEntry {
  rank: number
  playerId: string
  username: string
  avatarUrl: string | null
  points: number
  overallPoints: number
  tier: string
  tierKey: string | null
  tierColor: string
  region: string | null
  modeStats: ModeStatInfo[]
}
