'use client'
import { useState } from 'react'
import { useGameStore } from '@/lib/store/gameStore'

export default function ActionBar() {
  const { nextDay, fixFence, fenceIntegrity, money, activeEvent, saveGame, setPhase, phase } = useGameStore()
  const [showProduction, setShowProduction] = useState(false)
  const [showMarket, setShowMarket] = useState(false)

  return (
    <div className="flex flex-wrap gap-2 justify-center">
      <button
        onClick={() => { saveGame(); nextDay() }}
        disabled={!!activeEvent}
        className="flex-1 min-w-[130px] py-3 rounded-xl font-bold text-white bg-amber-700 hover:bg-amber-800 active:scale-95 transition-all shadow-md disabled:opacity-40 disabled:cursor-not-allowed text-sm"
      >
        ⏭️ Fine giornata
      </button>

      <button
        onClick={() => setPhase('market')}
        className="flex-1 min-w-[130px] py-3 rounded-xl font-bold text-white bg-green-700 hover:bg-green-800 active:scale-95 transition-all shadow-md text-sm"
      >
        🛒 Caseificio & Mercato
      </button>

      <button
        onClick={fixFence}
        disabled={money < 80 || fenceIntegrity >= 100}
        className={`flex-1 min-w-[130px] py-3 rounded-xl font-bold text-white active:scale-95 transition-all shadow-md text-sm disabled:opacity-40 disabled:cursor-not-allowed
          ${fenceIntegrity < 50 ? 'bg-red-600 hover:bg-red-700 animate-pulse' : 'bg-orange-600 hover:bg-orange-700'}`}
      >
        🔨 Ripara recinzione (€80)
      </button>

      <button
        onClick={saveGame}
        className="py-3 px-4 rounded-xl font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 active:scale-95 transition-all text-sm border border-amber-300"
      >
        💾 Salva
      </button>
    </div>
  )
}
