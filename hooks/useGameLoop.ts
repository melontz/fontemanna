'use client'
import { useEffect, useRef } from 'react'
import { useGameStore } from '@/lib/store/gameStore'

const SPEED_MS: Record<string, number> = {
  slow: 8000,
  normal: 4000,
  fast: 1500,
  paused: 0,
}

export function useGameLoop() {
  const tick = useGameStore(s => s.tick)
  const speed = useGameStore(s => s.speed)
  const activeEvent = useGameStore(s => s.activeEvent)
  const gameOver = useGameStore(s => s.gameOver)
  const won = useGameStore(s => s.won)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)

    const blocked = speed === 'paused' || !!activeEvent || gameOver || won
    if (blocked) return

    const ms = SPEED_MS[speed]
    if (!ms) return

    intervalRef.current = setInterval(() => {
      tick()
    }, ms)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [speed, activeEvent, gameOver, won, tick])
}
