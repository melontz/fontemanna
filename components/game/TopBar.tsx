'use client'
import { useGameStore } from '@/lib/store/gameStore'

const SEASON_LABEL = { spring: '🌸 Primavera', summer: '☀️ Estate', autumn: '🍂 Autunno', winter: '❄️ Inverno' }
const SEASON_BG    = { spring: 'from-green-600 to-green-500', summer: 'from-amber-500 to-yellow-400', autumn: 'from-orange-700 to-amber-500', winter: 'from-blue-600 to-blue-400' }

export default function TopBar() {
  const { day, season, year, money, trumpCostIndex, speed, setSpeed, saveGame, fenceIntegrity, compliance } = useGameStore()
  const minComp = Math.min(compliance.asl, compliance.nas, compliance.forestale, compliance.regione)

  const speeds = [
    { key: 'paused', icon: '⏸' },
    { key: 'slow',   icon: '🐢' },
    { key: 'normal', icon: '▶' },
    { key: 'fast',   icon: '⏩' },
  ] as const

  return (
    <div className={`bg-gradient-to-r ${SEASON_BG[season]} flex items-center gap-2 px-3 py-1.5 flex-shrink-0`}>
      {/* Stagione + tempo */}
      <span className="text-white font-black text-sm tracking-tight" style={{fontFamily:'Georgia,serif'}}>
        {SEASON_LABEL[season]}
      </span>
      <span className="text-white/70 text-xs">A{year}/3 · G{day}/30</span>

      {/* Separatore */}
      <div className="flex-1"/>

      {/* Alert recinzione */}
      {fenceIntegrity < 50 && (
        <span className="text-xs bg-red-500/80 text-white px-2 py-0.5 rounded-full font-bold animate-pulse hidden sm:inline">🔨 Recint. {fenceIntegrity}%</span>
      )}

      {/* Alert normative */}
      {minComp < 40 && (
        <span className="text-xs bg-orange-500/80 text-white px-2 py-0.5 rounded-full font-bold animate-pulse hidden sm:inline">⚠️ Conformità</span>
      )}

      {/* Indice Trump */}
      <span className={`text-xs font-bold hidden md:inline ${trumpCostIndex>2?'text-red-200 animate-pulse':trumpCostIndex>1.5?'text-yellow-200':'text-white/70'}`}>
        📈×{trumpCostIndex.toFixed(2)}
      </span>

      {/* Soldi */}
      <span className={`text-base font-black ${money<200?'text-red-200 animate-pulse':'text-white'}`}>
        €{money.toFixed(0)}
      </span>

      {/* Velocità */}
      <div className="flex gap-0.5 bg-black/20 rounded-xl p-0.5">
        {speeds.map(s => (
          <button key={s.key} onClick={() => setSpeed(s.key)} title={s.key}
            className={`w-8 h-7 rounded-lg text-xs font-bold transition-all active:scale-90
              ${speed===s.key?'bg-white text-gray-800 shadow':'text-white/80 hover:bg-white/20'}`}>
            {s.icon}
          </button>
        ))}
      </div>

      {/* Salva */}
      <button onClick={saveGame} className="w-8 h-7 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition-all active:scale-95" title="Salva">
        💾
      </button>
    </div>
  )
}
