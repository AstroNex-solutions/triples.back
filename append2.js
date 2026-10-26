const fs = require('fs');

const ctrlCode = `
// ═══════════════════════════════════════════
//  COURSE PLAYER (STUDENT ONLY)
// ═══════════════════════════════════════════
exports.getCoursePlayer = async (req, res) => {
  try {
    const { courseId } = req.params;
    
    // Verify enrollment
    const enrollment = await Enrollment.findOne({
      where: { user_id: req.user.id, course_id: courseId, status: ['active', 'completed'] }
    });
    if (!enrollment) return res.status(403).json({ message: 'غير مصرح لك بالوصول إلى هذه الدورة' });

    const course = await Course.findByPk(courseId, {
      include: [
        {
          model: ModuleModel,
          as: 'modules',
          include: [{ model: Lesson, as: 'lessons', where: { is_active: true }, required: false }]
        }
      ]
    });

    if (!course) return res.status(404).json({ message: 'الدورة غير موجودة' });

    const userProgress = await UserProgress.findOne({ where: { user_id: req.user.id, course_id: courseId } });
    const moduleProgress = await ModuleProgress.findAll({ where: { user_id: req.user.id } }); 

    return res.json({
      course,
      enrollment,
      progress: userProgress,
      moduleProgress
    });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ في جلب بيانات المشغل', error: error.message });
  }
};
`;
fs.appendFileSync('./controllers/student.controller.js', ctrlCode);

let routes = fs.readFileSync('./routes/student.routes.js', 'utf8');
routes = routes.replace('module.exports = router;', 'router.get(\'/courses/:courseId/play\', authMiddleware, studentController.getCoursePlayer);\nmodule.exports = router;');
fs.writeFileSync('./routes/student.routes.js', routes);

console.log('Player endpoints added.');
