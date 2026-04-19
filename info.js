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
    
    // Check what is imported
    let match = content.match(/import\s*\{([^}]+)\}\s*from\s*['"]@clerk\/clerk-react['"]/);
    if (!match) return;
    
    // Replace import
    let newContent = content.replace(/import\s*\{([^}]+)\}\s*from\s*['"]@clerk\/clerk-react['"];?/g, 'import { useSelector } from "react-redux"');
    
    // Replace const { user } = useUser() -> const { user } = useSelector(state => state.auth)
    newContent = newContent.replace(/const\s*\{\s*user\s*\}\s*=\s*useUser\(\)/g, 'const { user } = useSelector((state) => state.auth)');
    
    // For components asking for organization list
    newContent = newContent.replace(/const\s*\{\s*userMemberships[^\n]*\n/g, '');
    
    if (newContent !== content) {
        fs.writeFileSync(f, newContent, 'utf8');
        console.log('Fixed:', f);
    }
});
