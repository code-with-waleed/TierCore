interface EmblemProps {
  size?: number
  glow?: boolean
  className?: string
}

export function BronzeEmblem({ size = 44, glow, className }: EmblemProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg" style={glow ? { filter: 'drop-shadow(0 0 6px rgba(205,127,50,0.5))' } : undefined}>
      <circle cx="50" cy="50" r="42" fill="#1a0f05" stroke="#CD7F32" strokeWidth="3" />
      <circle cx="50" cy="50" r="34" fill="none" stroke="#CD7F32" strokeWidth="1.5" opacity="0.3" />
      <path d="M50 28 L56 44 L74 44 L60 54 L65 72 L50 60 L35 72 L40 54 L26 44 L44 44Z" fill="#CD7F32" opacity="0.8" />
    </svg>
  )
}

export function SilverEmblem({ size = 44, glow, className }: EmblemProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg" style={glow ? { filter: 'drop-shadow(0 0 6px rgba(192,192,192,0.5))' } : undefined}>
      <circle cx="50" cy="50" r="42" fill="#0f0f12" stroke="#C0C0C0" strokeWidth="3" />
      <circle cx="50" cy="50" r="34" fill="none" stroke="#C0C0C0" strokeWidth="1.5" opacity="0.3" />
      <path d="M30 40 L50 25 L70 40 L65 65 L50 75 L35 65Z" fill="none" stroke="#C0C0C0" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="50" y1="25" x2="50" y2="75" stroke="#C0C0C0" strokeWidth="2" opacity="0.4" />
    </svg>
  )
}

export function GoldEmblem({ size = 44, glow, className }: EmblemProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg" style={glow ? { filter: 'drop-shadow(0 0 8px rgba(255,215,0,0.5))' } : undefined}>
      <circle cx="50" cy="50" r="42" fill="#1a1400" stroke="#FFD700" strokeWidth="3" />
      <circle cx="50" cy="50" r="34" fill="none" stroke="#FFD700" strokeWidth="1.5" opacity="0.3" />
      <path d="M50 24 L58 40 L76 40 L62 52 L68 70 L50 58 L32 70 L38 52 L24 40 L42 40Z" fill="#FFD700" opacity="0.85" />
      <circle cx="50" cy="46" r="4" fill="#1a1400" />
    </svg>
  )
}

export function PlatinumEmblem({ size = 44, glow, className }: EmblemProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg" style={glow ? { filter: 'drop-shadow(0 0 6px rgba(168,216,234,0.5))' } : undefined}>
      <circle cx="50" cy="50" r="42" fill="#0a1013" stroke="#A8D8EA" strokeWidth="3" />
      <circle cx="50" cy="50" r="34" fill="none" stroke="#A8D8EA" strokeWidth="1.5" opacity="0.3" />
      <path d="M35 55 L50 30 L65 55 L58 72 L42 72Z" fill="none" stroke="#A8D8EA" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="50" cy="42" r="5" fill="#A8D8EA" opacity="0.6" />
    </svg>
  )
}

export function DiamondEmblem({ size = 44, glow, className }: EmblemProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg" style={glow ? { filter: 'drop-shadow(0 0 8px rgba(102,217,255,0.5))' } : undefined}>
      <circle cx="50" cy="50" r="42" fill="#060f14" stroke="#66D9FF" strokeWidth="3" />
      <circle cx="50" cy="50" r="34" fill="none" stroke="#66D9FF" strokeWidth="1.5" opacity="0.3" />
      <path d="M50 20 L80 45 L50 80 L20 45Z" fill="none" stroke="#66D9FF" strokeWidth="3" strokeLinejoin="round" />
      <path d="M50 20 L50 80" stroke="#66D9FF" strokeWidth="1.5" opacity="0.4" />
      <path d="M20 45 L80 45" stroke="#66D9FF" strokeWidth="1.5" opacity="0.4" />
      <circle cx="50" cy="50" r="6" fill="#66D9FF" opacity="0.7" />
    </svg>
  )
}

export function MasterEmblem({ size = 44, glow, className }: EmblemProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg" style={glow ? { filter: 'drop-shadow(0 0 8px rgba(179,136,255,0.5))' } : undefined}>
      <circle cx="50" cy="50" r="42" fill="#0f0a1a" stroke="#B388FF" strokeWidth="3" />
      <circle cx="50" cy="50" r="34" fill="none" stroke="#B388FF" strokeWidth="1.5" opacity="0.3" />
      <path d="M36 44 Q36 28 50 28 Q64 28 64 44 Q64 56 50 72 Q36 56 36 44Z" fill="none" stroke="#B388FF" strokeWidth="3" strokeLinecap="round" />
      <path d="M42 44 Q42 34 50 34 Q58 34 58 44" fill="none" stroke="#B388FF" strokeWidth="2" opacity="0.6" />
      <circle cx="50" cy="44" r="4" fill="#B388FF" opacity="0.8" />
      <path d="M40 56 L50 62 L60 56" fill="none" stroke="#B388FF" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
    </svg>
  )
}

export function ApexEmblem({ size = 48, glow, className }: EmblemProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg" style={glow ? { filter: 'drop-shadow(0 0 12px rgba(255,107,53,0.6))' } : undefined}>
      <circle cx="50" cy="50" r="42" fill="#1a0802" stroke="#FF6B35" strokeWidth="3" />
      <circle cx="50" cy="50" r="34" fill="none" stroke="#FF6B35" strokeWidth="1.5" opacity="0.3" />
      <path d="M50 16 L72 38 L68 70 L50 84 L32 70 L28 38Z" fill="none" stroke="#FF6B35" strokeWidth="3" strokeLinejoin="round" />
      <path d="M35 42 L50 26 L65 42" fill="none" stroke="#FF6B35" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
      <path d="M38 55 L50 42 L62 55" fill="none" stroke="#FF6B35" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
      <path d="M44 68 L50 58 L56 68" fill="none" stroke="#FF6B35" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      <line x1="50" y1="26" x2="50" y2="84" stroke="#FF6B35" strokeWidth="1.5" opacity="0.3" />
    </svg>
  )
}

export const RANK_EMBLEMS: Record<string, React.ComponentType<EmblemProps>> = {
  bronze: BronzeEmblem,
  silver: SilverEmblem,
  gold: GoldEmblem,
  platinum: PlatinumEmblem,
  diamond: DiamondEmblem,
  master: MasterEmblem,
  apex: ApexEmblem,
}