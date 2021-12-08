const puppeteer = require('puppeteer-core');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    executablePath: path.resolve('./chrome-mac/Chromium.app/Contents/MacOS/Chromium')
  });
  const page = await browser.newPage();
  await page.goto('http://www.baidu.com/');
  await page.screenshot({ path: path.join(__dirname, 'screenshot/baidu.png') });
  await browser.close();
})()