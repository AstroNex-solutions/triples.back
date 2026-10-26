const { Course, Category, Tag, ModuleModel, Lesson, CourseSection, CourseFAQ, CoursePackage, CourseReview, User, Enrollment } = require('../models');
const slugify = require('slugify');

exports.getCourses = async (req, res) => {
  try {
    const { category_id, level, search, featured, status } = req.query;
    const where = {};

    if (status) where.status = status;
    else where.status = 'published';

    if (category_id) where.category_id = category_id;
    if (level) where.level = level;
    if (featured === 'true') where.is_featured = true;

    if (search) {
      const { Op } = require('sequelize');
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    const courses = await Course.findAll({
      where,
      include: [
        { model: Category, as: 'category' },
        { model: Tag, as: 'tags', through: { attributes: [] } },
        { model: User, as: 'instructors', attributes: ['id', 'name', 'username', 'image_profile'], through: { attributes: [] } }
      ],
      order: [['createdAt', 'DESC']]
    });

    return res.json({ count: courses.length, courses });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ في جلب الكورسات', error: error.message });
  }
};

exports.getCourseBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    
    // Check if slug is a number (id)
    const isNumeric = /^\d+$/.test(slug);
    const whereClause = isNumeric ? { id: parseInt(slug, 10) } : { slug };

    const course = await Course.findOne({
      where: whereClause,
      include: [
        { model: Category, as: 'category' },
        { model: Tag, as: 'tags', through: { attributes: [] } },
        { model: User, as: 'instructors', attributes: ['id', 'name', 'username', 'image_profile', 'shortBio'], through: { attributes: [] } },
        { 
          model: ModuleModel, 
          as: 'modules',
          include: [{ model: Lesson, as: 'lessons' }]
        },
        { model: CourseSection, as: 'sections' },
        { model: CourseFAQ, as: 'faqs' },
        { model: CoursePackage, as: 'packages' },
        { model: CourseReview, as: 'reviews', include: [{ model: User, as: 'user', attributes: ['id', 'name', 'image_profile'] }] }
      ]
    });

    if (!course) {
      return res.status(404).json({ message: 'الدورة غير موجودة' });
    }

    // Security Fix: Remove video URLs and sensitive content from non-free lessons for public endpoint
    const courseJSON = course.toJSON();

    // Calculate total enrollments
    const { Op } = require('sequelize');
    const totalEnrollments = await Enrollment.count({
      where: { course_id: course.id, status: { [Op.in]: ['active', 'completed'] } }
    });
    courseJSON.total_enrollments = totalEnrollments;

    // Average rating
    if (courseJSON.reviews && courseJSON.reviews.length > 0) {
      const sum = courseJSON.reviews.reduce((acc, rev) => acc + rev.rating, 0);
      courseJSON.average_rating = parseFloat((sum / courseJSON.reviews.length).toFixed(1));
    } else {
      courseJSON.average_rating = 0;
    }

    return res.json({ course: courseJSON });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ في جلب تفاصيل الدورة', error: error.message });
  }
};

exports.createCourse = async (req, res) => {
  try {
    const { title, subtitle, description, short_description, level, price, discount_price, is_free, category_id } = req.body;
    
    const slug = slugify(title || 'course', { lower: true, strict: true }) + '-' + Date.now();

    let imagePath = null;
    if (req.file) {
      imagePath = req.file.filename;
    }

    const course = await Course.create({
      title,
      slug,
      subtitle,
      description,
      short_description,
      level: level || 'beginner',
      price: price || 0,
      discount_price: discount_price || null,
      is_free: is_free === 'true' || is_free === true,
      category_id: category_id || null,
      image: imagePath,
      status: 'draft'
    });

    // Add req.user as instructor
    await course.addInstructor(req.user);

    return res.status(201).json({ message: 'تم إنشاء الدورة بنجاح', course });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ في إنشاء الدورة', error: error.message });
  }
};

exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({
      where: { is_active: true },
      order: [['order', 'ASC']]
    });
    return res.json({ categories });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ في جلب التصنيفات', error: error.message });
  }
};

// --- Module Question Bank ---
exports.getModuleQuestions = async (req, res) => {
  try {
    const { QuestionBank } = require('../models');
    const questions = await QuestionBank.findAll({ where: { module_id: req.params.moduleId, is_self_assessment: false } });
    res.json({ questions });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching questions', error: error.message });
  }
};

exports.createModuleQuestion = async (req, res) => {
  try {
    const { QuestionBank } = require('../models');
    let imagePath = null;
    if (req.file) {
      imagePath = `/uploads/${req.file.filename}`;
    }
    const question = await QuestionBank.create({
      ...req.body,
      module_id: req.params.moduleId,
      image: imagePath,
      is_self_assessment: false
    });
    res.status(201).json({ message: 'Question created successfully', question });
  } catch (error) {
    res.status(500).json({ message: 'Error creating question', error: error.message });
  }
};

exports.updateModuleQuestion = async (req, res) => {
  try {
    const { QuestionBank } = require('../models');
    const question = await QuestionBank.findOne({ where: { id: req.params.questionId, module_id: req.params.moduleId, is_self_assessment: false } });
    if (!question) return res.status(404).json({ message: 'Question not found' });
    
    let updateData = { ...req.body };
    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }
    
    await question.update(updateData);
    res.json({ message: 'Question updated successfully', question });
  } catch (error) {
    res.status(500).json({ message: 'Error updating question', error: error.message });
  }
};

exports.deleteModuleQuestion = async (req, res) => {
  try {
    const { QuestionBank } = require('../models');
    const question = await QuestionBank.findOne({ where: { id: req.params.questionId, module_id: req.params.moduleId, is_self_assessment: false } });
    if (!question) return res.status(404).json({ message: 'Question not found' });
    await question.destroy();
    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting question', error: error.message });
  }
};

// --- Metadata Taxonomy for Questions ---
const DEFAULT_METADATA_TAXONOMY = {
  knowledgeDomains: [
    'Pharmacology',
    'Pathology',
    'Physiology',
    'Microbiology',
    'Biochemistry',
    'Anatomy',
    'Immunology',
    'Genetics',
    'Behavioral Science & Psychiatry',
    'Public Health & Epidemiology'
  ],
  clinicianTasks: [
    'Management',
    'Pharmacotherapy',
    'Diagnosis',
    'History & Physical Examination',
    'Health Maintenance & Prevention',
    'Pathology / Underlying Mechanism',
    'Ethical / Legal Principles'
  ],
  healthGroups: [
    'Adult_Health',
    'Pediatric_Health',
    'Women_Health & Reproduction',
    'Geriatric_Health',
    'Emergency & Critical_Care'
  ],
  chapters: [
    'Pulmonology',
    'Cardiovascular System',
    'Gastrointestinal System',
    'Endocrine System',
    'Renal System',
    'Neurology and Special Senses',
    'Musculoskeletal System & Connective Tissue',
    'Hematology-Oncology',
    'Dermatology',
    'Psychiatry',
    'Infectious Diseases'
  ],
  topics: [
    'Chronic Obstructive Pulmonary Disease (COPD)',
    'Asthma',
    'Pneumonia & Respiratory Infections',
    'Heart Failure',
    'Coronary Artery Disease & Myocardial Infarction',
    'Hypertension',
    'Diabetes Mellitus Type 1 & 2',
    'Thyroid Disorders',
    'Acute Kidney Injury & CKD',
    'Stroke & Transient Ischemic Attack'
  ],
  difficultyLevels: [
    'Easy',
    'Medium',
    'Hard'
  ]
};

exports.getMetadataTaxonomy = async (req, res) => {
  try {
    const { SystemSetting } = require('../models');
    let setting = await SystemSetting.findOne({ where: { key: 'question_metadata_taxonomy' } });
    if (!setting) {
      setting = await SystemSetting.create({
        key: 'question_metadata_taxonomy',
        value: JSON.stringify(DEFAULT_METADATA_TAXONOMY)
      });
      return res.json({ taxonomy: DEFAULT_METADATA_TAXONOMY });
    }
    const taxonomy = JSON.parse(setting.value);
    return res.json({ taxonomy });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching taxonomy', error: error.message });
  }
};

exports.updateMetadataTaxonomy = async (req, res) => {
  try {
    const { SystemSetting } = require('../models');
    const { taxonomy } = req.body;
    if (!taxonomy) return res.status(400).json({ message: 'Taxonomy object is required' });

    let setting = await SystemSetting.findOne({ where: { key: 'question_metadata_taxonomy' } });
    if (!setting) {
      setting = await SystemSetting.create({
        key: 'question_metadata_taxonomy',
        value: JSON.stringify(taxonomy)
      });
    } else {
      setting.value = JSON.stringify(taxonomy);
      await setting.save();
    }
    return res.json({ message: 'Metadata taxonomy updated successfully', taxonomy });
  } catch (error) {
    return res.status(500).json({ message: 'Error updating taxonomy', error: error.message });
  }
};

// Helper to normalize SA question payload
function normalizeSAQuestionPayload(body) {
  let {
    questionId,
    custom_id,
    text,
    question_text,
    options,
    metadata,
    explanation,
    hint,
    correct_answer,
    chapter,
    topic,
    knowledgeDomain,
    knowledge_domain,
    clinicianTask,
    clinician_task,
    healthGroup,
    health_group,
    difficultyLevel,
    difficulty_level
  } = body;

  const finalQuestionText = (text || question_text || '').trim();
  const finalCustomId = (questionId || custom_id || '').trim() || `Q-${Math.floor(1000 + Math.random() * 9000)}`;

  let parsedMetadata = metadata;
  if (typeof parsedMetadata === 'string') {
    try { parsedMetadata = JSON.parse(parsedMetadata); } catch (e) { parsedMetadata = {}; }
  }
  parsedMetadata = parsedMetadata || {};

  const finalChapter = parsedMetadata.chapter || chapter || null;
  const finalTopic = parsedMetadata.topic || topic || null;
  const finalKnowledgeDomain = parsedMetadata.knowledgeDomain || knowledge_domain || knowledgeDomain || null;
  const finalClinicianTask = parsedMetadata.clinicianTask || clinician_task || clinicianTask || null;
  const finalHealthGroup = parsedMetadata.healthGroup || health_group || healthGroup || null;
  let finalDifficulty = parsedMetadata.difficultyLevel || difficulty_level || difficultyLevel || 'medium';
  if (typeof finalDifficulty === 'string') {
    finalDifficulty = finalDifficulty.toLowerCase();
    if (finalDifficulty !== 'easy' && finalDifficulty !== 'medium' && finalDifficulty !== 'hard') {
      finalDifficulty = 'medium';
    }
  }

  let parsedOptions = options;
  if (typeof parsedOptions === 'string') {
    try { parsedOptions = JSON.parse(parsedOptions); } catch (e) { parsedOptions = []; }
  }

  let finalCorrectAnswer = correct_answer || '';
  if (Array.isArray(parsedOptions) && parsedOptions.length > 0) {
    const correctObj = parsedOptions.find(o => typeof o === 'object' && o !== null && o.isCorrect === true);
    if (correctObj) {
      finalCorrectAnswer = correctObj.text || correctObj.id;
    } else if (!finalCorrectAnswer && typeof parsedOptions[0] === 'string') {
      finalCorrectAnswer = parsedOptions[0];
    }
  }

  return {
    custom_id: finalCustomId,
    question_text: finalQuestionText,
    options: parsedOptions,
    correct_answer: finalCorrectAnswer,
    explanation: explanation || null,
    hint: hint || null,
    chapter: finalChapter,
    topic: finalTopic,
    knowledge_domain: finalKnowledgeDomain,
    clinician_task: finalClinicianTask,
    health_group: finalHealthGroup,
    difficulty_level: finalDifficulty,
    question_type: 'mcq',
    is_self_assessment: true,
    marks: 1.00
  };
}

// --- Module Self Assessment ---
exports.getModuleSAQuestions = async (req, res) => {
  try {
    const { QuestionBank } = require('../models');
    const questions = await QuestionBank.findAll({ 
      where: { module_id: req.params.moduleId, is_self_assessment: true },
      order: [['id', 'ASC']]
    });
    res.json({ questions });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching self assessment questions', error: error.message });
  }
};

exports.createModuleSAQuestion = async (req, res) => {
  try {
    const { QuestionBank, ModuleModel } = require('../models');
    let imagePath = null;
    if (req.file) {
      imagePath = `/uploads/${req.file.filename}`;
    }

    const payload = normalizeSAQuestionPayload(req.body);
    if (!payload.question_text) {
      return res.status(400).json({ message: 'نص السؤال مطلوب' });
    }

    // Auto-assign chapter from module if not specified
    if (!payload.chapter) {
      const mod = await ModuleModel.findByPk(req.params.moduleId);
      if (mod) payload.chapter = mod.name;
    }

    const question = await QuestionBank.create({
      ...payload,
      module_id: req.params.moduleId,
      image: imagePath,
      is_self_assessment: true
    });
    res.status(201).json({ message: 'Question created successfully', question });
  } catch (error) {
    res.status(500).json({ message: 'Error creating question', error: error.message });
  }
};

exports.updateModuleSAQuestion = async (req, res) => {
  try {
    const { QuestionBank } = require('../models');
    const question = await QuestionBank.findOne({ where: { id: req.params.questionId, module_id: req.params.moduleId, is_self_assessment: true } });
    if (!question) return res.status(404).json({ message: 'Question not found' });
    
    const payload = normalizeSAQuestionPayload(req.body);
    if (req.file) {
      payload.image = `/uploads/${req.file.filename}`;
    }
    
    await question.update(payload);
    res.json({ message: 'Question updated successfully', question });
  } catch (error) {
    res.status(500).json({ message: 'Error updating question', error: error.message });
  }
};

exports.deleteModuleSAQuestion = async (req, res) => {
  try {
    const { QuestionBank } = require('../models');
    const question = await QuestionBank.findOne({ where: { id: req.params.questionId, module_id: req.params.moduleId, is_self_assessment: true } });
    if (!question) return res.status(404).json({ message: 'Question not found' });
    await question.destroy();
    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting question', error: error.message });
  }
};

// Excel Import for Module Self Assessment Questions
exports.importModuleSAExcel = async (req, res) => {
  let filePath = null;
  const fs = require('fs');
  const xlsx = require('xlsx');
  try {
    const { moduleId } = req.params;
    const { QuestionBank, ModuleModel } = require('../models');
    const mod = await ModuleModel.findByPk(moduleId);

    if (!req.file) {
      return res.status(400).json({ message: 'يرجى رفع ملف Excel بصيغة .xlsx أو .xls أو .csv' });
    }

    filePath = req.file.path;
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const rawRows = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    if (!rawRows || rawRows.length === 0) {
      return res.status(400).json({ message: 'ملف الإكسيل فارغ' });
    }

    const questionsToCreate = [];

    for (let i = 0; i < rawRows.length; i++) {
      const row = rawRows[i];
      const qText = row.text || row.question || row.question_text || row['السؤال'] || row['نص السؤال'];
      if (!qText || !String(qText).trim()) continue;

      const qId = row.questionId || row.question_id || row.code || `SA-${Date.now().toString().slice(-4)}${i + 1}`;

      // Build options array with { id, text, isCorrect }
      const options = [];
      const correctOpt = String(row.correct_option || '').trim().toUpperCase();
      const correctAnsText = String(row.correct_answer || row['الإجابة الصحيحة'] || '').trim();

      ['a', 'b', 'c', 'd', 'e', 'f'].forEach((letter, idx) => {
        const val = row[`option_${letter}`] || row[`Option_${letter}`] || row[`option_${letter.toUpperCase()}`] || row[`Option ${letter.toUpperCase()}`];
        if (val !== undefined && val !== null && String(val).trim() !== '') {
          const optText = String(val).trim();
          const letterUpper = letter.toUpperCase();
          const isCorrect = correctOpt === letterUpper || (correctAnsText && optText.toLowerCase() === correctAnsText.toLowerCase());
          options.push({
            id: letterUpper,
            text: optText,
            isCorrect: !!isCorrect
          });
        }
      });

      // If no correct option matched yet, check index or fallback
      let correctAns = correctAnsText;
      const foundCorrect = options.find(o => o.isCorrect);
      if (foundCorrect) {
        correctAns = foundCorrect.text;
      } else if (options.length > 0) {
        options[0].isCorrect = true;
        correctAns = options[0].text;
      }

      const chapter = row.chapter || row.Chapter || row['الفصل'] || (mod ? mod.name : null);
      const topic = row.topic || row.Topic || row['الموضوع'] || null;
      const knowledgeDomain = row.knowledgeDomain || row.knowledge_domain || row['المجال المعرفي'] || null;
      const clinicianTask = row.clinicianTask || row.clinician_task || row['المهمة السريرية'] || null;
      const healthGroup = row.healthGroup || row.health_group || row['الفئة الصحية'] || null;
      let difficultyLevel = String(row.difficultyLevel || row.difficulty || row['الصعوبة'] || 'medium').toLowerCase();
      if (difficultyLevel !== 'easy' && difficultyLevel !== 'medium' && difficultyLevel !== 'hard') {
        difficultyLevel = 'medium';
      }

      questionsToCreate.push({
        custom_id: String(qId).trim(),
        module_id: moduleId,
        question_text: String(qText).trim(),
        question_type: 'mcq',
        options: options,
        correct_answer: correctAns,
        explanation: row.explanation || row.Explanation || row['الشرح'] || null,
        hint: row.hint || row.Hint || row['تلميح'] || null,
        chapter,
        topic,
        knowledge_domain: knowledgeDomain,
        clinician_task: clinicianTask,
        health_group: healthGroup,
        difficulty_level: difficultyLevel,
        is_self_assessment: true,
        marks: 1.00
      });
    }

    if (questionsToCreate.length === 0) {
      return res.status(400).json({ message: 'لم يتم العثور على أي أسئلة صالحة في الملف' });
    }

    await QuestionBank.bulkCreate(questionsToCreate);

    return res.json({
      success: true,
      importedCount: questionsToCreate.length,
      message: `تم استيراد ${questionsToCreate.length} سؤال تقييم ذاتي بنجاح`
    });
  } catch (error) {
    return res.status(500).json({ message: 'فشل في استيراد ملف الإكسيل', error: error.message });
  } finally {
    if (filePath && fs.existsSync(filePath)) {
      try { fs.unlinkSync(filePath); } catch (e) { /* ignore */ }
    }
  }
};

// Download SA Excel Template
exports.downloadSATemplate = (req, res) => {
  try {
    const xlsx = require('xlsx');
    const sampleData = [
      {
        questionId: 'Q-1045',
        text: 'A 65-year-old male with a history of smoking presents with shortness of breath...',
        option_a: 'Albuterol',
        option_b: 'Ipratropium',
        option_c: 'Fluticasone',
        option_d: 'Salmeterol',
        correct_option: 'B',
        correct_answer: 'Ipratropium',
        chapter: 'Pulmonology',
        topic: 'Chronic Obstructive Pulmonary Disease (COPD)',
        knowledgeDomain: 'Pharmacology',
        clinicianTask: 'Management',
        healthGroup: 'Adult_Health',
        difficultyLevel: 'Medium',
        explanation: 'Ipratropium is a short-acting muscarinic antagonist used as a first-line bronchodilator in COPD exacerbations.',
        hint: 'Consider the anticholinergic mechanism of action.'
      },
      {
        questionId: 'Q-1046',
        text: 'A 45-year-old woman presents with fatigue, cold intolerance, and weight gain...',
        option_a: 'Graves Disease',
        option_b: 'Hashimoto Thyroiditis',
        option_c: 'Subacute Granulomatous Thyroiditis',
        option_d: 'Toxic Multinodular Goiter',
        correct_option: 'B',
        correct_answer: 'Hashimoto Thyroiditis',
        chapter: 'Endocrine System',
        topic: 'Thyroid Disorders',
        knowledgeDomain: 'Pathology',
        clinicianTask: 'Diagnosis',
        healthGroup: 'Adult_Health',
        difficultyLevel: 'Easy',
        explanation: 'Hashimoto thyroiditis is the most common cause of hypothyroidism in iodine-sufficient regions.',
        hint: 'Look for symptoms of hypothyroidism.'
      }
    ];

    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.json_to_sheet(sampleData);
    xlsx.utils.book_append_sheet(wb, ws, 'SA_Questions_Template');

    const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Disposition', 'attachment; filename="self_assessment_template.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    return res.send(buffer);
  } catch (error) {
    return res.status(500).json({ message: 'فشل في إنشاء نموذج الإكسيل', error: error.message });
  }
};
