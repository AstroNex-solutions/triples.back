const express = require('express');
const router = express.Router();
const st = require('../controllers/student.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

// All student routes require authentication + Student/Instructor/Admin role
// We allow Instructor/Admin so they can also view the student perspective if needed
router.use(protect, authorize('Student', 'Instructor', 'Admin'));

// 1. Dashboard Stats
router.get('/stats', st.getStudentStats);

// 2. Profile, Sessions, Freeze
router.put('/profile', upload.single('image_profile'), st.updateMyProfile);
router.post('/change-password', st.changePassword);
router.get('/sessions', st.getMySessions);
router.post('/sessions/:id/revoke', st.revokeMySession);
// router.post('/freeze', st.requestAccountFreeze); // Not implemented yet

// 3. Enrollments & Schedules
router.get('/enrollments', st.getMyEnrollments);
router.post('/enrollments/:courseId/freeze', st.freezeCourse);
router.post('/enrollments/:courseId/unfreeze', st.unfreezeCourse);
router.get('/schedules', st.getMySchedules);
router.post('/schedules', st.createSchedule);
router.put('/schedules/:id', st.updateSchedule);
router.delete('/schedules/:id', st.deleteSchedule);

// 4. Assessments & Results
router.get('/assessments', st.getMyAssessments);
router.get('/assessments/:id', st.getAssessmentById);
router.post('/assessments/submit', st.submitAssessment);
router.get('/assessment-results', st.getMyAssessmentResults);
router.get('/self-assessments', st.getSelfAssessments);
router.get('/self-assessments/:id', st.getSelfAssessmentById);
router.post('/self-assessments/:id/submit', st.submitSelfAssessment);
router.get('/question-banks', st.getQuestionBanks);
router.get('/question-banks/:id', st.getQuestionBankById);

// 5. Orders (Purchases)
router.get('/orders', st.getMyOrders);

// 6. Reviews & Feedback
router.post('/reviews', st.addCourseReview);
router.post('/lesson-reviews', st.addLessonReview);

// 7. Support
router.get('/support', st.getSupportMessages);
router.post('/support', st.sendSupportMessage);
// 8. Player & Modules
router.post('/courses/:courseId/sa-report', st.generateCourseReport);
router.get('/courses/:courseId/play', st.getCoursePlayer);
router.get('/courses/:courseId/questions', st.getCourseQuestions);
router.get('/courses/:courseId/modules/:moduleId', st.getModuleDetails);
router.get('/modules/:moduleId/questions', st.getModuleQuestions);
router.post('/progress/:lessonId', st.saveLessonProgress);

// 9. Flashcards
router.get('/flashcards', st.getMyFlashcards);
router.get('/flashcards/:moduleId/decks', st.getFlashcardProductDecks);
router.get('/flashcards/:deckId/items', st.getFlashcardDeckItems);



// Settings
router.get('/settings', st.getSettings);
module.exports = router;
