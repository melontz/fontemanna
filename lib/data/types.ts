export type Season = 'spring' | 'summer' | 'autumn' | 'winter'
export type Weather = 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'snowy' | 'hot'
export type SheepMood = 'happy' | 'nervous' | 'sick' | 'lost' | 'missing'

export interface Sheep {
  id: string
  name: string
  health: number       // 0-100
  milkProduction: number // litri/giorno 0-3
  mood: SheepMood
  age: number          // anni
  isErminia?: boolean
}

export interface Inventory {
  milk: number           // litri
  yogurt: number         // kg
  formaggioFresco: number
  primoSale: number
  ricotta: number
}

export interface ComplianceStatus {
  asl: number           // 0-100, scende con violazioni
  nas: number
  forestale: number
  regione: number
  lastInspection: { body: string; day: number; passed: boolean } | null
  violations: string[]
  finesPending: number
}

export interface ClientReputation {
  perugia: number   // 0-100
  spoleto: number
  gas: number
}

export interface WeatherState {
  current: Weather
  forecast: Weather   // domani
  daysUntilChange: number
}

export interface GameEvent {
  id: string
  type: 'wolf' | 'boar' | 'escape' | 'weather' | 'inspection' | 'market' | 'cost' | 'vet' | 'neighbor' | 'bitterness'
  title: string
  description: string
  choices: EventChoice[]
  resolved: boolean
}

export interface EventChoice {
  label: string
  effect: Partial<EventEffect>
  cost?: number
}

export interface EventEffect {
  money: number
  sheepLost: number
  milkQuality: number  // moltiplicatore 0-1.5
  complianceASL: number
  complianceNAS: number
  complianceForestale: number
  complianceRegione: number
  reputationPG: number
  reputationSP: number
  reputationGAS: number
  flock: SheepMood
  logMessage: string
}

export interface LogEntry {
  day: number
  season: Season
  year: number
  message: string
  type: 'info' | 'warning' | 'danger' | 'success'
}

export interface GameState {
  // Tempo
  day: number
  season: Season
  year: number
  totalDays: number

  // Economia
  money: number
  trumpCostIndex: number  // 1.0 = base, sale fino a 2.5
  energyCostPerDay: number
  fuelCostPerDay: number
  strawCostPerDay: number

  // Gregge
  flock: Sheep[]

  // Produzione
  inventory: Inventory
  milkQualityModifier: number  // erbe amare etc.

  // Mercato
  prices: {
    yogurt: number
    formaggioFresco: number
    primoSale: number
    ricotta: number
  }

  // Reputazione clienti
  reputation: ClientReputation

  // Normative
  compliance: ComplianceStatus

  // Meteo
  weather: WeatherState

  // Recinzione
  fenceIntegrity: number  // 0-100

  // Eventi attivi
  activeEvent: GameEvent | null

  // Giuditta
  giudittaCallsAvailable: number
  giudittaAvailableDay: boolean  // true se è mercoledì

  // Log
  log: LogEntry[]

  // Stato partita
  gameOver: boolean
  gameOverReason: string
  won: boolean
  phase: 'title' | 'playing' | 'event' | 'market' | 'gameover'
}
