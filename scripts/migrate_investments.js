const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function migrate() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'finance_app',
  });

  try {
    console.log('Checking database schema...');
    
    // Check if columns exist
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'investments'
    `, [process.env.DB_NAME || 'finance_app']);

    const columnNames = columns.map(c => c.COLUMN_NAME);

    if (!columnNames.includes('api_id')) {
      console.log('Adding api_id column...');
      await connection.execute('ALTER TABLE investments ADD COLUMN api_id VARCHAR(100) NULL');
    }

    if (!columnNames.includes('yield_rate')) {
      console.log('Adding yield_rate column...');
      await connection.execute('ALTER TABLE investments ADD COLUMN yield_rate DECIMAL(10,2) NULL');
    }

    if (!columnNames.includes('is_automated')) {
      console.log('Adding is_automated column...');
      await connection.execute('ALTER TABLE investments ADD COLUMN is_automated BOOLEAN DEFAULT FALSE');
    }

    if (!columnNames.includes('quantity')) {
      console.log('Adding quantity column...');
      await connection.execute('ALTER TABLE investments ADD COLUMN quantity DECIMAL(20,8) NULL');
    }

    console.log('Migration completed successfully.');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

migrate();
