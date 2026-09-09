const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const sharp = require('sharp');
const root = path.resolve(__dirname, '..');
const generated = 'C:/Users/KIIT0001/.codex/generated_images/01a0776e-9cf5-7c71-b88e-a910eb3f9bcc';
const files = [
 ['hero-day','exec-18072501-dba1-4d6d-91ed-bc84429b650c.png'],
 ['hero-night','exec-a710843a-2cce-4c1b-a737-af5e73861d6b.png'],
 ['hero-desktop-day','exec-2f3d8abe-d2b8-43c7-8b27-5479fad6431e.png'],
 ['hero-desktop-night','exec-52f538cf-545f-4d87-a0f6-f88b845cf6e9.png'],
 ['materials','exec-86dd7bc6-23e2-44ad-9c7c-d77d7b4bbdaf.png'],
 ['miniature','exec-18e8bc22-447b-4c76-b495-a4e22a903c16.png']
];
const hash = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
(async()=>{
 const manifest = {created:'2026-09-07', status:'Proposed design assets; not installed in the website',generation:'Native image generation tool. Unbranded scene plates; original logo overlaid as an unchanged image in the reference.',assets:[]};
 for(const [name,source] of files){
  const target=path.join(root,'assets',name+'-source.png');
  if(!fs.existsSync(target)) fs.copyFileSync(path.join(generated,source),target);
  const meta=await sharp(target).metadata();
  const webp=path.join(root,'assets',name+'.webp');
  await sharp(target).webp({quality:86,effort:5}).toFile(webp);
  if(name.startsWith('hero-')&&!name.includes('desktop')) await sharp(target).resize({width:640}).webp({quality:84,effort:5}).toFile(path.join(root,'assets',name+'-640.webp'));
  manifest.assets.push({id:name,source:name+'-source.png',webp:name+'.webp',width:meta.width,height:meta.height,bytes:fs.statSync(webp).size,sourceSha256:hash(target),role:name==='miniature'?'Alternative C only':name==='materials'?'Illustrative material render':'Hero background plate',claim:'Generated concept, not completed client work'});
 }
 const logo=path.join(root,'assets','adjeet-original.png');
 const logoOriginal='C:/Users/KIIT0001/Downloads/ADJEET/adjeet/logo.png.png';
 manifest.logo={file:'adjeet-original.png',original:logoOriginal,sha256:hash(logo),matchesOriginal:hash(logo)===hash(logoOriginal),width:586,height:175};
 fs.writeFileSync(path.join(root,'asset-manifest.json'),JSON.stringify(manifest,null,2)+'\n');
 console.log(JSON.stringify({logo:manifest.logo,assets:manifest.assets.map(({id,width,height,bytes})=>({id,width,height,bytes}))},null,2));
})();
