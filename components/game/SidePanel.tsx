'use client'
import { useState } from 'react'
import { useGameStore } from '@/lib/store/gameStore'

function Stepper({ value, min = 0, max, onChange }: { value: number; min?: number; max: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 active:scale-90 font-bold text-gray-700 transition-all disabled:opacity-30 disabled:cursor-not-allowed text-lg leading-none"
      >−</button>
      <span className="w-10 text-center font-bold text-sm">{value}</span>
      <button
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 active:scale-90 font-bold text-gray-700 transition-all disabled:opacity-30 disabled:cursor-not-allowed text-lg leading-none"
      >+</button>
    </div>
  )
}

function Bar({ value, max = 100, color }: { value: number; max?: number; color: string }) {
  return (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div className={`h-2 rounded-full transition-all duration-700 ${color}`} style={{ width: `${Math.min(100, (value / max) * 100)}%` }} />
    </div>
  )
}

// ── FLOCK PANEL ──────────────────────────────────────────────────────────
function FlockPanel() {
  const { flock, giudittaAvailableDay } = useGameStore()
  const active = flock.filter(s => s.mood !== 'missing')
  const missing = flock.filter(s => s.mood === 'missing')

  return (
    <div>
      <h3 className="font-bold text-amber-900 mb-3">🐑 Il Gregge</h3>
      <div className="flex gap-2 mb-3 text-sm">
        <div className="flex-1 bg-green-50 border border-green-200 rounded-xl p-2 text-center">
          <div className="text-2xl font-black text-green-700">{active.length}</div>
          <div className="text-xs text-gray-500">presenti</div>
        </div>
        <div className="flex-1 bg-red-50 border border-red-200 rounded-xl p-2 text-center">
          <div className="text-2xl font-black text-red-600">{missing.length}</div>
          <div className="text-xs text-gray-500">mancanti</div>
        </div>
      </div>

      {giudittaAvailableDay && (
        <div className="bg-teal-50 border border-teal-300 rounded-xl px-3 py-2 mb-3 text-xs text-teal-800 font-medium">
          🩺 Giuditta è disponibile oggi (mercoledì) — chiama se hai pecore ammalate
        </div>
      )}

      <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
        {active.map(s => (
          <div key={s.id} className="flex items-center gap-2 bg-white border border-gray-100 rounded-xl px-3 py-1.5 shadow-sm">
            <span className="text-base">{s.isErminia ? '👑' : s.mood === 'sick' ? '🤒' : s.mood === 'nervous' ? '😟' : '🐑'}</span>
            <span className="text-xs font-semibold text-gray-800 flex-1">{s.name}</span>
            <div className="text-right">
              <div className="text-xs text-blue-600 font-medium">{s.milkProduction.toFixed(1)}L/g</div>
              <div className="w-16">
                <Bar value={s.health} color={s.health > 60 ? 'bg-green-400' : s.health > 30 ? 'bg-yellow-400' : 'bg-red-400'} />
              </div>
            </div>
          </div>
        ))}
        {missing.length > 0 && (
          <div className="mt-2 text-xs text-red-600 font-semibold px-1">
            Mancanti: {missing.map(s => s.name).join(', ')}
          </div>
        )}
      </div>
    </div>
  )
}

// ── PRODUCTION PANEL ─────────────────────────────────────────────────────
function ProductionPanelContent() {
  const { inventory, produce, milkQualityModifier } = useGameStore()
  const [amounts, setAmounts] = useState({ yogurt: 0, formaggioFresco: 0, primoSale: 0, ricotta: 0 })

  const milkNeeded = amounts.yogurt * 0.9 + amounts.formaggioFresco * 1.2 + amounts.primoSale * 1.5 + amounts.ricotta * 0.5
  const canProduce = milkNeeded > 0 && milkNeeded <= inventory.milk

  function set(key: keyof typeof amounts, val: number) {
    setAmounts(prev => ({ ...prev, [key]: val }))
  }

  const products = [
    { key: 'yogurt' as const, label: 'Yogurt di pecora', ratio: 0.9, icon: '🥛', per: 'kg' },
    { key: 'formaggioFresco' as const, label: 'Formaggio fresco', ratio: 1.2, icon: '🧀', per: 'kg' },
    { key: 'primoSale' as const, label: 'Primo sale', ratio: 1.5, icon: '🧀', per: 'kg' },
    { key: 'ricotta' as const, label: 'Ricotta', ratio: 0.5, icon: '🍶', per: 'kg' },
  ]

  const maxForProduct = (ratio: number) => Math.floor(inventory.milk / ratio)

  return (
    <div>
      <h3 className="font-bold text-amber-900 mb-2">🏭 Caseificio Fontemanna</h3>

      <div className="flex justify-between text-sm mb-3 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2">
        <span className="text-gray-600">Latte disponibile</span>
        <span className="font-black text-blue-700">{inventory.milk.toFixed(1)} L</span>
      </div>

      {milkQualityModifier < 0.95 && (
        <div className="text-xs bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-xl px-3 py-2 mb-2">
          ⚠️ Erbe amare — qualità {Math.round(milkQualityModifier * 100)}%
        </div>
      )}

      <div className="space-y-3">
        {products.map(({ key, label, ratio, icon }) => (
          <div key={key} className="bg-white border border-gray-100 rounded-xl px-3 py-2 shadow-sm">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-sm font-semibold text-gray-700">{icon} {label}</span>
              <span className="text-xs text-gray-400">{ratio}L/kg</span>
            </div>
            <div className="flex items-center justify-between">
              <Stepper value={amounts[key]} max={maxForProduct(ratio)} onChange={v => set(key, v)} />
              <div className="text-right text-xs text-gray-500">
                <div>in magaz.: <strong>{inventory[key]}kg</strong></div>
                <div>usa: <span className={amounts[key] * ratio > inventory.milk ? 'text-red-500' : 'text-blue-600'}>{(amounts[key] * ratio).toFixed(1)}L</span></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 flex justify-between text-sm font-medium text-gray-600">
        <span>Latte usato</span>
        <span className={milkNeeded > inventory.milk ? 'text-red-500 font-bold' : 'text-green-700 font-bold'}>{milkNeeded.toFixed(1)} L</span>
      </div>

      <button
        onClick={() => { produce(amounts.yogurt, amounts.formaggioFresco, amounts.primoSale, amounts.ricotta); setAmounts({ yogurt: 0, formaggioFresco: 0, primoSale: 0, ricotta: 0 }) }}
        disabled={!canProduce}
        className="mt-3 w-full py-3 rounded-xl font-bold text-white bg-amber-600 hover:bg-amber-700 active:scale-95 transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
      >
        🧀 Avvia lavorazione
      </button>
    </div>
  )
}

// ── MARKET PANEL ─────────────────────────────────────────────────────────
const CLIENTS = [
  { key: 'perugia' as const, label: 'Mercato Perugia', icon: '🏪', mult: 1.0 },
  { key: 'spoleto' as const, label: 'Rist. Spoleto ⭐', icon: '🍽️', mult: 1.3 },
  { key: 'gas' as const, label: 'GAS Locale 🌿', icon: '🛒', mult: 1.1 },
]

function MarketPanelContent() {
  const { inventory, prices, reputation, sell } = useGameStore()
  const [client, setClient] = useState<'perugia' | 'spoleto' | 'gas'>('perugia')
  const [amounts, setAmounts] = useState({ yogurt: 0, formaggioFresco: 0, primoSale: 0, ricotta: 0 })

  const mult = CLIENTS.find(c => c.key === client)?.mult ?? 1
  const total = (amounts.yogurt * prices.yogurt + amounts.formaggioFresco * prices.formaggioFresco + amounts.primoSale * prices.primoSale + amounts.ricotta * prices.ricotta) * mult
  const canSell = total > 0 && amounts.yogurt <= inventory.yogurt && amounts.formaggioFresco <= inventory.formaggioFresco && amounts.primoSale <= inventory.primoSale && amounts.ricotta <= inventory.ricotta

  function set(key: keyof typeof amounts, val: number) {
    setAmounts(prev => ({ ...prev, [key]: val }))
  }

  const products = [
    { key: 'yogurt' as const, label: 'Yogurt', icon: '🥛', price: prices.yogurt },
    { key: 'formaggioFresco' as const, label: 'F. Fresco', icon: '🧀', price: prices.formaggioFresco },
    { key: 'primoSale' as const, label: 'Primo Sale', icon: '🧀', price: prices.primoSale },
    { key: 'ricotta' as const, label: 'Ricotta', icon: '🍶', price: prices.ricotta },
  ]

  return (
    <div>
      <h3 className="font-bold text-amber-900 mb-2">🛒 Vendita prodotti</h3>

      {/* Scorte rapide */}
      <div className="grid grid-cols-4 gap-1 mb-3">
        {products.map(({ key, label, icon }) => (
          <div key={key} className="bg-amber-50 border border-amber-100 rounded-xl p-1.5 text-center">
            <div>{icon}</div>
            <div className="text-xs font-black text-amber-900">{inventory[key]}<span className="font-normal text-gray-400">kg</span></div>
            <div className="text-xs text-gray-500 leading-none">{label}</div>
          </div>
        ))}
      </div>

      {/* Cliente */}
      <div className="flex gap-1.5 mb-3">
        {CLIENTS.map(c => (
          <button
            key={c.key}
            onClick={() => setClient(c.key)}
            className={`flex-1 py-2 rounded-xl border text-xs font-semibold transition-all active:scale-95 ${client === c.key ? 'border-amber-500 bg-amber-50 text-amber-900' : 'border-gray-200 text-gray-600 hover:border-amber-300'}`}
          >
            <div>{c.icon}</div>
            <div className="truncate px-1">{c.label.split(' ')[0]}{' '}{c.label.split(' ')[1]}</div>
            <div className={`text-xs font-bold mt-0.5 ${reputation[c.key] > 60 ? 'text-green-600' : reputation[c.key] > 30 ? 'text-yellow-600' : 'text-red-500'}`}>
              ★{reputation[c.key]}
            </div>
          </button>
        ))}
      </div>

      {/* Quantità */}
      <div className="space-y-2">
        {products.map(({ key, label, icon, price }) => (
          <div key={key} className="flex items-center gap-2 bg-white border border-gray-100 rounded-xl px-3 py-1.5 shadow-sm">
            <span className="text-base">{icon}</span>
            <span className="text-xs font-medium text-gray-700 flex-1">{label}</span>
            <div className="text-xs text-green-600 font-semibold mr-1">€{(price * mult).toFixed(2)}</div>
            <Stepper value={amounts[key]} max={inventory[key]} onChange={v => set(key, v)} />
          </div>
        ))}
      </div>

      <div className="flex justify-between mt-3 font-semibold text-sm">
        <span className="text-gray-600">Totale</span>
        <span className="text-green-700 font-black text-lg">€{total.toFixed(2)}</span>
      </div>

      <button
        onClick={() => { sell(client, amounts.yogurt, amounts.formaggioFresco, amounts.primoSale, amounts.ricotta); setAmounts({ yogurt: 0, formaggioFresco: 0, primoSale: 0, ricotta: 0 }) }}
        disabled={!canSell}
        className="mt-2 w-full py-3 rounded-xl font-bold text-white bg-green-600 hover:bg-green-700 active:scale-95 transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
      >
        💰 Vendi
      </button>
    </div>
  )
}

// ── COMPLIANCE PANEL ──────────────────────────────────────────────────────
function CompliancePanel() {
  const { compliance, reputation } = useGameStore()
  const bodies = [
    { key: 'asl' as const, label: 'ASL Perugia', icon: '🏥', desc: 'Igiene stalla, temperature, etichettatura' },
    { key: 'nas' as const, label: 'NAS', icon: '🚔', desc: 'Tracciabilità latte, lotti, conservanti' },
    { key: 'forestale' as const, label: 'Forestale', icon: '🌲', desc: 'Recinzioni, cinghiali, bosco' },
    { key: 'regione' as const, label: 'Regione Umbria', icon: '🏛️', desc: 'PAC, registro carico/scarico' },
  ]
  return (
    <div>
      <h3 className="font-bold text-amber-900 mb-3">📋 Conformità normativa</h3>
      <div className="space-y-3">
        {bodies.map(({ key, label, icon, desc }) => (
          <div key={key} className="bg-white border border-gray-100 rounded-xl px-3 py-2.5 shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-sm text-gray-800">{icon} {label}</span>
              <span className={`text-sm font-black ${compliance[key] > 70 ? 'text-green-600' : compliance[key] > 40 ? 'text-yellow-600' : 'text-red-600 animate-pulse'}`}>{compliance[key]}</span>
            </div>
            <Bar value={compliance[key]} color={compliance[key] > 70 ? 'bg-blue-400' : compliance[key] > 40 ? 'bg-yellow-400' : 'bg-red-400'} />
            <div className="text-xs text-gray-400 mt-1">{desc}</div>
          </div>
        ))}
      </div>
      {compliance.finesPending > 0 && (
        <div className="mt-3 bg-red-50 border border-red-200 rounded-xl px-3 py-2 text-sm text-red-700 font-semibold">
          ⚠️ Multe pendenti: €{compliance.finesPending}
        </div>
      )}
      <div className="mt-3">
        <div className="text-xs font-semibold text-gray-600 mb-2">Reputazione clienti</div>
        {[
          { label: 'Mercato Perugia', val: reputation.perugia },
          { label: 'Rist. Spoleto', val: reputation.spoleto },
          { label: 'GAS Locale', val: reputation.gas },
        ].map(({ label, val }) => (
          <div key={label} className="mb-1.5">
            <div className="flex justify-between text-xs mb-0.5"><span>{label}</span><span>{val}</span></div>
            <Bar value={val} color={val > 60 ? 'bg-green-400' : val > 30 ? 'bg-yellow-400' : 'bg-red-400'} />
          </div>
        ))}
      </div>
    </div>
  )
}

// ── MAIN SIDE PANEL ───────────────────────────────────────────────────────
const NAV = [
  { key: 'flock', icon: '🐑', label: 'Gregge' },
  { key: 'production', icon: '🧀', label: 'Caseificio' },
  { key: 'market', icon: '🛒', label: 'Mercato' },
  { key: 'compliance', icon: '📋', label: 'Normative' },
] as const

export default function SidePanel() {
  const { activePanel, setPanel } = useGameStore()
  const current = activePanel ?? 'flock'

  return (
    <div className="flex flex-col h-full bg-white/80 rounded-2xl shadow-sm border border-amber-200 overflow-hidden">
      {/* Tab nav */}
      <div className="flex border-b border-amber-100">
        {NAV.map(n => (
          <button
            key={n.key}
            onClick={() => setPanel(n.key)}
            className={`flex-1 py-2 text-xs font-semibold transition-all ${current === n.key ? 'bg-amber-50 text-amber-900 border-b-2 border-amber-500' : 'text-gray-500 hover:text-amber-700'}`}
          >
            <div className="text-base">{n.icon}</div>
            <div>{n.label}</div>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3">
        {current === 'flock' && <FlockPanel />}
        {current === 'production' && <ProductionPanelContent />}
        {current === 'market' && <MarketPanelContent />}
        {current === 'compliance' && <CompliancePanel />}
      </div>
    </div>
  )
}
