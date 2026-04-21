'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useGameStore } from '@/lib/store/gameStore'
import { useGameLoop } from '@/hooks/useGameLoop'
import GameMap from '@/components/game/GameMap'
import TopBar from '@/components/game/TopBar'
import SidePanel from '@/components/game/SidePanel'
import EventModal from '@/components/game/EventModal'
import EventLog from '@/components/game/EventLog'
import Toast from '@/components/game/Toast'

function GameOverScreen() {
  const { won, gameOverReason, startGame } = useGameStore()
  const router = useRouter()
  return (
    <main className={`min-h-screen flex flex-col items-center justify-center p-6 ${won ? 'bg-gradient-to-b from-amber-50 to-green-100' : 'bg-gradient-to-b from-gray-800 to-gray-900'}`}>
      <div className="max-w-md w-full text-center">
        <div className="text-7xl mb-4">{won ? '🏆' : '😞'}</div>
        <h1 className={`text-3xl font-black mb-3 ${won ? 'text-amber-800' : 'text-white'}`} style={{ fontFamily: 'Georgia, serif' }}>
          {won ? 'Fontemanna vince!' : 'Partita finita'}
        </h1>
        <p className={`mb-8 leading-relaxed ${won ? 'text-gray-700' : 'text-gray-300'}`}>
          {won
            ? 'Bostiano ha superato tre anni di stagioni umbre. Il caseificio Fontemanna è un riferimento per tutta la regione. Bravo!'
            : gameOverReason}
        </p>
        <button onClick={() => { startGame(); router.push('/game') }}
          className="w-full py-4 rounded-2xl font-bold text-white bg-amber-700 hover:bg-amber-800 active:scale-95 transition-all mb-3 shadow-lg">
          🔄 Ricomincia
        </button>
        <button onClick={() => router.push('/')}
          className="w-full py-3 rounded-2xl font-bold bg-white/10 hover:bg-white/20 text-white active:scale-95 transition-all text-sm border border-white/20">
          ← Menu principale
        </button>
      </div>
    </main>
  )
}

function GameScreen() {
  useGameLoop()

  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 to-green-50 p-3 lg:p-4">
      <div className="max-w-5xl mx-auto flex flex-col gap-3">
        <TopBar />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {/* Mappa — occupa 2 colonne su lg */}
          <div className="lg:col-span-2 flex flex-col gap-3">
            <GameMap />
            <EventLog />
          </div>
          {/* Pannello laterale — 1 colonna, altezza piena */}
          <div className="lg:row-span-1" style={{ minHeight: '520px' }}>
            <SidePanel />
          </div>
        </div>
      </div>

      <EventModal />
      <Toast />
    </main>
  )
}

export default function GamePage() {
  const { phase, gameOver, won } = useGameStore()
  const router = useRouter()

  useEffect(() => {
    if (phase === 'title') router.push('/')
  }, [phase, router])

  if (gameOver || won) return <GameOverScreen />
  return <GameScreen />
}
