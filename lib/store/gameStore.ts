'use client'
import { create } from 'zustand'
import { GameState } from '../data/types'
import { createInitialFlock } from '../data/sheep'
import {
  advanceDay, processEventChoice, produceProducts, sellProducts, repairFence
} from '../engine/gameEngine'

const INITIAL_STATE: GameState = {
  day: 1,
  season: 'spring',
  year: 1,
  totalDays: 1,
  money: 3200,
  trumpCostIndex: 1.0,
  energyCostPerDay: 18,
  fuelCostPerDay: 12,
  strawCostPerDay: 8,
  flock: createInitialFlock(),
  inventory: { milk: 0, yogurt: 0, formaggioFresco: 0, primoSale: 0, ricotta: 0 },
  milkQualityModifier: 1.0,
  prices: { yogurt: 4.5, formaggioFresco: 6.0, primoSale: 8.0, ricotta: 3.5 },
  reputation: { perugia: 70, spoleto: 60, gas: 75 },
  compliance: { asl: 90, nas: 85, forestale: 80, regione: 85, lastInspection: null, violations: [], finesPending: 0 },
  weather: { current: 'sunny', forecast: 'cloudy', daysUntilChange: 3 },
  fenceIntegrity: 85,
  activeEvent: null,
  giudittaCallsAvailable: 2,
  giudittaAvailableDay: false,
  log: [],
  gameOver: false,
  gameOverReason: '',
  won: false,
  phase: 'title',
  speed: 'normal',
  activePanel: null,
  toast: null,
}

interface Store extends GameState {
  startGame: () => void
  tick: () => void
  resolveEvent: (choiceIndex: number) => void
  produce: (y: number, ff: number, ps: number, r: number) => void
  sell: (client: 'perugia' | 'spoleto' | 'gas', y: number, ff: number, ps: number, r: number) => void
  fixFence: () => void
  setSpeed: (s: GameState['speed']) => void
  setPanel: (p: GameState['activePanel']) => void
  clearToast: () => void
  saveGame: () => void
  loadGame: () => boolean
}

export const useGameStore = create<Store>((set, get) => ({
  ...INITIAL_STATE,

  startGame: () => {
    set({ ...INITIAL_STATE, phase: 'playing', speed: 'normal', flock: createInitialFlock() })
  },

  tick: () => {
    const state = get()
    if (state.activeEvent || state.gameOver || state.won) return
    const patch = advanceDay(state)
    set(patch as Partial<Store>)
  },

  resolveEvent: (choiceIndex) => {
    const patch = processEventChoice(get(), choiceIndex)
    set({ ...(patch as Partial<Store>), speed: get().speed === 'paused' ? 'normal' : get().speed })
  },

  produce: (y, ff, ps, r) => {
    const patch = produceProducts(get(), y, ff, ps, r)
    if (Object.keys(patch).length === 0) {
      set({ toast: { message: 'Latte insufficiente per questa produzione', type: 'warning' } })
      return
    }
    set(patch as Partial<Store>)
  },

  sell: (client, y, ff, ps, r) => {
    const patch = sellProducts(get(), client, y, ff, ps, r)
    set(patch as Partial<Store>)
  },

  fixFence: () => {
    const state = get()
    if (state.money < 80) {
      set({ toast: { message: 'Non hai abbastanza soldi per riparare (€80)', type: 'warning' } })
      return
    }
    const patch = repairFence(state)
    set(patch as Partial<Store>)
  },

  setSpeed: (speed) => set({ speed }),

  setPanel: (activePanel) => set({ activePanel }),

  clearToast: () => set({ toast: null }),

  saveGame: () => {
    localStorage.setItem('fontemanna_save', JSON.stringify(get()))
  },

  loadGame: () => {
    const raw = localStorage.getItem('fontemanna_save')
    if (!raw) return false
    try {
      const saved = JSON.parse(raw) as GameState
      set({ ...saved, phase: 'playing', speed: 'normal' })
      return true
    } catch {
      return false
    }
  },
}))
