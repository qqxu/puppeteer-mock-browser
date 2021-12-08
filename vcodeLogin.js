const puppeteer = require('puppeteer-core');
const path = require('path');
const inquirer = require('inquirer');

const inputTypeDelay = 5; // 模拟input的输入延迟,数值越大表示按键间隔时间越长，默认是0,单位是毫秒
const selectorTimeout = 120000; // 选择器被找到的超时时间，数值越大，表示可以等待时间越长，单位毫秒

const mpaasAccount = '';
const url ='https://mpaas.console.aliyun.com/?mpaasWorkspaceId=default&spm=5176.12818093.0.1.488716d0ZZu463#/mpaas/app/mds/nebulatab/ONEX4748791280921/mds/nebulatab';
const shuheAccount = '';
const pwd = '';

const projectName = 'creditweb';
const version = '5.9.35';

(async () => {
  
  const browser = await puppeteer.launch({
    headless: false,

    executablePath: path.resolve('./chrome-mac/Chromium.app/Contents/MacOS/Chromium')
  });
  const page = await browser.newPage();
  await page.goto(url); 
 
  const ramUserLoginBtn = await page.waitForSelector('div.ram-login-text', { timeout: selectorTimeout });
  await ramUserLoginBtn.click();

  // mpaas 输入账号
  const inputName = await page.waitForSelector('input#username', { timeout: selectorTimeout });
  await inputName.type(mpaasAccount, { delay: inputTypeDelay });
  const nextBtn = await page.waitForSelector('button.next-btn', { timeout: selectorTimeout });
  await nextBtn.click();

  // 仍然发送请求
  const confirmSendBtn = await page.waitForSelector('button#proceed-button', { timeout: selectorTimeout });
  await confirmSendBtn.click();

  // 用户名
  const userNameIpt = await page.waitForSelector('input#username', { timeout: selectorTimeout });
  await userNameIpt.type(shuheAccount, { delay: inputTypeDelay });

  const pwdIpt = await page.waitForSelector('input#password', { timeout: selectorTimeout });
  await pwdIpt.type(pwd, { delay: inputTypeDelay });

  const loginBtn = await page.waitForSelector('input#kc-login', { timeout: selectorTimeout });
  await loginBtn.click();

  const { vcode } = await inquirer.prompt([
    {
      type: "input",
      name: "vcode",
      message: "请输入wiki验证码"
    }
  ]);

  // 一次性验证码
  const vcodeInput = await page.waitForSelector('input#totp', { timeout: selectorTimeout });
  await vcodeInput.type(vcode, { delay: inputTypeDelay });

  const vcodeLoginBtn = await page.waitForSelector('input#kc-login', { timeout: selectorTimeout });
  await vcodeLoginBtn.click();
  
  // mpaas 控制台多方块页 
  const card = await page.waitForSelector('div.mpaas-onex-card:nth-of-type(4)', { timeout: selectorTimeout });
  await card.click();

  // 离线包管理 侧边菜单
  const offlinePkgTab = await page.waitForSelector('span[title=离线包管理]', { timeout: selectorTimeout });
  await offlinePkgTab.click();

  // 找到匹配项目的离线包tab
  const pkgTabLi = await h5NameList.$('li.ant-menu-item:nth-of-type(5)', { timeout: selectorTimeout });
  await pkgTabLi.click();

  // 离线包上传按钮 
  const uploadTabBtn = await page.waitForSelector('div.nebula-h5nebulalist-nebula > button.ant-btn-primary', { timeout: selectorTimeout });
  await uploadTabBtn.click();

  // 填写版本号 TODO
  // const versionIpt = await page.waitForSelector('div.nebula-create-form > input[type=text]', { timeout: selectorTimeout });
  // const versionIptOriginValue = await versionIpt.evaluate(node => node.value);

  const uploadFileBtn = await page.waitForSelector('div.ant-upload-select', { timeout: selectorTimeout });
  await uploadFileBtn.click();

  await uploadFileBtn.uploadFile('./zip/sit/20201125.zip');


  const checkbox = await page.waitForSelector('div.nebula-create-footer > input[type=checkbox]', { timeout: selectorTimeout }); 
  await checkbox.click();

  const submitBtn = await page.waitForSelector('div.nebula-create-footer > button.ant-btn-primary', { timeout: selectorTimeout }); 
  await submitBtn.click();

  await page.waitForTimeout(selectorTimeout); // 关闭 创建离线包 的右侧弹窗，等待接口返回刷新表格

  // 灰度发布到此为止！

  // 以下为正式发布，且上传至 gitlab
  // 创建发布
  const operateArea = await page.waitForSelector('.ant-table-tbody .ant-table-row:nth-of-type(1)', { timeout: selectorTimeout });
  const createLink = await operateArea.$('a[href*=packageid]'); // 包含packageid子串的href （创建发布）
  if (!createLink) {
    console.log('创建发布按钮未找到');

    await page.screenshot({ path: path.join(__dirname, 'screenshot/err.png') });
    await browser.close();
    return;
  }
  await createLink.click();


  // 发布页面
  const grayOperate = await page.waitForSelector('.ant-form div:nth-of-type(1)', { timeout: selectorTimeout });

  const allPlatform = await grayOperate.waitForSelector('.ant-radio-group .icon-select:nth-of-type(2)', { timeout: selectorTimeout });
  await allPlatform.click();

  const confirmSubmit = await page.waitForSelector('.ant-form .ant-btn-primary', { timeout: selectorTimeout });
  await confirmSubmit.click(); // 确认发布
  await page.waitForTimeout(selectorTimeout); // 等待接口返回刷新表格


  await page.waitForSelector('div.nebula-h5nebulalist-h5-name', { timeout: selectorTimeout });

  const pkgList = await page.$$('div.nebula-h5nebulalist-h5-name');
  
  // 下载
  const amrLink = await operateArea.$('a[href*=amr]');

  // await browser.close();
})()