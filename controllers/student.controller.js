const { Op, Sequelize } = require('sequelize');
const {
  User, UserSession, AccountFreeze,
  Course, Enrollment, UserProgress, ModuleProgress, StudySchedule, ModuleModel, Lesson,
  Assessment, QuestionBank, QuestionBankProduct, SelfAssessmentProduct, SelfAssessmentAttempt, SelfAssessmentAnswer,
  AssessmentAttempt, AssessmentAnswer,
  Order, OrderItem,
  CourseReview, LessonReview, Comment, ReviewReply,
  ContactMessage, Article, Book, LessonProgress,
  FlashcardProduct, FlashcardDeck, FlashcardItem, FlashcardAccess
} = require('../models');

// ═══════════════════════════════════════════
//  1. DASHBOARD STATS
// ═══════════════════════════════════════════
exports.getStudentStats = async (req, res) => {
  try {
    const studentId = req.user.id;
    const enrollmentsCount = await Enrollment.count({ where: { user_id: studentId } });
    const completedCoursesCount = await UserProgress.count({ where: { user_id: studentId, status: 'completed' } });
    const pendingAssessmentsCount = await Assessment.count({
      include: [{ model: Course, required: true, include: [{ model: Enrollment, as: 'enrollments', where: { user_id: studentId }, attributes: [] }] }]
    });
    const ordersCount = await Order.count({ where: { user_id: studentId, status: 'completed' } });

    // 1. Skill Data (Mind Map) based on Enrolled Courses
    const enrollments = await Enrollment.findAll({
      where: { user_id: studentId },
      include: [{ model: Course, as: 'course', attributes: ['title'] }],
      limit: 6
    });

    // 3. Upcoming Schedule
    const upcoming = await StudySchedule.findAll({
      where: { user_id: studentId, is_active: true },
      include: [{ model: Course, as: 'course', attributes: ['title'] }],
      order: [['start_date', 'ASC']],
      limit: 3
    });

    const upcomingSchedule = upcoming.map(s => ({
      id: s.id,
      title: s.course?.title || 'Study Session',
      date: s.start_date,
      hours: s.daily_hours
    }));

    // Features Access Check
    const hasFlashcardsGlobal = await FlashcardAccess.count({ where: { user_id: studentId } }) > 0;
    const enrollmentsWithFlashcards = await Enrollment.count({ where: { user_id: studentId, status: 'active', has_flashcards: true } });
    const enrollmentsWithQbank = await Enrollment.count({ where: { user_id: studentId, status: 'active', has_qbank: true } });
    const enrollmentsWithSelfAssessment = await Enrollment.count({ where: { user_id: studentId, status: 'active', has_self_assessment: true } });

    const { SystemSetting } = require('../models');
    const librarySetting = await SystemSetting.findOne({ where: { key: 'library_enabled' } });
    const libraryEnabled = librarySetting ? librarySetting.value === 'true' : true; // default true

    const features = {
      flashcards: hasFlashcardsGlobal || enrollmentsWithFlashcards > 0,
      qbank: enrollmentsWithQbank > 0,
      selfAssessment: enrollmentsWithSelfAssessment > 0,
      schedule: true, // everyone has schedule access
      performance: true, // everyone has performance access
      freeze: enrollmentsWithFlashcards > 0 || enrollmentsWithQbank > 0 || enrollmentsWithSelfAssessment > 0 || hasFlashcardsGlobal,
      library: libraryEnabled,
    };

    // Active Courses with Modules and Instructors
    const activeEnrollments = await Enrollment.findAll({
      where: { user_id: studentId, status: 'active' },
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title', 'image', 'flashcard_price', 'qbank_price', 'self_assessment_price'],
          include: [
            {
              model: ModuleModel,
              as: 'modules',
              attributes: ['id', 'name', 'submodule_id', 'order'],
              include: [
                { model: Lesson, as: 'lessons', attributes: ['id'] },
                {
                  model: ModuleModel,
                  as: 'submodules',
                  attributes: ['id', 'order'],
                  include: [{ model: Lesson, as: 'lessons', attributes: ['id'] }]
                }
              ]
            },
            {
              model: User,
              as: 'instructors',
              attributes: ['id', 'name', 'image_profile'],
              through: { attributes: [] }
            }
          ]
        }
      ]
    });

    const activeCourses = activeEnrollments.map(e => {
      const course = e.course;
      if (!course) return null;
      return {
        id: course.id,
        title: course.title,
        image: course.image,
        flashcard_price: course.flashcard_price,
        qbank_price: course.qbank_price,
        self_assessment_price: course.self_assessment_price,
        features: {
          // Each feature is unlocked only if THIS specific enrollment has it enabled
          flashcards: !!e.has_flashcards || hasFlashcardsGlobal,
          qbank: !!e.has_qbank,
          selfAssessment: !!e.has_self_assessment,
          schedule: true,
          performance: true,
          freeze: !!e.has_flashcards || !!e.has_qbank || !!e.has_self_assessment || hasFlashcardsGlobal
        },
        instructors: course.instructors || [],
        modules: (course.modules || [])
          .filter(m => m.submodule_id === null)
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
          .map(m => {
            const submodulesLessonsCount = m.submodules ? m.submodules.reduce((sum, sub) => sum + (sub.lessons ? sub.lessons.length : 0), 0) : 0;
            const directLessonsCount = m.lessons ? m.lessons.length : 0;
            return {
              id: m.id,
              name: m.name,
              order: m.order,
              lessonsCount: submodulesLessonsCount + directLessonsCount,
              submodulesCount: m.submodules ? m.submodules.length : 0,
              submoduleIds: m.submodules ? m.submodules.map(s => s.id) : [], // needed for progress calc
              completedLessons: 0, // This will be updated below
            };
          })
      };
    }).filter(Boolean);

    // Fetch module progress for this user (covers parent modules AND submodules)
    const allModuleIds = [];
    activeCourses.forEach(course => {
      course.modules.forEach(m => {
        allModuleIds.push(m.id);
        m.submoduleIds.forEach(sid => allModuleIds.push(sid));
      });
    });
    const moduleProgresses = await ModuleProgress.findAll({
      where: { user_id: studentId, module_id: allModuleIds.length > 0 ? { [Op.in]: allModuleIds } : 0 }
    });

    activeCourses.forEach(course => {
      course.modules.forEach(m => {
        // Aggregate completed lessons from parent module + all its submodules
        const allIds = [m.id, ...(m.submoduleIds || [])];
        let completedCount = 0;
        allIds.forEach(mid => {
          const mp = moduleProgresses.find(p => p.module_id === mid);
          if (mp && mp.completed_lessons) {
            if (Array.isArray(mp.completed_lessons)) {
              completedCount += mp.completed_lessons.length;
            } else if (typeof mp.completed_lessons === 'string') {
              try { completedCount += JSON.parse(mp.completed_lessons).length; } catch (e) {}
            }
          }
        });
        m.completedLessons = completedCount;
        delete m.submoduleIds; // clean up — not needed on frontend
      });
    });

    // Fetch questionsCount and completedQuestions per course
    const courseIds = activeCourses.map(c => c.id);
    if (courseIds.length > 0) {
      // Total questions per course (via QuestionBankProduct)
      const qbProducts = await QuestionBankProduct.findAll({
        where: { course_id: { [Op.in]: courseIds }, status: 'published' },
        include: [{ model: QuestionBank, as: 'questions', attributes: ['id'] }]
      });

      // Count answered questions per course by this student (via SelfAssessmentAttempt answers)
      const saAttempts = await SelfAssessmentAttempt.findAll({
        where: { user_id: studentId, status: 'submitted' },
        include: [{
          model: SelfAssessmentProduct,
          as: 'product',
          attributes: ['id', 'course_id'],
          where: { course_id: { [Op.in]: courseIds } }
        }],
        attributes: ['id', 'product_id']
      });

      // Build answered question IDs per course
      const answeredByCourse = {};
      for (const attempt of saAttempts) {
        const courseId = attempt.product?.course_id;
        if (!courseId) continue;
        if (!answeredByCourse[courseId]) answeredByCourse[courseId] = new Set();
        // Count the attempt itself as a completed session
        answeredByCourse[courseId].add(attempt.id);
      }

      activeCourses.forEach(course => {
        const courseProducts = qbProducts.filter(p => p.course_id === course.id);
        const totalQ = courseProducts.reduce((sum, p) => sum + (p.questions ? p.questions.length : 0), 0);
        const doneQ = answeredByCourse[course.id] ? answeredByCourse[course.id].size : 0;
        course.questionsCount = totalQ;
        course.completedQuestions = doneQ;
      });
    }

    // 4. Achievements (Simplistic representation)
    const achievements = [];
    if (completedCoursesCount > 0) {
      achievements.push({ id: 1, title: `Completed ${completedCoursesCount} Courses`, subtitle: 'You earned a certificate!', type: 'course', color: 'amber' });
    }
    if (enrollmentsCount > 2) {
      achievements.push({ id: 2, title: 'Avid Learner', subtitle: 'Enrolled in 3+ courses.', type: 'streak', color: 'primary' });
    }

    return res.json({
      enrollmentsCount,
      completedCoursesCount,
      pendingAssessmentsCount,
      ordersCount,
      upcomingSchedule,
      achievements,
      features,
      activeCourses
    });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ في جلب الإحصائيات', error: error.message });
  }
};

// ═══════════════════════════════════════════
//  2. PROFILE & SESSIONS & FREEZE
// ═══════════════════════════════════════════
exports.updateMyProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    const fields = [
      'name', 'phone', 'shortBio', 'detail', 'interests',
      'department', 'qualification', 'github', 'youtube',
      'twitter', 'facebook', 'instagram', 'linkedin'
    ];
    fields.forEach(f => { if (req.body[f] !== undefined) user[f] = req.body[f]; });
    if (req.file) user.image_profile = req.file.filename;
    // Password updates are now handled separately via changePassword
    await user.save();

    const safeUser = user.toJSON();
    delete safeUser.password;
    delete safeUser.reset_password_token;
    return res.json({ message: 'تم تحديث الملف الشخصي بنجاح', user: safeUser });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ في التحديث', error: error.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'يرجى إدخال كلمة المرور الحالية والجديدة' });
    }

    const user = await User.findByPk(req.user.id);
    const bcrypt = require('bcryptjs');

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'كلمة المرور الحالية غير صحيحة' });
    }

    // Update to new password
    user.password = newPassword; // Model hook will hash it before saving
    await user.save();

    return res.json({ message: 'تم تغيير كلمة المرور بنجاح' });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ في تغيير كلمة المرور', error: error.message });
  }
};

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

exports.requestAccountFreeze = async (req, res) => {
  try {
    const freeze = await AccountFreeze.findOne({ where: { user_id: req.user.id } });
    if (!freeze) {
      await AccountFreeze.create({ user_id: req.user.id, is_frozen: true, freeze_reason: req.body.reason || 'Requested by student' });
    } else {
      freeze.is_frozen = true;
      freeze.freeze_reason = req.body.reason || 'Requested by student';
      await freeze.save();
    }

    // Deactivate active sessions
    await UserSession.update({ is_active: false }, { where: { user_id: req.user.id } });

    return res.json({ message: 'تم تجميد الحساب بنجاح. سيتم تسجيل خروجك الآن.' });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ في تجميد الحساب', error: error.message });
  }
};

// ═══════════════════════════════════════════
//  3. ENROLLMENTS & PROGRESS & SCHEDULES
// ═══════════════════════════════════════════
exports.getMyEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.findAll({
      where: { user_id: req.user.id },
      include: [
        { model: Course, as: 'course', include: [{ model: ModuleModel, as: 'modules', attributes: ['id', 'name', 'submodule_id'] }] }
      ],
      order: [['createdAt', 'DESC']]
    });

    const enriched = [];
    for (const e of enrollments) {
      if (e.status === 'frozen' && e.freeze_end_date && new Date(e.freeze_end_date) < new Date()) {
        const diffDays = 180; // Max freeze duration (6 months)
        if (e.end_date) {
          e.end_date = new Date(e.end_date.getTime() + diffDays * 24 * 60 * 60 * 1000);
        }
        e.status = 'active';
        e.freeze_count += 1;
        e.frozen_at = null;
        e.freeze_end_date = null;
        await e.save();
      }

      if (e.status === 'active' && e.end_date && new Date(e.end_date) < new Date()) {
        e.status = 'suspended';
        await e.save();
      }
      const up = await UserProgress.findOne({ where: { user_id: req.user.id, course_id: e.course_id } });
      enriched.push({ ...e.toJSON(), progress: up?.overall_progress || 0, status: e.status });
    }
    return res.json({ enrollments: enriched });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ', error: error.message });
  }
};

exports.freezeCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const enrollment = await Enrollment.findOne({ where: { user_id: req.user.id, course_id: courseId } });
    if (!enrollment) return res.status(404).json({ message: 'الاشتراك غير موجود' });
    if (enrollment.status === 'frozen') return res.status(400).json({ message: 'الكورس مجمد بالفعل' });
    if (enrollment.status !== 'active') return res.status(400).json({ message: 'لا يمكن تجميد هذا الكورس' });
    if (enrollment.freeze_count >= 2) return res.status(400).json({ message: 'لقد استنفدت الحد الأقصى لمرات التجميد (مرتين)' });

    enrollment.status = 'frozen';
    enrollment.frozen_at = new Date();
    // Maximum freeze is 6 months (180 days). We'll set the end date of the freeze
    enrollment.freeze_end_date = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000);

    await enrollment.save();
    return res.json({ message: 'تم تجميد الكورس بنجاح', enrollment });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ', error: error.message });
  }
};

exports.unfreezeCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const enrollment = await Enrollment.findOne({ where: { user_id: req.user.id, course_id: courseId } });
    if (!enrollment) return res.status(404).json({ message: 'الاشتراك غير موجود' });
    if (enrollment.status !== 'frozen') return res.status(400).json({ message: 'الكورس ليس مجمداً' });

    // Calculate how many days they were frozen
    const now = new Date();
    const frozenAt = new Date(enrollment.frozen_at);
    let diffDays = Math.ceil((now - frozenAt) / (1000 * 60 * 60 * 24));
    if (diffDays > 30) diffDays = 30;

    // Extend the enrollment end date by the diffDays
    if (enrollment.end_date) {
      enrollment.end_date = new Date(enrollment.end_date.getTime() + diffDays * 24 * 60 * 60 * 1000);
    }

    enrollment.status = 'active';
    enrollment.freeze_count += 1;
    enrollment.frozen_at = null;
    enrollment.freeze_end_date = null;

    await enrollment.save();
    return res.json({ message: 'تم إلغاء التجميد بنجاح', enrollment });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ', error: error.message });
  }
};

exports.getMySchedules = async (req, res) => {
  try {
    const schedules = await StudySchedule.findAll({
      where: { user_id: req.user.id },
      include: [{ model: Course, as: 'course', attributes: ['id', 'title'] }],
      order: [['start_date', 'ASC']]
    });
    return res.json({ schedules });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ', error: error.message });
  }
};

exports.createSchedule = async (req, res) => {
  try {
    const { course_id, start_date, end_date, daily_hours, days_off, module_ids } = req.body;

    // 1. Fetch Course Modules and Lessons
    const moduleWhere = { course_id, is_active: true };
    if (module_ids && Array.isArray(module_ids) && module_ids.length > 0) {
      moduleWhere.id = module_ids;
    }

    const modules = await ModuleModel.findAll({
      where: moduleWhere,
      include: [{ model: Lesson, as: 'lessons', where: { is_active: true }, required: false }],
      order: [['order', 'ASC'], [{ model: Lesson, as: 'lessons' }, 'order', 'ASC']]
    });

    let allLessons = [];
    modules.forEach(mod => {
      if (mod.lessons && mod.lessons.length > 0) {
        mod.lessons.forEach(lsn => {
          allLessons.push({
            moduleId: mod.id,
            moduleName: mod.name,
            lessonId: lsn.id,
            lessonTitle: lsn.title,
            duration: lsn.duration_seconds || 0
          });
        });
      }
    });

    let plan = [];

    if (allLessons.length > 0 && start_date && end_date) {
      // 2. Generate valid study dates
      let current = new Date(start_date);
      const end = new Date(end_date);
      const validDays = [];
      const daysOfWeekMap = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

      const safeDaysOff = Array.isArray(days_off) ? days_off : [];

      while (current <= end) {
        const dayName = daysOfWeekMap[current.getDay()];
        if (!safeDaysOff.includes(dayName)) {
          validDays.push(new Date(current));
        }
        current.setDate(current.getDate() + 1);
      }

      // 3. Distribute lessons (chunking by count)
      if (validDays.length > 0) {
        const lessonsPerDay = Math.ceil(allLessons.length / validDays.length);
        let lessonIndex = 0;

        for (let i = 0; i < validDays.length; i++) {
          const dayDate = validDays[i];
          const dayLessons = [];

          for (let j = 0; j < lessonsPerDay; j++) {
            if (lessonIndex < allLessons.length) {
              dayLessons.push(allLessons[lessonIndex]);
              lessonIndex++;
            }
          }

          if (dayLessons.length > 0) {
            plan.push({
              date: dayDate.toISOString().split('T')[0],
              dayName: daysOfWeekMap[dayDate.getDay()],
              lessons: dayLessons
            });
          }
        }
      }
    }

    // 4. Save to Database
    const schedule = await StudySchedule.create({
      user_id: req.user.id,
      course_id,
      start_date,
      end_date,
      daily_hours,
      days_off,
      plan: plan
    });
    return res.status(201).json({ message: 'تم إنشاء خطة المذاكرة بنجاح', schedule });
  } catch (error) {
    console.error('Schedule Error:', error);
    return res.status(500).json({ message: 'خطأ', error: error.message });
  }
};

exports.updateSchedule = async (req, res) => {
  try {
    const schedule = await StudySchedule.findOne({ where: { id: req.params.id, user_id: req.user.id } });
    if (!schedule) return res.status(404).json({ message: 'Schedule not found' });

    if (req.body.plan) {
      schedule.plan = req.body.plan;
    }
    await schedule.save();
    return res.json({ message: 'تم تحديث الموعد', schedule });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ', error: error.message });
  }
};

exports.deleteSchedule = async (req, res) => {
  try {
    await StudySchedule.destroy({ where: { id: req.params.id, user_id: req.user.id } });
    return res.json({ message: 'تم حذف الموعد' });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ', error: error.message });
  }
};

// ═══════════════════════════════════════════
//  4. ASSESSMENTS
// ═══════════════════════════════════════════
exports.getMyAssessments = async (req, res) => {
  try {
    // Get all enrolled courses
    const enrollments = await Enrollment.findAll({ where: { user_id: req.user.id }, attributes: ['course_id'] });
    const courseIds = enrollments.map(e => e.course_id);

    if (!courseIds.length) return res.json({ assessments: [] });

    const assessments = await Assessment.findAll({
      where: { course_id: { [Op.in]: courseIds }, status: 'published' },
      include: [{ model: Course, attributes: ['id', 'title'] }],
      order: [['createdAt', 'DESC']]
    });
    return res.json({ assessments });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ', error: error.message });
  }
};

exports.getAssessmentById = async (req, res) => {
  try {
    const assessment = await Assessment.findByPk(req.params.id);
    if (!assessment) return res.status(404).json({ message: 'الاختبار غير موجود' });

    // Get questions for this assessment
    const excludeFields = assessment.type === 'flashcard' ? [] : ['correct_answer', 'explanation'];

    const questions = await QuestionBank.findAll({
      where: { assessment_id: assessment.id },
      attributes: { exclude: excludeFields }
    });

    return res.json({ assessment, questions });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ', error: error.message });
  }
};

exports.submitAssessment = async (req, res) => {
  try {
    const { assessment_id, answers } = req.body;
    const assessment = await Assessment.findByPk(assessment_id);
    if (!assessment) return res.status(404).json({ message: 'الاختبار غير موجود' });

    const questions = await QuestionBank.findAll({ where: { assessment_id } });

    let score = 0;
    let totalMarks = 0;

    // Calculate score
    for (const q of questions) {
      if (q.question_type !== 'essay' && q.question_type !== 'short_answer') {
        totalMarks += parseFloat(q.marks) || 1;
      }

      const studentAnswer = answers.find(a => a.question_id === q.id);
      if (studentAnswer && studentAnswer.selected_option === q.correct_answer) {
        score += parseFloat(q.marks) || 1;
      }
    }

    // For assignments/essays, totalMarks might be 0 here if only essays exist.
    // If it's an assignment, we should probably set passed to null/undefined or handle it.
    if (totalMarks === 0 && assessment.type === 'assignment') {
      totalMarks = parseFloat(assessment.total_marks) || 100;
      score = 0; // pending grading
    }

    const percentage = totalMarks > 0 ? Math.round((score / totalMarks) * 100) : 0;
    const passingPercentage = assessment.passing_marks || 50;
    const passed = percentage >= passingPercentage;

    // Save the attempt in the database
    const attempt = await AssessmentAttempt.create({
      user_id: req.user.id,
      assessment_id: assessment.id,
      status: 'submitted',
      submitted_at: new Date(),
      total_marks: totalMarks,
      score_obtained: score,
      percentage: percentage,
      passed: passed
    });

    // Save the answers
    const answersToSave = answers.map(a => {
      const q = questions.find(question => question.id === a.question_id);
      const isCorrect = q && q.correct_answer === a.selected_option;
      const marksObtained = isCorrect ? (parseFloat(q?.marks) || 1) : 0;

      return {
        attempt_id: attempt.id,
        question_id: a.question_id,
        answer_text: a.selected_option,
        is_correct: isCorrect,
        marks_obtained: marksObtained
      };
    });

    if (answersToSave.length > 0) {
      await AssessmentAnswer.bulkCreate(answersToSave);
    }

    return res.json({
      passed,
      score,
      totalMarks,
      percentage
    });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ في تقديم الاختبار', error: error.message });
  }
};

exports.getMyAssessmentResults = async (req, res) => {
  try {
    const selfAttempts = await SelfAssessmentAttempt.findAll({
      where: { user_id: req.user.id },
      include: [
        { model: SelfAssessmentProduct, as: 'product', attributes: ['title'] },
        { model: SelfAssessmentAnswer, as: 'answers', include: [{ model: QuestionBank, as: 'question' }] }
      ],
      order: [['createdAt', 'DESC']]
    });

    const standardAttempts = await AssessmentAttempt.findAll({
      where: { user_id: req.user.id },
      include: [
        { model: Assessment, as: 'assessment', attributes: ['title', 'type'] },
        { model: AssessmentAnswer, as: 'answers', include: [{ model: QuestionBank, as: 'question' }] }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Format and merge the two arrays so the frontend can display them easily
    const formattedSelfAttempts = selfAttempts.map(a => ({
      id: `self_${a.id}`,
      type: 'self_assessment',
      title: a.product?.title || 'تقييم ذاتي',
      score: a.score_obtained,
      totalMarks: a.total_marks,
      percentage: a.percentage,
      passed: a.percentage >= 50, // Default 50% for self assessments
      createdAt: a.createdAt,
      answers: a.answers
    }));

    const formattedStandardAttempts = standardAttempts.map(a => ({
      id: `std_${a.id}`,
      type: a.assessment?.type || 'quiz',
      title: a.assessment?.title || 'اختبار',
      score: a.score_obtained,
      totalMarks: a.total_marks,
      percentage: a.percentage,
      passed: a.passed,
      createdAt: a.createdAt,
      answers: a.answers
    }));

    const mergedAttempts = [...formattedSelfAttempts, ...formattedStandardAttempts].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    return res.json({ attempts: mergedAttempts });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ', error: error.message });
  }
};

exports.getSelfAssessments = async (req, res) => {
  try {
    const enrollments = await Enrollment.findAll({ where: { user_id: req.user.id }, attributes: ['course_id'] });
    const courseIds = enrollments.map(e => e.course_id);

    if (!courseIds.length) return res.json({ selfAssessments: [] });

    const selfAssessments = await SelfAssessmentProduct.findAll({
      where: { course_id: { [Op.in]: courseIds }, status: 'published' }
    });
    return res.json({ selfAssessments });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ', error: error.message });
  }
};

exports.getQuestionBanks = async (req, res) => {
  try {
    const enrollments = await Enrollment.findAll({ where: { user_id: req.user.id }, attributes: ['course_id'] });
    const courseIds = enrollments.map(e => e.course_id);

    if (!courseIds.length) return res.json({ questionBanks: [] });

    const questionBanks = await QuestionBankProduct.findAll({
      where: { course_id: { [Op.in]: courseIds }, status: 'published' }
    });
    return res.json({ questionBanks });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ', error: error.message });
  }
};

exports.getSelfAssessmentById = async (req, res) => {
  try {
    const product = await SelfAssessmentProduct.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: 'التقييم غير موجود' });
    const questions = await QuestionBank.findAll({
      where: { self_assessment_product_id: product.id },
      attributes: { exclude: ['correct_answer', 'explanation'] } // Don't send correct answers to frontend before submission!
    });
    return res.json({ product, questions });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ', error: error.message });
  }
};

exports.submitSelfAssessment = async (req, res) => {
  try {
    const { id } = req.params;
    const { answers } = req.body; // format: [{ question_id: 1, selected_option: 'A' }]

    const product = await SelfAssessmentProduct.findByPk(id);
    if (!product) return res.status(404).json({ message: 'التقييم غير موجود' });

    let score = 0;
    let totalMarks = 0;

    const attempt = await SelfAssessmentAttempt.create({
      user_id: req.user.id,
      product_id: id,
      status: 'submitted',
      submitted_at: new Date()
    });

    for (const ans of answers) {
      const q = await QuestionBank.findByPk(ans.question_id);
      if (q) {
        totalMarks += parseFloat(q.marks || 1);
        const isCorrect = q.correct_answer === ans.selected_option;
        const earned = isCorrect ? parseFloat(q.marks || 1) : 0;
        score += earned;

        await SelfAssessmentAnswer.create({
          attempt_id: attempt.id,
          question_id: q.id,
          answer_text: ans.selected_option,
          is_correct: isCorrect,
          marks_obtained: earned
        });
      }
    }

    const percentage = totalMarks > 0 ? (score / totalMarks) * 100 : 0;
    attempt.total_marks = totalMarks;
    attempt.score_obtained = score;
    attempt.percentage = percentage;
    await attempt.save();

    return res.json({
      message: 'تم استلام الإجابات',
      score,
      totalMarks,
      percentage: percentage.toFixed(2),
      passed: percentage >= 50
    });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ في التقديم', error: error.message });
  }
};

exports.getQuestionBankById = async (req, res) => {
  try {
    const product = await QuestionBankProduct.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: 'بنك الأسئلة غير موجود' });
    const questions = await QuestionBank.findAll({
      where: { question_bank_product_id: product.id }
      // For question bank practice, we might want to include correct answers so they can check themselves immediately
    });
    return res.json({ product, questions });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ', error: error.message });
  }
};

// ═══════════════════════════════════════════
//  5. ORDERS & PURCHASES
// ═══════════════════════════════════════════
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { user_id: req.user.id },
      include: [{ model: OrderItem, as: 'items', include: [{ model: Course, as: 'course' }] }],
      order: [['createdAt', 'DESC']]
    });
    return res.json({ orders });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ', error: error.message });
  }
};

// ═══════════════════════════════════════════
//  6. REVIEWS & COMMENTS
// ═══════════════════════════════════════════
// This covers role 6 (Social & Feedback)
// We assume they add reviews in the CourseDetail page or Dashboard
exports.addCourseReview = async (req, res) => {
  try {
    const { course_id, rating, review_text } = req.body;
    // ensure enrolled
    const enrolled = await Enrollment.findOne({ where: { user_id: req.user.id, course_id } });
    if (!enrolled) return res.status(403).json({ message: 'يجب أن تكون مشتركاً في الكورس لتقييمه' });

    let review = await CourseReview.findOne({ where: { user_id: req.user.id, course_id } });
    if (review) {
      review.rating = rating; review.review_text = review_text;
      await review.save();
    } else {
      review = await CourseReview.create({ user_id: req.user.id, course_id, rating, review_text });
    }
    return res.json({ message: 'تم حفظ التقييم بنجاح', review });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ', error: error.message });
  }
};

exports.addLessonReview = async (req, res) => {
  try {
    const { lesson_id, course_id, rating, review_text } = req.body;

    // verify enrollment
    const enrolled = await Enrollment.findOne({ where: { user_id: req.user.id, course_id } });
    if (!enrolled) return res.status(403).json({ message: 'يجب أن تكون مشتركاً في الكورس لتقييمه' });

    let review = await LessonReview.findOne({ where: { user_id: req.user.id, lesson_id } });
    if (review) {
      review.rating = rating;
      review.review_text = review_text;
      await review.save();
    } else {
      review = await LessonReview.create({ user_id: req.user.id, lesson_id, rating, review_text });
    }
    return res.json({ message: 'تم حفظ التقييم بنجاح', review });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ', error: error.message });
  }
};

// ═══════════════════════════════════════════
//  7. SUPPORT
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

exports.getSupportMessages = async (req, res) => {
  try {
    const messages = await ContactMessage.findAll({
      where: { email: req.user.email },
      order: [['createdAt', 'DESC']]
    });
    return res.json({ messages });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ', error: error.message });
  }
};

// ═══════════════════════════════════════════
//  8. PLAYER
// ═══════════════════════════════════════════
exports.getCoursePlayer = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    // التحقق من الالتحاق بالدورة
    const enrollment = await Enrollment.findOne({
      where: { user_id: userId, course_id: courseId, status: ['active', 'completed', 'frozen'] }
    });

    if (!enrollment) {
      return res.status(403).json({ message: 'غير مصرح لك بالوصول إلى هذه الدورة' });
    }

    if (enrollment.status === 'frozen') {
      if (enrollment.freeze_end_date && new Date(enrollment.freeze_end_date) < new Date()) {
        const diffDays = 180; // Max freeze duration (6 months)
        if (enrollment.end_date) {
          enrollment.end_date = new Date(enrollment.end_date.getTime() + diffDays * 24 * 60 * 60 * 1000);
        }
        enrollment.status = 'active';
        enrollment.freeze_count += 1;
        enrollment.frozen_at = null;
        enrollment.freeze_end_date = null;
        await enrollment.save();
      } else {
        return res.status(403).json({ message: 'الكورس مجمد حالياً، الرجاء إلغاء التجميد أولاً.' });
      }
    }

    // التحقق من انتهاء فترة الاشتراك
    if (enrollment.end_date && new Date(enrollment.end_date) < new Date()) {
      enrollment.status = 'suspended'; // تعليق الاشتراك بسبب الانتهاء
      await enrollment.save();
      return res.status(403).json({ message: 'لقد انتهت فترة اشتراكك في هذه الدورة' });
    }

    // جلب الكورس مع الموديولات والدروس مرتبة
    const course = await Course.findByPk(courseId, {
      include: [
        {
          model: ModuleModel,
          as: 'modules',
          where: { is_active: true },
          required: false,
          include: [
            {
              model: Lesson,
              as: 'lessons',
              where: { is_active: true },
              required: false,
              order: [['order', 'ASC']]
            }
          ],
          order: [['order', 'ASC']]
        }
      ]
    });

    if (!course) {
      return res.status(404).json({ message: 'الدورة غير موجودة' });
    }

    // جمع كل lesson IDs الخاصة بهذا الكورس
    const courseLessonIds = [];
    (course.modules || []).forEach(mod => {
      (mod.lessons || []).forEach(lesson => courseLessonIds.push(lesson.id));
    });

    // جلب تقدم المستخدم مفلتر بدروس هذا الكورس فقط
    const userProgress = await UserProgress.findOne({ where: { user_id: userId, course_id: courseId } });

    const moduleProgress = await ModuleProgress.findAll({
      where: {
        user_id: userId,
        module_id: (course.modules || []).map(m => m.id)
      }
    });

    const lessonProgress = courseLessonIds.length > 0
      ? await LessonProgress.findAll({
        where: { user_id: userId, lesson_id: courseLessonIds },
        order: [['updatedAt', 'DESC']]
      })
      : [];

    // تحديث آخر وصول للكورس
    await enrollment.update({ last_accessed: new Date() });

    // جلب التقييمات الخاصة بالطالب
    const myCourseReview = await CourseReview.findOne({ where: { user_id: userId, course_id: courseId } });
    const myLessonReviewsList = courseLessonIds.length > 0
      ? await LessonReview.findAll({ where: { user_id: userId, lesson_id: courseLessonIds } })
      : [];

    return res.json({
      course,
      enrollment,
      progress: userProgress,
      moduleProgress,
      lessonProgress,
      totalLessons: courseLessonIds.length,
      myCourseReview,
      myLessonReviews: myLessonReviewsList
    });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ في جلب بيانات المشغل', error: error.message });
  }
};

exports.saveLessonProgress = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { progress_seconds, is_completed } = req.body;
    const userId = req.user.id;

    const [lp, created] = await LessonProgress.findOrCreate({
      where: { user_id: userId, lesson_id: lessonId },
      defaults: {
        progress_seconds: progress_seconds || 0,
        is_completed: is_completed || false
      }
    });

    if (!created) {
      // فقط تحديث الثواني إذا كانت أكبر من المحفوظة (للأمام فقط)
      if (progress_seconds !== undefined && progress_seconds > (lp.progress_seconds || 0)) {
        lp.progress_seconds = progress_seconds;
      }
      if (is_completed !== undefined) lp.is_completed = is_completed;
      await lp.save();
    }

    return res.json({ message: 'تم حفظ التقدم بنجاح', progress: lp });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ في حفظ التقدم', error: error.message });
  }
};

// ═══════════════════════════════════════════
//  9. FLASHCARDS
// ═══════════════════════════════════════════
exports.getMyFlashcards = async (req, res) => {
  try {
    // 1. Direct flashcard accesses
    const accesses = await FlashcardAccess.findAll({
      where: { user_id: req.user.id },
      include: [{
        model: FlashcardProduct,
        as: 'product',
        where: { is_active: true }
      }],
      order: [['createdAt', 'DESC']]
    });
    const directProducts = accesses.map(a => a.product);

    // 2. Course-based flashcard accesses
    const enrollments = await Enrollment.findAll({
      where: {
        user_id: req.user.id,
        status: 'active',
        has_flashcards: true
      },
      attributes: ['course_id']
    });
    const courseIds = enrollments.map(e => e.course_id);

    let courseProducts = [];
    if (courseIds.length > 0) {
      courseProducts = await FlashcardProduct.findAll({
        where: {
          course_id: courseIds,
          is_active: true
        }
      });
    }

    // 3. Combine and deduplicate by product id
    const allProducts = [...directProducts, ...courseProducts];
    const uniqueProductsMap = new Map();
    allProducts.forEach(p => {
      uniqueProductsMap.set(p.id, p);
    });

    const finalFlashcards = Array.from(uniqueProductsMap.values());

    return res.json({ flashcards: finalFlashcards });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ في جلب الفلاش كارد', error: error.message });
  }
};

exports.getFlashcardProductDecks = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const decks = await FlashcardDeck.findAll({
      where: { module_id: moduleId },
      order: [['order', 'ASC'], ['id', 'ASC']]
    });

    return res.json({ decks });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ في جلب الفصول', error: error.message });
  }
};

exports.getFlashcardDeckItems = async (req, res) => {
  try {
    const { deckId } = req.params;
    const deck = await FlashcardDeck.findByPk(deckId);

    if (!deck) {
      return res.status(404).json({ message: 'غير موجود' });
    }

    const items = await FlashcardItem.findAll({
      where: { deck_id: deckId },
      order: [['order', 'ASC']]
    });

    return res.json({ items });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ', error: error.message });
  }
};

// ═══════════════════════════════════════════
//  MODULE DETAILS
// ═══════════════════════════════════════════
exports.getModuleQuestions = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const { type, chapterId } = req.query; // 'sa' for self-assessment, 'qbank' for question bank
    
    const { QuestionBank, QuestionBankChapter } = require('../models');
    
    const where = { 
      module_id: moduleId, 
      is_self_assessment: type === 'sa' 
    };

    if (chapterId) {
      where.chapter_id = chapterId;
    }

    const questions = await QuestionBank.findAll({
      where,
      order: [['id', 'ASC']]
    });

    const chapters = await QuestionBankChapter.findAll({
      where: { module_id: moduleId },
      include: [
        {
          model: QuestionBank,
          as: 'questions',
          where: { is_self_assessment: type === 'sa' },
          required: false,
          attributes: ['id']
        }
      ],
      order: [['order', 'ASC'], ['id', 'ASC']]
    });

    const formattedChapters = chapters.map(ch => ({
      id: ch.id,
      title: ch.title,
      description: ch.description,
      questionsCount: ch.questions ? ch.questions.length : 0
    }));
    
    return res.json({ questions, chapters: formattedChapters });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ', error: error.message });
  }
};

exports.getModuleDetails = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { courseId, moduleId } = req.params;

    // Check enrollment
    const enrollment = await Enrollment.findOne({
      where: { user_id: studentId, course_id: courseId, status: 'active' }
    });
    if (!enrollment) {
      return res.status(403).json({ message: 'غير مصرح أو غير مشترك بالكورس' });
    }

    const course = await Course.findOne({
      where: { id: courseId },
      include: [
        {
          model: User,
          as: 'instructors',
          attributes: ['id', 'name', 'image_profile'],
          through: { attributes: [] }
        }
      ]
    });

    const moduleData = await ModuleModel.findOne({
      where: { id: moduleId, course_id: courseId },
      include: [
        {
          model: ModuleModel,
          as: 'submodules',
          include: [
            {
              model: Lesson,
              as: 'lessons',
              attributes: ['id', 'title', 'duration_seconds', 'lesson_type', 'is_free']
            }
          ]
        },
        {
          model: Lesson,
          as: 'lessons',
          attributes: ['id', 'title', 'duration_seconds', 'lesson_type', 'is_free']
        }
      ]
    });

    if (!moduleData) {
      return res.status(404).json({ message: 'الموديول غير موجود' });
    }

    // Get completed lessons for this user
    const completedLessonsData = await LessonProgress.findAll({
      where: { user_id: studentId, is_completed: true },
      attributes: ['lesson_id']
    });
    const completedLessons = completedLessonsData.map(lp => lp.lesson_id);

    return res.json({
      course: {
        id: course.id,
        title: course.title,
        instructors: course.instructors
      },
      module: moduleData,
      completedLessons
    });

  } catch (error) {
    console.error('Error fetching module details:', error);
    return res.status(500).json({ message: 'حدث خطأ في الخادم' });
  }
};

exports.getSettings = async (req, res) => {
  try {
    const { SystemSetting } = require('../models');
    const settings = await SystemSetting.findAll();
    res.json({ settings });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching settings', error: error.message });
  }
};

exports.getCourseQuestions = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { type } = req.query;

    const { QuestionBank, SelfAssessmentProduct } = require('../models');

    if (type === 'sa') {
      const { ModuleModel } = require('../models');
      
      // 1. Fetch all modules for this course
      const modules = await ModuleModel.findAll({
        where: { course_id: courseId },
        attributes: ['id']
      });

      const moduleIds = modules.map(m => m.id);

      if (moduleIds.length === 0) {
        return res.json({ questions: [] });
      }

      // 2. Fetch all questions for these modules where is_self_assessment is true
      const questions = await QuestionBank.findAll({
        where: { 
          module_id: moduleIds,
          is_self_assessment: true
        }
      });

      return res.json({ questions });
    }

    return res.json({ questions: [] });
  } catch (error) {
    console.error('Error fetching course questions:', error);
    res.status(500).json({ message: 'خطأ في جلب الأسئلة' });
  }
};

exports.generateCourseReport = async (req, res) => {
  try {
    const { answers, timeUsedSeconds } = req.body;
    const { QuestionBank, ModuleModel, Course } = require('../models');
    const course = await Course.findByPk(courseId, { attributes: ['id', 'title'] });
    const courseTitle = course?.title || 'Comprehensive Course Self-Assessment';

    // 1. Fetch all modules for this course
    const modules = await ModuleModel.findAll({
      where: { course_id: courseId },
      attributes: ['id', 'name']
    });

    const moduleIds = modules.map(m => m.id);
    const moduleMap = {};
    modules.forEach(m => {
      moduleMap[m.id] = m.name || `Module ${m.id}`;
    });

    // 2. Fetch questions for these modules
    const questions = await QuestionBank.findAll({
      where: { 
        module_id: moduleIds,
        is_self_assessment: true 
      }
    });
    
    let correctCount = 0;
    let wrongCount = 0;
    let omittedCount = 0;
    const totalCount = questions.length;

    const chapters = {};
    const topics = {};
    const healthGroups = {};
    const knowledgeDomains = {};
    const clinicianTasks = {};
    const difficultyLevels = {};

    questions.forEach(q => {
      const qId = q.id.toString();
      const studentAnswer = answers[qId];
      
      let isCorrect = studentAnswer !== undefined && studentAnswer === q.correct_answer;
      if (!isCorrect && studentAnswer !== undefined && q.options) {
        let opts = q.options;
        if (typeof opts === 'string') {
          try { opts = JSON.parse(opts); } catch (e) {}
        }
        if (Array.isArray(opts)) {
          const matched = opts.find(o => typeof o === 'object' && o !== null && (o.text === studentAnswer || o.id === studentAnswer));
          if (matched && matched.isCorrect) {
            isCorrect = true;
          }
        }
      }
      
      if (studentAnswer === undefined || studentAnswer === '') omittedCount++;
      else if (isCorrect) correctCount++;
      else wrongCount++;

      // Chapter / Module stat
      const chapterName = q.chapter || (q.module_id && moduleMap[q.module_id]) || 'General';
      if (!chapters[chapterName]) chapters[chapterName] = { total: 0, correct: 0 };
      chapters[chapterName].total++;
      if (isCorrect) chapters[chapterName].correct++;

      // Topic stat
      if (q.topic && q.topic.trim()) {
        const topicName = q.topic.trim();
        if (!topics[topicName]) topics[topicName] = { total: 0, correct: 0 };
        topics[topicName].total++;
        if (isCorrect) topics[topicName].correct++;
      }
      
      // Health Group stat
      if (q.health_group) {
        if (!healthGroups[q.health_group]) healthGroups[q.health_group] = { total: 0, correct: 0 };
        healthGroups[q.health_group].total++;
        if (isCorrect) healthGroups[q.health_group].correct++;
      }
      
      // Knowledge Domain stat
      if (q.knowledge_domain) {
        if (!knowledgeDomains[q.knowledge_domain]) knowledgeDomains[q.knowledge_domain] = { total: 0, correct: 0 };
        knowledgeDomains[q.knowledge_domain].total++;
        if (isCorrect) knowledgeDomains[q.knowledge_domain].correct++;
      }
      
      // Clinician Task stat
      if (q.clinician_task) {
        if (!clinicianTasks[q.clinician_task]) clinicianTasks[q.clinician_task] = { total: 0, correct: 0 };
        clinicianTasks[q.clinician_task].total++;
        if (isCorrect) clinicianTasks[q.clinician_task].correct++;
      }

      // Difficulty Level stat
      if (q.difficulty_level) {
        const dl = q.difficulty_level.charAt(0).toUpperCase() + q.difficulty_level.slice(1);
        if (!difficultyLevels[dl]) difficultyLevels[dl] = { total: 0, correct: 0 };
        difficultyLevels[dl].total++;
        if (isCorrect) difficultyLevels[dl].correct++;
      }
    });

    const scorePercentage = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;
    const passed = scorePercentage >= 50;

    const formatStatArray = (obj) => {
      return Object.entries(obj).map(([name, stat]) => ({
        name,
        total: stat.total,
        correct: stat.correct,
        percent: stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0
      })).sort((a, b) => b.percent - a.percent);
    };

    const chapterStats = formatStatArray(chapters);
    const topicStats = formatStatArray(topics);
    const healthGroupStats = formatStatArray(healthGroups);
    const knowledgeDomainStats = formatStatArray(knowledgeDomains);
    const clinicianTaskStats = formatStatArray(clinicianTasks);
    const difficultyStats = formatStatArray(difficultyLevels);

    // Prioritize weakest topics for studyPlan, fallback to weakest chapters
    const studyPlanCandidates = topicStats.length > 0 ? topicStats : chapterStats;
    const studyPlan = [...studyPlanCandidates]
      .sort((a, b) => a.percent - b.percent)
      .slice(0, 5)
      .map(t => ({
        name: t.name,
        score: `${t.correct}/${t.total}`,
        percent: `${t.percent}%`
      }));

    const insights = [
      `You completed the exam in ${Math.max(1, Math.floor(timeUsedSeconds / 60))} minutes.`,
      `Your strongest area is ${chapterStats.length > 0 ? chapterStats[0].name : 'N/A'}.`,
      studyPlan.length > 0 ? `Focus on revising: ${studyPlan.slice(0, 3).map(s => s.name).join(', ')}.` : 'Continue your regular review routine.'
    ];

    if (knowledgeDomainStats.length > 0) {
      const weakestDomain = knowledgeDomainStats[knowledgeDomainStats.length - 1];
      if (weakestDomain && weakestDomain.percent < 70) {
        insights.push(`Your performance indicates you should allocate more study time to ${weakestDomain.name} (${weakestDomain.percent}%).`);
      }
    }

    return res.json({
      report: {
        courseTitle,
        overall: {
          scorePercentage,
          passed,
          correctCount,
          wrongCount,
          omittedCount,
          totalCount,
          timeUsedSeconds
        },
        insights,
        chapters: chapterStats,
        topics: topicStats,
        healthGroups: healthGroupStats,
        knowledgeDomains: knowledgeDomainStats,
        clinicianTasks: clinicianTaskStats,
        difficultyLevels: difficultyStats,
        studyPlan
      }
    });
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ message: 'Error generating report' });
  }
};
