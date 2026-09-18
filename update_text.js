const fs = require('fs');
const path = require('path');

const walk = (dir) => {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach((file) => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.jsx') || file.endsWith('.js') || file.endsWith('.html')) {
            results.push(file);
        }
    });
    return results;
};

const files = walk('E:\\Company Projects\\kahoot\\client\\src');
files.push('E:\\Company Projects\\kahoot\\client\\index.html');

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;

    if (file.endsWith('Navbar.jsx')) {
        // Special replacement for Navbar.jsx branding
        if (content.includes('Quizzy')) {
            content = content.replace(
                /<span[^>]*>\s*Quizzy\s*<\/span>/, 
                (match) => match.replace('Quizzy', 'uizy')
            );
            changed = true;
        }
    }
    
    // Replace remaining Quizzy with Quizy
    if (content.includes('Quizzy')) {
        content = content.replace(/Quizzy/g, 'Quizy');
        changed = true;
    }

    if (changed) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Updated:', file);
    }
});
