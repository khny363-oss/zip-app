/* זיפ · סימולציית בד: כבידה, תפרים שנסגרים, והתנגשות בגוף */
(function(){
const V3=THREE.Vector3;
let SIM=null,raf=0,settleT=0;

/* ---------- collect garment pieces as particle grids (avatar space) ---------- */
function collect(){
 avatar.updateMatrixWorld(true);
 const invA=new THREE.Matrix4().copy(avatar.matrixWorld).invert(),parts=[];let off=0;
 PICK.forEach(m=>{const id=m.userData.piece,pc=PC[id];if(!pc)return;
  const nu=Math.max(8,Math.ceil(pc.w/1.1)),nv=Math.max(8,Math.ceil(pc.h/1.1)),pa=m.geometry.attributes.position,n=pa.count;
  if(n!==(nu+1)*(nv+1))return;
  const M=new THREE.Matrix4().multiplyMatrices(invA,m.matrixWorld),Mi=M.clone().invert(),T=new Float32Array(n*3),v=new V3();
  for(let i=0;i<n;i++){v.fromBufferAttribute(pa,i).applyMatrix4(M);T[i*3]=v.x;T[i*3+1]=v.y;T[i*3+2]=v.z;}
  const W=pc.mask.width,H=pc.mask.height,ins=new Uint8Array(n);
  for(let j=0;j<=nv;j++)for(let i=0;i<=nu;i++){const x=Math.min(W-1,Math.round(i/nu*(W-1))),y=Math.min(H-1,Math.round(j/nv*(H-1)));ins[j*(nu+1)+i]=pc.md[(y*W+x)*4+3]>=128?1:0;}
  parts.push({m,id,nu,nv,n,T,M,Mi,ins,off,base:pa.array.slice()});off+=n;});
 if(!parts.length)return null;
 const N=off,T=new Float32Array(N*3);parts.forEach(p=>T.set(p.T,p.off*3));
 // cloth constraints inside each grid
 const C=[];const add=(a,b,k)=>{const dx=T[a*3]-T[b*3],dy=T[a*3+1]-T[b*3+1],dz=T[a*3+2]-T[b*3+2];C.push(a,b,Math.hypot(dx,dy,dz),k);};
 parts.forEach(p=>{const w=p.nu+1,o=p.off;for(let j=0;j<=p.nv;j++)for(let i=0;i<=p.nu;i++){const a=o+j*w+i;
  if(i<p.nu)add(a,a+1,1);if(j<p.nv)add(a,a+w,1);if(i<p.nu&&j<p.nv){add(a,a+w+1,0.6);add(a+1,a+w,0.6);}
  if(i<p.nu-1)add(a,a+2,0.25);if(j<p.nv-1)add(a,a+2*w,0.25);}});
 // seams: boundary vertices of different pieces that belong together are pulled shut
 const bnd=[];parts.forEach((p,pi)=>{const w=p.nu+1;for(let j=0;j<=p.nv;j++)for(let i=0;i<=p.nu;i++){const l=j*w+i;if(!p.ins[l])continue;
  const out=(ii,jj)=>ii<0||jj<0||ii>p.nu||jj>p.nv||!p.ins[jj*w+ii];if(out(i-1,j)||out(i+1,j)||out(i,j-1)||out(i,j+1))bnd.push({g:p.off+l,pi,sl:p.id==='sleeve'});}});
 const S=[];bnd.forEach(a=>{let best=null,bd=1e9;bnd.forEach(b=>{if(b.pi===a.pi)return;const lim=(a.sl||b.sl)?0.06:0.03;
  const d=Math.hypot(T[a.g*3]-T[b.g*3],T[a.g*3+1]-T[b.g*3+1],T[a.g*3+2]-T[b.g*3+2]);if(d<lim&&d<bd){bd=d;best=b;}});if(best)S.push(a.g,best.g);});
 return {parts,N,T,C,S};}

/* ---------- body collider (proxy measured body + arms) ---------- */
function collide(P,N){const G=GEO,ct=Math.cos(G.tilt),st=Math.sin(G.tilt),mg=0.007;
 for(let i=0;i<N;i++){let x=P[i*3],y=P[i*3+1],z=P[i*3+2];
  if(y>0.76&&y<1.46){const r=G.rAt(y)+mg,a=r*SX,b=r*SZ,q=(x/a)*(x/a)+(z/b)*(z/b);if(q<1){const k=1/Math.sqrt(Math.max(q,1e-6));x*=k;z*=k;}}
  for(const sx of[-1,1]){const qx=x-sx*G.shX,qy=y-G.shY,dx=sx*st,dy=-ct,h=qx*dx+qy*dy;if(h<-0.02||h>0.66)continue;
   const rx=qx-dx*h,ry=qy-dy*h,rz=z,rr=Math.hypot(rx,ry,rz),R=interp(G.ap,-h)+mg;if(rr<R&&rr>1e-6){const k=R/rr;x=sx*G.shX+dx*h+rx*k;y=G.shY+dy*h+ry*k;z=rz*k;}}
  if(y<0.005)y=0.005;P[i*3]=x;P[i*3+1]=y;P[i*3+2]=z;}}

/* ---------- solver ---------- */
function solve(s,P,kSeam){const C=s.C,n=C.length;
 for(let c=0;c<n;c+=4){const a=C[c]*3,b=C[c+1]*3,L=C[c+2],k=C[c+3];let dx=P[b]-P[a],dy=P[b+1]-P[a+1],dz=P[b+2]-P[a+2];const d=Math.hypot(dx,dy,dz);if(d<1e-9)continue;
  const f=(d-L)/d*0.5*k;dx*=f;dy*=f;dz*=f;P[a]+=dx;P[a+1]+=dy;P[a+2]+=dz;P[b]-=dx;P[b+1]-=dy;P[b+2]-=dz;}
 const S=s.S;for(let c=0;c<S.length;c+=2){const a=S[c]*3,b=S[c+1]*3;for(let q=0;q<3;q++){const m=(P[a+q]-P[b+q])*0.5*kSeam;P[a+q]-=m;P[b+q]+=m;}}}
function write(s,P){const v=new V3();s.parts.forEach(p=>{const pa=p.m.geometry.attributes.position;
 for(let i=0;i<p.n;i++){const g=(p.off+i)*3;v.set(P[g],P[g+1],P[g+2]).applyMatrix4(p.Mi);pa.setXYZ(i,v.x,v.y,v.z);}
 pa.needsUpdate=true;p.m.geometry.computeVertexNormals();p.m.geometry.computeBoundingSphere();});}

/* ---------- drop: the garment falls onto the body with gravity ---------- */
function drop(){if(!GEO||typeof avatar==='undefined')return;cancel();const s=collect();if(!s)return;SIM=s;
 const N=s.N,T=s.T,P=new Float32Array(N*3),Q=new Float32Array(N*3);
 for(let i=0;i<N;i++){P[i*3]=T[i*3]*1.55;P[i*3+1]=T[i*3+1]+0.85;P[i*3+2]=T[i*3+2]*1.55+0.02;}Q.set(P);
 const dt=1/60,g=-9.8*dt*dt,t0=performance.now(),DUR=3.2;
 if(navigator.vibrate)try{navigator.vibrate(12);}catch(e){}
 (function step(){const t=(performance.now()-t0)/1000;
  const kA=t<0.42?0:Math.min(0.22,0.01+(t-0.42)*0.09),kS=Math.min(1,t/1.2);
  for(let i=0;i<N*3;i++){const v=(P[i]-Q[i])*0.985;Q[i]=P[i];P[i]+=v;}
  for(let i=0;i<N;i++){P[i*3+1]+=g;if(kA){for(let q=0;q<3;q++){const k=i*3+q;P[k]+=(T[k]-P[k])*kA;}}}
  for(let it=0;it<5;it++){solve(s,P,kS);collide(P,N);}
  write(s,P);req2&&req2();
  if(t<DUR)raf=requestAnimationFrame(step);else{settleFrom(s,P);SIM=null;}})();}

/* settle: close seams and push out of the body, staying close to the fitted shape */
function settleFrom(s,P){const N=s.N,T=s.T;for(let r=0;r<40;r++){for(let i=0;i<N*3;i++)P[i]+=(T[i]-P[i])*0.3;solve(s,P,1);collide(P,N);}write(s,P);}
function settle(){if(SIM||!GEO)return;const s=collect();if(!s)return;const P=s.T.slice();settleFrom(s,P);}
function cancel(){if(raf)cancelAnimationFrame(raf);raf=0;SIM=null;}

/* re-settle after every rebuild (debounced so sliders stay smooth) */
const orig=window.buildAvatar;
window.buildAvatar=function(){cancel();orig();clearTimeout(settleT);settleT=setTimeout(settle,220);};

/* ---------- button ---------- */
const st=document.createElement('style');st.textContent=`#bDrop{position:absolute;left:14px;bottom:14px;z-index:5;background:var(--acc);color:#fff;border:0;border-radius:999px;padding:11px 16px;font:500 14px Heebo,sans-serif;box-shadow:0 6px 20px rgba(0,0,0,.35);cursor:pointer}
@media(max-width:900px){#bDrop{bottom:12px;left:12px;padding:10px 14px}}`;document.head.appendChild(st);
const b=document.createElement('button');b.id='bDrop';b.textContent='👕 זריקה';b.title='הבגד נופל על הגוף עם כבידה';b.onclick=drop;document.getElementById('pane3').appendChild(b);
window.ZIP_CLOTH={drop,settle,get running(){return !!SIM;}};
setTimeout(settle,600);
})();
