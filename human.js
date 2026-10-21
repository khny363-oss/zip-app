/* זיפ · דמות אנושית ריאליסטית (Microsoft Rocketbox, MIT) מותאמת למידות ולבגד */
(function(){
const URL_=window.ZIP_HUMAN_URL||'human.glb';
const V3=THREE.Vector3,YN=1.445;
const GC=['getX','getY','getZ','getW'],gc=(a,i,j)=>a[GC[j]](i);
let H=null,mode='human',loading=false;
try{const m=localStorage.getItem('zip_avatar');if(m==='human'||m==='mannequin')mode=m;}catch(e){}

/* ---------- UI: choose avatar type ---------- */
const sec=document.getElementById('s-body');
const box=document.createElement('div');
box.innerHTML='<h3>דמות</h3><div class="chips" id="avChips"><button class="chip" data-av="human">אדם אמיתי</button><button class="chip" data-av="mannequin">בובת תפירה</button></div><p class="note" id="avNote" style="margin-top:6px"></p>';
sec.insertBefore(box,sec.firstChild);
const skinH=[...sec.querySelectorAll('h3')].find(h=>/עור/.test(h.textContent)),skinRow=document.getElementById('skin');
function syncUI(){box.querySelectorAll('[data-av]').forEach(b=>b.classList.toggle('on',b.dataset.av===mode));
 const hum=mode==='human';if(skinH)skinH.style.display=hum?'none':'';if(skinRow)skinRow.style.display=hum?'none':'';
 document.getElementById('avNote').textContent=hum?(H?'הגוף מותאם למידות שלך, והבגד נתפר עליו.':'טוען את הדמות…'):'';}
box.querySelector('#avChips').onclick=e=>{const v=e.target.dataset.av;if(!v||v===mode)return;mode=v;try{localStorage.setItem('zip_avatar',v);}catch(_){}syncUI();
 if(mode==='human'&&!H)load();else buildAvatar();};

/* ---------- look: hair colour + cut (saved per project) ---------- */
const HAIR={red:{n:'אדום',lo:[52,12,6],mid:[138,40,18],hi:[208,96,50]},black:{n:'שחור',lo:[6,5,5],mid:[28,24,24],hi:[80,72,70]},brown:{n:'חום',orig:1},blonde:{n:'בלונד',lo:[90,62,30],mid:[196,156,96],hi:[250,226,170]}};
const LOOK=()=>{if(!P.look)P.look={hair:'red',cut:'bob'};return P.look;};
const lb=document.createElement('div');
lb.innerHTML='<h3>שיער</h3><div class="chips" id="hairC">'+Object.entries(HAIR).map(([k,v])=>`<button class="chip" data-hc="${k}">${v.n}</button>`).join('')+'</div><div class="chips" id="hairS" style="margin-top:6px"><button class="chip" data-hs="bob">קארה</button><button class="chip" data-hs="long">ארוך</button></div>';
box.appendChild(lb);
function syncLook(){if(!P)return;const L=LOOK();lb.querySelectorAll('[data-hc]').forEach(b=>b.classList.toggle('on',b.dataset.hc===L.hair));lb.querySelectorAll('[data-hs]').forEach(b=>b.classList.toggle('on',b.dataset.hs===L.cut));lb.style.display=mode==='human'?'':'none';}
lb.onclick=e=>{const c=e.target.dataset.hc,t=e.target.dataset.hs;if(!c&&!t)return;const L=LOOK();if(c)L.hair=c;if(t)L.cut=t;syncLook();dirty();if(c&&!t)applyHair();else buildAvatar();};
const HT={};
function hairTex(k){if(HT[k])return HT[k];const src=H.hairMap;if(HAIR[k].orig)return HT[k]=src;const img=src.image,c=document.createElement('canvas');c.width=img.width;c.height=img.height;const g=c.getContext('2d');g.drawImage(img,0,0);
 const d=g.getImageData(0,0,c.width,c.height),a=d.data,{lo,mid,hi}=HAIR[k];
 for(let i=0;i<a.length;i+=4){const l=Math.min(1,(a[i]*0.3+a[i+1]*0.59+a[i+2]*0.11)/255*2.4);const t=l<0.5?l*2:(l-0.5)*2,A=l<0.5?lo:mid,B=l<0.5?mid:hi;a[i]=A[0]+(B[0]-A[0])*t;a[i+1]=A[1]+(B[1]-A[1])*t;a[i+2]=A[2]+(B[2]-A[2])*t;}
 g.putImageData(d,0,0);const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;t.flipY=src.flipY;t.anisotropy=4;t.wrapS=src.wrapS;t.wrapT=src.wrapT;return HT[k]=t;}
const HD={};
function headTex(k){if(HD[k])return HD[k];const src=H.headMap;if(HAIR[k].orig)return HD[k]=src;const img=src.image,c=document.createElement('canvas');c.width=img.width;c.height=img.height;const g=c.getContext('2d');g.drawImage(img,0,0);
 const d=g.getImageData(0,0,c.width,c.height),a=d.data,W=c.width,{lo,mid,hi}=HAIR[k];
 for(let i=0,p=0;i<a.length;i+=4,p++){const u=(p%W)/W,v=Math.floor(p/W)/c.height;if((u<0.16&&v>0.58)||(u>0.19&&u<0.34&&v>0.84))continue;
  const l0=(a[i]*0.3+a[i+1]*0.59+a[i+2]*0.11)/255,w=Math.max(0,Math.min(1,(0.40-l0)/0.10));if(!w)continue;
  const l=Math.min(1,l0*2.4),t=l<0.5?l*2:(l-0.5)*2,A=l<0.5?lo:mid,B=l<0.5?mid:hi;
  a[i]+=(A[0]+(B[0]-A[0])*t-a[i])*w;a[i+1]+=(A[1]+(B[1]-A[1])*t-a[i+1])*w;a[i+2]+=(A[2]+(B[2]-A[2])*t-a[i+2])*w;}
 g.putImageData(d,0,0);const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;t.flipY=src.flipY;t.anisotropy=4;t.wrapS=src.wrapS;t.wrapT=src.wrapT;return HD[k]=t;}
function applyHair(){if(!H||!P)return;const k=LOOK().hair,m=H.hair.material;m.map=hairTex(k);m.needsUpdate=true;const hm=H.headMesh.material;hm.map=headTex(k);hm.needsUpdate=true;}

/* ---------- load + prepare ---------- */
function load(){if(loading||H||!THREE.GLTFLoader)return;loading=true;
 new THREE.GLTFLoader().load(URL_,g=>{loading=false;prep(g.scene);syncUI();if(mode==='human'&&GEO&&PC.front)buildAvatar();},undefined,e=>{loading=false;console.warn('human load failed',e);mode='mannequin';syncUI();});}
function prep(root){
 const meshes=[],bones={};
 root.traverse(o=>{if(o.isSkinnedMesh){const g=o.geometry;for(const k in g.attributes){const a=g.attributes[k];if(a.isInterleavedBufferAttribute){const n=a.count,is=a.itemSize,arr=new a.array.constructor(n*is);for(let i=0;i<n;i++)for(let j=0;j<is;j++)arr[i*is+j]=a.data.array[i*a.data.stride+a.offset+j];g.setAttribute(k,new THREE.BufferAttribute(arr,is,a.normalized));}}meshes.push(o);o.castShadow=true;o.receiveShadow=true;o.frustumCulled=false;}if(o.isBone)bones[o.name]=o;});
 root.updateMatrixWorld(true);
 const bb=new THREE.Box3();meshes.forEach(m=>{const a=m.geometry.attributes.position,v=new V3();for(let i=0;i<a.count;i++){m.boneTransform(i,v);v.applyMatrix4(m.matrixWorld);bb.expandByPoint(v);}});
 const rest=new Map();Object.values(bones).forEach(b=>rest.set(b,{q:b.quaternion.clone(),p:b.position.clone()}));
 const orig=new Map();meshes.forEach(m=>orig.set(m,m.geometry.attributes.position.array.slice()));
 meshes.forEach(m=>{const sk=m.skeleton,si=m.geometry.attributes.skinIndex,sw=m.geometry.attributes.skinWeight,n=si.count,cls=new Float32Array(n*4);
  const bc=sk.bones.map(b=>{const am=b.name.match(/_(L|R)_(UpperArm|Forearm|Hand|Finger)/);if(am)return am[1]==='L'?0:1;
   if(/Head|Eye|Jaw|Mouth|Lip|lip|Cheek|Nose|brow|Brow|Masseter|Tongue|Caninus/.test(b.name))return 2;if(/Thigh|Calf|Foot|Toe/.test(b.name))return 3;return -1;});
  for(let i=0;i<n;i++)for(let j=0;j<4;j++){const w=gc(sw,i,j);if(!w)continue;const c=bc[gc(si,i,j)];if(c>=0)cls[i*4+c]+=w;}
  m.userData.cls=cls;});
 const sp=bones.Bip01_Spine2||bones.Bip01_Spine;
 H={root,meshes,bones,rest,orig,k:1.713/(bb.max.y-bb.min.y),minY:bb.min.y,cz:sp.getWorldPosition(new V3()).z,
  hair:meshes.find(m=>/opacity/.test(m.material.name)),body:meshes.find(m=>/body/.test(m.material.name)),
  lids:Object.values(bones).filter(b=>/EyeBlink(Top|Bottom)/.test(b.name)),eyes:[bones.Bip01_LEye,bones.Bip01_REye].filter(Boolean),head:bones.Bip01_Head};
 meshes.forEach(m=>{const mt=m.material;mt.envMapIntensity=0;if(m===H.hair){mt.side=THREE.FrontSide;mt.alphaTest=0.4;}});
 H.hairMap=H.hair.material.map;H.headMesh=meshes.find(m=>/head/.test(m.material.name));H.headMap=H.headMesh.material.map;
 {const img=H.headMap.image,c=document.createElement('canvas'),S=256;c.width=c.height=S;const g=c.getContext('2d');g.drawImage(img,0,0,S,S);const a=g.getImageData(0,0,S,S).data,uv=H.headMesh.geometry.attributes.uv,n=uv.count,hm=new Uint8Array(n);
  for(let i=0;i<n;i++){const u=uv.getX(i),v=uv.getY(i);if((u<0.16&&v>0.58)||(u>0.19&&u<0.34&&v>0.84))continue;const x=Math.min(S-1,Math.max(0,Math.floor(u*S))),y=Math.min(S-1,Math.max(0,Math.floor(v*S))),q=(y*S+x)*4;
   if((a[q]*0.3+a[q+1]*0.59+a[q+2]*0.11)/255<0.36)hm[i]=1;}H.headHairV=hm;}
}

/* ---------- garment rings: outer surface of front+back at each height ---------- */
const NB=96;
function buildRings(){const s=GEO.s,vh=GEO.vh,rings=[],dy=0.005,y0=YN-vh/100/s-0.01;
 for(let y=y0;y<=YN+0.012;y+=dy){const v=(YN-y)*100*s,r=new Float32Array(NB);
  for(const id of['front','back']){const mp=GEO.pieces[id].map;for(let u=-70;u<=70;u+=0.7){const p=mp(u,v),ph=Math.atan2(p.x,p.z),b=((Math.round((ph+Math.PI)/(2*Math.PI)*NB)%NB)+NB)%NB,rr=Math.hypot(p.x,p.z);if(rr>r[b])r[b]=rr;}}
  for(let b=0;b<NB;b++)if(!r[b]){let a=1;while(a<NB&&!r[(b+a)%NB]&&!r[(b-a+NB)%NB])a++;r[b]=r[(b+a)%NB]||r[(b-a+NB)%NB];}
  rings.push(r);}
 return {y0,dy,rings};}
function ringR(R,y,ph){const f=(y-R.y0)/R.dy;if(f<0||f>R.rings.length-1)return 0;const i=Math.min(R.rings.length-2,Math.floor(f)),t=f-i;
 const bf=((ph+Math.PI)/(2*Math.PI)*NB+NB)%NB,b0=Math.floor(bf)%NB,b1=(b0+1)%NB,tb=bf-Math.floor(bf);
 const a=R.rings[i],c=R.rings[i+1];return (a[b0]*(1-tb)+a[b1]*tb)*(1-t)+(c[b0]*(1-tb)+c[b1]*tb)*t;}

/* ---------- fit the human to measurements + garment ---------- */
const sst=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);};
function aim(bone,child,dirLocal){avatar.updateMatrixWorld(true);
 const a=bone.getWorldPosition(new V3()),cur=child.getWorldPosition(new V3()).sub(a).normalize();
 const want=dirLocal.clone().transformDirection(avatar.matrixWorld);
 const qw=new THREE.Quaternion().setFromUnitVectors(cur,want),bw=bone.getWorldQuaternion(new THREE.Quaternion()),pw=bone.parent.getWorldQuaternion(new THREE.Quaternion()).invert();
 bone.quaternion.copy(pw.multiply(qw).multiply(bw));bone.updateMatrixWorld(true);}
function attach(){
 if(!H||mode!=='human'||!GEO)return false;
 BLOCK.forEach(m=>m.visible=false);BLOCK.length=0;
 const G=GEO,s=G.s,root=H.root;
 H.meshes.forEach(m=>{const a=m.geometry.attributes.position;a.array.set(H.orig.get(m));a.needsUpdate=true;});
 H.rest.forEach((r,b)=>{b.quaternion.copy(r.q);b.position.copy(r.p);});
 root.scale.setScalar(H.k);root.position.set(0,-H.minY*H.k,-H.cz*H.k);root.rotation.set(0,0,0);
 avatar.add(root);avatar.updateMatrixWorld(true);
 const inv=new THREE.Matrix4().copy(avatar.matrixWorld).invert(),loc=b=>b.getWorldPosition(new V3()).applyMatrix4(inv);
 // pose arms along the sleeve axis
 const side={};
 for(const L of['L','R']){const ua=H.bones[`Bip01_${L}_UpperArm`],fa=H.bones[`Bip01_${L}_Forearm`],ha=H.bones[`Bip01_${L}_Hand`];if(!ua||!fa||!ha)continue;
  const sx=Math.sign(loc(ua).x)||1,dir=new V3(sx*Math.sin(G.tilt),-Math.cos(G.tilt),0);aim(ua,fa,dir);aim(fa,ha,dir);
  const J=loc(ua),Hd=loc(ha);side[L==='L'?0:1]={sx,J,dir,len:Hd.clone().sub(J).dot(dir)};}
 // natural details: relaxed fingers, a hint of a smile
 Object.values(H.bones).forEach(b=>{if(/_Finger[1-4]\d?$/.test(b.name))b.rotateZ(0.22);else if(/_Finger0\d?$/.test(b.name))b.rotateZ(0.08);});
 ['Bip01_LMouthCorner','Bip01_RMouthCorner'].forEach(k=>{if(H.bones[k])H.bones[k].position.x+=0.0055;});
 ['Bip01_LCheek','Bip01_RCheek'].forEach(k=>{if(H.bones[k])H.bones[k].position.x+=0.002;});
 avatar.updateMatrixWorld(true);
 // skinned positions (avatar space) + per-vertex linear map for pushing deltas back to bind pose
 const data=H.meshes.map(m=>{const g=m.geometry,pa=g.attributes.position,si=g.attributes.skinIndex,sw=g.attributes.skinWeight,n=pa.count;
  const pre=new THREE.Matrix4().multiplyMatrices(inv,m.matrixWorld).multiply(m.bindMatrixInverse);
  const BM=m.skeleton.bones.map((b,j)=>new THREE.Matrix4().multiplyMatrices(b.matrixWorld,m.skeleton.boneInverses[j]));
  const P=new Float32Array(n*3),F=new Float32Array(n*9),acc=new THREE.Matrix4(),full=new THREE.Matrix4(),v=new V3(),m3=new THREE.Matrix3();
  for(let i=0;i<n;i++){const e=acc.elements;e.fill(0);for(let j=0;j<4;j++){const w=gc(sw,i,j);if(!w)continue;const be=BM[gc(si,i,j)].elements;for(let k=0;k<16;k++)e[k]+=w*be[k];}
   full.multiplyMatrices(pre,acc).multiply(m.bindMatrix);v.fromBufferAttribute(pa,i).applyMatrix4(full);P[i*3]=v.x;P[i*3+1]=v.y;P[i*3+2]=v.z;
   m3.setFromMatrix4(full).invert();F.set(m3.elements,i*9);}
  return {m,n,P,F,cls:m.userData.cls};});
 // torso cross-sections of the human (body mesh only, no arms/head)
 const BY0=0.70,BN=82,bands=[...Array(BN)].map(()=>({r:[],zmin:1,zmax:-1}));
 data.forEach(d=>{if(d.m!==H.body)return;for(let i=0;i<d.n;i++){const c=d.cls,a=c[i*4]+c[i*4+1],h=c[i*4+2];if(a>0.25||h>0.25)continue;const y=d.P[i*3+1],b=Math.round((y-BY0)*100);if(b<0||b>=BN)continue;
  const z=d.P[i*3+2];bands[b].zmin=Math.min(bands[b].zmin,z);bands[b].zmax=Math.max(bands[b].zmax,z);bands[b].r.push([d.P[i*3],z]);}});
 const RH=new Float32Array(BN),CZ=new Float32Array(BN);
 bands.forEach((b,i)=>{if(b.r.length<6)return;const cz=(b.zmin+b.zmax)/2;CZ[i]=cz;const rs=b.r.map(([x,z])=>Math.hypot(x/SX,(z-cz)/SZ)).sort((a,c)=>a-c);RH[i]=rs[Math.floor(rs.length*0.9)];});
 for(let i=0;i<BN;i++)if(!RH[i]){let a=1;while(a<BN&&!RH[i-a]&&!RH[i+a])a++;const j=RH[i-a]?i-a:i+a;RH[i]=RH[j]||0.12;CZ[i]=CZ[j]||0;}
 const sm=a=>a.map((_,i)=>{let t=0,w=0;for(let k=-2;k<=2;k++){const j=i+k;if(j<0||j>=BN)continue;t+=a[j];w++;}return t/w;});
 const RHs=sm(RH),CZs=sm(CZ);const at=(A,y)=>{const f=Math.max(0,Math.min(BN-1.001,(y-BY0)*100)),i=Math.floor(f),t=f-i;return A[i]*(1-t)+A[i+1]*t;};
 const R=buildRings(),yHem=YN-G.vh/100/s,sl=G.pieces.sleeve,slL=sl?sl.L/100/s:0;
 const ct=Math.cos(G.tilt),st=Math.sin(G.tilt);
 data.forEach(d=>{const {P,F,cls,n,m}=d,isHair=m===H.hair,pa=m.geometry.attributes.position,arr=pa.array;
  for(let i=0;i<n;i++){let x=P[i*3],y=P[i*3+1],z=P[i*3+2];const x0=x,y0=y,z0=z;
   const aL=cls[i*4],aR=cls[i*4+1],aw=Math.min(1,aL+aR),hw=Math.min(1,cls[i*4+2]);
   // 1) morph torso cross-section to the measured body
   const wt=sst(0.74,0.84,y)*(1-sst(1.43,1.49,y))*(1-aw)*(1-hw);
   if(wt>0&&!isHair){const f=Math.max(0.72,Math.min(1.4,G.rAt(y)/at(RHs,y))),cz=at(CZs,y);x=x*(1+(f-1)*wt);z=cz+(z-cz)*(1+(f-1)*wt);}
   // 2) arms: move shoulder joint onto the sleeve axis
   for(const k of[0,1]){const w=k?aR:aL,sd=side[k];if(!w||!sd)continue;
    // stretch the arm along its axis so the wrist lands where a real sleeve ends (0.33 x height)
    const tgt=0.561,f=Math.max(0.9,Math.min(1.25,tgt/Math.max(0.3,sd.len))),hv=(x-sd.J.x)*sd.dir.x+(y-sd.J.y)*sd.dir.y+(z-sd.J.z)*sd.dir.z;
    if(hv>0){const e=hv*(f-1)*w;x+=sd.dir.x*e;y+=sd.dir.y*e;z+=sd.dir.z*e;}
    const tx=sd.sx*G.shX-sd.J.x,ty=G.shY-sd.J.y,tz=-sd.J.z;x+=tx*w;y+=ty*w;z+=tz*w;}
   // hair cut: bob (קארה) ends at the jaw line
   if((isHair||(m===H.headMesh&&(H.headHairV[i]||(y<1.5&&z<-0.01&&Math.hypot(x,z+0.045)>0.075))))&&LOOK().cut==='bob'){const cut=1.50;if(y<cut){const d=cut-y,hx=x,hz=z+0.02,r=Math.hypot(hx,hz)||1,grow=Math.min(0.025,d*0.12);y=cut-d*0.1;x+=hx/r*grow;z+=hz/r*grow;}}
   // 3) (legacy) keep the body inside the rigid garment shell; the cloth simulation now collides with the real body instead
   if(window.ZIP_RIGID&&y>yHem+0.002&&y<YN+0.01){const ph=Math.atan2(x,z),r=Math.hypot(x,z),Rg=ringR(R,y,ph);
    let nearJoint=false;if(aw>=0.5){const sd=side[aR>aL?1:0];if(sd){const sx=sd.sx,qx=x-sx*G.shX,qy=y-G.shY;nearJoint=(-qx*sx*st+qy*ct)>-0.025;}}
    if(Rg>0&&!isHair&&hw<0.5&&(aw<0.5||nearJoint)&&r>Rg-0.006){const k=(Rg-0.006)/r;x*=k;z*=k;}}
   if(window.ZIP_RIGID&&sl&&aw>=0.5&&!isHair){const k=aR>aL?1:0,sd=side[k];if(sd){const sx=sd.sx,c=ct,sn=sx*st;let qx=x-sx*G.shX,qy=y-G.shY;const xl=qx*c+qy*sn,yl=-qx*sn+qy*c;
    if(yl<0.03&&yl>0.015-slL+0.004){const v=Math.max(0,Math.min(sl.L,(0.015-yl)*100*s)),pp=sl.mapS(sx)(0,v),Rs=Math.hypot(pp.x,pp.z),rr=Math.hypot(xl,z);
     if(rr>Rs-0.005){const kk=(Rs-0.005)/rr;const nx=xl*kk;z*=kk;x=nx*c-yl*sn+sx*G.shX;y=nx*sn+yl*c+G.shY;}}}}
   P[i*3]=x;P[i*3+1]=y;P[i*3+2]=z;
   const dx=x-x0,dy=y-y0,dz=z-z0;if(dx||dy||dz){const e=F.subarray(i*9,i*9+9);
    arr[i*3]+=e[0]*dx+e[3]*dy+e[6]*dz;arr[i*3+1]+=e[1]*dx+e[4]*dy+e[7]*dz;arr[i*3+2]+=e[2]*dx+e[5]*dy+e[8]*dz;}}
  pa.needsUpdate=true;m.geometry.computeBoundingSphere();});
 // collision surface for the cloth: dense samples on the posed body triangles (~1 cm) with smooth normals
 const pts=[],nrm=[];
 data.forEach(d=>{if(d.m===H.hair)return;const idx=d.m.geometry.index.array,P=d.P,N=new Float32Array(d.n*3);
  for(let t=0;t<idx.length;t+=3){const a=idx[t]*3,b=idx[t+1]*3,c=idx[t+2]*3;const ux=P[b]-P[a],uy=P[b+1]-P[a+1],uz=P[b+2]-P[a+2],vx=P[c]-P[a],vy=P[c+1]-P[a+1],vz=P[c+2]-P[a+2];
   const nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx;for(const q of[a,b,c]){N[q]+=nx;N[q+1]+=ny;N[q+2]+=nz;}}
  // smooth across UV-seam duplicates
  const grp=new Map();for(let i=0;i<d.n;i++){const k=Math.round(P[i*3]*3000)+','+Math.round(P[i*3+1]*3000)+','+Math.round(P[i*3+2]*3000);const g=grp.get(k);if(g)g.push(i);else grp.set(k,[i]);}
  grp.forEach(g=>{let x=0,y=0,z=0;g.forEach(i=>{x+=N[i*3];y+=N[i*3+1];z+=N[i*3+2];});const l=Math.hypot(x,y,z)||1;g.forEach(i=>{N[i*3]=x/l;N[i*3+1]=y/l;N[i*3+2]=z/l;});});
  for(let t=0;t<idx.length;t+=3){const ia=idx[t]*3,ib=idx[t+1]*3,ic=idx[t+2]*3;if(P[ia+1]<0.62&&P[ib+1]<0.62&&P[ic+1]<0.62)continue;
   const e=Math.max(Math.hypot(P[ib]-P[ia],P[ib+1]-P[ia+1],P[ib+2]-P[ia+2]),Math.hypot(P[ic]-P[ia],P[ic+1]-P[ia+1],P[ic+2]-P[ia+2]),Math.hypot(P[ic]-P[ib],P[ic+1]-P[ib+1],P[ic+2]-P[ib+2]));
   const k=Math.max(1,Math.ceil(e/0.011));
   for(let i=0;i<=k;i++)for(let j=0;j<=k-i;j++){const u=i/k,v=j/k,w=1-u-v;if(i===0&&j===0&&t%3)continue;
    for(let q=0;q<3;q++){pts.push(P[ia+q]*w+P[ib+q]*u+P[ic+q]*v);}
    let nx=N[ia]*w+N[ib]*u+N[ic]*v,ny=N[ia+1]*w+N[ib+1]*u+N[ic+1]*v,nz=N[ia+2]*w+N[ib+2]*u+N[ic+2]*v;const l=Math.hypot(nx,ny,nz)||1;nrm.push(nx/l,ny/l,nz/l);}}});
 const CS=0.025,cells=new Map(),ck=(ix,iy,iz)=>((ix+512)*1048576+(iy+512)*1024+(iz+512));
 for(let i=0;i<pts.length/3;i++){const k=ck(Math.floor(pts[i*3]/CS),Math.floor(pts[i*3+1]/CS),Math.floor(pts[i*3+2]/CS));const c=cells.get(k);if(c)c.push(i);else cells.set(k,[i]);}
 H.surf={P:new Float32Array(pts),N:new Float32Array(nrm),cells,CS,ck};
 H.rest.forEach((r,b)=>{if(H.lids.includes(b)||H.eyes.includes(b)||b===H.head)r.q0=b.quaternion.clone();});
 return true;}

/* ---------- hook into the studio ---------- */
const orig=window.buildAvatar;
window.buildAvatar=function(){orig();syncLook();if(mode==='human'){if(H){attach();applyHair();}else load();}};
if(GEO&&PC.front&&mode==='human')load();
syncUI();
window.ZIP_HUMAN={get ready(){return !!H;},get mode(){return mode;},get surf(){return H&&mode==='human'&&H.root.parent?H.surf:null;}};

/* ---------- alive: blinking, eyes, head ---------- */
let nextBlink=1.5,blinkT=-9,sac={t:0,x:0,y:0};
(function idle(){requestAnimationFrame(idle);if(!H||mode!=='human'||!H.root.parent)return;const t=performance.now()/1000;
 if(t>nextBlink){blinkT=t;nextBlink=t+2.2+Math.random()*3.5;}
 const ph=(t-blinkT)/0.17,amt=ph>=0&&ph<1?Math.sin(ph*Math.PI):0;
 H.lids.forEach(b=>{const r=H.rest.get(b);if(!r.q0)return;b.quaternion.copy(r.q0);b.rotateZ((/Top/.test(b.name)?0.9:-0.25)*amt);});
 if(t>sac.t){sac={t:t+0.8+Math.random()*2.2,x:(Math.random()-0.5)*0.12,y:(Math.random()-0.5)*0.18};}
 H.eyes.forEach(b=>{const r=H.rest.get(b);if(!r.q0)return;b.quaternion.copy(r.q0);b.rotateY(sac.y);b.rotateZ(sac.x);});
 avatar.rotation.y=0.014*Math.sin(t*0.37);avatar.position.y=0.0018*Math.sin(t*1.45);
 if(H.head){const r=H.rest.get(H.head);if(r.q0){H.head.quaternion.copy(r.q0);H.head.rotateX(0.025*Math.sin(t*0.45));H.head.rotateY(0.04*Math.sin(t*0.27));H.head.rotateZ(0.02*Math.sin(t*0.61+1));}}
})();
})();
