/* EigenGrid 2D plotting: plot(), inequality shading, trace marker */
function plot(ctx,W,H,T,o){const v=S.view,s=v.s;
const gx=x=>W/2+(x-v.cx)*s,gy=y=>H/2-(y-v.cy)*s;
if(o.grid){const raw=70/s,p=Math.pow(10,Math.floor(Math.log10(raw))),m=raw/p,st=p*(m>=5?5:m>=2?2:1);
const i0=Math.ceil((v.cx-W/2/s)/st),i1=Math.floor((v.cx+W/2/s)/st),j0=Math.ceil((v.cy-H/2/s)/st),j1=Math.floor((v.cy+H/2/s)/st);
ctx.lineWidth=1;ctx.strokeStyle=T.grid;ctx.beginPath();
for(let i=i0;i<=i1;i++){const X=gx(i*st);ctx.moveTo(X,0);ctx.lineTo(X,H)}
for(let j=j0;j<=j1;j++){const Y=gy(j*st);ctx.moveTo(0,Y);ctx.lineTo(W,Y)}
ctx.stroke();
ctx.strokeStyle=T.axis;ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(0,gy(0));ctx.lineTo(W,gy(0));ctx.moveTo(gx(0),0);ctx.lineTo(gx(0),H);ctx.stroke();
ctx.fillStyle=T.axis;ctx.font='11px "DM Sans",sans-serif';
const ay=Math.min(Math.max(gy(0)+14,14),H-6),ax=Math.min(Math.max(gx(0)-6,28),W-4);
ctx.textAlign='center';for(let i=i0;i<=i1;i++)if(i)ctx.fillText(fmt(i*st),gx(i*st),ay);
ctx.textAlign='right';for(let j=j0;j<=j1;j++)if(j)ctx.fillText(fmt(j*st),ax,gy(j*st)+4)}
S.lists[S.mode].forEach((it,i)=>{if(!it.c)return;const c=it.c,sc=Object.assign({},S.params),col=colOf(it,i);
ctx.strokeStyle=col;ctx.lineWidth=2.6;ctx.shadowColor=col;ctx.shadowBlur=o.glow?14:0;ctx.beginPath();
if(c.k==='ex'){let pen=false,py=0;
for(let px=0;px<=W;px++){sc.x=v.cx+(px-W/2)/s;const y=ev(c,sc);if(!isFinite(y)){pen=false;continue}const Y=gy(y);
if(pen&&Math.abs(Y-py)>H*1.5)pen=false;pen?ctx.lineTo(px,Y):ctx.moveTo(px,Y);pen=true;py=Y}}
else if(c.k==='pol'){let pen=false;
for(let t=0,dt=(S.anim||S.drag)?0.025:0.01;t<=12*Math.PI;t+=dt){sc.t=t;const r=ev(c,sc);if(!isFinite(r)){pen=false;continue}
const X=gx(r*Math.cos(t)),Y=gy(r*Math.sin(t));pen?ctx.lineTo(X,Y):ctx.moveTo(X,Y);pen=true}}
else if(c.k==='par'){const t0=(c.rg.t||[0,2*Math.PI])[0],t1=(c.rg.t||[0,2*Math.PI])[1],N=S.drag?400:1200;c.pseg=[];let pen=false,px0=0,py0=0;
for(let i=0;i<=N;i++){sc.t=t0+(t1-t0)*i/N;const x=evf(c.fs[0],sc),y=evf(c.fs[1],sc);if(!isFinite(x)||!isFinite(y)){pen=false;continue}const X=gx(x),Y=gy(y);if(pen){ctx.lineTo(X,Y);c.pseg.push([px0,py0,X,Y])}else ctx.moveTo(X,Y);pen=true;px0=X;py0=Y}}
else if(c.k==='ode'){const gs=34,q=hx(col);ctx.strokeStyle='rgba('+q.join(',')+',.7)';ctx.lineWidth=1.6;
for(let py=gs/2;py<H;py+=gs)for(let px=gs/2;px<W;px+=gs){sc.x=v.cx+(px-W/2)/s;sc.y=v.cy-(py-H/2)/s;const m=ev(c,sc);if(!isFinite(m))continue;const a=Math.atan(-m),L=gs*0.38,dx=L*Math.cos(a),dy=L*Math.sin(a);ctx.moveTo(px-dx,py-dy);ctx.lineTo(px+dx,py+dy)}}
else{const cs=S.drag?12:6,nx=Math.ceil(W/cs)+1,ny=Math.ceil(H/cs)+1,V=new Float64Array(nx*ny);c.pseg=[];c.last={V,nx,ny,cs};
for(let j=0;j<ny;j++){sc.y=v.cy-(j*cs-H/2)/s;for(let i=0;i<nx;i++){sc.x=v.cx+(i*cs-W/2)/s;V[j*nx+i]=ev(c,sc)}}
if(c.ine)shade(ctx,c,V,nx,ny,cs,col);
const SEG=[0,[[3,2]],[[2,1]],[[3,1]],[[0,1]],[[0,3],[2,1]],[[0,2]],[[0,3]],[[0,3]],[[0,2]],[[0,1],[3,2]],[[0,1]],[[3,1]],[[2,1]],[[3,2]],0];
for(let j=0;j<ny-1;j++)for(let i=0;i<nx-1;i++){
const tl=V[j*nx+i],tr=V[j*nx+i+1],bl=V[(j+1)*nx+i],br=V[(j+1)*nx+i+1];
if(!(isFinite(tl)&&isFinite(tr)&&isFinite(bl)&&isFinite(br)))continue;
const k=(tl>0?8:0)|(tr>0?4:0)|(br>0?2:0)|(bl>0?1:0);if(!SEG[k])continue;
const x0=i*cs,y0=j*cs;
const pt=n=>n===0?[x0+cs*tl/(tl-tr),y0]:n===1?[x0+cs,y0+cs*tr/(tr-br)]:n===2?[x0+cs*bl/(bl-br),y0+cs]:[x0,y0+cs*tl/(tl-bl)];
for(const g of SEG[k]){const a=pt(g[0]),b=pt(g[1]);ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);c.pseg.push([a[0],a[1],b[0],b[1]])}}}
ctx.setLineDash(c.ine&&c.ine.length===1?[7,6]:[]);ctx.stroke();ctx.setLineDash([])});
ctx.shadowBlur=0;if(S.mode==='plot'){tools(ctx,W,H,T,gx,gy,v,s);drawData(ctx,W,H,T,gx,gy,v,s);if(o.screen)drawTrace(ctx,W,H,T,gx,gy)}}
function shade(ctx,c,V,nx,ny,cs,col){const gt=c.ine[0]==='>';ctx.fillStyle=col;ctx.globalAlpha=.2;ctx.beginPath();
for(let j=0;j<ny-1;j++)for(let i=0;i<nx-1;i++){const v=[V[j*nx+i],V[j*nx+i+1],V[(j+1)*nx+i+1],V[(j+1)*nx+i]];if(!v.every(isFinite))continue;
const X=[i*cs,(i+1)*cs,(i+1)*cs,i*cs],Y=[j*cs,j*cs,(j+1)*cs,(j+1)*cs],ok=v.map(z=>gt?z>0:z<0);if(!ok.some(Boolean))continue;
const pts=[];for(let k=0;k<4;k++){const k2=(k+1)%4;if(ok[k])pts.push([X[k],Y[k]]);if(ok[k]!==ok[k2]){const t=v[k]/(v[k]-v[k2]);pts.push([X[k]+(X[k2]-X[k])*t,Y[k]+(Y[k2]-Y[k])*t])}}
pts.forEach((p,q)=>q?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath()}
ctx.fill();ctx.globalAlpha=1;ctx.beginPath()}
function drawTrace(ctx,W,H,T,gx,gy){const q=S.trace;if(!q)return;const X=gx(q.x),Y=gy(q.y);
ctx.beginPath();ctx.arc(X,Y,6,0,7);ctx.fillStyle=q.col;ctx.fill();ctx.lineWidth=2.5;ctx.strokeStyle='#FFFFFF';ctx.stroke();
const t='('+fm(q.x)+', '+fm(q.y)+')';ctx.font='600 13px "DM Sans",sans-serif';const w=ctx.measureText(t).width+16;let bx=X+12,by=Y-34;if(bx+w>W-4)bx=X-12-w;if(by<4)by=Y+12;
ctx.fillStyle='rgba(255,255,255,.95)';ctx.strokeStyle=q.col;ctx.lineWidth=1.5;ctx.beginPath();ctx.rect(bx,by,w,24);ctx.fill();ctx.stroke();ctx.fillStyle='#2B332E';ctx.textAlign='left';ctx.fillText(t,bx+8,by+17)}
