'use client'
import { useEffect } from 'react'
import { useGameStore } from '@/lib/store/gameStore'

const COLORS = {
  info: 'bg-blue-700',
  warning: 'bg-amber-600',
  success: 'bg-green-700',
  danger: 'bg-red-700',
}

export default function Toast() {
  const { toast, clearToast } = useGameStore()

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(clearToast, 3500)
    return () => clearTimeout(t)
  }, [toast, clearToast])

  if (!toast) return null

  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl text-white text-sm font-semibold shadow-xl ${COLORS[toast.type]} animate-in`}>
      {toast.message}
    </div>
  )
}
