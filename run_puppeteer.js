import puppeteer from 'puppeteer';
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  // MOCK a sandboxed iframe environment
  const html = `
    <!DOCTYPE html>
    <html>
    <body>
      <button id="btn">Download</button>
      <script>
        document.getElementById('btn').onclick = () => {
          const a = document.createElement('a');
          a.href = 'data:text/plain;charset=utf-8,Hello';
          a.download = 'test.txt';
          a.click();
          console.log('clicked');
        };
      </script>
    </body>
    </html>
  `;
  
  await page.setContent(html);
  
  // Set download behavior
  const client = await page.target().createCDPSession();
  await client.send('Page.setDownloadBehavior', {
      behavior: 'allow',
      downloadPath: './'
  });
  
  page.on('console', msg => console.log('LOG:', msg.text()));
  
  await page.click('#btn');
  await new Promise(r => setTimeout(r, 1000));
  
  console.log('Done');
  await browser.close();
})();
