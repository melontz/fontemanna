'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { useGameStore } from '@/lib/store/gameStore'
import { Weather } from '@/lib/data/types'

interface SheepPos { id: string; x: number; y: number; dx: number; dy: number; flip: boolean; panic: boolean }

const PX = 85, PY = 175, PW = 400, PH = 195

function randomInRange(min: number, max: number) {
  return min + Math.random() * (max - min)
}

function skyGradient(weather: Weather, season: string): [string, string] {
  if (weather === 'stormy') return ['#374151', '#4b5563']
  if (weather === 'rainy') return ['#6b7280', '#9ca3af']
  if (weather === 'snowy') return ['#bfdbfe', '#e0f2fe']
  if (weather === 'hot') return ['#fbbf24', '#fed7aa']
  if (season === 'winter') return ['#bfdbfe', '#dbeafe']
  if (season === 'autumn') return ['#f59e0b', '#fcd34d']
  return ['#38bdf8', '#7dd3fc']
}

function pastureColor(weather: Weather, season: string): string {
  if (weather === 'snowy') return '#e2e8f0'
  if (season === 'winter') return '#9ca3af'
  if (season === 'summer' && weather === 'hot') return '#c9a84c'
  if (season === 'autumn') return '#8b6914'
  return '#4d8c3f'
}

export default function GameMap() {
  const { flock, weather, season, fenceIntegrity, activeEvent, setPanel, activePanel, fixFence } = useGameStore()
  const [positions, setPositions] = useState<SheepPos[]>([])
  const [hovered, setHovered] = useState<string | null>(null)
  const [rainDrops, setRainDrops] = useState<{ x: number; y: number }[]>([])
  const [snowFlakes, setSnowFlakes] = useState<{ x: number; y: number; r: number }[]>([])
  const animRef = useRef<number | null>(null)
  const frameRef = useRef(0)

  useEffect(() => {
    const activeFlock = flock.filter(s => s.mood !== 'missing')
    setPositions(activeFlock.map(s => ({
      id: s.id,
      x: randomInRange(PX + 20, PX + PW - 40),
      y: randomInRange(PY + 20, PY + PH - 40),
      dx: (Math.random() - 0.5) * 0.35,
      dy: (Math.random() - 0.5) * 0.18,
      flip: Math.random() > 0.5,
      panic: false,
    })))
  }, [flock.length])

  useEffect(() => {
    if (weather.current === 'rainy' || weather.current === 'stormy') {
      setRainDrops(Array.from({ length: 55 }, () => ({ x: Math.random() * 620, y: Math.random() * 420 })))
    } else setRainDrops([])
    if (weather.current === 'snowy') {
      setSnowFlakes(Array.from({ length: 30 }, () => ({ x: Math.random() * 620, y: Math.random() * 420, r: 1.5 + Math.random() * 2.5 })))
    } else setSnowFlakes([])
  }, [weather.current])

  const isWolfEvent = activeEvent?.type === 'wolf'
  const isBoarEvent = activeEvent?.type === 'boar'
  const isEscapeEvent = activeEvent?.type === 'escape'

  useEffect(() => {
    function tick() {
      frameRef.current++
      if (frameRef.current % 2 === 0) {
        setPositions(prev => prev.map(p => {
          const panic = isWolfEvent || isEscapeEvent
          const speed = panic ? 1.2 : 0.35
          let nx = p.x + p.dx * speed
          let ny = p.y + p.dy * speed
          let dx = p.dx, dy = p.dy, flip = p.flip
          if (nx < PX + 8 || nx > PX + PW - 32) { dx = -dx; flip = !flip }
          if (ny < PY + 8 || ny > PY + PH - 28) dy = -dy
          if (Math.random() < 0.008) { dx = (Math.random() - 0.5) * 0.5; dy = (Math.random() - 0.5) * 0.25 }
          return { ...p, x: nx, y: ny, dx, dy, flip, panic }
        }))
      }
      if (frameRef.current % 5 === 0 && rainDrops.length > 0) {
        setRainDrops(prev => prev.map(r => ({
          x: (r.x + 1.5) > 620 ? 0 : r.x + 1.5,
          y: (r.y + 8) > 420 ? 0 : r.y + 8,
        })))
      }
      if (frameRef.current % 8 === 0 && snowFlakes.length > 0) {
        setSnowFlakes(prev => prev.map(s => ({
          ...s,
          x: (s.x + 0.5) > 620 ? 0 : s.x + 0.5,
          y: (s.y + 1.2) > 420 ? 0 : s.y + 1.2,
        })))
      }
      animRef.current = requestAnimationFrame(tick)
    }
    animRef.current = requestAnimationFrame(tick)
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current) }
  }, [rainDrops.length, snowFlakes.length, isWolfEvent, isEscapeEvent])

  const activeFlock = flock.filter(s => s.mood !== 'missing')
  const missingCount = flock.filter(s => s.mood === 'missing').length
  const [skyTop, skyBot] = skyGradient(weather.current, season)
  const grass = pastureColor(weather.current, season)
  const fenceColor = fenceIntegrity < 40 ? '#ef4444' : fenceIntegrity < 70 ? '#f59e0b' : '#78350f'
  const fenceDash = fenceIntegrity < 50 ? '6 4' : 'none'

  const buildingHighlight = useCallback((name: string) =>
    hovered === name ? 'brightness(1.15) drop-shadow(0 0 6px rgba(251,191,36,0.8))' : 'none'
  , [hovered])

  const panelActive = useCallback((name: string) =>
    activePanel === name ? 'drop-shadow(0 0 8px rgba(251,191,36,1))' : 'none'
  , [activePanel])

  return (
    <div className="relative w-full select-none">
      <svg
        viewBox="0 0 620 420"
        className="w-full rounded-2xl shadow-2xl border-2 border-amber-800/30"
        style={{ background: `linear-gradient(to bottom, ${skyTop}, ${skyBot})` }}
      >
        <defs>
          <linearGradient id="hillL" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={season === 'autumn' ? '#a16207' : '#3d6b28'} />
            <stop offset="100%" stopColor={season === 'autumn' ? '#78350f' : '#2d5016'} />
          </linearGradient>
          <filter id="glow"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
        </defs>

        {/* Sole / Luna */}
        {(weather.current === 'sunny' || weather.current === 'hot') && (
          <g>
            <circle cx="555" cy="55" r="34" fill={weather.current === 'hot' ? '#fbbf24' : '#fde68a'} opacity="0.95">
              <animate attributeName="r" values="32;36;32" dur="5s" repeatCount="indefinite" />
            </circle>
            {weather.current === 'sunny' && [0,45,90,135,180,225,270,315].map(a => (
              <line key={a}
                x1={555 + 38 * Math.cos(a * Math.PI/180)} y1={55 + 38 * Math.sin(a * Math.PI/180)}
                x2={555 + 50 * Math.cos(a * Math.PI/180)} y2={55 + 50 * Math.sin(a * Math.PI/180)}
                stroke="#fde68a" strokeWidth="2.5" opacity="0.6"
              />
            ))}
          </g>
        )}
        {weather.current === 'snowy' && (
          <circle cx="555" cy="55" r="28" fill="white" opacity="0.6" />
        )}

        {/* Nuvole */}
        {(weather.current === 'cloudy' || weather.current === 'rainy' || weather.current === 'stormy') && (
          <g opacity="0.85">
            <ellipse cx="200" cy="55" rx="90" ry="32" fill="#94a3b8" />
            <ellipse cx="420" cy="40" rx="110" ry="28" fill="#cbd5e1" />
            <ellipse cx="560" cy="70" rx="70" ry="25" fill="#94a3b8" />
          </g>
        )}

        {/* Colline sfondo */}
        <ellipse cx="160" cy="190" rx="220" ry="75" fill="url(#hillL)" opacity="0.55" />
        <ellipse cx="490" cy="180" rx="190" ry="68" fill="url(#hillL)" opacity="0.5" />

        {/* Terreno */}
        <rect x="0" y="188" width="620" height="232" fill={grass} />

        {/* Strada bassa */}
        <rect x="0" y="365" width="620" height="55" fill="#92795a" opacity="0.45" />
        <line x1="0" y1="380" x2="620" y2="380" stroke="#a8956b" strokeWidth="1.5" strokeDasharray="20 12" opacity="0.5" />

        {/* Pascolo */}
        <rect x={PX} y={PY} width={PW} height={PH} fill="#5fa832" opacity="0.45" rx="8" />

        {/* Recinzione interattiva */}
        <rect
          x={PX - 2} y={PY - 2} width={PW + 4} height={PH + 4}
          fill="none" rx="9"
          stroke={fenceColor}
          strokeWidth={fenceIntegrity < 60 ? 2 : 3}
          strokeDasharray={fenceDash}
          style={{ cursor: fenceIntegrity < 100 ? 'pointer' : 'default', filter: hovered === 'fence' ? 'drop-shadow(0 0 5px #ef4444)' : 'none' }}
          onMouseEnter={() => setHovered('fence')}
          onMouseLeave={() => setHovered(null)}
          onClick={fixFence}
        />
        {[1,2,3,4,5,6].map(i => (
          <line key={i}
            x1={PX + i * 57} y1={PY - 2}
            x2={PX + i * 57} y2={PY + PH + 2}
            stroke={fenceColor} strokeWidth="1.5" opacity="0.5"
          />
        ))}

        {/* Tooltip recinzione */}
        {hovered === 'fence' && fenceIntegrity < 100 && (
          <g>
            <rect x={PX + PW/2 - 70} y={PY - 36} width="140" height="24" rx="5" fill="#1f2937" opacity="0.85" />
            <text x={PX + PW/2} y={PY - 20} textAnchor="middle" fontSize="10" fill="white" fontFamily="sans-serif">
              🔨 Clicca per riparare (€80)
            </text>
          </g>
        )}

        {/* Alberi decorativi */}
        {[[45,220],[46,250],[47,280],[550,205],[552,240]].map(([x,y],i) => (
          <g key={i}>
            <rect x={x-3} y={y} width="6" height="18" fill="#78350f" />
            <circle cx={x} cy={y} r="14" fill={season==='autumn'?'#ca8a04':season==='winter'?'#94a3b8':'#15803d'} opacity="0.85" />
          </g>
        ))}

        {/* CASEIFICIO — cliccabile */}
        <g
          style={{ cursor: 'pointer', filter: panelActive('production') || buildingHighlight('caseificio') }}
          onMouseEnter={() => setHovered('caseificio')}
          onMouseLeave={() => setHovered(null)}
          onClick={() => setPanel(activePanel === 'production' ? null : 'production')}
        >
          <rect x="8" y="192" width="70" height="78" fill="#f5deb3" rx="3" />
          <polygon points="0,192 88,192 44,155" fill="#b91c1c" />
          <rect x="28" y="232" width="24" height="38" fill="#5c3317" />
          <rect x="10" y="202" width="18" height="16" fill="#93c5fd" opacity="0.8" />
          <rect x="52" y="202" width="18" height="16" fill="#93c5fd" opacity="0.8" />
          <text x="44" y="283" textAnchor="middle" fontSize="8" fill="#5c3317" fontFamily="Georgia,serif" fontWeight="bold">Fontemanna</text>
          {activePanel === 'production' && (
            <rect x="4" y="150" width="80" height="124" fill="none" stroke="#fbbf24" strokeWidth="2.5" rx="5" />
          )}
          {hovered === 'caseificio' && activePanel !== 'production' && (
            <g>
              <rect x="0" y="135" width="100" height="20" rx="4" fill="#1f2937" opacity="0.85" />
              <text x="50" y="149" textAnchor="middle" fontSize="9" fill="white" fontFamily="sans-serif">🧀 Apri Caseificio</text>
            </g>
          )}
        </g>

        {/* STALLA — cliccabile */}
        <g
          style={{ cursor: 'pointer', filter: panelActive('market') || buildingHighlight('stalla') }}
          onMouseEnter={() => setHovered('stalla')}
          onMouseLeave={() => setHovered(null)}
          onClick={() => setPanel(activePanel === 'market' ? null : 'market')}
        >
          <rect x="540" y="198" width="72" height="65" fill="#c8a96a" rx="3" />
          <polygon points="528,198 622,198 575,162" fill="#b91c1c" />
          <rect x="554" y="228" width="20" height="35" fill="#5c3317" />
          <rect x="542" y="208" width="18" height="16" fill="#93c5fd" opacity="0.8" />
          <text x="576" y="277" textAnchor="middle" fontSize="8" fill="#5c3317" fontFamily="Georgia,serif" fontWeight="bold">Stalla</text>
          {activePanel === 'market' && (
            <rect x="525" y="158" width="98" height="120" fill="none" stroke="#fbbf24" strokeWidth="2.5" rx="5" />
          )}
          {hovered === 'stalla' && activePanel !== 'market' && (
            <g>
              <rect x="510" y="143" width="120" height="20" rx="4" fill="#1f2937" opacity="0.85" />
              <text x="570" y="157" textAnchor="middle" fontSize="9" fill="white" fontFamily="sans-serif">🛒 Apri Mercato</text>
            </g>
          )}
        </g>

        {/* GREGGE — area cliccabile */}
        <rect
          x={PX + 5} y={PY + 5} width={PW - 10} height={PH - 10}
          fill="transparent" rx="6"
          style={{ cursor: 'pointer' }}
          onClick={() => setPanel(activePanel === 'flock' ? null : 'flock')}
        />

        {/* Pecore */}
        {positions.map((pos, i) => {
          const sheep = activeFlock[i]
          if (!sheep) return null
          const scale = pos.flip ? -1 : 1
          const bodyColor = sheep.mood === 'sick' ? '#d4a96a' : sheep.mood === 'nervous' ? '#e5e7eb' : '#f5f5f5'
          return (
            <g key={pos.id} transform={`translate(${pos.x},${pos.y}) scale(${scale},1)`}
              style={{ cursor: 'pointer' }}
              onClick={() => setPanel(activePanel === 'flock' ? null : 'flock')}
            >
              <ellipse cx="0" cy="0" rx="13" ry="8" fill={bodyColor} />
              <circle cx="12" cy="-4" r="5.5" fill={sheep.isErminia ? '#fcd34d' : '#e8e8e8'} />
              <circle cx="14.5" cy="-5" r="1" fill="#333" />
              <line x1="-5" y1="7" x2="-5" y2="14" stroke="#888" strokeWidth="1.8" />
              <line x1="2" y1="7" x2="2" y2="14" stroke="#888" strokeWidth="1.8" />
              <line x1="7" y1="7" x2="7" y2="14" stroke="#888" strokeWidth="1.8" />
              {sheep.isErminia && <text x="0" y="-14" fontSize="9" textAnchor="middle">👑</text>}
              {sheep.mood === 'sick' && <text x="0" y="-14" fontSize="9" textAnchor="middle">🤒</text>}
            </g>
          )
        })}

        {/* Bostiano */}
        <text x="220" y="374" fontSize="28" style={{ cursor: 'default' }}>🧑‍🌾</text>

        {/* Lupo */}
        {isWolfEvent && (
          <text fontSize="28" textAnchor="middle">
            <animate attributeName="x" values="600;560;600" dur="2.5s" repeatCount="indefinite" />
            <animate attributeName="y" values="355;350;355" dur="2.5s" repeatCount="indefinite" />
            🐺
          </text>
        )}
        {isWolfEvent && (
          <g>
            <text x="575" y="355" fontSize="26">🐺</text>
            <animateTransform attributeName="transform" type="translate" values="0,0;-8,0;0,0" dur="2s" repeatCount="indefinite" />
          </g>
        )}

        {/* Cinghiale */}
        {isBoarEvent && <text x="430" y="375" fontSize="28">🐗</text>}

        {/* Pioggia */}
        {rainDrops.map((r, i) => (
          <line key={i} x1={r.x} y1={r.y} x2={r.x + 1.5} y2={r.y + 9}
            stroke={weather.current === 'stormy' ? '#60a5fa' : '#93c5fd'}
            strokeWidth="1.2" opacity="0.55" />
        ))}

        {/* Neve */}
        {snowFlakes.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="white" opacity="0.85" />
        ))}

        {/* Badge pecore mancanti */}
        {missingCount > 0 && (
          <g>
            <rect x="8" y="8" width="130" height="26" rx="6" fill="#dc2626" opacity="0.92" />
            <text x="73" y="26" textAnchor="middle" fontSize="11" fill="white" fontFamily="sans-serif" fontWeight="bold">
              ⚠ {missingCount} pec. mancant{missingCount === 1 ? 'e' : 'i'}
            </text>
          </g>
        )}

        {/* Indicatore recinzione danneggiata */}
        {fenceIntegrity < 50 && (
          <g>
            <rect x={PX + PW/2 - 55} y={PY + PH + 6} width="110" height="20" rx="5" fill="#dc2626" opacity="0.88">
              <animate attributeName="opacity" values="0.88;0.5;0.88" dur="1s" repeatCount="indefinite" />
            </rect>
            <text x={PX + PW/2} y={PY + PH + 20} textAnchor="middle" fontSize="10" fill="white" fontFamily="sans-serif">
              🔨 Recinzione critica!
            </text>
          </g>
        )}

        {/* Meteo icona */}
        <text x="595" y="28" fontSize="22" textAnchor="middle">
          {weather.current === 'sunny' ? '☀️' : weather.current === 'cloudy' ? '☁️' : weather.current === 'rainy' ? '🌧️' : weather.current === 'stormy' ? '⛈️' : weather.current === 'snowy' ? '❄️' : '🌡️'}
        </text>
      </svg>

      {/* Legenda interattività */}
      <div className="flex gap-3 mt-1.5 text-xs text-amber-700 justify-center flex-wrap">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />Clic sul caseificio → produzione</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />Clic sulla stalla → mercato</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />Clic sul pascolo → gregge</span>
        {fenceIntegrity < 100 && <span className="flex items-center gap-1 text-red-600 font-medium"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" />Clic sulla recinzione → ripara</span>}
      </div>
    </div>
  )
}
