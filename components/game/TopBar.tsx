'use client'
import { useGameStore } from '@/lib/store/gameStore'

const SEASON_LABEL = { spring: '🌸 Primavera', summer: '☀️ Estate', autumn: '🍂 Autunno', winter: '❄️ Inverno' }
const SEASON_BG = { spring: 'from-green-500 to-green-400', summer: 'from-yellow-500 to-amber-400', autumn: 'from-orange-600 to-amber-500', winter: 'from-blue-500 to-blue-400' }

export default function TopBar() {
  const { day, season, year, money, trumpCostIndex, speed, setSpeed, saveGame } = useGameStore()

  const trumpDanger = trumpCostIndex > 2.0 ? 'text-red-400 font-bold animate-pulse' : trumpCostIndex > 1.5 ? 'text-orange-300 font-semibold' : 'text-green-300'

  const speeds = [
    { key: 'paused', icon: '⏸', label: 'Pausa' },
    { key: 'slow', icon: '🐢', label: 'Lento' },
    { key: 'normal', icon: '▶', label: 'Normale' },
    { key: 'fast', icon: '⏩', label: 'Veloce' },
  ] as const

  return (
    <div className={`bg-gradient-to-r ${SEASON_BG[season]} rounded-2xl shadow-lg px-4 py-2.5 flex items-center gap-3 flex-wrap`}>
      {/* Stagione e tempo */}
      <div className="text-white font-black text-base flex-shrink-0" style={{ fontFamily: 'Georgia, serif' }}>
        {SEASON_LABEL[season]}
      </div>
      <div className="text-white/80 text-sm font-medium">
        Anno {year}/3 · Giorno {day}/30
      </div>

      <div className="flex-1" />

      {/* Indice Trump */}
      <div className={`text-xs ${trumpDanger} flex-shrink-0`}>
        📈 Costi ×{trumpCostIndex.toFixed(2)}
      </div>

      {/* Soldi */}
      <div className={`text-lg font-black flex-shrink-0 ${money < 200 ? 'text-red-200 animate-pulse' : 'text-white'}`}>
        €{money.toFixed(0)}
      </div>

      {/* Controlli velocità */}
      <div className="flex gap-1 flex-shrink-0 bg-black/20 rounded-xl p-1">
        {speeds.map(s => (
          <button
            key={s.key}
            onClick={() => setSpeed(s.key)}
            title={s.label}
            className={`w-9 h-8 rounded-lg text-sm font-bold transition-all active:scale-90 ${speed === s.key ? 'bg-white text-gray-800 shadow-md' : 'text-white/80 hover:bg-white/20'}`}
          >
            {s.icon}
          </button>
        ))}
      </div>

      {/* Salva */}
      <button
        onClick={saveGame}
        className="flex-shrink-0 px-3 h-9 rounded-xl text-xs font-bold bg-white/20 hover:bg-white/30 text-white transition-all active:scale-95 border border-white/30"
        title="Salva partita"
      >
        💾
      </button>
    </div>
  )
}
