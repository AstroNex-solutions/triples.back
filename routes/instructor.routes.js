const express = require('express');
const router = express.Router();
const inst = require('../controllers/instructor.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

// All instructor routes require authentication + Instructor/Admin role
router.use(protect, authorize('Instructor', 'Admin'));

// Dashboard Stats
router.get('/stats', inst.getInstructorStats);

// Profile
router.put('/profile', upload.single('image_profile'), inst.updateMyProfile);

// Sessions
router.get('/sessions', inst.getMySessions);
router.post('/sessions/:id/revoke', inst.revokeMySession);

// Courses Management
router.get('/courses', inst.getMyCourses);
router.post('/courses', upload.single('image'), inst.createCourse);
router.put('/courses/:id', upload.single('image'), inst.updateMyCourse);

// Categories & Tags (read-only)
router.get('/categories', inst.getCategories);
router.get('/tags', inst.getTags);

// Sections, Modules, Lessons
router.post('/sections', inst.addSection);
router.post('/modules', upload.fields([{ name: 'video', maxCount: 1 }, { name: 'pdf', maxCount: 1 }]), inst.addModule);
router.post('/lessons', upload.single('video'), inst.addLesson);

// Enrollments & Progress
router.get('/enrollments', inst.getMyEnrollments);

// Assessments & Question Bank
router.get('/assessments', inst.getMyAssessments);
router.post('/assessments', inst.createAssessment);
router.post('/questions', inst.addQuestion);
router.get('/attempts', inst.getAttempts);
router.put('/grade/:id', inst.gradeEssay);

// Reviews & Comments
router.get('/reviews', inst.getMyReviews);
router.post('/reviews/:id/reply', inst.replyToReview);
router.get('/comments', inst.getMyComments);

// Sales
router.get('/sales', inst.getMySales);

// Articles
router.get('/articles', inst.getMyArticles);
router.post('/articles', upload.single('image'), inst.createArticle);
router.put('/articles/:id', upload.single('image'), inst.updateArticle);
router.delete('/articles/:id', inst.deleteArticle);

// Books
router.get('/book-categories', inst.getBookCategories);
router.get('/books', inst.getMyBooks);
router.post('/books', upload.fields([{ name: 'book_file', maxCount: 1 }, { name: 'cover_image', maxCount: 1 }]), inst.createBook);
router.put('/books/:id', inst.updateBook);
router.delete('/books/:id', inst.deleteBook);

// Support
router.post('/support', inst.sendSupportMessage);

module.exports = router;
