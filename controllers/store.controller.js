const { Cart, CartItem, Course, CoursePackage, Coupon, Order, OrderItem, Enrollment, FlashcardProduct, FlashcardAccess } = require('../models');
const axios = require('axios');

exports.getCart = async (req, res) => {
  try {
    let [cart] = await Cart.findOrCreate({
      where: { user_id: req.user.id },
      include: [
        { model: Coupon, as: 'coupon' },
        { 
          model: CartItem, 
          as: 'items',
          include: [
            { model: Course, as: 'course' },
            { model: CoursePackage, as: 'package' },
            { model: FlashcardProduct, as: 'flashcard_product' }
          ]
        }
      ]
    });

    let subtotal = 0;
    if (cart.items) {
      cart.items.forEach(item => {
        if (item.package) {
          subtotal += parseFloat(item.package.price || 0);
        } else if (item.course) {
          subtotal += parseFloat(item.course.discount_price || item.course.price || 0);
        } else if (item.flashcard_product) {
          subtotal += parseFloat(item.flashcard_product.price || 0);
        }
      });
    }

    let discount = 0;
    if (cart.coupon) {
      if (cart.coupon.discount_type === 'percentage') {
        discount = (subtotal * parseFloat(cart.coupon.discount_value)) / 100;
      } else {
        discount = parseFloat(cart.coupon.discount_value);
      }
    }

    const total = Math.max(0, subtotal - discount);

    return res.json({ cart, subtotal, discount, total });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ في جلب السلة', error: error.message });
  }
};

// ═══════════════════════════════════════════
//  FLASHCARDS
// ═══════════════════════════════════════════
exports.getFlashcardsForStore = async (req, res) => {
  try {
    const products = await FlashcardProduct.findAll({
      where: { is_active: true }
    });
    return res.json({ products });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const { course_id, flashcard_product_id, package_id } = req.body;
    
    if (!course_id && !flashcard_product_id) {
      return res.status(400).json({ message: 'يجب تحديد دورة أو منتج فلاش كارد' });
    }

    if (course_id && !package_id) {
      // Check if already enrolled (if they aren't buying a package, fallback to old logic)
      const existingEnrollment = await Enrollment.findOne({
        where: { user_id: req.user.id, course_id, status: 'active' }
      });
      if (existingEnrollment) {
        return res.status(400).json({ message: 'أنت مشترك في هذه الدورة بالفعل' });
      }
    }

    if (flashcard_product_id) {
      // Check if already purchased
      const existingAccess = await FlashcardAccess.findOne({
        where: { user_id: req.user.id, product_id: flashcard_product_id }
      });
      if (existingAccess) {
        return res.status(400).json({ message: 'لقد قمت بشراء هذا المنتج مسبقاً' });
      }
    }

    let [cart] = await Cart.findOrCreate({ where: { user_id: req.user.id } });

    const whereClause = { cart_id: cart.id };
    if (course_id) whereClause.course_id = course_id;
    if (package_id) whereClause.package_id = package_id;
    if (flashcard_product_id) whereClause.flashcard_product_id = flashcard_product_id;
    if (feature_type) whereClause.feature_type = feature_type;

    const [item, created] = await CartItem.findOrCreate({
      where: whereClause,
      defaults: { quantity: 1 }
    });

    if (!created) {
      return res.status(400).json({ message: 'العنصر موجود بالفعل في السلة' });
    }

    return res.status(201).json({ message: 'تمت الإضافة إلى السلة بنجاح', item });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ في الإضافة للسلة', error: error.message });
  }
};

exports.removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;
    
    // Find the user's cart
    const cart = await Cart.findOne({ where: { user_id: req.user.id } });
    if (!cart) {
      return res.status(404).json({ message: 'السلة غير موجودة' });
    }

    // Find and delete the cart item that belongs to this cart
    const item = await CartItem.findOne({ 
      where: { 
        id: itemId,
        cart_id: cart.id 
      } 
    });

    if (!item) {
      return res.status(404).json({ message: 'العنصر غير موجود في السلة' });
    }

    await item.destroy();
    return res.json({ message: 'تم إزالة العنصر من السلة بنجاح' });
  } catch (error) {
    return res.status(500).json({ message: 'حدث خطأ أثناء إزالة العنصر', error: error.message });
  }
};

exports.applyCoupon = async (req, res) => {
  try {
    const { code } = req.body;
    const coupon = await Coupon.findOne({ where: { code, is_active: true } });

    if (!coupon) {
      return res.status(404).json({ message: 'كوبون الخصم غير صالح أو منتهي الصلاحية' });
    }

    let cart = await Cart.findOne({ where: { user_id: req.user.id } });
    if (cart) {
      cart.coupon_id = coupon.id;
      await cart.save();
    }

    return res.json({ message: 'تم تطبيق الكوبون بنجاح', coupon });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ في تطبيق الكوبون', error: error.message });
  }
};

exports.checkout = async (req, res) => {
  try {
    const { payment_method, billing_name, billing_email, billing_address } = req.body;
    const userId = req.user.id;

    const cart = await Cart.findOne({
      where: { user_id: userId },
      include: [
        { 
          model: CartItem, 
          as: 'items', 
          include: [
            { model: Course, as: 'course' },
            { model: CoursePackage, as: 'package' },
            { model: FlashcardProduct, as: 'flashcard_product' }
          ] 
        }
      ]
    });

    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({ message: 'السلة فارغة' });
    }

    let total = 0;
    
    // Check for existing enrollments before checkout
    for (const item of cart.items) {
      if (item.course_id && !item.package_id) {
        const existingEnrollment = await Enrollment.findOne({
          where: { user_id: userId, course_id: item.course_id, status: 'active' }
        });
        if (existingEnrollment) {
          return res.status(400).json({ message: `أنت مشترك بالفعل في الدورة: ${item.course.title}` });
        }
      }

      if (item.package_id) {
        // If they already have an enrollment, we might upgrade them, but for now just add the price
        total += parseFloat(item.package.price || 0);
      } else if (item.course_id) {
        total += parseFloat(item.course.discount_price || item.course.price || 0);
      } else if (item.flashcard_product_id) {
        const existingAccess = await FlashcardAccess.findOne({
          where: { user_id: userId, product_id: item.flashcard_product_id }
        });
        if (existingAccess) {
          return res.status(400).json({ message: `لقد قمت بشراء: ${item.flashcard_product.title}` });
        }
        total += parseFloat(item.flashcard_product.price || 0);
      }
    }

    const orderNumber = 'ORD-' + Date.now();
    const order = await Order.create({
      user_id: userId,
      order_number: orderNumber,
      status: 'pending',
      payment_method: payment_method || 'paytabs',
      subtotal: total,
      total: total,
      payment_id: 'PAY-' + Math.floor(Math.random() * 1000000),
      billing_email: billing_email || req.user.email,
      billing_name: billing_name || req.user.name,
      billing_address: billing_address || 'العنوان الافتراضي'
    });

    // Create OrderItems
    for (const item of cart.items) {
      let price = 0;
      if (item.package_id) price = item.package.price || 0;
      else if (item.course_id) price = item.course.discount_price || item.course.price || 0;
      else if (item.flashcard_product_id) price = item.flashcard_product.price || 0;

      await OrderItem.create({
        order_id: order.id,
        course_id: item.course_id || null,
        package_id: item.package_id || null,
        flashcard_product_id: item.flashcard_product_id || null,
        price: price
      });
    }

    // Call PayTabs API to generate payment link
    const paytabsPayload = {
      profile_id: process.env.PAYTABS_PROFILE_ID || '183439',
      tran_type: 'sale',
      tran_class: 'ecom',
      cart_id: orderNumber,
      cart_description: 'شراء دورات تدريبية',
      cart_currency: 'JOD',
      cart_amount: total,
      callback: `${process.env.API_URL || 'http://localhost:4500'}/api/store/paytabs/callback`,
      return: `${process.env.API_URL || 'http://localhost:4500'}/api/store/paytabs/callback`,
      customer_details: {
        name: billing_name || req.user.name,
        email: billing_email || req.user.email,
        street1: billing_address || 'Amman',
        city: 'Amman',
        state: 'AM',
        country: 'JO',
        ip: req.ip || '127.0.0.1'
      }
    };

    try {
      const paytabsResponse = await axios.post('https://secure-jordan.paytabs.com/payment/request', paytabsPayload, {
        headers: {
          'authorization': process.env.PAYTABS_SERVER_KEY || 'YOUR_SERVER_KEY_HERE',
          'content-type': 'application/json'
        }
      });

      if (paytabsResponse.data && paytabsResponse.data.redirect_url) {
        return res.status(201).json({ 
          message: 'جاري توجيهك لصفحة الدفع...', 
          redirect_url: paytabsResponse.data.redirect_url 
        });
      } else {
        throw new Error('لم يتم إرجاع رابط الدفع من بوابة الدفع');
      }
    } catch (paymentError) {
      console.error('PayTabs Error:', paymentError.response?.data || paymentError.message);
      return res.status(500).json({ message: 'فشل الاتصال ببوابة الدفع', error: paymentError.message });
    }

  } catch (error) {
    return res.status(500).json({ message: 'خطأ في عملية السداد', error: error.message });
  }
};

const crypto = require('crypto');

exports.paytabsCallback = async (req, res) => {
  try {
    // Both GET and POST could contain the data, but PayTabs typically sends POST
    const payload = req.method === 'POST' ? req.body : req.query;

    if (!payload || Object.keys(payload).length === 0) {
      return res.status(400).send('No payload');
    }

    const requestSignature = payload.signature;
    if (!requestSignature) {
      // If no signature, this might be a direct user visit without payment info
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      return res.redirect(`${frontendUrl}/dashboard`);
    }

    // Verify signature
    const serverKey = process.env.PAYTABS_SERVER_KEY || 'YOUR_SERVER_KEY_HERE';
    
    // Create a copy of the payload to filter and sort
    const signatureFields = { ...payload };
    delete signatureFields.signature;

    // Remove empty values
    Object.keys(signatureFields).forEach(key => {
      if (signatureFields[key] === '' || signatureFields[key] === null || signatureFields[key] === undefined) {
        delete signatureFields[key];
      }
    });

    // Sort keys alphabetically
    const sortedKeys = Object.keys(signatureFields).sort();
    
    // Build query string
    const queryParams = new URLSearchParams();
    for (const key of sortedKeys) {
      queryParams.append(key, signatureFields[key]);
    }
    // PayTabs requires URL encoded format but without + for spaces, use %20
    const queryString = queryParams.toString().replace(/\+/g, '%20');

    // Generate signature
    const signature = crypto.createHmac('sha256', serverKey)
                            .update(queryString)
                            .digest('hex');

    // PayTabs says: compare the generated signature with the request signature
    // Since we don't have a real server key to test, we'll allow it for now or check strictly.
    // Let's do strict check but allow bypass in dev if needed.
    const isValid = (signature === requestSignature);

    const cartId = payload.cartId;
    const respStatus = payload.respStatus;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    if (isValid && respStatus === 'A') {
      // Payment authorized!
      const order = await Order.findOne({ where: { order_number: cartId } });
      
      if (order && order.status !== 'completed') {
        order.status = 'completed';
        order.payment_id = payload.tranRef || order.payment_id;
        await order.save();

        // Create enrollments or access for the user
        const orderItems = await OrderItem.findAll({ where: { order_id: order.id } });
        for (const item of orderItems) {
          const startDate = new Date();
          const endDate = new Date(startDate);
          endDate.setFullYear(endDate.getFullYear() + 1);

          if (item.package_id) {
            const pkg = await CoursePackage.findByPk(item.package_id);
            if (pkg) {
              if (pkg.includes_course_content) {
                await Enrollment.findOrCreate({
                  where: { user_id: order.user_id, course_id: pkg.course_id },
                  defaults: { 
                    status: 'active', 
                    is_paid: true, 
                    payment_amount: item.price, 
                    enrollment_date: startDate, 
                    start_date: startDate, 
                    end_date: endDate,
                    has_flashcards: pkg.includes_flashcards || false,
                    has_qbank: pkg.includes_question_banks || false,
                    has_self_assessment: pkg.includes_self_assessments || false
                  }
                });
              }
              if (pkg.includes_flashcards) {
                const flashcards = await FlashcardProduct.findAll({ where: { course_id: pkg.course_id } });
                for (const fc of flashcards) {
                  await FlashcardAccess.findOrCreate({ where: { user_id: order.user_id, product_id: fc.id } });
                }
              }
              // Can add question_banks and self_assessments logic here similarly
            }
          } else if (item.course_id && item.feature_type) {
            // Unlock specific feature for course
            const enrollment = await Enrollment.findOne({ where: { user_id: order.user_id, course_id: item.course_id } });
            if (enrollment) {
               if (item.feature_type === 'flashcards') enrollment.has_flashcards = true;
               if (item.feature_type === 'qbank') enrollment.has_qbank = true;
               if (item.feature_type === 'selfAssessment') enrollment.has_self_assessment = true;
               await enrollment.save();
            }
          } else if (item.course_id) {
            await Enrollment.findOrCreate({
              where: { user_id: order.user_id, course_id: item.course_id },
              defaults: { 
                status: 'active', 
                is_paid: true, 
                payment_amount: item.price,
                enrollment_date: startDate,
                start_date: startDate,
                end_date: endDate
              }
            });
          } else if (item.flashcard_product_id) {
            await FlashcardAccess.findOrCreate({
              where: { user_id: order.user_id, product_id: item.flashcard_product_id }
            });
          }
        }
      }
      
      // Redirect to frontend success
      return res.redirect(`${frontendUrl}/payment-result?status=success`);
    } else {
      // Payment failed or invalid signature
      const order = await Order.findOne({ where: { order_number: cartId } });
      if (order && order.status !== 'paid') {
        order.status = 'cancelled';
        await order.save();
      }
      return res.redirect(`${frontendUrl}/payment-result?status=failed`);
    }

  } catch (error) {
    console.error('PayTabs Callback Error:', error);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    return res.redirect(`${frontendUrl}/payment-result?status=error`);
  }
};

exports.purchaseFeature = async (req, res) => {
  try {
    const { course_id, feature_type } = req.body;
    
    if (!course_id || !feature_type) {
      return res.status(400).json({ message: 'Course ID and Feature Type are required' });
    }

    const { Enrollment, Course, Order, OrderItem } = require('../models');
    
    const enrollment = await Enrollment.findOne({
      where: { user_id: req.user.id, course_id, status: 'active' }
    });

    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found or inactive.' });
    }

    const course = await Course.findByPk(course_id);
    let price = 0;
    let description = 'شراء ميزة';

    if (feature_type === 'flashcards') {
      price = parseFloat(course.flashcard_price || 0);
      description = `شراء فلاش كارد لكورس ${course.title}`;
    } else if (feature_type === 'qbank') {
      price = parseFloat(course.qbank_price || 0);
      description = `شراء بنك أسئلة لكورس ${course.title}`;
    } else if (feature_type === 'selfAssessment') {
      price = parseFloat(course.self_assessment_price || 0);
      description = `شراء تقييم ذاتي لكورس ${course.title}`;
    } else {
      return res.status(400).json({ message: 'Invalid feature type' });
    }

    if (price <= 0) {
      // Free feature, unlock immediately
      if (feature_type === 'flashcards') enrollment.has_flashcards = true;
      if (feature_type === 'qbank') enrollment.has_qbank = true;
      if (feature_type === 'selfAssessment') enrollment.has_self_assessment = true;
      await enrollment.save();
      return res.status(200).json({ message: 'Feature unlocked successfully', success: true });
    }

    // Create Order
    const orderNumber = 'FEAT-' + Date.now();
    const order = await Order.create({
      user_id: req.user.id,
      order_number: orderNumber,
      status: 'pending',
      payment_method: 'paytabs',
      subtotal: price,
      total: price,
      payment_id: 'PAY-' + Math.floor(Math.random() * 1000000),
      billing_email: req.user.email,
      billing_name: req.user.name,
      billing_address: 'العنوان الافتراضي'
    });

    await OrderItem.create({
      order_id: order.id,
      course_id: course_id,
      feature_type: feature_type,
      price: price
    });

    const axios = require('axios');
    const paytabsPayload = {
      profile_id: process.env.PAYTABS_PROFILE_ID || '183439',
      tran_type: 'sale',
      tran_class: 'ecom',
      cart_id: orderNumber,
      cart_description: description,
      cart_currency: 'JOD',
      cart_amount: price,
      callback: `${process.env.API_URL || 'http://localhost:4500'}/api/store/paytabs/callback`,
      return: `${process.env.API_URL || 'http://localhost:4500'}/api/store/paytabs/callback`,
      customer_details: {
        name: req.user.name,
        email: req.user.email,
        street1: 'Amman',
        city: 'Amman',
        state: 'AM',
        country: 'JO',
        ip: req.ip || '127.0.0.1'
      }
    };

    const paytabsResponse = await axios.post('https://secure-jordan.paytabs.com/payment/request', paytabsPayload, {
      headers: {
        'authorization': process.env.PAYTABS_SERVER_KEY || 'YOUR_SERVER_KEY_HERE',
        'content-type': 'application/json'
      }
    });

    if (paytabsResponse.data && paytabsResponse.data.redirect_url) {
      return res.status(201).json({ 
        message: 'جاري توجيهك لصفحة الدفع...', 
        payment_url: paytabsResponse.data.redirect_url 
      });
    } else {
      throw new Error('لم يتم إرجاع رابط الدفع من بوابة الدفع');
    }
  } catch (error) {
    console.error('Purchase Feature Error:', error.response?.data || error.message);
    return res.status(500).json({ message: 'Error processing purchase', error: error.message });
  }
};
