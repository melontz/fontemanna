import { GameState, Season, Weather, LogEntry } from '../data/types'
import { getSeasonalEvents } from '../data/events'

const SEASONS: Season[] = ['spring', 'summer', 'autumn', 'winter']
const DAYS_PER_SEASON = 30

export function getSeasonIndex(season: Season) {
  return SEASONS.indexOf(season)
}

export function nextSeason(season: Season): Season {
  const idx = getSeasonIndex(season)
  return SEASONS[(idx + 1) % 4]
}

export function isWednesday(totalDays: number): boolean {
  return totalDays % 7 === 3
}

export function getDailyMilk(state: GameState): number {
  const activeSheep = state.flock.filter(s => s.mood !== 'missing' && s.health > 30)
  const raw = activeSheep.reduce((sum, s) => sum + s.milkProduction, 0)
  const weatherMod = state.weather.current === 'hot' ? 0.7
    : state.weather.current === 'stormy' ? 0.8
    : state.weather.current === 'snowy' ? 0.75
    : 1.0
  return Math.round(raw * weatherMod * state.milkQualityModifier * 10) / 10
}

export function getDailyCosts(state: GameState): number {
  const idx = state.trumpCostIndex
  return Math.round(
    (state.energyCostPerDay + state.fuelCostPerDay + state.strawCostPerDay) * idx
  )
}

export function advanceDay(state: GameState): Partial<GameState> {
  const newDay = state.day + 1
  const newTotal = state.totalDays + 1
  const giudittaDay = isWednesday(newTotal)

  const milk = getDailyMilk(state)
  const costs = getDailyCosts(state)

  const newInventory = { ...state.inventory, milk: state.inventory.milk + milk }

  // Fence degradation
  const fenceDeg = state.weather.current === 'stormy' ? 3 : 1
  const newFence = Math.max(0, state.fenceIntegrity - fenceDeg)

  // Trump index random walk (slow)
  const trumpDelta = (Math.random() - 0.45) * 0.04
  const newTrump = Math.min(2.5, Math.max(1.0, state.trumpCostIndex + trumpDelta))

  // Random event trigger (20% chance per day if no active event)
  let activeEvent = state.activeEvent
  if (!activeEvent && Math.random() < 0.20) {
    const pool = getSeasonalEvents(state.season)
    activeEvent = pool[Math.floor(Math.random() * pool.length)]
  }

  // Season progression
  let season = state.season
  let year = state.year
  let day = newDay
  if (newDay > DAYS_PER_SEASON) {
    season = nextSeason(state.season)
    day = 1
    if (season === 'spring') year = state.year + 1
  }

  const log: LogEntry = {
    day: state.day,
    season: state.season,
    year: state.year,
    message: `Giorno ${state.day}: latte raccolto ${milk}L, spese ${costs}€. Indice costi: ${newTrump.toFixed(2)}x`,
    type: costs > state.money ? 'warning' : 'info',
  }

  const gameOver = state.money - costs < -500
  const won = year > 3

  return {
    day,
    season,
    year,
    totalDays: newTotal,
    money: state.money - costs,
    trumpCostIndex: newTrump,
    inventory: newInventory,
    fenceIntegrity: newFence,
    activeEvent: activeEvent ?? null,
    giudittaAvailableDay: giudittaDay,
    log: [...state.log, log],
    gameOver,
    won,
    gameOverReason: gameOver ? 'Fontemanna è in rosso. Le banche hanno rilevato il caseificio.' : '',
    phase: activeEvent ? 'event' : state.phase,
  }
}

export function processEventChoice(state: GameState, choiceIndex: number): Partial<GameState> {
  const event = state.activeEvent
  if (!event) return {}

  const choice = event.choices[choiceIndex]
  const e = choice.effect

  const flock = [...state.flock]
  if (e.sheepLost && e.sheepLost > 0) {
    for (let i = 0; i < e.sheepLost; i++) {
      const target = flock.find(s => s.mood !== 'missing' && !s.isErminia)
      if (target) target.mood = 'missing'
    }
  }
  if (e.flock) {
    flock.forEach(s => { if (s.mood !== 'missing') s.mood = e.flock! })
  }

  const log: LogEntry = {
    day: state.day,
    season: state.season,
    year: state.year,
    message: e.logMessage ?? `Evento ${event.title} risolto.`,
    type: (e.money ?? 0) < 0 || (e.sheepLost ?? 0) > 0 ? 'warning' : 'success',
  }

  return {
    money: state.money + (e.money ?? 0) - (choice.cost ?? 0),
    flock,
    milkQualityModifier: e.milkQuality ?? state.milkQualityModifier,
    compliance: {
      ...state.compliance,
      asl: Math.min(100, Math.max(0, state.compliance.asl + (e.complianceASL ?? 0))),
      nas: Math.min(100, Math.max(0, state.compliance.nas + (e.complianceNAS ?? 0))),
      forestale: Math.min(100, Math.max(0, state.compliance.forestale + (e.complianceForestale ?? 0))),
      regione: Math.min(100, Math.max(0, state.compliance.regione + (e.complianceRegione ?? 0))),
      finesPending: state.compliance.finesPending + (e.money && e.money < 0 ? Math.abs(e.money) : 0),
    },
    reputation: {
      perugia: Math.min(100, Math.max(0, state.reputation.perugia + (e.reputationPG ?? 0))),
      spoleto: Math.min(100, Math.max(0, state.reputation.spoleto + (e.reputationSP ?? 0))),
      gas: Math.min(100, Math.max(0, state.reputation.gas + (e.reputationGAS ?? 0))),
    },
    activeEvent: null,
    phase: 'playing',
    log: [...state.log, log],
  }
}

export function produceProducts(
  state: GameState,
  yogurt: number,
  formaggioFresco: number,
  primoSale: number,
  ricotta: number
): Partial<GameState> {
  const milkNeeded = yogurt * 0.9 + formaggioFresco * 1.2 + primoSale * 1.5 + ricotta * 0.5
  if (milkNeeded > state.inventory.milk) return {}

  const log: LogEntry = {
    day: state.day,
    season: state.season,
    year: state.year,
    message: `Produzione: ${yogurt}kg yogurt, ${formaggioFresco}kg formaggio fresco, ${primoSale}kg primo sale, ${ricotta}kg ricotta`,
    type: 'success',
  }

  return {
    inventory: {
      milk: Math.round((state.inventory.milk - milkNeeded) * 10) / 10,
      yogurt: state.inventory.yogurt + yogurt,
      formaggioFresco: state.inventory.formaggioFresco + formaggioFresco,
      primoSale: state.inventory.primoSale + primoSale,
      ricotta: state.inventory.ricotta + ricotta,
    },
    log: [...state.log, log],
  }
}

export function sellProducts(
  state: GameState,
  client: 'perugia' | 'spoleto' | 'gas',
  yogurt: number,
  formaggioFresco: number,
  primoSale: number,
  ricotta: number
): Partial<GameState> {
  const inv = state.inventory
  const p = state.prices
  const revenue = yogurt * p.yogurt + formaggioFresco * p.formaggioFresco + primoSale * p.primoSale + ricotta * p.ricotta

  const repGain = revenue > 300 ? 5 : revenue > 100 ? 2 : 0
  const rep = { ...state.reputation }
  rep[client] = Math.min(100, rep[client] + repGain)

  const log: LogEntry = {
    day: state.day,
    season: state.season,
    year: state.year,
    message: `Vendita a ${client}: incassati €${revenue.toFixed(0)}`,
    type: 'success',
  }

  return {
    money: state.money + revenue,
    inventory: {
      ...inv,
      yogurt: inv.yogurt - yogurt,
      formaggioFresco: inv.formaggioFresco - formaggioFresco,
      primoSale: inv.primoSale - primoSale,
      ricotta: inv.ricotta - ricotta,
    },
    reputation: rep,
    log: [...state.log, log],
  }
}

export function repairFence(state: GameState): Partial<GameState> {
  const cost = 80
  if (state.money < cost) return {}
  const log: LogEntry = {
    day: state.day, season: state.season, year: state.year,
    message: 'Recinzione riparata. +40 integrità.',
    type: 'success',
  }
  return { money: state.money - cost, fenceIntegrity: Math.min(100, state.fenceIntegrity + 40), log: [...state.log, log] }
}
