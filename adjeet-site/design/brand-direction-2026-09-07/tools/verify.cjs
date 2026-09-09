const {chromium}=require('playwright');
const sharp=require('sharp');
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const base='http://127.0.0.1:4317';
const linear=c=>c<=.04045?c/12.92:((c+.055)/1.055)**2.4;
const luminance=rgb=>{const [r,g,b]=rgb.map(v=>linear(v/255));return .2126*r+.7152*g+.0722*b};
const ratio=(a,b)=>{const [lo,hi]=[luminance(a),luminance(b)].sort((x,y)=>x-y);return(hi+.05)/(lo+.05)};
(async()=>{
 const browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
 const results={scope:'Design reference only',layouts:[],interactions:{},photographicContrast:[],errors:[]};
 page.on('pageerror',e=>results.errors.push(e.message));
 for(const view of ['home','services','service','work','about','contact','coverage','privacy']){
  await page.goto(base+'/reference.html?page='+view);await page.evaluate(()=>document.fonts.ready);
  for(const theme of ['light','dark']){
   await page.evaluate(t=>document.documentElement.dataset.theme=t,theme);
   for(const width of [320,360,390,430,768,1024,1440]){
    await page.setViewportSize({width,height:844});
    await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
    const data=await page.evaluate(()=>{
     const distorted=[...document.querySelectorAll('img[src*="adjeet-original"]')].filter(i=>{const b=i.getBoundingClientRect(),s=getComputedStyle(i);const w=b.width-parseFloat(s.paddingLeft)-parseFloat(s.paddingRight),h=b.height-parseFloat(s.paddingTop)-parseFloat(s.paddingBottom);return Math.abs(w/h-586/175)>.034}).map(i=>i.className);
     return {overflow:document.documentElement.scrollWidth>innerWidth,distortedLogos:distorted,brokenImages:[...document.images].filter(i=>i.complete&&!i.naturalWidth).map(i=>i.src),heroCtaVisible:document.querySelector('.hero-copy .button')?document.querySelector('.hero-copy .button').getBoundingClientRect().bottom<=innerHeight:null};
    });
    results.layouts.push({view,theme,width,...data});
   }
  }
 }
 await page.setViewportSize({width:390,height:844});
 await page.goto(base+'/reference.html?page=home&theme=light');await page.evaluate(()=>document.fonts.ready);
 const before=await page.locator('.scene-logo').boundingBox();
 await page.locator('#theme').click();
 results.interactions.theme=await page.evaluate(()=>({theme:document.documentElement.dataset.theme,opacity:getComputedStyle(document.querySelector('.night-layer')).opacity,reducedMotionDuration:getComputedStyle(document.querySelector('.night-layer')).transitionDuration}));
 const after=await page.locator('.scene-logo').boundingBox();
 results.interactions.logoGeometryStable=JSON.stringify(before)===JSON.stringify(after);
 await page.locator('#menu').click();results.interactions.menuOpens=await page.locator('#menu-panel').isVisible();await page.keyboard.press('Escape');results.interactions.escapeClosesMenu=!(await page.locator('#menu-panel').isVisible());
 await page.goto(base+'/reference.html?page=work');await page.locator('[data-value="vehicles"]').click();results.interactions.portfolioVehicleCount=await page.locator('.work-grid .project:visible').count();
 const posts=[];page.on('request',r=>{if(r.method()==='POST')posts.push(r.url())});
 await page.goto(base+'/reference.html?page=contact');await page.locator('button[type="submit"]').click();results.interactions.previewConfirmation=await page.locator('#form-notice').isVisible();results.interactions.postRequests=posts;
 for(const width of [320,390,1440])for(const theme of ['light','dark']){
  await page.setViewportSize({width,height:844});await page.goto(base+'/reference.html?page=home&theme='+theme);await page.evaluate(()=>document.fonts.ready);
  const targets=await page.evaluate(()=>['.hero-copy .eyebrow','.hero-copy h1','.hero-copy .lead'].map(s=>{const b=document.querySelector(s).getBoundingClientRect();return {selector:s,x:b.x,y:b.y,width:b.width,height:b.height}}));
  await page.addStyleTag({content:'.hero-copy{visibility:hidden!important}'});
  const buffer=await page.screenshot();const {data,info}=await sharp(buffer).removeAlpha().raw().toBuffer({resolveWithObject:true});
  for(const t of targets){let min=100;const text=theme==='dark'?[229,239,240]:[18,51,59];for(let y=Math.max(0,Math.ceil(t.y));y<Math.min(info.height,t.y+t.height);y+=3)for(let x=Math.max(0,Math.ceil(t.x));x<Math.min(info.width,t.x+t.width);x+=3){const i=(y*info.width+x)*info.channels;min=Math.min(min,ratio(text,[data[i],data[i+1],data[i+2]]))}results.photographicContrast.push({width,theme,selector:t.selector,conservativeBoxMinimum:+min.toFixed(2),target:t.selector.includes('h1')?3:4.5});}
 }
 await page.setViewportSize({width:1440,height:1000});await page.goto(base+'/');await page.evaluate(()=>document.fonts.ready);
 await page.locator('#cover').screenshot({path:path.join(root,'boards','cover.png')});
 await page.locator('#concepts').screenshot({path:path.join(root,'boards','concepts.png')});
 await page.locator('#page-boards').screenshot({path:path.join(root,'boards','page-family.png')});
 results.reviewLinks=await page.evaluate(()=>[...document.querySelectorAll('a')].map(a=>a.href));
 await browser.close();
 fs.writeFileSync(path.join(root,'verification.json'),JSON.stringify(results,null,2)+'\n');
 const layoutFailures=results.layouts.filter(r=>r.overflow||r.distortedLogos.length||r.brokenImages.length);
 console.log(JSON.stringify({layoutCases:results.layouts.length,layoutFailures,interactions:results.interactions,photographicContrast:results.photographicContrast,errors:results.errors},null,2));
 if(layoutFailures.length||results.errors.length)process.exitCode=1;
})();
