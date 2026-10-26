const { QuestionBankChapter, QuestionBank, ModuleModel } = require('../models');
const xlsx = require('xlsx');
const fs = require('fs');

// Helper to sanitize difficulty
function parseDifficulty(val) {
  if (!val) return 'medium';
  const str = String(val).toLowerCase().trim();
  if (str === '1' || str === 'easy' || str === 'سهل') return 'easy';
  if (str === '3' || str === 'hard' || str === 'صعب') return 'hard';
  return 'medium';
}

// ═══════════════════════════════════════════
// 1. CHAPTERS MANAGEMENT (فصول بنك الأسئلة)
// ═══════════════════════════════════════════

// GET all chapters for a module with question count
exports.getModuleQBankChapters = async (req, res) => {
  try {
    const { moduleId } = req.params;

    const chapters = await QuestionBankChapter.findAll({
      where: { module_id: moduleId },
      include: [
        {
          model: QuestionBank,
          as: 'questions',
          where: { is_self_assessment: false },
          required: false,
          attributes: ['id']
        }
      ],
      order: [['order', 'ASC'], ['id', 'ASC']]
    });

    // Check if there are any unassigned questions for this module (chapter_id is null)
    const unassignedCount = await QuestionBank.count({
      where: {
        module_id: moduleId,
        chapter_id: null,
        is_self_assessment: false
      }
    });

    const formattedChapters = chapters.map(ch => ({
      id: ch.id,
      module_id: ch.module_id,
      title: ch.title,
      description: ch.description,
      order: ch.order,
      questions_count: ch.questions ? ch.questions.length : 0,
      createdAt: ch.createdAt,
      updatedAt: ch.updatedAt
    }));

    return res.json({
      chapters: formattedChapters,
      unassignedQuestionsCount: unassignedCount
    });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ في جلب فصول بنك الأسئلة', error: error.message });
  }
};

// CREATE a chapter in a module
exports.createModuleQBankChapter = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const { title, description, order } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'اسم الفصل مطلوب' });
    }

    const chapter = await QuestionBankChapter.create({
      module_id: moduleId,
      title: title.trim(),
      description: description ? description.trim() : null,
      order: order !== undefined ? parseInt(order, 10) : 0
    });

    return res.status(201).json({
      message: 'تم إنشاء الفصل بنجاح',
      chapter: {
        ...chapter.toJSON(),
        questions_count: 0
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ في إنشاء الفصل', error: error.message });
  }
};

// UPDATE a chapter
exports.updateQBankChapter = async (req, res) => {
  try {
    const { chapterId } = req.params;
    const { title, description, order } = req.body;

    const chapter = await QuestionBankChapter.findByPk(chapterId);
    if (!chapter) {
      return res.status(404).json({ message: 'الفصل غير موجود' });
    }

    if (title !== undefined) chapter.title = title.trim();
    if (description !== undefined) chapter.description = description ? description.trim() : null;
    if (order !== undefined) chapter.order = parseInt(order, 10);

    await chapter.save();

    // Also update chapter title string on its questions
    if (title) {
      await QuestionBank.update(
        { chapter: title.trim() },
        { where: { chapter_id: chapter.id } }
      );
    }

    return res.json({ message: 'تم تحديث الفصل بنجاح', chapter });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ في تحديث الفصل', error: error.message });
  }
};

// DELETE a chapter
exports.deleteQBankChapter = async (req, res) => {
  try {
    const { chapterId } = req.params;

    const chapter = await QuestionBankChapter.findByPk(chapterId);
    if (!chapter) {
      return res.status(404).json({ message: 'الفصل غير موجود' });
    }

    // Delete associated questions
    await QuestionBank.destroy({ where: { chapter_id: chapter.id } });
    await chapter.destroy();

    return res.json({ message: 'تم حذف الفصل وجميع أسئلته بنجاح' });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ في حذف الفصل', error: error.message });
  }
};

// REORDER chapters
exports.reorderQBankChapters = async (req, res) => {
  try {
    const { items } = req.body; // array of { id, order }
    if (!Array.isArray(items)) {
      return res.status(400).json({ message: 'صيغة البيانات غير صحيحة' });
    }

    for (const item of items) {
      await QuestionBankChapter.update({ order: item.order }, { where: { id: item.id } });
    }

    return res.json({ message: 'تم تحديث الترتيب بنجاح' });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ في تحديث الترتيب', error: error.message });
  }
};

// ═══════════════════════════════════════════
// 2. QUESTIONS MANAGEMENT (أسئلة الفصل)
// ═══════════════════════════════════════════

// GET questions belonging to a specific chapter
exports.getChapterQuestions = async (req, res) => {
  try {
    const { chapterId } = req.params;

    const chapter = await QuestionBankChapter.findByPk(chapterId);
    if (!chapter) {
      return res.status(404).json({ message: 'الفصل غير موجود' });
    }

    const questions = await QuestionBank.findAll({
      where: {
        chapter_id: chapterId,
        is_self_assessment: false
      },
      order: [['id', 'ASC']]
    });

    return res.json({
      chapter,
      questions
    });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ في جلب الأسئلة', error: error.message });
  }
};

// CREATE a question in a chapter
exports.createChapterQuestion = async (req, res) => {
  try {
    const { chapterId } = req.params;
    const chapter = await QuestionBankChapter.findByPk(chapterId);
    if (!chapter) {
      return res.status(404).json({ message: 'الفصل غير موجود' });
    }

    const {
      question_text,
      options,
      correct_answer,
      explanation,
      hint,
      topic,
      difficulty_level
    } = req.body;

    if (!question_text || !question_text.trim()) {
      return res.status(400).json({ message: 'نص السؤال مطلوب' });
    }
    if (!correct_answer) {
      return res.status(400).json({ message: 'الإجابة الصحيحة مطلوبة' });
    }

    let parsedOptions = options;
    if (typeof options === 'string') {
      try {
        parsedOptions = JSON.parse(options);
      } catch {
        parsedOptions = options.split(',').map(s => s.trim());
      }
    }

    let imagePath = null;
    if (req.file) {
      imagePath = req.file.filename ? `/uploads/${req.file.filename}` : req.file.path;
    }

    const question = await QuestionBank.create({
      module_id: chapter.module_id,
      chapter_id: chapter.id,
      chapter: chapter.title,
      topic: topic ? topic.trim() : null,
      question_text: question_text.trim(),
      question_type: 'mcq',
      options: parsedOptions,
      correct_answer: correct_answer.trim(),
      explanation: explanation ? explanation.trim() : null,
      hint: hint ? hint.trim() : null,
      difficulty_level: parseDifficulty(difficulty_level),
      image: imagePath,
      is_self_assessment: false,
      marks: 1.00
    });

    return res.status(201).json({
      message: 'تم إضافة السؤال بنجاح',
      question
    });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ في إضافة السؤال', error: error.message });
  }
};

// UPDATE a question
exports.updateQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;
    const question = await QuestionBank.findByPk(questionId);
    if (!question) {
      return res.status(404).json({ message: 'السؤال غير موجود' });
    }

    const {
      question_text,
      options,
      correct_answer,
      explanation,
      hint,
      topic,
      difficulty_level
    } = req.body;

    if (question_text) question.question_text = question_text.trim();
    if (correct_answer) question.correct_answer = correct_answer.trim();
    if (explanation !== undefined) question.explanation = explanation;
    if (hint !== undefined) question.hint = hint;
    if (topic !== undefined) question.topic = topic;
    if (difficulty_level) question.difficulty_level = parseDifficulty(difficulty_level);

    if (options !== undefined) {
      let parsedOptions = options;
      if (typeof options === 'string') {
        try {
          parsedOptions = JSON.parse(options);
        } catch {
          parsedOptions = options.split(',').map(s => s.trim());
        }
      }
      question.options = parsedOptions;
    }

    if (req.file) {
      question.image = req.file.filename ? `/uploads/${req.file.filename}` : req.file.path;
    }

    await question.save();

    return res.json({
      message: 'تم تحديث السؤال بنجاح',
      question
    });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ في تحديث السؤال', error: error.message });
  }
};

// DELETE a question
exports.deleteQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;
    const question = await QuestionBank.findByPk(questionId);
    if (!question) {
      return res.status(404).json({ message: 'السؤال غير موجود' });
    }

    await question.destroy();
    return res.json({ message: 'تم حذف السؤال بنجاح' });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ في حذف السؤال', error: error.message });
  }
};

// ═══════════════════════════════════════════
// 3. EXCEL IMPORT & TEMPLATE
// ═══════════════════════════════════════════

// Internal parser function for an Excel row
function parseExcelQuestionRow(row) {
  // Question text
  const question_text = row.question || row.question_text || row['السؤال'] || row['نص السؤال'] || row.Question;
  if (!question_text || !String(question_text).trim()) return null;

  // Options A, B, C, D, E
  const optionsMap = {};
  const optionsList = [];
  ['a', 'b', 'c', 'd', 'e', 'f'].forEach(letter => {
    const val = row[`option_${letter}`] || row[`Option_${letter}`] || row[`option_${letter.toUpperCase()}`] || row[`Option ${letter.toUpperCase()}`] || row[`خيار_${letter}`];
    if (val !== undefined && val !== null && String(val).trim() !== '') {
      const cleanVal = String(val).trim();
      optionsMap[letter.toUpperCase()] = cleanVal;
      optionsList.push(cleanVal);
    }
  });

  // If options were not provided as option_a..f, check for row.options
  let finalOptions = optionsList;
  if (finalOptions.length === 0 && row.options) {
    if (Array.isArray(row.options)) {
      finalOptions = row.options;
    } else if (typeof row.options === 'string') {
      try {
        finalOptions = JSON.parse(row.options);
      } catch {
        finalOptions = row.options.split(',').map(s => s.trim()).filter(Boolean);
      }
    }
  }

  // Correct answer resolution
  let correct_answer = '';
  if (row.correct_answer && String(row.correct_answer).trim() !== '') {
    correct_answer = String(row.correct_answer).trim();
  } else if (row.correct_option) {
    const optLetter = String(row.correct_option).trim().toUpperCase();
    if (optionsMap[optLetter]) {
      correct_answer = optionsMap[optLetter];
    } else {
      // Check 0-based index if single number (1->A, etc.)
      const idx = parseInt(optLetter, 10);
      if (!isNaN(idx) && finalOptions[idx - 1]) {
        correct_answer = finalOptions[idx - 1];
      }
    }
  } else if (row['الإجابة الصحيحة']) {
    correct_answer = String(row['الإجابة الصحيحة']).trim();
  }

  // If correct_answer is still not resolved, fallback to the first option
  if (!correct_answer && finalOptions.length > 0) {
    correct_answer = finalOptions[0];
  }

  return {
    question_text: String(question_text).trim(),
    options: finalOptions,
    correct_answer: correct_answer,
    explanation: row.explanation || row.Explanation || row['الشرح'] || row['التفسير'] || null,
    hint: row.hint || row.Hint || row['تلميح'] || null,
    topic: row.topic || row.Topic || row['الموضوع'] || null,
    chapter_name: row.chapter || row.Chapter || row['الفصل'] || null,
    difficulty_level: parseDifficulty(row.difficulty || row.difficulty_level || row.Difficulty)
  };
}

// IMPORT Excel at Module Level (automatically creates or groups by chapters from file)
exports.importModuleQBankExcel = async (req, res) => {
  let filePath = null;
  try {
    const { moduleId } = req.params;
    const moduleItem = await ModuleModel.findByPk(moduleId);
    if (!moduleItem) {
      return res.status(404).json({ message: 'الموديول غير موجود' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'يرجى رفع ملف Excel بصيغة .xlsx أو .xls أو .csv' });
    }

    // Determine path
    filePath = req.file.path;
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const rawRows = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    if (!rawRows || rawRows.length === 0) {
      return res.status(400).json({ message: 'ملف الإكسيل فارغ' });
    }

    // Map existing chapters for this module
    const existingChapters = await QuestionBankChapter.findAll({
      where: { module_id: moduleId }
    });
    const chaptersByTitle = new Map();
    existingChapters.forEach(c => chaptersByTitle.set(c.title.trim().toLowerCase(), c));

    let createdChaptersCount = 0;
    const questionsToCreate = [];

    // Parse rows
    for (let i = 0; i < rawRows.length; i++) {
      const parsed = parseExcelQuestionRow(rawRows[i]);
      if (!parsed) continue;

      const targetChapterTitle = (parsed.chapter_name && parsed.chapter_name.trim()) 
        ? parsed.chapter_name.trim() 
        : `الفصل 1: ${moduleItem.name}`;

      const titleKey = targetChapterTitle.toLowerCase();
      let chapter = chaptersByTitle.get(titleKey);

      if (!chapter) {
        // Create the chapter on the fly
        chapter = await QuestionBankChapter.create({
          module_id: moduleId,
          title: targetChapterTitle,
          order: chaptersByTitle.size + 1
        });
        chaptersByTitle.set(titleKey, chapter);
        createdChaptersCount++;
      }

      questionsToCreate.push({
        module_id: moduleId,
        chapter_id: chapter.id,
        chapter: chapter.title,
        topic: parsed.topic,
        question_text: parsed.question_text,
        question_type: 'mcq',
        options: parsed.options,
        correct_answer: parsed.correct_answer,
        explanation: parsed.explanation,
        hint: parsed.hint,
        difficulty_level: parsed.difficulty_level,
        is_self_assessment: false,
        marks: 1.00
      });
    }

    if (questionsToCreate.length === 0) {
      return res.status(400).json({ message: 'لم يتم العثور على أي أسئلة صالحة في الملف. يرجى التأكد من عناوين الأعمدة' });
    }

    // Bulk insert questions
    await QuestionBank.bulkCreate(questionsToCreate);

    return res.json({
      success: true,
      importedCount: questionsToCreate.length,
      createdChaptersCount,
      message: `تم استيراد ${questionsToCreate.length} سؤال بنجاح (${createdChaptersCount} فصول جديدة)`
    });
  } catch (error) {
    return res.status(500).json({ message: 'فشل في استيراد ملف الإكسيل', error: error.message });
  } finally {
    // Cleanup temporary file
    if (filePath && fs.existsSync(filePath)) {
      try { fs.unlinkSync(filePath); } catch (e) { /* ignore */ }
    }
  }
};

// IMPORT Excel into a specific Chapter
exports.importChapterQBankExcel = async (req, res) => {
  let filePath = null;
  try {
    const { chapterId } = req.params;
    const chapter = await QuestionBankChapter.findByPk(chapterId);
    if (!chapter) {
      return res.status(404).json({ message: 'الفصل غير موجود' });
    }

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
      const parsed = parseExcelQuestionRow(rawRows[i]);
      if (!parsed) continue;

      questionsToCreate.push({
        module_id: chapter.module_id,
        chapter_id: chapter.id,
        chapter: chapter.title,
        topic: parsed.topic,
        question_text: parsed.question_text,
        question_type: 'mcq',
        options: parsed.options,
        correct_answer: parsed.correct_answer,
        explanation: parsed.explanation,
        hint: parsed.hint,
        difficulty_level: parsed.difficulty_level,
        is_self_assessment: false,
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
      message: `تم استيراد ${questionsToCreate.length} سؤال إلى فصل "${chapter.title}" بنجاح`
    });
  } catch (error) {
    return res.status(500).json({ message: 'فشل في استيراد ملف الإكسيل', error: error.message });
  } finally {
    if (filePath && fs.existsSync(filePath)) {
      try { fs.unlinkSync(filePath); } catch (e) { /* ignore */ }
    }
  }
};

// DOWNLOAD Excel Template for Question Bank
exports.downloadQBankTemplate = (req, res) => {
  try {
    const sampleData = [
      {
        chapter: 'Molecular Biology',
        topic: 'Chromatin and Epigenetics',
        question: 'Which of the following structural changes in chromatin increases sensitivity to DNase I?',
        option_a: 'Permanent covalent nucleosome 30-nm fiber',
        option_b: 'Lamina detachment from peripheral heterochromatin',
        option_c: 'Genome-wide core-histone replacement by protamines',
        option_d: 'Loosely packed transcription-accessible euchromatin',
        option_e: 'Densely packed transcription-excluding heterochromatin',
        correct_option: 'D',
        correct_answer: 'Loosely packed transcription-accessible euchromatin',
        explanation: 'Inhibiting histone deacetylases leads to hyperacetylation of histone tails, relaxing chromatin into euchromatin.',
        hint: 'Consider what histone acetylation does to nucleosome packaging.',
        difficulty: 2
      },
      {
        chapter: 'Molecular Biology',
        topic: 'DNA Replication',
        question: 'Which enzyme is responsible for removing RNA primers during eukaryotic DNA replication?',
        option_a: 'DNA Polymerase alpha',
        option_b: 'RNase H and FEN1',
        option_c: 'DNA Ligase I',
        option_d: 'Topoisomerase I',
        option_e: 'Telomerase',
        correct_option: 'B',
        correct_answer: 'RNase H and FEN1',
        explanation: 'RNase H removes most of the ribonucleotides, and FEN1 cleaves the flap during replication.',
        hint: 'Look for the ribonuclease enzyme.',
        difficulty: 1
      }
    ];

    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.json_to_sheet(sampleData);
    xlsx.utils.book_append_sheet(wb, ws, 'Questions_Template');

    const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Disposition', 'attachment; filename="question_bank_template.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    return res.send(buffer);
  } catch (error) {
    return res.status(500).json({ message: 'فشل في إنشاء نموذج الإكسيل', error: error.message });
  }
};
