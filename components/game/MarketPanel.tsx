'use client'
import { useState } from 'react'
import { useGameStore } from '@/lib/store/gameStore'

const CLIENTS = [
  { key: 'perugia' as const, label: 'Mercato di Perugia', icon: '🏪', desc: 'Volume alto, prezzo standard' },
  { key: 'spoleto' as const, label: 'Rist. stellato Spoleto', icon: '⭐', desc: 'Esigente, paga di più' },
  { key: 'gas' as const, label: 'GAS Locale', icon: '🌿', desc: 'Vuole qualità e trasparenza' },
]

export default function MarketPanel() {
  const { inventory, prices, reputation, sell } = useGameStore()
  const [client, setClient] = useState<'perugia' | 'spoleto' | 'gas'>('perugia')
  const [amounts, setAmounts] = useState({ yogurt: 0, formaggioFresco: 0, primoSale: 0, ricotta: 0 })

  const clientMult = client === 'spoleto' ? 1.3 : client === 'gas' ? 1.1 : 1.0
  const total = (
    amounts.yogurt * prices.yogurt +
    amounts.formaggioFresco * prices.formaggioFresco +
    amounts.primoSale * prices.primoSale +
    amounts.ricotta * prices.ricotta
  ) * clientMult

  const canSell = total > 0 &&
    amounts.yogurt <= inventory.yogurt &&
    amounts.formaggioFresco <= inventory.formaggioFresco &&
    amounts.primoSale <= inventory.primoSale &&
    amounts.ricotta <= inventory.ricotta

  function set(key: keyof typeof amounts, val: number) {
    setAmounts(prev => ({ ...prev, [key]: Math.max(0, Math.round(val)) }))
  }

  function handleSell() {
    sell(client, amounts.yogurt, amounts.formaggioFresco, amounts.primoSale, amounts.ricotta)
    setAmounts({ yogurt: 0, formaggioFresco: 0, primoSale: 0, ricotta: 0 })
  }

  const products = [
    { key: 'yogurt' as const, label: 'Yogurt', icon: '🥛', price: prices.yogurt },
    { key: 'formaggioFresco' as const, label: 'F. Fresco', icon: '🧀', price: prices.formaggioFresco },
    { key: 'primoSale' as const, label: 'Primo Sale', icon: '🧀', price: prices.primoSale },
    { key: 'ricotta' as const, label: 'Ricotta', icon: '🍶', price: prices.ricotta },
  ]

  return (
    <div className="bg-white/80 rounded-xl p-4 shadow-sm border border-amber-200">
      <h3 className="font-bold text-amber-900 mb-3">🛒 Vendita prodotti</h3>

      {/* Scorte */}
      <div className="grid grid-cols-4 gap-1 mb-3 text-center">
        {products.map(({ key, label, icon }) => (
          <div key={key} className="bg-amber-50 rounded-lg p-1.5">
            <div className="text-base">{icon}</div>
            <div className="text-xs font-semibold text-amber-900">{inventory[key]}kg</div>
            <div className="text-xs text-gray-500">{label}</div>
          </div>
        ))}
      </div>

      {/* Selezione cliente */}
      <div className="flex flex-col gap-1.5 mb-3">
        {CLIENTS.map(c => (
          <button
            key={c.key}
            onClick={() => setClient(c.key)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition-all ${client === c.key ? 'border-amber-500 bg-amber-50 font-semibold' : 'border-gray-200 hover:border-amber-300'}`}
          >
            <span className="text-lg">{c.icon}</span>
            <div className="flex-1 text-left">
              <div className="font-medium">{c.label}</div>
              <div className="text-xs text-gray-500">{c.desc}</div>
            </div>
            <div className="text-right">
              <div className={`text-xs font-bold ${reputation[c.key] > 60 ? 'text-green-600' : reputation[c.key] > 30 ? 'text-yellow-600' : 'text-red-500'}`}>Rep: {reputation[c.key]}</div>
              {c.key !== 'perugia' && <div className="text-xs text-green-600">+{c.key === 'spoleto' ? '30' : '10'}%</div>}
            </div>
          </button>
        ))}
      </div>

      {/* Quantità */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        {products.map(({ key, label, icon, price }) => (
          <div key={key} className="flex items-center gap-1">
            <button onClick={() => set(key, amounts[key] - 1)} className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm font-bold">−</button>
            <div className="flex-1 text-center">
              <div className="text-xs text-gray-500">{icon}{label}</div>
              <input type="number" min={0} max={inventory[key]} value={amounts[key]}
                onChange={e => set(key, parseInt(e.target.value) || 0)}
                className="w-full text-center border border-gray-200 rounded text-sm font-bold h-7" />
              <div className="text-xs text-gray-400">€{(price * clientMult).toFixed(2)}/kg</div>
            </div>
            <button onClick={() => set(key, amounts[key] + 1)} className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm font-bold">+</button>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-600">Totale ordine:</span>
        <span className="text-lg font-bold text-green-700">€{total.toFixed(2)}</span>
      </div>

      <button
        onClick={handleSell}
        disabled={!canSell}
        className="w-full py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed bg-green-600 hover:bg-green-700 text-white shadow-sm"
      >
        Vendi
      </button>
    </div>
  )
}
