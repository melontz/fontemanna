import { Sheep } from './types'

const SHEEP_NAMES = [
  'Erminia', 'Palmira', 'Iolanda', 'Zelinda', 'Assunta', 'Derna',
  'Olinda', 'Norma', 'Elvira', 'Tosca', 'Amalia', 'Concetta',
  'Albina', 'Secondina', 'Adelina', 'Filomena', 'Immacolata', 'Serafina',
  'Giuseppina', 'Clotilde', 'Enrichetta', 'Florinda', 'Genoveffa', 'Ida',
  'Leopoldina', 'Modesta', 'Nunzia', 'Ornella', 'Pina', 'Quirina',
]

export function createInitialFlock(): Sheep[] {
  return SHEEP_NAMES.slice(0, 22).map((name, i) => ({
    id: `sheep-${i}`,
    name,
    health: 85 + Math.floor(Math.random() * 15),
    milkProduction: 1.5 + Math.random() * 1.2,
    mood: 'happy' as const,
    age: 1 + Math.floor(Math.random() * 5),
    isErminia: name === 'Erminia',
  }))
}
