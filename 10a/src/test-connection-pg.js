const { Client } = require('pg');

async function testConnection() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'hospitaldb',
    user: 'postgres',
    password: 'postgres'
  });

  console.log('Connecting to PostgreSQL...');
  console.log('Connection settings:', {
    host: 'localhost',
    port: 5432,
    database: 'hospitaldb',
    user: 'postgres',
    // password hidden
  });
  
  try {
    await client.connect();
    console.log('Connected to PostgreSQL successfully!');
    
    const res = await client.query('SELECT table_name FROM information_schema.tables WHERE table_schema = $1', ['public']);
    console.log('Tables in the database:');
    res.rows.forEach(table => {
      console.log(` - ${table.table_name}`);
    });
    
    await client.end();
  } catch (err) {
    console.error('Database connection error:', err);
  }
}

testConnection();