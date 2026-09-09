const fs=require('node:fs');const path=require('node:path');const root=path.resolve(__dirname,'..');
const palette={cyan:'#109FCC',yellow:'#F1F36D',chalk:'#F2F1E9',petrol:'#0A222A',ink:'#12333B',onCyan:'#08262D',muted:'#496269',lightSurface:'#E7E8DF',lightRule:'#C3CECA',lightLink:'#087594',nightText:'#E5EFF0',nightMuted:'#A5BCC0',nightSurface:'#112F38',nightRule:'#375158',nightLink:'#5AC9EA'};
const linear=c=>c<=.04045?c/12.92:((c+.055)/1.055)**2.4;
const rgb=h=>[1,3,5].map(n=>parseInt(h.slice(n,n+2),16)/255);
function oklch(hex){const [r,g,b]=rgb(hex).map(linear);const l=Math.cbrt(.4122214708*r+.5363325363*g+.0514459929*b),m=Math.cbrt(.2119034982*r+.6806995451*g+.1073969566*b),s=Math.cbrt(.0883024619*r+.2817188376*g+.6299787005*b);const L=.2104542553*l+.793617785*m-.0040720468*s,a=1.9779984951*l-2.428592205*m+.4505937099*s,z=.0259040371*l+.7827717662*m-.808675766*s;return `oklch(${(L*100).toFixed(3)}% ${Math.hypot(a,z).toFixed(5)} ${((Math.atan2(z,a)*180/Math.PI+360)%360).toFixed(3)}${hex.length===9?' / '+(parseInt(hex.slice(7,9),16)/255).toFixed(4):''})`}
const lum=h=>{const [r,g,b]=rgb(h).map(linear);return .2126*r+.7152*g+.0722*b};
const contrast=(a,b)=>{const [lo,hi]=[lum(a),lum(b)].sort((a,b)=>a-b);return +( (hi+.05)/(lo+.05)).toFixed(2)};
const tokens={status:'Proposed brand direction; not imported by production',palette:Object.fromEntries(Object.entries(palette).map(([name,hex])=>[name,{hex,oklch:oklch(hex)}])),themes:{light:{background:'chalk',surface:'lightSurface',text:'ink',muted:'muted',rule:'lightRule',link:'lightLink'},dark:{background:'petrol',surface:'nightSurface',text:'nightText',muted:'nightMuted',rule:'nightRule',link:'nightLink'}},typography:{display:{family:'Barlow Condensed',weights:[500,600],mobileHero:68,mobileHeading:45,desktopHero:108},body:{family:'Hind Siliguri',weights:[400,500],size:17,lineHeight:1.5},caption:{size:14,lineHeight:1.5}},spacing:[4,8,12,16,22,28,36,48,68,88],radius:{control:6,input:4,photo:0},motion:{themeMs:800,controlsMs:180,easing:'cubic-bezier(.22,1,.36,1)',reducedMotionMs:0}};
tokens.contrast=[['ink','chalk'],['muted','chalk'],['lightLink','chalk'],['nightText','petrol'],['nightMuted','petrol'],['nightLink','petrol'],['ink','yellow'],['onCyan','cyan']].map(([foreground,background])=>({foreground,background,ratio:contrast(palette[foreground],palette[background]),target:4.5}));
fs.writeFileSync(path.join(root,'design-tokens.json'),JSON.stringify(tokens,null,2)+'\n');
let css=fs.readFileSync(path.join(root,'reference.css'),'utf8');
css+='\n/* Dedicated readable ink on the cyan enquiry surface. */\n.enquiry-section{color:'+palette.onCyan+'}\n';
css=css.replace(/#[0-9A-Fa-f]{8}\b|#[0-9A-Fa-f]{6}\b/g,oklch);
fs.writeFileSync(path.join(root,'reference.css'),css);
console.log(JSON.stringify(tokens.contrast,null,2));
if(tokens.contrast.some(p=>p.ratio<4.5))process.exitCode=1;
