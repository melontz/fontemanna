'use client'
import { useGameStore } from '@/lib/store/gameStore'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function TitlePage() {
  const { startGame, loadGame } = useGameStore()
  const [hasSave, setHasSave] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setHasSave(!!localStorage.getItem('fontemanna_save'))
    setLoaded(true)
  }, [])

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-300 via-green-200 to-amber-100 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <svg viewBox="0 0 1200 600" className="w-full h-full" preserveAspectRatio="xMidYMax slice">
          <ellipse cx="300" cy="600" rx="500" ry="200" fill="#4a7c35" opacity="0.4" />
          <ellipse cx="900" cy="600" rx="450" ry="180" fill="#3d6b28" opacity="0.4" />
          <ellipse cx="600" cy="620" rx="400" ry="160" fill="#5a8a3c" opacity="0.35" />
          <circle cx="1050" cy="100" r="70" fill="#fde68a" opacity="0.8" />
        </svg>
      </div>

      <div className="relative z-10 text-center max-w-lg w-full">
        <div className="text-7xl mb-2 drop-shadow-lg">🐑</div>
        <h1 className="text-5xl font-black text-amber-900 drop-shadow-sm mb-1" style={{ fontFamily: 'Georgia, serif' }}>
          Fontemanna
        </h1>
        <p className="text-lg text-amber-800 font-semibold mb-1">Le Stagioni di Bostiano</p>
        <p className="text-sm text-amber-700 mb-8 italic">Colle San Paolo, Umbria</p>

        <div className="bg-white/80 backdrop-blur rounded-2xl p-5 shadow-xl border border-amber-200 mb-6 text-left text-sm text-gray-700 leading-relaxed">
          <p className="mb-2">
            Sei <strong>Bostiano</strong>, pastore e casaro a Colle San Paolo. Il tuo gregge produce
            il miglior yogurt di pecora dell&apos;Umbria — ma i costi dell&apos;energia salgono per colpa di Trump,
            i cinghiali devastano i campi, e Grigio il lupo non dorme mai.
          </p>
          <p>
            Soddisfa i tuoi clienti, rispetta ASL, NAS, Forestale e Regione Umbria, e sopravvivi a tre anni di stagioni.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => { startGame(); router.push('/game') }}
            className="w-full py-4 rounded-2xl font-black text-lg text-white bg-amber-700 hover:bg-amber-800 active:scale-95 transition-all shadow-lg"
          >
            🌸 Inizia una nuova partita
          </button>

          {loaded && hasSave && (
            <button
              onClick={() => { loadGame(); router.push('/game') }}
              className="w-full py-3 rounded-2xl font-bold text-amber-900 bg-white/80 hover:bg-amber-50 active:scale-95 transition-all shadow-md border border-amber-300 text-sm"
            >
              💾 Riprendi partita salvata
            </button>
          )}
        </div>

        <p className="mt-6 text-xs text-amber-700 opacity-70">
          Un gioco di gestione — solo browser, niente download
        </p>
      </div>
    </main>
  )
}
