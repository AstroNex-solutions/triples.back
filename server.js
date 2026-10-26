const express = require('express');
const cors = require('cors');
const path = require('path');
const compression = require('compression'); // إضافة: لضغط الردود وتقليل حجم البيانات
const helmet = require('helmet'); // إضافة: لحماية العناوين وتحسين الأداء الأمني
require('dotenv').config();

const { sequelize } = require('./models');
const { fixMissingEnrollmentEndDates } = require('./utils/startupScripts');

const app = express();

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: false,
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false,
  frameguard: false
})); 
app.use(compression()); // يقلل حجم الردود (JSON/HTML) بنسبة تصل إلى 70%
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static upload directory with Caching (إضافة الكاش للملفات الثابتة)
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  maxAge: '30d', // إجبار المتصفح على الاحتفاظ بالملفات لمدة 30 يوم
  etag: true
}));

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/courses', require('./routes/course.routes'));
app.use('/api/content', require('./routes/content.routes'));
app.use('/api/assessments', require('./routes/assessment.routes'));
app.use('/api/store', require('./routes/store.routes'));
app.use('/api/extras', require('./routes/extras.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/instructor', require('./routes/instructor.routes'));
app.use('/api/student', require('./routes/student.routes'));

// Root route - Serve nice status page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'welcome.html'));
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'LMS API is running perfectly' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || 'حدث خطأ غير متوقع بالخادم' });
});

const PORT = process.env.PORT ;


// Sync database and start server
async function startServer() {
  try {
    try {
      await sequelize.authenticate();
      console.log('Database connected successfully via Sequelize.');
    } catch (dbErr) {
      console.warn('MySQL connection failed, switching to SQLite fallback mode for smooth testing:', dbErr.message);
      process.env.USE_SQLITE = 'true';
    }

    // لا تقم بعمل sync في بيئة الإنتاج لأنه يبطئ التشغيل وقد يدمر البيانات، استخدم Migrations
    await sequelize.sync({ alter: 0}); 
    console.log('Sequelize models synchronized.');

    // تنفيذ سكريبتات عند بدء التشغيل
    await fixMissingEnrollmentEndDates();

    const server = app.listen(PORT, () => {
      console.log(`🚀 LMS Server is running on port http://localhost:${PORT}`);
    });

    // إضافة: إبقاء الاتصال مفتوحاً لتسريع الطلبات المتتالية (Keep-Alive)
    server.keepAliveTimeout = 61000;
    server.headersTimeout = 65000;

  } catch (error) {
    console.error('Failed to start server:', error);
  }
}

startServer();