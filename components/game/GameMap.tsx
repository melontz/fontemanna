'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { useGameStore, BATCH, BATCH_MILK, CLIENT_MULT } from '@/lib/store/gameStore'
import { Weather } from '@/lib/data/types'

// ── Tipi ──────────────────────────────────────────────────────────────────
interface SheepPos { id: string; x: number; y: number; dx: number; dy: number; flip: boolean }

// ── Costanti pascolo ───────────────────────────────────────────────────────
const PX = 195, PY = 200, PW = 355, PH = 175

function randomIn(min: number, max: number) { return min + Math.random() * (max - min) }

// ── Colori meteo/stagione ──────────────────────────────────────────────────
function skyColors(w: Weather, season: string): [string, string] {
  if (w === 'stormy') return ['#374151', '#6b7280']
  if (w === 'rainy')  return ['#64748b', '#94a3b8']
  if (w === 'snowy')  return ['#bfdbfe', '#e0f2fe']
  if (w === 'hot')    return ['#f59e0b', '#fcd34d']
  if (season === 'winter') return ['#93c5fd', '#bfdbfe']
  if (season === 'autumn') return ['#d97706', '#fbbf24']
  return ['#38bdf8', '#7dd3fc']
}

function grassColor(w: Weather, season: string) {
  if (w === 'snowy')  return '#e2e8f0'
  if (season === 'winter') return '#9ca3af'
  if (season === 'autumn') return '#92400e'
  if (w === 'hot')    return '#b45309'
  return '#3d7a2e'
}

// ── Overlay produzione ─────────────────────────────────────────────────────
const PRODUCTS = [
  { key: 'yogurt'          as const, label: 'Yogurt', icon: '🥛' },
  { key: 'formaggioFresco' as const, label: 'Formaggio', icon: '🧀' },
  { key: 'primoSale'       as const, label: 'Primo sale', icon: '🫙' },
  { key: 'ricotta'         as const, label: 'Ricotta', icon: '🍶' },
]

function ProductionOverlay({ onClose }: { onClose: () => void }) {
  const { inventory, produceBatch, milkQualityModifier } = useGameStore()

  return (
    <div className="absolute left-2 top-1/2 -translate-y-1/2 z-30 bg-white/95 backdrop-blur rounded-2xl shadow-2xl border-2 border-amber-300 p-3 w-56 sm:w-64"
      onClick={e => e.stopPropagation()}>
      <div className="flex items-center justify-between mb-2">
        <div className="font-black text-amber-900 text-sm">🏭 Caseificio</div>
        <button onClick={onClose} className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 font-bold text-sm flex items-center justify-center">✕</button>
      </div>

      {/* Livello latte */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl px-3 py-1.5 mb-3 flex items-center justify-between">
        <span className="text-xs text-blue-700 font-semibold">🥛 Latte</span>
        <span className="text-blue-900 font-black text-sm">{inventory.milk.toFixed(1)} L</span>
      </div>
      {milkQualityModifier < 0.95 && (
        <div className="text-xs bg-yellow-50 border border-yellow-200 rounded-xl px-2 py-1 mb-2 text-yellow-800">
          ⚠️ Erbe amare — qualità {Math.round(milkQualityModifier * 100)}%
        </div>
      )}

      {/* Bottoni lotti */}
      <div className="grid grid-cols-2 gap-2">
        {PRODUCTS.map(p => {
          const cost = BATCH_MILK[p.key]
          const canProduce = inventory.milk >= cost
          const stock = inventory[p.key]
          return (
            <button key={p.key}
              onClick={() => produceBatch(p.key)}
              disabled={!canProduce}
              className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 transition-all active:scale-95 select-none
                ${canProduce
                  ? 'border-amber-300 bg-amber-50 hover:bg-amber-100 hover:border-amber-500 cursor-pointer'
                  : 'border-gray-200 bg-gray-50 opacity-40 cursor-not-allowed'}`}
            >
              <span className="text-2xl">{p.icon}</span>
              <span className="text-xs font-bold text-gray-800">{p.label}</span>
              <span className="text-xs text-blue-600 font-semibold">{cost.toFixed(1)}L/lotto</span>
              <span className="text-xs text-gray-400">in magaz: {stock}kg</span>
            </button>
          )
        })}
      </div>
      <div className="mt-2 text-xs text-gray-400 text-center">Ogni clic produce {BATCH}kg</div>
    </div>
  )
}

// ── Overlay gregge ─────────────────────────────────────────────────────────
function FlockOverlay({ onClose }: { onClose: () => void }) {
  const { flock, giudittaAvailableDay } = useGameStore()
  const active  = flock.filter(s => s.mood !== 'missing')
  const missing = flock.filter(s => s.mood === 'missing')
  const sick    = flock.filter(s => s.mood === 'sick')

  return (
    <div className="absolute left-1/2 top-4 -translate-x-1/2 z-30 bg-white/95 backdrop-blur rounded-2xl shadow-2xl border-2 border-green-300 p-3 w-64 sm:w-72"
      onClick={e => e.stopPropagation()}>
      <div className="flex items-center justify-between mb-2">
        <div className="font-black text-green-900 text-sm">🐑 Gregge</div>
        <button onClick={onClose} className="w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 font-bold text-sm flex items-center justify-center">✕</button>
      </div>
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="bg-green-50 border border-green-200 rounded-xl p-2 text-center">
          <div className="text-2xl font-black text-green-700">{active.length}</div>
          <div className="text-xs text-gray-500">presenti</div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-2 text-center">
          <div className="text-2xl font-black text-red-600">{missing.length}</div>
          <div className="text-xs text-gray-500">mancanti</div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-2 text-center">
          <div className="text-2xl font-black text-yellow-600">{sick.length}</div>
          <div className="text-xs text-gray-500">ammalate</div>
        </div>
      </div>
      <div className="flex flex-wrap gap-1 mb-3 max-h-24 overflow-y-auto">
        {active.map(s => (
          <span key={s.id} title={`${s.name} – salute ${s.health}%`}
            className={`text-xl cursor-default ${s.mood === 'sick' ? 'opacity-60' : ''}`}>
            {s.isErminia ? '👑' : s.mood === 'sick' ? '🤒' : '🐑'}
          </span>
        ))}
        {missing.map(s => <span key={s.id} className="text-xl opacity-30">❓</span>)}
      </div>
      {giudittaAvailableDay && (
        <div className="bg-teal-50 border border-teal-300 rounded-xl px-3 py-2 text-xs text-teal-800 font-semibold">
          🩺 Giuditta disponibile oggi (mercoledì)!
        </div>
      )}
    </div>
  )
}

// ── Componente principale ──────────────────────────────────────────────────
export default function GameMap() {
  const { flock, weather, season, fenceIntegrity, activeEvent,
          inventory, prices, reputation, compliance,
          sellAll, fixFence } = useGameStore()

  const [sheepPos,  setSheepPos]  = useState<SheepPos[]>([])
  const [overlay,   setOverlay]   = useState<'production' | 'flock' | null>(null)
  const [rain,      setRain]      = useState<{x:number;y:number}[]>([])
  const [snow,      setSnow]      = useState<{x:number;y:number;r:number}[]>([])
  const [hovered,   setHovered]   = useState<string|null>(null)
  const animRef  = useRef<number|null>(null)
  const frameRef = useRef(0)

  // Inizializzazione pecore
  useEffect(() => {
    const active = flock.filter(s => s.mood !== 'missing')
    setSheepPos(active.map(s => ({
      id: s.id,
      x: randomIn(PX + 20, PX + PW - 40),
      y: randomIn(PY + 20, PY + PH - 36),
      dx: (Math.random() - 0.5) * 0.35,
      dy: (Math.random() - 0.5) * 0.18,
      flip: Math.random() > 0.5,
    })))
  }, [flock.length])

  // Meteo effetti
  useEffect(() => {
    const isWet = weather.current === 'rainy' || weather.current === 'stormy'
    setRain(isWet ? Array.from({length:55},()=>({x:Math.random()*820,y:Math.random()*500})) : [])
    setSnow(weather.current==='snowy' ? Array.from({length:30},()=>({x:Math.random()*820,y:Math.random()*500,r:1.5+Math.random()*2})) : [])
  }, [weather.current])

  // Loop animazione
  const isWolf    = activeEvent?.type === 'wolf'
  const isBoar    = activeEvent?.type === 'boar'
  const isEscape  = activeEvent?.type === 'escape'

  useEffect(() => {
    function tick() {
      frameRef.current++
      if (frameRef.current % 2 === 0) {
        setSheepPos(prev => prev.map(p => {
          const speed = (isWolf || isEscape) ? 1.1 : 0.35
          let nx = p.x + p.dx * speed, ny = p.y + p.dy * speed
          let dx = p.dx, dy = p.dy, flip = p.flip
          if (nx < PX+8 || nx > PX+PW-30) { dx=-dx; flip=!flip }
          if (ny < PY+8 || ny > PY+PH-26) dy=-dy
          if (Math.random() < 0.007) { dx=(Math.random()-0.5)*0.5; dy=(Math.random()-0.5)*0.25 }
          return {...p, x:nx, y:ny, dx, dy, flip}
        }))
      }
      if (frameRef.current % 5 === 0 && rain.length > 0) {
        setRain(prev => prev.map(r => ({x:(r.x+1.5)%820, y:(r.y+8)%500})))
      }
      if (frameRef.current % 8 === 0 && snow.length > 0) {
        setSnow(prev => prev.map(s => ({...s, x:(s.x+0.4)%820, y:(s.y+1)%500})))
      }
      animRef.current = requestAnimationFrame(tick)
    }
    animRef.current = requestAnimationFrame(tick)
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current) }
  }, [rain.length, snow.length, isWolf, isEscape])

  const activeFlock  = flock.filter(s => s.mood !== 'missing')
  const missingCount = flock.filter(s => s.mood === 'missing').length
  const [skyTop, skyBot] = skyColors(weather.current, season)
  const grass = grassColor(weather.current, season)
  const fenceCol = fenceIntegrity < 40 ? '#ef4444' : fenceIntegrity < 70 ? '#f59e0b' : '#6b3a1f'
  const fenceDash = fenceIntegrity < 50 ? '6 4' : 'none'

  // Revenue per cliente
  const baseRevenue = inventory.yogurt * prices.yogurt + inventory.formaggioFresco * prices.formaggioFresco + inventory.primoSale * prices.primoSale + inventory.ricotta * prices.ricotta
  const rev = {
    perugia: Math.round(baseRevenue * CLIENT_MULT.perugia),
    spoleto: Math.round(baseRevenue * CLIENT_MULT.spoleto),
    gas:     Math.round(baseRevenue * CLIENT_MULT.gas),
  }
  const hasStock = baseRevenue > 0

  // Milk level percentage per serbatoio
  const milkPct = Math.min(1, inventory.milk / 80)
  const milkColor = milkPct > 0.6 ? '#3b82f6' : milkPct > 0.3 ? '#f59e0b' : '#ef4444'

  const hover = useCallback((id: string | null) => setHovered(id), [])

  return (
    <div className="relative w-full h-full" onClick={() => setOverlay(null)}>

      {/* ── SVG mappa principale ────────────────────────────────────────── */}
      <svg
        viewBox="0 0 820 500"
        className="w-full h-full"
        style={{background:`linear-gradient(to bottom, ${skyTop}, ${skyBot})`}}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="hillG" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={season==='autumn'?'#a16207':season==='winter'?'#64748b':'#2d6a1f'}/>
            <stop offset="100%" stopColor={season==='autumn'?'#78350f':'#1a4011'}/>
          </linearGradient>
          <linearGradient id="roofR" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#b91c1c"/><stop offset="100%" stopColor="#7f1d1d"/>
          </linearGradient>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="2" dy="3" stdDeviation="3" floodOpacity="0.25"/>
          </filter>
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        {/* Sole */}
        {(weather.current==='sunny'||weather.current==='hot') && (
          <g>
            <circle cx="740" cy="60" r={weather.current==='hot'?40:34} fill={weather.current==='hot'?'#fbbf24':'#fde68a'} opacity="0.9">
              <animate attributeName="r" values="32;37;32" dur="5s" repeatCount="indefinite"/>
            </circle>
            {weather.current==='sunny' && [0,45,90,135,180,225,270,315].map(a=>(
              <line key={a} x1={740+40*Math.cos(a*Math.PI/180)} y1={60+40*Math.sin(a*Math.PI/180)}
                x2={740+53*Math.cos(a*Math.PI/180)} y2={60+53*Math.sin(a*Math.PI/180)}
                stroke="#fde68a" strokeWidth="2.5" opacity="0.55"/>
            ))}
          </g>
        )}

        {/* Nuvole */}
        {['cloudy','rainy','stormy'].includes(weather.current) && (
          <g opacity="0.82">
            <ellipse cx="250" cy="60" rx="110" ry="38" fill="#94a3b8"/>
            <ellipse cx="480" cy="45" rx="130" ry="32" fill="#cbd5e1"/>
            <ellipse cx="680" cy="72" rx="90" ry="30" fill="#94a3b8"/>
          </g>
        )}
        {weather.current==='snowy' && <circle cx="740" cy="60" r="30" fill="white" opacity="0.6"/>}

        {/* Colline sfondo */}
        <ellipse cx="180" cy="200" rx="260" ry="90" fill="url(#hillG)" opacity="0.5"/>
        <ellipse cx="600" cy="190" rx="230" ry="80" fill="url(#hillG)" opacity="0.45"/>

        {/* Terreno */}
        <rect x="0" y="200" width="820" height="300" fill={grass}/>

        {/* Strada in basso */}
        <rect x="0" y="415" width="820" height="85" fill="#9a8468" opacity="0.6"/>
        <line x1="0" y1="432" x2="820" y2="432" stroke="#c4a97d" strokeWidth="2" strokeDasharray="28 18" opacity="0.5"/>
        <line x1="0" y1="455" x2="820" y2="455" stroke="#c4a97d" strokeWidth="1.5" opacity="0.25"/>

        {/* Alberi decorativi */}
        {[[160,210],[162,245],[164,278],[570,215],[572,248],[574,278]].map(([x,y],i)=>(
          <g key={i}>
            <rect x={x-3} y={y+2} width="6" height="20" fill="#6b3a1f"/>
            <circle cx={x} cy={y} r={15} fill={season==='autumn'?'#b45309':season==='winter'?'#94a3b8':'#166534'} opacity="0.85"/>
          </g>
        ))}

        {/* ── PASCOLO ───────────────────────────────────────────────── */}
        <rect x={PX} y={PY} width={PW} height={PH} fill="#4d9e35" opacity="0.38" rx="8"/>
        {/* Recinzione cliccabile */}
        <rect x={PX-3} y={PY-3} width={PW+6} height={PH+6} fill="none" rx="9"
          stroke={fenceCol} strokeWidth={fenceIntegrity<60?2:2.5} strokeDasharray={fenceDash}
          style={{cursor:fenceIntegrity<100?'pointer':'default'}}
          onMouseEnter={()=>hover('fence')} onMouseLeave={()=>hover(null)}
          onClick={e=>{e.stopPropagation();fixFence()}}/>
        {[1,2,3,4,5,6].map(i=>(
          <line key={i} x1={PX+i*51} y1={PY-3} x2={PX+i*51} y2={PY+PH+3}
            stroke={fenceCol} strokeWidth="1.2" opacity="0.4"/>
        ))}
        {hovered==='fence' && fenceIntegrity<100 && (
          <g>
            <rect x={PX+PW/2-80} y={PY-36} width="160" height="22" rx="5" fill="#1f2937" opacity="0.88"/>
            <text x={PX+PW/2} y={PY-21} textAnchor="middle" fontSize="11" fill="white" fontFamily="sans-serif">🔨 Clicca per riparare (€80)</text>
          </g>
        )}
        {/* Zona cliccabile pascolo */}
        <rect x={PX+4} y={PY+4} width={PW-8} height={PH-8} fill="transparent" rx="6"
          style={{cursor:'pointer'}}
          onClick={e=>{e.stopPropagation();setOverlay(o=>o==='flock'?null:'flock')}}/>

        {/* Pecore animate */}
        {sheepPos.map((pos,i)=>{
          const sheep = activeFlock[i]; if(!sheep) return null
          const sc = pos.flip?-1:1
          const bodyC = sheep.mood==='sick'?'#d4a96a':'#f5f5f5'
          return (
            <g key={pos.id} transform={`translate(${pos.x},${pos.y}) scale(${sc},1)`}
              style={{cursor:'pointer'}}
              onClick={e=>{e.stopPropagation();setOverlay(o=>o==='flock'?null:'flock')}}>
              <ellipse cx="0" cy="0" rx="13" ry="8" fill={bodyC}/>
              <circle cx="12" cy="-4" r="5" fill={sheep.isErminia?'#fcd34d':'#e8e8e8'}/>
              <circle cx="14" cy="-5" r="1" fill="#333"/>
              <line x1="-4" y1="7" x2="-4" y2="14" stroke="#888" strokeWidth="1.8"/>
              <line x1="2"  y1="7" x2="2"  y2="14" stroke="#888" strokeWidth="1.8"/>
              <line x1="8"  y1="7" x2="8"  y2="14" stroke="#888" strokeWidth="1.8"/>
              {sheep.isErminia && <text x="0" y="-13" fontSize="9" textAnchor="middle">👑</text>}
              {sheep.mood==='sick' && <text x="0" y="-13" fontSize="9" textAnchor="middle">🤒</text>}
            </g>
          )
        })}

        {/* Bostiano */}
        <text x="365" y="388" fontSize="28" textAnchor="middle" style={{cursor:'default'}}>🧑‍🌾</text>

        {/* ── CASEIFICIO ─────────────────────────────────────────────── */}
        <g style={{cursor:'pointer', filter:hovered==='cas'||overlay==='production'?'drop-shadow(0 0 8px rgba(251,191,36,0.9))':'url(#shadow)'}}
          onMouseEnter={()=>hover('cas')} onMouseLeave={()=>hover(null)}
          onClick={e=>{e.stopPropagation();setOverlay(o=>o==='production'?null:'production')}}>
          {/* Corpo */}
          <rect x="20" y="210" width="130" height="95" fill="#f5deb3" rx="4"/>
          {/* Tetto */}
          <polygon points="8,210 162,210 85,168" fill="url(#roofR)"/>
          {/* Porta */}
          <rect x="65" y="262" width="30" height="43" fill="#5c3317" rx="3"/>
          {/* Finestre */}
          <rect x="25" y="220" width="25" height="20" fill="#93c5fd" opacity="0.85" rx="2"/>
          <rect x="110" y="220" width="25" height="20" fill="#93c5fd" opacity="0.85" rx="2"/>
          {/* Insegna */}
          <rect x="28" y="248" width="104" height="16" fill="#fef3c7" rx="3"/>
          <text x="80" y="260" textAnchor="middle" fontSize="9" fill="#92400e" fontFamily="Georgia,serif" fontWeight="bold">Fontemanna</text>

          {/* Serbatoio latte integrato */}
          <rect x="155" y="232" width="22" height="52" fill="#e2e8f0" rx="5" stroke="#94a3b8" strokeWidth="1.5"/>
          <clipPath id="tankClip"><rect x="156" y="233" width="20" height="50" rx="4"/></clipPath>
          <rect x="156" y={233+(50*(1-milkPct))} width="20" height={50*milkPct}
            fill={milkColor} clipPath="url(#tankClip)" style={{transition:'all 0.6s ease'}}/>
          <rect x="159" y="228" width="14" height="6" fill="#94a3b8" rx="3"/>
          <rect x="159" y="283" width="14" height="6" fill="#94a3b8" rx="3"/>
          <text x="166" y="298" textAnchor="middle" fontSize="7" fill="#475569">🥛</text>

          {/* Badge scorte */}
          {baseRevenue>0 && (
            <g>
              <rect x="30" y="170" width="110" height="18" rx="6" fill="#16a34a" opacity="0.9"/>
              <text x="85" y="183" textAnchor="middle" fontSize="10" fill="white" fontWeight="bold" fontFamily="sans-serif">
                📦 {Math.round(inventory.yogurt+inventory.formaggioFresco+inventory.primoSale+inventory.ricotta)}kg pronti
              </text>
            </g>
          )}

          {/* Hover hint */}
          {hovered==='cas' && overlay!=='production' && (
            <g>
              <rect x="18" y="148" width="148" height="18" rx="4" fill="#1f2937" opacity="0.88"/>
              <text x="92" y="161" textAnchor="middle" fontSize="10" fill="white" fontFamily="sans-serif">🧀 Clicca per produrre</text>
            </g>
          )}
          {overlay==='production' && (
            <rect x="8" y="165" width="172" height="146" fill="none" stroke="#fbbf24" strokeWidth="2.5" rx="6"/>
          )}
        </g>

        {/* ── STALLA ─────────────────────────────────────────────────── */}
        <g filter="url(#shadow)">
          <rect x="665" y="215" width="100" height="72" fill="#c8a96a" rx="3"/>
          <polygon points="652,215 778,215 715,175" fill="url(#roofR)"/>
          <rect x="692" y="246" width="26" height="41" fill="#5c3317" rx="3"/>
          <rect x="668" y="224" width="22" height="18" fill="#93c5fd" opacity="0.8" rx="2"/>
          <rect x="742" y="224" width="22" height="18" fill="#93c5fd" opacity="0.8" rx="2"/>
          <text x="715" y="300" textAnchor="middle" fontSize="9" fill="#5c3317" fontFamily="Georgia,serif">Stalla</text>
        </g>

        {/* ── CLIENTI sulla strada ────────────────────────────────────── */}

        {/* PERUGIA - mercato */}
        <g style={{cursor:hasStock?'pointer':'default', opacity:hasStock?1:0.55}}
          onMouseEnter={()=>hover('pg')} onMouseLeave={()=>hover(null)}
          onClick={e=>{e.stopPropagation();sellAll('perugia')}}>
          {/* Stand mercato */}
          <rect x="605" y="418" width="95" height="50" fill="#fef9c3" rx="4" stroke="#ca8a04" strokeWidth="1.5"/>
          <rect x="595" y="410" width="115" height="14" fill="#ca8a04" rx="3"/>
          {/* Tettoia */}
          <polygon points="593,410 722,410 715,398 600,398" fill="#fbbf24" opacity="0.85"/>
          <text x="653" y="407" textAnchor="middle" fontSize="8" fill="#713f12" fontWeight="bold">Mercato Perugia</text>
          <text x="653" y="440" textAnchor="middle" fontSize="10" fill="#166534">🏪</text>
          {/* Badge prezzo */}
          <rect x="608" y="448" width="90" height="16" rx="5"
            fill={hasStock?'#16a34a':'#9ca3af'} opacity="0.92"/>
          <text x="653" y="460" textAnchor="middle" fontSize="10" fill="white" fontWeight="bold" fontFamily="sans-serif">
            {hasStock?`€${rev.perugia}`:'nessuna scorta'}
          </text>
          {/* Glow on hover */}
          {hovered==='pg' && hasStock && (
            <rect x="593" y="396" width="120" height="74" fill="none" stroke="#fbbf24" strokeWidth="2.5" rx="5"/>
          )}
        </g>

        {/* SPOLETO - ristorante */}
        <g style={{cursor:hasStock?'pointer':'default', opacity:hasStock?1:0.55}}
          onMouseEnter={()=>hover('sp')} onMouseLeave={()=>hover(null)}
          onClick={e=>{e.stopPropagation();sellAll('spoleto')}}>
          {/* Furgone */}
          <rect x="365" y="425" width="110" height="40" fill="#fef2f2" rx="8" stroke="#b91c1c" strokeWidth="1.5"/>
          <rect x="365" y="415" width="75" height="20" fill="#fef2f2" rx="4" stroke="#b91c1c" strokeWidth="1.5"/>
          <circle cx="385" cy="468" r="9" fill="#374151"/>
          <circle cx="455" cy="468" r="9" fill="#374151"/>
          <circle cx="385" cy="468" r="5" fill="#9ca3af"/>
          <circle cx="455" cy="468" r="5" fill="#9ca3af"/>
          <text x="420" y="438" textAnchor="middle" fontSize="8" fill="#7f1d1d" fontWeight="bold">⭐ Rist. Spoleto</text>
          <text x="420" y="450" textAnchor="middle" fontSize="8" fill="#6b7280">+30% prezzo</text>
          {/* Badge prezzo */}
          <rect x="367" y="453" width="106" height="14" rx="4"
            fill={hasStock?'#b91c1c':'#9ca3af'} opacity="0.9"/>
          <text x="420" y="464" textAnchor="middle" fontSize="10" fill="white" fontWeight="bold" fontFamily="sans-serif">
            {hasStock?`€${rev.spoleto}`:'nessuna scorta'}
          </text>
          {hovered==='sp' && hasStock && (
            <rect x="363" y="413" width="116" height="60" fill="none" stroke="#fbbf24" strokeWidth="2.5" rx="9"/>
          )}
        </g>

        {/* GAS - cooperativa locale */}
        <g style={{cursor:hasStock?'pointer':'default', opacity:hasStock?1:0.55}}
          onMouseEnter={()=>hover('gas')} onMouseLeave={()=>hover(null)}
          onClick={e=>{e.stopPropagation();sellAll('gas')}}>
          {/* Cargo bike */}
          <rect x="120" y="432" width="80" height="32" fill="#f0fdf4" rx="6" stroke="#16a34a" strokeWidth="1.5"/>
          <rect x="120" y="424" width="55" height="14" fill="#f0fdf4" rx="3" stroke="#16a34a" strokeWidth="1.5"/>
          <circle cx="135" cy="466" r="8" fill="#374151"/>
          <circle cx="188" cy="466" r="8" fill="#374151"/>
          <circle cx="135" cy="466" r="4.5" fill="#9ca3af"/>
          <circle cx="188" cy="466" r="4.5" fill="#9ca3af"/>
          <text x="160" y="442" textAnchor="middle" fontSize="8" fill="#14532d" fontWeight="bold">🌿 GAS Locale</text>
          <text x="160" y="452" textAnchor="middle" fontSize="7" fill="#6b7280">+10% prezzo</text>
          {/* Badge prezzo */}
          <rect x="121" y="453" width="78" height="14" rx="4"
            fill={hasStock?'#16a34a':'#9ca3af'} opacity="0.9"/>
          <text x="160" y="464" textAnchor="middle" fontSize="10" fill="white" fontWeight="bold" fontFamily="sans-serif">
            {hasStock?`€${rev.gas}`:'nessuna scorta'}
          </text>
          {hovered==='gas' && hasStock && (
            <rect x="118" y="422" width="84" height="52" fill="none" stroke="#fbbf24" strokeWidth="2.5" rx="7"/>
          )}
        </g>

        {/* ── EVENTI ─────────────────────────────────────────────────── */}
        {isWolf && <text x="585" y="398" fontSize="30">🐺</text>}
        {isBoar && <text x="480" y="398" fontSize="30">🐗</text>}

        {/* ── PIOGGIA / NEVE ──────────────────────────────────────────── */}
        {rain.map((r,i)=>(
          <line key={i} x1={r.x} y1={r.y} x2={r.x+1.5} y2={r.y+9}
            stroke={weather.current==='stormy'?'#60a5fa':'#93c5fd'} strokeWidth="1.1" opacity="0.5"/>
        ))}
        {snow.map((s,i)=>(
          <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="white" opacity="0.82"/>
        ))}

        {/* ── BADGE INFO integrati nella mappa ────────────────────────── */}

        {/* Pecore mancanti */}
        {missingCount>0 && (
          <g>
            <rect x="196" y="208" width="130" height="20" rx="6" fill="#dc2626" opacity="0.92"/>
            <text x="261" y="222" textAnchor="middle" fontSize="11" fill="white" fontFamily="sans-serif" fontWeight="bold">
              ⚠ {missingCount} pecor{missingCount===1?'a':'e'} mancant{missingCount===1?'e':'i'}
            </text>
          </g>
        )}

        {/* Recinzione critica */}
        {fenceIntegrity<50 && (
          <g>
            <rect x={PX+PW/2-65} y={PY+PH+6} width="130" height="20" rx="5" fill="#dc2626" opacity="0.88">
              <animate attributeName="opacity" values="0.88;0.4;0.88" dur="1s" repeatCount="indefinite"/>
            </rect>
            <text x={PX+PW/2} y={PY+PH+20} textAnchor="middle" fontSize="11" fill="white" fontFamily="sans-serif" fontWeight="bold">
              🔨 Recinzione critica!
            </text>
          </g>
        )}

        {/* Compliance dots */}
        <g>
          {[compliance.asl, compliance.nas, compliance.forestale, compliance.regione].map((v,i)=>(
            <circle key={i} cx={672+i*12} cy={210} r="5"
              fill={v>70?'#22c55e':v>40?'#f59e0b':'#ef4444'}
              stroke="white" strokeWidth="1"/>
          ))}
          <text x="714" y="214" fontSize="8" fill="#6b7280" fontFamily="sans-serif">norm.</text>
        </g>

        {/* Meteo badge */}
        <text x="760" y="30" fontSize="22" textAnchor="middle">
          {weather.current==='sunny'?'☀️':weather.current==='cloudy'?'☁️':weather.current==='rainy'?'🌧️':weather.current==='stormy'?'⛈️':weather.current==='snowy'?'❄️':'🌡️'}
        </text>

        {/* Giuditta (mercoledì) */}
        {useGameStore.getState().giudittaAvailableDay && (
          <g>
            <rect x="575" y="310" width="100" height="40" fill="#ccfbf1" rx="6" stroke="#14b8a6" strokeWidth="1.5"/>
            <text x="625" y="328" textAnchor="middle" fontSize="9" fill="#0f766e" fontWeight="bold">🩺 Giuditta</text>
            <text x="625" y="342" textAnchor="middle" fontSize="8" fill="#0f766e">disponibile</text>
          </g>
        )}
      </svg>

      {/* ── OVERLAY HTML (sopra la SVG) ──────────────────────────────────── */}
      {overlay === 'production' && (
        <ProductionOverlay onClose={() => setOverlay(null)} />
      )}
      {overlay === 'flock' && (
        <FlockOverlay onClose={() => setOverlay(null)} />
      )}
    </div>
  )
}
