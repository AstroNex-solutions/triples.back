const jwt = require('jsonwebtoken');
const { User, UserSession } = require('../models');

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET );
      
      const session = await UserSession.findOne({ where: { jti: decoded.jti, is_active: true } });
      if (!session) {
        return res.status(401).json({ message: 'الجلسة منتهية، يرجى تسجيل الدخول مجدداً' });
      }

      const user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password', 'reset_password_token', 'reset_password_expires'] }
      });

      if (!user) {
        return res.status(401).json({ message: 'المستخدم غير موجود' });
      }

      if (!user.is_active) {
        return res.status(403).json({ message: 'الحساب غير نشط' });
      }

      req.user = user;
      req.user_jti = decoded.jti;
      return next();
    } catch (error) {
      return res.status(401).json({ message: 'رمز المصادقة غير صالح أو منتهي الصلاحية' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'غير مصرح - لم يتم توفير رمز المصادقة' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.status) && !req.user.is_superuser) {
      return res.status(403).json({ message: 'ليس لديك الصلاحية الكافية لتنفيذ هذا الإجراء' });
    }
    next();
  };
};

module.exports = { protect, authorize };
