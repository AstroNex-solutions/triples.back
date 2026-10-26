const fs = require('fs');
const bcrypt = require('bcryptjs');
const path = require('path');

const seedFile = fs.readFileSync(path.join(__dirname, 'seedstudent.js'), 'utf-8');
const match = seedFile.match(/const rawData = `([\s\S]*?)`;/);
if(!match) { console.error('Data not found'); process.exit(1); }

const rawData = match[1];
const lines = rawData.split('\n').filter(line => line.trim() !== '');

(async () => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('password123!', salt);
  
  let sql = 'INSERT INTO `users` (uuid, username, name, email, password, phone, status, image_profile, short_bio, detail, department, verification_code, verification_expires, qualification, github, youtube, twitter, facebook, instagram, linkedin, reset_password_token, reset_password_expires, is_superuser, is_active, created_at, updated_at) VALUES\n';
  
  const values = [];
  const seenEmails = new Set();
  
  for (const line of lines) {
    const columns = line.split('\t');
    const status = columns[3];
    const rawEmail = String(columns[1]).trim().toLowerCase();
    
    if (status === 'Student') {
      if (seenEmails.has(rawEmail)) {
        continue;
      }
      seenEmails.add(rawEmail);
      const escape = (val) => {
        if(val === '\\N' || val === undefined || val === null || val === '') return 'NULL';
        return "'" + String(val).replace(/'/g, "''").replace(/\\/g, "\\\\") + "'";
      };
      
      const uuid = columns[13] === '\\N' ? 'UUID()' : "'" + columns[13] + "'";
      const username = escape(columns[1]); // using email as username
      const name = escape(columns[0]);
      const email = escape(columns[1]);
      const pass = "'" + hashedPassword + "'";
      const phone = escape(columns[2]);
      const stat = escape(status);
      const img = escape(columns[4] === '\\N' ? 'blank.png' : columns[4]);
      const bio = escape(columns[5]);
      const detail = escape(columns[6]);
      
      // Additional fields based on User.js model
      const department = 'NULL';
      const verification_code = 'NULL';
      const verification_expires = 'NULL';
      const qualification = 'NULL';
      
      const gh = escape(columns[7]);
      const yt = escape(columns[8]);
      const tw = escape(columns[9]);
      const fb = escape(columns[10]);
      const ig = escape(columns[11]);
      const li = escape(columns[12]);
      
      const reset_password_token = 'NULL';
      const reset_password_expires = 'NULL';
      const is_superuser = 'false';
      const is_active = 'true';
      
      const rawDate = columns[15] ? columns[15].replace('+00', 'Z') : new Date().toISOString();
      const createdAt = "'" + new Date(rawDate).toISOString().slice(0, 19).replace('T', ' ') + "'";
      const updatedAt = createdAt;
      
      values.push(`(${uuid}, ${username}, ${name}, ${email}, ${pass}, ${phone}, ${stat}, ${img}, ${bio}, ${detail}, ${department}, ${verification_code}, ${verification_expires}, ${qualification}, ${gh}, ${yt}, ${tw}, ${fb}, ${ig}, ${li}, ${reset_password_token}, ${reset_password_expires}, ${is_superuser}, ${is_active}, ${createdAt}, ${updatedAt})`);
    }
  }
  
  sql += values.join(',\n') + ';\n';
  fs.writeFileSync(path.join(__dirname, 'students_data.sql'), sql);
  console.log('Successfully generated students_data.sql');
})();
