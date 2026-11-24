import { neon } from '@neondatabase/serverless';

export interface ScoreEntry {
  id: string;
  player_name: string;
  difficulty: 'iniciante' | 'intermediario' | 'avancado';
  attempts: number;
  secret_number: number;
  created_at: string;
}

// Fallback em memória inicial
let inMemoryScores: ScoreEntry[] = [];

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

export async function resetScores(difficulty?: string): Promise<boolean> {
  try {
    const sql = await getDbClient();
    if (sql) {
      await ensureScoresTable();
      if (difficulty) {
        await sql`DELETE FROM scores WHERE difficulty = ${difficulty}`;
      } else {
        await sql`TRUNCATE TABLE scores RESTART IDENTITY`;
      }
      return true;
    }
  } catch (error) {
    console.error('Erro ao resetar scores no Neon, resetando fallback:', error);
  }

  // Reset em memória
  if (difficulty) {
    inMemoryScores = inMemoryScores.filter((s) => s.difficulty !== difficulty);
  } else {
    inMemoryScores = [];
  }
  return true;
}
