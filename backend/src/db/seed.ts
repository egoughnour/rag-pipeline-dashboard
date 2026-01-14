import { pool, query } from './index.js'

async function seed() {
  console.log('Seeding database...')

  try {
    // Create sample pipelines
    const pipeline1 = await query<{ id: string }>(
      `
      INSERT INTO pipelines (name, description, status, config)
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `,
      [
        'Technical Documentation',
        'RAG pipeline for technical documentation and code samples',
        'active',
        JSON.stringify({
          chunkSize: 512,
          chunkOverlap: 50,
          embeddingModel: 'text-embedding-3-small',
          sourceType: 'file',
        }),
      ]
    )

    const pipeline2 = await query<{ id: string }>(
      `
      INSERT INTO pipelines (name, description, status, config)
      VALUES ($1, $2, $3, $4)
      RETURNING id
    `,
      [
        'Knowledge Base',
        'Company knowledge base and internal documents',
        'paused',
        JSON.stringify({
          chunkSize: 1024,
          chunkOverlap: 100,
          embeddingModel: 'text-embedding-3-small',
          sourceType: 'file',
        }),
      ]
    )

    console.log(`Created pipeline: ${pipeline1.rows[0].id}`)
    console.log(`Created pipeline: ${pipeline2.rows[0].id}`)

    // Add sample activities
    await query(
      `
      INSERT INTO activities (type, message, pipeline_id)
      VALUES
        ('pipeline_started', 'Pipeline "Technical Documentation" created', $1),
        ('pipeline_started', 'Pipeline "Knowledge Base" created', $2),
        ('pipeline_started', 'Pipeline "Technical Documentation" started', $1)
    `,
      [pipeline1.rows[0].id, pipeline2.rows[0].id]
    )

    // Add sample metrics for charts
    const now = new Date()
    for (let i = 24; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000)

      await query(
        `
        INSERT INTO metrics (pipeline_id, metric_type, value, timestamp)
        VALUES
          ($1, 'documents_processed', $2, $3),
          ($1, 'avg_latency', $4, $3)
      `,
        [
          pipeline1.rows[0].id,
          Math.floor(Math.random() * 10) + 1,
          timestamp,
          Math.floor(Math.random() * 500) + 100,
        ]
      )
    }

    console.log('Seeding completed successfully!')
  } catch (error) {
    console.error('Seeding failed:', error)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

seed()
