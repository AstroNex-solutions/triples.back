const jwt = require('jsonwebtoken');
const { User, Cart, Wishlist, AccountFreeze, UserSession } = require('../models');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const { Op } = require('sequelize');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const generateTokens = (id) => {
  const jti = uuidv4();
  const accessToken = jwt.sign({ id, jti }, process.env.JWT_SECRET || 'super_secret_jwt_key_lms_2026_antigravity', {
    expiresIn: process.env.JWT_EXPIRES_IN || '6h'
  });
  return { accessToken, jti };
};

exports.register = async (req, res) => {
  try {
    const { username, email, password, name, phone, status } = req.body;

    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) {
      return res.status(400).json({ message: 'البريد الإلكتروني مستخدم بالفعل' });
    }

    const existingUsername = await User.findOne({ where: { username } });
    if (existingUsername) {
      return res.status(400).json({ message: 'اسم المستخدم مستخدم بالفعل' });
    }

    const user = await User.create({
      username,
      email,
      password,
      name: name || username,
      phone,
      status: status || 'Student'
    });

    // Create Cart & Wishlist for user
    await Cart.create({ user_id: user.id });
    await Wishlist.create({ user_id: user.id });
    await AccountFreeze.create({ user_id: user.id });

    const { accessToken, jti } = generateTokens(user.id);

    await UserSession.create({
      user_id: user.id,
      jti,
      ip_address: req.ip || req.connection?.remoteAddress,
      user_agent: req.headers['user-agent'],
      expires_at: new Date(Date.now() + 6 * 60 * 60 * 1000)
    });

    return res.status(201).json({
      message: 'تم إنشاء الحساب بنجاح',
      token: accessToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        status: user.status,
        image_profile: user.image_profile
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'حدث خطأ أثناء التسجيل', error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
    }

    // Check account freeze
    const freezeRecord = await AccountFreeze.findOne({ where: { user_id: user.id } });
    if (freezeRecord && freezeRecord.is_frozen) {
      return res.status(403).json({
        message: 'الحساب مجمد حالياً',
        reason: freezeRecord.freeze_reason
      });
    }

    // Admin 2FA Check
    if (user.status === 'Admin' || user.is_superuser) {
      const code = Math.floor(10000 + Math.random() * 90000).toString(); // 5 digit code
      user.verification_code = code;
      user.verification_expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry
      await user.save();

      try {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: user.email,
          subject: 'رمز التحقق لتسجيل الدخول - Triple S Academy',
          html: `
            <div dir="rtl" style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border: 1px solid #eaebf0;">
              <div style="background-color: #1e1e2d; padding: 30px; text-align: center; border-bottom: 3px solid #4f46e5;">
                <!-- الرجاء تغيير مسار الصورة أدناه برابط شعار الموقع الخاص بكم -->
                <img src="https://triplesacademy.com/logo.png" alt="Triple S Academy Logo" style="max-width: 200px; height: auto;" />
              </div>
              <div style="padding: 40px 30px; background-color: #ffffff;">
                <h2 style="color: #333333; margin-top: 0; font-size: 22px;">أهلاً بك،</h2>
                <p style="color: #555555; font-size: 16px; line-height: 1.8;">لقد طلبت تسجيل الدخول إلى لوحة التحكم الخاصة بك في <strong style="color: #4f46e5;">Triple S Academy</strong>.</p>
                <p style="color: #555555; font-size: 16px; line-height: 1.8;">يرجى استخدام رمز التحقق التالي لإكمال عملية الدخول:</p>
                
                <div style="background-color: #f4f6f9; border-right: 4px solid #4f46e5; border-radius: 6px; padding: 25px; text-align: center; margin: 30px 0;">
                  <h1 style="color: #4f46e5; letter-spacing: 12px; font-size: 42px; margin: 0; font-weight: bold;">${code}</h1>
                </div>
                
                <p style="color: #555555; font-size: 15px; line-height: 1.6;">هذا الرمز صالح لمدة <strong style="color: #e53e3e;">10 دقائق</strong> فقط.</p>
                <p style="color: #888888; font-size: 13px; margin-top: 35px; border-top: 1px solid #eeeeee; padding-top: 20px;">إذا لم تكن أنت من طلب هذا الرمز، يرجى تجاهل هذه الرسالة لحماية حسابك.</p>
              </div>
              <div style="background-color: #f8f9fa; padding: 20px; text-align: center; color: #999999; font-size: 12px; border-top: 1px solid #eaebf0;">
                &copy; ${new Date().getFullYear()} Triple S Academy. جميع الحقوق محفوظة.
              </div>
            </div>
          `
        });
      } catch (emailErr) {
        console.error('Failed to send 2FA email:', emailErr);
        // We continue anyway, the code is printed in console.
      }

      return res.json({ requires2FA: true, email: user.email, message: 'يرجى إدخال كود التحقق المرسل إليك' });
    }

    const { accessToken, jti } = generateTokens(user.id);

    await UserSession.create({
      user_id: user.id,
      jti,
      ip_address: req.ip || req.connection?.remoteAddress,
      user_agent: req.headers['user-agent'],
      expires_at: new Date(Date.now() + 6 * 60 * 60 * 1000)
    });

    return res.json({
      message: 'تم تسجيل الدخول بنجاح',
      token: accessToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        status: user.status,
        image_profile: user.image_profile,
        is_superuser: user.is_superuser
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'حدث خطأ في التسجيل', error: error.message });
  }
};

exports.verify2FA = async (req, res) => {
  try {
    const { email, code } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user || user.verification_code !== code) {
      return res.status(400).json({ message: 'كود التحقق غير صحيح' });
    }

    if (new Date() > new Date(user.verification_expires)) {
      return res.status(400).json({ message: 'كود التحقق منتهي الصلاحية' });
    }

    // Clear verification code
    user.verification_code = null;
    user.verification_expires = null;
    await user.save();

    const { accessToken, jti } = generateTokens(user.id);

    await UserSession.create({
      user_id: user.id,
      jti,
      ip_address: req.ip || req.connection?.remoteAddress,
      user_agent: req.headers['user-agent'],
      expires_at: new Date(Date.now() + 6 * 60 * 60 * 1000)
    });

    return res.json({
      message: 'تم تسجيل الدخول بنجاح',
      token: accessToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        status: user.status,
        image_profile: user.image_profile,
        is_superuser: user.is_superuser
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'حدث خطأ أثناء التحقق', error: error.message });
  }
};

exports.logout = async (req, res) => {
  try {
    const jti = req.user_jti; // We will attach this in auth.middleware
    if (jti) {
      await UserSession.update({ is_active: false }, { where: { jti } });
    }
    return res.json({ message: 'تم تسجيل الخروج بنجاح' });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ أثناء تسجيل الخروج', error: error.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      // Return success even if user not found to prevent email enumeration
      return res.json({ message: 'إذا كان البريد الإلكتروني مسجلاً لدينا، فستتلقى رمزاً لاستعادة كلمة المرور.' });
    }

    const code = Math.floor(10000 + Math.random() * 90000).toString(); // 5 digit code
    user.reset_password_token = code;
    user.reset_password_expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes expiry
    await user.save();

    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: 'رمز استعادة كلمة المرور - Triple S Academy',
        html: `
          <div dir="rtl" style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border: 1px solid #eaebf0;">
            <div style="background-color: #1e1e2d; padding: 30px; text-align: center; border-bottom: 3px solid #4f46e5;">
              <!-- الرجاء تغيير مسار الصورة أدناه برابط شعار الموقع الخاص بكم -->
              <img src="https://triplesacademy.com/logo.png" alt="Triple S Academy Logo" style="max-width: 200px; height: auto;" />
            </div>
            <div style="padding: 40px 30px; background-color: #ffffff;">
              <h2 style="color: #333333; margin-top: 0; font-size: 22px;">أهلاً بك،</h2>
              <p style="color: #555555; font-size: 16px; line-height: 1.8;">لقد طلبت استعادة كلمة المرور لحسابك في <strong style="color: #4f46e5;">Triple S Academy</strong>.</p>
              <p style="color: #555555; font-size: 16px; line-height: 1.8;">يرجى استخدام رمز التحقق التالي لإتمام العملية:</p>
              
              <div style="background-color: #f4f6f9; border-right: 4px solid #4f46e5; border-radius: 6px; padding: 25px; text-align: center; margin: 30px 0;">
                <h1 style="color: #4f46e5; letter-spacing: 12px; font-size: 42px; margin: 0; font-weight: bold;">${code}</h1>
              </div>
              
              <p style="color: #555555; font-size: 15px; line-height: 1.6;">هذا الرمز صالح لمدة <strong style="color: #e53e3e;">15 دقيقة</strong> فقط.</p>
              <p style="color: #888888; font-size: 13px; margin-top: 35px; border-top: 1px solid #eeeeee; padding-top: 20px;">إذا لم تكن أنت من طلب هذا الرمز، يرجى تجاهل هذه الرسالة أو تغيير كلمة المرور فوراً لحماية حسابك.</p>
            </div>
            <div style="background-color: #f8f9fa; padding: 20px; text-align: center; color: #999999; font-size: 12px; border-top: 1px solid #eaebf0;">
              &copy; ${new Date().getFullYear()} Triple S Academy. جميع الحقوق محفوظة.
            </div>
          </div>
        `
      });
    } catch (emailErr) {
      console.error('Failed to send reset email:', emailErr);
    }

    return res.json({ message: 'تم إرسال رمز التحقق إلى بريدك الإلكتروني بنجاح.' });
  } catch (error) {
    return res.status(500).json({ message: 'حدث خطأ أثناء معالجة الطلب', error: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, code, password } = req.body;

    const user = await User.findOne({
      where: {
        email: email,
        reset_password_token: code,
        reset_password_expires: {
          [Op.gt]: new Date()
        }
      }
    });

    if (!user) {
      return res.status(400).json({ message: 'رمز التحقق غير صحيح أو منتهي الصلاحية' });
    }

    user.password = password;
    user.reset_password_token = null;
    user.reset_password_expires = null;
    await user.save();

    return res.json({ message: 'تم إعادة تعيين كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول.' });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ أثناء إعادة تعيين كلمة المرور', error: error.message });
  }
};

// Direct reset — no OTP required, changes password immediately by email
exports.directResetPassword = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'البريد الإلكتروني وكلمة المرور مطلوبان.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل.' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'لا يوجد حساب مرتبط بهذا البريد الإلكتروني.' });
    }

    user.password = password;
    await user.save();

    return res.json({ message: 'تم تغيير كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول.' });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ أثناء تغيير كلمة المرور', error: error.message });
  }
};

exports.getProfile = async (req, res) => {

  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password', 'reset_password_token', 'reset_password_expires'] }
    });
    return res.json({ user });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ في جلب الملف الشخصي', error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: 'المستخدم غير موجود' });

    const fields = ['name', 'phone', 'shortBio', 'detail', 'department', 'qualification', 'github', 'youtube', 'twitter', 'facebook', 'instagram', 'linkedin'];
    fields.forEach(field => {
      if (req.body[field] !== undefined) user[field] = req.body[field];
    });

    if (req.file) {
      user.image_profile = req.file.filename;
    }

    await user.save();
    return res.json({
      message: 'تم تحديث الملف الشخصي بنجاح', user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        status: user.status,
        image_profile: user.image_profile
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'خطأ في التحديث', error: error.message });
  }
};
