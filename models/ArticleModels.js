const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Article = sequelize.define('Article', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  author_id: { type: DataTypes.INTEGER, allowNull: true },
  title: { type: DataTypes.STRING(255), allowNull: false },
  title_en: { type: DataTypes.STRING(255), allowNull: true },
  slug: { type: DataTypes.STRING(255), unique: true },
  content: { type: DataTypes.TEXT, allowNull: false },
  content_en: { type: DataTypes.TEXT, allowNull: true },
  summary: { type: DataTypes.TEXT, allowNull: true },
  summary_en: { type: DataTypes.TEXT, allowNull: true },
  image: { type: DataTypes.STRING(500), allowNull: true },
  status: { type: DataTypes.ENUM('draft', 'published', 'archived'), defaultValue: 'draft' },
  views_count: { type: DataTypes.INTEGER, defaultValue: 0 },
  featured: { type: DataTypes.BOOLEAN, defaultValue: false },
  allow_comments: { type: DataTypes.BOOLEAN, defaultValue: true }
});

const ArticleComment = sequelize.define('ArticleComment', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  article_id: { type: DataTypes.INTEGER, allowNull: false },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  parent_id: { type: DataTypes.INTEGER, allowNull: true },
  content: { type: DataTypes.TEXT, allowNull: false },
  is_approved: { type: DataTypes.BOOLEAN, defaultValue: true }
});

const BookCategory = sequelize.define('BookCategory', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  description: { type: DataTypes.TEXT, allowNull: true }
});

const Book = sequelize.define('Book', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  category_id: { type: DataTypes.INTEGER, allowNull: true },
  uploaded_by_id: { type: DataTypes.INTEGER, allowNull: true },
  title: { type: DataTypes.STRING(255), allowNull: false },
  author_name: { type: DataTypes.STRING(255), allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true },
  book_file: { type: DataTypes.STRING(500), allowNull: false },
  cover_image: { type: DataTypes.STRING(500), allowNull: true },
  is_available: { type: DataTypes.BOOLEAN, defaultValue: true },
  download_count: { type: DataTypes.INTEGER, defaultValue: 0 },
  view_count: { type: DataTypes.INTEGER, defaultValue: 0 },
  language: { type: DataTypes.STRING(50), defaultValue: 'العربية' },
  pages_count: { type: DataTypes.INTEGER, allowNull: true }
});

module.exports = { Article, ArticleComment, BookCategory, Book };
