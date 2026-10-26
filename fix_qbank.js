const sequelize = require('./config/database');
async function run() {
  try {
    await sequelize.query("ALTER TABLE question_banks ADD COLUMN module_id INT NULL;");
    console.log('module_id added');
  } catch(e) { console.log(e.message); }
  try {
    await sequelize.query("ALTER TABLE question_banks ADD COLUMN image VARCHAR(255) NULL;");
    console.log('image added');
  } catch(e) { console.log(e.message); }
  process.exit(0);
}
run();
