const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, 'notes.json');

// create file if it doesn't exist
if (!fs.existsSync(FILE)) {
  fs.writeFileSync(FILE, JSON.stringify({ notes: [], nextId: 1 }, null, 2));
}

function read() {
  return JSON.parse(fs.readFileSync(FILE, 'utf8'));
}

function write(data) {
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

module.exports = { read, write };
