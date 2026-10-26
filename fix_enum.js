const { sequelize } = require('./models');

async function fixEnum() {
  try {
    await sequelize.query("ALTER TABLE Banners MODIFY COLUMN banner_type ENUM('main', 'header', 'sidebar', 'about_us', 'why_choose_us', 'med_message') DEFAULT 'main'");
    console.log('Enum updated successfully');
    process.exit(0);
  } catch (err) {
    console.error('Error updating Enum:', err);
    process.exit(1);
  }
}

fixEnum();
