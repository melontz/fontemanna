'use client'
import { useState } from 'react'
import { useGameStore } from '@/lib/store/gameStore'

export default function ProductionPanel() {
  const { inventory, produce, milkQualityModifier } = useGameStore()
  const [amounts, setAmounts] = useState({ yogurt: 0, formaggioFresco: 0, primoSale: 0, ricotta: 0 })

  const milkNeeded = amounts.yogurt * 0.9 + amounts.formaggioFresco * 1.2 + amounts.primoSale * 1.5 + amounts.ricotta * 0.5
  const canProduce = milkNeeded <= inventory.milk && milkNeeded > 0

  function set(key: keyof typeof amounts, val: number) {
    setAmounts(prev => ({ ...prev, [key]: Math.max(0, Math.round(val)) }))
  }

  function handleProduce() {
    produce(amounts.yogurt, amounts.formaggioFresco, amounts.primoSale, amounts.ricotta)
    setAmounts({ yogurt: 0, formaggioFresco: 0, primoSale: 0, ricotta: 0 })
  }

  const products = [
    { key: 'yogurt' as const, label: 'Yogurt di pecora', ratio: '0.9L/kg', icon: '🥛', color: 'text-teal-700' },
    { key: 'formaggioFresco' as const, label: 'Formaggio fresco', ratio: '1.2L/kg', icon: '🧀', color: 'text-yellow-700' },
    { key: 'primoSale' as const, label: 'Primo sale', ratio: '1.5L/kg', icon: '🧀', color: 'text-amber-700' },
    { key: 'ricotta' as const, label: 'Ricotta', ratio: '0.5L/kg', icon: '🍶', color: 'text-orange-700' },
  ]

  return (
    <div className="bg-white/80 rounded-xl p-4 shadow-sm border border-amber-200">
      <h3 className="font-bold text-amber-900 mb-3">🏭 Caseificio Fontemanna</h3>

      <div className="flex justify-between text-sm mb-3">
        <span className="text-gray-600">Latte disponibile:</span>
        <span className="font-bold text-blue-700">{inventory.milk.toFixed(1)}L</span>
      </div>

      {milkQualityModifier < 0.95 && (
        <div className="text-xs bg-yellow-100 border border-yellow-300 text-yellow-800 rounded-lg px-3 py-1.5 mb-3">
          ⚠️ Qualità latte ridotta ({Math.round(milkQualityModifier * 100)}%) — erbe amare nel pascolo
        </div>
      )}

      <div className="space-y-3">
        {products.map(({ key, label, ratio, icon, color }) => (
          <div key={key}>
            <div className="flex items-center justify-between mb-1">
              <span className={`text-sm font-medium ${color}`}>{icon} {label}</span>
              <span className="text-xs text-gray-400">{ratio} latte</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => set(key, amounts[key] - 1)} className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 font-bold text-gray-700 transition-colors">−</button>
              <input
                type="number" min={0} value={amounts[key]}
                onChange={e => set(key, parseInt(e.target.value) || 0)}
                className="flex-1 text-center border border-gray-200 rounded-lg h-8 text-sm font-semibold"
              />
              <button onClick={() => set(key, amounts[key] + 1)} className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 font-bold text-gray-700 transition-colors">+</button>
              <span className="text-xs text-gray-500 w-16">→ in scorta: {inventory[key]}kg</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 text-xs text-gray-500">
        Latte necessario: <span className={milkNeeded > inventory.milk ? 'text-red-500 font-bold' : 'text-green-600 font-bold'}>{milkNeeded.toFixed(1)}L</span>
      </div>

      <button
        onClick={handleProduce}
        disabled={!canProduce}
        className="mt-3 w-full py-2.5 rounded-xl font-bold text-sm transition-all duration-150 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed bg-amber-600 hover:bg-amber-700 text-white shadow-sm"
      >
        Avvia lavorazione
      </button>
    </div>
  )
}
