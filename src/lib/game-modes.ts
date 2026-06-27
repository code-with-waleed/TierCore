export interface GameModeConfig {
  id: string
  name: string
  icon: string
  desc: string
}

export const GAME_MODES: GameModeConfig[] = [
  { id: 'overall', name: 'Overall', icon: '/images/overall.svg', desc: 'All modes combined' },
  { id: 'sword', name: 'Sword', icon: '/images/sword.svg', desc: 'Classic sword PvP' },
  { id: 'axe', name: 'Axe', icon: '/images/axe.svg', desc: 'Axe-based combat' },
  { id: 'pot', name: 'Pot', icon: '/images/pot.svg', desc: 'Pot PvP' },
  { id: 'nethpot', name: 'NethPot', icon: '/images/nethop.svg', desc: 'Netherite potion PvP' },
  { id: 'uhc', name: 'UHC', icon: '/images/uhc.svg', desc: 'Ultra Hardcore mode' },
  { id: 'mace', name: 'Mace', icon: '/images/mace.svg', desc: 'Mace PvP' },
  { id: 'smp', name: 'SMP', icon: '/images/smp.svg', desc: 'Survival Multiplayer' },
  { id: 'vanilla', name: 'Vanilla', icon: '/images/vanilla.svg', desc: 'Vanilla Minecraft combat' },
]

export const GAME_MODE_IDS = GAME_MODES.map(m => m.id)

export function getModeName(id: string): string {
  return GAME_MODES.find(m => m.id === id)?.name ?? id
}

export function isValidMode(id: string): boolean {
  return GAME_MODE_IDS.includes(id)
}
