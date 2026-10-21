/* זיפ · סימולציית בד פיזיקלית
   - אורכי מנוחה מהגזרה השטוחה (הבד לא נמתח מעבר למה שהוא באמת)
   - כבידה, ריסון, קפלים (קשיחות כיפוף נמוכה)
   - תפרים: קצוות שנתפרים יחד נמשכים זה לזה
   - התנגשות בגוף האמיתי של הדמות (משטח + נורמלים), או בגוף המדומה בבובת התפירה */
(function(){
const V3=THREE.Vector3;
let SIM=null,raf=0,settleT=0;

function collect(){
 avatar.updateMatrixWorld(true);
 const invA=new THREE.Matrix4().copy(avatar.matrixWorld).invert(),parts=[],s=GEO.s;let off=0;
 PICK.forEach(m=>{const id=m.userData.piece,pc=PC[id];if(!pc)return;
  const nu=Math.max(8,Math.ceil(pc.w/1.1)),nv=Math.max(8,Math.ceil(pc.h/1.1)),pa=m.geometry.attributes.position,n=pa.count;
  if(n!==(nu+1)*(nv+1))return;
  const M=new THREE.Matrix4().multiplyMatrices(invA,m.matrixWorld),Mi=M.clone().invert(),T=new Float32Array(n*3),v=new V3();
  for(let i=0;i<n;i++){v.fromBufferAttribute(pa,i).applyMatrix4(M);T[i*3]=v.x;T[i*3+1]=v.y;T[i*3+2]=v.z;}
  const W=pc.mask.width,Hh=pc.mask.height,w=nu+1,ins=new Uint8Array(n);
  for(let j=0;j<=nv;j++)for(let i=0;i<=nu;i++){const x=Math.min(W-1,Math.round(i/nu*(W-1))),y=Math.min(Hh-1,Math.round(j/nv*(Hh-1)));ins[j*w+i]=pc.md[(y*W+x)*4+3]>=128?1:0;}
  const act=new Uint8Array(n);for(let j=0;j<=nv;j++)for(let i=0;i<=nu;i++){if(!ins[j*w+i])continue;for(let b=-2;b<=2;b++)for(let a=-2;a<=2;a++){const ii=i+a,jj=j+b;if(ii>=0&&jj>=0&&ii<=nu&&jj<=nv)act[jj*w+ii]=1;}}
  parts.push({m,id,nu,nv,n,T,M,Mi,ins,act,off,du:pc.w/nu/100/s,dv:pc.h/nv/100/s});off+=n;});
 if(!parts.length)return null;
 const N=off,T=new Float32Array(N*3),A=new Uint8Array(N);parts.forEach(p=>{T.set(p.T,p.off*3);A.set(p.act,p.off);});
 const C=[];const add=(a,b,L,k)=>{if(A[a]&&A[b])C.push(a,b,L,k);};
 parts.forEach(p=>{const w=p.nu+1,o=p.off,du=p.du,dv=p.dv,dd=Math.hypot(du,dv);
  for(let j=0;j<=p.nv;j++)for(let i=0;i<=p.nu;i++){const a=o+j*w+i;
   if(i<p.nu)add(a,a+1,du,0.95);if(j<p.nv)add(a,a+w,dv,0.95);
   if(i<p.nu&&j<p.nv){add(a,a+w+1,dd,0.45);add(a+1,a+w,dd,0.45);}
   if(i<p.nu-1)add(a,a+2,2*du,0.12);if(j<p.nv-1)add(a,a+2*w,2*dv,0.12);}});
 // long-range tethers: each point may not drift further from the top of its column than the fabric length allows
 const TT=[];parts.forEach(p=>{const w=p.nu+1;for(let i=0;i<=p.nu;i++){let j0=-1;for(let j=0;j<=p.nv;j++)if(p.ins[j*w+i]){j0=j;break;}if(j0<0)continue;
  const top=p.off+j0*w+i;for(let j=j0+2;j<=p.nv;j++){const a=p.off+j*w+i;if(A[a])TT.push(top,a,(j-j0)*p.dv*1.03);}}});
 const bnd=[];parts.forEach((p,pi)=>{const w=p.nu+1;for(let j=0;j<=p.nv;j++)for(let i=0;i<=p.nu;i++){const l=j*w+i;if(!p.ins[l])continue;
  const out=(ii,jj)=>ii<0||jj<0||ii>p.nu||jj>p.nv||!p.ins[jj*w+ii];if(out(i-1,j)||out(i+1,j)||out(i,j-1)||out(i,j+1))bnd.push({g:p.off+l,pi,sl:p.id==='sleeve'});}});
 const S=[];bnd.forEach(a=>{let best=null,bd=1e9;bnd.forEach(b=>{if(b.pi===a.pi)return;const lim=(a.sl||b.sl)?0.06:0.03;
  const d=Math.hypot(T[a.g*3]-T[b.g*3],T[a.g*3+1]-T[b.g*3+1],T[a.g*3+2]-T[b.g*3+2]);if(d<lim&&d<bd){bd=d;best=b;}});if(best)S.push(a.g,best.g);});
 const act=[];for(let i=0;i<N;i++)if(A[i])act.push(i);
 return {parts,N,T,C:new Float32Array(C),S:new Int32Array(S),TT:new Float32Array(TT),A,act:new Int32Array(act)};}

/* ---------- collision ---------- */
const TH=0.006,DBG={none:0,deep:0,push:0};window.__CLOTHDBG=DBG;
function collideBody(P,act,surf,Q){const {P:B,N:BN,cells,CS,ck}=surf;
 for(let q=0;q<act.length;q++){const i=act[q]*3,x=P[i],y=P[i+1],z=P[i+2];const cx=Math.floor(x/CS),cy=Math.floor(y/CS),cz=Math.floor(z/CS);
  let best=-1,bd=1e9;
  for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++)for(let c=-1;c<=1;c++){const L=cells.get(ck(cx+a,cy+b,cz+c));if(!L)continue;
   for(let k=0;k<L.length;k++){const j=L[k]*3,dx=x-B[j],dy=y-B[j+1],dz=z-B[j+2],d=dx*dx+dy*dy+dz*dz;if(d<bd){bd=d;best=j;}}}
  if(best<0){DBG.none++;continue;}const nx=BN[best],ny=BN[best+1],nz=BN[best+2],d=(x-B[best])*nx+(y-B[best+1])*ny+(z-B[best+2])*nz;
  if(d<-0.06)DBG.deep++;if(d<TH&&d>-0.06){DBG.push++;const m=TH-d;P[i]+=nx*m;P[i+1]+=ny*m;P[i+2]+=nz*m;if(Q){Q[i]+=(P[i]-Q[i])*0.6;Q[i+1]+=(P[i+1]-Q[i+1])*0.6;Q[i+2]+=(P[i+2]-Q[i+2])*0.6;}}}}
function collideProxy(P,act){const G=GEO,ct=Math.cos(G.tilt),st=Math.sin(G.tilt),mg=0.007;
 for(let q=0;q<act.length;q++){const i=act[q]*3;let x=P[i],y=P[i+1],z=P[i+2];
  if(y>0.76&&y<1.46){const r=G.rAt(y)+mg,a=r*SX,b=r*SZ,qq=(x/a)*(x/a)+(z/b)*(z/b);if(qq<1){const k=1/Math.sqrt(Math.max(qq,1e-6));x*=k;z*=k;}}
  for(const sx of[-1,1]){const qx=x-sx*G.shX,qy=y-G.shY,dx=sx*st,dy=-ct,h=qx*dx+qy*dy;if(h<-0.02||h>0.66)continue;
   const rx=qx-dx*h,ry=qy-dy*h,rz=z,rr=Math.hypot(rx,ry,rz),R=interp(G.ap,-h)+mg;if(rr<R&&rr>1e-6){const k=R/rr;x=sx*G.shX+dx*h+rx*k;y=G.shY+dy*h+ry*k;z=rz*k;}}
  P[i]=x;P[i+1]=y;P[i+2]=z;}}
function collide(s,P,Q){const surf=window.ZIP_HUMAN&&ZIP_HUMAN.surf;if(surf)collideBody(P,s.act,surf,Q);else collideProxy(P,s.act);}

/* ---------- solver ---------- */
function solve(s,P,inflate,kSeam){const C=s.C,n=C.length;
 for(let c=0;c<n;c+=4){const a=C[c]*3,b=C[c+1]*3,L=C[c+2]*inflate,k=C[c+3];let dx=P[b]-P[a],dy=P[b+1]-P[a+1],dz=P[b+2]-P[a+2];const d=Math.sqrt(dx*dx+dy*dy+dz*dz);if(d<1e-9)continue;
  const f=(d-L)/d*0.5*k;dx*=f;dy*=f;dz*=f;P[a]+=dx;P[a+1]+=dy;P[a+2]+=dz;P[b]-=dx;P[b+1]-=dy;P[b+2]-=dz;}
 const TT=s.TT;for(let c=0;c<TT.length;c+=3){const a=TT[c]*3,b=TT[c+1]*3,L=TT[c+2]*inflate;let dx=P[b]-P[a],dy=P[b+1]-P[a+1],dz=P[b+2]-P[a+2];const d=Math.sqrt(dx*dx+dy*dy+dz*dz);if(d<=L)continue;
  const f=(d-L)/d;P[b]-=dx*f*0.9;P[b+1]-=dy*f*0.9;P[b+2]-=dz*f*0.9;P[a]+=dx*f*0.1;P[a+1]+=dy*f*0.1;P[a+2]+=dz*f*0.1;}
 const S=s.S;for(let c=0;c<S.length;c+=2){const a=S[c]*3,b=S[c+1]*3;for(let q=0;q<3;q++){const m=(P[a+q]-P[b+q])*0.5*kSeam;P[a+q]-=m;P[b+q]+=m;}}}
function write(s,P){const v=new V3();s.parts.forEach(p=>{const pa=p.m.geometry.attributes.position;
 for(let i=0;i<p.n;i++){const g=(p.off+i)*3;v.set(P[g],P[g+1],P[g+2]).applyMatrix4(p.Mi);pa.setXYZ(i,v.x,v.y,v.z);}
 pa.needsUpdate=true;p.m.geometry.computeVertexNormals();p.m.geometry.computeBoundingSphere();});
 if(typeof req2==='function')req2();}

function step(s,P,Q,g,damp,inflate,kSeam,iters,pull){const act=s.act;
 for(let q=0;q<act.length;q++){const i=act[q]*3;for(let c=0;c<3;c++){const k=i+c,v=(P[k]-Q[k])*damp;Q[k]=P[k];P[k]+=v;}P[i+1]+=g;if(pull){const T=s.T;P[i]+=(T[i]-P[i])*pull;P[i+1]+=(T[i+1]-P[i+1])*pull;P[i+2]+=(T[i+2]-P[i+2])*pull;}}
 for(let it=0;it<iters;it++){solve(s,P,inflate,kSeam);collide(s,P,it===iters-1?Q:null);}}

function run(kind){cancel();if(!GEO||typeof avatar==='undefined')return;const s=collect();if(!s)return;SIM=s;
 const N=s.N,T=s.T,P=T.slice(),Q=new Float32Array(N*3);
 const dt=1/60,g=-9.8/GEO.s*dt*dt,drop=kind==='drop';
 if(drop){for(let i=0;i<N;i++){if(!s.A[i])continue;P[i*3]=T[i*3]*1.6;P[i*3+1]=T[i*3+1]+0.85;P[i*3+2]=T[i*3+2]*1.6;}if(navigator.vibrate)try{navigator.vibrate(12);}catch(e){}}
 else collide(s,P);
 Q.set(P);
 const total=drop?210:64;let n=0;const t0=performance.now();
 (function frame(){const per=drop?1:2;
  for(let k=0;k<per&&n<total;k++,n++){
   const inflate=drop?Math.max(1,1.6-Math.max(0,n-25)/70*0.6):1;
   step(s,P,Q,g,0.975,inflate,drop?Math.min(1,n/60):1,drop?6:5,drop?Math.max(0,Math.min(0.15,(n-40)/80*0.15)):0.15);}
  if(n>=total){for(let r=0;r<6;r++){solve(s,P,1,1);collide(s,P,null);}for(let r=0;r<4;r++)collide(s,P,null);}
  write(s,P);
  if(n<total)raf=requestAnimationFrame(frame);else{SIM=null;window.ZIP_CLOTH.lastMs=performance.now()-t0;}})();}
function cancel(){if(raf)cancelAnimationFrame(raf);raf=0;SIM=null;}

const orig=window.buildAvatar;
window.buildAvatar=function(){cancel();orig();clearTimeout(settleT);settleT=setTimeout(()=>run('drape'),180);};

const st=document.createElement('style');st.textContent=`#bDrop{position:absolute;left:14px;bottom:14px;z-index:5;background:var(--acc);color:#fff;border:0;border-radius:999px;padding:11px 16px;font:500 14px Heebo,sans-serif;box-shadow:0 6px 20px rgba(0,0,0,.35);cursor:pointer}
@media(max-width:900px){#bDrop{bottom:12px;left:12px;padding:10px 14px}}`;document.head.appendChild(st);
const b=document.createElement('button');b.id='bDrop';b.textContent='👕 זריקה';b.title='הבגד נופל על הגוף עם כבידה';b.onclick=()=>run('drop');document.getElementById('pane3').appendChild(b);
window.ZIP_CLOTH={drop:()=>run('drop'),settle:()=>run('drape'),get running(){return !!SIM;},lastMs:0,
 bench(){const s=collect();if(!s)return null;const P=s.T.slice(),Q=P.slice(),t=performance.now();for(let k=0;k<10;k++)step(s,P,Q,-9.8/GEO.s/3600,0.975,1,1,7);return {ms:(performance.now()-t)/10,N:s.N,act:s.act.length,C:s.C.length/4,S:s.S.length/2};}};
setTimeout(()=>run('drape'),700);
})();
