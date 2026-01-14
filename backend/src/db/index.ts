import pg from 'pg'
import { config } from '../config.js'

const { Pool } = pg

export const pool = new Pool({
  connectionString: config.databaseUrl,
})

// Test connection
pool.on('connect', () => {
  console.log('Connected to PostgreSQL')
})

pool.on('error', (err) => {
  console.error('PostgreSQL pool error:', err)
})

export async function query<T = unknown>(
  text: string,
  params?: unknown[]
): Promise<pg.QueryResult<T>> {
  const start = Date.now()
  const result = await pool.query<T>(text, params)
  const duration = Date.now() - start

  if (config.nodeEnv === 'development') {
    console.log('Executed query', { text: text.substring(0, 50), duration, rows: result.rowCount })
  }

  return result
}

export async function getClient() {
  const client = await pool.connect()
  return client
}

export async function transaction<T>(
  callback: (client: pg.PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')
    const result = await callback(client)
    await client.query('COMMIT')
    return result
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}
