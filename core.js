/* EigenGrid core: state, themes, parser (comp/norm), shared helpers */
const $=s=>document.querySelector(s);
const TH={
light:{bg:'#FFFFFF',grid:'#E6ECE7',axis:'#5A6A5F',ink:'#2B332E',c:['#52695A','#4F8A8B','#C27C5E','#6C85A6','#8A7F52'],lo:'#B3C5B6',hi:'#3F5A49',glow:0},
stone:{bg:'#B3C5B6',grid:'#A2B6A5',axis:'#2B332E',ink:'#1F2823',c:['#2B332E','#FFFFFF','#52695A','#F6F8F5','#3C4D41'],lo:'#E9F0EA',hi:'#2F4237',glow:0}};
const RES=new Set(['x','y','z','t','r','time']);
const S={mode:'plot',view:{cx:0,cy:0,s:44},rot:{a:-0.8,b:0.6},zoom:1,theme:'light',grid:true,glow:false,cap:true,scale:2,trace:null,data:{txt:'',fit:'none',deg:2},mat:{n:2,m2:[2,1,1,2],m3:[2,1,0,1,2,0,0,0,3],t:1,v:[1,1,1]},out:[],tool:{f:-1,f3:-1,od:false,ox:0,oy:1,oh:.5,on:10,nm:false,nmm:'bis',na:0,nb:2,nk:8,ie:false,ia:0,ib:3,tb:false,tbf:0,tbs:1,tbn:8,tp:false,ta:1,tb:1,vi:false,xa:-2,xb:2,ya:-2,yb:2,der:false,tan:false,tx:1,rie:false,ra:0,rb:3,rn:8,rm:'mid',tay:false,tn:3,tc:0,nw:false,nx:1,ns:4,ix:false},kbMode:(window.matchMedia&&matchMedia('(pointer: coarse)').matches)?'math':'native',params:{a:3,time:0},anim:false,
lists:{plot:[{e:'a*sin(x)'},{e:'x^2/4'},{e:'x^2+y^2=25'}],surf:[{e:'sin(sqrt(x^2+y^2))'}],art:[{e:'r=5*cos((3+sin(time/2))*t)'},{e:'r=3+2*sin(5*t+time)'},{e:'r=0.3*t*cos(2*t+time)'}],mat:[]}};
if(!window.math){$('#chips').textContent='The math library did not load. Check your connection and reload.';throw new Error('math.js did not load')}
const hx=h=>[1,3,5].map(i=>parseInt(h.substr(i,2),16));
const mix=(a,b,t)=>{const A=hx(a),B=hx(b);return 'rgb('+A.map((v,i)=>Math.round(v+(B[i]-v)*t)).join(',')+')'};
function pw(s){return s.replace(/\{([^{}]*)\}/g,(m,b)=>{const parts=[];let d=0,cur='';for(const ch of b){if(ch==='('||ch==='[')d++;if(ch===')'||ch===']')d--;if(ch===','&&d===0){parts.push(cur);cur=''}else cur+=ch}parts.push(cur);let out='NaN';
for(let i=parts.length-1;i>=0;i--){const k=parts[i].indexOf(':');if(k<0)return m;out='(('+parts[i].slice(0,k)+')?('+parts[i].slice(k+1)+'):('+out+'))'}return out})}
const SUP={'²':'^2','³':'^3','⁴':'^4'};
function norm(s){return pw(s).replace(/≤/g,'<=').replace(/≥/g,'>=').replace(/[²³⁴]/g,c=>SUP[c]).replace(/×/g,'*').replace(/÷/g,'/').replace(/[−–]/g,'-').replace(/π/g,'pi').replace(/θ/g,'t').replace(/√\s*\(/g,'sqrt(').replace(/√\s*([A-Za-z0-9.]+)/g,'sqrt($1)')}
function comp(it,mode){const raw=norm(it.e.trim());it.c=null;it.bad=false;if(!raw)return;
try{let s=raw,k='ex',ine=null,rg={};
const sm=s.indexOf(';');if(sm>0){s.slice(sm+1).replace(/([tuv])\s*=\s*([^,;]+?)\s*\.\.\s*([^,;]+)/g,(m,v,a,b)=>{rg[v]=[math.evaluate(a),math.evaluate(b)];return m});s=s.slice(0,sm).trim()}
const tp=tupleParts(s);
if(tp&&((mode!=='surf'&&tp.length===2)||(mode==='surf'&&tp.length===3))){const nodes=tp.map(x=>math.parse(x)),names=[];
nodes.forEach(nd=>nd.traverse((q,p,par)=>{if(q.isSymbolNode&&!(par&&par.isFunctionNode&&p==='fn')&&!RES.has(q.name)&&!(q.name in math)&&!['t','u','v'].includes(q.name))names.push(q.name)}));
const uses=nm=>nodes.some(nd=>{let f=false;nd.traverse(q=>{if(q.isSymbolNode&&q.name===nm)f=true});return f});
it.c={f:nodes[0].compile(),fs:nodes.map(nd=>nd.compile()),k:mode!=='surf'?'par':(uses('u')||uses('v')?'psf':'pc3'),names,n:nodes[0],rg};return}
if(mode!=='surf'){
const ig=(/^[yrz]\s*=/i.test(s)||s.includes('?'))?null:s.match(/^([^<>]*?)(<=|>=|<|>)([^<>]*)$/);
const od=s.match(/^(?:y'|y′|dy\/dx)\s*=\s*(.+)$/i);
if(od){k='ode';s=od[1]}else if(ig){ine=ig[2];s='('+ig[1]+')-('+ig[3]+')';k='imp'}else if(/^r\s*=/i.test(s)){k='pol';s=s.replace(/^r\s*=/i,'')}
else if(/^y\s*=/i.test(s))s=s.replace(/^y\s*=/i,'');
else if(s.indexOf('=')>0){const p=s.split('=');if(p.length!==2)throw 0;s='('+p[0]+')-('+p[1]+')';k='imp'}
}else if(/^z\s*=/i.test(s))s=s.replace(/^z\s*=/i,'');else if(s.indexOf('=')>0){const p=s.split('=');if(p.length!==2)throw 0;s='('+p[0]+')-('+p[1]+')';k='imp'}
const n=math.parse(s),names=[];
n.traverse((q,p,par)=>{if(q.isSymbolNode&&!(par&&par.isFunctionNode&&p==='fn')&&!RES.has(q.name)&&!(q.name in math))names.push(q.name)});
it.c={f:n.compile(),k,names,n,ine};
}catch(e){it.bad=true}}
function ev(c,sc){try{const v=c.f.evaluate(sc);return typeof v==='number'?v:NaN}catch(e){return NaN}}
const fmt=n=>String(+n.toFixed(6));
const fm=n=>String(+Number(n).toFixed(4));
const rot3=()=>S.mode==='surf'||(S.mode==='mat'&&S.mat.n===3);
const evf=(f,sc)=>{try{const v=f.evaluate(sc);return typeof v==='number'?v:NaN}catch(e){return NaN}};
function tupleParts(s){s=s.trim();if(s[0]!=='('||s[s.length-1]!==')')return null;let d=0;for(let i=0;i<s.length-1;i++){if(s[i]==='(')d++;if(s[i]===')'){d--;if(d===0)return null}}
const inner=s.slice(1,-1),parts=[];d=0;let cur='';for(const ch of inner){if(ch==='('||ch==='[')d++;if(ch===')'||ch===']')d--;if(ch===','&&d===0){parts.push(cur);cur=''}else cur+=ch}parts.push(cur);return parts.length>1?parts:null}
const PAL=[{n:'Dusty orchid',c:'#A9729A'},{n:'Powder blue',c:'#6FA8D2'},{n:'Mulberry wine',c:'#7B2D52'},{n:'Mint julep',c:'#58B890'},{n:'Forest',c:'#2E6B47'},{n:'Pink drink',c:'#EE7F9C'},{n:'Sunny lime',c:'#AFC31F'}];
const colOf=(it,i)=>it.col||PAL[(it.ci!=null?it.ci:i)%PAL.length].c;
function pdv(c,v){const k='d'+v;if(c[k]===undefined){try{c[k]=math.derivative(c.n,v).compile()}catch(e){c[k]=null}}return c[k]}
function pdd(c,a,b){const k='d'+a+b;if(c[k]===undefined){try{c[k]=math.derivative(math.derivative(c.n,a),b).compile()}catch(e){c[k]=null}}return c[k]}
