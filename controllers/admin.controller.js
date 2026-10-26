const { Op } = require('sequelize');
const {
  User, UserSession, AccountFreeze,
  Category, Tag, Course,
  ModuleModel, Lesson, Enrollment, UserProgress,
  Assessment, QuestionBank, QuestionBankProduct, SelfAssessmentProduct,
  Coupon, Cart, Wishlist, Order, OrderItem,
  CourseReview, ReviewReply, Comment,
  Banner, ContactInfo, ContactMessage, Partnership,
  PrivacyPolicy, TermsAndConditions, RefundingFAQ,
  Article, ArticleComment, BookCategory, Book,
  FlashcardProduct, FlashcardDeck, FlashcardItem, FlashcardAccess,
  AboutUs
} = require('../models');

// Helper to upload single images dynamically (e.g. for dynamic sections)
exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'لم يتم رفع أي صورة' });
    return res.status(200).json({ url: req.file.filename });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ في رفع الصورة', error: error.message });
  }
};

const slugify = require('slugify');
const https = require('https');
const xlsx = require('xlsx');

// Helper to sync course duration from Bunny
const syncCourseDurationFromBunny = async (courseId) => {
  try {
    const course = await Course.findByPk(courseId, {
      include: [{
        model: ModuleModel, as: 'modules',
        include: [{ model: Lesson, as: 'lessons' }]
      }]
    });
    if (!course) {
      return;
    }

    let totalSeconds = 0;
    const libraryId = process.env.BUNNY_CDN_LIBRARY_ID || '657854';
    const apiKey = process.env.BUNNY_CDN_API_KEY || '4db2584a-9c0f-42ac-a8410334f40d-f845-4e40';

    if (course.modules) {
      for (const mod of course.modules) {
        if (mod.lessons) {
          for (const lesson of mod.lessons) {
            const url = lesson.video_url;
            if (url && url.includes('embed')) {
              if (lesson.duration_seconds && lesson.duration_seconds > 0) {
                 totalSeconds += lesson.duration_seconds;
                 continue;
              }
              const match = url.match(/\/embed\/\d+\/([a-zA-Z0-9-]+)/);
              if (match && match[1]) {
                const guid = match[1];
                try {
                  const options = {
                    hostname: 'video.bunnycdn.com',
                    path: `/library/${libraryId}/videos/${guid}`,
                    method: 'GET',
                    headers: { 'AccessKey': apiKey, 'Accept': 'application/json' }
                  };

                  const videoLength = await new Promise((resolve) => {
                    const req = https.request(options, (resAPI) => {
                      let data = '';
                      resAPI.on('data', chunk => data += chunk);
                      resAPI.on('end', () => {
                        try {
                          const parsed = JSON.parse(data);
                          resolve(parsed.length || 0);
                        } catch (e) {
                          resolve(0);
                        }
                      });
                    });
                    req.on('error', (err) => {
                      resolve(0);
                    });
                    req.end();
                  });

                  totalSeconds += videoLength;
                  if (videoLength > 0 && lesson.duration_seconds !== videoLength) {
                    lesson.duration_seconds = videoLength;
                    lesson.duration_minutes = Math.ceil(videoLength / 60);
                    await lesson.save();
                  }
                } catch (e) { console.log('[SYNC] Bunny API Error', e); }
              }
            } else if (lesson.duration_seconds) {
              totalSeconds += lesson.duration_seconds;
            } else if (lesson.duration_minutes) {
              totalSeconds += lesson.duration_minutes * 60;
            }
          }
        }
      }
    }

    course.total_duration += Math.ceil(totalSeconds / 60);
    await course.save();
    console.log(`[SYNC] Finished syncing. Course ${courseId} total_duration updated to ${course.total_duration} minutes.`);
  } catch (err) {
    console.log('[SYNC] Error syncing course duration:', err);
  }
};

// ═══════════════════════════════════════════
//  DASHBOARD STATS
// ═══════════════════════════════════════════

exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.count();
    const totalStudents = await User.count({ where: { status: 'Student' } });
    const totalInstructors = await User.count({ where: { status: 'Instructor' } });
    const totalCourses = await Course.count();
    const totalEnrollments = await Enrollment.count();
    const totalOrders = await Order.count({ where: { status: 'completed' } });

    const revenueResult = await Order.sum('total', { where: { status: 'completed' } });
    const totalRevenue = revenueResult || 0;

    const totalArticles = await Article.count();
    const totalBooks = await Book.count();
    const pendingCourses = await Course.count({ where: { status: 'pending_review' } });
    const newMessages = await ContactMessage.count({ where: { status: 'new' } });

    // Chart Data (Mock / Aggregated)
    // In a real production environment with high traffic, this would use complex SQL GROUP BY.
    // For now, we simulate the last 6 months data layout for the charts.
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    
    let revenueChartData = [];
    let enrollmentsChartData = [];
    for (let i = 5; i >= 0; i--) {
      let d = new Date();
      d.setMonth(currentMonth - i);
      let mName = monthNames[d.getMonth()];
      // Mocking data based on totals for demonstration, replacing with actual grouped query if needed.
      revenueChartData.push({ name: mName, revenue: Math.floor(Math.random() * (totalRevenue > 0 ? totalRevenue : 1000) / 6) });
      enrollmentsChartData.push({ name: mName, enrollments: Math.floor(Math.random() * (totalEnrollments > 0 ? totalEnrollments : 50) / 6) });
    }

    // Actual Category Data
    const categories = await Category.findAll({
      attributes: ['name', 'name_en'],
      include: [{ model: Course, as: 'courses', attributes: ['id'] }]
    });
    const categoryChartData = categories.map(cat => ({
      name: cat.name_en || cat.name,
      value: cat.courses ? cat.courses.length : 0
    })).filter(c => c.value > 0);

    return res.json({
      totalUsers, totalStudents, totalInstructors,
      totalCourses, totalEnrollments, totalOrders,
      totalRevenue, totalArticles, totalBooks,
      pendingCourses, newMessages,
      revenueChartData,
      enrollmentsChartData,
      categoryChartData: categoryChartData.length > 0 ? categoryChartData : [{ name: 'Courses', value: totalCourses }]
    });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ في جلب الإحصائيات', error: error.message });
  }
};

// ═══════════════════════════════════════════
//  USERS MANAGEMENT
// ═══════════════════════════════════════════

exports.getAllUsers = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 10 } = req.query;
    const where = {};
    if (status) where.status = status;
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { username: { [Op.like]: `%${search}%` } }
      ];
    }

    const offset = (page - 1) * limit;

    const { count, rows: users } = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password', 'reset_password_token', 'reset_password_expires'] },
      include: [{ model: AccountFreeze, as: 'account_freeze' }, { model: Enrollment, as: 'enrollments', include: [{ model: Course, as: 'course', attributes: ['title'] }] }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    return res.json({
      users,
      totalUsers: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page)
    });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ في جلب المستخدمين', error: error.message });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { username, email, password, name, phone, status } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'اسم المستخدم والإيميل وكلمة المرور مطلوبة' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' });
    }

    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) return res.status(400).json({ message: 'البريد الإلكتروني مستخدم بالفعل' });

    const existingUsername = await User.findOne({ where: { username } });
    if (existingUsername) return res.status(400).json({ message: 'اسم المستخدم مستخدم بالفعل' });

    const allowedStatuses = ['Student', 'Instructor', 'Admin'];
    const userStatus = allowedStatuses.includes(status) ? status : 'Student';

    const user = await User.create({
      username,
      email,
      password,
      name: name || username,
      phone: phone || null,
      status: userStatus
    });

    // Initialize related records
    await Cart.create({ user_id: user.id });
    await Wishlist.create({ user_id: user.id });
    await AccountFreeze.create({ user_id: user.id });

    return res.status(201).json({ message: 'تم إنشاء المستخدم بنجاح', user: { id: user.id, username: user.username, email: user.email, name: user.name, status: user.status } });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ في إنشاء المستخدم', error: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'المستخدم غير موجود' });

    const fields = ['name', 'email', 'phone', 'status', 'is_active', 'is_superuser', 'department', 'qualification'];
    fields.forEach(f => { if (req.body[f] !== undefined) user[f] = req.body[f]; });
    await user.save();

    return res.json({ message: 'تم تحديث بيانات المستخدم بنجاح', user });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ في تحديث المستخدم', error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'المستخدم غير موجود' });
    if (user.is_superuser) return res.status(403).json({ message: 'لا يمكن حذف حساب المدير الأعلى' });
    await user.destroy();
    return res.json({ message: 'تم حذف المستخدم بنجاح' });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ في حذف المستخدم', error: error.message });
  }
};

exports.freezeUser = async (req, res) => {
  try {
    const { reason } = req.body;
    const [freeze] = await AccountFreeze.findOrCreate({ where: { user_id: req.params.id } });
    freeze.is_frozen = true;
    freeze.frozen_by_admin = true;
    freeze.freeze_reason = reason || 'تم التجميد بواسطة الإدارة';
    freeze.freeze_start_date = new Date();
    freeze.freeze_count = (freeze.freeze_count || 0) + 1;
    freeze.admin_notes = req.body.admin_notes || null;
    await freeze.save();

    // Invalidate all active sessions
    await UserSession.update({ is_active: false }, { where: { user_id: req.params.id } });

    return res.json({ message: 'تم تجميد الحساب بنجاح' });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ في تجميد الحساب', error: error.message });
  }
};

exports.unfreezeUser = async (req, res) => {
  try {
    const freeze = await AccountFreeze.findOne({ where: { user_id: req.params.id } });
    if (!freeze) return res.status(404).json({ message: 'سجل التجميد غير موجود' });
    freeze.is_frozen = false;
    freeze.freeze_end_date = new Date();
    await freeze.save();
    return res.json({ message: 'تم فك تجميد الحساب بنجاح' });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ في فك تجميد الحساب', error: error.message });
  }
};

exports.changeUserPassword = async (req, res) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 6) {
      return res.status(400).json({ message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' });
    }

    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'المستخدم غير موجود' });

    // Set plain password — the beforeUpdate hook in User model will hash it automatically
    user.password = password;
    await user.save();

    // Invalidate all active sessions for security
    await UserSession.update({ is_active: false }, { where: { user_id: req.params.id } });

    return res.json({ message: 'تم تغيير كلمة المرور بنجاح وتم إنهاء جميع جلساته' });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ في تغيير كلمة المرور', error: error.message });
  }
};

// ═══════════════════════════════════════════
//  SESSIONS
// ═══════════════════════════════════════════

exports.getAllSessions = async (req, res) => {
  try {
    const sessions = await UserSession.findAll({
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email', 'status', 'image_profile'] }],
      order: [['createdAt', 'DESC']],
      limit: 200
    });
    return res.json({ sessions });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ في جلب الجلسات', error: error.message });
  }
};

exports.revokeSession = async (req, res) => {
  try {
    await UserSession.update({ is_active: false }, { where: { id: req.params.id } });
    return res.json({ message: 'تم إنهاء الجلسة بنجاح' });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ في إنهاء الجلسة', error: error.message });
  }
};

// ═══════════════════════════════════════════
//  CATEGORIES & TAGS
// ═══════════════════════════════════════════

exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({ order: [['order', 'ASC']] });
    return res.json({ categories });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ في جلب التصنيفات', error: error.message });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    const slug = slugify(name, { lower: true, strict: true }) + '-' + Date.now();
    let image = null;
    if (req.file) image = req.file.filename;
    const category = await Category.create({ name, slug, description, image });
    return res.status(201).json({ message: 'تم إنشاء التصنيف بنجاح', category });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ في إنشاء التصنيف', error: error.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const cat = await Category.findByPk(req.params.id);
    if (!cat) return res.status(404).json({ message: 'التصنيف غير موجود' });
    const fields = ['name', 'description', 'is_active', 'order'];
    fields.forEach(f => { if (req.body[f] !== undefined) cat[f] = req.body[f]; });
    if (req.file) cat.image = req.file.filename;
    await cat.save();
    return res.json({ message: 'تم تحديث التصنيف بنجاح', category: cat });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ في تحديث التصنيف', error: error.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    await Category.destroy({ where: { id: req.params.id } });
    return res.json({ message: 'تم حذف التصنيف بنجاح' });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ في حذف التصنيف', error: error.message });
  }
};

exports.getAllTags = async (req, res) => {
  try {
    const tags = await Tag.findAll({ order: [['name', 'ASC']] });
    return res.json({ tags });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ في جلب الوسوم', error: error.message });
  }
};

exports.createTag = async (req, res) => {
  try {
    const { name, description } = req.body;
    const slug = slugify(name, { lower: true, strict: true });
    const tag = await Tag.create({ name, slug, description });
    return res.status(201).json({ message: 'تم إنشاء الوسم بنجاح', tag });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ في إنشاء الوسم', error: error.message });
  }
};

exports.updateTag = async (req, res) => {
  try {
    const tag = await Tag.findByPk(req.params.id);
    if (!tag) return res.status(404).json({ message: 'الوسم غير موجود' });
    if (req.body.name !== undefined) tag.name = req.body.name;
    if (req.body.description !== undefined) tag.description = req.body.description;
    if (req.body.is_active !== undefined) tag.is_active = req.body.is_active;
    await tag.save();
    return res.json({ message: 'تم تحديث الوسم بنجاح', tag });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ في تحديث الوسم', error: error.message });
  }
};

exports.deleteTag = async (req, res) => {
  try {
    await Tag.destroy({ where: { id: req.params.id } });
    return res.json({ message: 'تم حذف الوسم بنجاح' });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ في حذف الوسم', error: error.message });
  }
};

// ═══════════════════════════════════════════
//  COURSES MANAGEMENT
// ═══════════════════════════════════════════

exports.getAllCoursesAdmin = async (req, res) => {
  try {
    const { ModuleModel, Lesson, CourseSection, CourseFAQ, CoursePackage } = require('../models');
    const courses = await Course.findAll({
      include: [
        { model: Category, as: 'category' },
        { model: User, as: 'instructors', attributes: ['id', 'name', 'email'], through: { attributes: [] } },
        { model: CourseSection, as: 'sections' },
        { model: CourseFAQ, as: 'faqs' },
        { model: CoursePackage, as: 'packages' }
      ],
      order: [['createdAt', 'DESC']]
    });

    const coursesData = [];
    for (const c of courses) {
       const cData = c.toJSON();
       const modCount = await ModuleModel.count({ where: { course_id: c.id } });
       const mods = await ModuleModel.findAll({ where: { course_id: c.id }, attributes: ['id'] });
       const modIds = mods.map(m => m.id);
       const lesCount = modIds.length > 0 ? await Lesson.count({ where: { module_id: modIds } }) : 0;
       
       cData.modulesCount = modCount;
       cData.lessonsCount = lesCount;
       coursesData.push(cData);
    }

    return res.json({ courses: coursesData });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ في جلب الكورسات', error: error.message });
  }
};

exports.getCourseModules = async (req, res) => {
  try {
    const { id } = req.params;
    const { ModuleModel, Lesson, QuestionBank } = require('../models');
    const rawModules = await ModuleModel.findAll({
      where: { course_id: id },
      include: [
        { model: Lesson, as: 'lessons', attributes: ['id', 'title', 'lesson_type', 'video_url', 'content', 'description', 'is_free', 'order', 'attachments'] },
        { model: QuestionBank, as: 'module_questions', where: { is_self_assessment: false }, required: false, attributes: ['id'] }
      ]
    });
    const modules = rawModules.map(m => {
      const data = m.toJSON();
      data.qbankCount = data.module_questions ? data.module_questions.length : 0;
      delete data.module_questions;
      return data;
    });
    return res.json({ modules });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ في جلب الموديولات', error: error.message });
  }
};

exports.updateCourse = async (req, res) => {
  try {
    const { ModuleModel, Lesson } = require('../models');
    const course = await Course.findByPk(req.params.id, {
      include: [{
        model: ModuleModel, as: 'modules',
        include: [{ model: Lesson, as: 'lessons' }]
      }]
    });
    if (!course) return res.status(404).json({ message: 'الكورس غير موجود' });

    const fields = ['title', 'subtitle', 'description', 'short_description', 'level', 'price', 'discount_price', 'is_free', 'status', 'is_featured', 'is_certified', 'is_active', 'category_id', 'allow_feedback', 'qbank_price', 'self_assessment_price', 'flashcard_price'];
    fields.forEach(f => { if (req.body[f] !== undefined) { course[f] = req.body[f] === 'true' ? true : (req.body[f] === 'false' ? false : req.body[f]); } });
    if (req.file) course.image = req.file.filename;

    await course.save();

    // Process nested data if provided
    const { CourseSection, CourseFAQ, CoursePackage } = require('../models');
    
    if (req.body.sections) {
      const sectionsData = typeof req.body.sections === 'string' ? JSON.parse(req.body.sections) : req.body.sections;
      await CourseSection.destroy({ where: { course_id: course.id } });
      for (const sec of sectionsData) {
        delete sec.id; delete sec.createdAt; delete sec.updatedAt;
        await CourseSection.create({ ...sec, course_id: course.id });
      }
    }

    if (req.body.faqs) {
      const faqsData = typeof req.body.faqs === 'string' ? JSON.parse(req.body.faqs) : req.body.faqs;
      await CourseFAQ.destroy({ where: { course_id: course.id } });
      for (const faq of faqsData) {
        delete faq.id; delete faq.createdAt; delete faq.updatedAt;
        await CourseFAQ.create({ ...faq, course_id: course.id });
      }
    }

    if (req.body.packages) {
      const pkgsData = typeof req.body.packages === 'string' ? JSON.parse(req.body.packages) : req.body.packages;
      await CoursePackage.destroy({ where: { course_id: course.id } });
      for (const pkg of pkgsData) {
        delete pkg.id; delete pkg.createdAt; delete pkg.updatedAt;
        await CoursePackage.create({ ...pkg, course_id: course.id });
      }
    }

    // Sync duration
    await syncCourseDurationFromBunny(course.id);

    // refetch course after sync
    const updatedCourse = await Course.findByPk(course.id);
    return res.json({ message: 'تم تحديث الكورس بنجاح', course: updatedCourse });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ في تحديث الكورس', error: error.message });
  }
};

exports.createCourseAdmin = async (req, res) => {
  try {
    const { title, subtitle, description, short_description, level, price, discount_price, is_free, category_id, qbank_price, self_assessment_price, flashcard_price } = req.body;
    const slug = slugify(title || 'course', { lower: true, strict: true }) + '-' + Date.now();
    let imagePath = null;
    if (req.file) imagePath = req.file.filename;

    const course = await Course.create({
      title, slug, subtitle, description, short_description,
      level: level || 'beginner',
      price: price || 0,
      discount_price: discount_price || null,
      is_free: is_free === 'true' || is_free === true,
      category_id: category_id || null,
      allow_feedback: req.body.allow_feedback === 'true' || req.body.allow_feedback === true || req.body.allow_feedback === undefined,
      qbank_price: qbank_price || 0,
      self_assessment_price: self_assessment_price || 0,
      flashcard_price: flashcard_price || 0,
      total_duration: 0,
      image: imagePath,
      status: 'published'
    });

    // Process nested data if provided
    const { CourseSection, CourseFAQ, CoursePackage } = require('../models');
    
    if (req.body.sections) {
      const sectionsData = typeof req.body.sections === 'string' ? JSON.parse(req.body.sections) : req.body.sections;
      for (const sec of sectionsData) {
        await CourseSection.create({ ...sec, course_id: course.id });
      }
    }

    if (req.body.faqs) {
      const faqsData = typeof req.body.faqs === 'string' ? JSON.parse(req.body.faqs) : req.body.faqs;
      for (const faq of faqsData) {
        await CourseFAQ.create({ ...faq, course_id: course.id });
      }
    }

    if (req.body.packages) {
      const pkgsData = typeof req.body.packages === 'string' ? JSON.parse(req.body.packages) : req.body.packages;
      for (const pkg of pkgsData) {
        await CoursePackage.create({ ...pkg, course_id: course.id });
      }
    }

    return res.status(201).json({ message: 'تم إنشاء الكورس بنجاح', course });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ في إنشاء الكورس', error: error.message });
  }
};

exports.addModuleAdmin = async (req, res) => {
  try {
    let videoUrl = null, pdfUrl = null;
    if (req.files) {
      if (req.files.video) videoUrl = req.files.video[0].filename;
      if (req.files.pdf) pdfUrl = req.files.pdf[0].filename;
    }

    const mod = await ModuleModel.create({
      course_id: req.body.course_id,
      submodule_id: req.body.submodule_id || null,
      name: req.body.name,
      description: req.body.description,
      order: req.body.order || 1,
      video_url: videoUrl,
      pdf_url: pdfUrl,
      status: 'published'
    });
    return res.status(201).json({ message: 'تم إضافة الوحدة بنجاح', module: mod });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ في إضافة الوحدة', error: error.message });
  }
};

exports.addLessonAdmin = async (req, res) => {
  try {
    const mod = await ModuleModel.findByPk(req.body.module_id);
    if (!mod) return res.status(404).json({ message: 'الوحدة غير موجودة' });

    let videoUrl = req.body.video_url || null;
    if (req.files && req.files.video && req.files.video[0]) {
      videoUrl = req.files.video[0].filename;
    }

    // Process attachments
    const attachments = [];
    if (req.files && req.files.attachments) {
      req.files.attachments.forEach(f => {
        attachments.push({
          name: f.originalname,
          url: f.filename,
          type: f.mimetype || 'application/octet-stream',
          size: f.size || 0
        });
      });
    }

    const lesson = await Lesson.create({
      module_id: req.body.module_id,
      title: req.body.title,
      content: req.body.content,
      lesson_type: req.body.lesson_type || 'video',
      duration_seconds: req.body.duration_seconds || 0,
      video_url: videoUrl,
      is_free: req.body.is_free === 'true' || req.body.is_free === true,
      order: req.body.order || 1,
      attachments
    });

    // Sync course duration
    await syncCourseDurationFromBunny(mod.course_id);

    return res.status(201).json({ message: 'تم إضافة الدرس بنجاح', lesson });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ في إضافة الدرس', error: error.message });
  }
};

exports.updateLessonAdmin = async (req, res) => {
  try {
    const lesson = await Lesson.findByPk(req.params.id);
    if (!lesson) return res.status(404).json({ message: 'الدرس غير موجود' });

    const fields = ['title', 'content', 'lesson_type', 'duration_seconds', 'video_url', 'is_free', 'order', 'is_active'];
    fields.forEach(f => {
      if (req.body[f] !== undefined) {
        if (f === 'video_url' && req.body[f] !== lesson.video_url) {
           lesson.duration_seconds = 0;
           lesson.video_url = req.body[f];
        } else if (f === 'is_free' || f === 'is_active') {
          lesson[f] = req.body[f] === 'true' || req.body[f] === true;
        } else {
          lesson[f] = req.body[f];
        }
      }
    });

    if (req.files && req.files.video && req.files.video[0]) {
      lesson.video_url = req.files.video[0].filename;
      lesson.duration_seconds = 0;
    } else if (req.body.video_url !== undefined && req.body.video_url !== lesson.video_url) {
      lesson.video_url = req.body.video_url;
      lesson.duration_seconds = 0;
    }

    // Append new attachments to existing ones
    if (req.files && req.files.attachments) {
      let existing = [];
      if (typeof lesson.attachments === 'string') {
        try { existing = JSON.parse(lesson.attachments); } catch (e) { }
      } else if (Array.isArray(lesson.attachments)) {
        existing = [...lesson.attachments];
      }
      const newAttachments = req.files.attachments.map(f => ({
        name: f.originalname,
        url: '/uploads/' + f.filename,
        type: f.mimetype || 'application/octet-stream',
        size: f.size || 0
      }));
      lesson.attachments = [...existing, ...newAttachments];
    }

    await lesson.save();

    // Sync course duration
    const mod = await ModuleModel.findByPk(lesson.module_id);
    if (mod) await syncCourseDurationFromBunny(mod.course_id);

    return res.json({ message: 'تم تحديث الدرس بنجاح', lesson });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ في تحديث الدرس', error: error.message });
  }
};

exports.deleteLessonAttachment = async (req, res) => {
  try {
    const lesson = await Lesson.findByPk(req.params.id);
    if (!lesson) return res.status(404).json({ message: 'الدرس غير موجود' });

    const idx = parseInt(req.params.attachmentIndex, 10);
    let attachments = [];
    if (typeof lesson.attachments === 'string') {
      try { attachments = JSON.parse(lesson.attachments); } catch (e) { }
    } else if (Array.isArray(lesson.attachments)) {
      attachments = [...lesson.attachments];
    }

    if (idx < 0 || idx >= attachments.length) {
      return res.status(400).json({ message: 'المرفق غير موجود' });
    }

    // Delete the physical file if stored locally
    const att = attachments[idx];
    if (att.url && att.url.startsWith('/uploads/')) {
      const fs = require('fs');
      const path = require('path');
      const localPath = path.join(__dirname, '..', att.url);
      fs.unlink(localPath, () => { });
    }

    attachments.splice(idx, 1);
    lesson.attachments = attachments;
    await lesson.save();

    return res.json({ message: 'تم حذف المرفق بنجاح', attachments: lesson.attachments });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ في حذف المرفق', error: error.message });
  }
};

exports.deleteLessonAdmin = async (req, res) => {
  try {
    const lesson = await Lesson.findByPk(req.params.id);
    if (!lesson) return res.status(404).json({ message: 'الدرس غير موجود' });

    const mod = await ModuleModel.findByPk(lesson.module_id);
    await lesson.destroy();

    if (mod) await syncCourseDurationFromBunny(mod.course_id);

    return res.json({ message: 'تم حذف الدرس بنجاح' });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ في حذف الدرس', error: error.message });
  }
};

exports.updateModuleAdmin = async (req, res) => {
  try {
    const mod = await ModuleModel.findByPk(req.params.id);
    if (!mod) return res.status(404).json({ message: 'الوحدة غير موجودة' });

    mod.name = req.body.name || mod.name;
    mod.description = req.body.description || mod.description;
    mod.order = req.body.order || mod.order;
    await mod.save();

    return res.json({ message: 'تم تحديث الوحدة بنجاح', module: mod });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ في تحديث الوحدة', error: error.message });
  }
};

exports.deleteModuleAdmin = async (req, res) => {
  try {
    const mod = await ModuleModel.findByPk(req.params.id);
    if (!mod) return res.status(404).json({ message: 'الوحدة غير موجودة' });

    await mod.destroy();

    return res.json({ message: 'تم حذف الوحدة بنجاح' });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ في حذف الوحدة', error: error.message });
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    await Course.destroy({ where: { id: req.params.id } });
    return res.json({ message: 'تم حذف الكورس بنجاح' });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ في حذف الكورس', error: error.message });
  }
};

exports.approveCourse = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) return res.status(404).json({ message: 'الكورس غير موجود' });
    course.status = 'published';
    await course.save();
    return res.json({ message: 'تم اعتماد ونشر الكورس بنجاح', course });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ في اعتماد الكورس', error: error.message });
  }
};

exports.addCourseInstructor = async (req, res) => {
  try {
    const { instructor_id } = req.body;
    if (!instructor_id) return res.status(400).json({ message: 'instructor_id مطلوب' });

    const course = await Course.findByPk(req.params.id);
    if (!course) return res.status(404).json({ message: 'الكورس غير موجود' });

    const instructor = await User.findOne({ where: { id: instructor_id, status: 'Instructor' } });
    if (!instructor) return res.status(404).json({ message: 'المحاضر غير موجود أو المستخدم ليس محاضراً' });

    await course.addInstructor(instructor);
    return res.json({ message: `تم إضافة ${instructor.name} كمحاضر للكورس بنجاح` });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ في إضافة المحاضر', error: error.message });
  }
};

exports.removeCourseInstructor = async (req, res) => {
  try {
    const course = await Course.findByPk(req.params.id);
    if (!course) return res.status(404).json({ message: 'الكورس غير موجود' });

    const instructor = await User.findByPk(req.params.instructorId);
    if (!instructor) return res.status(404).json({ message: 'المحاضر غير موجود' });

    await course.removeInstructor(instructor);
    return res.json({ message: 'تم إزالة المحاضر من الكورس بنجاح' });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ في إزالة المحاضر', error: error.message });
  }
};

exports.getBunnyVideos = async (req, res) => {
  const https = require('https');
  const apiKey = process.env.BUNNY_CDN_API_KEY || '4db2584a-9c0f-42ac-a8410334f40d-f845-4e40';
  const libraryId = process.env.BUNNY_CDN_LIBRARY_ID || '657854';

  const { search = '', page = 1, limit = 50 } = req.query;
  const searchParam = search ? `&search=${encodeURIComponent(search)}` : '';

  const options = {
    hostname: 'video.bunnycdn.com',
    path: `/library/${libraryId}/videos?page=${page}&itemsPerPage=${limit}&orderBy=date${searchParam}`,
    method: 'GET',
    headers: {
      'AccessKey': apiKey,
      'Accept': 'application/json'
    }
  };

  const request = https.request(options, (response) => {
    let data = '';
    response.on('data', chunk => data += chunk);
    response.on('end', () => {
      if (response.statusCode >= 200 && response.statusCode < 300) {
        try {
          const parsed = JSON.parse(data);
          return res.json({ videos: parsed.items || parsed, libraryId });
        } catch (e) {
          return res.status(500).json({ message: 'Error parsing response', error: e.message });
        }
      } else {
        return res.status(response.statusCode).json({ message: 'Bunny Stream Error', error: data });
      }
    });
  });

  request.on('error', (e) => {
    return res.status(500).json({ message: 'Request error', error: e.message });
  });

  request.end();
};

// ═══════════════════════════════════════════
//  ENROLLMENTS
// ═══════════════════════════════════════════

exports.getAllEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.findAll({
      include: [
        { model: User, as: 'student', attributes: ['id', 'name', 'email', 'image_profile'] },
        { model: Course, as: 'course', attributes: ['id', 'title'] }
      ],
      order: [['createdAt', 'DESC']],
      limit: 500
    });
    return res.json({ enrollments });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ في جلب الاشتراكات', error: error.message });
  }
};

exports.createEnrollment = async (req, res) => {
  try {
    const { user_id, course_id, is_paid, start_date, end_date, has_flashcards, has_qbank, has_self_assessment } = req.body;
    if (!user_id || !course_id) return res.status(400).json({ message: 'الرجاء تحديد الطالب والكورس' });

    // Check if user exists and is a student
    const student = await User.findByPk(Number(user_id));

    if (!student || student.status !== 'Student') return res.status(404).json({ message: 'الطالب غير موجود' });

    const course = await Course.findByPk(course_id);
    if (!course) return res.status(404).json({ message: 'الكورس غير موجود' });

    // Check if enrollment already exists
    const existing = await Enrollment.findOne({ where: { user_id, course_id } });
    if (existing) return res.status(400).json({ message: 'هذا الطالب مشترك مسبقاً في الكورس' });

    // Default dates if not provided
    const enrollStart = start_date ? new Date(start_date) : new Date();
    // Default to 1 year if end_date not provided
    const enrollEnd = end_date ? new Date(end_date) : new Date(enrollStart.getTime() + 365 * 24 * 60 * 60 * 1000);

    const enrollment = await Enrollment.create({
      user_id,
      course_id,
      is_paid: is_paid || false,
      status: 'active',
      enrollment_date: enrollStart,
      start_date: enrollStart,
      end_date: enrollEnd,
      has_flashcards: has_flashcards || false,
      has_qbank: has_qbank || false,
      has_self_assessment: has_self_assessment || false
    });

    return res.status(201).json({ message: 'تم إضافة الاشتراك بنجاح', enrollment });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ في إضافة الاشتراك', error: error.message });
  }
};

exports.updateEnrollment = async (req, res) => {
  try {
    const { id } = req.params;
    const { start_date, end_date, status, has_flashcards, has_qbank, has_self_assessment } = req.body;

    const enrollment = await Enrollment.findByPk(id);
    if (!enrollment) return res.status(404).json({ message: 'الاشتراك غير موجود' });

    if (start_date) {
      enrollment.start_date = new Date(start_date);
      enrollment.enrollment_date = new Date(start_date);
    }

    if (end_date) {
      enrollment.end_date = new Date(end_date);
      // If we are extending an expired enrollment, change its status back to active
      if (enrollment.status === 'suspended' && enrollment.end_date > new Date()) {
        enrollment.status = 'active';
      }
    }

    if (status) {
      enrollment.status = status;
    }

    if (has_flashcards !== undefined) enrollment.has_flashcards = has_flashcards;
    if (has_qbank !== undefined) enrollment.has_qbank = has_qbank;
    if (has_self_assessment !== undefined) enrollment.has_self_assessment = has_self_assessment;

    await enrollment.save();

    return res.json({ message: 'تم تحديث الاشتراك بنجاح', enrollment });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ في تحديث الاشتراك', error: error.message });
  }
};

// ═══════════════════════════════════════════
//  ASSESSMENTS & QUESTION BANK
// ═══════════════════════════════════════════

exports.getAllAssessments = async (req, res) => {
  try {
    const assessments = await Assessment.findAll({
      include: [
        { model: Course, attributes: ['id', 'title'] },
        { model: QuestionBank, as: 'questions' }
      ],
      order: [['createdAt', 'DESC']]
    });
    return res.json({ assessments });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ في جلب الاختبارات', error: error.message });
  }
};

exports.createAssessment = async (req, res) => {
  try {
    const { course_id, title, description, type, duration_minutes, total_marks, passing_marks, allow_multiple_attempts, max_attempts, start_date, end_date } = req.body;
    const assessment = await Assessment.create({
      course_id, title, description,
      type: type || 'quiz',
      created_by_id: req.user.id,
      duration_minutes, total_marks, passing_marks,
      allow_multiple_attempts, max_attempts,
      start_date: start_date || new Date(),
      end_date,
      status: 'published'
    });
    return res.status(201).json({ message: 'تم إنشاء الاختبار بنجاح', assessment });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ في إنشاء الاختبار', error: error.message });
  }
};

exports.deleteAssessment = async (req, res) => {
  try {
    await Assessment.destroy({ where: { id: req.params.id } });
    return res.json({ message: 'تم حذف الاختبار بنجاح' });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ في حذف الاختبار', error: error.message });
  }
};
exports.addQuestionToAssessment = async (req, res) => {
  try {
    const { assessment_id, question_text, question_type, difficulty_level, options, correct_answer, explanation, marks } = req.body;
    const assessment = await Assessment.findByPk(assessment_id);
    if (!assessment) return res.status(404).json({ message: 'الاختبار غير موجود' });
    const question = await QuestionBank.create({
      assessment_id, question_text, question_type, difficulty_level,
      options: options || null,
      correct_answer, explanation,
      marks: marks || 1
    });
    return res.status(201).json({ message: 'تم إضافة السؤال بنجاح', question });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ في إضافة السؤال', error: error.message });
  }
};
exports.createQuestion = async (req, res) => {
  try {
    const { assessment_id, question_bank_product_id, self_assessment_product_id, question_text, question_type, difficulty_level, options, correct_answer, explanation, marks } = req.body;
    const question = await QuestionBank.create({
      assessment_id: assessment_id || null,
      question_bank_product_id: question_bank_product_id || null,
      self_assessment_product_id: self_assessment_product_id || null,
      question_text, question_type, difficulty_level,
      options: options || null,
      correct_answer, explanation,
      marks: marks || 1
    });
    return res.status(201).json({ message: 'تم إضافة السؤال بنجاح', question });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ في إضافة السؤال', error: error.message });
  }
};

exports.updateQuestion = async (req, res) => {
  try {
    const q = await QuestionBank.findByPk(req.params.id);
    if (!q) return res.status(404).json({ message: 'السؤال غير موجود' });
    const fields = ['question_text', 'question_type', 'difficulty_level', 'options', 'correct_answer', 'explanation', 'marks'];
    fields.forEach(f => { if (req.body[f] !== undefined) q[f] = req.body[f]; });
    await q.save();
    return res.json({ message: 'تم تحديث السؤال بنجاح', question: q });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ في تحديث السؤال', error: error.message });
  }
};

exports.deleteQuestion = async (req, res) => {
  try {
    await QuestionBank.destroy({ where: { id: req.params.id } });
    return res.json({ message: 'تم حذف السؤال بنجاح' });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ في حذف السؤال', error: error.message });
  }
};

// ═══════════════════════════════════════════
//  COUPONS
// ═══════════════════════════════════════════

exports.getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.findAll({ order: [['createdAt', 'DESC']] });
    return res.json({ coupons });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ في جلب الكوبونات', error: error.message });
  }
};

exports.createCoupon = async (req, res) => {
  try {
    const { code, description, discount_type, discount_value, max_uses, min_purchase, valid_from, valid_to } = req.body;
    const coupon = await Coupon.create({
      code: code.toUpperCase(),
      description, discount_type, discount_value,
      max_uses: max_uses || 1,
      min_purchase: min_purchase || 0,
      valid_from: valid_from || new Date(),
      valid_to: valid_to || new Date(Date.now() + 30 * 86400000)
    });
    return res.status(201).json({ message: 'تم إنشاء الكوبون بنجاح', coupon });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ في إنشاء الكوبون', error: error.message });
  }
};

exports.updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByPk(req.params.id);
    if (!coupon) return res.status(404).json({ message: 'الكوبون غير موجود' });
    const fields = ['code', 'description', 'discount_type', 'discount_value', 'max_uses', 'min_purchase', 'valid_from', 'valid_to', 'is_active'];
    fields.forEach(f => { if (req.body[f] !== undefined) coupon[f] = req.body[f]; });
    await coupon.save();
    return res.json({ message: 'تم تحديث الكوبون بنجاح', coupon });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ في تحديث الكوبون', error: error.message });
  }
};

exports.deleteCoupon = async (req, res) => {
  try {
    await Coupon.destroy({ where: { id: req.params.id } });
    return res.json({ message: 'تم حذف الكوبون بنجاح' });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ في حذف الكوبون', error: error.message });
  }
};

// ═══════════════════════════════════════════
//  ORDERS
// ═══════════════════════════════════════════

exports.getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows } = await Order.findAndCountAll({
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
      include: [
        { model: User, attributes: ['id', 'name', 'email'] },
        { 
          model: OrderItem, 
          as: 'items', 
          include: [
            { model: Course, as: 'course', attributes: ['id', 'title'] },
            { model: FlashcardProduct, as: 'flashcard_product', attributes: ['id', 'title'] }
          ] 
        }
      ],
      order: [['createdAt', 'DESC']],
      distinct: true
    });
    
    return res.json({ 
      orders: rows,
      totalOrders: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page, 10)
    });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ في جلب الطلبات', error: error.message });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ message: 'الطلب غير موجود' });
    order.status = req.body.status;
    if (req.body.payment_status) order.payment_status = req.body.payment_status;
    if (order.status == 'completed') {
      order.payment_status == 'completed'
      const items = await OrderItem.findAll({ where: { order_id: order.id } });
      for (const item of items) {
        if (item.course_id) {
          const enrollment = await Enrollment.findOne({ where: { course_id: item.course_id, user_id: order.user_id } });
          if (!enrollment) {
            await Enrollment.create({ course_id: item.course_id, user_id: order.user_id, status: 'active', enrollment_date: new Date() });
          }
        } else if (item.flashcard_product_id) {
          const access = await FlashcardAccess.findOne({ where: { product_id: item.flashcard_product_id, user_id: order.user_id } });
          if (!access) {
            await FlashcardAccess.create({ product_id: item.flashcard_product_id, user_id: order.user_id });
          }
        }
      }
    }
    await order.save();
    return res.json({ message: 'تم تحديث حالة الطلب بنجاح', order });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ في تحديث حالة الطلب', error: error.message });
  }
};

// ═══════════════════════════════════════════
//  REVIEWS & COMMENTS
// ═══════════════════════════════════════════

exports.getAllReviews = async (req, res) => {
  try {
    const where = {};
    if (req.query.course_id) where.course_id = req.query.course_id;
    const reviews = await CourseReview.findAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'image_profile'] },
        { model: Course, attributes: ['id', 'title'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    return res.json({ reviews });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ في جلب التقييمات', error: error.message });
  }
};

exports.toggleReviewApproval = async (req, res) => {
  try {
    const review = await CourseReview.findByPk(req.params.id);
    if (!review) return res.status(404).json({ message: 'التقييم غير موجود' });
    review.is_approved = !review.is_approved;
    await review.save();
    return res.json({ message: review.is_approved ? 'تم الموافقة على التقييم' : 'تم إخفاء التقييم', review });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ في تحديث التقييم', error: error.message });
  }
};

exports.deleteCourseReview = async (req, res) => {
  try {
    const review = await CourseReview.findByPk(req.params.id);
    if (!review) return res.status(404).json({ message: 'التقييم غير موجود' });
    await review.destroy();
    return res.json({ message: 'تم حذف التقييم بنجاح' });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ في حذف التقييم', error: error.message });
  }
};

exports.getAllLessonReviews = async (req, res) => {
  try {
    const { LessonReview, Lesson, ModuleModel, User } = require('../models');
    let reviews = await LessonReview.findAll({
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'image_profile'] },
        { 
          model: Lesson, 
          attributes: ['id', 'title', 'module_id'],
          include: [{ model: ModuleModel, attributes: ['id', 'name', 'course_id'] }] 
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    if (req.query.course_id) {
      reviews = reviews.filter(r => r.Lesson?.ModuleModel?.course_id == req.query.course_id);
    }
    return res.json({ reviews });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ في جلب تقييمات الدروس', error: error.message });
  }
};

exports.toggleLessonReviewApproval = async (req, res) => {
  try {
    const { LessonReview } = require('../models');
    const review = await LessonReview.findByPk(req.params.id);
    if (!review) return res.status(404).json({ message: 'التقييم غير موجود' });
    review.is_approved = !review.is_approved;
    await review.save();
    return res.json({ message: review.is_approved ? 'تم الموافقة على التقييم' : 'تم إخفاء التقييم', review });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ في تحديث التقييم', error: error.message });
  }
};

exports.deleteLessonReview = async (req, res) => {
  try {
    const { LessonReview } = require('../models');
    const review = await LessonReview.findByPk(req.params.id);
    if (!review) return res.status(404).json({ message: 'التقييم غير موجود' });
    await review.destroy();
    return res.json({ message: 'تم حذف التقييم بنجاح' });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ في حذف التقييم', error: error.message });
  }
};

exports.getAllComments = async (req, res) => {
  try {
    const comments = await Comment.findAll({
      include: [
        { model: User, as: 'user', attributes: ['id', 'name'] },
        { model: Course, attributes: ['id', 'title'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    return res.json({ comments });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ في جلب التعليقات', error: error.message });
  }
};

exports.toggleCommentApproval = async (req, res) => {
  try {
    const comment = await Comment.findByPk(req.params.id);
    if (!comment) return res.status(404).json({ message: 'التعليق غير موجود' });
    comment.is_active = !comment.is_active;
    await comment.save();
    return res.json({ message: comment.is_active ? 'تم إظهار التعليق' : 'تم إخفاء التعليق', comment });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ في تحديث التعليق', error: error.message });
  }
};

exports.getAllArticleComments = async (req, res) => {
  try {
    const comments = await ArticleComment.findAll({
      include: [
        { model: User, as: 'user', attributes: ['id', 'name'] },
        { model: Article, attributes: ['id', 'title'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    return res.json({ comments });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ في جلب تعليقات المقالات', error: error.message });
  }
};

exports.toggleArticleCommentApproval = async (req, res) => {
  try {
    const comment = await ArticleComment.findByPk(req.params.id);
    if (!comment) return res.status(404).json({ message: 'التعليق غير موجود' });
    comment.is_approved = !comment.is_approved;
    await comment.save();
    return res.json({ message: comment.is_approved ? 'تم الموافقة على التعليق' : 'تم إخفاء التعليق', comment });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ', error: error.message });
  }
};

// ═══════════════════════════════════════════
//  BANNERS & CMS
// ═══════════════════════════════════════════

exports.getAllBanners = async (req, res) => {
  try {
    const banners = await Banner.findAll({ order: [['display_order', 'ASC']] });
    return res.json({ banners });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ في جلب البنرات', error: error.message });
  }
};

exports.createBanner = async (req, res) => {
  try {
    const { title, title_ar, description, description_ar, url, banner_type, button_text, button_text_ar, button_url, display_order } = req.body;
    let image = null;
    let image_ar = null;
    if (req.files) {
      if (req.files.image && req.files.image.length > 0) image = req.files.image[0].filename;
      if (req.files.image_ar && req.files.image_ar.length > 0) image_ar = req.files.image_ar[0].filename;
    }
    const banner = await Banner.create({
      title, title_ar, description, description_ar,
      image: image || '', image_ar: image_ar || null, url, banner_type,
      button_text, button_text_ar, button_url,
      display_order: display_order || 0
    });
    return res.status(201).json({ message: 'تم إنشاء البنر بنجاح', banner });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ في إنشاء البنر', error: error.message });
  }
};

exports.updateBanner = async (req, res) => {
  try {
    const banner = await Banner.findByPk(req.params.id);
    if (!banner) return res.status(404).json({ message: 'البنر غير موجود' });
    const fields = ['title', 'title_ar', 'description', 'description_ar', 'url', 'banner_type', 'button_text', 'button_text_ar', 'button_url', 'display_order', 'is_active'];
    fields.forEach(f => { if (req.body[f] !== undefined) banner[f] = req.body[f]; });
    if (req.files) {
      if (req.files.image && req.files.image.length > 0) banner.image = req.files.image[0].filename;
      if (req.files.image_ar && req.files.image_ar.length > 0) banner.image_ar = req.files.image_ar[0].filename;
    }
    await banner.save();
    return res.json({ message: 'تم تحديث البنر بنجاح', banner });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ في تحديث البنر', error: error.message });
  }
};

exports.deleteBanner = async (req, res) => {
  try {
    await Banner.destroy({ where: { id: req.params.id } });
    return res.json({ message: 'تم حذف البنر بنجاح' });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ في حذف البنر', error: error.message });
  }
};

exports.getContactInfo = async (req, res) => {
  try {
    let info = await ContactInfo.findOne({ where: { is_active: true } });
    return res.json({ info: info || null });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ', error: error.message });
  }
};

exports.updateContactInfo = async (req, res) => {
  try {
    let [info] = await ContactInfo.findOrCreate({ where: { is_active: true }, defaults: { email: 'admin@example.com' } });
    const fields = ['title', 'title_ar', 'description', 'description_ar', 'email', 'phone', 'address', 'address_ar', 'facebook', 'twitter', 'instagram', 'linkedin', 'youtube'];
    fields.forEach(f => { if (req.body[f] !== undefined) info[f] = req.body[f]; });
    await info.save();
    return res.json({ message: 'تم تحديث بيانات التواصل بنجاح', info });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ', error: error.message });
  }
};

exports.getPrivacyPolicy = async (req, res) => {
  try {
    let policy = await PrivacyPolicy.findOne({ where: { is_active: true } });
    return res.json({ policy: policy || null });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ', error: error.message });
  }
};

exports.updatePrivacyPolicy = async (req, res) => {
  try {
    let [policy] = await PrivacyPolicy.findOrCreate({ where: { is_active: true }, defaults: { content: '' } });
    if (req.body.title !== undefined) policy.title = req.body.title;
    if (req.body.content !== undefined) policy.content = req.body.content;
    if (req.body.title_ar !== undefined) policy.title_ar = req.body.title_ar;
    if (req.body.content_ar !== undefined) policy.content_ar = req.body.content_ar;
    await policy.save();
    return res.json({ message: 'تم تحديث سياسة الخصوصية بنجاح', policy });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ', error: error.message });
  }
};

exports.getAboutUs = async (req, res) => {
  try {
    let aboutUs = await AboutUs.findOne({ where: { is_active: true } });
    return res.json({ aboutUs: aboutUs || null });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ', error: error.message });
  }
};

exports.updateAboutUs = async (req, res) => {
  try {
    let [aboutUs] = await AboutUs.findOrCreate({ where: { is_active: true }, defaults: { content: '' } });
    if (req.body.title !== undefined) aboutUs.title = req.body.title;
    if (req.body.content !== undefined) aboutUs.content = req.body.content;
    if (req.body.title_ar !== undefined) aboutUs.title_ar = req.body.title_ar;
    if (req.body.content_ar !== undefined) aboutUs.content_ar = req.body.content_ar;
    await aboutUs.save();
    return res.json({ message: 'تم تحديث من نحن بنجاح', aboutUs });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ', error: error.message });
  }
};

exports.getTerms = async (req, res) => {
  try {
    let terms = await TermsAndConditions.findOne({ where: { is_active: true } });
    return res.json({ terms: terms || null });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ', error: error.message });
  }
};

exports.updateTerms = async (req, res) => {
  try {
    let [terms] = await TermsAndConditions.findOrCreate({ where: { is_active: true }, defaults: { content: '' } });
    if (req.body.title !== undefined) terms.title = req.body.title;
    if (req.body.content !== undefined) terms.content = req.body.content;
    if (req.body.title_ar !== undefined) terms.title_ar = req.body.title_ar;
    if (req.body.content_ar !== undefined) terms.content_ar = req.body.content_ar;
    await terms.save();
    return res.json({ message: 'تم تحديث الشروط والأحكام بنجاح', terms });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ', error: error.message });
  }
};

// ═══════════════════════════════════════════
//  CONTACT MESSAGES
// ═══════════════════════════════════════════

exports.getAllMessages = async (req, res) => {
  try {
    const messages = await ContactMessage.findAll({ order: [['createdAt', 'DESC']] });
    return res.json({ messages });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ في جلب الرسائل', error: error.message });
  }
};

exports.replyToMessage = async (req, res) => {
  try {
    const msg = await ContactMessage.findByPk(req.params.id);
    if (!msg) return res.status(404).json({ message: 'الرسالة غير موجودة' });
    msg.admin_response = req.body.admin_response;
    msg.status = 'replied';
    await msg.save();
    return res.json({ message: 'تم الرد على الرسالة بنجاح', contact: msg });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ في الرد على الرسالة', error: error.message });
  }
};

exports.updateMessageStatus = async (req, res) => {
  try {
    const msg = await ContactMessage.findByPk(req.params.id);
    if (!msg) return res.status(404).json({ message: 'الرسالة غير موجودة' });
    msg.status = req.body.status; // 'read', 'replied', 'closed'
    await msg.save();
    return res.json({ message: 'تم تحديث حالة الرسالة', contact: msg });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ', error: error.message });
  }
};

// ═══════════════════════════════════════════
//  ARTICLES
// ═══════════════════════════════════════════

exports.getAllArticlesAdmin = async (req, res) => {
  try {
    const articles = await Article.findAll({
      include: [{ model: User, as: 'author', attributes: ['id', 'name'] }],
      order: [['createdAt', 'DESC']]
    });
    return res.json({ articles });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ في جلب المقالات', error: error.message });
  }
};

exports.createArticle = async (req, res) => {
  try {
    const { title, title_en, content, content_en, summary, summary_en, status, featured, allow_comments } = req.body;
    const slug = slugify(title || 'article', { lower: true, strict: true }) + '-' + Date.now();
    let image = null;
    if (req.file) image = req.file.filename;

    const article = await Article.create({
      author_id: req.user.id,
      title, title_en, slug,
      content, content_en,
      summary, summary_en,
      image,
      status: status || 'published',
      featured: featured === 'true' || featured === true,
      allow_comments: allow_comments !== 'false'
    });
    return res.status(201).json({ message: 'تم إنشاء المقال بنجاح', article });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ في إنشاء المقال', error: error.message });
  }
};

exports.updateArticle = async (req, res) => {
  try {
    const article = await Article.findByPk(req.params.id);
    if (!article) return res.status(404).json({ message: 'المقال غير موجود' });

    const fields = ['title', 'title_en', 'content', 'content_en', 'summary', 'summary_en', 'status', 'featured', 'allow_comments'];
    fields.forEach(f => { if (req.body[f] !== undefined) article[f] = req.body[f]; });
    if (req.file) article.image = req.file.filename;
    await article.save();
    return res.json({ message: 'تم تحديث المقال بنجاح', article });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ في تحديث المقال', error: error.message });
  }
};

exports.deleteArticle = async (req, res) => {
  try {
    await Article.destroy({ where: { id: req.params.id } });
    return res.json({ message: 'تم حذف المقال بنجاح' });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ في حذف المقال', error: error.message });
  }
};

// ═══════════════════════════════════════════
//  BOOKS & LIBRARY
// ═══════════════════════════════════════════

exports.getAllBookCategories = async (req, res) => {
  try {
    const categories = await BookCategory.findAll({ order: [['name', 'ASC']] });
    return res.json({ categories });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ', error: error.message });
  }
};

exports.createBookCategory = async (req, res) => {
  try {
    const cat = await BookCategory.create({ name: req.body.name, description: req.body.description });
    return res.status(201).json({ message: 'تم إنشاء تصنيف الكتب بنجاح', category: cat });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ', error: error.message });
  }
};

exports.getAllBooksAdmin = async (req, res) => {
  try {
    const books = await Book.findAll({
      include: [
        { model: BookCategory, as: 'category' },
        { model: User, as: 'uploaded_by', attributes: ['id', 'name'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    return res.json({ books });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ في جلب الكتب', error: error.message });
  }
};

exports.createBook = async (req, res) => {
  try {
    const { title, author_name, description, category_id, language, pages_count } = req.body;
    let bookFile = null;
    let coverImage = null;
    if (req.files) {
      if (req.files.book_file) bookFile = req.files.book_file[0].filename;
      if (req.files.cover_image) coverImage = req.files.cover_image[0].filename;
    }
    const book = await Book.create({
      title, author_name, description,
      category_id: category_id || null,
      uploaded_by_id: req.user.id,
      book_file: bookFile || '',
      cover_image: coverImage,
      language: language || 'العربية',
      pages_count
    });
    return res.status(201).json({ message: 'تم رفع الكتاب بنجاح', book });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ في رفع الكتاب', error: error.message });
  }
};

exports.updateBook = async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id);
    if (!book) return res.status(404).json({ message: 'الكتاب غير موجود' });
    const fields = ['title', 'author_name', 'description', 'category_id', 'is_available', 'language', 'pages_count'];
    fields.forEach(f => { if (req.body[f] !== undefined) book[f] = req.body[f]; });
    await book.save();
    return res.json({ message: 'تم تحديث الكتاب بنجاح', book });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ في تحديث الكتاب', error: error.message });
  }
};

exports.deleteBook = async (req, res) => {
  try {
    await Book.destroy({ where: { id: req.params.id } });
    return res.json({ message: 'تم حذف الكتاب بنجاح' });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ في حذف الكتاب', error: error.message });
  }
};

// ═══════════════════════════════════════════
//  TESTIMONIALS (CRUD)
// ═══════════════════════════════════════════
exports.getTestimonials = async (req, res) => {
  try {
    const items = await Testimonial.findAll({ order: [['display_order', 'ASC'], ['createdAt', 'DESC']] });
    return res.json({ testimonials: items });
  } catch (error) {
    return res.status(500).json({ message: 'Error', error: error.message });
  }
};

exports.createTestimonial = async (req, res) => {
  try {
    const item = await Testimonial.create(req.body);
    if (req.file) { item.image = req.file.filename; await item.save(); }
    return res.status(201).json({ message: 'Created', testimonial: item });
  } catch (error) {
    return res.status(500).json({ message: 'Error', error: error.message });
  }
};

exports.updateTestimonial = async (req, res) => {
  try {
    const item = await Testimonial.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'Not Found' });
    await item.update(req.body);
    if (req.file) { item.image = req.file.filename; await item.save(); }
    return res.json({ message: 'Updated', testimonial: item });
  } catch (error) {
    return res.status(500).json({ message: 'Error', error: error.message });
  }
};

exports.deleteTestimonial = async (req, res) => {
  try {
    const item = await Testimonial.findByPk(req.params.id);
    if (item) await item.destroy();
    return res.json({ message: 'Deleted' });
  } catch (error) {
    return res.status(500).json({ message: 'Error', error: error.message });
  }
};

// ═══════════════════════════════════════════
//  PARTNERSHIPS (CRUD)
// ═══════════════════════════════════════════
exports.getPartnershipsAdmin = async (req, res) => {
  try {
    const items = await Partnership.findAll({ order: [['display_order', 'ASC'], ['createdAt', 'DESC']] });
    return res.json({ partnerships: items });
  } catch (error) {
    return res.status(500).json({ message: 'Error', error: error.message });
  }
};

exports.createPartnership = async (req, res) => {
  try {
    const item = await Partnership.create(req.body);
    console.log(req.file.filename);

    if (req.file) { item.logo = req.file.filename; await item.save(); }
    return res.status(201).json({ message: 'Created', partnership: item });
  } catch (error) {
    return res.status(500).json({ message: 'Error', error: error.message });
  }
};

exports.updatePartnership = async (req, res) => {
  try {
    const item = await Partnership.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'Not Found' });
    await item.update(req.body);
    console.log(req.file.filename);

    if (req.file) { item.logo = req.file.filename; await item.save(); }
    return res.json({ message: 'Updated', partnership: item });
  } catch (error) {
    return res.status(500).json({ message: 'Error', error: error.message });
  }
};

exports.deletePartnership = async (req, res) => {
  try {
    const item = await Partnership.findByPk(req.params.id);
    if (item) await item.destroy();
    return res.json({ message: 'Deleted' });
  } catch (error) {
    return res.status(500).json({ message: 'Error', error: error.message });
  }
};

// ═══════════════════════════════════════════
//  QUESTION BANK PRODUCTS
// ═══════════════════════════════════════════

exports.getAllQuestionBankProducts = async (req, res) => {
  try {
    const products = await QuestionBankProduct.findAll({
      include: [
        { model: Course, attributes: ['id', 'title'] },
        { model: QuestionBank, as: 'questions' }
      ],
      order: [['createdAt', 'DESC']]
    });
    return res.json({ products });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching products', error: error.message });
  }
};

exports.createQuestionBankProduct = async (req, res) => {
  try {
    const { course_id, title, description, price, is_free, status } = req.body;
    const product = await QuestionBankProduct.create({
      course_id, title, description, price, is_free, status
    });
    return res.status(201).json({ message: 'تم إنشاء المنتج بنجاح', product });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ في إنشاء المنتج', error: error.message });
  }
};

exports.updateQuestionBankProduct = async (req, res) => {
  try {
    const product = await QuestionBankProduct.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: 'المنتج غير موجود' });
    await product.update(req.body);
    return res.json({ message: 'تم التحديث بنجاح', product });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ في التحديث', error: error.message });
  }
};

exports.deleteQuestionBankProduct = async (req, res) => {
  try {
    const product = await QuestionBankProduct.findByPk(req.params.id);
    if (product) await product.destroy();
    return res.json({ message: 'تم الحذف بنجاح' });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ في الحذف', error: error.message });
  }
};

// ═══════════════════════════════════════════
//  SELF ASSESSMENT PRODUCTS
// ═══════════════════════════════════════════

exports.getAllSelfAssessmentProducts = async (req, res) => {
  try {
    const products = await SelfAssessmentProduct.findAll({
      include: [
        { model: Course, attributes: ['id', 'title'] },
        { model: QuestionBank, as: 'questions' }
      ],
      order: [['createdAt', 'DESC']]
    });
    return res.json({ products });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching products', error: error.message });
  }
};

exports.createSelfAssessmentProduct = async (req, res) => {
  try {
    const { course_id, title, description, price, is_free, duration_minutes, status } = req.body;
    const product = await SelfAssessmentProduct.create({
      course_id, title, description, price, is_free, duration_minutes, status
    });
    return res.status(201).json({ message: 'تم إنشاء المنتج بنجاح', product });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ في إنشاء المنتج', error: error.message });
  }
};

exports.updateSelfAssessmentProduct = async (req, res) => {
  try {
    const product = await SelfAssessmentProduct.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: 'المنتج غير موجود' });
    await product.update(req.body);
    return res.json({ message: 'تم التحديث بنجاح', product });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ في التحديث', error: error.message });
  }
};

exports.deleteSelfAssessmentProduct = async (req, res) => {
  try {
    const product = await SelfAssessmentProduct.findByPk(req.params.id);
    if (product) await product.destroy();
    return res.json({ message: 'تم الحذف بنجاح' });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ في الحذف', error: error.message });
  }
};

// ═══════════════════════════════════════════
//  PARTNERSHIPS
// ═══════════════════════════════════════════
exports.getPartnershipsAdmin = async (req, res) => {
  try {
    const partnerships = await Partnership.findAll({ order: [['display_order', 'ASC']] });
    return res.json({ partnerships });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching partnerships', error: error.message });
  }
};
exports.createPartnership = async (req, res) => {
  try {
    const { name, name_ar, website, display_order, is_active } = req.body;
    const logo = req.file ? `/uploads/${req.file.filename}` : '';
    if (!logo) return res.status(400).json({ message: 'Logo is required' });
    const partnership = await Partnership.create({ name, name_ar, website, display_order, is_active, logo });
    return res.status(201).json({ message: 'تم إضافة الشريك بنجاح', partnership });
  } catch (error) {
    return res.status(500).json({ message: 'Error creating partnership', error: error.message });
  }
};
exports.updatePartnership = async (req, res) => {
  try {
    const partnership = await Partnership.findByPk(req.params.id);
    if (!partnership) return res.status(404).json({ message: 'Not found' });
    const { name, name_ar, website, display_order, is_active } = req.body;
    if (req.file) partnership.logo = `/uploads/${req.file.filename}`;
    if (name !== undefined) partnership.name = name;
    if (name_ar !== undefined) partnership.name_ar = name_ar;
    if (website !== undefined) partnership.website = website;
    if (display_order !== undefined) partnership.display_order = display_order;
    if (is_active !== undefined) partnership.is_active = is_active;
    await partnership.save();
    return res.json({ message: 'تم تحديث الشريك', partnership });
  } catch (error) {
    return res.status(500).json({ message: 'Error updating', error: error.message });
  }
};
exports.deletePartnership = async (req, res) => {
  try {
    const partnership = await Partnership.findByPk(req.params.id);
    if (partnership) await partnership.destroy();
    return res.json({ message: 'تم الحذف' });
  } catch (error) {
    return res.status(500).json({ message: 'Error deleting', error: error.message });
  }
};

// ═══════════════════════════════════════════
//  REFUNDING FAQ (General FAQs)
// ═══════════════════════════════════════════
exports.getFaqsAdmin = async (req, res) => {
  try {
    const faqs = await RefundingFAQ.findAll({ order: [['display_order', 'ASC']] });
    return res.json({ faqs });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching FAQs', error: error.message });
  }
};
exports.createFaq = async (req, res) => {
  try {
    const faq = await RefundingFAQ.create(req.body);
    return res.status(201).json({ message: 'تم إضافة السؤال بنجاح', faq });
  } catch (error) {
    return res.status(500).json({ message: 'Error creating FAQ', error: error.message });
  }
};
exports.updateFaq = async (req, res) => {
  try {
    const faq = await RefundingFAQ.findByPk(req.params.id);
    if (!faq) return res.status(404).json({ message: 'Not found' });
    await faq.update(req.body);
    return res.json({ message: 'تم تحديث السؤال', faq });
  } catch (error) {
    return res.status(500).json({ message: 'Error updating FAQ', error: error.message });
  }
};
exports.deleteFaq = async (req, res) => {
  try {
    await RefundingFAQ.destroy({ where: { id: req.params.id } });
    return res.json({ message: 'تم الحذف' });
  } catch (error) {
    return res.status(500).json({ message: 'Error deleting FAQ', error: error.message });
  }
};

// ═══════════════════════════════════════════
//  STATIC PAGES (Terms, Privacy, Contact Info)
// ═══════════════════════════════════════════
exports.getTermsAdmin = async (req, res) => {
  try {
    let terms = await TermsAndConditions.findOne();
    if (!terms) terms = await TermsAndConditions.create({ title: 'Terms and Conditions', content: 'Default Content' });
    return res.json({ terms });
  } catch (error) { return res.status(500).json({ error: error.message }); }
};
exports.updateTerms = async (req, res) => {
  try {
    let terms = await TermsAndConditions.findOne();
    if (!terms) terms = await TermsAndConditions.create(req.body);
    else await terms.update(req.body);
    return res.json({ message: 'تم تحديث الشروط والأحكام', terms });
  } catch (error) { return res.status(500).json({ error: error.message }); }
};

exports.getPrivacyAdmin = async (req, res) => {
  try {
    let privacy = await PrivacyPolicy.findOne();
    if (!privacy) privacy = await PrivacyPolicy.create({ title: 'Privacy Policy', content: 'Default Content' });
    return res.json({ privacy });
  } catch (error) { return res.status(500).json({ error: error.message }); }
};
exports.updatePrivacy = async (req, res) => {
  try {
    let privacy = await PrivacyPolicy.findOne();
    if (!privacy) privacy = await PrivacyPolicy.create(req.body);
    else await privacy.update(req.body);
    return res.json({ message: 'تم تحديث سياسة الخصوصية', privacy });
  } catch (error) { return res.status(500).json({ error: error.message }); }
};

exports.getContactInfoAdmin = async (req, res) => {
  try {
    let info = await ContactInfo.findOne();
    if (!info) info = await ContactInfo.create({ email: 'contact@example.com' });
    return res.json({ info });
  } catch (error) { return res.status(500).json({ error: error.message }); }
};
exports.updateContactInfo = async (req, res) => {
  try {
    let info = await ContactInfo.findOne();
    if (!info) info = await ContactInfo.create(req.body);
    else await info.update(req.body);
    return res.json({ message: 'تم تحديث معلومات التواصل', info });
  } catch (error) { return res.status(500).json({ error: error.message }); }
};

// ═══════════════════════════════════════════
//  CONTACT MESSAGES
// ═══════════════════════════════════════════
exports.getContactMessagesAdmin = async (req, res) => {
  try {
    const messages = await ContactMessage.findAll({ order: [['createdAt', 'DESC']] });
    return res.json({ messages });
  } catch (error) { return res.status(500).json({ error: error.message }); }
};
exports.updateContactMessageStatus = async (req, res) => {
  try {
    const msg = await ContactMessage.findByPk(req.params.id);
    if (!msg) return res.status(404).json({ message: 'Not found' });
    await msg.update({ status: req.body.status, admin_response: req.body.admin_response });
    return res.json({ message: 'تم التحديث بنجاح', msg });
  } catch (error) { return res.status(500).json({ error: error.message }); }
};
exports.deleteContactMessage = async (req, res) => {
  try {
    await ContactMessage.destroy({ where: { id: req.params.id } });
    return res.json({ message: 'تم حذف الرسالة' });
  } catch (error) { return res.status(500).json({ error: error.message }); }
};

// ═══════════════════════════════════════════
//  ASSESSMENTS & QUESTION BANK
// ═══════════════════════════════════════════
exports.getAllAssessments = async (req, res) => {
  try {
    const assessments = await Assessment.findAll({
      include: [
        { model: Course, as: 'Course', attributes: ['title'] },
        { model: QuestionBank, as: 'questions' }
      ],
      order: [['createdAt', 'DESC']]
    });
    return res.json({ assessments });
  } catch (error) { return res.status(500).json({ error: error.message }); }
};

exports.createAssessment = async (req, res) => {
  try {
    req.body.created_by_id = req.user.id;
    const assessment = await Assessment.create(req.body);
    return res.json({ message: 'تم إنشاء الاختبار بنجاح', assessment });
  } catch (error) { return res.status(500).json({ error: error.message }); }
};

exports.updateAssessment = async (req, res) => {
  try {
    const assessment = await Assessment.findByPk(req.params.id);
    if (!assessment) return res.status(404).json({ message: 'الاختبار غير موجود' });
    await assessment.update(req.body);
    return res.json({ message: 'تم التحديث بنجاح', assessment });
  } catch (error) { return res.status(500).json({ error: error.message }); }
};

exports.deleteAssessment = async (req, res) => {
  try {
    await Assessment.destroy({ where: { id: req.params.id } });
    return res.json({ message: 'تم حذف الاختبار' });
  } catch (error) { return res.status(500).json({ error: error.message }); }
};

exports.createQuestion = async (req, res) => {
  try {
    let options = req.body.options;
    if (typeof options === 'string') {
      try { options = JSON.parse(options); } catch (e) { options = []; }
    }
    req.body.options = options;
    const question = await QuestionBank.create(req.body);
    return res.json({ message: 'تم إضافة السؤال', question });
  } catch (error) { return res.status(500).json({ error: error.message }); }
};

exports.addQuestionToAssessment = async (req, res) => {
  req.body.assessment_id = req.params.id;
  return exports.createQuestion(req, res);
};

exports.updateQuestion = async (req, res) => {
  try {
    const question = await QuestionBank.findByPk(req.params.id);
    if (!question) return res.status(404).json({ message: 'السؤال غير موجود' });
    let options = req.body.options;
    if (typeof options === 'string') {
      try { options = JSON.parse(options); } catch (e) { options = []; }
    }
    req.body.options = options;
    await question.update(req.body);
    return res.json({ message: 'تم التحديث بنجاح', question });
  } catch (error) { return res.status(500).json({ error: error.message }); }
};

exports.deleteQuestion = async (req, res) => {
  try {
    await QuestionBank.destroy({ where: { id: req.params.id } });
    return res.json({ message: 'تم الحذف' });
  } catch (error) { return res.status(500).json({ error: error.message }); }
};

exports.checkBrokenVideos = async (req, res) => {
  try {
    const axios = require('axios');
    const { Op } = require('sequelize');

    // جلب كل الدروس التي تحتوي على أي رابط فيديو (سواء في video_url أو bunny_video_url)
    const lessons = await Lesson.findAll({
      where: {
        [Op.or]: [
          { bunny_video_url: { [Op.not]: null, [Op.ne]: '' } }
        ]
      },
      attributes: ['id', 'title', 'bunny_video_url']
    });

    const brokenVideos = [];

    for (const lesson of lessons) {
      // إيقاف الفحص إذا وصلنا إلى 10 فيديوهات لا تعمل
      if (brokenVideos.length >= 10) {
        break;
      }

      // نختار الرابط الموجود فعلياً
      const urlToCheck = lesson.bunny_video_url

      try {
        // نقوم بالاتصال بالرابط فعلياً على الإنترنت للتأكد من أنه يعمل ويرجع فيديو
        const response = await axios.head(urlToCheck, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
          },
          timeout: 10000
        });

        // إذا كان الرد غير 200 (يعني الرابط لا يعمل أو محذوف)
        if (response.status !== 200) {
          brokenVideos.push({
            lessonId: lesson.id,
            title: lesson.title,
            url: urlToCheck,
            status: response.status,
            error: null
          });
        }
      } catch (error) {
        // إذا حدث خطأ في الاتصال بالرابط تماماً (مثلاً الموقع غير موجود أو 404)
        brokenVideos.push({
          lessonId: lesson.id,
          title: lesson.title,
          url: urlToCheck,
          status: error.response ? error.response.status : null,
          error: error.message
        });
      }
    }

    return res.json({
      success: true,
      totalChecked: lessons.length,
      brokenCount: brokenVideos.length,
      brokenVideos
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// ═══════════════════════════════════════════
//  12. FLASHCARDS
// ═══════════════════════════════════════════

// --- Flashcard Products ---
exports.getFlashcardProducts = async (req, res) => {
  try {
    const products = await FlashcardProduct.findAll({ 
      order: [['createdAt', 'DESC']],
      include: [{ model: Course, as: 'course', attributes: ['id', 'title'] }]
    });
    return res.json({ products });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ', error: error.message });
  }
};

exports.createFlashcardProduct = async (req, res) => {
  try {
    const product = await FlashcardProduct.create(req.body);
    return res.status(201).json({ message: 'تم الإنشاء', product });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ', error: error.message });
  }
};

exports.updateFlashcardProduct = async (req, res) => {
  try {
    const product = await FlashcardProduct.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: 'غير موجود' });
    await product.update(req.body);
    return res.json({ message: 'تم التحديث', product });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ', error: error.message });
  }
};

exports.deleteFlashcardProduct = async (req, res) => {
  try {
    const product = await FlashcardProduct.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: 'غير موجود' });
    await product.destroy();
    return res.json({ message: 'تم الحذف' });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ', error: error.message });
  }
};

exports.uploadFlashcardsExcel = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'لم يتم رفع ملف' });
    const productId = req.params.productId;
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    // 1. Fetch existing decks for this product to minimize DB calls
    const existingDecks = await FlashcardDeck.findAll({ where: { product_id: productId } });
    let deckCache = {};
    for (const d of existingDecks) {
      deckCache[`${d.chapter_name}_${d.topic_name}`] = d.id;
    }

    let itemsToInsert = [];
    let newDecksToCreate = [];
    let processedDecks = new Set();
    
    // 2. Identify missing decks
    for (const row of data) {
      const chapter = row['Chapter'] || row['الشابتر'];
      const topic = row['Topic'] || row['الموضوع'];
      if (!chapter || !topic || !row['Front Text'] || !row['Back Text']) continue;

      const deckKey = `${chapter}_${topic}`;
      if (!deckCache[deckKey] && !processedDecks.has(deckKey)) {
        newDecksToCreate.push({ product_id: productId, chapter_name: chapter, topic_name: topic, order: 1 });
        processedDecks.add(deckKey);
      }
    }

    // 3. Bulk create missing decks and update cache
    if (newDecksToCreate.length > 0) {
      const createdDecks = await FlashcardDeck.bulkCreate(newDecksToCreate);
      for (const d of createdDecks) {
        deckCache[`${d.chapter_name}_${d.topic_name}`] = d.id;
      }
    }

    // 4. Prepare items for bulk insert
    for (const row of data) {
      const chapter = row['Chapter'] || row['الشابتر'];
      const topic = row['Topic'] || row['الموضوع'];
      if (!chapter || !topic || !row['Front Text'] || !row['Back Text']) continue;

      const deckId = deckCache[`${chapter}_${topic}`];
      itemsToInsert.push({ deck_id: deckId, front_text: row['Front Text'], back_text: row['Back Text'], order: 1 });
    }

    // 5. Bulk Create Items
    if (itemsToInsert.length > 0) {
      await FlashcardItem.bulkCreate(itemsToInsert);
    }

    return res.json({ message: `تم استيراد ${itemsToInsert.length} كارت بنجاح.` });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ في معالجة الملف', error: error.message });
  }
};

exports.uploadFlashcardsToDeck = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'لم يتم رفع ملف' });
    const deckId = req.params.deckId;
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    
    // Read as 2D array to handle files without headers
    const rawData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });
    if (rawData.length === 0) return res.json({ message: 'الملف فارغ' });

    let itemsToInsert = [];
    const firstRow = rawData[0] || [];
    
    let frontIdx = -1;
    let backIdx = -1;
    
    const frontKeywords = ['front text', 'front', 'question', 'term', 'word', 'السؤال', 'سؤال', 'وجه أمامي'];
    const backKeywords = ['back text', 'back', 'answer', 'definition', 'meaning', 'الإجابة', 'إجابة', 'وجه خلفي'];
    
    // Attempt to find headers
    for (let i = 0; i < firstRow.length; i++) {
      if (typeof firstRow[i] === 'string') {
        const val = firstRow[i].toLowerCase().trim();
        if (frontKeywords.includes(val)) frontIdx = i;
        if (backKeywords.includes(val)) backIdx = i;
      }
    }
    
    let startIndex = 0;
    if (frontIdx !== -1 && backIdx !== -1) {
      // Headers found
      startIndex = 1;
    } else {
      // No standard headers, fallback to first two columns
      frontIdx = 0;
      backIdx = 1;
      startIndex = 0; // import from row 1
    }

    for (let i = startIndex; i < rawData.length; i++) {
      const row = rawData[i];
      if (!row) continue;
      
      const front = row[frontIdx];
      const back = row[backIdx];
      
      if (front === undefined || back === undefined || front === null || back === null || String(front).trim() === '' || String(back).trim() === '') continue;

      itemsToInsert.push({ deck_id: deckId, front_text: String(front).trim(), back_text: String(back).trim(), order: itemsToInsert.length + 1 });
    }

    if (itemsToInsert.length > 0) {
      await FlashcardItem.bulkCreate(itemsToInsert);
    }

    return res.json({ message: `تم استيراد ${itemsToInsert.length} كارت إلى هذا الفصل بسرعة فائقة.` });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ في معالجة الملف', error: error.message });
  }
};

// --- Flashcard Decks ---
exports.getFlashcardDecks = async (req, res) => {
  try {
    const decks = await FlashcardDeck.findAll({ 
      where: { product_id: req.params.productId },
      order: [['order', 'ASC']]
    });
    return res.json({ decks });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.createFlashcardDeck = async (req, res) => {
  try {
    const deck = await FlashcardDeck.create({ ...req.body, product_id: req.params.productId });
    return res.status(201).json({ deck });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.updateFlashcardDeck = async (req, res) => {
  try {
    const deck = await FlashcardDeck.findByPk(req.params.id);
    await deck.update(req.body);
    return res.json({ deck });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.deleteFlashcardDeck = async (req, res) => {
  try {
    const deck = await FlashcardDeck.findByPk(req.params.id);
    await deck.destroy();
    return res.json({ message: 'تم الحذف' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// --- Flashcard Items ---
exports.getFlashcardItems = async (req, res) => {
  try {
    const items = await FlashcardItem.findAll({ 
      where: { deck_id: req.params.deckId },
      order: [['order', 'ASC']]
    });
    return res.json({ items });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.createFlashcardItem = async (req, res) => {
  try {
    const item = await FlashcardItem.create({ ...req.body, deck_id: req.params.deckId });
    return res.status(201).json({ item });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.updateFlashcardItem = async (req, res) => {
  try {
    const item = await FlashcardItem.findByPk(req.params.id);
    await item.update(req.body);
    return res.json({ item });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.deleteFlashcardItem = async (req, res) => {
  try {
    const item = await FlashcardItem.findByPk(req.params.id);
    await item.destroy();
    return res.json({ message: 'تم الحذف' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};


exports.reorderModules = async (req, res) => {
  try {
    const { items } = req.body; // Array of { id, order }
    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ message: 'بيانات الترتيب غير صحيحة' });
    }
    
    // Process sequentially or using Promise.all
    for (const item of items) {
      // Assuming Module is imported as ModuleModel at the top
      await ModuleModel.update({ order: item.order }, { where: { id: item.id } });
    }
    
    return res.json({ message: 'تم تحديث الترتيب بنجاح' });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ في تحديث الترتيب', error: error.message });
  }
};

exports.reorderLessons = async (req, res) => {
  try {
    const { items } = req.body; // Array of { id, order }
    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ message: 'بيانات الترتيب غير صحيحة' });
    }
    
    // Process sequentially or using Promise.all
    for (const item of items) {
      // Assuming Lesson is imported at the top
      await Lesson.update({ order: item.order }, { where: { id: item.id } });
    }
    
    return res.json({ message: 'تم تحديث الترتيب بنجاح' });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ في تحديث الترتيب', error: error.message });
  }
};

exports.duplicateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { newName, newNameAr } = req.body;

    if (!newName) {
      return res.status(400).json({ message: 'الاسم الجديد للكورس مطلوب' });
    }

    // 1. Fetch original course with modules and lessons
    const originalCourse = await Course.findByPk(id, {
      include: [
        {
          model: ModuleModel,
          as: 'modules',
          include: [
            {
              model: Lesson,
              as: 'lessons'
            }
          ]
        }
      ]
    });

    if (!originalCourse) {
      return res.status(404).json({ message: 'الكورس غير موجود' });
    }

    // 2. Clone the main course
    const newSlug = slugify(newName, { lower: true, strict: true }) + '-' + Date.now();
    
    const newCourseData = {
      ...originalCourse.get({ plain: true }),
      title: newName,
      title_ar: newNameAr || newName,
      slug: newSlug,
      status: 'draft', // set to draft so it's not published immediately
      created_at: new Date(),
      updated_at: new Date(),
      total_students: 0,
      total_enrollments: 0,
      total_duration_seconds: originalCourse.total_duration_seconds || 0
    };
    
    // Remove relation arrays and ID before creating
    delete newCourseData.id;
    delete newCourseData.modules;
    delete newCourseData.instructors;
    delete newCourseData.tags;
    
    const newCourse = await Course.create(newCourseData);

    // 3. Clone modules and lessons
    if (originalCourse.modules && originalCourse.modules.length > 0) {
      for (const mod of originalCourse.modules) {
        const newModuleData = {
          ...mod.get({ plain: true }),
          course_id: newCourse.id, // attach to new course
          createdAt: new Date(),
          updatedAt: new Date()
        };
        delete newModuleData.id;
        delete newModuleData.lessons;

        const newModule = await ModuleModel.create(newModuleData);

        if (mod.lessons && mod.lessons.length > 0) {
          const lessonsToCreate = mod.lessons.map(lesson => {
            const lessonData = {
              ...lesson.get({ plain: true }),
              module_id: newModule.id, // attach to new module
              createdAt: new Date(),
              updatedAt: new Date()
            };
            delete lessonData.id;
            return lessonData;
          });
          await Lesson.bulkCreate(lessonsToCreate);
        }
      }
    }

    return res.status(201).json({ 
      message: 'تم استنساخ الكورس بنجاح',
      course: newCourse
    });

  } catch (error) {
    console.error('Error duplicating course:', error);
    return res.status(500).json({ message: 'حدث خطأ أثناء استنساخ الكورس', error: error.message });
  }
};



// ==========================================
// MODULE FLASHCARDS
// ==========================================
exports.getModuleFlashcards = async (req, res) => {
  try {
    const { id } = req.params;
    const decks = await FlashcardDeck.findAll({
      where: { module_id: id },
      order: [['order', 'ASC'], ['id', 'ASC']]
    });
    res.json({ decks });
  } catch (error) {
    res.status(500).json({ message: 'خطأ في جلب بطاقات الموديول', error: error.message });
  }
};

exports.createModuleFlashcard = async (req, res) => {
  try {
    const { id } = req.params;
    const { chapter_name, topic_name, order } = req.body;
    
    // In this logic, we assume we might need a default product_id or just set it to some logic.
    // If FlashcardDeck requires product_id and it can't be null, we need to handle it.
    // Let's just pass product_id: 1 for now if it is strictly required, or find the course's product.
    
    const deck = await FlashcardDeck.create({
      module_id: id,
      product_id: null,
      chapter_name,
      topic_name,
      order: order || 0
    });
    res.status(201).json({ message: 'تم إنشاء المجموعة', deck });
  } catch (error) {
    res.status(500).json({ message: 'خطأ في إضافة بطاقات الموديول', error: error.message });
  }
};

exports.updateModuleFlashcard = async (req, res) => {
  try {
    const { id } = req.params;
    const { chapter_name, topic_name, order } = req.body;
    
    const deck = await FlashcardDeck.findByPk(id);
    if (!deck) return res.status(404).json({ message: 'المجموعة غير موجودة' });
    
    await deck.update({ chapter_name, topic_name, order });
    res.json({ message: 'تم التحديث بنجاح', deck });
  } catch (error) {
    res.status(500).json({ message: 'خطأ في التحديث', error: error.message });
  }
};

exports.deleteModuleFlashcard = async (req, res) => {
  try {
    const { id } = req.params;
    const deck = await FlashcardDeck.findByPk(id);
    if (!deck) return res.status(404).json({ message: 'المجموعة غير موجودة' });
    
    await deck.destroy();
    res.json({ message: 'تم الحذف بنجاح' });
  } catch (error) {
    res.status(500).json({ message: 'خطأ في الحذف', error: error.message });
  }
};

// System Settings
exports.getSettings = async (req, res) => {
  try {
    const { SystemSetting } = require('../models');
    const settings = await SystemSetting.findAll();
    res.json({ settings });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching settings', error: error.message });
  }
};

exports.updateSettings = async (req, res) => {
  try {
    const { SystemSetting } = require('../models');
    const { key, value } = req.body;
    let setting = await SystemSetting.findOne({ where: { key } });
    if (setting) {
      setting.value = String(value);
      await setting.save();
    } else {
      setting = await SystemSetting.create({ key, value: String(value) });
    }
    res.json({ message: 'Setting updated successfully', setting });
  } catch (error) {
    res.status(500).json({ message: 'Error updating setting', error: error.message });
  }
};

exports.deleteEnrollment = async (req, res) => {
  try {
    const enrollment = await require('../models').Enrollment.findByPk(req.params.id);
    if (!enrollment) return res.status(404).json({ message: 'Enrollment not found' });
    await enrollment.destroy();
    res.json({ message: 'Enrollment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting enrollment', error: error.message });
  }
};
