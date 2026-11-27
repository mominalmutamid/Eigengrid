/* EigenGrid matrix view: 2x2 plane and 3x3 space, eigenvalues */
function matA(){const m=S.mat,n=m.n,A=n===2?m.m2:m.m3,t=(S.anim||S.vid)?(1-Math.cos(S.params.time*1.2))/2:m.t,I=n===2?[1,0,0,1]:[1,0,0,0,1,0,0,0,1],R=A.map((a,i)=>I[i]+t*(a-I[i]));R.t=t;return R}
function arrow2(ctx,x0,y0,x1,y1,col,w){const a=Math.atan2(y1-y0,x1-x0),hl=10;ctx.setLineDash([]);ctx.strokeStyle=col;ctx.fillStyle=col;ctx.lineWidth=w;ctx.beginPath();ctx.moveTo(x0,y0);ctx.lineTo(x1,y1);ctx.stroke();
ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x1-hl*Math.cos(a-.4),y1-hl*Math.sin(a-.4));ctx.lineTo(x1-hl*Math.cos(a+.4),y1-hl*Math.sin(a+.4));ctx.closePath();ctx.fill()}
function eig2(M){const[a,b,c,d]=M,tr=a+d,det=a*d-b*c,disc=tr*tr/4-det;if(disc<-1e-12)return{tr,det,cplx:true,re:tr/2,im:Math.sqrt(-disc),e:[]};
const r=Math.sqrt(Math.max(0,disc)),ls=r<1e-12?[tr/2]:[tr/2+r,tr/2-r];
const e=ls.map(l=>{let v;if(Math.abs(b)>1e-12)v=[b,l-a];else if(Math.abs(c)>1e-12)v=[l-d,c];else v=Math.abs(l-a)<1e-9?[1,0]:[0,1];const k=Math.hypot(v[0],v[1])||1;return{l,v:[v[0]/k,v[1]/k]}});
if(r<1e-12&&Math.abs(b)<1e-12&&Math.abs(c)<1e-12)e.push({l:tr/2,v:[0,1]});return{tr,det,cplx:false,e}}
function eig3(M){const[a,b,c,d,e,f,g,h,i]=M,tr=a+e+i,c2=(a*e-b*d)+(a*i-c*g)+(e*i-f*h),det=a*(e*i-f*h)-b*(d*i-f*g)+c*(d*h-e*g);
const A2=-tr,B=c2,C=-det,p=B-A2*A2/3,q=2*A2*A2*A2/27-A2*B/3+C,disc=q*q/4+p*p*p/27;let L=[],cp=null;
if(disc>1e-12){const sd=Math.sqrt(disc),u=Math.cbrt(-q/2+sd),w=Math.cbrt(-q/2-sd);L=[u+w-A2/3];cp={re:-(u+w)/2-A2/3,im:Math.sqrt(3)/2*Math.abs(u-w)}}
else{const r=Math.sqrt(Math.max(0,-p/3)),ph=r<1e-12?0:Math.acos(Math.max(-1,Math.min(1,-q/2/(r*r*r))));for(let k=0;k<3;k++)L.push(2*r*Math.cos((ph+2*Math.PI*k)/3)-A2/3)}
const P=x=>((x+A2)*x+B)*x+C,dP=x=>(3*x+2*A2)*x+B;L=L.map(x=>{for(let k=0;k<4;k++){const dd=dP(x);if(Math.abs(dd)<1e-12)break;x-=P(x)/dd}return x});
const cr=(u,v)=>[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];
const vec=l=>{const R=[[a-l,b,c],[d,e-l,f],[g,h,i-l]],cs=[cr(R[0],R[1]),cr(R[0],R[2]),cr(R[1],R[2])].map(v=>({v,n:Math.hypot(...v)})).sort((x,y)=>y.n-x.n);let v=cs[0].v,n=cs[0].n;
if(n<1e-9){const r=R.map(x=>({x,n:Math.hypot(...x)})).sort((p,q)=>q.n-p.n)[0];if(r.n<1e-9)return[1,0,0];const ax=Math.abs(r.x[0])<=Math.abs(r.x[1])&&Math.abs(r.x[0])<=Math.abs(r.x[2])?[1,0,0]:Math.abs(r.x[1])<=Math.abs(r.x[2])?[0,1,0]:[0,0,1];v=cr(r.x,ax);n=Math.hypot(...v)}return v.map(z=>z/n)};
const E=[];L.forEach(l=>{const q=E.find(q=>Math.abs(q.l-l)<1e-5);if(q)q.mult=(q.mult||1)+1;else E.push({l,v:vec(l)})});return{tr,det,cp,e:E}}
function matView(ctx,W,H,T,o){const M=matA(),f=z=>String(+z.toFixed(3));S.mat.n===2?mat2(ctx,W,H,T,o,M,f):mat3(ctx,W,H,T,o,M,f)}
function mat2(ctx,W,H,T,o,M,f){const v=S.view,s=v.s,gx=x=>W/2+(x-v.cx)*s,gy=y=>H/2-(y-v.cy)*s,[a,b,c,d]=M,tf=(x,y)=>[a*x+b*y,c*x+d*y],K=20,L=60,V=S.mat.v,E=eig2(M);
const seg=(p,q)=>{ctx.moveTo(gx(p[0]),gy(p[1]));ctx.lineTo(gx(q[0]),gy(q[1]))};
if(o.grid){ctx.strokeStyle=T.grid;ctx.lineWidth=1;ctx.beginPath();for(let k=-K;k<=K;k++){seg([k,-L],[k,L]);seg([-L,k],[L,k])}ctx.stroke();ctx.strokeStyle=T.axis;ctx.lineWidth=1.5;ctx.beginPath();seg([-L,0],[L,0]);seg([0,-L],[0,L]);ctx.stroke()}
ctx.lineWidth=1.3;ctx.globalAlpha=.65;ctx.strokeStyle='#6FA8D2';ctx.beginPath();for(let k=-K;k<=K;k++)seg(tf(k,-L),tf(k,L));ctx.stroke();
ctx.strokeStyle='#A9729A';ctx.beginPath();for(let k=-K;k<=K;k++)seg(tf(-L,k),tf(L,k));ctx.stroke();ctx.globalAlpha=1;
ctx.setLineDash([5,5]);ctx.strokeStyle=T.axis;ctx.lineWidth=1.2;ctx.beginPath();seg([0,0],[1,0]);seg([1,0],[1,1]);seg([1,1],[0,1]);seg([0,1],[0,0]);ctx.stroke();ctx.setLineDash([]);
const Q=[tf(0,0),tf(1,0),tf(1,1),tf(0,1)];ctx.beginPath();Q.forEach((p,i)=>i?ctx.lineTo(gx(p[0]),gy(p[1])):ctx.moveTo(gx(p[0]),gy(p[1])));ctx.closePath();ctx.fillStyle='#2E6B47';ctx.globalAlpha=.2;ctx.fill();ctx.globalAlpha=1;ctx.strokeStyle='#2E6B47';ctx.lineWidth=2;ctx.stroke();
E.e.forEach(q=>{ctx.setLineDash([8,6]);ctx.strokeStyle='#C27C5E';ctx.lineWidth=2.2;ctx.beginPath();seg([-L*q.v[0],-L*q.v[1]],[L*q.v[0],L*q.v[1]]);ctx.stroke();ctx.setLineDash([])});
ctx.globalAlpha=.4;arrow2(ctx,gx(0),gy(0),gx(1),gy(0),T.axis,2);arrow2(ctx,gx(0),gy(0),gx(0),gy(1),T.axis,2);ctx.globalAlpha=1;
arrow2(ctx,gx(0),gy(0),gx(a),gy(c),'#7B2D52',3);arrow2(ctx,gx(0),gy(0),gx(b),gy(d),'#2E6B47',3);
const Av=tf(V[0],V[1]);arrow2(ctx,gx(0),gy(0),gx(V[0]),gy(V[1]),T.axis,2.4);arrow2(ctx,gx(0),gy(0),gx(Av[0]),gy(Av[1]),'#EE7F9C',2.8);
ctx.font='600 13px "DM Sans",sans-serif';ctx.textAlign='left';
const lab=(t,p,col)=>{ctx.fillStyle=col;ctx.fillText(t,gx(p[0])+8,gy(p[1])-8)};lab('A·e₁',[a,c],'#7B2D52');lab('A·e₂',[b,d],'#2E6B47');lab('v',V,T.ink);lab('A·v',Av,'#EE7F9C');
E.e.forEach((q,i)=>lab('λ'+['₁','₂'][i]+' = '+f(q.l),[q.v[0]*3,q.v[1]*3],'#C27C5E'));
const det=a*d-b*c,rk=Math.abs(det)>1e-9?2:(M.some(z=>Math.abs(z)>1e-9)?1:0),t=['Matrix: [['+f(a)+', '+f(b)+'], ['+f(c)+', '+f(d)+']]'];
if(M.t<1||S.anim)t.push('Showing the blend I + t(A − I), t = '+f(M.t));
t.push('Determinant = '+f(det)+(det<0?' (flips orientation)':'')+',  trace = '+f(a+d),'Area scale factor = '+f(Math.abs(det))+',  rank = '+rk);
t.push(rk===2?'Inverse: [['+f(d/det)+', '+f(-b/det)+'], ['+f(-c/det)+', '+f(a/det)+']]':'Not invertible: the plane is squashed.');
if(E.cplx)t.push('Eigenvalues: '+f(E.re)+' ± '+f(E.im)+'i  (no real eigenvectors: it rotates)');else E.e.forEach((q,i)=>t.push('λ'+['₁','₂'][i]+' = '+f(q.l)+',  eigenvector ('+f(q.v[0])+', '+f(q.v[1])+')'));
t.push('A·v = ('+f(Av[0])+', '+f(Av[1])+') for v = ('+f(V[0])+', '+f(V[1])+')');S.mout=t.join('\n')}
function mat3(ctx,W,H,T,o,M,f){const a=S.rot.a,b=S.rot.b,ca=Math.cos(a),sa=Math.sin(a),cb=Math.cos(b),sb=Math.sin(b),u=Math.min(W,H)*0.5/4.4*S.zoom,B=4,V=S.mat.v;
const pr=(x,y,z)=>{const x1=x*ca-y*sa,y1=x*sa+y*ca;return[W/2+x1*u,H/2-(z*cb+y1*sb)*u,y1*cb-z*sb]},tf=(x,y,z)=>[M[0]*x+M[1]*y+M[2]*z,M[3]*x+M[4]*y+M[5]*z,M[6]*x+M[7]*y+M[8]*z];
const ln=(p,q)=>{const A=pr(...p),C=pr(...q);ctx.moveTo(A[0],A[1]);ctx.lineTo(C[0],C[1])},E=eig3(M),O=[0,0,0];
if(o.grid){ctx.strokeStyle=T.axis;ctx.lineWidth=1;ctx.globalAlpha=.22;ctx.beginPath();for(let i=-B;i<=B;i++){ln([i,-B,0],[i,B,0]);ln([-B,i,0],[B,i,0])}ctx.stroke();
ctx.globalAlpha=.7;ctx.lineWidth=1.6;ctx.beginPath();ln([-B,0,0],[B,0,0]);ln([0,-B,0],[0,B,0]);ln([0,0,-B],[0,0,B]);ctx.stroke();ctx.globalAlpha=1;ctx.fillStyle=T.axis;ctx.font='600 13px "DM Sans",sans-serif';ctx.textAlign='center';
[[1,0,0,'x'],[0,1,0,'y'],[0,0,1,'z']].forEach(([x,y,z,l])=>{const p=pr(x*B*1.1,y*B*1.1,z*B*1.1);ctx.fillText(l,p[0],p[1]+5)})}
const cube=[];for(let k=0;k<8;k++)cube.push([k&1,(k>>1)&1,(k>>2)&1]);
ctx.setLineDash([4,4]);ctx.strokeStyle=T.axis;ctx.globalAlpha=.4;ctx.lineWidth=1;ctx.beginPath();[[0,1],[1,3],[3,2],[2,0],[4,5],[5,7],[7,6],[6,4],[0,4],[1,5],[2,6],[3,7]].forEach(([i,j])=>ln(cube[i],cube[j]));ctx.stroke();ctx.setLineDash([]);ctx.globalAlpha=1;
const TV=cube.map(p=>tf(...p)),faces=[[0,1,3,2],[4,5,7,6],[0,1,5,4],[2,3,7,6],[0,2,6,4],[1,3,7,5]].map(F=>{const q=F.map(i=>pr(...TV[i]));return{q,d:q.reduce((z,p)=>z+p[2],0)/4}}).sort((x,y)=>y.d-x.d);
faces.forEach(F=>{ctx.beginPath();F.q.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();ctx.globalAlpha=.22;ctx.fillStyle='#2E6B47';ctx.fill();ctx.globalAlpha=.85;ctx.strokeStyle='#2E6B47';ctx.lineWidth=1.5;ctx.stroke()});ctx.globalAlpha=1;
E.e.forEach(q=>{ctx.setLineDash([8,6]);ctx.strokeStyle='#C27C5E';ctx.lineWidth=2.2;ctx.beginPath();ln(q.v.map(z=>-z*B*1.05),q.v.map(z=>z*B*1.05));ctx.stroke();ctx.setLineDash([])});
const o0=pr(...O),cols=['#7B2D52','#2E6B47','#6FA8D2'],names=['A·e₁','A·e₂','A·e₃'];ctx.font='600 13px "DM Sans",sans-serif';ctx.textAlign='left';
[[1,0,0],[0,1,0],[0,0,1]].forEach((e,i)=>{const p=pr(...tf(...e));arrow2(ctx,o0[0],o0[1],p[0],p[1],cols[i],3);ctx.fillStyle=cols[i];ctx.fillText(names[i],p[0]+8,p[1]-8)});
const Av=tf(...V),pv=pr(...V),pa=pr(...Av);arrow2(ctx,o0[0],o0[1],pv[0],pv[1],T.axis,2.4);arrow2(ctx,o0[0],o0[1],pa[0],pa[1],'#EE7F9C',2.8);ctx.fillStyle=T.ink;ctx.fillText('v',pv[0]+8,pv[1]-8);ctx.fillStyle='#EE7F9C';ctx.fillText('A·v',pa[0]+8,pa[1]-8);
E.e.forEach((q,i)=>{const p=pr(q.v[0]*B*.8,q.v[1]*B*.8,q.v[2]*B*.8);ctx.fillStyle='#C27C5E';ctx.fillText('λ'+['₁','₂','₃'][i]+' = '+f(q.l),p[0]+8,p[1]-8)});
const det=E.det,mn=[[0,1,3,4],[0,2,3,5],[1,2,4,5],[0,1,6,7],[0,2,6,8],[1,2,7,8],[3,4,6,7],[3,5,6,8],[4,5,7,8]].map(([i,j,k,l])=>Math.abs(M[i]*M[l]-M[j]*M[k])),rk=Math.abs(det)>1e-9?3:(mn.some(z=>z>1e-9)?2:(M.some(z=>Math.abs(z)>1e-9)?1:0));
const t=['Matrix:','['+f(M[0])+', '+f(M[1])+', '+f(M[2])+']','['+f(M[3])+', '+f(M[4])+', '+f(M[5])+']','['+f(M[6])+', '+f(M[7])+', '+f(M[8])+']'];
if(M.t<1||S.anim)t.push('Showing the blend I + t(A − I), t = '+f(M.t));
t.push('Determinant = '+f(det)+(det<0?' (flips orientation)':'')+',  trace = '+f(E.tr),'Volume scale factor = '+f(Math.abs(det))+',  rank = '+rk,rk===3?'Invertible.':'Not invertible: space is squashed.');
E.e.forEach((q,i)=>t.push('λ'+['₁','₂','₃'][i]+' = '+f(q.l)+',  eigenvector ('+f(q.v[0])+', '+f(q.v[1])+', '+f(q.v[2])+')'+(q.mult>1?'  (repeated: the eigenvectors may fill a plane)':'')));
if(E.cp)t.push('Complex eigenvalues: '+f(E.cp.re)+' ± '+f(E.cp.im)+'i  (a rotation part)');
t.push('A·v = ('+f(Av[0])+', '+f(Av[1])+', '+f(Av[2])+') for v = ('+f(V[0])+', '+f(V[1])+', '+f(V[2])+')');S.mout=t.join('\n')}
