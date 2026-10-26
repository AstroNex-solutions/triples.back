const express = require('express');
const router = express.Router();
const admin = require('../controllers/admin.controller');
const courseController = require('../controllers/course.controller');
const qbank = require('../controllers/qbank.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

// Public Template Downloads (Blank Excel templates with no sensitive data)
router.get('/self-assessment/template', courseController.downloadSATemplate);
router.get('/qbank/template', qbank.downloadQBankTemplate);

// All admin routes require authentication + Admin role
router.use(protect, authorize('Admin'));

// Generic Image Upload
router.post('/upload-image', upload.single('image'), admin.uploadImage);

// Dashboard Stats
router.get('/stats', admin.getDashboardStats);

// Videos Management
router.get('/videos/check-broken', admin.checkBrokenVideos);

// Users Management
router.get('/users', admin.getAllUsers);
router.post('/users', admin.createUser);
router.put('/users/:id', admin.updateUser);
router.put('/users/:id/password', admin.changeUserPassword);
router.delete('/users/:id', admin.deleteUser);
router.post('/users/:id/freeze', admin.freezeUser);
router.post('/users/:id/unfreeze', admin.unfreezeUser);

// Sessions
router.get('/sessions', admin.getAllSessions);
router.post('/sessions/:id/revoke', admin.revokeSession);

// Categories & Tags
router.get('/categories', admin.getAllCategories);
router.post('/categories', upload.single('image'), admin.createCategory);
router.put('/categories/:id', upload.single('image'), admin.updateCategory);
router.delete('/categories/:id', admin.deleteCategory);
router.get('/tags', admin.getAllTags);
router.post('/tags', admin.createTag);
router.put('/tags/:id', admin.updateTag);
router.delete('/tags/:id', admin.deleteTag);

// Courses
router.get('/courses', admin.getAllCoursesAdmin);
router.get('/courses/:id/modules', admin.getCourseModules);
router.post('/courses', upload.single('image'), admin.createCourseAdmin);
router.put('/courses/:id', upload.single('image'), admin.updateCourse);
router.delete('/courses/:id', admin.deleteCourse);
router.post('/courses/:id/duplicate', admin.duplicateCourse);
router.post('/courses/:id/approve', admin.approveCourse);
router.post('/courses/:id/instructors', admin.addCourseInstructor);
router.delete('/courses/:id/instructors/:instructorId', admin.removeCourseInstructor);

// Modules & Lessons
router.put('/modules/reorder', admin.reorderModules);
router.post('/modules', upload.fields([{ name: 'video', maxCount: 1 }, { name: 'pdf', maxCount: 1 }]), admin.addModuleAdmin);
router.put('/modules/:id', admin.updateModuleAdmin);
router.delete('/modules/:id', admin.deleteModuleAdmin);

// Module Flashcards
router.get('/modules/:id/flashcards', admin.getModuleFlashcards);
router.post('/modules/:id/flashcards', admin.createModuleFlashcard);
router.put('/flashcard-decks/:id', admin.updateModuleFlashcard);
router.delete('/flashcard-decks/:id', admin.deleteModuleFlashcard);
router.put('/lessons/reorder', admin.reorderLessons);
router.post('/lessons', upload.fields([{ name: 'video', maxCount: 1 }, { name: 'attachments', maxCount: 10 }]), admin.addLessonAdmin);
router.put('/lessons/:id', upload.fields([{ name: 'video', maxCount: 1 }, { name: 'attachments', maxCount: 10 }]), admin.updateLessonAdmin);
router.delete('/lessons/:id', admin.deleteLessonAdmin);
router.delete('/lessons/:id/attachments/:attachmentIndex', admin.deleteLessonAttachment);
router.get('/bunny-videos', admin.getBunnyVideos);

// Enrollments
router.get('/enrollments', admin.getAllEnrollments);
router.post('/enrollments', admin.createEnrollment);
router.put('/enrollments/:id', admin.updateEnrollment);
router.delete('/enrollments/:id', admin.deleteEnrollment);

// Assessments & Question Bank
router.get('/assessments', admin.getAllAssessments);
router.post('/assessments', admin.createAssessment);
router.put('/assessments/:id', admin.updateAssessment);
router.delete('/assessments/:id', admin.deleteAssessment);
router.post('/assessments/:id/questions', admin.addQuestionToAssessment);
router.post('/questions', admin.createQuestion);
router.put('/questions/:id', admin.updateQuestion);
router.delete('/questions/:id', admin.deleteQuestion);

// Coupons
router.get('/coupons', admin.getAllCoupons);
router.post('/coupons', admin.createCoupon);
router.put('/coupons/:id', admin.updateCoupon);
router.delete('/coupons/:id', admin.deleteCoupon);

// Orders
router.get('/orders', admin.getAllOrders);
router.put('/orders/:id/status', admin.updateOrderStatus);

// Reviews & Comments
router.get('/reviews', admin.getAllReviews);
router.post('/reviews/:id/toggle', admin.toggleReviewApproval);
router.delete('/reviews/:id', admin.deleteCourseReview);
router.get('/lesson-reviews', admin.getAllLessonReviews);
router.post('/lesson-reviews/:id/toggle', admin.toggleLessonReviewApproval);
router.delete('/lesson-reviews/:id', admin.deleteLessonReview);
router.get('/comments', admin.getAllComments);
router.post('/comments/:id/toggle', admin.toggleCommentApproval);
router.get('/article-comments', admin.getAllArticleComments);
router.post('/article-comments/:id/toggle', admin.toggleArticleCommentApproval);

// Banners & CMS
router.get('/banners', admin.getAllBanners);
router.post('/banners', upload.fields([{ name: 'image', maxCount: 1 }, { name: 'image_ar', maxCount: 1 }]), admin.createBanner);
router.put('/banners/:id', upload.fields([{ name: 'image', maxCount: 1 }, { name: 'image_ar', maxCount: 1 }]), admin.updateBanner);
router.delete('/banners/:id', admin.deleteBanner);
router.get('/contact-info', admin.getContactInfo);
router.put('/contact-info', admin.updateContactInfo);
router.get('/privacy-policy', admin.getPrivacyPolicy);
router.put('/privacy-policy', admin.updatePrivacyPolicy);

router.get('/about-us', admin.getAboutUs);
router.put('/about-us', admin.updateAboutUs);
router.get('/terms', admin.getTerms);
router.put('/terms', admin.updateTerms);

// Contact Messages
router.get('/messages', admin.getAllMessages);
router.post('/messages/:id/reply', admin.replyToMessage);
router.put('/messages/:id/status', admin.updateMessageStatus);

// Articles
router.get('/articles', admin.getAllArticlesAdmin);
router.post('/articles', upload.single('image'), admin.createArticle);
router.put('/articles/:id', upload.single('image'), admin.updateArticle);
router.delete('/articles/:id', admin.deleteArticle);

// Books & Library
router.get('/book-categories', admin.getAllBookCategories);
router.post('/book-categories', admin.createBookCategory);
router.get('/books', admin.getAllBooksAdmin);
router.post('/books', upload.fields([{ name: 'book_file', maxCount: 1 }, { name: 'cover_image', maxCount: 1 }]), admin.createBook);
router.put('/books/:id', admin.updateBook);
router.delete('/books/:id', admin.deleteBook);

// Partnerships
router.get('/partnerships', admin.getPartnershipsAdmin);
router.post('/partnerships', upload.single('logo'), admin.createPartnership);
router.put('/partnerships/:id', upload.single('logo'), admin.updatePartnership);
router.delete('/partnerships/:id', admin.deletePartnership);

// Question Bank Products
router.get('/question-bank-products', admin.getAllQuestionBankProducts);
router.post('/question-bank-products', admin.createQuestionBankProduct);
router.put('/question-bank-products/:id', admin.updateQuestionBankProduct);
router.delete('/question-bank-products/:id', admin.deleteQuestionBankProduct);

// Self Assessment Products
router.get('/self-assessment-products', admin.getAllSelfAssessmentProducts);
router.post('/self-assessment-products', admin.createSelfAssessmentProduct);
router.put('/self-assessment-products/:id', admin.updateSelfAssessmentProduct);
router.delete('/self-assessment-products/:id', admin.deleteSelfAssessmentProduct);

// FAQs
router.get('/faqs', admin.getFaqsAdmin);
router.post('/faqs', admin.createFaq);
router.put('/faqs/:id', admin.updateFaq);
router.delete('/faqs/:id', admin.deleteFaq);

// Pages (Terms, Privacy, Contact Info)
router.get('/terms', admin.getTermsAdmin);
router.put('/terms', admin.updateTerms);

router.get('/privacy', admin.getPrivacyAdmin);
router.put('/privacy', admin.updatePrivacy);

router.get('/contact-info', admin.getContactInfoAdmin);
router.put('/contact-info', admin.updateContactInfo);

// Contact Messages
router.get('/contact-messages', admin.getContactMessagesAdmin);
router.put('/contact-messages/:id/status', admin.updateContactMessageStatus);
router.delete('/contact-messages/:id', admin.deleteContactMessage);

// Flashcard Products
router.get('/flashcard-products', admin.getFlashcardProducts);
router.post('/flashcard-products', admin.createFlashcardProduct);
router.put('/flashcard-products/:id', admin.updateFlashcardProduct);
router.delete('/flashcard-products/:id', admin.deleteFlashcardProduct);
router.post('/flashcard-products/:productId/upload', upload.single('file'), admin.uploadFlashcardsExcel);

// Flashcard Decks
router.get('/flashcard-products/:productId/decks', admin.getFlashcardDecks);
router.post('/flashcard-products/:productId/decks', admin.createFlashcardDeck);
router.put('/flashcard-decks/:id', admin.updateFlashcardDeck);
router.delete('/flashcard-decks/:id', admin.deleteFlashcardDeck);
router.post('/flashcard-decks/:deckId/upload', upload.single('file'), admin.uploadFlashcardsToDeck);

// Flashcard Items
router.get('/flashcard-decks/:deckId/items', admin.getFlashcardItems);
router.post('/flashcard-decks/:deckId/items', admin.createFlashcardItem);
router.put('/flashcard-items/:id', admin.updateFlashcardItem);
router.delete('/flashcard-items/:id', admin.deleteFlashcardItem);

// System Settings
router.get('/settings', admin.getSettings);
router.put('/settings', admin.updateSettings);

// Module QBank
router.get('/modules/:moduleId/questions', courseController.getModuleQuestions);
router.post('/modules/:moduleId/questions', upload.single('image'), courseController.createModuleQuestion);
router.put('/modules/:moduleId/questions/:questionId', upload.single('image'), courseController.updateModuleQuestion);
router.delete('/modules/:moduleId/questions/:questionId', courseController.deleteModuleQuestion);

// Module QBank Chapters & Excel Import
router.get('/modules/:moduleId/qbank-chapters', qbank.getModuleQBankChapters);
router.post('/modules/:moduleId/qbank-chapters', qbank.createModuleQBankChapter);
router.put('/qbank-chapters/reorder', qbank.reorderQBankChapters);
router.put('/qbank-chapters/:chapterId', qbank.updateQBankChapter);
router.delete('/qbank-chapters/:chapterId', qbank.deleteQBankChapter);

router.get('/qbank-chapters/:chapterId/questions', qbank.getChapterQuestions);
router.post('/qbank-chapters/:chapterId/questions', upload.single('image'), qbank.createChapterQuestion);
router.put('/qbank-questions/:questionId', upload.single('image'), qbank.updateQuestion);
router.delete('/qbank-questions/:questionId', qbank.deleteQuestion);

router.post('/modules/:moduleId/qbank/import-excel', upload.single('file'), qbank.importModuleQBankExcel);
router.post('/qbank-chapters/:chapterId/import-excel', upload.single('file'), qbank.importChapterQBankExcel);

// Metadata Taxonomy Management
router.get('/metadata-taxonomy', courseController.getMetadataTaxonomy);
router.put('/metadata-taxonomy', courseController.updateMetadataTaxonomy);

// Module Self Assessment
router.get('/modules/:moduleId/self-assessment-questions', courseController.getModuleSAQuestions);
router.post('/modules/:moduleId/self-assessment-questions', upload.single('image'), courseController.createModuleSAQuestion);
router.put('/modules/:moduleId/self-assessment-questions/:questionId', upload.single('image'), courseController.updateModuleSAQuestion);
router.delete('/modules/:moduleId/self-assessment-questions/:questionId', courseController.deleteModuleSAQuestion);
router.post('/modules/:moduleId/self-assessment-questions/import-excel', upload.single('file'), courseController.importModuleSAExcel);

module.exports = router;
