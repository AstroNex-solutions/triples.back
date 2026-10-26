const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const FlashcardProduct = sequelize.define('FlashcardProduct', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  title: { type: DataTypes.STRING(255), allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true },
  price: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  image_url: { type: DataTypes.STRING(255), allowNull: true },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
  course_id: { type: DataTypes.INTEGER, allowNull: true }
});

const FlashcardDeck = sequelize.define('FlashcardDeck', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  product_id: { type: DataTypes.INTEGER, allowNull: true },
  module_id: { type: DataTypes.INTEGER, allowNull: true },
  chapter_name: { type: DataTypes.STRING(255), allowNull: false },
  topic_name: { type: DataTypes.STRING(255), allowNull: false },
  order: { type: DataTypes.INTEGER, defaultValue: 0 }
});

const FlashcardItem = sequelize.define('FlashcardItem', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  deck_id: { type: DataTypes.INTEGER, allowNull: false },
  front_text: { type: DataTypes.TEXT, allowNull: false },
  back_text: { type: DataTypes.TEXT, allowNull: false },
  image_url: { type: DataTypes.STRING(255), allowNull: true },
  order: { type: DataTypes.INTEGER, defaultValue: 0 }
});

const FlashcardAccess = sequelize.define('FlashcardAccess', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  product_id: { type: DataTypes.INTEGER, allowNull: false },
  granted_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
});

module.exports = {
  FlashcardProduct,
  FlashcardDeck,
  FlashcardItem,
  FlashcardAccess
};
