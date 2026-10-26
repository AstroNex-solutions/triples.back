const { ModuleModel, Lesson, Enrollment, UserProgress, ModuleProgress, LessonProgress } = require('../models');

exports.createModule = async (req, res) => {
  try {
    const { course_id, name, description, order } = req.body;
    let videoUrl = null;
    let pdfUrl = null;
    if (req.files) {
      if (req.files.video) videoUrl = req.files.video[0].filename;
      if (req.files.pdf) pdfUrl = req.files.pdf[0].filename;
    }
    const moduleObj = await ModuleModel.create({ course_id, name, description, order: order || 1, video_url: videoUrl, pdf_url: pdfUrl, status: 'published' });
    return res.status(201).json({ message: 'تم إضافة الموديول بنجاح', module: moduleObj });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ في إنشاء الموديول', error: error.message });
  }
};

exports.createLesson = async (req, res) => {
  try {
    const { module_id, title, content, lesson_type, duration_seconds, is_free, order } = req.body;
    let videoUrl = req.body.video_url || null;
    if (req.file) videoUrl = req.file.filename;
    const lesson = await Lesson.create({ module_id, title, content, lesson_type: lesson_type || 'article', duration_seconds: duration_seconds || 0, video_url: videoUrl, is_free: is_free === 'true' || is_free === true, order: order || 1 });
    return res.status(201).json({ message: 'تم إضافة الدرس بنجاح', lesson });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ في إنشاء الدرس', error: error.message });
  }
};

// helper: احسب نسبة تقدم الكورس الحقيقية
async function recalcCourseProgress(userId, courseId) {
  const courseModules = await ModuleModel.findAll({
    where: { course_id: courseId },
    include: [{ model: Lesson, as: 'lessons', where: { is_active: true }, required: false }]
  });
  let totalLessons = 0;
  const allModuleIds = [];
  courseModules.forEach(m => { totalLessons += (m.lessons || []).length; allModuleIds.push(m.id); });
  const allMp = await ModuleProgress.findAll({ where: { user_id: userId, module_id: allModuleIds } });
  let totalCompleted = 0;
  allMp.forEach(mp => { totalCompleted += (mp.completed_lessons || []).length; });
  const percentage = totalLessons > 0 ? Math.min(100, Math.round((totalCompleted / totalLessons) * 100)) : 0;
  let [usrProgress] = await UserProgress.findOrCreate({ where: { user_id: userId, course_id: courseId }, defaults: { status: 'not_started', overall_progress: 0 } });
  usrProgress.overall_progress = percentage;
  usrProgress.status = percentage >= 100 ? 'completed' : percentage > 0 ? 'in_progress' : 'not_started';
  await usrProgress.save();
  return { percentage, totalCompleted, totalLessons };
}

// تسجيل إكمال درس مع حساب التقدم الحقيقي
exports.completeLesson = async (req, res) => {
  try {
    const { lesson_id, course_id, module_id } = req.body;
    const userId = req.user.id;

    // تحديث ModuleProgress
    let [modProgress] = await ModuleProgress.findOrCreate({
      where: { user_id: userId, module_id },
      defaults: { status: 'in_progress', completed_lessons: [] }
    });
    const completedSet = new Set(modProgress.completed_lessons || []);
    completedSet.add(parseInt(lesson_id));
    modProgress.completed_lessons = Array.from(completedSet);
    const moduleWithLessons = await ModuleModel.findByPk(module_id, { include: [{ model: Lesson, as: 'lessons', where: { is_active: true }, required: false }] });
    const totalModuleLessons = moduleWithLessons?.lessons?.length || 0;
    modProgress.status = (totalModuleLessons > 0 && completedSet.size >= totalModuleLessons) ? 'completed' : 'in_progress';
    modProgress.is_completed = modProgress.status === 'completed';
    await modProgress.save();

    // حفظ LessonProgress
    await LessonProgress.upsert({ user_id: userId, lesson_id: parseInt(lesson_id), is_completed: true });

    // حساب نسبة الكورس
    const stats = await recalcCourseProgress(userId, course_id);

    return res.json({ message: 'تم تسجيل إكمال الدرس بنجاح', ...stats });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ في حفظ التقدم', error: error.message });
  }
};

// إلغاء إكمال درس (Uncomplete — للـ checkbox toggle)
exports.uncompleteLesson = async (req, res) => {
  try {
    const { lesson_id, course_id, module_id } = req.body;
    const userId = req.user.id;

    const modProgress = await ModuleProgress.findOne({ where: { user_id: userId, module_id } });
    if (modProgress) {
      const completedSet = new Set(modProgress.completed_lessons || []);
      completedSet.delete(parseInt(lesson_id));
      modProgress.completed_lessons = Array.from(completedSet);
      modProgress.status = completedSet.size === 0 ? 'not_started' : 'in_progress';
      modProgress.is_completed = false;
      await modProgress.save();
    }

    await LessonProgress.upsert({ user_id: userId, lesson_id: parseInt(lesson_id), is_completed: false });

    const stats = await recalcCourseProgress(userId, course_id);

    return res.json({ message: 'تم إلغاء إكمال الدرس', ...stats });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ في إلغاء الإكمال', error: error.message });
  }
};
