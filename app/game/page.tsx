'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useGameStore } from '@/lib/store/gameStore'
import GameMap from '@/components/game/GameMap'
import HUD from '@/components/game/HUD'
import EventModal from '@/components/game/EventModal'
import ProductionPanel from '@/components/game/ProductionPanel'
import MarketPanel from '@/components/game/MarketPanel'
import EventLog from '@/components/game/EventLog'
import ActionBar from '@/components/game/ActionBar'

export default function GamePage() {
  const { phase, gameOver, won, gameOverReason, startGame, setPhase } = useGameStore()
  const router = useRouter()

  useEffect(() => {
    if (phase === 'title') router.push('/')
  }, [phase, router])

  if (gameOver || won) {
    return (
      <main className={`min-h-screen flex flex-col items-center justify-center p-6 ${won ? 'bg-gradient-to-b from-amber-100 to-green-100' : 'bg-gradient-to-b from-gray-800 to-gray-900'}`}>
        <div className="max-w-md text-center">
          <div className="text-7xl mb-4">{won ? '🏆' : '😞'}</div>
          <h1 className={`text-3xl font-black mb-3 ${won ? 'text-amber-800' : 'text-white'}`}>
            {won ? 'Fontemanna vince!' : 'Partita finita'}
          </h1>
          <p className={`mb-6 ${won ? 'text-gray-700' : 'text-gray-300'}`}>
            {won
              ? 'Bostiano ha superato tre anni di stagioni umbre. Il caseificio è un riferimento per tutta la regione.'
              : gameOverReason}
          </p>
          <button
            onClick={() => { startGame(); router.push('/game') }}
            className="w-full py-4 rounded-2xl font-bold text-white bg-amber-700 hover:bg-amber-800 active:scale-95 transition-all"
          >
            🔄 Ricomincia
          </button>
          <button
            onClick={() => router.push('/')}
            className="mt-2 w-full py-3 rounded-2xl font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 active:scale-95 transition-all text-sm"
          >
            ← Menu principale
          </button>
        </div>
      </main>
    )
  }

  if (phase === 'market') {
    return (
      <main className="min-h-screen bg-gradient-to-b from-amber-50 to-green-50 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-black text-amber-900">🧀 Caseificio & Mercato</h2>
            <button
              onClick={() => setPhase('playing')}
              className="py-2 px-4 rounded-xl text-sm font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 border border-amber-300"
            >
              ← Torna al pascolo
            </button>
          </div>
          <div className="grid gap-4">
            <ProductionPanel />
            <MarketPanel />
            <EventLog />
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-100 to-amber-50 p-3">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-lg font-black text-amber-900" style={{ fontFamily: 'Georgia, serif' }}>
            🐑 Fontemanna
          </h1>
          <button
            onClick={() => router.push('/')}
            className="text-xs text-amber-700 hover:underline"
          >
            ← Menu
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {/* Colonna sinistra: mappa + azioni */}
          <div className="lg:col-span-2 space-y-3">
            <GameMap />
            <ActionBar />
            <EventLog />
          </div>

          {/* Colonna destra: HUD */}
          <div className="space-y-3">
            <HUD />
          </div>
        </div>
      </div>

      <EventModal />
    </main>
  )
}
