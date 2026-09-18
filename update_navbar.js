const fs = require('fs');
const file = 'E:\\Company Projects\\kahoot\\client\\src\\components\\Navbar.jsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /<Logo className="h-10 w-auto sm:h-12 sm:w-auto shrink-0 max-w-\[240px\]" \/>/s;
const replacement = '<Logo className="h-[70px] w-[70px] shrink-0" />';

if (regex.test(content)) {
    content = content.replace(regex, replacement);
    fs.writeFileSync(file, content, 'utf8');
    console.log('Successfully updated Navbar.jsx');
} else {
    console.log('Could not find the target string to replace.');
}
