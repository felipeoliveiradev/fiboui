
const fs = require('fs');
const content = fs.readFileSync('src/demo.tsx', 'utf8');

let round = 0, square = 0, curly = 0;
let lines = content.split('\n');

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  const cleanLine = line.replace(/\/\/.*$/, ''); 

  for (let char of cleanLine) {
    if (char === '(') round++;
    if (char === ')') round--;
    if (char === '[') square++;
    if (char === ']') square--;
    if (char === '{') curly++;
    if (char === '}') curly--;
  }
}

console.log(`Round: ${round}, Square: ${square}, Curly: ${curly}`);
if (round !== 0) console.log('Mismatch in parentheses ()');
if (square !== 0) console.log('Mismatch in brackets []');
if (curly !== 0) console.log('Mismatch in braces {}');
