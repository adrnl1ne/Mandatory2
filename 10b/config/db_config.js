require('dotenv').config();

module.exports = {
  postgres: {
    // Use the host from 10a's docker-compose.yml (likely 'localhost')
    host: process.env.PG_HOST || 'localhost',
    port: parseInt(process.env.PG_PORT || '5432'),
    database: 'hospitaldb',  // Ensure this matches your 10a database name
    user: process.env.PG_USER || 'postgres',
    password: process.env.PG_PASSWORD || 'postgres'
  },
  mongodb: {
    uri: process.env.MONGO_URI || 'mongodb://localhost:27017',
    database: process.env.MONGO_DATABASE || 'hospitaldb'
  }
};