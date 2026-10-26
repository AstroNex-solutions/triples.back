const express = require('express');
const router = express.Router();
const extrasController = require('../controllers/extras.controller');

router.get('/articles', extrasController.getArticles);
router.get('/books', extrasController.getBooks);
router.get('/banners', extrasController.getBanners);
router.get('/partners', extrasController.getPartnerships);
router.post('/contact', extrasController.sendContactMessage);

router.get('/testimonials', extrasController.getTestimonials);
router.get('/faqs', extrasController.getFaqs);
router.get('/terms', extrasController.getTerms);
router.get('/privacy', extrasController.getPrivacy);
router.get('/about-us', extrasController.getAboutUs);
router.get('/contact-info', extrasController.getContactInfo);

module.exports = router;
