'use client'
import { useRef, useEffect } from 'react'
import { useGameStore } from '@/lib/store/gameStore'

const TYPE_STYLE = {
  info: 'border-gray-200 text-gray-500',
  warning: 'border-orange-300 text-orange-700 bg-orange-50',
  danger: 'border-red-300 text-red-700 bg-red-50',
  success: 'border-green-300 text-green-700 bg-green-50',
}

export default function EventLog() {
  const { log } = useGameStore()
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [log.length])

  const recent = [...log].reverse().slice(0, 40)

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="text-xs font-bold text-amber-700 mb-2 px-1">📖 Diario di Bostiano</div>
      <div className="flex-1 overflow-y-auto space-y-1 text-xs">
        {recent.length === 0 && (
          <p className="text-gray-400 italic px-1">Buongiorno Bostiano. Oggi è il primo giorno di primavera a Colle San Paolo...</p>
        )}
        {recent.map((entry, i) => (
          <div key={i} className={`border-l-2 pl-2 py-0.5 rounded-r ${TYPE_STYLE[entry.type]}`}>
            <span className="opacity-40 mr-1">G{entry.day}</span>
            {entry.message}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
