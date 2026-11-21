/* Graphify app logic: tools panel, animation, saves/history, trace, data fit, matrix controls, video, startup */
const TL=[['der','Derivative f′(x)',[]],['tan','Tangent line',[['x','tx',-10,10,.1]]],
['rie','Riemann sum and area',[['Method','rm',[['mid','Midpoint'],['left','Left'],['right','Right'],['trap','Trapezoid']]],['from','ra',-10,10,.1],['to','rb',-10,10,.1],['boxes','rn',1,100,1]]],
['tay','Taylor polynomial',[['centre','tc',-10,10,.1],['degree','tn',1,12,1]]],
['nw','Newton’s method',[['start x','nx',-10,10,.1],['steps','ns',1,10,1]]],
['od','ODE solvers (for y′ = f(x, y))',[['x₀','ox',-10,10,.1],['y₀','oy',-10,10,.1],['step h','oh',.05,1,.05],['steps','on',1,60,1]]],
['nm','Root finding table',[['Method','nmm',[['bis','Bisection'],['sec','Secant'],['new','Newton']]],['a','na',-10,10,.1],['b','nb',-10,10,.1],['steps','nk',1,20,1]]],
['ie','Integration error table',[['from','ia',-10,10,.1],['to','ib',-10,10,.1]]],
['tb','Table of values',[['from','tbf',-10,10,.1],['step','tbs',.1,5,.1],['rows','tbn',3,20,1]]],
['ix','Zeros and intersections',[]],
['tp','Tangent plane and gradient',[['x = a','ta',-5,5,.1],['y = b','tb',-5,5,.1]],3],
['vi','Volume under surface',[['x from','xa',-5,5,.1],['x to','xb',-5,5,.1],['y from','ya',-5,5,.1],['y to','yb',-5,5,.1]],3]];
const tb=$('#tools');
TL.forEach(([k,nm,sp,md])=>{const w=document.createElement('div');w.className='tl';w.dataset.m=md||2;const l=document.createElement('label');l.className='chk';const cb=document.createElement('input');cb.type='checkbox';l.append(cb,nm);
const p=document.createElement('div');p.className='tp';p.hidden=true;
sp.forEach(q=>{const r=document.createElement('label');
if(q.length===3){r.className='row';const se=document.createElement('select');q[2].forEach(([v2,t2])=>{const o=document.createElement('option');o.value=v2;o.textContent=t2;se.append(o)});se.value=S.tool[q[1]];se.setAttribute('aria-label',q[0]);se.addEventListener('change',()=>{S.tool[q[1]]=se.value;req()});r.append(q[0],se)}
else{r.className='pm';const n1=document.createElement('span');n1.textContent=q[0];const g=document.createElement('input');g.type='range';g.min=q[2];g.max=q[3];g.step=q[4];g.value=S.tool[q[1]];g.setAttribute('aria-label',nm+' '+q[0]);const b1=document.createElement('b');b1.textContent=S.tool[q[1]];g.addEventListener('input',()=>{S.tool[q[1]]=+g.value;b1.textContent=g.value;req()});r.append(n1,g,b1)}
p.append(r)});
cb.addEventListener('change',()=>{S.tool[k]=cb.checked;p.hidden=!cb.checked||!sp.length;req()});w.append(l,p);tb.append(w)});
$('#tf').addEventListener('change',()=>{S.tool[S.mode==='surf'?'f3':'f']=+$('#tf').value;req()});
let t0=0,aid=0,pt=0,lt=0;
function tick(ts){S.params.time=(ts-t0)/1000;if(rot3())S.rot.a+=Math.min(0.1,(ts-lt)/1000)*0.6;lt=ts;req();aid=requestAnimationFrame(tick)}
function setAnim(on){S.anim=on;cancelAnimationFrame(aid);const b=$('#anim');b.setAttribute('aria-pressed',String(on));b.textContent=on?'❚❚':'▶';if(on){t0=performance.now()-S.params.time*1000;lt=performance.now();aid=requestAnimationFrame(tick)}}
$('#anim').addEventListener('click',()=>setAnim(!S.anim));
$('#ph').addEventListener('click',()=>{const c=$('#app').classList.toggle('pc');$('#ph').setAttribute('aria-expanded',String(!c));$('#pht').textContent=c?'Show equations and settings':'Hide panel';$('#pha').textContent=c?'▴':'▾';if(c)closeKb()});
function persist(){clearTimeout(pt);pt=setTimeout(()=>{try{localStorage.setItem('graphify.cur',JSON.stringify(snap()))}catch(e){}},500)}
function snap(){const L=k=>S.lists[k].map(i=>({e:i.e,ci:i.ci,col:i.col}));return{mode:S.mode,theme:S.theme,grid:S.grid,cap:S.cap,scale:S.scale,params:Object.assign({},S.params,{time:0}),view:S.view,rot:S.rot,zoom:S.zoom,data:S.data,mat:S.mat,lists:{plot:L('plot'),surf:L('surf'),art:L('art')}}}
function applySnap(o){const L=o.lists||{};['plot','surf','art'].forEach(k=>{if(Array.isArray(L[k]))S.lists[k]=L[k].map(i=>({e:String(i.e||''),ci:i.ci,col:i.col}));S.lists[k].forEach(it=>comp(it,k))});
S.params=Object.assign({time:0},o.params);S.theme=TH[o.theme]?o.theme:'light';S.cap=o.cap!==false;S.scale=[1,2,4].includes(o.scale)?o.scale:2;
setTheme(S.theme);setMode(['plot','surf','art','mat'].includes(o.mode)?o.mode:'plot');
if(o.view&&isFinite(o.view.s)&&o.view.s>0)S.view=o.view;if(o.rot&&isFinite(o.rot.a))S.rot=o.rot;if(isFinite(o.zoom))S.zoom=o.zoom;if(typeof o.grid==='boolean')S.grid=o.grid;
$('#kGrid').checked=S.grid;$('#kCap').checked=S.cap;$('#sz').value=String(S.scale);S.data=Object.assign({txt:'',fit:'none',deg:2},o.data||{});syncData();if(o.mat&&o.mat.m2&&o.mat.m3)S.mat=Object.assign({n:2,m2:[2,1,1,2],m3:[2,1,0,1,2,0,0,0,3],t:1,v:[1,1,1]},o.mat);syncMat();renderParams();req()}
const getL=()=>{try{return JSON.parse(localStorage.getItem('graphify.list')||'[]')}catch(e){return[]}};
function renderSaves(){const box=$('#svl');box.textContent='';getL().forEach((g,i)=>{const c=document.createElement('div');c.className='gc';
const im=document.createElement('img');im.alt='';if(g.thumb)im.src=g.thumb;c.append(im);
const n=document.createElement('div');n.className='gn';n.textContent=g.name;c.append(n);
const r=document.createElement('div');r.className='gb';
const o=document.createElement('button');o.className='sec';o.textContent='Open';o.setAttribute('aria-label','Open '+g.name);o.addEventListener('click',()=>{try{applySnap(g.data);msg('Opened “'+g.name+'”.')}catch(e){msg('Could not open this graph.')}});
const d=document.createElement('button');d.className='sec';d.textContent='Delete';d.setAttribute('aria-label','Delete '+g.name);d.addEventListener('click',()=>{const L=getL();L.splice(i,1);try{localStorage.setItem('graphify.list',JSON.stringify(L))}catch(e){}renderSaves()});
r.append(o,d);c.append(r);box.append(c)})}
$('#svb').addEventListener('click',()=>{const L=getL(),nm=$('#svn').value.trim()||('Graph '+(L.length+1));L.unshift({name:nm,data:snap(),thumb:thumb()});
try{localStorage.setItem('graphify.list',JSON.stringify(L.slice(0,50)));$('#svn').value='';msg('Saved “'+nm+'”.')}catch(e){msg('Saving is not available in this browser.')}renderSaves()});
const HI={u:[],r:[],last:null,t:0};
function hsnap(){const L=k=>S.lists[k].map(i=>({e:i.e,ci:i.ci,col:i.col}));return JSON.stringify({plot:L('plot'),surf:L('surf'),art:L('art')})}
function hbtn(){$('#undo').disabled=!HI.u.length;$('#redo').disabled=!HI.r.length}
function hcommit(){clearTimeout(HI.t);const j=hsnap();if(HI.last===null||j===HI.last)return;HI.u.push(HI.last);if(HI.u.length>100)HI.u.shift();HI.last=j;HI.r=[];hbtn()}
function hpush(){clearTimeout(HI.t);HI.t=setTimeout(hcommit,500)}
function hrestore(j){const o=JSON.parse(j);['plot','surf','art'].forEach(k=>{S.lists[k]=o[k].map(i=>({e:i.e,ci:i.ci,col:i.col}));S.lists[k].forEach(it=>comp(it,k))});S.trace=null;renderChips();renderParams();req()}
function undo(){hcommit();if(!HI.u.length)return;HI.r.push(HI.last);HI.last=HI.u.pop();hrestore(HI.last);hbtn()}
function redo(){hcommit();if(!HI.r.length)return;HI.u.push(HI.last);HI.last=HI.r.pop();hrestore(HI.last);hbtn()}
$('#undo').addEventListener('click',undo);$('#redo').addEventListener('click',redo);
let TP=null;
cv.addEventListener('pointerdown',e=>{TP={x:e.clientX,y:e.clientY,t:performance.now(),m:false,n:ptr.size}});
cv.addEventListener('pointermove',e=>{if(TP&&Math.hypot(e.clientX-TP.x,e.clientY-TP.y)>8)TP.m=true});
cv.addEventListener('pointerup',e=>{const q=TP;TP=null;if(q&&!q.m&&q.n===1&&performance.now()-q.t<500){const r=cv.getBoundingClientRect();doTrace(e.clientX-r.left,e.clientY-r.top)}});
function doTrace(px,py){if(S.mode!=='plot')return;if($('#tapAdd').checked){addPt(px,py);return}const v=S.view,s=v.s,gx=x=>W/2+(x-v.cx)*s,gy=y=>H/2-(y-v.cy)*s;let best=null;
S.lists.plot.forEach((it,i)=>{if(!it.c)return;const c=it.c,sc=Object.assign({},S.params);let d=1e9,P=null;
if(c.k==='ex'){for(let dx=-24;dx<=24;dx++){const x=v.cx+(px+dx-W/2)/s;sc.x=x;const y=ev(c,sc);if(!isFinite(y))continue;const dd=Math.hypot(dx,gy(y)-py);if(dd<d){d=dd;P=[x,y]}}}
else if(c.k==='pol'){for(let t=0;t<=12*Math.PI;t+=0.01){sc.t=t;const r=ev(c,sc);if(!isFinite(r))continue;const x=r*Math.cos(t),y=r*Math.sin(t),dd=Math.hypot(gx(x)-px,gy(y)-py);if(dd<d){d=dd;P=[x,y]}}}
else{let bq=null;(c.pseg||[]).forEach(g=>{const dx=g[2]-g[0],dy=g[3]-g[1],l2=dx*dx+dy*dy||1,t=Math.max(0,Math.min(1,((px-g[0])*dx+(py-g[1])*dy)/l2)),qx=g[0]+t*dx,qy=g[1]+t*dy,dd=Math.hypot(qx-px,qy-py);if(dd<d){d=dd;bq=[qx,qy]}});
if(bq){let x=v.cx+(bq[0]-W/2)/s,y=v.cy-(bq[1]-H/2)/s;const fx=pdv(c,'x'),fy=pdv(c,'y');for(let k=0;k<6;k++){sc.x=x;sc.y=y;const f=ev(c,sc),a=ev({f:fx},sc),b=ev({f:fy},sc),g2=a*a+b*b;if(!isFinite(f)||!(g2>1e-14))break;x-=f*a/g2;y-=f*b/g2}P=[x,y]}}
if(P&&d<(best?best.d:30))best={d,x:P[0],y:P[1],col:colOf(it,i)}});
S.trace=best?{x:best.x,y:best.y,col:best.col}:null;req()}
async function saveFile(blob,fn){const url=URL.createObjectURL(blob);let dl=null;try{dl=window.claude?await claude.use('downloads'):null}catch(e){}
if(dl){try{await dl.save({filename:fn,data:blob});return true}catch(e){if(e&&e.code==='declined')return true}}
if(window.matchMedia&&matchMedia('(pointer: coarse)').matches&&navigator.canShare){try{const f=new File([blob],fn,{type:blob.type});if(navigator.canShare({files:[f]})){await navigator.share({files:[f],title:'Graphify'});return true}}catch(e){if(e&&e.name==='AbortError')return true}}
const a=document.createElement('a');a.href=url;a.download=fn;document.body.append(a);a.click();a.remove();return false}
$('#exj').addEventListener('click',async()=>{const txt=JSON.stringify({app:'graphify',version:1,graphs:[{name:'Current graph',data:snap()},...getL()]},null,1);
const ok=await saveFile(new Blob([txt],{type:'application/json'}),'graphify-graphs.json');const ta=$('#xj');ta.value=txt;ta.hidden=false;
msg(ok?'Graphs file ready.':'Download started. If nothing was saved, copy the text below into a file named graphify-graphs.json.')});
$('#imp').addEventListener('change',e=>{const f=e.target.files[0];if(!f)return;
f.text().then(t=>{try{const o=JSON.parse(t),arr=Array.isArray(o.graphs)?o.graphs:(o.lists?[{name:o.name||'Imported graph',data:o}]:[]),L=getL();let n=0;
arr.forEach(g=>{if(g&&g.data&&g.data.lists){L.unshift({name:String(g.name||'Imported graph').slice(0,40),data:g.data,thumb:typeof g.thumb==='string'?g.thumb:undefined});n++}});
if(!n)throw 0;localStorage.setItem('graphify.list',JSON.stringify(L.slice(0,50)));renderSaves();msg('Imported '+n+' graph(s).')}catch(err){msg('That file is not a Graphify graph file.')}});e.target.value=''});
function syncData(){$('#pts').value=S.data.txt;$('#fitm').value=S.data.fit;$('#fdeg').value=S.data.deg;$('#fdv').textContent=S.data.deg;$('#degr').hidden=S.data.fit!=='poly'}
function addPt(px,py){const v=S.view,r=n=>+n.toFixed(2),x=v.cx+(px-W/2)/v.s,y=v.cy-(py-H/2)/v.s;S.data.txt=(S.data.txt.trim()?S.data.txt.replace(/\s+$/,'')+'\n':'')+r(x)+', '+r(y);syncData();req()}
$('#pts').addEventListener('input',()=>{S.data.txt=$('#pts').value;req()});
$('#fitm').addEventListener('change',e=>{S.data.fit=e.target.value;syncData();req()});
$('#fdeg').addEventListener('input',e=>{S.data.deg=+e.target.value;$('#fdv').textContent=e.target.value;req()});
syncData();
const PRE={2:[['Custom',null],['Identity',[1,0,0,1]],['Rotate 45°',[.7071,-.7071,.7071,.7071]],['Rotate 90°',[0,-1,1,0]],['Shear',[1,1,0,1]],['Stretch',[2,0,0,.5]],['Reflect over y = x',[0,1,1,0]],['Project onto x-axis',[1,0,0,0]],['Symmetric (2, 1; 1, 2)',[2,1,1,2]],['Singular (1, 2; 2, 4)',[1,2,2,4]]],
3:[['Custom',null],['Identity',[1,0,0,0,1,0,0,0,1]],['Rotate about z, 45°',[.7071,-.7071,0,.7071,.7071,0,0,0,1]],['Stretch (2, 1, 0.5)',[2,0,0,0,1,0,0,0,.5]],['Shear',[1,1,0,0,1,1,0,0,1]],['Symmetric',[2,1,0,1,2,0,0,0,3]],['Singular',[1,2,3,2,4,6,1,0,1]]]};
function syncMat(){const m=S.mat,n=m.n,A=n===2?m.m2:m.m3;$('#msz').value=String(n);
const g=$('#mg');g.textContent='';g.style.gridTemplateColumns='repeat('+n+',1fr)';
A.forEach((val,i)=>{const inp=document.createElement('input');inp.type='number';inp.step='any';inp.className='mi';inp.value=val;inp.setAttribute('inputmode','decimal');inp.setAttribute('aria-label','Entry row '+(Math.floor(i/n)+1)+', column '+(i%n+1));
inp.addEventListener('input',()=>{const z=parseFloat(inp.value);if(isFinite(z)){A[i]=z;$('#mpre').value='0';req()}});g.append(inp)});
const pr=$('#mpre');pr.textContent='';PRE[n].forEach(([nm],i)=>{const o=document.createElement('option');o.value=i;o.textContent=nm;pr.append(o)});
$('#mt').value=m.t;$('#mtv').textContent=m.t;
const vs=$('#mvs');vs.textContent='';['x','y','z'].slice(0,n).forEach((nm,i)=>{const r=document.createElement('label');r.className='pm';const sp=document.createElement('span');sp.textContent='v'+nm;
const g2=document.createElement('input');g2.type='range';g2.min=-4;g2.max=4;g2.step=.1;g2.value=m.v[i];g2.setAttribute('aria-label','Vector component '+nm);const b1=document.createElement('b');b1.textContent=m.v[i];
g2.addEventListener('input',()=>{m.v[i]=+g2.value;b1.textContent=g2.value;req()});r.append(sp,g2,b1);vs.append(r)})}
$('#msz').addEventListener('change',e=>{S.mat.n=+e.target.value;syncMat();req()});
$('#mpre').addEventListener('change',e=>{const n=S.mat.n,p=PRE[n][+e.target.value][1];if(p){const A=n===2?S.mat.m2:S.mat.m3,k=e.target.value;p.forEach((z,i)=>A[i]=z);syncMat();$('#mpre').value=k;req()}});
$('#mt').addEventListener('input',e=>{S.mat.t=+e.target.value;$('#mtv').textContent=e.target.value;req()});
syncMat();
async function recVideo(){if(!window.MediaRecorder||!HTMLCanvasElement.prototype.captureStream){msg('Video recording is not supported in this browser.');return}
const secs=+$('#vdur').value,types=['video/webm;codecs=vp9','video/webm;codecs=vp8','video/webm','video/mp4'],mt=types.find(t=>MediaRecorder.isTypeSupported(t))||'';
const was=S.anim;if(!was)setAnim(true);
const k=Math.min(3,1080/Math.max(W,H)),rc=document.createElement('canvas');rc.width=Math.round(W*k);rc.height=Math.round(H*k);const rx=rc.getContext('2d');
let on=true;const loop=()=>{if(!on)return;rx.setTransform(k,0,0,k,0,0);S.rec=true;try{draw(rx,W,H,TH[S.theme],{grid:S.grid,glow:S.glow,cap:S.cap})}finally{S.rec=false}requestAnimationFrame(loop)};loop();
let rec;try{rec=new MediaRecorder(rc.captureStream(30),mt?{mimeType:mt,videoBitsPerSecond:8e6}:{videoBitsPerSecond:8e6})}catch(e){on=false;if(!was)setAnim(false);msg('Video recording is not available here.');return}
const chunks=[];rec.ondataavailable=e=>{if(e.data&&e.data.size)chunks.push(e.data)};const done=new Promise(r=>{rec.onstop=r});
rec.start(200);$('#vrec').disabled=true;let left=secs;msg('Recording… '+left+' s');const iv=setInterval(()=>{left--;if(left>0)msg('Recording… '+left+' s')},1000);
await new Promise(r=>setTimeout(r,secs*1000));on=false;clearInterval(iv);rec.stop();await done;if(!was)setAnim(false);$('#vrec').disabled=false;
const type=rec.mimeType||mt||'video/webm',blob=new Blob(chunks,{type}),ext=/mp4/.test(type)?'mp4':'webm',vp=$('#vpv');vp.src=URL.createObjectURL(blob);vp.hidden=false;
const ok=await saveFile(blob,'graphify-art.'+ext);msg(ok?'Video ready.':'Download started. If nothing was saved, press and hold the video below.')}
$('#vrec').addEventListener('click',recVideo);
const EX={plot:[['Sine with slider','y=a*sin(x)'],['Parabola','y=x^2/4'],['Circle','x^2+y^2=25'],['Polar rose','r=5*cos(3*t)'],['Inequality','y>x^2'],['Piecewise','y={x<0: -x, x>=0: x^2}'],['Slope field',"y'=x-y"],['Parametric','(cos(t), sin(2*t))'],['Absolute value','y=abs(x)']],
surf:[['Wave','z=sin(x)*cos(y)'],['Ripple','z=sin(sqrt(x^2+y^2))'],['Saddle','z=(x^2-y^2)/4'],['Sphere','x^2+y^2+z^2=9'],['Cylinder','x^2+y^2=4'],['Torus','((2+cos(v))*cos(u), (2+cos(v))*sin(u), sin(v)); u=0..6.28, v=0..6.28'],['Helix','(cos(t), sin(t), t/3); t=0..20'],['Moving wave','z=sin(x+time)*cos(y)']],
art:[['Moving rose','r=5*cos((3+sin(time/2))*t)'],['Spiral','r=0.3*t*cos(2*t+time)'],['Lissajous','(4*sin(3*t+time), 4*sin(2*t)); t=0..6.28'],['Spirograph','(3*cos(t)+2*cos(5*t+time), 3*sin(t)+2*sin(5*t+time)); t=0..6.28']]};
function buildExamples(){const box=$('#exl');box.textContent='';(EX[S.mode]||[]).forEach(([nm,e])=>{const b=document.createElement('button');b.className='sec ex';b.textContent=nm;b.setAttribute('aria-label','Add example: '+nm);
b.addEventListener('click',()=>{const it={e};S.lists[S.mode].push(it);comp(it,S.mode);renderChips();renderParams();req()});box.append(b)})}
window.addEventListener('error',e=>msg('Something went wrong: '+(e.message||'unknown error')));
window.addEventListener('unhandledrejection',e=>msg('Something went wrong: '+((e.reason&&e.reason.message)||'unknown error')));
let sv=null;try{sv=JSON.parse(localStorage.getItem('graphify.cur')||'null')}catch(e){}
['plot','surf','art'].forEach(m=>S.lists[m].forEach(it=>comp(it,m)));
if(sv){try{applySnap(sv)}catch(e){setTheme(S.theme);setMode('plot')}}else{setTheme(S.theme);setMode('plot')}fit();renderSaves();HI.last=hsnap();hbtn();
