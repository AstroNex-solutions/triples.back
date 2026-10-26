const { QuestionBank } = require('./models');

(async () => {
  try {
    console.log('Altering QuestionBank table...');
    await QuestionBank.sync({ alter: true });
    console.log('Successfully altered QuestionBank table!');
    process.exit(0);
  } catch (error) {
    console.error('Failed to alter table:', error);
    process.exit(1);
  }
})();
