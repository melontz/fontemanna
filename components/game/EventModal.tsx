'use client'
import { useGameStore } from '@/lib/store/gameStore'

const EVENT_ICONS: Record<string, string> = {
  wolf: '🐺',
  boar: '🐗',
  escape: '🏃',
  weather: '⛈️',
  inspection: '📋',
  market: '🧀',
  cost: '📈',
  vet: '🩺',
  neighbor: '🤔',
  bitterness: '🌿',
}

const EVENT_COLORS: Record<string, string> = {
  wolf: 'border-red-400 bg-red-50',
  boar: 'border-orange-400 bg-orange-50',
  escape: 'border-yellow-400 bg-yellow-50',
  inspection: 'border-blue-400 bg-blue-50',
  market: 'border-green-400 bg-green-50',
  cost: 'border-purple-400 bg-purple-50',
  bitterness: 'border-lime-400 bg-lime-50',
}

export default function EventModal() {
  const { activeEvent, resolveEvent } = useGameStore()
  if (!activeEvent) return null

  const icon = EVENT_ICONS[activeEvent.type] ?? '❓'
  const colorClass = EVENT_COLORS[activeEvent.type] ?? 'border-gray-400 bg-gray-50'

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`max-w-lg w-full rounded-2xl border-2 shadow-2xl p-6 ${colorClass} animate-in slide-in-from-bottom-4`}>
        <div className="text-5xl text-center mb-3">{icon}</div>
        <h2 className="text-xl font-bold text-center text-gray-900 mb-3">{activeEvent.title}</h2>
        <p className="text-gray-700 text-sm leading-relaxed mb-5 text-center">{activeEvent.description}</p>

        <div className="space-y-2">
          {activeEvent.choices.map((choice, i) => (
            <button
              key={i}
              onClick={() => resolveEvent(i)}
              className="w-full text-left px-4 py-3 rounded-xl border border-gray-300 bg-white hover:bg-amber-50 hover:border-amber-400 transition-all duration-150 text-sm font-medium shadow-sm active:scale-95"
            >
              <span className="mr-2 text-amber-600">›</span>
              {choice.label}
              {choice.cost && (
                <span className="ml-2 text-xs text-red-500 font-bold">(−€{choice.cost})</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
