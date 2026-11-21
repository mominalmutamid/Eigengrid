/* Graphify 3D: meshes, depth-buffer renderer, 3D tools, caption, draw() dispatcher, thumbnails */
function clipA(poly,ax,k){const R=5,o=[],m=poly.length;for(let i=0;i<m;i++){const a=poly[i],b=poly[(i+1)%m],ia=k*a[ax]<=R,ib=k*b[ax]<=R;if(ia)o.push(a);if(ia!==ib){const t=(k*R-a[ax])/(b[ax]-a[ax]);o.push([a[0]+t*(b[0]-a[0]),a[1]+t*(b[1]-a[1]),a[2]+t*(b[2]-a[2])])}}return o}
function meshP(it,key,sc){const c=it.c,P=[],R=5,N=44,U=c.rg.u||[0,2*Math.PI],V=c.rg.v||[0,2*Math.PI],G=[];
for(let j=0;j<=N;j++){G.push([]);for(let i=0;i<=N;i++){sc.u=U[0]+(U[1]-U[0])*i/N;sc.v=V[0]+(V[1]-V[0])*j/N;const p=c.fs.map(f=>evf(f,sc));G[j].push(p.every(z=>Math.abs(z)<=1e6)?p:null)}}
for(let j=0;j<N;j++)for(let i=0;i<N;i++){const q=[G[j][i],G[j][i+1],G[j+1][i+1],G[j+1][i]];if(q.some(p=>!p))continue;
const d1=[q[2][0]-q[0][0],q[2][1]-q[0][1],q[2][2]-q[0][2]],d2=[q[3][0]-q[1][0],q[3][1]-q[1][1],q[3][2]-q[1][2]],n=[d1[1]*d2[2]-d1[2]*d2[1],d1[2]*d2[0]-d1[0]*d2[2],d1[0]*d2[1]-d1[1]*d2[0]],l=Math.hypot(n[0],n[1],n[2])||1,nn=[n[0]/l,n[1]/l,n[2]/l];
if(q.every(p=>p.every(z=>Math.abs(z)<=R)))P.push({p:q,n:nn});else{let pl=q;for(let ax=0;ax<3;ax++){pl=clipA(pl,ax,1);pl=clipA(pl,ax,-1)}for(let k=1;k+1<pl.length;k++)P.push({p:[pl[0],pl[k],pl[k+1]],n:nn})}}
return{key,...pack(P)}}
const RBC={},P32={};
function pal32(h){if(P32[h])return P32[h];const rgb=hx(h),a=[];for(let i=0;i<32;i++){const m=0.5+0.65*i/31,r=Math.min(255,Math.round(rgb[0]*m)),g=Math.min(255,Math.round(rgb[1]*m)),b=Math.min(255,Math.round(rgb[2]*m));a.push(((255<<24)|(b<<16)|(g<<8)|r)>>>0)}return P32[h]=a}
function rastTri(R,x0,y0,z0,x1,y1,z1,x2,y2,z2,col){const A=(x1-x0)*(y2-y0)-(x2-x0)*(y1-y0);if(!(Math.abs(A)>1e-9))return;
const bw=R.w,bh=R.h,minx=Math.max(0,Math.floor(Math.min(x0,x1,x2)-.5)),maxx=Math.min(bw-1,Math.ceil(Math.max(x0,x1,x2)+.5)),miny=Math.max(0,Math.floor(Math.min(y0,y1,y2)-.5)),maxy=Math.min(bh-1,Math.ceil(Math.max(y0,y1,y2)+.5));if(minx>maxx||miny>maxy)return;
const inv=1/A,a0=(y1-y2)*inv,b0=(x2-x1)*inv,c0=(x1*y2-x2*y1)*inv,a1=(y2-y0)*inv,b1=(x0-x2)*inv,c1=(x2*y0-x0*y2)*inv,dz0=z0-z2,dz1=z1-z2,zb=R.zb,px=R.px,e=-1e-4;
for(let y=miny;y<=maxy;y++){const py=y+.5;let w0=a0*(minx+.5)+b0*py+c0,w1=a1*(minx+.5)+b1*py+c1,i=y*bw+minx;
for(let x=minx;x<=maxx;x++,i++,w0+=a0,w1+=a1){const w2=1-w0-w1;if(w0<e||w1<e||w2<e)continue;const z=z2+w0*dz0+w1*dz1;if(z<zb[i]){zb[i]=z;px[i]=col}}}}
function thumb(){const c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d');draw(x,W,H,TH[S.theme],{grid:S.grid,glow:false,cap:false});
const t=document.createElement('canvas'),tw=220,th=Math.max(1,Math.round(220*H/W));t.width=tw;t.height=th;const y=t.getContext('2d');y.fillStyle='#FFFFFF';y.fillRect(0,0,tw,th);y.drawImage(c,0,0,tw,th);return t.toDataURL('image/jpeg',0.72)}
function tools3(ctx,T,pr){const t=S.tool,it=S.lists.surf[t.f3];if(!it||!it.c)return;const c=it.c;if(c.k!=='ex'&&c.k!=='imp'){if(t.tp||t.vi)S.out.push('Tools are not available for parametric shapes yet.');return}
const sc=Object.assign({},S.params),CL='#C27C5E',imp=c.k==='imp';
const Q=(f,x,y,z)=>{if(!f)return NaN;sc.x=x;sc.y=y;sc.z=z;return ev({f},sc)},F=(x,y,z)=>Q(c.f,x,y,z),Z=(x,y)=>F(x,y,0);
const cr=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],nz=a=>{const l=Math.hypot(a[0],a[1],a[2])||1;return[a[0]/l,a[1]/l,a[2]/l]};
const patch=(p,n)=>{const e1=nz(cr(Math.abs(n[2])<.9?[0,0,1]:[1,0,0],n)),e2=nz(cr(n,e1)),h=1.5,q=[[-1,-1],[1,-1],[1,1],[-1,1]].map(([u,w])=>pr(p[0]+h*(u*e1[0]+w*e2[0]),p[1]+h*(u*e1[1]+w*e2[1]),p[2]+h*(u*e1[2]+w*e2[2])));
ctx.globalAlpha=.4;ctx.fillStyle=CL;ctx.beginPath();q.forEach((r,i)=>i?ctx.lineTo(r[0],r[1]):ctx.moveTo(r[0],r[1]));ctx.closePath();ctx.fill();ctx.globalAlpha=1;ctx.strokeStyle=CL;ctx.lineWidth=1.5;ctx.stroke()};
const arrow=(p,d)=>{const P0=pr(p[0],p[1],p[2]),P1=pr(p[0]+d[0],p[1]+d[1],p[2]+d[2]);ctx.strokeStyle=T.ink;ctx.lineWidth=2.4;ctx.beginPath();ctx.moveTo(P0[0],P0[1]);ctx.lineTo(P1[0],P1[1]);ctx.stroke();ctx.fillStyle=T.ink;ctx.beginPath();ctx.arc(P0[0],P0[1],5,0,7);ctx.fill()};
if(t.tp){
if(!imp){const a=t.ta,b=t.tb,z0=Z(a,b),fx=Q(pdv(c,'x'),a,b,0),fy=Q(pdv(c,'y'),a,b,0);
if([z0,fx,fy].every(isFinite)){const p=[a,b,z0];patch(p,nz([-fx,-fy,1]));const g=Math.hypot(fx,fy),k=g>0?Math.min(1,2/g):0;arrow(p,[fx*k,fy*k,0]);
S.out.push('At ('+fm(a)+', '+fm(b)+'): z = '+fm(z0)+'\n∂z/∂x = '+fm(fx)+', ∂z/∂y = '+fm(fy)+'\nGradient length = '+fm(g)+' (arrow)')}else S.out.push('Tangent plane is not available at this point.')}
else{let p=[t.ta,t.tb,0];const Fx=pdv(c,'x'),Fy=pdv(c,'y'),Fz=pdv(c,'z');let g=[0,0,0];
for(let i=0;i<40;i++){const f=F(...p);g=[Q(Fx,...p),Q(Fy,...p),Q(Fz,...p)];const gg=g[0]*g[0]+g[1]*g[1]+g[2]*g[2];if(!isFinite(f)||!(gg>1e-12)||Math.abs(f)<1e-9)break;const k=f/gg;p=[p[0]-k*g[0],p[1]-k*g[1],p[2]-k*g[2]]}
g=[Q(Fx,...p),Q(Fy,...p),Q(Fz,...p)];
if(Math.abs(F(...p))<1e-5&&g.every(isFinite)&&Math.hypot(...g)>1e-9){const n=nz(g);patch(p,n);arrow(p,n.map(z=>z*1.5));
S.out.push('Nearest surface point to ('+fm(t.ta)+', '+fm(t.tb)+', 0): ('+p.map(fm).join(', ')+')\nNormal (gradient of F) = ('+g.map(fm).join(', ')+')')}
else S.out.push('No surface point found near ('+fm(t.ta)+', '+fm(t.tb)+', 0).')}}
if(t.vi){const x1=Math.min(t.xa,t.xb),x2=Math.max(t.xa,t.xb),y1=Math.min(t.ya,t.yb),y2=Math.max(t.ya,t.yb),key=[pk(it),x1,x2,y1,y2].join('|');
if(!t.vc||t.vc.key!==key){let s0=0;
if(!imp){const n=40,hx=(x2-x1)/n,hy=(y2-y1)/n;for(let i=0;i<n;i++)for(let j=0;j<n;j++){const z=Z(x1+(i+.5)*hx,y1+(j+.5)*hy);if(isFinite(z))s0+=z*hx*hy}}
else{const m=it.m;if(m&&m.V){const{V,N,R}=m,M=N+1,h=2*R/N;
for(let k=0;k<N;k++)for(let j=0;j<N;j++)for(let i=0;i<N;i++){const cx=-R+(i+.5)*h,cy=-R+(j+.5)*h;if(cx<x1||cx>x2||cy<y1||cy>y2)continue;let n=0,ok=true;
for(let q=0;q<8;q++){const w=V[((k+(q>>2))*M+(j+((q>>1)&1)))*M+i+(q&1)];if(!isFinite(w)){ok=false;break}if(w<0)n++}if(ok)s0+=n/8*h*h*h}}}
t.vc={key,val:s0}}
ctx.strokeStyle=CL;ctx.lineWidth=2;ctx.setLineDash([6,5]);ctx.beginPath();[[x1,y1],[x2,y1],[x2,y2],[x1,y2]].forEach(([u,w],i)=>{const p=pr(u,w,0);i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1])});ctx.closePath();ctx.stroke();ctx.setLineDash([]);
S.out.push((imp?'Volume where F < 0 ≈ ':'Signed volume ≈ ')+fm(t.vc.val)+(imp?' (grid estimate, z from −5 to 5)':'')+'\nover x in ['+fm(x1)+', '+fm(x2)+'], y in ['+fm(y1)+', '+fm(y2)+']')}}
function pack(P){const n=P.length,vx=new Float32Array(n*12),nn=new Float32Array(n*3),nv=new Uint8Array(n);
P.forEach((f,i)=>{nv[i]=f.p.length;f.p.forEach((p,j)=>{vx[i*12+j*3]=p[0];vx[i*12+j*3+1]=p[1];vx[i*12+j*3+2]=p[2]});nn.set(f.n,i*3)});return{cnt:n,vx,nn,nv}}
const BUF={n:0},PALC={};
function palette(h){if(PALC[h])return PALC[h];const rgb=hx(h),a=[];for(let i=0;i<32;i++){const m=0.5+0.65*i/31;a.push('rgb('+rgb.map(v=>Math.min(255,Math.round(v*m))).join(',')+')')}return PALC[h]=a}
function evalImp(it,key){const c=it.c,sc=Object.assign({},S.params),n=S.lists.surf.filter(x=>x.c&&x.c.k==='imp').length,N=n>1?24:30,R=5,h=2*R/N,M=N+1,V=new Float64Array(M*M*M);let k=0;
const step=()=>{if(it.mb!==key)return;const t0=performance.now();
while(k<=N&&performance.now()-t0<10){for(let j=0;j<=N;j++)for(let i=0;i<=N;i++){sc.x=-R+i*h;sc.y=-R+j*h;sc.z=-R+k*h;V[(k*M+j)*M+i]=ev(c,sc)}k++}
if(k<=N){setTimeout(step,0);return}
try{it.m=mesh(it,key,V,N)}catch(e){it.m={key,cnt:0,vx:new Float32Array(0),nn:new Float32Array(0),nv:new Uint8Array(0)}}
it.mb=null;req()};
step()}
function pk(it){const p=Object.assign({},S.params);if(!/\btime\b/.test(it.e))delete p.time;return it.e+JSON.stringify(p)}
function mesh(it,key,V0,N0){const sc=Object.assign({},S.params),P=[],R=5;
if(it.c.k==='psf')return meshP(it,key,sc);
if(it.c.k==='imp'){const N=N0||30,h=2*R/N,M=N+1,V=V0||new Float64Array(M*M*M),ix=(i,j,k)=>(k*M+j)*M+i;
if(!V0)for(let k=0;k<=N;k++)for(let j=0;j<=N;j++)for(let i=0;i<=N;i++){sc.x=-R+i*h;sc.y=-R+j*h;sc.z=-R+k*h;V[ix(i,j,k)]=ev(it.c,sc)}
const cl=v=>Math.min(N-1,Math.max(1,Math.round((v+R)/h)));
const gr=(x,y,z)=>{const i=cl(x),j=cl(y),k=cl(z),g=[V[ix(i+1,j,k)]-V[ix(i-1,j,k)],V[ix(i,j+1,k)]-V[ix(i,j-1,k)],V[ix(i,j,k+1)]-V[ix(i,j,k-1)]],l=Math.hypot(g[0],g[1],g[2]);return l>0&&isFinite(l)?[g[0]/l,g[1]/l,g[2]/l]:[0,0,1]};
const tri=p=>P.push({p,n:gr((p[0][0]+p[1][0]+p[2][0])/3,(p[0][1]+p[1][1]+p[2][1])/3,(p[0][2]+p[1][2]+p[2][2])/3)});
const CT=[[0,1,3,7],[0,1,5,7],[0,2,3,7],[0,2,6,7],[0,4,5,7],[0,4,6,7]];
const I=(p,q)=>{const u=p[3]/(p[3]-q[3]);return[p[0]+(q[0]-p[0])*u,p[1]+(q[1]-p[1])*u,p[2]+(q[2]-p[2])*u]};
for(let k=0;k<N;k++)for(let j=0;j<N;j++)for(let i=0;i<N;i++){const c=[];
for(let q=0;q<8;q++){const ii=i+(q&1),jj=j+((q>>1)&1),kk=k+((q>>2)&1);c.push([-R+ii*h,-R+jj*h,-R+kk*h,V[ix(ii,jj,kk)]])}
if(c.some(p=>!isFinite(p[3])))continue;
for(const t of CT){const A=[],B=[];t.forEach(q=>(c[q][3]>0?A:B).push(c[q]));if(!A.length||!B.length)continue;
if(A.length===1||B.length===1){const s1=A.length===1?A[0]:B[0],o2=A.length===1?B:A;tri(o2.map(q=>I(s1,q)))}
else{const q0=I(A[0],B[0]),q1=I(A[0],B[1]),q2=I(A[1],B[1]),q3=I(A[1],B[0]);tri([q0,q1,q2]);tri([q0,q2,q3])}}}
return{key,V,N,R,...pack(P)}}
const N=44,Z=[];
for(let j=0;j<=N;j++){Z.push([]);for(let i=0;i<=N;i++){sc.x=-R+2*R*i/N;sc.y=-R+2*R*j/N;let z=ev(it.c,sc);if(!(Math.abs(z)<=1e6))z=NaN;Z[j].push(z)}}
const G=(i,j)=>{const z=Z[j][i];return isFinite(z)?[-R+2*R*i/N,-R+2*R*j/N,z]:null};
for(let j=0;j<N;j++)for(let i=0;i<N;i++){const q=[G(i,j),G(i+1,j),G(i+1,j+1),G(i,j+1)];if(q.some(p=>!p))continue;
const d1=[q[2][0]-q[0][0],q[2][1]-q[0][1],q[2][2]-q[0][2]],d2=[q[3][0]-q[1][0],q[3][1]-q[1][1],q[3][2]-q[1][2]],n=[d1[1]*d2[2]-d1[2]*d2[1],d1[2]*d2[0]-d1[0]*d2[2],d1[0]*d2[1]-d1[1]*d2[0]],l=Math.hypot(n[0],n[1],n[2])||1;
const nn=[n[0]/l,n[1]/l,n[2]/l];if(q.every(p=>Math.abs(p[2])<=R))P.push({p:q,n:nn});else{let pl=clipA(q,2,1);pl=clipA(pl,2,-1);for(let k=1;k+1<pl.length;k++)P.push({p:[pl[0],pl[k],pl[k+1]],n:nn})}}
return{key,...pack(P)}}
function surf(ctx,W,H,T,o){const a=S.rot.a,b=S.rot.b,ca=Math.cos(a),sa=Math.sin(a),cb=Math.cos(b),sb=Math.sin(b),B=5,u=Math.min(W,H)*0.5/7.2*S.zoom;
const pr=(x,y,z)=>{const x1=x*ca-y*sa,y1=x*sa+y*ca;return[W/2+x1*u,H/2-(z*cb+y1*sb)*u,y1*cb-z*sb]};
const ln=(p,q)=>{const A=pr(...p),C=pr(...q);ctx.moveTo(A[0],A[1]);ctx.lineTo(C[0],C[1])};
if(o.grid){ctx.strokeStyle=T.axis;ctx.lineWidth=1;ctx.globalAlpha=.35;ctx.beginPath();
for(const s1 of[-B,B])for(const s2 of[-B,B]){ln([s1,s2,-B],[s1,s2,B]);ln([s1,-B,s2],[s1,B,s2]);ln([-B,s1,s2],[B,s1,s2])}
ctx.stroke();ctx.globalAlpha=.22;ctx.beginPath();for(let i=-B;i<=B;i++){ln([i,-B,0],[i,B,0]);ln([-B,i,0],[B,i,0])}ctx.stroke();
ctx.globalAlpha=.75;ctx.lineWidth=1.8;ctx.beginPath();ln([-B,0,0],[B,0,0]);ln([0,-B,0],[0,B,0]);ln([0,0,-B],[0,0,B]);ctx.stroke();
ctx.globalAlpha=1;ctx.fillStyle=T.axis;ctx.textAlign='center';ctx.font='600 14px "DM Sans",sans-serif';
[[1,0,0,'x'],[0,1,0,'y'],[0,0,1,'z']].forEach(([x,y,z,l])=>{const p=pr(x*B*1.12,y*B*1.12,z*B*1.12);ctx.fillText(l,p[0],p[1]+5)});
ctx.font='11px "DM Sans",sans-serif';[[B,0,0,'5'],[-B,0,0,'\u22125'],[0,B,0,'5'],[0,-B,0,'\u22125'],[0,0,B,'5'],[0,0,-B,'\u22125']].forEach(([x,y,z,l])=>{const p=pr(x,y,z);ctx.fillText(l,p[0]+9,p[1]-6)})}
const ms=[];
S.lists.surf.forEach((it,k)=>{if(!it.c||it.c.k==='pc3')return;const key=pk(it);
if(!it.m||it.m.key!==key){if(it.c.k==='imp'){if(it.mb!==key){it.mb=key;evalImp(it,key)}}else it.m=mesh(it,key)}
if(!it.m)return;ms.push({m:it.m,pal:pal32(colOf(it,k))})});
if(S.lists.surf.some(i=>i.mb))S.out.push('Updating 3D surface…');
const ts=(ctx.getTransform?ctx.getTransform().a:1)||1,qs=S.rec?Math.min(2,ts*0.9):(S.drag||S.anim)?0.8:Math.min(3,ts*1.5),bw=Math.max(1,Math.round(W*qs)),bh=Math.max(1,Math.round(H*qs)),kb=bw+'x'+bh;
let R2=RBC[kb];if(!R2){const cvv=document.createElement('canvas');cvv.width=bw;cvv.height=bh;const c2=cvv.getContext('2d'),img=c2.createImageData(bw,bh);R2=RBC[kb]={cv:cvv,c2,img,px:new Uint32Array(img.data.buffer),zb:new Float32Array(bw*bh),w:bw,h:bh};const ks=Object.keys(RBC);if(ks.length>3)delete RBC[ks[0]]}
R2.zb.fill(1e9);R2.px.fill(0);
const XX=[0,0,0,0],YY=[0,0,0,0],ZZ=[0,0,0,0];let any=false;
ms.forEach(({m,pal})=>{const vx=m.vx,nn=m.nn,nv=m.nv;for(let i=0;i<m.cnt;i++){const c4=nv[i];
for(let j=0;j<c4;j++){const o2=i*12+j*3,x=vx[o2],y=vx[o2+1],z=vx[o2+2],x1=x*ca-y*sa,y1=x*sa+y*ca;XX[j]=(W/2+x1*u)*qs;YY[j]=(H/2-(z*cb+y1*sb)*u)*qs;ZZ[j]=y1*cb-z*sb}
const nx=nn[i*3],ny=nn[i*3+1],nzz=nn[i*3+2],a1=nx*ca-ny*sa,b1=nx*sa+ny*ca,up=nzz*cb+b1*sb,dp=b1*cb-nzz*sb,lv=Math.min(1,Math.abs(-0.3*a1+0.5*up-0.8*dp)/0.99),col=pal[Math.min(31,Math.floor(lv*31))|0]||pal[0];
rastTri(R2,XX[0],YY[0],ZZ[0],XX[1],YY[1],ZZ[1],XX[2],YY[2],ZZ[2],col);if(c4===4)rastTri(R2,XX[0],YY[0],ZZ[0],XX[2],YY[2],ZZ[2],XX[3],YY[3],ZZ[3],col);any=true}});
if(any){R2.c2.putImageData(R2.img,0,0);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(R2.cv,0,0,W,H)}
S.lists.surf.forEach((it,k)=>{if(!it.c||it.c.k!=='pc3')return;const c=it.c,sc=Object.assign({},S.params),t0=(c.rg.t||[0,2*Math.PI])[0],t1=(c.rg.t||[0,2*Math.PI])[1];
ctx.strokeStyle=colOf(it,k);ctx.lineWidth=3;ctx.beginPath();let pen=false;for(let i=0;i<=800;i++){sc.t=t0+(t1-t0)*i/800;const p=c.fs.map(f=>evf(f,sc));if(!p.every(isFinite)){pen=false;continue}const q=pr(p[0],p[1],p[2]);pen?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1]);pen=true}ctx.stroke()});
tools3(ctx,T,pr)}
function caption(ctx,W,H,T){
const pretty=e=>e.replace(/\*/g,'·').replace(/\^2(?![0-9])/g,'²').replace(/\^3(?![0-9])/g,'³').replace(/\bsqrt\(/g,'√(').replace(/\bpi\b/g,'π').replace(/\s+/g,' ');
const ex=S.mode==='mat'?('A = '+(S.mat.n===2?S.mat.m2:S.mat.m3).join(', ')):S.lists[S.mode].filter(i=>i.e.trim()).slice(0,3).map(i=>pretty(i.e.trim())).join('     ');
ctx.save();ctx.strokeStyle=T.ink;ctx.globalAlpha=.18;ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(24,H-54);ctx.lineTo(W-24,H-54);ctx.stroke();
ctx.globalAlpha=.9;ctx.fillStyle=T.ink;ctx.textAlign='right';ctx.font='600 14px "DM Sans",sans-serif';ctx.fillText('Graphify',W-24,H-26);
const bw=ctx.measureText('Graphify').width;ctx.textAlign='left';ctx.font='italic 400 16px Newsreader,Georgia,serif';
let t=ex;const mw=W-48-bw-24;while(ctx.measureText(t).width>mw&&t.length>3)t=t.slice(0,-2);if(t!==ex)t=t.trim()+'…';
ctx.fillText(t,24,H-26);ctx.restore()}
function draw(ctx,W,H,T,o){ctx.fillStyle=T.bg;ctx.fillRect(0,0,W,H);ctx.lineCap='round';ctx.lineJoin='round';
S.mode==='surf'?surf(ctx,W,H,T,o):S.mode==='mat'?matView(ctx,W,H,T,o):plot(ctx,W,H,T,o);if(o.cap)caption(ctx,W,H,T)}
