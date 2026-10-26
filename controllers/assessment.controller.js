const { Assessment, QuestionBank, SelfAssessmentProduct, SelfAssessmentAttempt, SelfAssessmentAnswer } = require('../models');

exports.getAssessmentsByCourse = async (req, res) => {
  try {
    const { course_id } = req.params;
    const assessments = await Assessment.findAll({
      where: { course_id, status: 'published' },
      include: [{ model: QuestionBank, as: 'questions' }]
    });
    return res.json({ assessments });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ في جلب الاختبارات', error: error.message });
  }
};

exports.submitAssessment = async (req, res) => {
  try {
    const { assessment_id, answers } = req.body; // answers = [{ question_id, selected_option }]
    const assessment = await Assessment.findByPk(assessment_id, {
      include: [{ model: QuestionBank, as: 'questions' }]
    });

    if (!assessment) return res.status(404).json({ message: 'الاختبار غير موجود' });

    let score = 0;
    let totalMarks = 0;

    assessment.questions.forEach(q => {
      const qMarks = parseFloat(q.marks) || 1;
      totalMarks += qMarks;
      const userAns = answers ? answers.find(a => a.question_id === q.id) : null;
      if (userAns && userAns.selected_option && userAns.selected_option.trim().toLowerCase() === q.correct_answer.trim().toLowerCase()) {
        score += qMarks;
      }
    });

    const percentage = totalMarks > 0 ? ((score / totalMarks) * 100).toFixed(2) : 0;
    const passed = percentage >= (assessment.passing_marks || 50);

    return res.json({
      message: 'تم إنهاء الاختبار وحساب النتيجة بنجاح',
      score,
      totalMarks,
      percentage: parseFloat(percentage),
      passed
    });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ في تقديم الاختبار', error: error.message });
  }
};
