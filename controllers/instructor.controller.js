const { Op } = require('sequelize');

function makeSlug(text) {
  return (text || 'item').toLowerCase().replace(/[^a-z0-9\u0600-\u06FF]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now();
}

const {
  User, UserSession,
  Category, Tag, Course, CourseSection, CourseFAQ, CoursePackage,
  ModuleModel, Lesson, Enrollment, UserProgress, ModuleProgress,
  Assessment, QuestionBank, SelfAssessmentAttempt, SelfAssessmentAnswer,
  CourseReview, ReviewReply, Comment,
  Order, OrderItem,
  Article, ArticleComment, BookCategory, Book,
  ContactMessage
} = require('../models');

// ═══════════════════════════════════════════
//  HELPER: get IDs of courses owned by instructor
// ═══════════════════════════════════════════
async function myCourseIds(userId) {
  const courses = await Course.findAll({
    include: [{ model: User, as: 'instructors', where: { id: userId }, attributes: [], through: { attributes: [] } }],
    attributes: ['id']
  });
  return courses.map(c => c.id);
}

// ═══════════════════════════════════════════
//  DASHBOARD STATS
// ═══════════════════════════════════════════
exports.getInstructorStats = async (req, res) => {
  try {
    const ids = await myCourseIds(req.user.id);
    const totalCourses = ids.length;
    const totalEnrollments = ids.length ? await Enrollment.count({ where: { course_id: { [Op.in]: ids } } }) : 0;

    let totalRevenue = 0;
    if (ids.length) {
      const items = await OrderItem.findAll({
        where: { course_id: { [Op.in]: ids } },
        include: [{ model: Order, where: { status: 'completed' }, attributes: [] }]
      });
      totalRevenue = items.reduce((s, i) => s + parseFloat(i.price || 0), 0);
    }

    const totalAssessments = ids.length ? await Assessment.count({ where: { course_id: { [Op.in]: ids } } }) : 0;
    const totalReviews = ids.length ? await CourseReview.count({ where: { course_id: { [Op.in]: ids } } }) : 0;
    const totalArticles = await Article.count({ where: { author_id: req.user.id } });
    const totalBooks = await Book.count({ where: { uploaded_by_id: req.user.id } });

    // Average rating
    let avgRating = 0;
    if (ids.length) {
      const reviews = await CourseReview.findAll({ where: { course_id: { [Op.in]: ids } }, attributes: ['rating'] });
      if (reviews.length) avgRating = (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1);
    }

    return res.json({ totalCourses, totalEnrollments, totalRevenue, totalAssessments, totalReviews, totalArticles, totalBooks, avgRating: parseFloat(avgRating) });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ في جلب الإحصائيات', error: error.message });
  }
};

// ═══════════════════════════════════════════
//  PROFILE
// ═══════════════════════════════════════════
exports.updateMyProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    const fields = ['name', 'phone', 'shortBio', 'department', 'qualification', 'university', 'specialization'];
    fields.forEach(f => { if (req.body[f] !== undefined) user[f] = req.body[f]; });
    if (req.file) user.image_profile = req.file.filename;
    await user.save();
    const { password, reset_password_token, reset_password_expires, ...safeUser } = user.toJSON();
    return res.json({ message: 'تم تحديث الملف الشخصي بنجاح', user: safeUser });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ في تحديث الملف الشخصي', error: error.message });
  }
};

// ═══════════════════════════════════════════
//  SESSIONS
// ═══════════════════════════════════════════
exports.getMySessions = async (req, res) => {
  try {
    const sessions = await UserSession.findAll({ where: { user_id: req.user.id }, order: [['createdAt', 'DESC']] });
    return res.json({ sessions });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ', error: error.message });
  }
};

exports.revokeMySession = async (req, res) => {
  try {
    const session = await UserSession.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    if (!session) return res.status(404).json({ message: 'الجلسة غير موجودة' });
    session.is_active = false;
    await session.save();
    return res.json({ message: 'تم إنهاء الجلسة بنجاح' });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ', error: error.message });
  }
};

// ═══════════════════════════════════════════
//  COURSES MANAGEMENT
// ═══════════════════════════════════════════
exports.getMyCourses = async (req, res) => {
  try {
    const courses = await Course.findAll({
      include: [
        { model: User, as: 'instructors', where: { id: req.user.id }, attributes: [], through: { attributes: [] } },
        { model: Category, as: 'category' },
        { model: Tag, as: 'tags', through: { attributes: [] } },
        { model: ModuleModel, as: 'modules', include: [{ model: Lesson, as: 'lessons' }] }
      ],
      order: [['createdAt', 'DESC']]
    });
    return res.json({ courses });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ في جلب الكورسات', error: error.message });
  }
};

exports.createCourse = async (req, res) => {
  try {
    const { title, subtitle, description, short_description, level, price, discount_price, is_free, category_id } = req.body;
    const slug = makeSlug(title);
    let imagePath = null;
    if (req.file) imagePath = req.file.filename;

    const course = await Course.create({
      title, slug, subtitle, description, short_description,
      level: level || 'beginner',
      price: price || 0,
      discount_price: discount_price || null,
      is_free: is_free === 'true' || is_free === true,
      category_id: category_id || null,
      image: imagePath,
      status: 'pending_review'
    });
    await course.addInstructor(req.user);
    return res.status(201).json({ message: 'تم إنشاء الكورس بنجاح (بانتظار موافقة الإدارة)', course });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ في إنشاء الكورس', error: error.message });
  }
};

exports.updateMyCourse = async (req, res) => {
  try {
    const ids = await myCourseIds(req.user.id);
    if (!ids.includes(parseInt(req.params.id))) return res.status(403).json({ message: 'لا تملك صلاحية تعديل هذا الكورس' });

    const course = await Course.findByPk(req.params.id);
    const fields = ['title', 'subtitle', 'description', 'short_description', 'level', 'price', 'discount_price', 'is_free', 'category_id'];
    fields.forEach(f => { if (req.body[f] !== undefined) course[f] = req.body[f]; });
    if (req.file) course.image = req.file.filename;
    await course.save();
    return res.json({ message: 'تم تحديث الكورس بنجاح', course });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ في تحديث الكورس', error: error.message });
  }
};

// Categories & Tags (read-only for instructor)
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({ where: { is_active: true }, order: [['order', 'ASC']] });
    return res.json({ categories });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ', error: error.message });
  }
};

exports.getTags = async (req, res) => {
  try {
    const tags = await Tag.findAll({ where: { is_active: true }, order: [['name', 'ASC']] });
    return res.json({ tags });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ', error: error.message });
  }
};

// Sections
exports.addSection = async (req, res) => {
  try {
    const ids = await myCourseIds(req.user.id);
    if (!ids.includes(parseInt(req.body.course_id))) return res.status(403).json({ message: 'غير مصرح' });
    const section = await CourseSection.create({
      course_id: req.body.course_id,
      title_en: req.body.title_en || req.body.title,
      title_ar: req.body.title_ar,
      description_en: req.body.description_en,
      description_ar: req.body.description_ar,
      section_type: req.body.section_type || 'gallery',
      order: req.body.order || 0
    });
    return res.status(201).json({ message: 'تم إضافة القسم بنجاح', section });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ', error: error.message });
  }
};

// Modules
exports.addModule = async (req, res) => {
  try {
    const ids = await myCourseIds(req.user.id);
    if (!ids.includes(parseInt(req.body.course_id))) return res.status(403).json({ message: 'غير مصرح' });

    let videoUrl = null, pdfUrl = null;
    if (req.files) {
      if (req.files.video) videoUrl = req.files.video[0].filename;
      if (req.files.pdf) pdfUrl = req.files.pdf[0].filename;
    }

    const mod = await ModuleModel.create({
      course_id: req.body.course_id,
      name: req.body.name,
      description: req.body.description,
      order: req.body.order || 1,
      video_url: videoUrl,
      pdf_url: pdfUrl,
      status: 'published'
    });
    return res.status(201).json({ message: 'تم إضافة الوحدة بنجاح', module: mod });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ', error: error.message });
  }
};

// Lessons
exports.addLesson = async (req, res) => {
  try {
    const mod = await ModuleModel.findByPk(req.body.module_id);
    if (!mod) return res.status(404).json({ message: 'الوحدة غير موجودة' });
    const ids = await myCourseIds(req.user.id);
    if (!ids.includes(mod.course_id)) return res.status(403).json({ message: 'غير مصرح' });

    let videoUrl = req.body.video_url || null;
    if (req.file) videoUrl = req.file.filename;

    const lesson = await Lesson.create({
      module_id: req.body.module_id,
      title: req.body.title,
      content: req.body.content,
      lesson_type: req.body.lesson_type || 'video',
      duration_seconds: req.body.duration_seconds || 0,
      video_url: videoUrl,
      is_free: req.body.is_free === 'true' || req.body.is_free === true,
      order: req.body.order || 1
    });
    return res.status(201).json({ message: 'تم إضافة الدرس بنجاح', lesson });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ', error: error.message });
  }
};

// ═══════════════════════════════════════════
//  ENROLLMENTS & PROGRESS (read-only)
// ═══════════════════════════════════════════
exports.getMyEnrollments = async (req, res) => {
  try {
    const ids = await myCourseIds(req.user.id);
    if (!ids.length) return res.json({ enrollments: [] });
    const enrollments = await Enrollment.findAll({
      where: { course_id: { [Op.in]: ids } },
      include: [
        { model: User, as: 'student', attributes: ['id', 'name', 'email', 'image_profile'] },
        { model: Course, as: 'course', attributes: ['id', 'title'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    // enrich with user progress
    const enriched = [];
    for (const e of enrollments) {
      const up = await UserProgress.findOne({ where: { user_id: e.user_id, course_id: e.course_id } });
      enriched.push({ ...e.toJSON(), progress: up?.overall_progress || 0, progressStatus: up?.status || 'not_started' });
    }

    return res.json({ enrollments: enriched });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ', error: error.message });
  }
};

// ═══════════════════════════════════════════
//  ASSESSMENTS & QUESTION BANK
// ═══════════════════════════════════════════
exports.getMyAssessments = async (req, res) => {
  try {
    const ids = await myCourseIds(req.user.id);
    if (!ids.length) return res.json({ assessments: [] });
    const assessments = await Assessment.findAll({
      where: { course_id: { [Op.in]: ids } },
      include: [{ model: Course, attributes: ['id', 'title'] }, { model: QuestionBank, as: 'questions' }],
      order: [['createdAt', 'DESC']]
    });
    return res.json({ assessments });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ', error: error.message });
  }
};

exports.createAssessment = async (req, res) => {
  try {
    const ids = await myCourseIds(req.user.id);
    if (!ids.includes(parseInt(req.body.course_id))) return res.status(403).json({ message: 'غير مصرح' });

    const { course_id, title, description, type, duration_minutes, total_marks, passing_marks } = req.body;
    const assessment = await Assessment.create({
      course_id, title, description,
      type: type || 'quiz',
      created_by_id: req.user.id,
      duration_minutes, total_marks, passing_marks,
      start_date: req.body.start_date || new Date(),
      status: 'published'
    });
    return res.status(201).json({ message: 'تم إنشاء الاختبار بنجاح', assessment });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ', error: error.message });
  }
};

exports.addQuestion = async (req, res) => {
  try {
    const { assessment_id, question_text, question_type, difficulty_level, options, correct_answer, explanation, marks } = req.body;
    // verify assessment belongs to instructor
    const assessment = await Assessment.findByPk(assessment_id);
    if (!assessment) return res.status(404).json({ message: 'الاختبار غير موجود' });
    const ids = await myCourseIds(req.user.id);
    if (!ids.includes(assessment.course_id)) return res.status(403).json({ message: 'غير مصرح' });

    const question = await QuestionBank.create({
      assessment_id, question_text, question_type, difficulty_level,
      options: options || null,
      correct_answer, explanation,
      marks: marks || 1
    });
    return res.status(201).json({ message: 'تم إضافة السؤال بنجاح', question });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ', error: error.message });
  }
};

exports.getAttempts = async (req, res) => {
  try {
    const ids = await myCourseIds(req.user.id);
    const assessments = await Assessment.findAll({ where: { course_id: { [Op.in]: ids } }, attributes: ['id'] });
    const assessmentIds = assessments.map(a => a.id);
    if (!assessmentIds.length) return res.json({ attempts: [] });

    // Get attempts via SelfAssessmentProduct -> we'll look through assessments
    const attempts = await SelfAssessmentAttempt.findAll({
      include: [
        { model: User, attributes: ['id', 'name', 'email'] },
        { model: SelfAssessmentAnswer, as: 'answers', include: [{ model: QuestionBank, as: 'question' }] }
      ],
      order: [['createdAt', 'DESC']],
      limit: 100
    });
    return res.json({ attempts });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ', error: error.message });
  }
};

exports.gradeEssay = async (req, res) => {
  try {
    const answer = await SelfAssessmentAnswer.findByPk(req.params.id);
    if (!answer) return res.status(404).json({ message: 'الإجابة غير موجودة' });
    answer.marks_obtained = req.body.marks_obtained || 0;
    answer.is_correct = parseFloat(req.body.marks_obtained) > 0;
    await answer.save();
    return res.json({ message: 'تم تقييم الإجابة بنجاح', answer });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ', error: error.message });
  }
};

// ═══════════════════════════════════════════
//  REVIEWS & COMMENTS
// ═══════════════════════════════════════════
exports.getMyReviews = async (req, res) => {
  try {
    const ids = await myCourseIds(req.user.id);
    if (!ids.length) return res.json({ reviews: [] });
    const reviews = await CourseReview.findAll({
      where: { course_id: { [Op.in]: ids } },
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'image_profile'] },
        { model: Course, attributes: ['id', 'title'] },
        { model: ReviewReply, as: 'replies', include: [{ model: User, as: 'user', attributes: ['id', 'name'] }] }
      ],
      order: [['createdAt', 'DESC']]
    });
    return res.json({ reviews });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ', error: error.message });
  }
};

exports.replyToReview = async (req, res) => {
  try {
    const reply = await ReviewReply.create({
      review_id: req.params.id,
      user_id: req.user.id,
      reply_text: req.body.reply_text
    });
    return res.status(201).json({ message: 'تم الرد بنجاح', reply });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ', error: error.message });
  }
};

exports.getMyComments = async (req, res) => {
  try {
    const ids = await myCourseIds(req.user.id);
    if (!ids.length) return res.json({ comments: [] });
    const comments = await Comment.findAll({
      where: { course_id: { [Op.in]: ids } },
      include: [
        { model: User, as: 'user', attributes: ['id', 'name'] },
        { model: Course, attributes: ['id', 'title'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    return res.json({ comments });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ', error: error.message });
  }
};

// ═══════════════════════════════════════════
//  SALES
// ═══════════════════════════════════════════
exports.getMySales = async (req, res) => {
  try {
    const ids = await myCourseIds(req.user.id);
    if (!ids.length) return res.json({ orders: [] });

    const items = await OrderItem.findAll({
      where: { course_id: { [Op.in]: ids } },
      include: [
        { model: Order, include: [{ model: User, attributes: ['id', 'name', 'email'] }] },
        { model: Course, as: 'course', attributes: ['id', 'title'] }
      ],
      order: [[Order, 'createdAt', 'DESC']]
    });
    return res.json({ sales: items });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ', error: error.message });
  }
};

// ═══════════════════════════════════════════
//  ARTICLES
// ═══════════════════════════════════════════
exports.getMyArticles = async (req, res) => {
  try {
    const articles = await Article.findAll({ where: { author_id: req.user.id }, order: [['createdAt', 'DESC']] });
    return res.json({ articles });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ', error: error.message });
  }
};

exports.createArticle = async (req, res) => {
  try {
    const { title, content, summary, status } = req.body;
    const slug = makeSlug(title);
    let image = null;
    if (req.file) image = req.file.filename;
    const article = await Article.create({
      author_id: req.user.id, title, slug, content, summary, image,
      status: status || 'draft'
    });
    return res.status(201).json({ message: 'تم إنشاء المقال بنجاح', article });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ', error: error.message });
  }
};

exports.updateArticle = async (req, res) => {
  try {
    const article = await Article.findOne({ where: { id: req.params.id, author_id: req.user.id } });
    if (!article) return res.status(404).json({ message: 'المقال غير موجود أو لا تملك صلاحية' });
    const fields = ['title', 'content', 'summary', 'status'];
    fields.forEach(f => { if (req.body[f] !== undefined) article[f] = req.body[f]; });
    if (req.file) article.image = req.file.filename;
    await article.save();
    return res.json({ message: 'تم تحديث المقال بنجاح', article });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ', error: error.message });
  }
};

exports.deleteArticle = async (req, res) => {
  try {
    const result = await Article.destroy({ where: { id: req.params.id, author_id: req.user.id } });
    if (!result) return res.status(404).json({ message: 'المقال غير موجود' });
    return res.json({ message: 'تم حذف المقال بنجاح' });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ', error: error.message });
  }
};

// ═══════════════════════════════════════════
//  BOOKS
// ═══════════════════════════════════════════
exports.getMyBooks = async (req, res) => {
  try {
    const books = await Book.findAll({
      where: { uploaded_by_id: req.user.id },
      include: [{ model: BookCategory, as: 'category' }],
      order: [['createdAt', 'DESC']]
    });
    return res.json({ books });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ', error: error.message });
  }
};

exports.getBookCategories = async (req, res) => {
  try {
    const categories = await BookCategory.findAll({ order: [['name', 'ASC']] });
    return res.json({ categories });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ', error: error.message });
  }
};

exports.createBook = async (req, res) => {
  try {
    const { title, author_name, description, category_id, language, pages_count } = req.body;
    let bookFile = null, coverImage = null;
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
    return res.status(500).json({ message: 'خطأ', error: error.message });
  }
};

exports.updateBook = async (req, res) => {
  try {
    const book = await Book.findOne({ where: { id: req.params.id, uploaded_by_id: req.user.id } });
    if (!book) return res.status(404).json({ message: 'الكتاب غير موجود' });
    const fields = ['title', 'author_name', 'description', 'category_id', 'language', 'pages_count'];
    fields.forEach(f => { if (req.body[f] !== undefined) book[f] = req.body[f]; });
    await book.save();
    return res.json({ message: 'تم تحديث الكتاب بنجاح', book });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ', error: error.message });
  }
};

exports.deleteBook = async (req, res) => {
  try {
    const result = await Book.destroy({ where: { id: req.params.id, uploaded_by_id: req.user.id } });
    if (!result) return res.status(404).json({ message: 'الكتاب غير موجود' });
    return res.json({ message: 'تم حذف الكتاب بنجاح' });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ', error: error.message });
  }
};

// ═══════════════════════════════════════════
//  SUPPORT (send contact message)
// ═══════════════════════════════════════════
exports.sendSupportMessage = async (req, res) => {
  try {
    const msg = await ContactMessage.create({
      name: req.user.name,
      email: req.user.email,
      phone: req.user.phone || '',
      subject: req.body.subject,
      message: req.body.message,
      status: 'new'
    });
    return res.status(201).json({ message: 'تم إرسال رسالتك للإدارة بنجاح', contact: msg });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ', error: error.message });
  }
};
