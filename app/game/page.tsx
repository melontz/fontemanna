'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useGameStore } from '@/lib/store/gameStore'
import { useGameLoop } from '@/hooks/useGameLoop'
import GameMap from '@/components/game/GameMap'
import TopBar from '@/components/game/TopBar'
import EventModal from '@/components/game/EventModal'
import Toast from '@/components/game/Toast'

function GameOverScreen() {
  const { won, gameOverReason, startGame } = useGameStore()
  const router = useRouter()
  return (
    <main className={`h-screen flex items-center justify-center p-6 ${won?'bg-gradient-to-b from-amber-50 to-green-100':'bg-gradient-to-b from-gray-800 to-gray-950'}`}>
      <div className="max-w-sm w-full text-center">
        <div className="text-8xl mb-4">{won?'🏆':'😞'}</div>
        <h1 className={`text-3xl font-black mb-3 ${won?'text-amber-800':'text-white'}`} style={{fontFamily:'Georgia,serif'}}>
          {won?'Fontemanna vince!':'Partita finita'}
        </h1>
        <p className={`mb-8 leading-relaxed text-sm ${won?'text-gray-700':'text-gray-300'}`}>
          {won?'Bostiano ha superato tre anni di stagioni umbre. Il caseificio Fontemanna è un riferimento per tutta la regione.':gameOverReason}
        </p>
        <button onClick={()=>{startGame();router.push('/game')}}
          className="w-full py-4 rounded-2xl font-bold text-white bg-amber-700 hover:bg-amber-800 active:scale-95 transition-all mb-3 shadow-lg text-lg">
          🔄 Ricomincia
        </button>
        <button onClick={()=>router.push('/')}
          className="w-full py-3 rounded-2xl font-bold bg-white/10 hover:bg-white/20 text-white active:scale-95 text-sm border border-white/20">
          ← Menu principale
        </button>
      </div>
    </main>
  )
}

function GameScreen() {
  useGameLoop()
  return (
    <main className="h-screen flex flex-col overflow-hidden bg-gray-900">
      <TopBar />
      <div className="flex-1 min-h-0 relative">
        <GameMap />
      </div>
      <EventModal />
      <Toast />
    </main>
  )
}

export default function GamePage() {
  const { phase, gameOver, won } = useGameStore()
  const router = useRouter()
  useEffect(() => { if (phase==='title') router.push('/') }, [phase, router])
  if (gameOver || won) return <GameOverScreen />
  return <GameScreen />
}
