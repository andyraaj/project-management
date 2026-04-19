const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

walkDir('./client/src', function(f) {
    if (!f.endsWith('.jsx')) return;
    
    let content = fs.readFileSync(f, 'utf8');
    let original = content;
    
    // Quick and dirty: if we find `useSelector` inside another import like `import { useDispatch, useSelector }`
    // and we ALSO find `import { useSelector } from "react-redux"`, remove the standalone one.
    
    let hasCompound = content.match(/import\s*\{[^}]*useSelector[^}]*\}\s*from\s*['"]react-redux['"]/);
    if (hasCompound && hasCompound[0].includes('useDispatch')) {
        content = content.replace(/import\s*\{\s*useSelector\s*\}\s*from\s*['"]react-redux['"];?\n?/g, '');
    } else {
        // if there are multiple standalone imports
        let standalones = content.match(/import\s*\{\s*useSelector\s*\}\s*from\s*['"]react-redux['"];?\n?/g);
        if (standalones && standalones.length > 1) {
            content = content.replace(/import\s*\{\s*useSelector\s*\}\s*from\s*['"]react-redux['"];?\n?/g, '');
            content = 'import { useSelector } from "react-redux";\n' + content;
        }
    }
    
    // also remove getToken instances
    content = content.replace(/const\s*\{\s*getToken\s*\}\s*=\s*useAuth\(\);?\n?/g, '');
    content = content.replace(/,\s*\{\s*headers:\s*\{\s*Authorization:\s*`Bearer[^`]+`\s*\}\s*\}/g, '');
    
    if (content !== original) {
        fs.writeFileSync(f, content, 'utf8');
        console.log('Fixed', f);
    }
});
