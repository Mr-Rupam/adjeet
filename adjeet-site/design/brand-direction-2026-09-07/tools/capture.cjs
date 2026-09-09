const {chromium}=require('playwright');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const url='http://127.0.0.1:4317';
(async()=>{
 const browser=await chromium.launch({headless:true});
 const report=[];
 for(const theme of ['light','dark']){
  const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(`${url}/reference.html?page=home&theme=${theme}`);await page.evaluate(()=>document.fonts.ready);
  await page.screenshot({path:path.join(root,'boards',`home-${theme}-mobile.png`)});
  await page.screenshot({path:path.join(root,'boards',`home-${theme}-full.png`),fullPage:true,style:'.sticky-enquiry{visibility:hidden!important}'});
  report.push({page:'home',theme,width:390,errors,...await inspect(page)});
  await page.setViewportSize({width:1440,height:1000});await page.waitForTimeout(150);
  await page.screenshot({path:path.join(root,'boards',`home-${theme}-desktop.png`)});
  report.push({page:'home',theme,width:1440,...await inspect(page)});
  await page.close();
 }
 for(const view of ['services','service','work','about','contact','coverage','privacy','material','miniature']){
  const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:2});
  await page.goto(`${url}/reference.html?page=${view}&theme=${['material','miniature'].includes(view)?'dark':'light'}`);await page.evaluate(()=>document.fonts.ready);
  await page.screenshot({path:path.join(root,'boards',`${view}-mobile.png`)});
  await page.screenshot({path:path.join(root,'boards',`${view}-full.png`),fullPage:true,style:'.sticky-enquiry{visibility:hidden!important}'});
  report.push({page:view,width:390,...await inspect(page)});await page.close();
 }
 // Read-only audit of the existing local production preview, if still running.
 const before=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1});
 try{await before.goto('http://127.0.0.1:3002',{timeout:15000});await before.evaluate(()=>document.fonts.ready);await before.screenshot({path:path.join(root,'audit','existing-home-mobile.png')});await before.screenshot({path:path.join(root,'audit','existing-home-full.png'),fullPage:true});report.push({existingPreview:3002,status:'captured'});}catch(e){report.push({existingPreview:3002,status:'unavailable',message:e.message})}
 await before.close();
 fs.writeFileSync(path.join(root,'review-checks.json'),JSON.stringify(report,null,2)+'\n');
 await browser.close();console.log(JSON.stringify(report,null,2));
})();
async function inspect(page){return page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,brokenImages:[...document.images].filter(i=>!i.complete||!i.naturalWidth).map(i=>i.getAttribute('src')),h1:document.querySelector('h1')?.innerText,logoFiles:[...document.querySelectorAll('img[src*="adjeet-original"]')].map(i=>({src:i.getAttribute('src'),ratio:i.naturalWidth/i.naturalHeight}))}))}
