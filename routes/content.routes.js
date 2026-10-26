const express = require('express');
const router = express.Router();
const contentController = require('../controllers/content.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');

router.post('/modules', protect, authorize('Instructor', 'Admin'), upload.fields([{ name: 'video', maxCount: 1 }, { name: 'pdf', maxCount: 1 }]), contentController.createModule);
router.post('/lessons', protect, authorize('Instructor', 'Admin'), upload.single('video'), contentController.createLesson);
router.post('/complete-lesson', protect, contentController.completeLesson);
// uncomplete-lesson محجوزة للإدارة فقط — الإكمال يتم تلقائياً من النظام

module.exports = router;
