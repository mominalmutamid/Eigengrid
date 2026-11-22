/* EigenGrid 2D tools: derivative/tangent/Riemann/Taylor/Newton, ODE, tables, intersections, data fitting */
function der(c,k){if(k===0)return c.f;c.d=c.d||[];if(c.d[k]!==undefined)return c.d[k];let n=c.n;
try{for(let i=0;i<k;i++)n=math.derivative(n,c.k==='pol'?'t':'x');c.d[k]=n.compile();if(k===1)c.ds=n.toString().replace(/ \* /g,'·')}catch(e){c.d[k]=null}return c.d[k]}
function fillSel(){const m=S.mode==='surf'?'surf':'plot',kf=m==='surf'?'f3':'f',sel=$('#tf'),cur=sel.value;sel.textContent='';
S.lists[m].forEach((it,i)=>{if(it.c){const o=document.createElement('option');o.value=i;o.textContent=(i+1)+': '+it.e;sel.append(o)}});
if([...sel.options].some(o=>o.value===cur))sel.value=cur;S.tool[kf]=sel.options.length?+sel.value:-1}
function toolsOde(ctx,W,H,T,gx,gy,v,s,it){const t=S.tool;if(!t.od)return;const c=it.c,sc=Object.assign({},S.params);
const f=(x,y)=>{sc.x=x;sc.y=y;return ev(c,sc)};
const M={Euler:(x,y,h)=>y+h*f(x,y),Midpoint:(x,y,h)=>y+h*f(x+h/2,y+h/2*f(x,y)),RK4:(x,y,h)=>{const k1=f(x,y),k2=f(x+h/2,y+h/2*k1),k3=f(x+h/2,y+h/2*k2),k4=f(x+h,y+h*k3);return y+h/6*(k1+2*k2+2*k3+k4)}};
const x0=t.ox,y0=t.oy,h=t.oh,n=Math.round(t.on),run=(m,hh,nn)=>{const P=[[x0,y0]];let x=x0,y=y0;for(let i=0;i<nn;i++){y=M[m](x,y,hh);x+=hh;if(!isFinite(y)||Math.abs(y)>1e6){P.blow=x;break}P.push([x,y])}return P};
const path=(P,col,w,dash,dots)=>{ctx.beginPath();P.forEach((p,i)=>i?ctx.lineTo(gx(p[0]),gy(p[1])):ctx.moveTo(gx(p[0]),gy(p[1])));ctx.strokeStyle=col;ctx.lineWidth=w;ctx.setLineDash(dash);ctx.stroke();ctx.setLineDash([]);
if(dots)P.forEach(p=>{ctx.beginPath();ctx.arc(gx(p[0]),gy(p[1]),3.2,0,7);ctx.fillStyle=col;ctx.fill()})};
const ref=run('RK4',h/20,n*20);path(ref,T.ink,1.4,[3,4],false);
const cols={Euler:'#C27C5E',Midpoint:'#6FA8D2',RK4:'#2E6B47'},names={Euler:'clay',Midpoint:'blue',RK4:'green'},L=['At x = '+fm(x0+n*h)+', step h = '+fm(h)+':'],yr=ref[ref.length-1][1];
for(const m of['Euler','Midpoint','RK4']){const P=run(m,h,n);path(P,cols[m],2.4,[],true);const yl=P[P.length-1][1];L.push(m+' ('+names[m]+'): '+(P.blow?'blows up near x ≈ '+fm(P.blow):fm(yl)+'   error '+(isFinite(yl)&&!ref.blow?Math.abs(yl-yr).toExponential(2):'-')))}
L.push(ref.blow?'The solution blows up near x ≈ '+fm(ref.blow)+', so the methods cannot be compared past that point.':'Reference (dotted, RK4 with step h/20): '+fm(yr));S.out.push(L.join('\n'))}
function nmTool(ctx,W,H,T,gx,gy,v,s,it){const t=S.tool,c=it.c,sc=Object.assign({},S.params),F=x=>{sc.x=x;return ev(c,sc)},d=der(c,1),D=x=>{sc.x=x;return ev({f:d},sc)},fp=n=>String(+Number(n).toPrecision(7)),col=colOf(it,t.f),L=[],pts=[],m=t.nmm;
if(m==='bis'){let a=t.na,b=t.nb,fa=F(a),fb=F(b);if(!(fa*fb<0))L.push('Bisection needs f(a) and f(b) with opposite signs.');
else{L.push('k | a | b | midpoint | f(mid) | error bound');for(let k=1;k<=t.nk;k++){const mid=(a+b)/2,fc=F(mid);L.push(k+' | '+fp(a)+' | '+fp(b)+' | '+fp(mid)+' | '+fp(fc)+' | '+fp((b-a)/2));pts.push(mid);if(fa*fc<=0){b=mid;fb=fc}else{a=mid;fa=fc}}}}
else if(m==='sec'){let x0=t.na,x1=t.nb;L.push('k | x | f(x)');pts.push(x0,x1);L.push('0 | '+fp(x0)+' | '+fp(F(x0)));L.push('1 | '+fp(x1)+' | '+fp(F(x1)));
for(let k=2;k<=t.nk+1;k++){const f0=F(x0),f1=F(x1);if(!isFinite(f0)||!isFinite(f1)||f1===f0)break;const x2=x1-f1*(x1-x0)/(f1-f0);L.push(k+' | '+fp(x2)+' | '+fp(F(x2)));pts.push(x2);x0=x1;x1=x2}}
else{let x=t.na;L.push('k | x | f(x) | step size');L.push('0 | '+fp(x)+' | '+fp(F(x))+' | -');pts.push(x);
for(let k=1;k<=t.nk;k++){const f=F(x),g=D(x);if(!isFinite(f)||!isFinite(g)||g===0)break;const xn=x-f/g;L.push(k+' | '+fp(xn)+' | '+fp(F(xn))+' | '+fp(Math.abs(xn-x)));x=xn;pts.push(x)}}
pts.forEach((x,i)=>{const y=F(x),last=i===pts.length-1;if(isFinite(y)){ctx.beginPath();ctx.arc(gx(x),gy(y),last?6:3.5,0,7);ctx.fillStyle=last?'#C27C5E':col;ctx.fill();ctx.lineWidth=1.5;ctx.strokeStyle='#FFFFFF';ctx.stroke()}});
S.out.push(L.join('\n'))}
function ieTool(ctx,W,H,T,gx,gy,v,s,it){const t=S.tool,c=it.c,sc=Object.assign({},S.params),F=x=>{sc.x=x;return ev(c,sc)},a=t.ia,b=t.ib;
const simp=n=>{const h=(b-a)/n;let z=F(a)+F(b);for(let i=1;i<n;i++)z+=(i%2?4:2)*F(a+i*h);return z*h/3},trap=n=>{const h=(b-a)/n;let z=(F(a)+F(b))/2;for(let i=1;i<n;i++)z+=F(a+i*h);return z*h};
const ex=simp(4000);if(!isFinite(ex)){S.out.push('Integration error table is not available here.');return}
const rt=r=>isFinite(r)?String(+r.toFixed(2)):'-',L=['n | trapezoid error | ratio | Simpson error | ratio'];let pt=null,ps=null;
for(const n of[2,4,8,16,32,64]){const et=Math.abs(trap(n)-ex),es=Math.abs(simp(n)-ex);L.push(n+' | '+et.toExponential(2)+' | '+(pt?rt(pt/et):'-')+' | '+es.toExponential(2)+' | '+(ps?rt(ps/es):'-'));pt=et;ps=es}
S.out.push('Reference integral ≈ '+fm(ex)+' (Simpson, n = 4000)\n'+L.join('\n')+'\nWhen n doubles, the trapezoid error ratio is about 4 and Simpson about 16.')}
function parsePts(t){const P=[];t.split(/[\n;]+/).forEach(l=>{const m=l.match(/-?\d*\.?\d+(?:e[+-]?\d+)?/gi);if(m&&m.length>=2){const x=+m[0],y=+m[1];if(isFinite(x)&&isFinite(y))P.push([x,y])}});return P}
function polyfit(P,deg){const n=P.length,mx=P.reduce((a,p)=>a+p[0],0)/n,sx=Math.sqrt(P.reduce((a,p)=>a+(p[0]-mx)**2,0)/n)||1,m=deg+1,A=Array.from({length:m},()=>new Array(m+1).fill(0));
P.forEach(p=>{const u=(p[0]-mx)/sx,pw=[];let q=1;for(let k=0;k<2*m;k++){pw.push(q);q*=u}for(let i=0;i<m;i++){for(let j=0;j<m;j++)A[i][j]+=pw[i+j];A[i][m]+=pw[i]*p[1]}});
for(let i=0;i<m;i++){let r=i;for(let k=i+1;k<m;k++)if(Math.abs(A[k][i])>Math.abs(A[r][i]))r=k;[A[i],A[r]]=[A[r],A[i]];if(Math.abs(A[i][i])<1e-12)return null;for(let k=i+1;k<m;k++){const f=A[k][i]/A[i][i];for(let j=i;j<=m;j++)A[k][j]-=f*A[i][j]}}
const c=new Array(m).fill(0);for(let i=m-1;i>=0;i--){let z=A[i][m];for(let j=i+1;j<m;j++)z-=A[i][j]*c[j];c[i]=z/A[i][i]}
const f=x=>{const u=(x-mx)/sx;let r=0;for(let k=m-1;k>=0;k--)r=r*u+c[k];return r},my=P.reduce((a,p)=>a+p[1],0)/n;let ssr=0,sst=0;P.forEach(p=>{ssr+=(p[1]-f(p[0]))**2;sst+=(p[1]-my)**2});
let co=[c[m-1]];for(let k=m-2;k>=0;k--){const nx=new Array(co.length+1).fill(0);co.forEach((a,i)=>{nx[i]+=a*(-mx/sx);nx[i+1]+=a/sx});nx[0]+=c[k];co=nx}
const g=z=>String(+Math.abs(z).toPrecision(5)),eq='y = '+co.map((a,i)=>(i?(a<0?' − ':' + '):(a<0?'−':''))+g(a)+(i?'x'+(i>1?'^'+i:''):'')).join('');
return{f,text:eq+'\nRMSE = '+fm(Math.sqrt(ssr/n))+(sst>0?',  R² = '+fm(1-ssr/sst):'')+(deg>=n-1?'\n(The curve passes through every point.)':'')}}
function spline(P){const n=P.length-1,h=[],al=[],l=[1],mu=[0],z=[0],c=new Array(n+1).fill(0),b=[],d=[];
for(let i=0;i<n;i++)h[i]=P[i+1][0]-P[i][0];for(let i=1;i<n;i++)al[i]=3/h[i]*(P[i+1][1]-P[i][1])-3/h[i-1]*(P[i][1]-P[i-1][1]);
for(let i=1;i<n;i++){l[i]=2*(P[i+1][0]-P[i-1][0])-h[i-1]*mu[i-1];mu[i]=h[i]/l[i];z[i]=(al[i]-h[i-1]*z[i-1])/l[i]}
for(let j=n-1;j>=0;j--){c[j]=z[j]-mu[j]*c[j+1];b[j]=(P[j+1][1]-P[j][1])/h[j]-h[j]*(c[j+1]+2*c[j])/3;d[j]=(c[j+1]-c[j])/(3*h[j])}
return x=>{let j=0;while(j<n-1&&x>P[j+1][0])j++;const dx=x-P[j][0];return P[j][1]+b[j]*dx+c[j]*dx*dx+d[j]*dx*dx*dx}}
function drawData(ctx,W,H,T,gx,gy,v,s){const d=S.data;if(!d.txt.trim())return;const P=parsePts(d.txt);if(!P.length)return;const n=P.length;let fn=null,rng=null,info='';
if(d.fit==='line'||d.fit==='poly'){if(n<2)info='Add at least 2 points to fit.';else{const r=polyfit(P,d.fit==='line'?1:Math.min(+d.deg,n-1));if(r){fn=r.f;info=r.text}else info='Could not fit these points.'}}
else if(d.fit==='spl'){const Q=P.slice().sort((a,b)=>a[0]-b[0]);if(n<3)info='A spline needs at least 3 points.';else if(!Q.every((p,i)=>!i||p[0]>Q[i-1][0]))info='A spline needs different x values.';else{fn=spline(Q);rng=[Q[0][0],Q[n-1][0]];info='Natural cubic spline through all '+n+' points.'}}
if(fn){ctx.strokeStyle='#2E6B47';ctx.lineWidth=2.6;ctx.beginPath();let pen=false;for(let px=0;px<=W;px++){const x=v.cx+(px-W/2)/s;if(rng&&(x<rng[0]||x>rng[1])){pen=false;continue}const y=fn(x);if(!isFinite(y)){pen=false;continue}const Y=gy(y);pen?ctx.lineTo(px,Y):ctx.moveTo(px,Y);pen=true}ctx.stroke()}
P.forEach(p=>{ctx.beginPath();ctx.arc(gx(p[0]),gy(p[1]),5,0,7);ctx.fillStyle='#C27C5E';ctx.fill();ctx.lineWidth=2;ctx.strokeStyle='#FFFFFF';ctx.stroke()});S.fout=info}
function hp(ctx,gx,gy,it){const c=it.c,col=colOf(it,S.tool.f),sc=Object.assign({},S.params);
return{c,col,sc,dot:(x,y,r,cc)=>{ctx.beginPath();ctx.arc(gx(x),gy(y),r,0,7);ctx.fillStyle=cc||col;ctx.fill();ctx.lineWidth=2;ctx.strokeStyle='#FFFFFF';ctx.stroke()},
line:(x0,y0,x1,y1)=>{ctx.beginPath();ctx.moveTo(gx(x0),gy(y0));ctx.lineTo(gx(x1),gy(y1));ctx.stroke()}}}
function toolsPol(ctx,W,H,T,gx,gy,v,s,it){const t=S.tool,{c,col,sc,dot,line}=hp(ctx,gx,gy,it);
const R=(f,u)=>{if(!f)return NaN;sc.t=u;return ev({f},sc)},r0=u=>R(c.f,u);
const drawP=(g,dash,a0=0,b0=12*Math.PI)=>{ctx.beginPath();let pen=false;for(let u=a0;u<=b0;u+=0.01){const r=g(u);if(!isFinite(r)){pen=false;continue}const X=gx(r*Math.cos(u)),Y=gy(r*Math.sin(u));pen?ctx.lineTo(X,Y):ctx.moveTo(X,Y);pen=true}ctx.setLineDash(dash);ctx.stroke();ctx.setLineDash([])};
ctx.lineCap='round';
if(t.der){const d=der(c,1);if(d){ctx.strokeStyle=col;ctx.lineWidth=2.2;drawP(u=>R(d,u),[8,6]);S.out.push('dr/dθ (θ is written t) = '+c.ds)}else S.out.push('Derivative is not available for this expression.')}
if(t.tan){const d=der(c,1),u=t.tx,r=r0(u),rp=R(d,u),dx=rp*Math.cos(u)-r*Math.sin(u),dy=rp*Math.sin(u)+r*Math.cos(u),l=Math.hypot(dx,dy);
if(isFinite(l)&&l>0){const x=r*Math.cos(u),y=r*Math.sin(u),L=(W+H)/s;ctx.strokeStyle=T.ink;ctx.lineWidth=1.6;line(x-dx/l*L,y-dy/l*L,x+dx/l*L,y+dy/l*L);dot(x,y,5);S.out.push('Tangent at θ = '+fm(u)+': point ('+fm(x)+', '+fm(y)+'), slope = '+(Math.abs(dx)<1e-9?'vertical':fm(dy/dx)))}}
if(t.rie){const A=t.ra,B=t.rb,n=Math.round(t.rn),w=(B-A)/n;let sum=0;ctx.fillStyle=col;ctx.strokeStyle=col;ctx.lineWidth=1;
ctx.beginPath();ctx.moveTo(gx(0),gy(0));for(let u=Math.min(A,B);u<=Math.max(A,B);u+=0.02){const r=r0(u);if(isFinite(r))ctx.lineTo(gx(r*Math.cos(u)),gy(r*Math.sin(u)))}ctx.closePath();ctx.globalAlpha=.16;ctx.fill();ctx.globalAlpha=1;
for(let i=0;i<n;i++){const ul=A+i*w,ur=ul+w,rl=r0(ul),rr=r0(ur);let q2,sg;
if(t.rm==='trap'){q2=(rl*rl+rr*rr)/2;sg=rl+rr}else{const r=r0(t.rm==='left'?ul:t.rm==='right'?ur:ul+w/2);q2=r*r;sg=r}
if(!isFinite(q2))continue;sum+=q2*w/2;const o=sg<0?Math.PI:0;
ctx.beginPath();ctx.moveTo(gx(0),gy(0));ctx.arc(gx(0),gy(0),Math.sqrt(q2)*s,-(ul+o),-(ur+o),w>0);ctx.closePath();ctx.globalAlpha=.25;ctx.fill();ctx.globalAlpha=.8;ctx.stroke()}
ctx.globalAlpha=1;let ex=0;const m2=1000,h2=(B-A)/m2;for(let i=0;i<=m2;i++){const r=r0(A+i*h2);ex+=(i===0||i===m2?1:i%2?4:2)*r*r/2}ex*=h2/3;
S.out.push('Polar area ≈ '+fm(sum)+(isFinite(ex)?'\nExact area ≈ '+fm(ex)+'  (error '+fm(Math.abs(sum-ex))+')':''))}
if(t.tay){const n=Math.round(t.tn),cc=t.tc,co=[];let ok=true;
for(let k=0;k<=n;k++){const v0=R(der(c,k),cc);if(!isFinite(v0)){ok=false;break}let f=1;for(let i=2;i<=k;i++)f*=i;co.push(v0/f)}
if(ok){const P=u=>{let r=0;for(let k=co.length-1;k>=0;k--)r=r*(u-cc)+co[k];return r};ctx.strokeStyle=T.ink;ctx.lineWidth=2.2;drawP(P,[2,6],cc-4,cc+4);const r=r0(cc);dot(r*Math.cos(cc),r*Math.sin(cc),5);S.out.push('Taylor polynomial of r(θ), degree '+n+', about θ = '+fm(cc))}else S.out.push('Taylor polynomial is not available here.')}
if(t.nw){const d=der(c,1);let u=t.nx;const xs=[u];
for(let i=0;i<Math.round(t.ns);i++){const r=r0(u),rp=R(d,u);if(!isFinite(r)||!isFinite(rp)||rp===0)break;dot(r*Math.cos(u),r*Math.sin(u),3.5);u-=r/rp;xs.push(u)}
S.out.push('Newton on r(θ) = 0: θ = '+xs.map(fm).join(' → ')+'\nr(θ) ≈ '+(+r0(u).toPrecision(3)))}}
function toolsImp(ctx,W,H,T,gx,gy,v,s,it){const t=S.tool,{c,col,sc,dot,line}=hp(ctx,gx,gy,it);
const F=(x,y)=>{sc.x=x;sc.y=y;return ev(c,sc)},Q=(f,x,y)=>{if(!f)return NaN;sc.x=x;sc.y=y;return ev({f},sc)},fx=pdv(c,'x'),fy=pdv(c,'y');
const x0=v.cx-W/2/s,x1=v.cx+W/2/s,y0=v.cy-H/2/s,y1=v.cy+H/2/s;
const yr=x=>{const o=[],st=(y1-y0)/300;let py=y0,pv=F(x,py);for(let y=y0+st;y<=y1;y+=st){const nv=F(x,y);if(isFinite(pv)&&isFinite(nv)&&pv*nv<=0&&pv!==nv){let a=py,b=y,fa=pv;for(let k=0;k<40;k++){const m=(a+b)/2,fv=F(x,m);if(fa*fv<=0)b=m;else{a=m;fa=fv}}const r=(a+b)/2;if(Math.abs(F(x,r))<=Math.max(Math.abs(pv),Math.abs(nv))*1e-3)o.push(r)}py=y;pv=nv}return o};
ctx.lineCap='round';
if(t.der){if(c.sx===undefined){try{c.sx=math.derivative(c.n,'x').toString();c.sy=math.derivative(c.n,'y').toString()}catch(e){c.sx=null}}
S.out.push(c.sx?'dy/dx = −('+c.sx+') / ('+c.sy+')':'Derivative is not available for this expression.')}
if(t.tan){const x=t.tx,ys=yr(x);if(!ys.length)S.out.push('No point of the curve at x = '+fm(x)+' in view.');
ys.slice(0,4).forEach(y=>{const a=Q(fx,x,y),b=Q(fy,x,y);if(!isFinite(a)||!isFinite(b))return;ctx.strokeStyle=T.ink;ctx.lineWidth=1.6;
if(Math.abs(b)<1e-9)line(x,y0,x,y1);else{const m=-a/b;line(x0,y+m*(x0-x),x1,y+m*(x1-x))}dot(x,y,5);
S.out.push('At ('+fm(x)+', '+fm(y)+'): slope = '+(Math.abs(b)<1e-9?'vertical':fm(-a/b)))})}
if(t.rie&&c.last){const A=Math.min(t.ra,t.rb),B=Math.max(t.ra,t.rb),{V,nx,ny,cs}=c.last;let ar=0;ctx.fillStyle=col;ctx.globalAlpha=.2;ctx.beginPath();
for(let j=0;j<ny-1;j++)for(let i=0;i<nx-1;i++){const xm=v.cx+((i+.5)*cs-W/2)/s;if(xm<A||xm>B)continue;const q=[V[j*nx+i],V[j*nx+i+1],V[(j+1)*nx+i],V[(j+1)*nx+i+1]];if(!q.every(isFinite))continue;const n=q.filter(z=>z<0).length;ar+=n/4*(cs/s)*(cs/s);if(n>=2)ctx.rect(i*cs,j*cs,cs,cs)}
ctx.fill();ctx.globalAlpha=1;S.out.push('Area where F < 0, for x from '+fm(A)+' to '+fm(B)+' ≈ '+fm(ar)+'\n(grid estimate; for a closed curve this is the area inside it)')}
if(t.tay){const cc=t.tc,ys=yr(cc);if(!ys.length)S.out.push('No point of the curve at x = '+fm(cc)+' in view.');
ys.slice(0,2).forEach(y=>{const a=Q(fx,cc,y),b=Q(fy,cc,y),axx=Q(pdd(c,'x','x'),cc,y),axy=Q(pdd(c,'x','y'),cc,y),ayy=Q(pdd(c,'y','y'),cc,y);
if(![a,b,axx,axy,ayy].every(isFinite)||Math.abs(b)<1e-9)return;const p=-a/b,q=-(axx*b*b-2*axy*a*b+ayy*a*a)/(b*b*b);
ctx.strokeStyle=T.ink;ctx.lineWidth=2.2;ctx.setLineDash([2,6]);ctx.beginPath();for(let px=0;px<=W;px++){const d=v.cx+(px-W/2)/s-cc,Y=gy(y+p*d+q/2*d*d);px?ctx.lineTo(px,Y):ctx.moveTo(px,Y)}ctx.stroke();ctx.setLineDash([]);dot(cc,y,5);
S.out.push('Degree 2 Taylor at ('+fm(cc)+', '+fm(y)+'): y′ = '+fm(p)+', y″ = '+fm(q))})}
if(t.nw){let x=t.nx;const xs=[x];for(let i=0;i<Math.round(t.ns);i++){const f=F(x,0),g=Q(fx,x,0);if(!isFinite(f)||!isFinite(g)||g===0)break;dot(x,0,3.5);x-=f/g;xs.push(x)}
S.out.push('Newton for F(x, 0) = 0, the x-intercept: '+xs.map(fm).join(' → ')+'\nF ≈ '+(+F(x,0).toPrecision(3)))}}
function cinfo(it,gx,gy,v,W,H,s){const c=it.c,sc=Object.assign({},S.params),k=c.k;let pt,G,a,b,N;
if(k==='ex'){pt=u=>{sc.x=u;return[u,ev(c,sc)]};G=(x,y)=>{sc.x=x;return y-ev(c,sc)};a=v.cx-W/2/s;b=v.cx+W/2/s;N=800}
else if(k==='pol'){pt=u=>{sc.t=u;const r=ev(c,sc);return[r*Math.cos(u),r*Math.sin(u)]};a=0;b=12*Math.PI;N=2400}
else return{G:k==='imp'?(x,y)=>{sc.x=x;sc.y=y;return ev(c,sc)}:undefined,segs:c.pseg||[]};
const segs=[];let p=null,u0=0;
for(let i=0;i<=N;i++){const u=a+(b-a)*i/N,q=pt(u);if(!isFinite(q[0])||!isFinite(q[1])){p=null;continue}const X=gx(q[0]),Y=gy(q[1]);if(p&&Math.abs(Y-p[1])<H*1.5&&Math.abs(X-p[0])<W*1.5)segs.push([p[0],p[1],X,Y,u0,u]);p=[X,Y];u0=u}
return{pt,G,segs}}
function interTool(ctx,W,H,T,gx,gy,v,s,it){const A=cinfo(it,gx,gy,v,W,H,s),Bs=[],pts=[],xa=v.cx-W/2/s,xb=v.cx+W/2/s;
S.lists.plot.forEach((o,j)=>{if(j!==S.tool.f&&o.c)Bs.push(cinfo(o,gx,gy,v,W,H,s))});
Bs.push({G:(x,y)=>y,pt:u=>[u,0],segs:[[gx(xa),gy(0),gx(xb),gy(0),xa,xb]]});
const ref=(X,sg,G)=>{if(!X.pt||!G||sg.length<6)return null;let lo=sg[4],hi=sg[5];const f=u=>{const q=X.pt(u);return G(q[0],q[1])};let fl=f(lo),fh=f(hi);if(!(isFinite(fl)&&isFinite(fh))||fl*fh>0)return null;
for(let i=0;i<40;i++){const m=(lo+hi)/2,fv=f(m);if(fl*fv<=0)hi=m;else{lo=m;fl=fv}}return X.pt((lo+hi)/2)};
for(const B of Bs)for(const a of A.segs){const ax0=Math.min(a[0],a[2]),ax1=Math.max(a[0],a[2]),ay0=Math.min(a[1],a[3]),ay1=Math.max(a[1],a[3]);
for(const b of B.segs){if(Math.max(b[0],b[2])<ax0||Math.min(b[0],b[2])>ax1||Math.max(b[1],b[3])<ay0||Math.min(b[1],b[3])>ay1)continue;
const d1x=a[2]-a[0],d1y=a[3]-a[1],d2x=b[2]-b[0],d2y=b[3]-b[1],den=d1x*d2y-d1y*d2x;if(!den)continue;
const tt=((b[0]-a[0])*d2y-(b[1]-a[1])*d2x)/den,uu=((b[0]-a[0])*d1y-(b[1]-a[1])*d1x)/den;if(tt<0||tt>1||uu<0||uu>1)continue;
let P=ref(A,a,B.G)||ref(B,b,A.G);if(!P){const px=a[0]+tt*d1x,py=a[1]+tt*d1y;P=[v.cx+(px-W/2)/s,v.cy-(py-H/2)/s]}
if(isFinite(P[0])&&isFinite(P[1]))pts.push(P)}}
const u2=[];pts.forEach(p=>{if(!u2.some(q=>Math.hypot((p[0]-q[0])*s,(p[1]-q[1])*s)<4))u2.push(p)});
ctx.font='12px "DM Sans",sans-serif';ctx.textAlign='left';
u2.slice(0,14).forEach(p=>{ctx.beginPath();ctx.arc(gx(p[0]),gy(p[1]),5,0,7);ctx.fillStyle=T.ink;ctx.fill();ctx.lineWidth=2;ctx.strokeStyle='#FFFFFF';ctx.stroke();ctx.fillText('('+fm(p[0])+', '+fm(p[1])+')',gx(p[0])+8,gy(p[1])-8)});
S.out.push(u2.length+' zero or intersection point(s) in view')}
function tools(ctx,W,H,T,gx,gy,v,s){const t=S.tool,it=S.lists.plot[t.f];if(!it||!it.c)return;const k=it.c.k;if(k==='par'){S.out.push('Tools are not available for parametric curves yet.');return}
(k==='ex'?toolsEx:k==='pol'?toolsPol:k==='ode'?toolsOde:toolsImp)(ctx,W,H,T,gx,gy,v,s,it);if(k==='ex'){if(t.nm)nmTool(ctx,W,H,T,gx,gy,v,s,it);if(t.ie)ieTool(ctx,W,H,T,gx,gy,v,s,it)}else if(t.nm||t.ie)S.out.push('Root finding and integration tables need a curve written as y = f(x).');if(t.od&&k!=='ode')S.out.push('ODE solvers need an equation like y′ = x - y.');if(t.tb){if(k==='imp'||k==='ode')S.out.push(k==='ode'?'Table of values is not available for slope fields.':'Table of values is not available for implicit curves. Solve for y to use it.');else{const A=cinfo(it,gx,gy,v,W,H,s),n=Math.round(t.tbn),L=[k==='ex'?'x → y':'θ → (x, y)'];
for(let i=0;i<n;i++){const u=t.tbf+i*t.tbs,q=A.pt(u),ok=isFinite(q[0])&&isFinite(q[1]);L.push(fm(u)+' → '+(ok?(k==='ex'?fm(q[1]):'('+fm(q[0])+', '+fm(q[1])+')'):'undefined'))}S.out.push(L.join('\n'))}}
if(t.ix)interTool(ctx,W,H,T,gx,gy,v,s,it)}
function toolsEx(ctx,W,H,T,gx,gy,v,s,it){const t=S.tool;
const c=it.c,col=colOf(it,t.f),sc=Object.assign({},S.params),x0=v.cx-W/2/s,x1=v.cx+W/2/s;
const E=(f,x)=>{if(!f)return NaN;sc.x=x;return ev({f},sc)},F=x=>E(c.f,x);
const draw=(g,dash)=>{ctx.beginPath();let pen=false,py=0;for(let px=0;px<=W;px++){const y=g(v.cx+(px-W/2)/s);if(!isFinite(y)){pen=false;continue}const Y=gy(y);if(pen&&Math.abs(Y-py)>H*1.5)pen=false;pen?ctx.lineTo(px,Y):ctx.moveTo(px,Y);pen=true;py=Y}ctx.setLineDash(dash);ctx.stroke();ctx.setLineDash([])};
const dot=(x,y,r,cc)=>{ctx.beginPath();ctx.arc(gx(x),gy(y),r,0,7);ctx.fillStyle=cc||col;ctx.fill();ctx.lineWidth=2;ctx.strokeStyle='#FFFFFF';ctx.stroke()};
ctx.lineCap='round';
if(t.der){const d=der(c,1);if(d){ctx.strokeStyle=col;ctx.lineWidth=2.2;draw(x=>E(d,x),[8,6]);S.out.push('f′(x) = '+c.ds)}else S.out.push('Derivative is not available for this expression.')}
if(t.tan){const d=der(c,1),a=t.tx,y=F(a),m=E(d,a);if(isFinite(y)&&isFinite(m)){ctx.strokeStyle=T.ink;ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(gx(x0),gy(y+m*(x0-a)));ctx.lineTo(gx(x1),gy(y+m*(x1-a)));ctx.stroke();dot(a,y,5);S.out.push('Tangent at x = '+fm(a)+': y = '+fm(y)+', slope = '+fm(m))}}
if(t.rie){const A=t.ra,Bv=t.rb,n=Math.round(t.rn),w=(Bv-A)/n;let sum=0;ctx.fillStyle=col;ctx.strokeStyle=col;ctx.lineWidth=1;
ctx.beginPath();ctx.moveTo(gx(Math.min(A,Bv)),gy(0));for(let px=gx(Math.min(A,Bv));px<=gx(Math.max(A,Bv));px+=2){const y=F(v.cx+(px-W/2)/s);ctx.lineTo(px,gy(isFinite(y)?y:0))}ctx.lineTo(gx(Math.max(A,Bv)),gy(0));ctx.closePath();ctx.globalAlpha=.16;ctx.fill();ctx.globalAlpha=1;
for(let i=0;i<n;i++){const xl=A+i*w,xr=xl+w;
if(t.rm==='trap'){const yl=F(xl),yr=F(xr);if(!isFinite(yl)||!isFinite(yr))continue;sum+=(yl+yr)/2*w;ctx.beginPath();ctx.moveTo(gx(xl),gy(0));ctx.lineTo(gx(xl),gy(yl));ctx.lineTo(gx(xr),gy(yr));ctx.lineTo(gx(xr),gy(0));ctx.closePath();ctx.globalAlpha=.25;ctx.fill();ctx.globalAlpha=.8;ctx.stroke()}
else{const h=F(t.rm==='left'?xl:t.rm==='right'?xr:xl+w/2);if(!isFinite(h))continue;sum+=h*w;ctx.globalAlpha=.25;ctx.fillRect(gx(xl),gy(Math.max(h,0)),w*s,Math.abs(h)*s);ctx.globalAlpha=.8;ctx.strokeRect(gx(xl),gy(Math.max(h,0)),w*s,Math.abs(h)*s)}}
ctx.globalAlpha=1;let ex=0;const m2=1000,h2=(Bv-A)/m2;for(let i=0;i<=m2;i++)ex+=(i===0||i===m2?1:i%2?4:2)*F(A+i*h2);ex*=h2/3;
S.out.push('Riemann sum ≈ '+fm(sum)+(isFinite(ex)?'\nExact area ≈ '+fm(ex)+'  (error '+fm(Math.abs(sum-ex))+')':''))}
if(t.tay){const n=Math.round(t.tn),cc=t.tc,co=[];let ok=true;
for(let k=0;k<=n;k++){const v0=E(der(c,k),cc);if(!isFinite(v0)){ok=false;break}let f=1;for(let i=2;i<=k;i++)f*=i;co.push(v0/f)}
if(ok){const P=x=>{let r=0;for(let k=co.length-1;k>=0;k--)r=r*(x-cc)+co[k];return r};ctx.strokeStyle=T.ink;ctx.lineWidth=2.2;draw(P,[2,6]);dot(cc,F(cc),5);S.out.push('Taylor polynomial, degree '+n+', about x = '+fm(cc))}else S.out.push('Taylor polynomial is not available here.')}
if(t.nw){const d=der(c,1);let x=t.nx;const xs=[x];ctx.lineWidth=1.4;ctx.strokeStyle=T.ink;
for(let i=0;i<Math.round(t.ns);i++){const y=F(x),m=E(d,x);if(!isFinite(y)||!isFinite(m)||m===0)break;const xn=x-y/m;ctx.beginPath();ctx.moveTo(gx(x),gy(0));ctx.lineTo(gx(x),gy(y));ctx.lineTo(gx(xn),gy(0));ctx.stroke();dot(x,y,3.5);x=xn;xs.push(x)}
S.out.push('Newton: '+xs.map(fm).join(' → ')+'\nf(x) ≈ '+(+F(x).toPrecision(3)))}
}
