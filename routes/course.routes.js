const express = require('express');
const router = express.Router();
const courseController = require('../controllers/course.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

router.get('/', courseController.getCourses);
router.get('/categories', courseController.getCategories);
router.get('/:slug', courseController.getCourseBySlug);
router.post('/', protect, authorize('Instructor', 'Admin'), upload.single('image'), courseController.createCourse);

module.exports = router;
