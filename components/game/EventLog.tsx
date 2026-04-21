'use client'
import { useRef, useEffect } from 'react'
import { useGameStore } from '@/lib/store/gameStore'

const TYPE_STYLE = {
  info: 'text-gray-600 border-gray-200',
  warning: 'text-orange-700 border-orange-200 bg-orange-50',
  danger: 'text-red-700 border-red-200 bg-red-50',
  success: 'text-green-700 border-green-200 bg-green-50',
}

export default function EventLog() {
  const { log } = useGameStore()
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [log.length])

  const recent = log.slice(-30).reverse()

  return (
    <div className="bg-white/80 rounded-xl p-3 shadow-sm border border-amber-200">
      <h3 className="font-bold text-amber-900 mb-2 text-sm">📖 Diario di Bostiano</h3>
      <div className="h-40 overflow-y-auto space-y-1 text-xs pr-1">
        {recent.length === 0 && (
          <p className="text-gray-400 italic">Buongiorno, Bostiano. Oggi è il primo giorno di primavera a Colle San Paolo...</p>
        )}
        {recent.map((entry, i) => (
          <div key={i} className={`border-l-2 pl-2 py-0.5 rounded-r ${TYPE_STYLE[entry.type]}`}>
            <span className="opacity-50 mr-1">G{entry.day}/{entry.season[0].toUpperCase()} A{entry.year}</span>
            {entry.message}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
