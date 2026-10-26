const sequelize = require('./config/database');
async function alterProduct() {
  try {
    await sequelize.query('ALTER TABLE `flashcard_decks` MODIFY `product_id` INTEGER NULL;');
    console.log('Made product_id nullable');
  } catch (e) {
    console.log(e);
  }
  process.exit();
}
alterProduct();
