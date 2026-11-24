export type DifficultyKey = 'iniciante' | 'intermediario' | 'avancado';

export interface DifficultyConfig {
  key: DifficultyKey;
  label: string;
  min: number;
  max: number;
  maxAttempts: number;
  color: string;
  badgeBg: string;
  cupColor: string;
  description: string;
  fruit: string;
}

export const DIFFICULTIES: Record<DifficultyKey, DifficultyConfig> = {
  iniciante: {
    key: 'iniciante',
    label: 'Iniciante',
    min: 1,
    max: 10,
    maxAttempts: 5,
    color: 'border-cajua-yellow bg-cajua-yellow/15 text-yellow-800',
    badgeBg: 'bg-cajua-yellow text-cajua-charcoal',
    cupColor: '#FFCA28',
    description: 'Número de 1 a 10 • 5 chances',
    fruit: '🍌 Banana Smoosh',
  },
  intermediario: {
    key: 'intermediario',
    label: 'Intermediário',
    min: 1,
    max: 100,
    maxAttempts: 10,
    color: 'border-cajua-orange bg-cajua-orange/15 text-orange-800',
    badgeBg: 'bg-cajua-orange text-white',
    cupColor: '#FF7043',
    description: 'Número de 1 a 100 • 10 chances',
    fruit: '🍊 Caju Brasil',
  },
  avancado: {
    key: 'avancado',
    label: 'Avançado',
    min: 1,
    max: 1000,
    maxAttempts: 15,
    color: 'border-cajua-blue bg-cajua-blue/15 text-blue-800',
    badgeBg: 'bg-cajua-blue text-white',
    cupColor: '#1E88E5',
    description: 'Número de 1 a 1.000 • 15 chances',
    fruit: '🫐 Mirtilo Tropical',
  },
};

export interface GuessRecord {
  value: number;
  feedback: string;
  type: 'higher' | 'lower' | 'correct';
  guessNumber: number;
}
