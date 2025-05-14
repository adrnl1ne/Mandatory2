require('dotenv').config();
const sql = require('mssql');

const config = {
  user: process.env.DB_USER || 'sa',
  password: process.env.MSSQL_SA_PASSWORD,
  server: 'localhost',
  port: parseInt(process.env.MSSQL_PORT || '1433'),
  database: process.env.DB_NAME || 'HospitalDB',
  options: {
    trustServerCertificate: true, // Change to false in production
    enableArithAbort: true
  }
};

async function connectToDatabase() {
  try {
    const pool = await sql.connect(config);
    console.log('Connected to SQL Server database');
    return pool;
  } catch (err) {
    console.error('Database connection failed:', err);
    throw err;
  }
}

module.exports = {
  connectToDatabase,
  sql
};