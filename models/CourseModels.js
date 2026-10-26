const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Category = sequelize.define('Category', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING(255), allowNull: false },
  name_ar: { type: DataTypes.STRING(255), allowNull: true },
  name_en: { type: DataTypes.STRING(255), allowNull: true },
  slug: { type: DataTypes.STRING(255), unique: true },
  description: { type: DataTypes.TEXT, allowNull: true },
  image: { type: DataTypes.STRING(500), allowNull: true },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
  is_default: { type: DataTypes.BOOLEAN, defaultValue: false },
  order: { type: DataTypes.INTEGER, defaultValue: 0 }
});

const Tag = sequelize.define('Tag', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  slug: { type: DataTypes.STRING(100), unique: true },
  description: { type: DataTypes.TEXT, allowNull: true },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true }
});

const Course = sequelize.define('Course', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  title: { type: DataTypes.STRING(255), allowNull: false, defaultValue: 'Untitled Course' },
  slug: { type: DataTypes.STRING(255), unique: true },
  subtitle: { type: DataTypes.STRING(255), allowNull: true },
  description: { type: DataTypes.TEXT, allowNull: true },
  short_description: { type: DataTypes.TEXT, allowNull: true },
  level: { type: DataTypes.ENUM('beginner', 'intermediate', 'advanced'), defaultValue: 'beginner' },
  language: { type: DataTypes.STRING(50), defaultValue: 'ar' },
  price: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  discount_price: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
  qbank_price: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  self_assessment_price: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  flashcard_price: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  is_free: { type: DataTypes.BOOLEAN, defaultValue: false },
  status: { type: DataTypes.ENUM('draft', 'pending_review', 'published', 'archived'), defaultValue: 'draft' },
  is_complete_course: { type: DataTypes.BOOLEAN, defaultValue: true },
  is_featured: { type: DataTypes.BOOLEAN, defaultValue: false },
  is_certified: { type: DataTypes.BOOLEAN, defaultValue: false },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
  image: { type: DataTypes.STRING(500), allowNull: true },
  syllabus_pdf: { type: DataTypes.STRING(500), allowNull: true },
  materials_pdf: { type: DataTypes.STRING(500), allowNull: true },
  average_rating: { type: DataTypes.FLOAT, defaultValue: 0.0 },
  total_enrollments: { type: DataTypes.INTEGER, defaultValue: 0 },
  total_duration: { type: DataTypes.INTEGER, defaultValue: 0 }, // in minutes
  category_id: { type: DataTypes.INTEGER, allowNull: true },
  organization_id: { type: DataTypes.INTEGER, allowNull: true },
  allow_feedback: { type: DataTypes.BOOLEAN, defaultValue: true }
});

const CourseSection = sequelize.define('CourseSection', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  course_id: { type: DataTypes.INTEGER, allowNull: false },
  section_type: { type: DataTypes.ENUM('gallery', 'video'), defaultValue: 'gallery' },
  title_en: { type: DataTypes.STRING(255), allowNull: false },
  title_ar: { type: DataTypes.STRING(255), allowNull: true },
  description_en: { type: DataTypes.TEXT, allowNull: true },
  description_ar: { type: DataTypes.TEXT, allowNull: true },
  video_url: { type: DataTypes.STRING(500), allowNull: true },
  images: { type: DataTypes.JSON, defaultValue: [] },
  layout_type: { type: DataTypes.ENUM('1_image', '2_images', '3_images', 'video'), defaultValue: '1_image' },
  order: { type: DataTypes.INTEGER, defaultValue: 0 },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true }
});

const CourseFAQ = sequelize.define('CourseFAQ', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  course_id: { type: DataTypes.INTEGER, allowNull: false },
  question_en: { type: DataTypes.STRING(500), allowNull: false },
  answer_en: { type: DataTypes.TEXT, allowNull: false },
  question_ar: { type: DataTypes.STRING(500), allowNull: true },
  answer_ar: { type: DataTypes.TEXT, allowNull: true },
  order: { type: DataTypes.INTEGER, defaultValue: 0 },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true }
});

const CoursePackage = sequelize.define('CoursePackage', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  course_id: { type: DataTypes.INTEGER, allowNull: false },
  name_en: { type: DataTypes.STRING(255), allowNull: false },
  name_ar: { type: DataTypes.STRING(255), allowNull: true },
  duration_start: { type: DataTypes.DATE, allowNull: true },
  duration_end: { type: DataTypes.DATE, allowNull: true },
  price: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
  note_en: { type: DataTypes.STRING(255), allowNull: true },
  note_ar: { type: DataTypes.STRING(255), allowNull: true },
  features_en: { type: DataTypes.JSON, defaultValue: [] },
  features_ar: { type: DataTypes.JSON, defaultValue: [] },
  includes_course_content: { type: DataTypes.BOOLEAN, defaultValue: true },
  includes_flashcards: { type: DataTypes.BOOLEAN, defaultValue: false },
  includes_question_banks: { type: DataTypes.BOOLEAN, defaultValue: false },
  includes_self_assessments: { type: DataTypes.BOOLEAN, defaultValue: false },
  is_most_popular: { type: DataTypes.BOOLEAN, defaultValue: false },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
  order: { type: DataTypes.INTEGER, defaultValue: 0 }
});

module.exports = { Category, Tag, Course, CourseSection, CourseFAQ, CoursePackage };
