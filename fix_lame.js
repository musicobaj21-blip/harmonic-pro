import fs from 'fs';

const html = fs.readFileSync('index.html', 'utf-8');
if (!html.includes('lame.min.js')) {
    const newHtml = html.replace('</head>', '  <script src="https://cdnjs.cloudflare.com/ajax/libs/lamejs/1.2.1/lame.min.js"></script>\n  </head>');
    fs.writeFileSync('index.html', newHtml);
}
