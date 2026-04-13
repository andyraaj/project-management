const fs = require('fs');

const files = [
  './client/src/pages/TaskDetails.jsx',
  './client/src/pages/Settings.jsx',
  './client/src/components/WorkspaceDropdown.jsx',
  './client/src/components/Sidebar.jsx',
  './client/src/components/ProjectTasks.jsx',
  './client/src/components/ProjectSettings.jsx',
  './client/src/components/InviteMemberDialog.jsx',
  './client/src/components/CreateTaskDialog.jsx',
  './client/src/components/CreateProjectDialog.jsx',
  './client/src/components/AddProjectMember.jsx'
];

files.forEach(f => {
    let content = fs.readFileSync(f, 'utf8');
    
    // We remove all `import { useSelector } from "react-redux"` lines
    let newContent = content.replace(/import\s*\{\s*useSelector\s*\}\s*from\s*['"]react-redux['"];?\n?/g, '');
    
    // Then we add exactly ONE at the top.
    newContent = 'import { useSelector } from "react-redux";\n' + newContent;
    
    if (newContent !== content) {
        fs.writeFileSync(f, newContent, 'utf8');
        console.log('Fixed imports:', f);
    }
});
