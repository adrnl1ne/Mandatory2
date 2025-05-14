require('dotenv').config();
const sql = require('mssql');

const config = {
  user: 'sa',
  password: 'StrongP@ssw0rd2025', // Hardcoded for testing
  server: 'localhost',
  port: 1433,
  database: 'HospitalDB',
  options: {
    trustServerCertificate: true,
    enableArithAbort: true
  }
};

async function testConnection() {
  try {
    console.log('Connecting to SQL Server...');
    console.log('Connection config:', {
      server: config.server,
      port: config.port,
      database: config.database,
      user: config.user,
      // password hidden for security
    });
    
    const pool = await sql.connect(config);
    console.log('Connected to SQL Server successfully!');
    
    // Test query to verify database exists and has tables
    const result = await pool.request().query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_TYPE = 'BASE TABLE'
    `);
    
    console.log('Tables in the database:');
    result.recordset.forEach(table => {
      console.log(` - ${table.TABLE_NAME}`);
    });
    
    await pool.close();
  } catch (err) {
    console.error('Database connection error:', err);
  }
}

testConnection();