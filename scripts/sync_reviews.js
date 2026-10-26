const sequelize = require('../config/database');
const models = require('../models');

async function syncDB() {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
    await models.LessonReview.sync({ alter: true });
    console.log('LessonReview table created or updated successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
}

syncDB();
