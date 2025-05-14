const { extractData } = require('./extract_from_postgres');
const { transformData } = require('./transform_data');
const { loadData } = require('./load_to_mongodb');

async function runMigration() {
  console.log('==== HOSPITAL MANAGEMENT SYSTEM DATABASE MIGRATION ====');
  console.log('Starting migration from PostgreSQL to MongoDB...');
  console.time('Total migration time');
  
  try {
    console.log('\n=== STEP 1: EXTRACT DATA FROM POSTGRESQL ===');
    console.time('Extract time');
    await extractData();
    console.timeEnd('Extract time');
    
    console.log('\n=== STEP 2: TRANSFORM DATA TO MONGODB FORMAT ===');
    console.time('Transform time');
    await transformData();
    console.timeEnd('Transform time');
    
    console.log('\n=== STEP 3: LOAD DATA INTO MONGODB ===');
    console.time('Load time');
    await loadData();
    console.timeEnd('Load time');
    
    console.log('\n✅ MIGRATION COMPLETED SUCCESSFULLY');
  } catch (error) {
    console.error('\n❌ MIGRATION FAILED:', error);
  }
  
  console.timeEnd('Total migration time');
}

runMigration().catch(console.error);