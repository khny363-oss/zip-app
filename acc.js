/* זיפ · אקססוריז: כובעים, תיקים, בנדנה, מטפחת ראש, פשמינה */
(function(){
const V3=THREE.Vector3,V2=THREE.Vector2;
const ITEMS={
 hat:{n:'כובע',types:{bucket:'באקט',cap:'מצחייה',beanie:'גרב'},def:{type:'bucket',fab:'denim',color:'#2f4560',print:'solid'}},
 bag:{n:'תיק',types:{cross:'תיק צד',belt:'פאוץ׳ על החזה'},def:{type:'cross',fab:'velvet',color:'#151515',print:'solid'}},
 bandana:{n:'בנדנה',types:{neck:'על הצוואר'},def:{type:'neck',fab:'cotton',color:'#b3262e',print:'dots'}},
 scarf:{n:'מטפחת ראש',types:{band:'קשורה מאחור'},def:{type:'band',fab:'silk',color:'#d9a441',print:'stripes'}},
 pashmina:{n:'פשמינה',types:{drape:'על הכתפיים'},def:{type:'drape',fab:'knit',color:'#c9b79c',print:'check'}}};
const A=()=>{if(!P.acc)P.acc={};for(const k in ITEMS)if(!P.acc[k])P.acc[k]={on:false,...ITEMS[k].def};return P.acc;};
let cur='hat',group=null,headGroup=null,rebuildT=0;

/* ---------- UI tab ---------- */
const tabs=document.querySelector('.tabs'),body=document.querySelector('.panel .body');
const tb=document.createElement('button');tb.className='tab';tb.dataset.t='acc';tb.textContent='אקססוריז';tabs.insertBefore(tb,tabs.querySelector('[data-t="room"]'));tb.onclick=()=>openTab('acc');
const sec=document.createElement('div');sec.className='sec';sec.id='s-acc';body.appendChild(sec);
function ui(){if(!P)return;const a=A(),c=a[cur],it=ITEMS[cur];
 sec.innerHTML=`<h3>מה מוסיפים</h3><div class="chips" id="accItems">${Object.entries(ITEMS).map(([k,v])=>`<button class="chip ${k===cur?'on':''}" data-it="${k}">${a[k].on?'✓ ':''}${v.n}</button>`).join('')}</div>
 <div class="mrow" style="margin-top:12px"><button class="${c.on?'':'pri'}" id="accOn" style="flex:1">${c.on?'להוריד את ה'+it.n:'ללבוש '+it.n}</button></div>
 <h3>סגנון</h3><div class="chips" id="accType">${Object.entries(it.types).map(([k,v])=>`<button class="chip ${c.type===k?'on':''}" data-ty="${k}">${v}</button>`).join('')}</div>
 <h3>בד</h3><div class="chips" id="accFab">${Object.entries(FAB).map(([k,f])=>`<button class="chip ${c.fab===k?'on':''}" data-fb="${k}">${f.n}</button>`).join('')}</div>
 <h3>הדפס</h3><div class="chips" id="accPr">${Object.entries(PRINTS).map(([k,n])=>`<button class="chip ${c.print===k?'on':''}" data-pr="${k}">${n}</button>`).join('')}</div>
 <h3>צבע</h3><div class="sws" id="accCol">${COLORS.concat(['#b3262e','#d58aa0','#e8c547']).map(x=>`<div class="sw ${x===c.color?'on':''}" style="background:${x}" data-cl="${x}"></div>`).join('')}</div>
 <p class="note">האקססוריז נשמרים בפרויקט ומופיעים גם בתמונת הסטורי.</p>`;}
sec.addEventListener('click',e=>{const d=e.target.dataset,a=A(),c=a[cur];
 if(d.it){cur=d.it;ui();return;}
 if(e.target.id==='accOn')c.on=!c.on;else if(d.ty)c.type=d.ty;else if(d.fb)c.fab=d.fb;else if(d.pr)c.print=d.pr;else if(d.cl)c.color=d.cl;else return;
 if(!c.on&&!e.target.id)c.on=true;ui();dirty();build();});

/* ---------- materials ---------- */
const MC={};
function mat(c,sizeM,extra){const key=[c.fab,c.color,c.print,extra||''].join('|');let tex=MC[key];
 if(!tex){const cv=document.createElement('canvas');cv.width=cv.height=256;const g=cv.getContext('2d');g.fillStyle=c.color;g.fillRect(0,0,256,256);g.globalCompositeOperation='multiply';g.drawImage(tile(c.fab,c.print),0,0);g.globalCompositeOperation='source-over';
  tex=new THREE.CanvasTexture(cv);tex.encoding=THREE.sRGBEncoding;tex.wrapS=tex.wrapT=THREE.RepeatWrapping;tex.anisotropy=4;MC[key]=tex;}
 const t=tex.clone();t.needsUpdate=true;const r=(sizeM||0.2)*100/16;t.repeat.set(r,r);
 const f=FAB[c.fab];return new THREE.MeshStandardMaterial({map:t,roughness:f.rough,metalness:f.met,side:THREE.DoubleSide});}
const shade=(hex,k)=>'#'+new THREE.Color(hex).multiplyScalar(k).getHexString();

/* ---------- where is the body / garment surface ---------- */
const ray=new THREE.Raycaster();
function surfZ(x,y,dir){// outermost surface (garment, else body) seen from the front (dir=1) or back (dir=-1)
 avatar.updateMatrixWorld(true);const o=new V3(x,y,dir*1.2).applyMatrix4(avatar.matrixWorld),d=new V3(0,0,-dir).transformDirection(avatar.matrixWorld);
 ray.set(o,d);const hits=ray.intersectObjects(PICK,false);const inv=new THREE.Matrix4().copy(avatar.matrixWorld).invert();
 for(const h of hits){const pc=PC[h.object.userData.piece];if(!pc)continue;const uu=pc.u0+h.uv.x*pc.w,vv=pc.v0+(1-h.uv.y)*pc.h,lx=Math.floor((uu-pc.u0)*PX),ly=Math.floor((vv-pc.v0)*PX);
  if(pc.md[(ly*pc.mask.width+lx)*4+3]<128)continue;return h.point.applyMatrix4(inv).z;}
 const S=window.ZIP_HUMAN&&ZIP_HUMAN.surf;if(S){let best=null;for(let i=0;i<S.P.length;i+=3){if(Math.abs(S.P[i]-x)<0.012&&Math.abs(S.P[i+1]-y)<0.012){const z=S.P[i+2];if(best===null||z*dir>best*dir)best=z;}}if(best!==null)return best;}
 const r=GEO.rAt(Math.min(1.46,Math.max(0.8,y)));const q=1-(x/(r*SX))**2;return dir*(q>0?r*SZ*Math.sqrt(q):0.02);}
function headInfo(){// head + hair volume in avatar space
 const hum=window.ZIP_HUMAN&&ZIP_HUMAN.mode==='human'&&ZIP_HUMAN.ready&&ZIP_HUMAN.surf;
 if(!hum)return {c:new V3(0,1.6,0.008),rx:0.094,ry:0.118,rz:0.104,top:1.725,bone:null};
 let hm=null,hd=null;avatar.traverse(o=>{if(o.isSkinnedMesh&&/opacity/.test(o.material.name))hm=o;if(o.isBone&&o.name==='Bip01_Head')hd=o;});
 avatar.updateMatrixWorld(true);const inv=new THREE.Matrix4().copy(avatar.matrixWorld).invert(),v=new V3();let x0=9,x1=-9,z0=9,z1=-9,top=-9;
 for(let i=0;i<hm.geometry.attributes.position.count;i++){hm.boneTransform(i,v);v.applyMatrix4(hm.matrixWorld).applyMatrix4(inv);top=Math.max(top,v.y);if(v.y>top-0.12&&v.y>1.56){x0=Math.min(x0,v.x);x1=Math.max(x1,v.x);z0=Math.min(z0,v.z);z1=Math.max(z1,v.z);}}
 return {c:new V3((x0+x1)/2,top-0.105,(z0+z1)/2),rx:(x1-x0)/2,ry:0.105,rz:(z1-z0)/2,top,bone:hd};}

/* ---------- geometry helpers ---------- */
function lathe(pts,seg){return new THREE.LatheGeometry(pts.map(([r,y])=>new V2(r,y)),seg||48);}
function gridMesh(w,h,nu,nv,fn,material){const pos=[],uv=[],idx=[];for(let j=0;j<=nv;j++)for(let i=0;i<=nu;i++){const p=fn(i/nu,j/nv);pos.push(p.x,p.y,p.z);uv.push(i/nu*w/0.2,j/nv*h/0.2);}
 for(let j=0;j<nv;j++)for(let i=0;i<nu;i++){const a=j*(nu+1)+i,b=a+1,c=a+nu+1,d=c+1;idx.push(a,c,b,b,c,d);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();
 const m=new THREE.Mesh(g,material);m.castShadow=true;m.receiveShadow=true;return m;}
function tube(pts,r,material){const curve=new THREE.CatmullRomCurve3(pts);const m=new THREE.Mesh(new THREE.TubeGeometry(curve,80,r,10,false),material);m.castShadow=true;return m;}

/* ---------- builders ---------- */
function pivot(g,c,rx){const p=new THREE.Group();p.position.copy(c);g.children.slice().forEach(ch=>{ch.position.sub(c);p.add(ch);});p.rotation.x=rx||0;return p;}
function buildHat(c,hi){const g=new THREE.Group(),M=mat(c,0.35),ex=hi.rx+0.01,ez=hi.rz+0.01,base=hi.top-0.085;
 if(c.type==='bucket'){
  const crown=new THREE.Mesh(lathe([[1,0],[0.97,0.05],[0.9,0.075],[0.75,0.09],[0.4,0.098],[0.001,0.1]].map(([r,y])=>[r,y])),M);crown.scale.set(ex,1,ez);crown.position.set(hi.c.x,base,hi.c.z);
  const brim=new THREE.Mesh(lathe([[1,0.004],[1.18,-0.012],[1.42,-0.035],[1.48,-0.04]]),M);brim.scale.set(ex,1,ez);brim.position.copy(crown.position);
  const band=new THREE.Mesh(new THREE.CylinderGeometry(1.005,1.01,0.018,48,1,true),mat({...c,color:shade(c.color,0.55)},0.3));band.scale.set(ex,1,ez);band.position.set(hi.c.x,base+0.012,hi.c.z);
  g.add(crown,brim,band);return pivot(g,hi.c,-0.08);}
 else if(c.type==='cap'){
  const dome=new THREE.Mesh(new THREE.SphereGeometry(1,48,24,0,Math.PI*2,0,Math.PI*0.5),M);dome.scale.set(ex*1.02,0.095,ez*1.02);dome.position.set(hi.c.x,base,hi.c.z);
  const bill=gridMesh(0.2,0.08,20,6,(u,v)=>{const ang=(u-0.5)*2.3,r=1.0+v*0.75;return new V3(hi.c.x+Math.sin(ang)*r*ex,base+0.006-(r-1)*0.03-(1-Math.cos(ang))*0.025,hi.c.z+Math.cos(ang)*r*ez);},mat({...c,color:shade(c.color,0.8)},0.2));
  const btn=new THREE.Mesh(new THREE.SphereGeometry(0.008,12,8),M);btn.position.set(hi.c.x,base+0.095,hi.c.z);
  g.add(dome,bill,btn);return pivot(g,hi.c,-0.1);}
 else{// beanie
  const dome=new THREE.Mesh(new THREE.SphereGeometry(1,48,24,0,Math.PI*2,0,Math.PI*0.5),M);dome.scale.set(ex*1.04,0.13,ez*1.04);dome.position.set(hi.c.x,base-0.02,hi.c.z);
  const cuff=new THREE.Mesh(new THREE.CylinderGeometry(1.07,1.07,0.045,48,1,true),mat({...c,color:shade(c.color,0.85)},0.3));cuff.scale.set(ex,1,ez);cuff.position.set(hi.c.x,base-0.015,hi.c.z);
  const pom=new THREE.Mesh(new THREE.SphereGeometry(0.03,20,14),mat({...c,fab:'knit'},0.1));pom.position.set(hi.c.x,base+0.13,hi.c.z);
  g.add(dome,cuff,pom);return pivot(g,hi.c,-0.12);}}
function buildScarf(c,hi){const g=new THREE.Group(),M=mat(c,0.3),y=hi.c.y+0.012,ex=hi.rx+0.006,ez=hi.rz+0.006;
 const band=new THREE.Mesh(new THREE.CylinderGeometry(1,1.02,0.05,56,4,true),M);band.scale.set(ex,1,ez);band.position.set(hi.c.x,y,hi.c.z);band.rotation.x=-0.3;
 const kz=hi.c.z-ez*Math.cos(0.3)-0.006,ky=y-ez*Math.sin(0.3)-0.006;
 const knot=new THREE.Mesh(new THREE.SphereGeometry(0.022,16,12),M);knot.scale.set(1.2,0.9,0.7);knot.position.set(hi.c.x,ky,kz);
 const tail=(sx)=>gridMesh(0.05,0.17,6,14,(u,v)=>new V3(hi.c.x+sx*(0.01+v*0.05)+(u-0.5)*0.045*(1-v*0.3),ky-v*0.16,kz-0.006-Math.sin(v*3+u)*0.01),M);
 g.add(band,knot,tail(-1),tail(1));return g;}
function buildBandana(c){const g=new THREE.Group(),M=mat(c,0.4);
 const ring=new THREE.Mesh(new THREE.TorusGeometry(1,0.16,10,48),M);ring.rotation.x=Math.PI/2+0.25;ring.scale.set(0.066,0.06,0.068);ring.position.set(0,1.452,-0.02);
 const tri=gridMesh(0.2,0.17,12,10,(u,v)=>{const w=(1-v)*0.1,x=(u-0.5)*2*w,y=1.43-v*0.16,z=surfZ(x,y,1)+0.007+Math.sin(u*Math.PI)*0.004*(1-v);return new V3(x,y,z);},M);
 const knot=new THREE.Mesh(new THREE.SphereGeometry(0.018,14,10),M);knot.position.set(0,1.44,surfZ(0,1.44,-1)-0.012);
 g.add(ring,tri,knot);return g;}
function buildPashmina(c){const g=new THREE.Group(),M=mat(c,0.6,'fringe');
 const wrap=new THREE.Mesh(new THREE.TorusGeometry(1,0.32,14,56),M);wrap.rotation.x=Math.PI/2+0.3;wrap.scale.set(0.095,0.085,0.09);wrap.position.set(0,1.43,-0.015);
 const panel=(sx)=>gridMesh(0.13,0.46,8,30,(u,v)=>{const x=sx*(0.035+u*0.105+v*0.015),y=1.42-v*0.46,z=surfZ(x,y,1)+0.012+Math.sin(u*Math.PI)*0.006+Math.sin(v*9+u*2)*0.003;return new V3(x,y,z);},M);
 g.add(wrap,panel(-1),panel(1));
 // fringe
 const fr=new THREE.LineBasicMaterial({color:shade(c.color,0.8)});for(const sx of[-1,1])for(let i=0;i<14;i++){const x=sx*(0.04+i*0.0085),y=0.96,z=surfZ(x,y+0.01,1)+0.012;const geo=new THREE.BufferGeometry().setFromPoints([new V3(x,y,z),new V3(x+sx*0.002,y-0.045,z+0.004)]);g.add(new THREE.Line(geo,fr));}
 return g;}
function buildBag(c){const g=new THREE.Group(),M=mat(c,0.25),strapM=mat({...c,fab:'cotton',print:'solid',color:shade(c.color,0.7)},0.6);
 // strap: right shoulder → across chest → left hip, and around the back
 const front=[],back=[];const A0=[-0.11,1.405],B0=c.type==='belt'?[0.13,1.12]:[0.17,0.98];
 for(let i=0;i<=16;i++){const t=i/16,x=A0[0]+(B0[0]-A0[0])*t,y=A0[1]+(B0[1]-A0[1])*t;front.push(new V3(x,y,surfZ(x,y,1)+0.008));back.push(new V3(x,y,surfZ(x,y,-1)-0.008));}
 const top=new V3(A0[0]-0.012,A0[1]+0.03,(front[0].z+back[0].z)/2);
 g.add(tube([...front.slice().reverse(),top,...back],0.0055,strapM));
 const bw=c.type==='belt'?0.2:0.18,bh=c.type==='belt'?0.09:0.14,bd=c.type==='belt'?0.055:0.05;
 const sh=new THREE.Shape(),r=0.02;sh.moveTo(-bw/2+r,-bh/2);sh.lineTo(bw/2-r,-bh/2);sh.quadraticCurveTo(bw/2,-bh/2,bw/2,-bh/2+r);sh.lineTo(bw/2,bh/2-r);sh.quadraticCurveTo(bw/2,bh/2,bw/2-r,bh/2);sh.lineTo(-bw/2+r,bh/2);sh.quadraticCurveTo(-bw/2,bh/2,-bw/2,bh/2-r);sh.lineTo(-bw/2,-bh/2+r);sh.quadraticCurveTo(-bw/2,-bh/2,-bw/2+r,-bh/2);
 const geo=new THREE.ExtrudeGeometry(sh,{depth:bd,bevelEnabled:true,bevelThickness:0.008,bevelSize:0.008,bevelSegments:4,curveSegments:10});
 const bag=new THREE.Mesh(geo,M);bag.castShadow=true;const bx=B0[0]+(c.type==='belt'?-0.04:0.0),by=B0[1]-(c.type==='belt'?0.0:0.07);bag.position.set(bx,by,surfZ(bx,by,1)+0.006);bag.rotation.z=c.type==='belt'?0.45:0.08;
 const flap=gridMesh(bw,bh*0.55,6,4,(u,v)=>new V3((u-0.5)*bw*1.02,bh/2-v*bh*0.55,bd+0.011+Math.sin(u*Math.PI)*0.002),mat({...c,color:shade(c.color,0.82)},0.25));bag.add(flap);
 const clasp=new THREE.Mesh(new THREE.BoxGeometry(0.018,0.012,0.006),new THREE.MeshStandardMaterial({color:'#c9a24a',metalness:0.9,roughness:0.3}));clasp.position.set(0,bh/2-bh*0.5,bd+0.014);bag.add(clasp);
 g.add(bag);return g;}

/* ---------- build / attach ---------- */
function clear(){[group,headGroup].forEach(o=>{if(!o)return;o.parent&&o.parent.remove(o);o.traverse(n=>{if(n.geometry)n.geometry.dispose();});});group=headGroup=null;}
function build(){if(!P||!GEO||typeof avatar==='undefined')return;clear();const a=A();if(!Object.values(a).some(x=>x.on))return;
 group=new THREE.Group();avatar.add(group);
 const hi=(a.hat.on||a.scarf.on)?headInfo():null;
 if(hi){headGroup=new THREE.Group();const items=[];if(a.hat.on)items.push(buildHat(a.hat,hi));if(a.scarf.on&&!a.hat.on)items.push(buildScarf(a.scarf,hi));items.forEach(x=>headGroup.add(x));
  if(hi.bone){avatar.updateMatrixWorld(true);headGroup.matrixAutoUpdate=false;headGroup.matrix.copy(new THREE.Matrix4().copy(hi.bone.matrixWorld).invert().multiply(avatar.matrixWorld));hi.bone.add(headGroup);}
  else avatar.add(headGroup);}
 if(a.bandana.on)group.add(buildBandana(a.bandana));
 if(a.pashmina.on)group.add(buildPashmina(a.pashmina));
 if(a.bag.on)group.add(buildBag(a.bag));
 group.traverse(o=>{if(o.isMesh)o.castShadow=true;});}
function schedule(){clearTimeout(rebuildT);let n=0;const tick=()=>{if(window.ZIP_CLOTH&&ZIP_CLOTH.running&&n++<40){rebuildT=setTimeout(tick,150);return;}build();};rebuildT=setTimeout(tick,260);}
const orig=window.buildAvatar;window.buildAvatar=function(){clear();orig();ui();schedule();};
// rebuild after a drop too (the garment shape changes)
const od=window.ZIP_CLOTH&&ZIP_CLOTH.drop;if(od){ZIP_CLOTH.drop=function(){clear();od();schedule();};const b=document.getElementById('bDrop');if(b)b.onclick=()=>ZIP_CLOTH.drop();}
window.ZIP_ACC={build,set(k,patch){const a=A();Object.assign(a[k],patch);cur=k;ui();dirty();build();},items:ITEMS};
if(P){ui();schedule();}
})();
