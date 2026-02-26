const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'client/src/components/ProjectWorkspace.tsx');
let content = fs.readFileSync(file, 'utf8');

// The write_to_file tool literally wrote \` and \$ into the file.
content = content.replace(/\\`/g, "`");
content = content.replace(/\\\$/g, "$");

fs.writeFileSync(file, content);
console.log('Fixed backslashes in ProjectWorkspace.tsx');
