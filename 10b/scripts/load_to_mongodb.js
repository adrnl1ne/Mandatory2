const { MongoClient } = require('mongodb');
const fs = require('fs-extra');
const path = require('path');
const dbConfig = require('../config/db_config');

async function loadData() {
  const client = new MongoClient(dbConfig.mongodb.uri);
  const transformedDir = path.join(__dirname, '../transformed');
  
  try {
    console.log('Connecting to MongoDB...');
    await client.connect();
    console.log('Connected successfully to MongoDB!');
    
    const db = client.db(dbConfig.mongodb.database);
    
    // Get all JSON files in transformed directory
    const files = await fs.readdir(transformedDir);
    const jsonFiles = files.filter(file => file.endsWith('.json'));
    
    // Load all collections
    for (const file of jsonFiles) {
      const collectionName = file.replace('.json', '');
      const data = await fs.readJson(path.join(transformedDir, file));
      
      console.log(`Loading ${data.length} documents into collection: ${collectionName}`);
      
      // Drop the collection if it exists
      try {
        await db.collection(collectionName).drop();
        console.log(`  - Dropped existing ${collectionName} collection`);
      } catch (err) {
        // Collection might not exist, which is fine
      }
      
      // Insert the data
      if (data.length > 0) {
        const result = await db.collection(collectionName).insertMany(data);
        console.log(`  - Inserted ${result.insertedCount} documents`);
      } else {
        console.log('  - No data to insert');
      }
    }
    
    console.log('Data loading completed successfully!');
  } catch (error) {
    console.error('Error loading data:', error);
  } finally {
    await client.close();
  }
}

// Run the loading if this script is executed directly
if (require.main === module) {
  loadData().catch(console.error);
}

module.exports = { loadData };