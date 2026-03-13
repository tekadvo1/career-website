const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '../src');

function findAndReplace(directory) {
  const files = fs.readdirSync(directory);
  files.forEach(file => {
    const fullPath = path.join(directory, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (file !== 'node_modules' && file !== '.git') {
        findAndReplace(fullPath);
      }
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      let modified = false;
      
      // SignIn.tsx & App.tsx
      if (fullPath.includes('SignIn.tsx')) {
         content = content.replace(/if \(data\.user\.lastRoleAnalysis\) \{\s*localStorage\.setItem\('lastRoleAnalysis', JSON\.stringify\(data\.user\.lastRoleAnalysis\)\);\s*\}/g, '');
         modified = true;
      }
      
      if (fullPath.includes('Profile.tsx')) {
         content = content.replace(/const hasRoleAnalysis = !!localStorage\.getItem\('lastRoleAnalysis'\);/g, 'const hasRoleAnalysis = true;');
         modified = true;
      }
      
      fs.writeFileSync(fullPath, content);
      if (modified) console.log('Modified:', fullPath);
    }
  });
}

findAndReplace(dir);
