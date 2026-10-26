const { Enrollment } = require('./models');
const { Op } = require('sequelize');

async function updateEnrollments() {
  try {
    const enrollments = await Enrollment.findAll({
      where: {
        end_date: null
      }
    });

    console.log(`Found ${enrollments.length} enrollments without end_date.`);
    let updated = 0;

    for (const enrollment of enrollments) {
      const startDate = enrollment.enrollment_date || enrollment.createdAt || new Date();
      const endDate = new Date(startDate);
      endDate.setFullYear(endDate.getFullYear() + 1);
      
      enrollment.end_date = endDate;
      await enrollment.save();
      updated++;
    }

    console.log(`Successfully updated ${updated} enrollments with 1 year expiration.`);
    process.exit(0);
  } catch (error) {
    console.error('Error updating enrollments:', error);
    process.exit(1);
  }
}

updateEnrollments();
