const puppeteer = require('puppeteer-core');
const path = require('path');

const url ='https://www.baidu.com/';

(async () => {
  
  const browser = await puppeteer.launch({
    headless: false,

    executablePath: path.resolve('./chrome-mac/Chromium.app/Contents/MacOS/Chromium')
  });
  const page = await browser.newPage();
  await page.goto(url); 

  // 找到list
  const list = await page.$$('.s-bottom-layer-content > p'); 

  // 获取所有list的innerText
  const allTxt = await Promise.all(list.map(async (itm) => {
    return await itm.$eval('.text-color', node => node.innerText);
  }));

  // 涉及到异步函数，不能直接使用find 或filer
  const selectedIdx = allTxt.findIndex(ele => ele === '帮助中心');
  const selectedEle = list[selectedIdx];
  await selectedEle.click(); 

  await page.screenshot({ path: path.join(__dirname, 'screenshot/help1.png') });

  await browser.close();
})()

