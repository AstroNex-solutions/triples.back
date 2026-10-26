const sequelize = require('./config/database');

async function alterTables() {
  try {
    await sequelize.query('ALTER TABLE `flashcard_decks` ADD COLUMN module_id INTEGER NULL;');
    console.log('Added module_id to flashcard_decks');
  } catch (e) { console.log('flashcard_decks:', e.message); }

  try {
    await sequelize.query('ALTER TABLE `question_banks` ADD COLUMN module_id INTEGER NULL;');
    console.log('Added module_id to question_banks');
  } catch (e) { console.log('question_banks:', e.message); }

  try {
    await sequelize.query('ALTER TABLE `assessments` ADD COLUMN module_id INTEGER NULL;');
    console.log('Added module_id to assessments');
  } catch (e) { console.log('assessments:', e.message); }

  process.exit();
}
alterTables();
