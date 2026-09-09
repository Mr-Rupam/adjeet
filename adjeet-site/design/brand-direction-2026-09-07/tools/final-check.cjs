const {chromium}=require('playwright');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
(async()=>{
 const browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:390,height:844}});
 await page.goto('http://127.0.0.1:4317/reference.html?page=home&theme=light');
 await page.evaluate(()=>document.fonts.ready);
 const duration=await page.locator('.night-layer').evaluate(el=>getComputedStyle(el).transitionDuration);
 const before=await page.locator('.scene-logo').boundingBox();
 await page.locator('#theme').click();
 await page.waitForTimeout(400);
 const midpoint=await page.locator('.night-layer').evaluate(el=>Number(getComputedStyle(el).opacity));
 await page.screenshot({path:path.join(root,'boards','theme-transition-midpoint.png')});
 await page.waitForTimeout(450);
 const end=await page.locator('.night-layer').evaluate(el=>Number(getComputedStyle(el).opacity));
 const after=await page.locator('.scene-logo').boundingBox();
 await page.locator('#theme').click();await page.waitForTimeout(850);
 const reverse=await page.locator('.night-layer').evaluate(el=>Number(getComputedStyle(el).opacity));
 await page.goto('http://127.0.0.1:4317/');
 const links=await page.evaluate(()=>[...new Set([...document.querySelectorAll('a[href]')].map(a=>a.href))]);
 const badLinks=[];
 for(const url of links){const response=await page.request.get(url);if(response.status()!==200)badLinks.push({url,status:response.status()})}
 const report={scope:'Design reference, not production',normalMotion:{duration,midpoint,end,reverse,geometryStable:JSON.stringify(before)===JSON.stringify(after)},reviewLinkCount:links.length,badLinks};
 fs.writeFileSync(path.join(root,'final-checks.json'),JSON.stringify(report,null,2)+'\n');
 await browser.close();console.log(JSON.stringify(report,null,2));
 if(duration!=='0.8s'||end!==1||reverse!==0||badLinks.length)process.exitCode=1;
})();
