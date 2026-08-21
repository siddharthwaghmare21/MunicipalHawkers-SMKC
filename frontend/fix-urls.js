const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('./src');
let changedFiles = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;
  
  // Replace string literals (single/double quotes) turning them into template literals
  // This handles: fetch('http://localhost:5109/api/...') -> fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5109'}/api/...`)
  content = content.replace(/['"]http:\/\/localhost:5109\/([^'"]*)['"]/g, '`${process.env.NEXT_PUBLIC_BACKEND_URL || \'http://localhost:5109\'}/$1`');
  
  // Replace existing template literals
  // This handles: fetch(`http://localhost:5109/api/hawkers/${id}`) -> fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5109'}/api/hawkers/${id}`)
  content = content.replace(/`http:\/\/localhost:5109\//g, '`${process.env.NEXT_PUBLIC_BACKEND_URL || \'http://localhost:5109\'}/');

  if (content !== originalContent) {
    fs.writeFileSync(file, content);
    changedFiles++;
    console.log('Fixed: ' + file);
  }
});
console.log('Done. Changed ' + changedFiles + ' files.');
