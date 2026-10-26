const path = require('path');
const { Sequelize } = require('sequelize');

async function runSeed() {
  console.log('🌱 Starting database seed...');
  let sequelize;

  // Try MySQL connection first
  try {
    sequelize = require('../config/database');
    await sequelize.authenticate();
    console.log('Connected to MySQL server.');
  } catch (err) {
    console.log('MySQL server not active on localhost:3306. Using SQLite dev database fallback for seeding...');
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: path.join(__dirname, '../lms_database.sqlite'),
      logging: false
    });
  }

  // Import models with active sequelize instance
  const User = require('../models/User');
  const { Category, Course } = require('../models/CourseModels');
  const { ModuleModel, Lesson } = require('../models/ContentModels');
  const { Assessment, QuestionBank } = require('../models/AssessmentModels');
  const { Article, BookCategory, Book } = require('../models/ArticleModels');
  const { Banner, Coupon } = require('../models/ReviewAndExtrasModels');

  // Define minimal sync
  await User.sync({ force: true });
  await Category.sync({ force: true });
  await Course.sync({ force: true });
  await ModuleModel.sync({ force: true });
  await Lesson.sync({ force: true });
  await Assessment.sync({ force: true });
  await QuestionBank.sync({ force: true });
  await Article.sync({ force: true });
  await BookCategory.sync({ force: true });
  await Book.sync({ force: true });
  await Banner.sync({ force: true });
  await Coupon.sync({ force: true });

  // 1. Users
  const admin = await User.create({
    username: 'admin',
    email: 'ahmedsabrymahmoud225@gmail.com',
    password: 'adminpassword123',
    name: 'مدير النظام الفائق',
    status: 'Admin',
    is_superuser: true
  });

  const instructor = await User.create({
    username: 'dr_ahmed',
    email: 'ahmed@triplesacademy.com',
    password: 'password123',
    name: 'د. أحمد علي',
    status: 'Instructor',
    department: 'علوم الحاسب'
  });

  // 2. Categories & Courses
  const catProgramming = await Category.create({
    name: 'برمجة وتطوير الويب',
    slug: 'programming-web-dev',
    description: 'تعلم أحدث لغات البرمجة وأطر العمل',
    order: 1
  });

  const courseWeb = await Course.create({
    title: 'الدورة الشاملة لتطوير تطبيقات الويب الحديثة (Full Stack Node.js & React)',
    slug: 'fullstack-nodejs-react-mastery',
    subtitle: 'من الصفر وحتى الاحتراف مع بناء مشاريع واقعية',
    description: 'تتضمن هذه الدورة بناء منصات متكاملة باستخدام Node.js, Express, Sequelize, MySQL و React.js.',
    short_description: 'كورس شامل لتطوير تطبيقات الويب بالكامل.',
    level: 'intermediate',
    price: 199.99,
    discount_price: 99.99,
    category_id: catProgramming.id,
    status: 'published',
    is_featured: true,
    is_certified: true,
    average_rating: 4.9,
    total_enrollments: 1420
  });

  // 3. Module & Lesson
  const mod1 = await ModuleModel.create({
    course_id: courseWeb.id,
    name: 'الموديول الأول: مقدمة في بنية Node.js و Express',
    description: 'فهم كيف يعمل Node.js وكيفية بناء سيرفر REST API كامل.',
    order: 1,
    status: 'published'
  });

  await Lesson.create({
    module_id: mod1.id,
    title: 'الدرس 1: إعداد البيئة وإنشاء السيرفر الأول',
    slug: 'lesson-1-setup-server',
    content: 'في هذا الدرس سنتعلم تثبيت Node.js وإعداد Express وnodemon.',
    lesson_type: 'video',
    duration_seconds: 900,
    is_free: true,
    order: 1
  });

  // 4. Assessment & Question
  const quiz1 = await Assessment.create({
    course_id: courseWeb.id,
    created_by_id: instructor.id,
    title: 'اختبار تقييمي للموديول الأول',
    description: 'اختبار من متعدد لقياس مدى استيعاب مفهوم Node.js و Sequelize',
    type: 'quiz',
    status: 'published',
    duration_minutes: 20,
    total_marks: 20.00,
    passing_marks: 10.00
  });

  await QuestionBank.create({
    assessment_id: quiz1.id,
    question_text: 'ما هي وظيفة ORM مثل Sequelize في بيئة Node.js؟',
    question_type: 'mcq',
    options: JSON.stringify([
      'الربط والتعامل مع قواعد البيانات الكائنية دون كتابة SQL مباشر',
      'تنسيق واجهات المستخدم الفرونت إند',
      'تشفير كلمات المرور فقط',
      'تشغيل ملفات الفيديو'
    ]),
    correct_answer: 'الربط والتعامل مع قواعد البيانات الكائنية دون كتابة SQL مباشر',
    explanation: 'Sequelize هو ORM يسهل استعلامات وتحديد النماذج بقواعد بيانات MySQL وغير ذلك.',
    marks: 10.00
  });

  // 5. Banners & Coupons
  await Banner.create({
    title: 'خصم خاص بمناسبة انطلاق المنصة الجديدة 50%',
    title_ar: 'خصم خاص 50% على جميع الدورات الشاملة',
    description: 'احصل على امكانية وصول مدى الحياة لكافة الدورات والشهادات المعتمدة.',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200',
    banner_type: 'main'
  });

  await Coupon.create({
    code: 'WELCOME50',
    description: 'خصم 50% ترحيبي',
    discount_type: 'percentage',
    discount_value: 50,
    valid_from: new Date(),
    valid_to: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  });

  console.log('✅ Database seeded successfully!');
  process.exit(0);
}

runSeed().catch(err => {
  console.error('❌ Seed error:', err);
  process.exit(1);
});
