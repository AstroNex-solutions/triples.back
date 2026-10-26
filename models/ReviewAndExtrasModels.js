const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const CourseReview = sequelize.define('CourseReview', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  course_id: { type: DataTypes.INTEGER, allowNull: false },
  user_id: { type: DataTypes.INTEGER, allowNull: true },
  rating: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1, max: 5 } },
  review_text: { type: DataTypes.TEXT, allowNull: true },
  is_approved: { type: DataTypes.BOOLEAN, defaultValue: true }
});

const LessonReview = sequelize.define('LessonReview', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  lesson_id: { type: DataTypes.INTEGER, allowNull: false },
  user_id: { type: DataTypes.INTEGER, allowNull: true },
  rating: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1, max: 5 } },
  review_text: { type: DataTypes.TEXT, allowNull: true },
  is_approved: { type: DataTypes.BOOLEAN, defaultValue: true }
});

const ReviewReply = sequelize.define('ReviewReply', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  review_id: { type: DataTypes.INTEGER, allowNull: false },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  reply_text: { type: DataTypes.TEXT, allowNull: false },
  is_approved: { type: DataTypes.BOOLEAN, defaultValue: true }
});

const Comment = sequelize.define('Comment', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  course_id: { type: DataTypes.INTEGER, allowNull: false },
  user_id: { type: DataTypes.INTEGER, allowNull: false },
  parent_id: { type: DataTypes.INTEGER, allowNull: true },
  content: { type: DataTypes.TEXT, allowNull: false },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true }
});

const Banner = sequelize.define('Banner', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  title: { type: DataTypes.STRING(200), allowNull: false },
  title_ar: { type: DataTypes.STRING(200), allowNull: true },
  description: { type: DataTypes.TEXT, allowNull: true },
  description_ar: { type: DataTypes.TEXT, allowNull: true },
  image: { type: DataTypes.STRING(500), allowNull: false },
  image_ar: { type: DataTypes.STRING(500), allowNull: true },
  url: { type: DataTypes.STRING(500), allowNull: true },
  banner_type: { type: DataTypes.ENUM('main', 'header', 'sidebar', 'about_us', 'why_choose_us', 'med_message'), defaultValue: 'main' },
  display_order: { type: DataTypes.INTEGER, defaultValue: 0 },
  button_text: { type: DataTypes.STRING(100), allowNull: true },
  button_text_ar: { type: DataTypes.STRING(100), allowNull: true },
  button_url: { type: DataTypes.STRING(500), allowNull: true },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true }
});

const CourseCollection = sequelize.define('CourseCollection', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING(200), allowNull: false },
  name_ar: { type: DataTypes.STRING(200), allowNull: true },
  description: { type: DataTypes.TEXT, allowNull: true },
  description_ar: { type: DataTypes.TEXT, allowNull: true },
  slug: { type: DataTypes.STRING(200), unique: true },
  is_featured: { type: DataTypes.BOOLEAN, defaultValue: false },
  display_order: { type: DataTypes.INTEGER, defaultValue: 0 }
});

const ContactInfo = sequelize.define('ContactInfo', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  title: { type: DataTypes.STRING(200), defaultValue: 'Contact Us' },
  title_ar: { type: DataTypes.STRING(200), defaultValue: 'اتصل بنا' },
  description: { type: DataTypes.TEXT, allowNull: true },
  description_ar: { type: DataTypes.TEXT, allowNull: true },
  email: { type: DataTypes.STRING(255), allowNull: false },
  phone: { type: DataTypes.STRING(50), allowNull: true },
  address: { type: DataTypes.TEXT, allowNull: true },
  address_ar: { type: DataTypes.TEXT, allowNull: true },
  facebook: { type: DataTypes.STRING(500), allowNull: true },
  twitter: { type: DataTypes.STRING(500), allowNull: true },
  instagram: { type: DataTypes.STRING(500), allowNull: true },
  linkedin: { type: DataTypes.STRING(500), allowNull: true },
  youtube: { type: DataTypes.STRING(500), allowNull: true },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true }
});

const ContactMessage = sequelize.define('ContactMessage', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING(200), allowNull: false },
  email: { type: DataTypes.STRING(255), allowNull: false },
  phone: { type: DataTypes.STRING(50), allowNull: true },
  subject: { type: DataTypes.STRING(300), allowNull: false },
  message: { type: DataTypes.TEXT, allowNull: false },
  status: { type: DataTypes.ENUM('new', 'read', 'replied', 'closed'), defaultValue: 'new' },
  is_urgent: { type: DataTypes.BOOLEAN, defaultValue: false },
  admin_response: { type: DataTypes.TEXT, allowNull: true }
});

const Partnership = sequelize.define('Partnership', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING(200), allowNull: false },
  name_ar: { type: DataTypes.STRING(200), allowNull: true },
  logo: { type: DataTypes.STRING(500), allowNull: false },
  website: { type: DataTypes.STRING(500), allowNull: true },
  display_order: { type: DataTypes.INTEGER, defaultValue: 0 },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true }
});

const PrivacyPolicy = sequelize.define('PrivacyPolicy', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  title: { type: DataTypes.STRING(200), defaultValue: 'Privacy Policy' },
  content: { type: DataTypes.TEXT, allowNull: false },
  title_ar: { type: DataTypes.STRING(200), defaultValue: 'سياسة الخصوصية' },
  content_ar: { type: DataTypes.TEXT, allowNull: true },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true }
});

const TermsAndConditions = sequelize.define('TermsAndConditions', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  title: { type: DataTypes.STRING(200), defaultValue: 'Terms and Conditions' },
  content: { type: DataTypes.TEXT, allowNull: false },
  title_ar: { type: DataTypes.STRING(200), defaultValue: 'الشروط والأحكام' },
  content_ar: { type: DataTypes.TEXT, allowNull: true },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true }
});

const RefundingFAQ = sequelize.define('RefundingFAQ', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  question: { type: DataTypes.STRING(300), allowNull: false },
  answer: { type: DataTypes.TEXT, allowNull: false },
  question_ar: { type: DataTypes.STRING(300), allowNull: true },
  answer_ar: { type: DataTypes.TEXT, allowNull: true },
  display_order: { type: DataTypes.INTEGER, defaultValue: 0 },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true }
});

const Testimonial = sequelize.define('Testimonial', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  student_name: { type: DataTypes.STRING(200), allowNull: false },
  student_role: { type: DataTypes.STRING(200), allowNull: true },
  content: { type: DataTypes.TEXT, allowNull: false },
  rating: { type: DataTypes.INTEGER, defaultValue: 5 },
  image: { type: DataTypes.STRING(500), allowNull: true },
  display_order: { type: DataTypes.INTEGER, defaultValue: 0 },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true }
});

const AboutUs = sequelize.define('AboutUs', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  title: { type: DataTypes.STRING(200), defaultValue: 'About Us' },
  content: { type: DataTypes.TEXT('long'), allowNull: false },
  title_ar: { type: DataTypes.STRING(200), defaultValue: 'من نحن' },
  content_ar: { type: DataTypes.TEXT('long'), allowNull: true },
  image: { type: DataTypes.STRING(500), allowNull: true },
  is_active: { type: DataTypes.BOOLEAN, defaultValue: true }
});

module.exports = { 
  CourseReview, LessonReview, ReviewReply, Comment, Banner, CourseCollection, 
  ContactInfo, ContactMessage, Partnership, PrivacyPolicy, 
  TermsAndConditions, RefundingFAQ, Testimonial, AboutUs
};
