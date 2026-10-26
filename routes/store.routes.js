const express = require('express');
const router = express.Router();
const storeController = require('../controllers/store.controller');
const { protect } = require('../middleware/auth.middleware');

router.get('/flashcards', storeController.getFlashcardsForStore);

router.get('/cart', protect, storeController.getCart);
router.post('/cart', protect, storeController.addToCart);
router.delete('/cart/item/:itemId', protect, storeController.removeFromCart);
router.post('/coupon', protect, storeController.applyCoupon);
router.post('/checkout', protect, storeController.checkout);
router.post('/purchase-feature', protect, storeController.purchaseFeature);
router.post('/paytabs/callback', storeController.paytabsCallback);
router.get('/paytabs/callback', storeController.paytabsCallback);

module.exports = router;
