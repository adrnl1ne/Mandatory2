const { Client } = require('pg');
const fs = require('fs-extra');
const path = require('path');
const dbConfig = require('../config/db_config');

async function extractData() {
  const client = new Client(dbConfig.postgres);
  const outputDir = path.join(__dirname, '../temp');
  
  try {
    console.log('Connecting to PostgreSQL database...');
    await client.connect();
    console.log('Connected successfully!');
    
    // Ensure output directory exists
    await fs.ensureDir(outputDir);
    
    // Get all tables in the database
    const tableQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    `;
    
    const tables = await client.query(tableQuery);
    
    console.log(`Found ${tables.rows.length} tables to extract`);
    
    // Extract data from each table
    for (const tableRow of tables.rows) {
      const tableName = tableRow.table_name;
      console.log(`Extracting data from table: ${tableName}`);
      
      const dataQuery = `SELECT * FROM ${tableName}`;
      const result = await client.query(dataQuery);
      
      // Save data to a JSON file
      await fs.writeJson(
        path.join(outputDir, `${tableName}.json`),
        result.rows,
        { spaces: 2 }
      );
      
      console.log(`  - Extracted ${result.rows.length} rows`);
    }
    
    console.log('Data extraction completed successfully!');
  } catch (error) {
    console.error('Error extracting data:', error);
  } finally {
    await client.end();
  }
}

// Run the extraction if this script is executed directly
if (require.main === module) {
  extractData().catch(console.error);
}

module.exports = { extractData };