const h=require('http'),fs=require('fs'),p=require('path');
h.createServer((q,r)=>{let f=p.join(__dirname,q.url=='/'?'schedule.html':q.url);fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);r.end('NF')}else{r.writeHead(200,{'Content-Type':{'html':'text/html','js':'application/javascript','css':'text/css'}[p.extname(f).slice(1)]||'text/plain'});r.end(d)}})}).listen(8080,()=>console.log('ok'));
