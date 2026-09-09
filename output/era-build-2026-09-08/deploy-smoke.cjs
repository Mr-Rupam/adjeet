const {createRequire}=require('node:module');
const fs=require('node:fs');
const {chromium}=createRequire('C:/Users/KIIT0001/Downloads/AD_JEET/.superpowers/worktrees/era-build/adjeet-site/package.json')('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:1440,height:900},reducedMotion:'reduce'});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const report={url:'https://adjeet.vercel.app',routes:[],errors};
 try{
  for(const route of ['/','/services','/portfolio','/about','/contact','/privacy']){
   const start=Date.now();const response=await page.goto(report.url+route,{waitUntil:'networkidle',timeout:60000});
   const h1=await page.locator('h1').allTextContents();
   report.routes.push({route,status:response.status(),h1,ms:Date.now()-start});
   if(response.status()!==200||h1.length!==1)throw Error('Route failed: '+route);
  }
  await page.goto(report.url,{waitUntil:'networkidle'});
  await page.locator('[data-hero-scene]').waitFor();
  await page.screenshot({path:__dirname+'/deployed-desktop.png'});
  await page.setViewportSize({width:390,height:844});
  await page.screenshot({path:__dirname+'/deployed-mobile.png'});
  report.overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
  for(const asset of ['/hero/workshop/day.webp','/hero/workshop/night.webp','/hero/workshop/day-to-night.mp4','/hero/workshop/night-to-day.mp4','/brand/adjeet-original.png']){
   const r=await page.request.head(report.url+asset);if(r.status()!==200)throw Error('Asset failed '+asset);
  }
  if(errors.length||report.overflow)throw Error('Browser errors or mobile overflow');
  report.pass=true;
 }catch(e){report.failure=e.message;process.exitCode=1}
 finally{fs.writeFileSync(__dirname+'/deployment-verification.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));await browser.close()}
})();
