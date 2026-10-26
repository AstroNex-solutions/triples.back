const fs = require('fs');
const content = fs.readFileSync('flashcard_patch.js', 'utf8');
fs.appendFileSync('controllers/admin.controller.js', '\n' + content);
console.log('Appended successfully');
