const { Article, Book, Banner, ContactMessage, Partnership, Testimonial, RefundingFAQ, TermsAndConditions, PrivacyPolicy, ContactInfo, AboutUs, CourseReview, User, Course } = require('../models');

exports.getArticles = async (req, res) => {
  try {
    const articles = await Article.findAll({
      where: { status: 'published' },
      order: [['createdAt', 'DESC']]
    });
    return res.json({ articles });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ في جلب المقالات', error: error.message });
  }
};

exports.getBooks = async (req, res) => {
  try {
    const books = await Book.findAll({
      where: { is_available: true },
      order: [['createdAt', 'DESC']]
    });
    return res.json({ books });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ في جلب الكتب', error: error.message });
  }
};

exports.getBanners = async (req, res) => {
  try {
    const banners = await Banner.findAll({
      where: { is_active: true },
      order: [['display_order', 'ASC']]
    });
    return res.json({ banners });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ في جلب البانرات', error: error.message });
  }
};

exports.getPartnerships = async (req, res) => {
  try {
    const partners = await Partnership.findAll({
      where: { is_active: true },
      order: [['display_order', 'ASC']]
    });
    return res.json({ partners });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ في جلب الشركاء', error: error.message });
  }
};

exports.sendContactMessage = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    const msg = await ContactMessage.create({
      name,
      email,
      phone,
      subject,
      message,
      status: 'new'
    });
    return res.status(201).json({ message: 'تم إرسال رسالتك بنجاح وسنقوم بالتواصل معك قريباً', contact: msg });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ في إرسال الرسالة', error: error.message });
  }
};

exports.getTestimonials = async (req, res) => {
  try {
    const items = await CourseReview.findAll({ 
      where: { is_approved: true }, 
      order: [['createdAt', 'DESC']],
      limit: 10,
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'image_profile'] },
        { model: Course, attributes: ['id', 'title'] }
      ]
    });
    return res.json({ testimonials: items });
  } catch (error) { return res.status(500).json({ message: 'Error', error: error.message }); }
};

exports.getFaqs = async (req, res) => {
  try {
    const faqs = await RefundingFAQ.findAll({ where: { is_active: true }, order: [['display_order', 'ASC']] });
    return res.json({ faqs });
  } catch (error) { return res.status(500).json({ error: error.message }); }
};

exports.getTerms = async (req, res) => {
  try {
    const terms = await TermsAndConditions.findOne({ where: { is_active: true } });
    return res.json({ terms });
  } catch (error) { return res.status(500).json({ error: error.message }); }
};

exports.getPrivacy = async (req, res) => {
  try {
    const privacy = await PrivacyPolicy.findOne({ where: { is_active: true } });
    return res.json({ privacy });
  } catch (error) { return res.status(500).json({ error: error.message }); }
};

exports.getAboutUs = async (req, res) => {
  try {
    const aboutUs = await AboutUs.findOne({ where: { is_active: true } });
    return res.json({ aboutUs });
  } catch (error) { return res.status(500).json({ error: error.message }); }
};

exports.getContactInfo = async (req, res) => {
  try {
    const info = await ContactInfo.findOne({ where: { is_active: true } });
    return res.json({ info });
  } catch (error) { return res.status(500).json({ error: error.message }); }
};
