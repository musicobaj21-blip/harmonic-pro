import fs from 'fs';

let html = fs.readFileSync('index.html', 'utf-8');
if (!html.includes('midiwriter')) {
    html = html.replace('</head>', '  <script src="https://cdn.jsdelivr.net/npm/midi-writer-js@3.2.1/build/browser.min.js"></script>\n  </head>');
    fs.writeFileSync('index.html', html);
}
