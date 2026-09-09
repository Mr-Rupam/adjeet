const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root=path.resolve(__dirname,'..');
const mime={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'application/javascript','.png':'image/png','.webp':'image/webp','.ttf':'font/ttf','.json':'application/json','.md':'text/plain; charset=utf-8'};
const port=Number(process.env.ADJEET_REVIEW_PORT||4317);
http.createServer((req,res)=>{
 if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405);res.end();return;}
 let relative;try{relative=decodeURIComponent(new URL(req.url,'http://localhost').pathname)}catch{res.writeHead(400);res.end();return;}
 const file=path.resolve(root,'.'+(relative==='/'?'/index.html':relative));
 if(!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
 fs.readFile(file,(err,body)=>{if(err){res.writeHead(404);res.end('Not found');return;}res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});res.end(req.method==='HEAD'?undefined:body)});
}).listen(port,'127.0.0.1',()=>console.log(`AD-JEET design review: http://127.0.0.1:${port}`));
