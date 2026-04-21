'use client'
import { useState } from 'react'
import { useGameStore, BATCH, BATCH_MILK, CLIENT_MULT } from '@/lib/store/gameStore'

// ── Serbatoio latte visivo ─────────────────────────────────────────────────
function MilkTank({ liters, max }: { liters: number; max: number }) {
  const pct = Math.min(1, liters / max)
  const color = pct > 0.6 ? '#3b82f6' : pct > 0.3 ? '#f59e0b' : '#ef4444'
  const h = 90
  const fillH = Math.round(pct * h)

  return (
    <div className="flex flex-col items-center gap-1 select-none">
      <svg width="52" height="110" viewBox="0 0 52 110">
        {/* corpo tank */}
        <rect x="6" y="8" width="40" height={h} rx="6" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="2" />
        {/* livello */}
        <clipPath id="tankClip">
          <rect x="7" y="9" width="38" height={h - 2} rx="5" />
        </clipPath>
        <rect
          x="7" y={9 + (h - 2) - fillH} width="38" height={fillH}
          fill={color} opacity="0.85" clipPath="url(#tankClip)"
          style={{ transition: 'height 0.5s ease, y 0.5s ease' }}
        />
        {/* bolle animate */}
        {pct > 0.1 && [14, 26, 38].map((bx, i) => (
          <circle key={i} cx={bx} cy={9 + (h - 2) - fillH * 0.4} r="2.5" fill="white" opacity="0.4">
            <animate attributeName="cy"
              values={`${9 + (h - 2) - fillH * 0.4};${9 + (h - 2) - fillH * 0.8};${9 + (h - 2) - fillH * 0.4}`}
              dur={`${1.5 + i * 0.4}s`} repeatCount="indefinite" />
          </circle>
        ))}
        {/* tappo superiore */}
        <rect x="14" y="4" width="24" height="8" rx="4" fill="#94a3b8" />
        {/* tappo inferiore */}
        <rect x="14" y={h + 6} width="24" height="8" rx="4" fill="#94a3b8" />
      </svg>
      <div className="text-center">
        <div className="text-xs font-black text-blue-700">{liters.toFixed(1)}L</div>
        <div className="text-xs text-gray-400">latte</div>
      </div>
    </div>
  )
}

// ── Crate visivo per scorte ────────────────────────────────────────────────
function StockCrates({ count, icon }: { count: number; icon: string }) {
  const crates = Math.min(8, Math.floor(count / BATCH))
  const extra = Math.floor(count / BATCH) - crates
  return (
    <div className="flex flex-wrap gap-0.5 justify-center min-h-[20px]">
      {Array.from({ length: crates }).map((_, i) => (
        <span key={i} className="text-sm leading-none">{icon}</span>
      ))}
      {extra > 0 && <span className="text-xs text-gray-500 font-bold">+{extra}</span>}
      {crates === 0 && <span className="text-xs text-gray-300 italic">vuoto</span>}
    </div>
  )
}

// ── Scheda prodotto ────────────────────────────────────────────────────────
const PRODUCTS = [
  { key: 'yogurt' as const, label: 'Yogurt', sub: 'di pecora', icon: '🥛', stockIcon: '🫙' },
  { key: 'formaggioFresco' as const, label: 'Formaggio', sub: 'fresco', icon: '🧀', stockIcon: '🧀' },
  { key: 'primoSale' as const, label: 'Primo Sale', sub: '', icon: '🧀', stockIcon: '⬜' },
  { key: 'ricotta' as const, label: 'Ricotta', sub: '', icon: '🍶', stockIcon: '🍶' },
]

function ProductCard({ product, milkAvailable }: {
  product: typeof PRODUCTS[0]
  milkAvailable: number
}) {
  const { produceBatch, inventory } = useGameStore()
  const milkCost = BATCH_MILK[product.key]
  const canProduce = milkAvailable >= milkCost
  const stock = inventory[product.key]

  return (
    <button
      onClick={() => produceBatch(product.key)}
      disabled={!canProduce}
      className={`
        flex flex-col items-center gap-1 p-3 rounded-2xl border-2 transition-all duration-150
        active:scale-95 select-none
        ${canProduce
          ? 'border-amber-300 bg-amber-50 hover:bg-amber-100 hover:border-amber-500 cursor-pointer shadow-sm hover:shadow-md'
          : 'border-gray-200 bg-gray-50 opacity-40 cursor-not-allowed'
        }
      `}
    >
      <div className="text-3xl">{product.icon}</div>
      <div className="text-center leading-tight">
        <div className="text-xs font-black text-gray-800">{product.label}</div>
        {product.sub && <div className="text-xs text-gray-500">{product.sub}</div>}
      </div>
      <div className={`text-xs font-semibold px-2 py-0.5 rounded-full ${canProduce ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-400'}`}>
        {milkCost.toFixed(1)}L / lotto
      </div>
      <StockCrates count={stock} icon={product.stockIcon} />
      <div className="text-xs text-gray-500">{stock}kg in magaz.</div>
    </button>
  )
}

// ── Scheda cliente ─────────────────────────────────────────────────────────
const CLIENTS = [
  { key: 'perugia' as const, label: 'Mercato', sub: 'di Perugia', icon: '🏪', desc: 'Prezzo standard, volume alto' },
  { key: 'spoleto' as const, label: 'Ristorante', sub: 'di Spoleto ⭐', icon: '🍽️', desc: 'Esigente, paga +30%' },
  { key: 'gas' as const, label: 'GAS', sub: 'Locale 🌿', icon: '🛒', desc: 'Vuole qualità, paga +10%' },
]

function ClientCard({ client }: { client: typeof CLIENTS[0] }) {
  const { sellAll, inventory, prices, reputation } = useGameStore()
  const mult = CLIENT_MULT[client.key]
  const rep = reputation[client.key]
  const revenue = Math.round(
    (inventory.yogurt * prices.yogurt + inventory.formaggioFresco * prices.formaggioFresco +
      inventory.primoSale * prices.primoSale + inventory.ricotta * prices.ricotta) * mult
  )
  const hasStock = revenue > 0
  const stars = Math.round(rep / 20)

  return (
    <button
      onClick={() => sellAll(client.key)}
      disabled={!hasStock}
      className={`
        flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all duration-150
        active:scale-95 select-none w-full
        ${hasStock
          ? 'border-green-300 bg-green-50 hover:bg-green-100 hover:border-green-500 cursor-pointer shadow-sm hover:shadow-md'
          : 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
        }
      `}
    >
      <div className="text-4xl">{client.icon}</div>
      <div className="text-center leading-tight">
        <div className="text-sm font-black text-gray-800">{client.label}</div>
        <div className="text-xs text-gray-500">{client.sub}</div>
      </div>
      <div className="text-yellow-500 text-sm">{'★'.repeat(stars)}{'☆'.repeat(5 - stars)}</div>
      <div className="text-xs text-gray-500 text-center">{client.desc}</div>
      {hasStock ? (
        <div className="bg-green-600 text-white font-black text-lg px-4 py-1.5 rounded-xl w-full text-center">
          Consegna — €{revenue}
        </div>
      ) : (
        <div className="bg-gray-200 text-gray-400 text-sm px-4 py-1.5 rounded-xl w-full text-center">
          Nessuna scorta
        </div>
      )}
      {mult > 1 && (
        <div className="text-xs text-green-600 font-semibold">+{Math.round((mult - 1) * 100)}% sul prezzo base</div>
      )}
    </button>
  )
}

// ── Gregge panel ───────────────────────────────────────────────────────────
function FlockTab() {
  const { flock, giudittaAvailableDay, compliance } = useGameStore()
  const active = flock.filter(s => s.mood !== 'missing')
  const missing = flock.filter(s => s.mood === 'missing')
  const sick = flock.filter(s => s.mood === 'sick')

  return (
    <div className="flex flex-col gap-3">
      {/* Sommario */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-green-50 border border-green-200 rounded-2xl p-3 text-center">
          <div className="text-3xl font-black text-green-700">{active.length}</div>
          <div className="text-xs text-gray-500">presenti</div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-2xl p-3 text-center">
          <div className="text-3xl font-black text-red-600">{missing.length}</div>
          <div className="text-xs text-gray-500">mancanti</div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-3 text-center">
          <div className="text-3xl font-black text-yellow-600">{sick.length}</div>
          <div className="text-xs text-gray-500">ammalate</div>
        </div>
      </div>

      {/* Giuditta */}
      <div className={`rounded-2xl p-3 flex items-center gap-3 border-2 ${giudittaAvailableDay ? 'border-teal-400 bg-teal-50' : 'border-gray-200 bg-gray-50 opacity-60'}`}>
        <div className="text-3xl">🩺</div>
        <div>
          <div className="font-bold text-sm text-gray-800">Dott.ssa Giuditta</div>
          <div className="text-xs text-gray-500">Veterinaria · Ponte San Giovanni</div>
          <div className={`text-xs font-semibold mt-0.5 ${giudittaAvailableDay ? 'text-teal-700' : 'text-gray-400'}`}>
            {giudittaAvailableDay ? '✓ Disponibile oggi (mercoledì)' : 'Disponibile il mercoledì'}
          </div>
        </div>
      </div>

      {/* Griglia pecore */}
      <div className="flex flex-wrap gap-1.5">
        {active.map(s => (
          <div
            key={s.id}
            title={`${s.name} — salute ${s.health}% — ${s.milkProduction.toFixed(1)}L/g`}
            className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl cursor-default border-2 transition-all
              ${s.isErminia ? 'border-yellow-400 bg-yellow-50' : s.mood === 'sick' ? 'border-red-300 bg-red-50' : s.mood === 'nervous' ? 'border-orange-300 bg-orange-50' : 'border-gray-200 bg-white'}
            `}
          >
            {s.isErminia ? '👑' : s.mood === 'sick' ? '🤒' : '🐑'}
          </div>
        ))}
        {missing.map(s => (
          <div key={s.id} title={`${s.name} — dispersa`}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl border-2 border-dashed border-red-300 bg-red-50 opacity-50">
            ❓
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Normative panel ────────────────────────────────────────────────────────
function NormativeTab() {
  const { compliance, reputation } = useGameStore()
  const bodies = [
    { key: 'asl' as const, label: 'ASL Perugia', icon: '🏥' },
    { key: 'nas' as const, label: 'NAS Carabinieri', icon: '🚔' },
    { key: 'forestale' as const, label: 'Corpo Forestale', icon: '🌲' },
    { key: 'regione' as const, label: 'Regione Umbria', icon: '🏛️' },
  ]

  return (
    <div className="flex flex-col gap-3">
      {compliance.finesPending > 0 && (
        <div className="bg-red-50 border-2 border-red-400 rounded-2xl px-4 py-3 text-red-700 font-bold text-sm flex items-center gap-2">
          ⚠️ Multe pendenti: €{compliance.finesPending}
        </div>
      )}
      <div className="grid grid-cols-2 gap-2">
        {bodies.map(({ key, label, icon }) => {
          const val = compliance[key]
          const color = val > 70 ? 'border-green-300 bg-green-50' : val > 40 ? 'border-yellow-300 bg-yellow-50' : 'border-red-400 bg-red-50'
          const barColor = val > 70 ? 'bg-green-400' : val > 40 ? 'bg-yellow-400' : 'bg-red-400'
          return (
            <div key={key} className={`rounded-2xl border-2 p-3 ${color}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-gray-800">{icon} {label}</span>
                <span className={`text-lg font-black ${val < 40 ? 'text-red-600 animate-pulse' : 'text-gray-700'}`}>{val}</span>
              </div>
              <div className="w-full bg-white/60 rounded-full h-3">
                <div className={`h-3 rounded-full transition-all duration-700 ${barColor}`} style={{ width: `${val}%` }} />
              </div>
            </div>
          )
        })}
      </div>
      <div className="grid grid-cols-3 gap-2 mt-1">
        {[
          { label: 'Perugia', val: reputation.perugia },
          { label: 'Spoleto', val: reputation.spoleto },
          { label: 'GAS', val: reputation.gas },
        ].map(({ label, val }) => (
          <div key={label} className="bg-white border border-gray-200 rounded-2xl p-2 text-center">
            <div className={`text-xl font-black ${val > 60 ? 'text-green-600' : val > 30 ? 'text-yellow-600' : 'text-red-500'}`}>{val}</div>
            <div className="text-xs text-gray-500">{label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Main Bottom Panel ──────────────────────────────────────────────────────
const TABS = [
  { key: 'production', icon: '🏭', label: 'Caseificio' },
  { key: 'market', icon: '🛒', label: 'Mercato' },
  { key: 'flock', icon: '🐑', label: 'Gregge' },
  { key: 'compliance', icon: '📋', label: 'Normative' },
] as const

type Tab = typeof TABS[number]['key']

export default function BottomPanel() {
  const [tab, setTab] = useState<Tab>('production')
  const { inventory, activePanel, setPanel } = useGameStore()

  // la mappa può forzare il tab
  const effectiveTab = activePanel === 'production' ? 'production'
    : activePanel === 'market' ? 'market'
    : activePanel === 'flock' ? 'flock'
    : activePanel === 'compliance' ? 'compliance'
    : tab

  function switchTab(t: Tab) {
    setTab(t)
    setPanel(null)
  }

  const TANK_MAX = 80

  return (
    <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl border border-amber-200 overflow-hidden">
      {/* Tab bar */}
      <div className="flex border-b border-amber-100">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => switchTab(t.key)}
            className={`flex-1 py-3 flex flex-col items-center gap-0.5 text-xs font-bold transition-all
              ${effectiveTab === t.key
                ? 'bg-amber-50 text-amber-900 border-b-2 border-amber-500'
                : 'text-gray-400 hover:text-amber-700 hover:bg-amber-50/50'
              }`}
          >
            <span className="text-xl">{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-4 overflow-y-auto" style={{ maxHeight: '340px' }}>
        {effectiveTab === 'production' && (
          <div className="flex gap-4">
            {/* Serbatoio */}
            <div className="flex flex-col items-center gap-2 flex-shrink-0">
              <MilkTank liters={inventory.milk} max={TANK_MAX} />
              <div className="text-xs text-gray-400 text-center leading-tight">
                Clicca un prodotto<br />per fare un lotto
              </div>
            </div>
            {/* Prodotti */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 flex-1">
              {PRODUCTS.map(p => (
                <ProductCard key={p.key} product={p} milkAvailable={inventory.milk} />
              ))}
            </div>
          </div>
        )}

        {effectiveTab === 'market' && (
          <div>
            <p className="text-xs text-gray-500 mb-3 text-center">
              Clicca un cliente per consegnare <strong>tutte le scorte</strong>
            </p>
            <div className="grid grid-cols-3 gap-3">
              {CLIENTS.map(c => <ClientCard key={c.key} client={c} />)}
            </div>
          </div>
        )}

        {effectiveTab === 'flock' && <FlockTab />}
        {effectiveTab === 'compliance' && <NormativeTab />}
      </div>
    </div>
  )
}
