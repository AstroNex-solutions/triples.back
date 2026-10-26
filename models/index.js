const sequelize = require('../config/database');
const User = require('./User');
const { UserSession, AccountFreeze } = require('./UserSession');
const { Category, Tag, Course, CourseSection, CourseFAQ, CoursePackage } = require('./CourseModels');
const { ModuleModel, Lesson, Enrollment, UserProgress, ModuleProgress, LessonProgress, StudySchedule } = require('./ContentModels');
const { Assessment, AssessmentAttempt, AssessmentAnswer, QuestionBankChapter, QuestionBank, QuestionBankProduct, SelfAssessmentProduct, SelfAssessmentAttempt, SelfAssessmentAnswer } = require('./AssessmentModels');
const { Article, ArticleComment, BookCategory, Book } = require('./ArticleModels');
const { Coupon, Cart, CartItem, Wishlist, Order, OrderItem } = require('./StoreModels');
const { 
  CourseReview, LessonReview, ReviewReply, Comment, Banner, CourseCollection, 
  ContactInfo, ContactMessage, Partnership, PrivacyPolicy, 
  TermsAndConditions, RefundingFAQ, Testimonial, AboutUs 
} = require('./ReviewAndExtrasModels');
const { FlashcardProduct, FlashcardDeck, FlashcardItem, FlashcardAccess } = require('./FlashcardModels');
const SystemSetting = require('./SystemSetting');

// --- Associations ---

// User & Account
User.hasMany(UserSession, { foreignKey: 'user_id', as: 'sessions' });
UserSession.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasOne(AccountFreeze, { foreignKey: 'user_id', as: 'account_freeze' });
AccountFreeze.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Category & Course
Category.hasMany(Course, { foreignKey: 'category_id', as: 'courses' });
Course.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

// Course & Instructors (Many-to-Many via CourseInstructors)
Course.belongsToMany(User, { through: 'CourseInstructors', as: 'instructors', foreignKey: 'course_id' });
User.belongsToMany(Course, { through: 'CourseInstructors', as: 'courses_taught', foreignKey: 'user_id' });

// Course & Tags (Many-to-Many via CourseTags)
Course.belongsToMany(Tag, { through: 'CourseTags', as: 'tags', foreignKey: 'course_id' });
Tag.belongsToMany(Course, { through: 'CourseTags', as: 'courses', foreignKey: 'tag_id' });

// Course Sub-components
Course.hasMany(CourseSection, { foreignKey: 'course_id', as: 'sections' });
CourseSection.belongsTo(Course, { foreignKey: 'course_id' });

Course.hasMany(CourseFAQ, { foreignKey: 'course_id', as: 'faqs' });
CourseFAQ.belongsTo(Course, { foreignKey: 'course_id' });

Course.hasMany(CoursePackage, { foreignKey: 'course_id', as: 'packages' });
CoursePackage.belongsTo(Course, { foreignKey: 'course_id' });

// Modules & Lessons
Course.hasMany(ModuleModel, { foreignKey: 'course_id', as: 'modules' });
ModuleModel.belongsTo(Course, { foreignKey: 'course_id' });

ModuleModel.hasMany(ModuleModel, { foreignKey: 'submodule_id', as: 'submodules' });
ModuleModel.belongsTo(ModuleModel, { foreignKey: 'submodule_id', as: 'parent_module' });

ModuleModel.hasMany(Lesson, { foreignKey: 'module_id', as: 'lessons' });
Lesson.belongsTo(ModuleModel, { foreignKey: 'module_id' });

// Enrollments & Progress
User.hasMany(Enrollment, { foreignKey: 'user_id', as: 'enrollments' });
Enrollment.belongsTo(User, { foreignKey: 'user_id', as: 'student' });
Course.hasMany(Enrollment, { foreignKey: 'course_id', as: 'enrollments' });
Enrollment.belongsTo(Course, { foreignKey: 'course_id', as: 'course' });

User.hasMany(UserProgress, { foreignKey: 'user_id', as: 'user_progress' });
UserProgress.belongsTo(User, { foreignKey: 'user_id' });
UserProgress.belongsTo(Course, { foreignKey: 'course_id' });

User.hasMany(ModuleProgress, { foreignKey: 'user_id', as: 'module_progress' });
ModuleProgress.belongsTo(User, { foreignKey: 'user_id' });
ModuleProgress.belongsTo(ModuleModel, { foreignKey: 'module_id' });

User.hasMany(StudySchedule, { foreignKey: 'user_id', as: 'study_schedules' });
StudySchedule.belongsTo(User, { foreignKey: 'user_id' });
StudySchedule.belongsTo(Course, { foreignKey: 'course_id', as: 'course' });

User.hasMany(LessonProgress, { foreignKey: 'user_id', as: 'lesson_progress' });
LessonProgress.belongsTo(User, { foreignKey: 'user_id' });
LessonProgress.belongsTo(Lesson, { foreignKey: 'lesson_id' });

// Assessments & Quizzes
Course.hasMany(Assessment, { foreignKey: 'course_id', as: 'assessments' });
Assessment.belongsTo(Course, { foreignKey: 'course_id' });

Assessment.hasMany(QuestionBank, { foreignKey: 'assessment_id', as: 'questions' });
QuestionBank.belongsTo(Assessment, { foreignKey: 'assessment_id' });

ModuleModel.hasMany(QuestionBankChapter, { foreignKey: 'module_id', as: 'qbank_chapters', onDelete: 'CASCADE' });
QuestionBankChapter.belongsTo(ModuleModel, { foreignKey: 'module_id', as: 'module' });

QuestionBankChapter.hasMany(QuestionBank, { foreignKey: 'chapter_id', as: 'questions', onDelete: 'CASCADE' });
QuestionBank.belongsTo(QuestionBankChapter, { foreignKey: 'chapter_id', as: 'qbank_chapter' });

ModuleModel.hasMany(QuestionBank, { foreignKey: 'module_id', as: 'module_questions' });
QuestionBank.belongsTo(ModuleModel, { foreignKey: 'module_id', as: 'module' });

Course.hasMany(QuestionBankProduct, { foreignKey: 'course_id', as: 'question_bank_products' });
QuestionBankProduct.belongsTo(Course, { foreignKey: 'course_id' });
QuestionBankProduct.hasMany(QuestionBank, { foreignKey: 'question_bank_product_id', as: 'questions' });
QuestionBank.belongsTo(QuestionBankProduct, { foreignKey: 'question_bank_product_id' });

Course.hasMany(SelfAssessmentProduct, { foreignKey: 'course_id', as: 'self_assessment_products' });
SelfAssessmentProduct.belongsTo(Course, { foreignKey: 'course_id' });
SelfAssessmentProduct.hasMany(QuestionBank, { foreignKey: 'self_assessment_product_id', as: 'questions' });
QuestionBank.belongsTo(SelfAssessmentProduct, { foreignKey: 'self_assessment_product_id' });

User.hasMany(SelfAssessmentAttempt, { foreignKey: 'user_id', as: 'self_assessment_attempts' });
SelfAssessmentAttempt.belongsTo(User, { foreignKey: 'user_id' });
SelfAssessmentAttempt.belongsTo(SelfAssessmentProduct, { foreignKey: 'product_id', as: 'product' });

SelfAssessmentAttempt.hasMany(SelfAssessmentAnswer, { foreignKey: 'attempt_id', as: 'answers' });
SelfAssessmentAnswer.belongsTo(SelfAssessmentAttempt, { foreignKey: 'attempt_id' });
SelfAssessmentAnswer.belongsTo(QuestionBank, { foreignKey: 'question_id', as: 'question' });

User.hasMany(AssessmentAttempt, { foreignKey: 'user_id', as: 'assessment_attempts' });
AssessmentAttempt.belongsTo(User, { foreignKey: 'user_id' });
AssessmentAttempt.belongsTo(Assessment, { foreignKey: 'assessment_id', as: 'assessment' });

AssessmentAttempt.hasMany(AssessmentAnswer, { foreignKey: 'attempt_id', as: 'answers' });
AssessmentAnswer.belongsTo(AssessmentAttempt, { foreignKey: 'attempt_id' });
AssessmentAnswer.belongsTo(QuestionBank, { foreignKey: 'question_id', as: 'question' });

// Flashcards
FlashcardProduct.belongsTo(Course, { foreignKey: 'course_id', as: 'course' });
Course.hasMany(FlashcardProduct, { foreignKey: 'course_id', as: 'flashcard_products' });

FlashcardProduct.hasMany(FlashcardDeck, { foreignKey: 'product_id', as: 'decks' });
FlashcardDeck.belongsTo(FlashcardProduct, { foreignKey: 'product_id' });

FlashcardDeck.hasMany(FlashcardItem, { foreignKey: 'deck_id', as: 'items' });
FlashcardItem.belongsTo(FlashcardDeck, { foreignKey: 'deck_id' });

User.hasMany(FlashcardAccess, { foreignKey: 'user_id', as: 'flashcard_accesses' });
FlashcardAccess.belongsTo(User, { foreignKey: 'user_id' });
FlashcardProduct.hasMany(FlashcardAccess, { foreignKey: 'product_id', as: 'accesses' });
FlashcardAccess.belongsTo(FlashcardProduct, { foreignKey: 'product_id', as: 'product' });

// Articles & Books
User.hasMany(Article, { foreignKey: 'author_id', as: 'articles' });
Article.belongsTo(User, { foreignKey: 'author_id', as: 'author' });

Article.hasMany(ArticleComment, { foreignKey: 'article_id', as: 'comments' });
ArticleComment.belongsTo(Article, { foreignKey: 'article_id' });
ArticleComment.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

BookCategory.hasMany(Book, { foreignKey: 'category_id', as: 'books' });
Book.belongsTo(BookCategory, { foreignKey: 'category_id', as: 'category' });
Book.belongsTo(User, { foreignKey: 'uploaded_by_id', as: 'uploaded_by' });

// E-Commerce
User.hasOne(Cart, { foreignKey: 'user_id', as: 'cart' });
Cart.belongsTo(User, { foreignKey: 'user_id' });
Cart.belongsTo(Coupon, { foreignKey: 'coupon_id', as: 'coupon' });

Cart.hasMany(CartItem, { foreignKey: 'cart_id', as: 'items' });
CartItem.belongsTo(Cart, { foreignKey: 'cart_id' });
CartItem.belongsTo(Course, { foreignKey: 'course_id', as: 'course' });
CartItem.belongsTo(CoursePackage, { foreignKey: 'package_id', as: 'package' });
CartItem.belongsTo(FlashcardProduct, { foreignKey: 'flashcard_product_id', as: 'flashcard_product' });

User.hasOne(Wishlist, { foreignKey: 'user_id', as: 'wishlist' });
Wishlist.belongsTo(User, { foreignKey: 'user_id' });
Wishlist.belongsToMany(Course, { through: 'WishlistCourses', as: 'courses', foreignKey: 'wishlist_id' });
Course.belongsToMany(Wishlist, { through: 'WishlistCourses', as: 'wishlists', foreignKey: 'course_id' });

User.hasMany(Order, { foreignKey: 'user_id', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'user_id' });
Order.hasMany(OrderItem, { foreignKey: 'order_id', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'order_id' });
OrderItem.belongsTo(Course, { foreignKey: 'course_id', as: 'course' });
OrderItem.belongsTo(CoursePackage, { foreignKey: 'package_id', as: 'package' });
OrderItem.belongsTo(FlashcardProduct, { foreignKey: 'flashcard_product_id', as: 'flashcard_product' });

// Reviews & Extras
Course.hasMany(CourseReview, { foreignKey: 'course_id', as: 'reviews' });
CourseReview.belongsTo(Course, { foreignKey: 'course_id' });
CourseReview.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

CourseReview.hasMany(ReviewReply, { foreignKey: 'review_id', as: 'replies' });
ReviewReply.belongsTo(CourseReview, { foreignKey: 'review_id' });
ReviewReply.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Lesson.hasMany(LessonReview, { foreignKey: 'lesson_id', as: 'reviews' });
LessonReview.belongsTo(Lesson, { foreignKey: 'lesson_id' });
LessonReview.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

Course.hasMany(Comment, { foreignKey: 'course_id', as: 'comments' });
Comment.belongsTo(Course, { foreignKey: 'course_id' });
Comment.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

CourseCollection.belongsToMany(Course, { through: 'CollectionCourses', as: 'courses', foreignKey: 'collection_id' });
Course.belongsToMany(CourseCollection, { through: 'CollectionCourses', as: 'collections', foreignKey: 'course_id' });

module.exports = {
  sequelize,
  User,
  UserSession,
  AccountFreeze,
  Category,
  Tag,
  Course,
  CourseSection,
  CourseFAQ,
  CoursePackage,
  ModuleModel,
  Lesson,
  Enrollment,
  UserProgress,
  ModuleProgress,
  LessonProgress,
  StudySchedule,
  Assessment,
  AssessmentAttempt,
  AssessmentAnswer,
  QuestionBankChapter,
  QuestionBank,
  QuestionBankProduct,
  SelfAssessmentProduct,
  SelfAssessmentAttempt,
  SelfAssessmentAnswer,
  Article,
  ArticleComment,
  BookCategory,
  Book,
  Coupon,
  Cart,
  CartItem,
  Wishlist,
  Order,
  OrderItem,
  CourseReview,
  LessonReview,
  ReviewReply,
  Comment,
  Banner,
  CourseCollection,
  ContactInfo,
  ContactMessage,
  Partnership,
  PrivacyPolicy,
  TermsAndConditions,
  RefundingFAQ,
  Testimonial,
  AboutUs,
  FlashcardProduct,
  FlashcardDeck,
  FlashcardItem,
  FlashcardAccess,
  SystemSetting
};
