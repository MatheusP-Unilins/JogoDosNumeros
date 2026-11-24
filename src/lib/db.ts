import { neon } from '@neondatabase/serverless';

export interface ScoreEntry {
  id: string;
  player_name: string;
  difficulty: 'iniciante' | 'intermediario' | 'avancado';
  attempts: number;
  secret_number: number;
  created_at: string;
}

// Em memória para desenvolvimento e fallback automático caso o Neon ainda não tenha a DATABASE_URL
let inMemoryScores: ScoreEntry[] = [
  { id: '1', player_name: 'Ana Banana', difficulty: 'iniciante', attempts: 1, secret_number: 7, created_at: new Date(Date.now() - 3600000).toISOString() },
  { id: '2', player_name: 'Carlos Caju', difficulty: 'iniciante', attempts: 2, secret_number: 4, created_at: new Date(Date.now() - 7200000).toISOString() },
  { id: '3', player_name: 'Mari Smoosh', difficulty: 'iniciante', attempts: 3, secret_number: 9, created_at: new Date(Date.now() - 10800000).toISOString() },
  { id: '4', player_name: 'Lucas Pitanga', difficulty: 'intermediario', attempts: 3, secret_number: 42, created_at: new Date(Date.now() - 14400000).toISOString() },
  { id: '5', player_name: 'Beatriz Manga', difficulty: 'intermediario', attempts: 5, secret_number: 88, created_at: new Date(Date.now() - 18000000).toISOString() },
  { id: '6', player_name: 'Rafael Açaí', difficulty: 'intermediario', attempts: 6, secret_number: 19, created_at: new Date(Date.now() - 21600000).toISOString() },
  { id: '7', player_name: 'Mestre dos Números', difficulty: 'avancado', attempts: 6, secret_number: 512, created_at: new Date(Date.now() - 25200000).toISOString() },
  { id: '8', player_name: 'Davi Maracujá', difficulty: 'avancado', attempts: 8, secret_number: 777, created_at: new Date(Date.now() - 28800000).toISOString() },
  { id: '9', player_name: 'Sofia Goiaba', difficulty: 'avancado', attempts: 11, secret_number: 231, created_at: new Date(Date.now() - 32400000).toISOString() },
];

let tableInitialized = false;

export async function getDbClient() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    return null;
  }
  return neon(databaseUrl);
}

export async function ensureScoresTable() {
  const sql = await getDbClient();
  if (!sql) return;

  if (!tableInitialized) {
    await sql`
      CREATE TABLE IF NOT EXISTS scores (
        id SERIAL PRIMARY KEY,
        player_name VARCHAR(100) NOT NULL,
        difficulty VARCHAR(20) NOT NULL,
        attempts INTEGER NOT NULL,
        secret_number INTEGER NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    tableInitialized = true;
  }
}

export async function getScores(difficulty?: string): Promise<ScoreEntry[]> {
  try {
    const sql = await getDbClient();
    if (sql) {
      await ensureScoresTable();
      let rows;
      if (difficulty) {
        rows = await sql`
          SELECT id::text, player_name, difficulty, attempts, secret_number, created_at
          FROM scores
          WHERE difficulty = ${difficulty}
          ORDER BY attempts ASC, created_at ASC
          LIMIT 100
        `;
      } else {
        rows = await sql`
          SELECT id::text, player_name, difficulty, attempts, secret_number, created_at
          FROM scores
          ORDER BY attempts ASC, created_at ASC
          LIMIT 100
        `;
      }
      return rows as ScoreEntry[];
    }
  } catch (error) {
    console.error('Erro ao buscar scores no Neon, utilizando fallback:', error);
  }

  // Fallback em memória
  let filtered = [...inMemoryScores];
  if (difficulty) {
    filtered = filtered.filter((s) => s.difficulty === difficulty);
  }
  return filtered.sort((a, b) => a.attempts - b.attempts);
}

export async function saveScore(score: Omit<ScoreEntry, 'id' | 'created_at'>): Promise<ScoreEntry> {
  try {
    const sql = await getDbClient();
    if (sql) {
      await ensureScoresTable();
      const rows = await sql`
        INSERT INTO scores (player_name, difficulty, attempts, secret_number)
        VALUES (${score.player_name}, ${score.difficulty}, ${score.attempts}, ${score.secret_number})
        RETURNING id::text, player_name, difficulty, attempts, secret_number, created_at
      `;
      return rows[0] as ScoreEntry;
    }
  } catch (error) {
    console.error('Erro ao salvar score no Neon, utilizando fallback:', error);
  }

  // Fallback em memória
  const newEntry: ScoreEntry = {
    id: Math.random().toString(36).substring(2, 9),
    ...score,
    created_at: new Date().toISOString(),
  };
  inMemoryScores.push(newEntry);
  return newEntry;
}
