const config = require('../config');
const { MemoryStore } = require('./memoryStore');
const { MySQLStore } = require('./mysqlStore');

function createStore() {
  if (config.dbMode === 'memory') return new MemoryStore();
  return new MySQLStore(config.db);
}

module.exports = { createStore };
