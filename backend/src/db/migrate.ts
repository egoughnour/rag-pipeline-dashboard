import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { pool } from './index.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function migrate() {
  console.log('Running database migrations...')

  try {
    // Read schema file
    const schemaPath = path.join(__dirname, 'schema.sql')
    const schema = await fs.readFile(schemaPath, 'utf-8')

    // Execute schema
    await pool.query(schema)

    console.log('Migrations completed successfully!')
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

migrate()
