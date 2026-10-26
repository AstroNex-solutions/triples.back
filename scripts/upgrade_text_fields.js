const sequelize = require('../config/database');

async function upgrade() {
  try {
    await sequelize.authenticate();
    console.log('Connected to DB. Running migrations...');
    
    // Articles
    await sequelize.query('ALTER TABLE articles MODIFY COLUMN content LONGTEXT;');
    await sequelize.query('ALTER TABLE articles MODIFY COLUMN content_en LONGTEXT;');
    console.log('Articles table upgraded.');

    // TermsAndConditions
    await sequelize.query('ALTER TABLE terms_and_conditions MODIFY COLUMN content LONGTEXT;');
    await sequelize.query('ALTER TABLE terms_and_conditions MODIFY COLUMN content_ar LONGTEXT;');
    console.log('TermsAndConditions table upgraded.');

    // PrivacyPolicy
    await sequelize.query('ALTER TABLE privacy_policies MODIFY COLUMN content LONGTEXT;');
    await sequelize.query('ALTER TABLE privacy_policies MODIFY COLUMN content_ar LONGTEXT;');
    console.log('PrivacyPolicies table upgraded.');

    console.log('All migrations completed successfully.');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    process.exit();
  }
}

upgrade();
