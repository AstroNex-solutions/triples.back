const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Coupon = sequelize.define('Coupon', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  code: { type: DataTypes.STRING(50), allowNull: false, unique: true },
  description: { type: DataTypes.TEXT, allowNull: true },
  discount_type: { type: DataTypes.ENUM('percentage', 'fixed'), defaultValue: 'percentage' },
  discount_value: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  max_uses: { type: DataTypes.INTEGER, defaultValue: 1 },
  used_count: { type: DataTypes.INTEGER, defaultValue: 0 },
  min_purchase: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  valid_from: { type: DataTypes.DATE, allowNull: false },
  valid_to: { type: DataTypes.DATE, allowNull: false },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true }
});

const Cart = sequelize.define('Cart', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false, unique: true },
  coupon_id: { type: DataTypes.INTEGER, allowNull: true }
});

const CartItem = sequelize.define('CartItem', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  cart_id: { type: DataTypes.INTEGER, allowNull: false },
  course_id: { type: DataTypes.INTEGER, allowNull: true },
  package_id: { type: DataTypes.INTEGER, allowNull: true },
  flashcard_product_id: { type: DataTypes.INTEGER, allowNull: true },
  feature_type: { type: DataTypes.STRING(50), allowNull: true }, // e.g. 'flashcards', 'qbank', 'selfAssessment'
  quantity: { type: DataTypes.INTEGER, defaultValue: 1 }
});

const Wishlist = sequelize.define('Wishlist', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false, unique: true }
});

const Order = sequelize.define('Order', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  user_id: { type: DataTypes.INTEGER, allowNull: true },
  order_number: { type: DataTypes.STRING(50), allowNull: false, unique: true },
  status: { type: DataTypes.ENUM('pending', 'processing', 'completed', 'cancelled', 'refunded'), defaultValue: 'pending' },
  payment_method: { type: DataTypes.ENUM('credit_card', 'paypal', 'bank_transfer'), defaultValue: 'credit_card' },
  subtotal: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  tax: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  discount_amount: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  total: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  payment_id: { type: DataTypes.STRING(100), allowNull: true },
  payment_status: { type: DataTypes.STRING(50), allowNull: true },
  billing_email: { type: DataTypes.STRING(255), allowNull: false },
  billing_name: { type: DataTypes.STRING(255), allowNull: false },
  billing_address: { type: DataTypes.TEXT, allowNull: true }
});

const OrderItem = sequelize.define('OrderItem', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  order_id: { type: DataTypes.INTEGER, allowNull: false },
  course_id: { type: DataTypes.INTEGER, allowNull: true },
  package_id: { type: DataTypes.INTEGER, allowNull: true },
  flashcard_product_id: { type: DataTypes.INTEGER, allowNull: true },
  feature_type: { type: DataTypes.STRING(50), allowNull: true },
  price: { type: DataTypes.DECIMAL(10, 2), allowNull: false }
});

module.exports = { Coupon, Cart, CartItem, Wishlist, Order, OrderItem };
