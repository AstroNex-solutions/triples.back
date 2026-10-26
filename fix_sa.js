const sequelize = require('./config/database');
async function run() {
  try {
    await sequelize.query("ALTER TABLE question_banks ADD COLUMN is_self_assessment BOOLEAN DEFAULT 0;");
    console.log('is_self_assessment added');
  } catch(e) { console.log(e.message); }
  process.exit(0);
}
run();
