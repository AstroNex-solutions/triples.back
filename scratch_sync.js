const sequelize = require('./config/database');
const { Enrollment } = require('./models/ContentModels');

async function syncDb() {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
    
    // Add columns using raw SQL to be safe if alter: true has issues with other tables
    const queryInterface = sequelize.getQueryInterface();
    
    try {
      await queryInterface.addColumn('enrollments', 'has_flashcards', {
        type: sequelize.Sequelize.BOOLEAN,
        defaultValue: false
      });
      console.log('Added has_flashcards column');
    } catch(e) { console.log('has_flashcards might already exist'); }

    try {
      await queryInterface.addColumn('enrollments', 'has_qbank', {
        type: sequelize.Sequelize.BOOLEAN,
        defaultValue: false
      });
      console.log('Added has_qbank column');
    } catch(e) { console.log('has_qbank might already exist'); }

    try {
      await queryInterface.addColumn('enrollments', 'has_self_assessment', {
        type: sequelize.Sequelize.BOOLEAN,
        defaultValue: false
      });
      console.log('Added has_self_assessment column');
    } catch(e) { console.log('has_self_assessment might already exist'); }

    console.log('Database sync complete');
    process.exit(0);
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1);
  }
}

syncDb();
