const express = require('express');
const router = express.Router();
const assessmentController = require('../controllers/assessment.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/course/:course_id', assessmentController.getAssessmentsByCourse);
router.post('/submit', protect, assessmentController.submitAssessment);

module.exports = router;
