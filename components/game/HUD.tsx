'use client'
import { useGameStore } from '@/lib/store/gameStore'

const SEASON_LABELS = { spring: '🌸 Primavera', summer: '☀️ Estate', autumn: '🍂 Autunno', winter: '❄️ Inverno' }
const SEASON_COLORS = { spring: 'bg-green-100 text-green-900', summer: 'bg-yellow-100 text-yellow-900', autumn: 'bg-orange-100 text-orange-900', winter: 'bg-blue-100 text-blue-900' }

function Bar({ value, max = 100, color }: { value: number; max?: number; color: string }) {
  const pct = Math.round((value / max) * 100)
  return (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div className={`h-2 rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
    </div>
  )
}

export default function HUD() {
  const { day, season, year, money, trumpCostIndex, flock, fenceIntegrity, reputation, compliance, giudittaAvailableDay, weather } = useGameStore()

  const activeSheep = flock.filter(s => s.mood !== 'missing').length
  const trumpColor = trumpCostIndex > 2.0 ? 'text-red-600' : trumpCostIndex > 1.5 ? 'text-orange-500' : 'text-green-700'

  return (
    <div className="grid grid-cols-2 gap-3 text-sm">
      {/* Tempo */}
      <div className={`col-span-2 rounded-lg px-4 py-2 font-bold text-center text-base ${SEASON_COLORS[season]}`}>
        {SEASON_LABELS[season]} — Anno {year}/3 — Giorno {day}/30
      </div>

      {/* Economia */}
      <div className="bg-white/80 rounded-lg p-3 shadow-sm border border-amber-200">
        <div className="font-semibold text-amber-900 mb-2">💰 Conto corrente</div>
        <div className={`text-2xl font-bold ${money < 0 ? 'text-red-600' : money < 500 ? 'text-orange-500' : 'text-green-700'}`}>
          €{money.toFixed(0)}
        </div>
        <div className={`text-xs mt-1 font-medium ${trumpColor}`}>
          Indice costi Trump: {trumpCostIndex.toFixed(2)}x
          {trumpCostIndex > 1.8 && ' ⚠️'}
        </div>
      </div>

      {/* Gregge */}
      <div className="bg-white/80 rounded-lg p-3 shadow-sm border border-amber-200">
        <div className="font-semibold text-amber-900 mb-2">🐑 Gregge</div>
        <div className="text-2xl font-bold text-gray-800">{activeSheep}<span className="text-sm text-gray-500">/{flock.length}</span></div>
        <div className="text-xs text-gray-500 mt-1">pecore attive</div>
        <div className="mt-2">
          <div className="flex justify-between text-xs mb-1">
            <span>Recinzione</span>
            <span className={fenceIntegrity < 40 ? 'text-red-500' : fenceIntegrity < 70 ? 'text-orange-500' : 'text-green-600'}>{fenceIntegrity}%</span>
          </div>
          <Bar value={fenceIntegrity} color={fenceIntegrity < 40 ? 'bg-red-400' : fenceIntegrity < 70 ? 'bg-orange-400' : 'bg-green-400'} />
        </div>
      </div>

      {/* Reputazione */}
      <div className="bg-white/80 rounded-lg p-3 shadow-sm border border-amber-200">
        <div className="font-semibold text-amber-900 mb-2">⭐ Reputazione</div>
        <div className="space-y-1.5">
          {[
            { label: 'Mercato Perugia', val: reputation.perugia },
            { label: 'Rist. Spoleto', val: reputation.spoleto },
            { label: 'GAS Locale', val: reputation.gas },
          ].map(({ label, val }) => (
            <div key={label}>
              <div className="flex justify-between text-xs mb-0.5">
                <span>{label}</span><span>{val}</span>
              </div>
              <Bar value={val} color={val > 60 ? 'bg-green-400' : val > 30 ? 'bg-yellow-400' : 'bg-red-400'} />
            </div>
          ))}
        </div>
      </div>

      {/* Normative */}
      <div className="bg-white/80 rounded-lg p-3 shadow-sm border border-amber-200">
        <div className="font-semibold text-amber-900 mb-2">📋 Conformità</div>
        <div className="space-y-1.5">
          {[
            { label: 'ASL', val: compliance.asl },
            { label: 'NAS', val: compliance.nas },
            { label: 'Forestale', val: compliance.forestale },
            { label: 'Regione', val: compliance.regione },
          ].map(({ label, val }) => (
            <div key={label}>
              <div className="flex justify-between text-xs mb-0.5">
                <span>{label}</span>
                <span className={val < 50 ? 'text-red-500 font-bold' : ''}>{val}</span>
              </div>
              <Bar value={val} color={val > 70 ? 'bg-blue-400' : val > 40 ? 'bg-yellow-400' : 'bg-red-400'} />
            </div>
          ))}
        </div>
        {compliance.finesPending > 0 && (
          <div className="mt-2 text-xs text-red-600 font-semibold">⚠️ Multe pendenti: €{compliance.finesPending}</div>
        )}
      </div>

      {/* Giuditta & Meteo */}
      <div className="col-span-2 flex gap-3">
        <div className={`flex-1 rounded-lg p-2 text-xs text-center font-medium ${giudittaAvailableDay ? 'bg-teal-100 text-teal-800 border border-teal-300' : 'bg-gray-100 text-gray-500'}`}>
          🩺 Giuditta {giudittaAvailableDay ? '— Disponibile oggi! (mercoledì)' : '— Non disponibile oggi'}
        </div>
        <div className="flex-1 rounded-lg p-2 text-xs text-center bg-sky-100 text-sky-800 border border-sky-200 font-medium">
          Domani: {weather.forecast === 'sunny' ? '☀️ Sole' : weather.forecast === 'rainy' ? '🌧️ Pioggia' : weather.forecast === 'stormy' ? '⛈️ Temporale' : weather.forecast === 'snowy' ? '❄️ Neve' : weather.forecast === 'hot' ? '🌡️ Caldo' : '☁️ Nuvoloso'}
        </div>
      </div>
    </div>
  )
}
