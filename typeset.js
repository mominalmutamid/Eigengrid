/* EigenGrid typesetting: draws equations in mathematical notation (used for the caption of PNG and video exports) */
const MFONT='"EG Math","Latin Modern Math","STIX Two Math","Cambria Math","Times New Roman",serif';
const IT={},GKI={},GK={alpha:'α',beta:'β',gamma:'γ',delta:'δ',epsilon:'ε',eta:'η',theta:'θ',kappa:'κ',lambda:'λ',mu:'μ',rho:'ρ',sigma:'σ',tau:'τ',phi:'φ',omega:'ω',pi:'π'};
'abcdefghijklmnopqrstuvwxyz'.split('').forEach((c,i)=>{IT[c]=c==='h'?'\u210E':String.fromCodePoint(0x1D44E+i)});
'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').forEach((c,i)=>{IT[c]=String.fromCodePoint(0x1D434+i)});
'αβγδεζηθικλμνξοπρςστυφχψω'.split('').forEach((c,i)=>{GKI[c]=String.fromCodePoint(0x1D6FC+i)});
const itl=s=>Array.from(s).map(c=>IT[c]||GKI[c]||c).join('');
const TRIG=new Set(['sin','cos','tan','sec','csc','cot','sinh','cosh','tanh']);
const tyText=(c,t,z)=>{c.font=z+'px '+MFONT;return{w:c.measureText(t).width,a:z*.72,d:z*.21,dr:(g,x,y)=>{g.font=z+'px '+MFONT;g.fillText(t,x,y)}}};
const tyGap=w=>({w,a:0,d:0,dr(){}});
const tyCat=bs=>{let w=0,a=0,d=0;bs.forEach(b=>{w+=b.w;a=Math.max(a,b.a);d=Math.max(d,b.d)});return{w,a,d,dr:(g,x,y)=>{let p=x;bs.forEach(b=>{b.dr(g,p,y);p+=b.w})}}};
const tySup=(b,e,z)=>{const r=z*.4,s=z*.03;return{w:b.w+e.w+s,a:Math.max(b.a,r+e.a),d:b.d,dr:(g,x,y)=>{b.dr(g,x,y);e.dr(g,x+b.w+s,y-r)}}};
const tySub=(b,e,z)=>{const r=z*.2,s=z*.03;return{w:b.w+e.w+s,a:b.a,d:Math.max(b.d,r+e.d),dr:(g,x,y)=>{b.dr(g,x,y);e.dr(g,x+b.w+s,y+r)}}};
const tyFrac=(c,n,m,z)=>{const ax=z*.26,gp=z*.12,w=Math.max(n.w,m.w)+z*.3,th=Math.max(1,z*.055);
return{w,a:ax+gp+n.d+n.a,d:Math.max(0,m.a+m.d+gp-ax),dr:(g,x,y)=>{const yb=y-ax;n.dr(g,x+(w-n.w)/2,yb-gp-n.d);m.dr(g,x+(w-m.w)/2,yb+gp+m.a);g.fillRect(x+z*.05,yb-th/2,w-z*.1,th)}}};
const tyRad=(c,b,z)=>{const pad=z*.1,sw=z*.6,top=b.a+z*.12,bot=b.d+z*.02,H=top+bot,w=sw+b.w+pad;
return{w,a:top+z*.06,d:bot,dr:(g,x,y)=>{const T=y-top,B=y+bot;g.save();g.lineWidth=Math.max(1,z*.055);g.lineJoin='round';g.lineCap='butt';g.beginPath();g.moveTo(x,T+H*.58);g.lineTo(x+sw*.18,T+H*.52);g.lineTo(x+sw*.45,B);g.lineTo(x+sw,T);g.lineTo(x+w,T);g.stroke();g.restore();b.dr(g,x+sw,y)}}};
const tyPar=(c,b,z,o,cl)=>{const H=b.a+b.d;if(H<=z*1.0)return tyCat([tyText(c,o,z),b,tyText(c,cl,z)]);
const pw=z*.32,pad=z*.04,e=z*.1,w=pw*2+b.w+pad*2;
return{w,a:b.a+e,d:b.d+e,dr:(g,x,y)=>{const T=y-b.a-e,B=y+b.d+e,h=B-T;g.save();g.lineWidth=Math.max(1,z*.05);g.beginPath();
g.moveTo(x+pw,T);g.bezierCurveTo(x+pw*.1,T+h*.28,x+pw*.1,T+h*.72,x+pw,B);g.moveTo(x+w-pw,T);g.bezierCurveTo(x+w-pw*.1,T+h*.28,x+w-pw*.1,T+h*.72,x+w-pw,B);g.stroke();g.restore();b.dr(g,x+pw+pad,y)}}};
const tyBar=(c,b,z)=>{const pw=z*.22,e=z*.08,w=pw*2+b.w;return{w,a:b.a+e,d:b.d+e,dr:(g,x,y)=>{const T=y-b.a-e,B=y+b.d+e;g.save();g.lineWidth=Math.max(1,z*.055);g.beginPath();g.moveTo(x+pw*.6,T);g.lineTo(x+pw*.6,B);g.moveTo(x+w-pw*.6,T);g.lineTo(x+w-pw*.6,B);g.stroke();g.restore();b.dr(g,x+pw,y)}}};
const tyMat=(c,cells,n,z)=>{const rows=[];for(let i=0;i<n;i++)rows.push(cells.slice(i*n,i*n+n));const cw=[];for(let j=0;j<n;j++)cw.push(Math.max(...rows.map(r=>r[j].w)));
const cg=z*.8,rg=z*.3,rh=rows.map(r=>({a:Math.max(...r.map(b=>b.a)),d:Math.max(...r.map(b=>b.d))}));let H=0;rh.forEach((r,i)=>{H+=r.a+r.d+(i?rg:0)});
const bw=z*.35,w=cw.reduce((p,q)=>p+q,0)+cg*(n-1)+bw*2,ax=z*.26;
return{w,a:H/2+ax,d:Math.max(0,H/2-ax),dr:(g,x,y)=>{const Tp=y-ax-H/2,Bt=Tp+H;g.save();g.lineWidth=Math.max(1,z*.05);g.beginPath();
g.moveTo(x+bw*.7,Tp);g.lineTo(x+bw*.25,Tp);g.lineTo(x+bw*.25,Bt);g.lineTo(x+bw*.7,Bt);g.moveTo(x+w-bw*.7,Tp);g.lineTo(x+w-bw*.25,Tp);g.lineTo(x+w-bw*.25,Bt);g.lineTo(x+w-bw*.7,Bt);g.stroke();g.restore();
let yy=Tp;rows.forEach((r,i)=>{yy+=rh[i].a;let xx=x+bw;r.forEach((b,j)=>{b.dr(g,xx+(cw[j]-b.w)/2,yy);xx+=cw[j]+cg});yy+=rh[i].d+rg})}}};
const tyCases=(c,rows,z)=>{const gp=z*.6,gv=z*.35,ax=z*.26;let w1=0,w2=0,H=0;rows.forEach(r=>{w1=Math.max(w1,r[0].w);w2=Math.max(w2,r[1].w)});
const lh=rows.map(r=>({a:Math.max(r[0].a,r[1].a),d:Math.max(r[0].d,r[1].d)}));lh.forEach((l,i)=>{H+=l.a+l.d+(i?gv:0)});const bw=z*.5,w=bw+w1+gp+w2;
return{w,a:H/2+ax,d:Math.max(0,H/2-ax),dr:(g,x,y)=>{const Tp=y-ax-H/2,Bt=Tp+H,M=Tp+H/2;g.save();g.lineWidth=Math.max(1,z*.05);g.beginPath();
g.moveTo(x+bw*.8,Tp);g.bezierCurveTo(x+bw*.4,Tp,x+bw*.5,M-H*.08,x+bw*.1,M);g.bezierCurveTo(x+bw*.5,M+H*.08,x+bw*.4,Bt,x+bw*.8,Bt);g.stroke();g.restore();
let yy=Tp;rows.forEach((r,i)=>{yy+=lh[i].a;r[0].dr(g,x+bw,yy);r[1].dr(g,x+bw+w1+gp,yy);yy+=lh[i].d+gv})}}};
const tyUn=n=>n.type==='ParenthesisNode'?tyUn(n.content):n;
const tyLm=n=>{while(n.type==='OperatorNode'&&n.args.length&&['multiply','pow','divide','add','subtract'].includes(n.fn))n=n.args[0];return n};
const tyFn=n=>(n.fn&&n.fn.name)||n.name||'';
function tyNode(c,n,z,lv){lv=lv||0;const T=(x,s,l)=>tyNode(c,x,s||z,l===undefined?lv:l);
switch(n.type){
case 'ConstantNode':return tyText(c,String(n.value).replace('-','−'),z);
case 'SymbolNode':{const nm=n.name;if(GK[nm])return tyText(c,itl(GK[nm]),z);return nm.length===1?tyText(c,itl(nm),z):tyText(c,nm,z)}
case 'ParenthesisNode':return tyPar(c,T(n.content),z,'(',')');
case 'OperatorNode':{const f=n.fn,a=n.args,s=z*.22;
if(f==='unaryMinus')return tyCat([tyText(c,'−',z),T(a[0])]);
if(f==='unaryPlus')return tyCat([tyText(c,'+',z),T(a[0])]);
if(f==='add'||f==='subtract')return tyCat([T(a[0]),tyGap(s),tyText(c,f==='add'?'+':'−',z),tyGap(s),T(a[1])]);
if(f==='multiply'){const dot=tyLm(a[1]).type==='ConstantNode';return tyCat([T(a[0]),tyGap(dot?z*.12:z*.07)].concat(dot?[tyText(c,'·',z),tyGap(z*.12)]:[],[T(a[1])]))}
if(f==='divide'){const fz=lv>=1?z*.78:z*.92;return tyFrac(c,tyNode(c,tyUn(a[0]),fz,lv+1),tyNode(c,tyUn(a[1]),fz,lv+1),z)}
if(f==='pow'){const b=a[0],e=tyUn(a[1]);
if(b.type==='FunctionNode'&&TRIG.has(tyFn(b))&&e.type==='ConstantNode')return tyCat([tySup(tyText(c,tyFn(b),z),tyNode(c,e,z*.7,lv+1),z),tyGap(z*.06),tyPar(c,T(b.args[0]),z,'(',')')]);
return tySup(T(b),tyNode(c,e,z*.7,lv+1),z)}
return tyText(c,String(n),z)}
case 'FunctionNode':{const nm=tyFn(n),args=n.args,A=()=>args.length===1?T(args[0]):tyCat(args.reduce((o,x,i)=>o.concat(i?[tyText(c,', ',z),T(x)]:[T(x)]),[]));
if(nm==='sqrt')return tyRad(c,T(args[0]),z);
if(nm==='abs')return tyBar(c,T(args[0]),z);
if(nm==='exp')return tySup(tyText(c,itl('e'),z),tyNode(c,tyUn(args[0]),z*.7,lv+1),z);
if(nm==='floor'||nm==='ceil')return tyCat([tyText(c,nm==='floor'?'⌊':'⌈',z),A(),tyText(c,nm==='floor'?'⌋':'⌉',z)]);
if(nm==='log10')return tyCat([tySub(tyText(c,'log',z),tyText(c,'10',z*.7),z),tyGap(z*.08),tyPar(c,A(),z,'(',')')]);
const nmap={log:'ln',asin:'arcsin',acos:'arccos',atan:'arctan'};
return tyCat([tyText(c,nmap[nm]||nm,z),tyGap(z*.06),tyPar(c,A(),z,'(',')')])}
default:return tyText(c,String(n).replace(/\*/g,'·'),z)}}
const tyPre=s=>s.replace(/[²³⁴]/g,m=>({'²':'^2','³':'^3','⁴':'^4'}[m])).replace(/×/g,'*').replace(/÷/g,'/').replace(/[−–]/g,'-').replace(/√\s*\(/g,'sqrt(').replace(/√\s*([A-Za-z0-9.]+)/g,'sqrt($1)');
const tyExpr=(c,s,z)=>{try{return tyNode(c,math.parse(tyPre(s)),z,0)}catch(e){return tyText(c,s.trim().replace(/\*/g,'·'),z)}};
function tySplit(s,ch){const o=[];let d=0,cur='';for(const k of s){if('([{'.includes(k))d++;if(')]}'.includes(k))d--;if(k===ch&&d===0){o.push(cur);cur=''}else cur+=k}o.push(cur);return o}
function tyRelSplit(s){let d=0;for(let i=0;i<s.length;i++){const k=s[i];if('([{'.includes(k))d++;else if(')]}'.includes(k))d--;else if(d===0){if(s.startsWith('<=',i)||s.startsWith('>=',i))return[s.slice(0,i),s.slice(i,i+2),s.slice(i+2)];if('<>=≤≥'.includes(k))return[s.slice(0,i),k,s.slice(i+1)]}}return null}
const tyRel=(c,s,z)=>{const r=tyRelSplit(s);if(!r)return tyExpr(c,s,z);const m={'<=':'≤','>=':'≥'},sym=m[r[1]]||r[1];return tyCat([tyExpr(c,r[0],z),tyGap(z*.25),tyText(c,sym,z),tyGap(z*.25),tyExpr(c,r[2],z)])};
function tyLhs(c,s,z){const t=s.trim();if(t==="y'"||t==='y′')return tyCat([tyText(c,itl('y'),z),tyText(c,'′',z)]);if(t==='dy/dx')return tyFrac(c,tyText(c,'d'+itl('y'),z*.9),tyText(c,'d'+itl('x'),z*.9),z);return tyExpr(c,t,z)}
function tyEq(c,raw,z){let s=raw.trim(),rg='';const sm=s.indexOf(';');if(sm>0){rg=s.slice(sm+1).trim();s=s.slice(0,sm).trim()}
let box;const rs=tyRelSplit(s),parts=tySplit(s.startsWith('(')&&s.endsWith(')')?s.slice(1,-1):'',',');
if(!rs&&parts.length>1){box=tyPar(c,tyCat(parts.reduce((o,p,i)=>o.concat(i?[tyText(c,', ',z),tyExpr(c,p,z)]:[tyExpr(c,p,z)]),[])),z,'(',')')}
else if(rs&&rs[1]==='='&&rs[2].trim().startsWith('{')&&rs[2].trim().endsWith('}')){
const rows=tySplit(rs[2].trim().slice(1,-1),',').map(p=>{const k=p.indexOf(':');return k<0?null:[tyExpr(c,p.slice(k+1),z),tyCat([tyText(c,'if ',z),tyRel(c,p.slice(0,k),z)])]}).filter(Boolean);
box=rows.length?tyCat([tyLhs(c,rs[0],z),tyGap(z*.25),tyText(c,'=',z),tyGap(z*.3),tyCases(c,rows,z)]):tyText(c,s,z)}
else if(rs&&rs[1]!=='='&&!/^\s*(y|r|z)\s*$/.test(rs[0])||(rs&&rs[1]!=='=')){const m={'<=':'≤','>=':'≥'};box=tyCat([tyExpr(c,rs[0],z),tyGap(z*.25),tyText(c,m[rs[1]]||rs[1],z),tyGap(z*.25),tyExpr(c,rs[2],z)])}
else if(rs){box=tyCat([tyLhs(c,rs[0],z),tyGap(z*.25),tyText(c,'=',z),tyGap(z*.25),tyExpr(c,rs[2],z)])}
else box=tyExpr(c,s,z);
if(rg){const items=[];rg.replace(/([tuv])\s*=\s*([^,;]+?)\s*\.\.\s*([^,;]+)/g,(m,v,a,b)=>{items.push(tyText(c,itl(v)+' ∈ ['+a.trim()+', '+b.trim()+']',z*.82));return m});
if(items.length)box=tyCat([box,tyText(c,',  ',z*.82)].concat(items.reduce((o,b,i)=>o.concat(i?[tyText(c,',  ',z*.82),b]:[b]),[])))}
return box}
function capBoxes(c,z){const out=[];if(S.mode==='mat'){const n=S.mat.n,A=n===2?S.mat.m2:S.mat.m3;
out.push(tyCat([tyText(c,itl('A'),z),tyGap(z*.3),tyText(c,'=',z),tyGap(z*.3),tyMat(c,A.map(v=>tyText(c,String(+v.toFixed(3)).replace('-','−'),z)),n,z)]));return out}
const L=(S.lists[S.mode]||[]).filter(i=>i.e.trim());L.slice(0,4).forEach(i=>out.push(tyEq(c,i.e,z)));if(L.length>4)out.push(tyText(c,'+ '+(L.length-4)+' more',z*.8));return out}
function capBand(W,T){const c=document.createElement('canvas').getContext('2d'),z=20,pad=22,bs=15,gp=34;const boxes=capBoxes(c,z);
c.font='700 '+bs+'px "DM Sans",sans-serif';const w1=c.measureText('Eigen').width;c.font='400 '+bs+'px "DM Sans",sans-serif';const bw=w1+c.measureText('Grid').width;
const availW=W-pad*2-bw-24,rows=[];let cur=[],cw=0;boxes.forEach(b=>{if(cur.length&&cw+gp+b.w>availW){rows.push(cur);cur=[];cw=0}cur.push(b);cw+=(cur.length>1?gp:0)+b.w});if(cur.length)rows.push(cur);
const rh=rows.map(r=>({a:Math.max(...r.map(b=>b.a)),d:Math.max(...r.map(b=>b.d))}));let h=pad*1.3;rh.forEach(r=>{h+=r.a+r.d+8});h=Math.max(h,pad*1.3+bs+6);
return{h,dr:(g,y0)=>{g.save();g.fillStyle=T.bg;g.fillRect(0,y0,W,h);g.strokeStyle=T.ink;g.globalAlpha=.2;g.lineWidth=1;g.beginPath();g.moveTo(pad,y0+.5);g.lineTo(W-pad,y0+.5);g.stroke();g.globalAlpha=1;
g.fillStyle=T.ink;g.strokeStyle=T.ink;g.textAlign='left';g.textBaseline='alphabetic';let y=y0+pad*.65,yl=y0+pad*.65+bs;
rows.forEach((r,i)=>{y+=rh[i].a;let x=pad;r.forEach(b=>{b.dr(g,x,y);x+=b.w+gp});yl=y;y+=rh[i].d+8});
const bx=W-pad-bw;g.font='700 '+bs+'px "DM Sans",sans-serif';g.fillText('Eigen',bx,yl);g.font='400 '+bs+'px "DM Sans",sans-serif';g.fillText('Grid',bx+w1,yl);g.restore()}}}
