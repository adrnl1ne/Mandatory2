const { kv } = require('@vercel/kv');

// Save data to KV store
async function saveData(key, data) {
  try {
    await kv.set(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving to KV: ${key}`, error);
  }
}

// Load data from KV store
async function loadData(key, defaultValue) {
  try {
    const data = await kv.get(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (error) {
    console.error(`Error loading from KV: ${key}`, error);
    return defaultValue;
  }
}

module.exports = {
  saveData,
  loadData
};