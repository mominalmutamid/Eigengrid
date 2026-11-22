/* EigenGrid UI: canvas, pointer input, expression chips, modes, theme, PNG export, math keypad */
const cv=$('#cv'),ctx=cv.getContext('2d');let W=0,H=0,dpr=1,raf=0;
function fit(){const r=cv.getBoundingClientRect();dpr=Math.min(window.devicePixelRatio||1,2);W=r.width;H=r.height;cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);req()}
function paint(){raf=0;try{paintInner()}catch(e){msg('Could not draw this graph: '+(e&&e.message?e.message:'unknown error'))}}
function paintInner(){ctx.setTransform(dpr,0,0,dpr,0,0);S.out=[];S.fout='';S.mout='';draw(ctx,W,H,TH[S.theme],{grid:S.grid,glow:S.glow,cap:false,screen:true});if(!S.out.length&&((S.mode==='plot'&&S.tool.f<0)||(S.mode==='surf'&&S.tool.f3<0)))S.out=['Type a valid equation to use the tools.'];if(S.anim&&S.mode!=='surf'&&S.mode!=='mat'&&!S.lists[S.mode].some(i=>/\btime\b/.test(i.e)))S.out.push('Nothing moves yet. Use the word time in an equation, for example y = sin(x + time).');$('#tout').textContent=S.out.join('\n');$('#fout').textContent=S.fout||'';$('#mout').textContent=S.mout||''}
function req(){if(!raf)raf=requestAnimationFrame(paint);if(!S.anim){persist();hpush()}}
new ResizeObserver(fit).observe(cv);
function zoom(f,p){if(!rot3()){const v=S.view,x=v.cx+(p[0]-W/2)/v.s,y=v.cy-(p[1]-H/2)/v.s;v.s=Math.max(4,Math.min(4000,v.s*f));v.cx=x-(p[0]-W/2)/v.s;v.cy=y+(p[1]-H/2)/v.s}
else S.zoom=Math.max(0.4,Math.min(3,S.zoom*f))}
const ptr=new Map();let pd=0;
const pdist=()=>{const p=[...ptr.values()];return p.length===2?Math.hypot(p[0][0]-p[1][0],p[0][1]-p[1][1]):0};
cv.addEventListener('pointerdown',e=>{cv.setPointerCapture(e.pointerId);ptr.set(e.pointerId,[e.clientX,e.clientY]);pd=pdist();S.drag=true});
cv.addEventListener('pointermove',e=>{if(!ptr.has(e.pointerId))return;const o=ptr.get(e.pointerId);ptr.set(e.pointerId,[e.clientX,e.clientY]);
if(ptr.size===1){const dx=e.clientX-o[0],dy=e.clientY-o[1];
if(!rot3()){S.view.cx-=dx/S.view.s;S.view.cy+=dy/S.view.s}else{S.rot.a+=dx*0.01;S.rot.b=Math.max(0.1,Math.min(1.5,S.rot.b+dy*0.01))}}
else if(ptr.size===2){const d=pdist(),p=[...ptr.values()],r=cv.getBoundingClientRect();if(pd)zoom(d/pd,[(p[0][0]+p[1][0])/2-r.left,(p[0][1]+p[1][1])/2-r.top]);pd=d}
req()});
['pointerup','pointercancel'].forEach(n=>cv.addEventListener(n,e=>{ptr.delete(e.pointerId);pd=pdist();if(!ptr.size){S.drag=false;req()}}));
cv.addEventListener('wheel',e=>{e.preventDefault();zoom(Math.exp(-e.deltaY*0.0015),[e.offsetX,e.offsetY]);req()},{passive:false});
function renderParams(){const box=$('#params');box.textContent='';const seen=new Set();
S.lists[S.mode].forEach(it=>{if(it.c)it.c.names.forEach(n=>seen.add(n))});
seen.forEach(n=>{if(!(n in S.params))S.params[n]=1;
const d=document.createElement('label');d.className='pm';
const l=document.createElement('span');l.textContent=n;
const r=document.createElement('input');r.type='range';r.min=-10;r.max=10;r.step=0.1;r.value=S.params[n];r.setAttribute('aria-label','Value of '+n);
const b=document.createElement('b');b.textContent=(+S.params[n]).toFixed(1);
r.addEventListener('input',()=>{S.params[n]=+r.value;b.textContent=(+r.value).toFixed(1);req()});
d.append(l,r,b);box.append(d)})}
function renderChips(){const box=$('#chips');box.textContent='';const T=TH[S.theme],L=S.lists[S.mode];
L.forEach((it,i)=>{const c=document.createElement('div');c.className='chip'+(it.bad?' bad':'');
const d=document.createElement('span');d.className='dot';d.style.background=colOf(it,i);
const inp=document.createElement('input');inp.className='xin';inp.value=it.e;inp.spellcheck=false;inp.inputMode=S.kbMode==='math'?'none':'text';inp.autocapitalize='off';inp.setAttribute('aria-label','Expression '+(i+1));
inp.placeholder=S.mode!=='surf'?'y = sin(x)':'z = sin(x) * cos(y)';
inp.addEventListener('input',()=>{it.e=inp.value;comp(it,S.mode);c.classList.toggle('bad',it.bad);renderParams();fillSel();badHint();req()});
const x=document.createElement('button');x.setAttribute('aria-label','Remove expression '+(i+1));x.innerHTML='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';
x.addEventListener('click',()=>{L.splice(i,1);renderChips();renderParams();req()});
c.append(d,inp,x);const sw=document.createElement('div');sw.className='sw';
const cp=document.createElement('input');cp.type='color';cp.className='cpk';cp.value=colOf(it,i);cp.setAttribute('aria-label','Custom colour');
const hxi=document.createElement('input');hxi.className='hxi';hxi.placeholder='#RRGGBB';hxi.maxLength=7;hxi.value=colOf(it,i).toUpperCase();hxi.setAttribute('aria-label','Colour hex code');
hxi.addEventListener('input',()=>{const m=hxi.value.trim().match(/^#?([0-9a-f]{6})$/i);if(m){it.col='#'+m[1];cp.value=it.col;d.style.background=it.col;req()}});
cp.addEventListener('input',()=>{it.col=cp.value;hxi.value=cp.value.toUpperCase();d.style.background=cp.value;req()});
PAL.forEach((p,pi)=>{const k=document.createElement('button');k.type='button';k.className='swb';k.style.background=p.c;k.title=p.n;k.setAttribute('aria-label','Colour '+p.n);k.addEventListener('click',()=>{it.ci=pi;it.col=null;d.style.background=p.c;cp.value=p.c;hxi.value=p.c.toUpperCase();req()});sw.append(k)});
sw.append(cp,hxi);c.append(sw);box.append(c)});
const a=document.createElement('button');a.className='add';a.textContent='+ Add expression';
a.addEventListener('click',()=>{L.push({e:''});renderChips();const ins=box.querySelectorAll('.xin');ins[ins.length-1].focus();box.scrollLeft=box.scrollWidth});
if(S.mode==='surf')a.textContent='+ Add surface';
box.append(a);fillSel();badHint()}
function badHint(){const n=(S.lists[S.mode]||[]).filter(i=>i.bad).length;$('#bh').textContent=n?'Red outline: this equation is not understood yet. Check the brackets, or try the examples below.':''}
function setMode(m){S.mode=m;document.querySelectorAll('.seg button').forEach(b=>b.classList.toggle('on',b.dataset.m===m));S.view={cx:0,cy:0,s:m==='art'?Math.max(20,Math.min(W,H)/14):44};S.grid=m!=='art';$('#kGrid').checked=S.grid;$('#tbox').hidden=m==='art'||m==='mat';$('#dbox').hidden=m!=='plot';$('#mbox').hidden=m!=='mat';$('#app').classList.toggle('mm',m==='mat');document.querySelectorAll('.tl').forEach(w=>{w.hidden=String(w.dataset.m)!==(m==='surf'?'3':'2')});setAnim(m==='art');S.trace=null;buildExamples();renderChips();renderParams();req()}
document.querySelectorAll('.seg button').forEach(b=>b.addEventListener('click',()=>setMode(b.dataset.m)));
function setTheme(t){S.theme=t;S.glow=!!TH[t].glow;$('#theme').value=t;renderChips();req()}
$('#theme').addEventListener('change',e=>setTheme(e.target.value));
$('#zin').addEventListener('click',()=>{zoom(1.3,[W/2,H/2]);req()});
$('#zout').addEventListener('click',()=>{zoom(1/1.3,[W/2,H/2]);req()});
$('#kGrid').addEventListener('change',e=>{S.grid=e.target.checked;req()});
$('#kCap').addEventListener('change',e=>{S.cap=e.target.checked});
$('#sz').addEventListener('change',e=>{S.scale=+e.target.value});
const pick=a=>a[Math.floor(Math.random()*a.length)];
$('#surp').addEventListener('click',()=>{
if(S.mode!=='surf'){const K=['2','3','5','7','5/2','7/3','4/3'],TP=S.mode==='art'?['5*cos((K+0.4*sin(time/2))*t)','3+2*sin(K*t+time)','0.3*t*cos(K*t+time)','4*sin(K*t+time/2)+1']:['5*cos(K*t)','3+2*sin(K*t)','0.3*t*cos(K*t)','4*sin(K*t)+1'];
S.lists[S.mode]=[0,1,2].map(()=>({e:'r='+pick(TP).replace(/K/g,'('+pick(K)+')')}));S.view={cx:0,cy:0,s:Math.min(W,H)/12}}
else S.lists.surf=[{e:pick(['sin(sqrt(x^2+y^2))','cos(x*y/3)','(x^2-y^2)/6','sin(x)+cos(y)','sin(x)*cos(y)*exp(-(x^2+y^2)/20)*3'])}];
S.lists[S.mode].forEach(it=>comp(it,S.mode));renderChips();renderParams();req()});
function msg(t){$('#stat').textContent=t}
$('#save').addEventListener('click',async()=>{
try{await Promise.all([document.fonts.load('20px "EG Math"'),document.fonts.load('700 15px "DM Sans"'),document.fonts.load('400 15px "DM Sans"')])}catch(e){}
const k=S.scale,T0=TH[S.theme],band=S.cap?capBand(W,T0):null,bh=band?band.h:0,c=document.createElement('canvas');c.width=Math.round(W*k);c.height=Math.round((H+bh)*k);
const x=c.getContext('2d');x.scale(k,k);draw(x,W,H,T0,{grid:S.grid,glow:S.glow,cap:false});if(band)band.dr(x,H);
const blob=await new Promise(r=>c.toBlob(r,'image/png'));if(!blob){msg('Could not make the image. Try a smaller size.');return}
const url=URL.createObjectURL(blob),fn='eigengrid-art.png';$('#pvi').src=url;$('#pv').hidden=false;
let done=false,dl=null;try{dl=window.claude?await claude.use('downloads'):null}catch(e){}
if(dl){try{await dl.save({filename:fn,data:blob});done=true;msg('Image ready to save.')}catch(e){if(e&&e.code==='declined')done=true}}
if(!done&&window.matchMedia&&matchMedia('(pointer: coarse)').matches&&navigator.canShare){try{const f=new File([blob],fn,{type:'image/png'});if(navigator.canShare({files:[f]})){await navigator.share({files:[f],title:'EigenGrid'});done=true;msg('Choose Save image or Save to Files in the share sheet.')}}catch(e){if(e&&e.name==='AbortError')done=true}}
if(!done){const a=document.createElement('a');a.href=url;a.download=fn;document.body.append(a);a.click();a.remove();msg('Download started. If nothing was saved, press and hold the picture below and choose Save image.')}});
const KP={a:[['x','x'],['y','y'],['z','z'],['7','7'],['8','8'],['9','9'],['÷','/'],['a','a'],['b','b'],['t','t'],['4','4'],['5','5'],['6','6'],['×','*'],['r','r'],['π','pi'],['c','c'],['1','1'],['2','2'],['3','3'],['−','-'],['x²','^2'],['xⁿ','^'],['√','sqrt('],['0','0'],['.','.'],['=','='],['+','+']],
f:[['sin','sin('],['cos','cos('],['tan','tan('],['asin','asin('],['acos','acos('],['atan','atan('],['abs','abs('],['ln','log('],['log','log10('],['exp','exp('],['sqrt','sqrt('],['floor','floor('],['ceil','ceil('],[',',','],['(','('],[')',')'],['^','^'],['=','='],['x','x'],['y','y'],['z','z'],['a','a'],['b','b'],['t','t'],['r','r'],['e','e'],['π','pi']]};
KP.g=[['θ','θ'],['φ','φ'],['α','α'],['β','β'],['γ','γ'],['δ','δ'],['λ','λ'],['μ','μ'],['σ','σ'],['ω','ω'],['ρ','ρ'],['ε','ε'],['η','η'],['κ','κ'],['Φ','Φ'],['Ψ','Ψ'],['Ω','Ω'],['Δ','Δ'],['Σ','Σ'],['Π','Π'],['τ','τ']];
KP.s=[['<','<'],['>','>'],['≤','<='],['≥','>='],['{','{'],['}','}'],[':',':'],[',',','],['abs','abs('],['and',' and '],['or',' or '],['?','?'],['π','pi'],['e','e'],["y′=","y'="],['x','x'],['y','y'],['(','('],[')',')'],['^','^'],['=','='],[';',';'],['..','..'],['u','u'],['v','v'],['t','t'],[',',','],['π','pi']];
KP.l=[...'abcdefghijklmnopqrstuvwxyz'].map(x=>[x,x]).concat([["'","'"],[',',',']]);
const PN={a:'abc',l:'f(x)',f:'αβγ',g:'<≤{}',s:'123'};let page='a',act=null;const app=$('#app'),kb=$('#kb');
function buildKb(){kb.textContent='';const g=document.createElement('div');g.className='kr';kb.append(g);
KP[page].forEach(([l,v],i)=>{const k=document.createElement('button');k.textContent=l;k.dataset.v=v;if(page!=='a'||(i%7<3&&i<21))k.className='k2';g.append(k)});
const r=document.createElement('div');r.className='kr';kb.append(r);
[[PN[page],'pg','Switch keys'],['←','L','Move left'],['→','R','Move right'],['⌫','B','Delete'],['(','P1','Open bracket'],[')','P2','Close bracket'],['Done','D','Hide keypad']].forEach(([l,a,n])=>{const k=document.createElement('button');k.textContent=l;k.dataset.a=a;k.setAttribute('aria-label',n);if(a==='D')k.className='dn';r.append(k)})}
function ins(t){const e=act;if(!e||!e.isConnected)return;e.focus({preventScroll:true});e.setRangeText(t,e.selectionStart,e.selectionEnd,'end');e.dispatchEvent(new Event('input'))}
function bksp(){const e=act;let s0=e.selectionStart,e0=e.selectionEnd;if(s0===e0){if(!s0)return;const m=e.value.slice(0,s0).match(/(sin|cos|tan|asin|acos|atan|abs|log10|log|exp|sqrt|floor|ceil)\($/);s0-=m?m[0].length:1}e.setRangeText('',s0,e0,'end');e.dispatchEvent(new Event('input'))}
const openKb=()=>{if(S.kbMode==='math'){app.classList.add('kbo');if(!kb.firstChild)buildKb()}},closeKb=()=>app.classList.remove('kbo');
kb.addEventListener('mousedown',e=>e.preventDefault());kb.addEventListener('pointerdown',e=>e.preventDefault());
kb.addEventListener('click',e=>{const k=e.target.closest('button');if(!k)return;const a=k.dataset.a;
if(!a){ins(k.dataset.v);return}
if(a==='pg'){page={a:'l',l:'f',f:'g',g:'s',s:'a'}[page];buildKb();return}
if(!act||!act.isConnected)return;
if(a==='D'){act.blur();closeKb();return}
if(a==='P1'||a==='P2'){ins(a==='P1'?'(':')');return}
act.focus({preventScroll:true});
if(a==='L'){const p=Math.max(0,act.selectionStart-1);act.setSelectionRange(p,p)}
else if(a==='R'){const p=Math.min(act.value.length,act.selectionEnd+1);act.setSelectionRange(p,p)}
else bksp()});
$('#chips').addEventListener('focusin',e=>{if(e.target.classList.contains('xin')){act=e.target;openKb();setTimeout(()=>act.scrollIntoView({block:'nearest'}),60)}else if(e.target.tagName==='INPUT')closeKb()});
$('#chips').addEventListener('focusout',()=>setTimeout(()=>{const x=document.activeElement;if(!(x&&x.closest&&x.closest('#chips')))closeKb()},0));
cv.addEventListener('pointerdown',()=>{const x=document.activeElement;if(x&&x.tagName==='INPUT'&&x.closest('#chips'))x.blur()});
const kbt=$('#kbt');
function syncKbt(){kbt.setAttribute('aria-pressed',String(S.kbMode==='math'));kbt.textContent=S.kbMode==='math'?'Keypad: on':'Keypad: off'}
kbt.addEventListener('click',()=>{S.kbMode=S.kbMode==='math'?'native':'math';syncKbt();document.querySelectorAll('#chips .xin').forEach(i=>{i.inputMode=S.kbMode==='math'?'none':'text'});
if(act&&act.isConnected){act.blur();act.focus()}if(S.kbMode!=='math')closeKb()});
syncKbt();
