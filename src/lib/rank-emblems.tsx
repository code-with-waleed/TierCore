interface EmblemProps {
  size?: number
  glow?: boolean
  className?: string
}

function BaseBadge({ color, lightColor, darkColor, children }: { color: string; lightColor: string; darkColor: string; children: React.ReactNode }) {
  return (
    <svg width="100%" height="100%" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`bg-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a1a2e" />
          <stop offset="100%" stopColor="#0f0f1e" />
        </linearGradient>
        <linearGradient id={`border-${color.replace('#','')}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={lightColor} />
          <stop offset="50%" stopColor={color} />
          <stop offset="100%" stopColor={darkColor} />
        </linearGradient>
        <radialGradient id={`shine-${color.replace('#','')}`} cx="40%" cy="30%" r="50%">
          <stop offset="0%" stopColor={lightColor} stopOpacity="0.15" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="46" fill={`url(#bg-${color.replace('#','')})`} />
      <circle cx="50" cy="50" r="44" fill="none" stroke={`url(#border-${color.replace('#','')})`} strokeWidth="2.5" />
      <circle cx="50" cy="50" r="41" fill="none" stroke={color} strokeOpacity="0.08" strokeWidth="0.5" />
      <circle cx="50" cy="50" r="32" fill={`url(#shine-${color.replace('#','')})`} />
      {children}
    </svg>
  )
}

export function BronzeEmblem({ size = 44, glow, className }: EmblemProps) {
  return (
    <div className={className} style={{ width: size, height: size, position: 'relative', filter: glow ? 'drop-shadow(0 0 10px rgba(205,127,50,0.5))' : undefined }}>
      <BaseBadge color="#CD7F32" lightColor="#E8A45A" darkColor="#8B5E24">
        <path d="M50 22 L56 38 L74 38 L60 50 L66 68 L50 56 L34 68 L40 50 L26 38 L44 38Z" fill="#CD7F32" opacity="0.9" />
        <circle cx="50" cy="38" r="3" fill="#1a1a2e" opacity="0.4" />
      </BaseBadge>
    </div>
  )
}

export function SilverEmblem({ size = 44, glow, className }: EmblemProps) {
  return (
    <div className={className} style={{ width: size, height: size, position: 'relative', filter: glow ? 'drop-shadow(0 0 10px rgba(192,192,192,0.5))' : undefined }}>
      <BaseBadge color="#C0C0C0" lightColor="#E8E8E8" darkColor="#808080">
        <path d="M26 48 L50 24 L74 48 L64 68 L50 78 L36 68Z" fill="none" stroke="#C0C0C0" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M34 52 L50 34 L66 52" fill="none" stroke="#E8E8E8" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
        <circle cx="50" cy="42" r="3" fill="#E8E8E8" opacity="0.7" />
      </BaseBadge>
    </div>
  )
}

export function GoldEmblem({ size = 44, glow, className }: EmblemProps) {
  return (
    <div className={className} style={{ width: size, height: size, position: 'relative', filter: glow ? 'drop-shadow(0 0 12px rgba(255,215,0,0.5))' : undefined }}>
      <BaseBadge color="#FFD700" lightColor="#FFED4A" darkColor="#B8860B">
        <path d="M50 18 L58 34 L76 34 L62 46 L68 64 L50 52 L32 64 L38 46 L24 34 L42 34Z" fill="#FFD700" opacity="0.9" />
        <circle cx="50" cy="42" r="4" fill="#1a1a2e" opacity="0.4" />
        <circle cx="50" cy="42" r="2" fill="#FFED4A" opacity="0.9" />
      </BaseBadge>
    </div>
  )
}

export function PlatinumEmblem({ size = 44, glow, className }: EmblemProps) {
  return (
    <div className={className} style={{ width: size, height: size, position: 'relative', filter: glow ? 'drop-shadow(0 0 12px rgba(168,216,234,0.5))' : undefined }}>
      <BaseBadge color="#A8D8EA" lightColor="#D0ECF5" darkColor="#5A9AB0">
        <path d="M50 24 L72 44 L62 48 L50 70 L38 48 L28 44Z" fill="none" stroke="#A8D8EA" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M50 30 L62 44 L56 46 L50 58 L44 46 L38 44Z" fill="#A8D8EA" opacity="0.3" />
        <circle cx="50" cy="46" r="3.5" fill="#D0ECF5" opacity="0.8" />
      </BaseBadge>
    </div>
  )
}

export function DiamondEmblem({ size = 44, glow, className }: EmblemProps) {
  return (
    <div className={className} style={{ width: size, height: size, position: 'relative', filter: glow ? 'drop-shadow(0 0 14px rgba(102,217,255,0.5))' : undefined }}>
      <BaseBadge color="#66D9FF" lightColor="#A8ECFF" darkColor="#2090C0">
        <path d="M50 18 L78 48 L50 82 L22 48Z" fill="none" stroke="#66D9FF" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M50 18 L50 82" stroke="#66D9FF" strokeWidth="1" opacity="0.3" />
        <path d="M22 48 L78 48" stroke="#66D9FF" strokeWidth="1" opacity="0.3" />
        <path d="M50 30 L66 48 L50 68 L34 48Z" fill="#66D9FF" opacity="0.2" />
        <circle cx="50" cy="48" r="4" fill="#A8ECFF" opacity="0.8" />
      </BaseBadge>
    </div>
  )
}

export function MasterEmblem({ size = 44, glow, className }: EmblemProps) {
  return (
    <div className={className} style={{ width: size, height: size, position: 'relative', filter: glow ? 'drop-shadow(0 0 14px rgba(179,136,255,0.5))' : undefined }}>
      <BaseBadge color="#B388FF" lightColor="#D4BFFF" darkColor="#7040CC">
        <path d="M50 18 L56 40 L80 40 L62 54 L70 78 L50 62 L30 78 L38 54 L20 40 L44 40Z" fill="none" stroke="#B388FF" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M50 26 L54 40 L68 40 L58 50 L62 64 L50 54 L38 64 L42 50 L32 40 L46 40Z" fill="#B388FF" opacity="0.25" />
        <circle cx="50" cy="46" r="3" fill="#D4BFFF" opacity="0.8" />
      </BaseBadge>
    </div>
  )
}

export function ApexEmblem({ size = 48, glow, className }: EmblemProps) {
  return (
    <div className={className} style={{ width: size, height: size, position: 'relative', filter: glow ? 'drop-shadow(0 0 16px rgba(255,107,53,0.6))' : undefined }}>
      <BaseBadge color="#FF6B35" lightColor="#FF9A6A" darkColor="#CC4400">
        <path d="M20 76 L42 36 L50 52 L58 36 L80 76Z" fill="none" stroke="#FF6B35" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M28 72 L44 42 L50 56 L56 42 L72 72" fill="none" stroke="#FF9A6A" strokeWidth="1.5" opacity="0.5" strokeLinejoin="round" />
        <path d="M36 72 L50 28 L64 72" fill="none" stroke="#FF6B35" strokeWidth="2" opacity="0.3" strokeLinejoin="round" />
        <circle cx="50" cy="42" r="3.5" fill="#FF9A6A" opacity="0.8" />
      </BaseBadge>
    </div>
  )
}

export function EliteEmblem({ size = 48, glow, className }: EmblemProps) {
  return (
    <div className={className} style={{ width: size, height: size, position: 'relative', filter: glow ? 'drop-shadow(0 0 16px rgba(255,71,87,0.6))' : undefined }}>
      <BaseBadge color="#FF4757" lightColor="#FF707A" darkColor="#CC202E">
        <path d="M34 28 L48 16 L50 34 L52 16 L66 28 L56 46 L66 64 L52 52 L50 78 L48 52 L34 64 L44 46Z" fill="none" stroke="#FF4757" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M40 34 L48 24 L50 38 L52 24 L60 34 L54 46 L60 58 L52 48 L50 66 L48 48 L40 58 L46 46Z" fill="#FF4757" opacity="0.2" />
        <circle cx="50" cy="46" r="3" fill="#FF707A" opacity="0.8" />
      </BaseBadge>
    </div>
  )
}

export function LegendEmblem({ size = 48, glow, className }: EmblemProps) {
  return (
    <div className={className} style={{ width: size, height: size, position: 'relative', filter: glow ? 'drop-shadow(0 0 18px rgba(255,165,2,0.6))' : undefined }}>
      <BaseBadge color="#FFA502" lightColor="#FFC04A" darkColor="#CC7A00">
        <path d="M30 48 Q30 24 50 16 Q70 24 70 48 Q70 62 58 72 L50 82 L42 72 Q30 62 30 48Z" fill="none" stroke="#FFA502" strokeWidth="2.5" />
        <path d="M38 46 Q38 32 50 26 Q62 32 62 46 Q62 56 54 62 L50 68 L46 62 Q38 56 38 46Z" fill="#FFA502" opacity="0.2" />
        <circle cx="42" cy="38" r="2.5" fill="#FFC04A" opacity="0.8" />
        <circle cx="58" cy="38" r="2.5" fill="#FFC04A" opacity="0.8" />
        <circle cx="50" cy="50" r="1.5" fill="#FFC04A" opacity="0.6" />
      </BaseBadge>
    </div>
  )
}

export function MythicEmblem({ size = 48, glow, className }: EmblemProps) {
  return (
    <div className={className} style={{ width: size, height: size, position: 'relative', filter: glow ? 'drop-shadow(0 0 20px rgba(168,85,247,0.6))' : undefined }}>
      <BaseBadge color="#A855F7" lightColor="#C084FC" darkColor="#7C2DCC">
        <path d="M50 12 L58 30 L78 30 L62 44 L68 64 L50 50 L32 64 L38 44 L22 30 L42 30Z" fill="none" stroke="#A855F7" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M50 18 L54 30 L66 30 L56 40 L60 54 L50 44 L40 54 L44 40 L34 30 L46 30Z" fill="#A855F7" opacity="0.2" />
        <circle cx="50" cy="36" r="3.5" fill="#C084FC" opacity="0.8" />
        <line x1="50" y1="12" x2="50" y2="88" stroke="#A855F7" strokeWidth="0.5" opacity="0.1" />
        <line x1="12" y1="50" x2="88" y2="50" stroke="#A855F7" strokeWidth="0.5" opacity="0.1" />
      </BaseBadge>
    </div>
  )
}

export function DivineEmblem({ size = 48, glow, className }: EmblemProps) {
  return (
    <div className={className} style={{ width: size, height: size, position: 'relative', filter: glow ? 'drop-shadow(0 0 22px rgba(56,189,248,0.7))' : undefined }}>
      <BaseBadge color="#38BDF8" lightColor="#7DD3FC" darkColor="#0284C7">
        <path d="M16 48 Q16 22 34 16 Q26 34 26 48 Q26 64 34 74 L50 86 L66 74 Q74 64 74 48 Q74 34 66 16 Q84 22 84 48" fill="none" stroke="#38BDF8" strokeWidth="2.5" />
        <path d="M28 48 Q28 30 42 24 Q36 38 36 48 Q36 60 42 66 L50 76 L58 66 Q64 60 64 48 Q64 38 58 24 Q72 30 72 48" fill="none" stroke="#7DD3FC" strokeWidth="1.5" opacity="0.4" />
        <circle cx="50" cy="36" r="5" fill="#38BDF8" opacity="0.2" />
        <circle cx="50" cy="36" r="3" fill="#7DD3FC" opacity="0.8" />
        <circle cx="50" cy="36" r="1.5" fill="#1a1a2e" opacity="0.5" />
      </BaseBadge>
    </div>
  )
}

export function CelestialEmblem({ size = 48, glow, className }: EmblemProps) {
  return (
    <div className={className} style={{ width: size, height: size, position: 'relative', filter: glow ? 'drop-shadow(0 0 22px rgba(244,114,182,0.6))' : undefined }}>
      <BaseBadge color="#F472B6" lightColor="#F9A8D4" darkColor="#BE5D8E">
        <circle cx="50" cy="50" r="28" fill="none" stroke="#F472B6" strokeWidth="1.5" opacity="0.3" strokeDasharray="3 4" />
        <path d="M50 16 L70 36 L66 60 L50 74 L34 60 L30 36Z" fill="none" stroke="#F472B6" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M50 24 L62 38 L58 54 L50 62 L42 54 L38 38Z" fill="#F472B6" opacity="0.15" />
        <circle cx="50" cy="42" r="3" fill="#F9A8D4" opacity="0.8" />
        <circle cx="50" cy="30" r="1.5" fill="#F9A8D4" opacity="0.4" />
      </BaseBadge>
    </div>
  )
}

export function TranscendentEmblem({ size = 48, glow, className }: EmblemProps) {
  return (
    <div className={className} style={{ width: size, height: size, position: 'relative', filter: glow ? 'drop-shadow(0 0 22px rgba(52,211,153,0.6))' : undefined }}>
      <BaseBadge color="#34D399" lightColor="#6EE7B7" darkColor="#1E9B6E">
        <path d="M30 72 L42 44 L50 56 L58 44 L70 72" fill="none" stroke="#34D399" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M36 62 L44 48 L50 56 L56 48 L64 62" fill="none" stroke="#6EE7B7" strokeWidth="1.5" opacity="0.5" />
        <path d="M42 36 L50 18 L58 36" fill="none" stroke="#34D399" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M46 30 L50 22 L54 30" fill="none" stroke="#6EE7B7" strokeWidth="1.5" opacity="0.5" />
        <circle cx="50" cy="28" r="2" fill="#6EE7B7" opacity="0.8" />
      </BaseBadge>
    </div>
  )
}

export function EternalEmblem({ size = 48, glow, className }: EmblemProps) {
  return (
    <div className={className} style={{ width: size, height: size, position: 'relative', filter: glow ? 'drop-shadow(0 0 22px rgba(251,146,60,0.6))' : undefined }}>
      <BaseBadge color="#FB923C" lightColor="#FDBA74" darkColor="#C06A1E">
        <circle cx="50" cy="50" r="28" fill="none" stroke="#FB923C" strokeWidth="1.5" opacity="0.2" />
        <path d="M50 18 L60 36 L50 44 L40 36Z" fill="none" stroke="#FB923C" strokeWidth="2" strokeLinejoin="round" />
        <path d="M50 44 L60 52 L50 82 L40 52Z" fill="none" stroke="#FB923C" strokeWidth="2" strokeLinejoin="round" />
        <circle cx="50" cy="38" r="2.5" fill="#FDBA74" opacity="0.7" />
      </BaseBadge>
    </div>
  )
}

export function ImmortalEmblem({ size = 48, glow, className }: EmblemProps) {
  return (
    <div className={className} style={{ width: size, height: size, position: 'relative', filter: glow ? 'drop-shadow(0 0 22px rgba(192,132,252,0.6))' : undefined }}>
      <BaseBadge color="#C084FC" lightColor="#D8B4FE" darkColor="#8B5CF6">
        <path d="M50 16 L78 44 L50 76 L22 44Z" fill="none" stroke="#C084FC" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M50 16 L50 76" stroke="#C084FC" strokeWidth="1" opacity="0.3" />
        <path d="M22 44 L78 44" stroke="#C084FC" strokeWidth="1" opacity="0.3" />
        <path d="M50 28 L66 44 L50 62 L34 44Z" fill="#C084FC" opacity="0.2" />
        <circle cx="50" cy="44" r="3.5" fill="#D8B4FE" opacity="0.8" />
      </BaseBadge>
    </div>
  )
}

export function CosmicEmblem({ size = 48, glow, className }: EmblemProps) {
  return (
    <div className={className} style={{ width: size, height: size, position: 'relative', filter: glow ? 'drop-shadow(0 0 22px rgba(45,212,191,0.6))' : undefined }}>
      <BaseBadge color="#2DD4BF" lightColor="#5EEAD4" darkColor="#149E8A">
        <circle cx="50" cy="50" r="30" fill="none" stroke="#2DD4BF" strokeWidth="1" opacity="0.2" strokeDasharray="4 3" />
        <circle cx="50" cy="50" r="20" fill="none" stroke="#2DD4BF" strokeWidth="1.5" opacity="0.3" />
        <circle cx="50" cy="50" r="10" fill="none" stroke="#2DD4BF" strokeWidth="2" />
        <circle cx="50" cy="50" r="3" fill="#5EEAD4" opacity="0.9" />
        <path d="M32 32 L40 40" stroke="#5EEAD4" strokeWidth="1.5" opacity="0.3" />
        <path d="M68 32 L60 40" stroke="#5EEAD4" strokeWidth="1.5" opacity="0.3" />
        <path d="M32 68 L40 60" stroke="#5EEAD4" strokeWidth="1.5" opacity="0.3" />
        <path d="M68 68 L60 60" stroke="#5EEAD4" strokeWidth="1.5" opacity="0.3" />
      </BaseBadge>
    </div>
  )
}

export function OmegaEmblem({ size = 48, glow, className }: EmblemProps) {
  return (
    <div className={className} style={{ width: size, height: size, position: 'relative', filter: glow ? 'drop-shadow(0 0 22px rgba(248,113,113,0.6))' : undefined }}>
      <BaseBadge color="#F87171" lightColor="#FCA5A5" darkColor="#C04040">
        <path d="M30 30 Q30 18 50 18 Q70 18 70 30 Q70 44 56 50 Q70 56 70 70 Q70 82 50 82 Q30 82 30 70 Q30 56 44 50 Q30 44 30 30Z" fill="none" stroke="#F87171" strokeWidth="2.5" />
        <path d="M38 32 Q38 24 50 24 Q62 24 62 32 Q62 42 52 46" fill="none" stroke="#FCA5A5" strokeWidth="1.5" opacity="0.5" />
        <path d="M38 68 Q38 60 50 60 Q62 60 62 68 Q62 76 50 76 Q38 76 38 68Z" fill="#F87171" opacity="0.2" />
        <circle cx="50" cy="50" r="2.5" fill="#FCA5A5" opacity="0.8" />
      </BaseBadge>
    </div>
  )
}

export function InfinityEmblem({ size = 48, glow, className }: EmblemProps) {
  return (
    <div className={className} style={{ width: size, height: size, position: 'relative', filter: glow ? 'drop-shadow(0 0 22px rgba(232,121,249,0.6))' : undefined }}>
      <BaseBadge color="#E879F9" lightColor="#F0ABFC" darkColor="#B44FCC">
        <path d="M28 40 Q28 26 42 26 Q50 26 50 38 Q50 26 58 26 Q72 26 72 40 Q72 54 58 60 L50 68 L42 60 Q28 54 28 40Z" fill="none" stroke="#E879F9" strokeWidth="2.5" />
        <path d="M34 40 Q34 32 42 32 Q48 32 50 38 Q52 32 58 32 Q66 32 66 40 Q66 48 58 52 L50 58 L42 52 Q34 48 34 40Z" fill="#E879F9" opacity="0.2" />
        <circle cx="50" cy="40" r="2" fill="#F0ABFC" opacity="0.8" />
      </BaseBadge>
    </div>
  )
}

export function GodlikeEmblem({ size = 48, glow, className }: EmblemProps) {
  return (
    <div className={className} style={{ width: size, height: size, position: 'relative', filter: glow ? 'drop-shadow(0 0 26px rgba(251,191,36,0.8))' : undefined }}>
      <BaseBadge color="#FBBF24" lightColor="#FCD34D" darkColor="#D97706">
        <path d="M40 18 L50 28 L60 18 L64 34 L80 34 L68 46 L76 64 L60 54 L50 70 L40 54 L24 64 L32 46 L20 34 L36 34Z" fill="none" stroke="#FBBF24" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M44 26 L50 34 L56 26 L58 36 L68 36 L62 44 L66 56 L56 50 L50 58 L44 50 L34 56 L38 44 L32 36 L42 36Z" fill="#FBBF24" opacity="0.2" />
        <circle cx="50" cy="42" r="4" fill="#FCD34D" opacity="0.9" />
        <circle cx="50" cy="42" r="2" fill="#1a1a2e" opacity="0.4" />
      </BaseBadge>
    </div>
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
  elite: EliteEmblem,
  legend: LegendEmblem,
  mythic: MythicEmblem,
  divine: DivineEmblem,
  celestial: CelestialEmblem,
  transcendent: TranscendentEmblem,
  eternal: EternalEmblem,
  immortal: ImmortalEmblem,
  cosmic: CosmicEmblem,
  omega: OmegaEmblem,
  infinity: InfinityEmblem,
  godlike: GodlikeEmblem,
}
