const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Assessment = sequelize.define('Assessment', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  course_id: { type: DataTypes.INTEGER, allowNull: true },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true },
  duration: { type: DataTypes.INTEGER, allowNull: true },
  passing_score: { type: DataTypes.INTEGER, defaultValue: 50 }
});

const AssessmentAttempt = sequelize.define('AssessmentAttempt', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  assessment_id: { type: DataTypes.INTEGER, allowNull: false },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  score: { type: DataTypes.DECIMAL(8, 2), allowNull: true },
  passed: { type: DataTypes.BOOLEAN, allowNull: true },
  started_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  completed_at: { type: DataTypes.DATE, allowNull: true }
});

const AssessmentAnswer = sequelize.define('AssessmentAnswer', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  attempt_id: { type: DataTypes.INTEGER, allowNull: false },
  question_id: { type: DataTypes.INTEGER, allowNull: false },
  answer_text: { type: DataTypes.TEXT, allowNull: true },
  is_correct: { type: DataTypes.BOOLEAN, allowNull: true }
});

const QuestionBankChapter = sequelize.define('QuestionBankChapter', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  module_id: { type: DataTypes.INTEGER, allowNull: false },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true },
  order: { type: DataTypes.INTEGER, defaultValue: 0 }
});

const QuestionBank = sequelize.define('QuestionBank', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  custom_id: { type: DataTypes.STRING, allowNull: true },
  assessment_id: { type: DataTypes.INTEGER, allowNull: true },
  question_bank_product_id: { type: DataTypes.INTEGER, allowNull: true },
  self_assessment_product_id: { type: DataTypes.INTEGER, allowNull: true },
  chapter_id: { type: DataTypes.INTEGER, allowNull: true },
  question_text: { type: DataTypes.TEXT, allowNull: false },
  question_type: { type: DataTypes.ENUM('mcq', 'true_false', 'short_answer', 'essay'), defaultValue: 'mcq' },
  difficulty_level: { type: DataTypes.ENUM('easy', 'medium', 'hard'), defaultValue: 'medium' },
  options: { type: DataTypes.JSON, allowNull: true },
  correct_answer: { type: DataTypes.TEXT, allowNull: false },
  explanation: { type: DataTypes.TEXT, allowNull: true },
  marks: { type: DataTypes.DECIMAL(8, 2), defaultValue: 1.00 },
  module_id: { type: DataTypes.INTEGER, allowNull: true },
  image: { type: DataTypes.STRING, allowNull: true },
  is_self_assessment: { type: DataTypes.BOOLEAN, defaultValue: false },
  chapter: { type: DataTypes.STRING, allowNull: true },
  topic: { type: DataTypes.STRING, allowNull: true },
  hint: { type: DataTypes.TEXT, allowNull: true },
  health_group: { type: DataTypes.STRING, allowNull: true },
  knowledge_domain: { type: DataTypes.STRING, allowNull: true },
  clinician_task: { type: DataTypes.STRING, allowNull: true }
});

const QuestionBankProduct = sequelize.define('QuestionBankProduct', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  course_id: { type: DataTypes.INTEGER, allowNull: false },
  title: { type: DataTypes.STRING, allowNull: false },
  price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  status: { type: DataTypes.ENUM('active', 'inactive'), defaultValue: 'active' }
});

const SelfAssessmentProduct = sequelize.define('SelfAssessmentProduct', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  course_id: { type: DataTypes.INTEGER, allowNull: false },
  title: { type: DataTypes.STRING, allowNull: false },
  price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  status: { type: DataTypes.ENUM('active', 'inactive'), defaultValue: 'active' }
});

const SelfAssessmentAttempt = sequelize.define('SelfAssessmentAttempt', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  self_assessment_product_id: { type: DataTypes.INTEGER, allowNull: true },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  score: { type: DataTypes.DECIMAL(8, 2), allowNull: true },
  percentage: { type: DataTypes.DECIMAL(8, 2), allowNull: true },
  status: { type: DataTypes.ENUM('passed', 'failed', 'pending'), defaultValue: 'pending' },
  started_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  completed_at: { type: DataTypes.DATE, allowNull: true }
});

const SelfAssessmentAnswer = sequelize.define('SelfAssessmentAnswer', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  attempt_id: { type: DataTypes.INTEGER, allowNull: false },
  question_id: { type: DataTypes.INTEGER, allowNull: false },
  answer_text: { type: DataTypes.TEXT, allowNull: true },
  is_correct: { type: DataTypes.BOOLEAN, allowNull: true }
});

module.exports = {
  Assessment,
  AssessmentAttempt,
  AssessmentAnswer,
  QuestionBankChapter,
  QuestionBank,
  QuestionBankProduct,
  SelfAssessmentProduct,
  SelfAssessmentAttempt,
  SelfAssessmentAnswer
};
