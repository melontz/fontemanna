'use client'
import { useEffect, useRef, useState } from 'react'
import { useGameStore } from '@/lib/store/gameStore'
import { Sheep, Weather } from '@/lib/data/types'

interface SheepPos { id: string; x: number; y: number; dx: number; dy: number; flip: boolean }

function randomInRange(min: number, max: number) {
  return min + Math.random() * (max - min)
}

const PASTURE_X = 80
const PASTURE_Y = 180
const PASTURE_W = 420
const PASTURE_H = 200

function initSheepPositions(flock: Sheep[]): SheepPos[] {
  return flock.map(s => ({
    id: s.id,
    x: randomInRange(PASTURE_X + 20, PASTURE_X + PASTURE_W - 40),
    y: randomInRange(PASTURE_Y + 20, PASTURE_Y + PASTURE_H - 40),
    dx: (Math.random() - 0.5) * 0.4,
    dy: (Math.random() - 0.5) * 0.2,
    flip: Math.random() > 0.5,
  }))
}

function skyColor(weather: Weather, hour: number): string {
  if (weather === 'stormy') return '#4a5568'
  if (weather === 'rainy') return '#718096'
  if (weather === 'snowy') return '#e2e8f0'
  if (weather === 'hot') return '#fef3c7'
  if (hour < 6 || hour > 20) return '#1e3a5f'
  if (hour < 8) return '#f97316'
  return '#87ceeb'
}

function pastureColor(weather: Weather, season: string): string {
  if (weather === 'snowy') return '#f0f4f8'
  if (season === 'winter') return '#9ca3af'
  if (season === 'summer' && weather === 'hot') return '#d4a96a'
  if (season === 'autumn') return '#a8793a'
  return '#5a8a3c'
}

export default function GameMap() {
  const { flock, weather, season, fenceIntegrity, activeEvent } = useGameStore()
  const [positions, setPositions] = useState<SheepPos[]>([])
  const [hour, setHour] = useState(10)
  const [rain, setRain] = useState<{x:number;y:number;len:number}[]>([])
  const [wolfVisible, setWolfVisible] = useState(false)
  const animRef = useRef<number | null>(null)
  const frameRef = useRef(0)

  useEffect(() => {
    setPositions(initSheepPositions(flock))
  }, [flock.length])

  useEffect(() => {
    setWolfVisible(activeEvent?.type === 'wolf')
  }, [activeEvent])

  useEffect(() => {
    if (weather.current === 'rainy' || weather.current === 'stormy') {
      setRain(Array.from({ length: 40 }, () => ({
        x: Math.random() * 620,
        y: Math.random() * 420,
        len: 8 + Math.random() * 12,
      })))
    } else {
      setRain([])
    }
  }, [weather.current])

  useEffect(() => {
    function tick() {
      frameRef.current++
      if (frameRef.current % 3 === 0) {
        setPositions(prev => prev.map(p => {
          let nx = p.x + p.dx
          let ny = p.y + p.dy
          let dx = p.dx
          let dy = p.dy
          let flip = p.flip

          if (nx < PASTURE_X + 10 || nx > PASTURE_X + PASTURE_W - 30) {
            dx = -dx; flip = !flip
          }
          if (ny < PASTURE_Y + 10 || ny > PASTURE_Y + PASTURE_H - 30) {
            dy = -dy
          }
          if (Math.random() < 0.01) { dx = (Math.random() - 0.5) * 0.5; dy = (Math.random() - 0.5) * 0.25 }

          return { ...p, x: nx, y: ny, dx, dy, flip }
        }))
      }
      if (frameRef.current % 180 === 0) {
        setHour(h => (h + 1) % 24)
      }
      if (frameRef.current % 8 === 0 && rain.length > 0) {
        setRain(prev => prev.map(r => ({
          ...r,
          y: r.y + 6 > 420 ? 0 : r.y + 6,
          x: r.x + 1 > 620 ? 0 : r.x + 1,
        })))
      }
      animRef.current = requestAnimationFrame(tick)
    }
    animRef.current = requestAnimationFrame(tick)
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current) }
  }, [rain.length])

  const sky = skyColor(weather.current, hour)
  const grass = pastureColor(weather.current, season)
  const activeFlock = flock.filter(s => s.mood !== 'missing')
  const missingCount = flock.filter(s => s.mood === 'missing').length

  return (
    <div className="relative w-full">
      <svg viewBox="0 0 620 420" className="w-full rounded-xl shadow-2xl border-2 border-amber-800/40" style={{ background: sky }}>

        {/* Cielo — sfumatura */}
        <defs>
          <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={sky} />
            <stop offset="100%" stopColor={weather.current === 'sunny' ? '#c8e6fa' : sky} />
          </linearGradient>
          <linearGradient id="hillGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={grass} />
            <stop offset="100%" stopColor="#3d6b28" />
          </linearGradient>
          <linearGradient id="roofGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c0392b" />
            <stop offset="100%" stopColor="#922b21" />
          </linearGradient>
        </defs>

        <rect width="620" height="420" fill="url(#skyGrad)" />

        {/* Sole / Luna */}
        {weather.current === 'sunny' || weather.current === 'hot' ? (
          <circle cx="540" cy="60" r="38" fill="#fde68a" opacity="0.9">
            <animate attributeName="r" values="36;40;36" dur="4s" repeatCount="indefinite" />
          </circle>
        ) : weather.current === 'snowy' ? (
          <circle cx="540" cy="60" r="30" fill="white" opacity="0.7" />
        ) : null}

        {/* Colline sfondo */}
        <ellipse cx="160" cy="185" rx="200" ry="70" fill="#4a7c35" opacity="0.6" />
        <ellipse cx="480" cy="175" rx="180" ry="65" fill="#3d6b28" opacity="0.6" />

        {/* Terreno principale */}
        <rect x="0" y="185" width="620" height="235" fill={grass} />

        {/* Striscia strada */}
        <rect x="0" y="360" width="620" height="60" fill="#8b7355" opacity="0.5" />

        {/* Pascolo recintato */}
        <rect x={PASTURE_X} y={PASTURE_Y} width={PASTURE_W} height={PASTURE_H}
          fill="#6ab04c" opacity="0.55" rx="6" />

        {/* Recinzione */}
        {[0, 1, 2, 3, 4, 5, 6].map(i => {
          const damaged = fenceIntegrity < 50 && i % 3 === 2
          const slightDamage = fenceIntegrity < 80 && i % 5 === 1
          return (
            <g key={i}>
              <line
                x1={PASTURE_X + i * 60} y1={PASTURE_Y}
                x2={PASTURE_X + i * 60} y2={PASTURE_Y + PASTURE_H}
                stroke={damaged ? '#d97706' : slightDamage ? '#92400e' : '#5c3317'}
                strokeWidth={damaged ? 1 : 2}
                strokeDasharray={damaged ? '4 4' : 'none'}
              />
            </g>
          )
        })}
        <rect x={PASTURE_X} y={PASTURE_Y} width={PASTURE_W} height={PASTURE_H}
          fill="none" rx="6"
          stroke={fenceIntegrity > 70 ? '#5c3317' : fenceIntegrity > 40 ? '#d97706' : '#ef4444'}
          strokeWidth="2.5" />

        {/* Stalla */}
        <rect x="530" y="200" width="75" height="60" fill="#c8a96a" />
        <polygon points="520,200 615,200 567,165" fill="url(#roofGrad)" />
        <rect x="548" y="230" width="18" height="30" fill="#5c3317" />
        <rect x="534" y="208" width="18" height="16" fill="#87ceeb" opacity="0.7" />
        <text x="567" y="278" textAnchor="middle" fontSize="9" fill="#5c3317" fontFamily="serif">Stalla</text>

        {/* Caseificio */}
        <rect x="10" y="195" width="65" height="75" fill="#f5deb3" />
        <polygon points="0,195 85,195 42,160" fill="url(#roofGrad)" />
        <rect x="30" y="235" width="22" height="35" fill="#5c3317" />
        <rect x="12" y="205" width="16" height="14" fill="#87ceeb" opacity="0.7" />
        <rect x="50" y="205" width="16" height="14" fill="#87ceeb" opacity="0.7" />
        <text x="42" y="282" textAnchor="middle" fontSize="8" fill="#5c3317" fontFamily="serif">Fontemanna</text>

        {/* Pecore animate */}
        {positions.map((pos, i) => {
          const sheep = activeFlock[i]
          if (!sheep) return null
          const isErminia = sheep?.isErminia
          const isSick = sheep?.mood === 'sick'
          const scale = pos.flip ? -1 : 1
          return (
            <g key={pos.id} transform={`translate(${pos.x}, ${pos.y}) scale(${scale}, 1)`}>
              {/* corpo */}
              <ellipse cx="0" cy="0" rx="14" ry="9" fill={isSick ? '#d4a96a' : '#f5f5f5'} />
              {/* testa */}
              <circle cx="13" cy="-4" r="6" fill={isErminia ? '#fcd34d' : '#e8e8e8'} />
              {/* occhio */}
              <circle cx="16" cy="-5" r="1" fill="#333" />
              {/* zampe */}
              <line x1="-6" y1="8" x2="-6" y2="16" stroke="#888" strokeWidth="2" />
              <line x1="2" y1="8" x2="2" y2="16" stroke="#888" strokeWidth="2" />
              <line x1="8" y1="8" x2="8" y2="16" stroke="#888" strokeWidth="2" />
              {/* corona Erminia */}
              {isErminia && (
                <text x="0" y="-14" fontSize="10" textAnchor="middle">👑</text>
              )}
            </g>
          )
        })}

        {/* Lupo */}
        {wolfVisible && (
          <g>
            <animateTransform />
            <ellipse cx="560" cy="350" rx="22" ry="10" fill="#555">
              <animate attributeName="cx" values="580;540;580" dur="3s" repeatCount="indefinite" />
            </ellipse>
            <circle cx="577" cy="344" r="10" fill="#666">
              <animate attributeName="cx" values="597;557;597" dur="3s" repeatCount="indefinite" />
            </circle>
            <text x="560" y="335" fontSize="22" textAnchor="middle">
              🐺
              <animate attributeName="x" values="580;540;580" dur="3s" repeatCount="indefinite" />
            </text>
          </g>
        )}

        {/* Cinghiale */}
        {activeEvent?.type === 'boar' && (
          <text x="430" y="375" fontSize="26" textAnchor="middle">
            🐗
          </text>
        )}

        {/* Pioggia */}
        {rain.map((r, i) => (
          <line key={i} x1={r.x} y1={r.y} x2={r.x + 2} y2={r.y + r.len}
            stroke={weather.current === 'stormy' ? '#60a5fa' : '#93c5fd'}
            strokeWidth="1" opacity="0.6" />
        ))}

        {/* Neve */}
        {weather.current === 'snowy' && Array.from({ length: 25 }).map((_, i) => (
          <circle key={i} cx={(i * 37 + frameRef.current * 0.5) % 620} cy={(i * 19 + frameRef.current) % 420}
            r="2.5" fill="white" opacity="0.8" />
        ))}

        {/* Bostiano */}
        <text x="200" y="375" fontSize="26" textAnchor="middle">🧑‍🌾</text>

        {/* Indicatore pecore mancanti */}
        {missingCount > 0 && (
          <g>
            <rect x="8" y="8" width="120" height="24" rx="4" fill="#ef4444" opacity="0.9" />
            <text x="68" y="25" textAnchor="middle" fontSize="11" fill="white" fontFamily="sans-serif">
              {missingCount} pec. mancant{missingCount === 1 ? 'e' : 'i'}
            </text>
          </g>
        )}

        {/* Indicatore meteo */}
        <text x="598" y="24" fontSize="20" textAnchor="middle">
          {weather.current === 'sunny' ? '☀️'
            : weather.current === 'cloudy' ? '☁️'
            : weather.current === 'rainy' ? '🌧️'
            : weather.current === 'stormy' ? '⛈️'
            : weather.current === 'snowy' ? '❄️'
            : '🌡️'}
        </text>
      </svg>
    </div>
  )
}
