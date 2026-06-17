const fs = require('fs');
const filePath = 'D:/Antigravity/neuro-it/components/booking/ServiceSelector.tsx';
const persianRegex = /[\u0600-\u06FF\uFB50-\uFDFD\uFE70-\uFEFC]/;

if (fs.existsSync(filePath)) {
  console.log(`Scanning: ${filePath}`);
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, index) => {
    if (persianRegex.test(line)) {
      console.log(`  Line ${index + 1}: ${line.trim()}`);
    }
  });
}
