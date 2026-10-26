const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ModuleModel = sequelize.define('Module', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  course_id: { type: DataTypes.INTEGER, allowNull: false },
  submodule_id: { type: DataTypes.INTEGER, allowNull: true },
  name: { type: DataTypes.STRING(255), allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true },
  video_url: { type: DataTypes.STRING(500), allowNull: true },
  bunny_video_id: { type: DataTypes.STRING(100), allowNull: true },
  bunny_video_url: { type: DataTypes.STRING(500), allowNull: true },
  pdf_url: { type: DataTypes.STRING(500), allowNull: true },
  note: { type: DataTypes.TEXT, allowNull: true },
  status: { type: DataTypes.ENUM('draft', 'published', 'archived'), defaultValue: 'draft' },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
  order: { type: DataTypes.INTEGER, defaultValue: 0 }
});

const Lesson = sequelize.define('Lesson', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  module_id: { type: DataTypes.INTEGER, allowNull: false },
  title: { type: DataTypes.STRING(255), allowNull: false },
  slug: { type: DataTypes.STRING(255), allowNull: true },
  description: { type: DataTypes.TEXT, allowNull: true },
  content: { type: DataTypes.TEXT, allowNull: true },
  lesson_type: { type: DataTypes.ENUM('video', 'article'), defaultValue: 'article' },
  difficulty: { type: DataTypes.ENUM('beginner', 'intermediate', 'advanced'), defaultValue: 'beginner' },
  video_url: { type: DataTypes.STRING(500), allowNull: true },
  bunny_video_id: { type: DataTypes.STRING(100), allowNull: true },
  bunny_video_url: { type: DataTypes.STRING(500), allowNull: true },
  duration_seconds: { type: DataTypes.INTEGER, defaultValue: 0 },
  order: { type: DataTypes.INTEGER, defaultValue: 0 },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
  is_free: { type: DataTypes.BOOLEAN, defaultValue: false },
  requires_completion: { type: DataTypes.BOOLEAN, defaultValue: true },
  // Attachments: array of { name, url, type, size }
  attachments: { type: DataTypes.JSON, defaultValue: [] }
});

const Enrollment = sequelize.define('Enrollment', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  course_id: { type: DataTypes.INTEGER, allowNull: false },
  status: { type: DataTypes.ENUM('pending', 'active', 'completed', 'dropped', 'suspended', 'frozen'), defaultValue: 'active' },
  progress: { type: DataTypes.FLOAT, defaultValue: 0 },
  enrollment_date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  start_date: { type: DataTypes.DATE, allowNull: true },
  end_date: { type: DataTypes.DATE, allowNull: true },
  completion_date: { type: DataTypes.DATE, allowNull: true },
  last_accessed: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  freeze_count: { type: DataTypes.INTEGER, defaultValue: 0 },
  frozen_at: { type: DataTypes.DATE, allowNull: true },
  freeze_end_date: { type: DataTypes.DATE, allowNull: true },
  freeze_reason: { type: DataTypes.TEXT, allowNull: true },
  is_paid: { type: DataTypes.BOOLEAN, defaultValue: false },
  payment_amount: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
  transaction_id: { type: DataTypes.STRING(255), allowNull: true },
  has_flashcards: { type: DataTypes.BOOLEAN, defaultValue: false },
  has_qbank: { type: DataTypes.BOOLEAN, defaultValue: false },
  has_self_assessment: { type: DataTypes.BOOLEAN, defaultValue: false }
});

const UserProgress = sequelize.define('UserProgress', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  course_id: { type: DataTypes.INTEGER, allowNull: false },
  status: { type: DataTypes.ENUM('not_started', 'in_progress', 'completed'), defaultValue: 'not_started' },
  overall_progress: { type: DataTypes.FLOAT, defaultValue: 0 },
  time_spent_minutes: { type: DataTypes.INTEGER, defaultValue: 0 },
  last_accessed: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
});

const ModuleProgress = sequelize.define('ModuleProgress', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  module_id: { type: DataTypes.INTEGER, allowNull: false },
  status: { type: DataTypes.ENUM('not_started', 'in_progress', 'completed'), defaultValue: 'not_started' },
  completed_lessons: { type: DataTypes.JSON, defaultValue: [] },
  is_completed: { type: DataTypes.BOOLEAN, defaultValue: false }
});

const LessonProgress = sequelize.define('LessonProgress', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  lesson_id: { type: DataTypes.INTEGER, allowNull: false },
  progress_seconds: { type: DataTypes.INTEGER, defaultValue: 0 },
  is_completed: { type: DataTypes.BOOLEAN, defaultValue: false }
});

const StudySchedule = sequelize.define('StudySchedule', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  course_id: { type: DataTypes.INTEGER, allowNull: false },
  start_date: { type: DataTypes.DATEONLY, allowNull: false },
  end_date: { type: DataTypes.DATEONLY, allowNull: true },
  daily_hours: { type: DataTypes.INTEGER, defaultValue: 4 },
  days_off: { type: DataTypes.JSON, defaultValue: [] },
  plan: { type: DataTypes.JSON, allowNull: true },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true }
});

module.exports = { ModuleModel, Lesson, Enrollment, UserProgress, ModuleProgress, LessonProgress, StudySchedule };
