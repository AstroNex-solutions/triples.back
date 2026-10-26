const { Op } = require('sequelize');
const { Enrollment } = require('../models');

/**
 * Ensures all enrollments have an end_date.
 * If end_date is null, it is set to enrollment_date + 1 year.
 * This runs automatically on server startup.
 */
async function fixMissingEnrollmentEndDates() {
  try {
    const enrollments = await Enrollment.findAll({
      where: {
        end_date: null
      }
    });

    if (enrollments.length === 0) {
      console.log('✅ All student enrollments already have an expiration date.');
      return;
    }

    let updatedCount = 0;
    for (const enrollment of enrollments) {
      const baseDate = enrollment.enrollment_date || enrollment.createdAt || new Date();
      // Add 1 year to the base date
      const newEndDate = new Date(baseDate);
      newEndDate.setFullYear(newEndDate.getFullYear() + 1);

      await enrollment.update({ end_date: newEndDate });
      updatedCount++;
    }

    console.log(`✅ Successfully updated ${updatedCount} student enrollments with a 1-year expiration date.`);
  } catch (error) {
    console.error('❌ Error fixing missing enrollment end dates:', error);
  }
}

module.exports = {
  fixMissingEnrollmentEndDates
};
