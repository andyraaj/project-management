const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

walkDir('./client/src', function(filePath) {
    if (!filePath.endsWith('.jsx') && !filePath.endsWith('.js')) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    // Replace Clerk import with Redux import
    content = content.replace(/import\s*\{\s*useUser\s*\}\s*from\s*['"]@clerk\/clerk-react['"];?/g, 'import { useSelector } from "react-redux"');
    
    // Replace hook usage with useSelector
    content = content.replace(/const\s*\{\s*user\s*\}\s*=\s*useUser\(\)/g, 'const { user } = useSelector((state) => state.auth)');
    
    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Fixed', filePath);
    }
});
