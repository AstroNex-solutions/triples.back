const sequelize = require('./config/database');
async function run() {
  try {
    await sequelize.query("ALTER TABLE cart_items ADD COLUMN feature_type VARCHAR(50) NULL;");
    console.log('cart_items altered');
  } catch(e) {
    console.log('cart_items:', e.message);
  }
  try {
    await sequelize.query("ALTER TABLE order_items ADD COLUMN feature_type VARCHAR(50) NULL;");
    console.log('order_items altered');
  } catch(e) {
    console.log('order_items:', e.message);
  }
  process.exit(0);
}
run();
