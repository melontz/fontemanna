'use client'
import { create } from 'zustand'
import { GameState } from '../data/types'
import { createInitialFlock } from '../data/sheep'
import { advanceDay, processEventChoice, repairFence } from '../engine/gameEngine'

export const BATCH = 5 // kg per lotto

export const BATCH_MILK: Record<string, number> = {
  yogurt: BATCH * 0.9,
  formaggioFresco: BATCH * 1.2,
  primoSale: BATCH * 1.5,
  ricotta: BATCH * 0.5,
}

export const CLIENT_MULT: Record<string, number> = {
  perugia: 1.0,
  spoleto: 1.3,
  gas: 1.1,
}

const INITIAL_STATE: GameState = {
  day: 1, season: 'spring', year: 1, totalDays: 1,
  money: 3200,
  trumpCostIndex: 1.0,
  energyCostPerDay: 18, fuelCostPerDay: 12, strawCostPerDay: 8,
  flock: createInitialFlock(),
  inventory: { milk: 0, yogurt: 0, formaggioFresco: 0, primoSale: 0, ricotta: 0 },
  milkQualityModifier: 1.0,
  prices: { yogurt: 4.5, formaggioFresco: 6.0, primoSale: 8.0, ricotta: 3.5 },
  reputation: { perugia: 70, spoleto: 60, gas: 75 },
  compliance: { asl: 90, nas: 85, forestale: 80, regione: 85, lastInspection: null, violations: [], finesPending: 0 },
  weather: { current: 'sunny', forecast: 'cloudy', daysUntilChange: 3 },
  fenceIntegrity: 85,
  activeEvent: null,
  giudittaCallsAvailable: 2, giudittaAvailableDay: false,
  log: [],
  gameOver: false, gameOverReason: '', won: false,
  phase: 'title',
  speed: 'normal',
  activePanel: null,
  toast: null,
}

interface Store extends GameState {
  startGame: () => void
  tick: () => void
  resolveEvent: (choiceIndex: number) => void
  produceBatch: (product: 'yogurt' | 'formaggioFresco' | 'primoSale' | 'ricotta') => void
  sellAll: (client: 'perugia' | 'spoleto' | 'gas') => void
  fixFence: () => void
  setSpeed: (s: GameState['speed']) => void
  setPanel: (p: GameState['activePanel']) => void
  clearToast: () => void
  saveGame: () => void
  loadGame: () => boolean
}

export const useGameStore = create<Store>((set, get) => ({
  ...INITIAL_STATE,

  startGame: () => set({ ...INITIAL_STATE, phase: 'playing', speed: 'normal', flock: createInitialFlock() }),

  tick: () => {
    const s = get()
    if (s.activeEvent || s.gameOver || s.won) return
    set(advanceDay(s) as Partial<Store>)
  },

  resolveEvent: (i) => {
    const patch = processEventChoice(get(), i)
    set(patch as Partial<Store>)
  },

  produceBatch: (product) => {
    const s = get()
    const milkCost = BATCH_MILK[product]
    if (s.inventory.milk < milkCost) {
      set({ toast: { message: `Latte insufficiente — servono ${milkCost.toFixed(1)}L`, type: 'warning' } })
      return
    }
    set({
      inventory: {
        ...s.inventory,
        milk: Math.round((s.inventory.milk - milkCost) * 10) / 10,
        [product]: s.inventory[product] + BATCH,
      },
      log: [...s.log, {
        day: s.day, season: s.season, year: s.year,
        message: `Prodotto 1 lotto di ${product} (${BATCH}kg, usati ${milkCost.toFixed(1)}L)`,
        type: 'success',
      }],
    })
  },

  sellAll: (client) => {
    const s = get()
    const inv = s.inventory
    const mult = CLIENT_MULT[client]
    const revenue = Math.round(
      (inv.yogurt * s.prices.yogurt + inv.formaggioFresco * s.prices.formaggioFresco +
        inv.primoSale * s.prices.primoSale + inv.ricotta * s.prices.ricotta) * mult
    )
    if (revenue === 0) {
      set({ toast: { message: 'Nessun prodotto da consegnare', type: 'warning' } })
      return
    }
    const repGain = revenue > 400 ? 8 : revenue > 150 ? 4 : 1
    const rep = { ...s.reputation }
    rep[client] = Math.min(100, rep[client] + repGain)
    set({
      money: s.money + revenue,
      inventory: { milk: inv.milk, yogurt: 0, formaggioFresco: 0, primoSale: 0, ricotta: 0 },
      reputation: rep,
      log: [...s.log, {
        day: s.day, season: s.season, year: s.year,
        message: `Consegnato tutto a ${client} — incassati €${revenue}`,
        type: 'success',
      }],
      toast: { message: `+€${revenue} da ${client}!`, type: 'success' },
    })
  },

  fixFence: () => {
    const s = get()
    if (s.money < 80) { set({ toast: { message: 'Servono €80 per riparare la recinzione', type: 'warning' } }); return }
    const patch = repairFence(s)
    set(patch as Partial<Store>)
  },

  setSpeed: (speed) => set({ speed }),
  setPanel: (activePanel) => set({ activePanel }),
  clearToast: () => set({ toast: null }),

  saveGame: () => localStorage.setItem('fontemanna_save', JSON.stringify(get())),

  loadGame: () => {
    try {
      const saved = JSON.parse(localStorage.getItem('fontemanna_save') ?? '')
      set({ ...saved, phase: 'playing', speed: 'normal' })
      return true
    } catch { return false }
  },
}))
