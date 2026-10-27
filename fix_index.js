import fs from 'fs';
let html = fs.readFileSync('index.html', 'utf-8');
html = html.replace('<script src="https://cdnjs.cloudflare.com/ajax/libs/lamejs/1.2.1/lame.min.js"></script>', '');
html = html.replace('<script src="https://cdn.jsdelivr.net/npm/midi-writer-js@3.2.1/build/browser.min.js"></script>', '');
fs.writeFileSync('index.html', html);
