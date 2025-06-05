const { sequelize } = require('../config/db');

async function up() {
  try {
    await sequelize.query(`
      ALTER TABLE requests 
      ADD COLUMN comments_ed VARCHAR(255) DEFAULT '';
    `);
    console.log('✅ Added comments_ed column to requests table');
  } catch (error) {
    console.error('❌ Error adding comments_ed column:', error);
    throw error;
  }
}

async function down() {
  try {
    await sequelize.query(`
      ALTER TABLE requests 
      DROP COLUMN comments_ed;
    `);
    console.log('✅ Removed comments_ed column from requests table');
  } catch (error) {
    console.error('❌ Error removing comments_ed column:', error);
    throw error;
  }
}

module.exports = { up, down }; 