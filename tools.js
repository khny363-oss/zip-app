/* זיפ · כלים לשולחן העבודה: מכחול, טקסט/הדפס, טלאים, סרגל */
(function(){
const PAL=['#151515','#f3eee7','#b3262e','#d9662e','#e8c547','#5d6b52','#2f4560','#8aa4c1','#d58aa0','#6b4a8a'];
const T={brush:{c:'#b3262e',w:1},text:{c:'#151515',s:4,txt:'ZIP'},patch:{c:'#d9662e',s:6,shape:'heart'}};
const SHAPES={heart:'❤',star:'★',flower:'✿',bolt:'⚡',smile:'☺',circle:'●'};
const css=`.tools{max-width:calc(100% - 16px);overflow-x:auto;scrollbar-width:none}.tools::-webkit-scrollbar{display:none}
.subtools .sw{width:22px;height:22px;border-width:2px}.subtools input{background:rgba(255,255,255,.08);border:1px solid var(--line);color:var(--txt);font:13px Heebo,sans-serif;padding:4px 8px;border-radius:8px;width:110px}
.subtools .lab{color:var(--mut);font-size:12px;align-self:center;padding:0 4px}.subtools{flex-wrap:wrap;max-width:calc(100% - 16px);align-items:center}`;
const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);

/* buttons */
const bar=document.getElementById('tools'),sep=bar.querySelector('.sep');
[['brush','🖌️ מכחול'],['text','🔤 טקסט'],['patch','⭐ טלאי'],['ruler','📏 סרגל']].forEach(([t,l])=>{const b=document.createElement('button');b.dataset.tool=t;b.textContent=l;b.onclick=()=>setTool(t);bar.insertBefore(b,sep);});
/* option rows */
const pane=document.getElementById('pane2');
function sw(cur,k){return PAL.map(c=>`<div class="sw ${c===cur?'on':''}" style="background:${c}" data-k="${k}" data-c="${c}"></div>`).join('');}
const rows={};
function mk(id,html){const d=document.createElement('div');d.className='subtools';d.id=id;d.innerHTML=html;pane.appendChild(d);rows[id]=d;return d;}
function renderRows(){
 mk('opt-brush','');rows['opt-brush'].innerHTML=`<span class="lab">עובי</span>${[0.4,1,2.5].map(w=>`<button data-bw="${w}" class="${T.brush.w===w?'on':''}">${w} ס״מ</button>`).join('')}<span class="lab">צבע</span>${sw(T.brush.c,'brush')}`;
 mk('opt-text','');rows['opt-text'].innerHTML=`<input id="txtIn" maxlength="24" value="${T.text.txt.replace(/"/g,'&quot;')}"><span class="lab">גודל</span>${[2,4,7].map(s=>`<button data-ts="${s}" class="${T.text.s===s?'on':''}">${s} ס״מ</button>`).join('')}${sw(T.text.c,'text')}`;
 mk('opt-patch','');rows['opt-patch'].innerHTML=`${Object.entries(SHAPES).map(([k,v])=>`<button data-ps="${k}" class="${T.patch.shape===k?'on':''}">${v}</button>`).join('')}<span class="lab">גודל</span>${[3,6,10].map(s=>`<button data-pz="${s}" class="${T.patch.s===s?'on':''}">${s}</button>`).join('')}${sw(T.patch.c,'patch')}`;}
['opt-brush','opt-text','opt-patch'].forEach(id=>mk(id,''));renderRows();
pane.addEventListener('click',e=>{const t=e.target,d=t.dataset;if(!t.closest('.subtools'))return;
 if(d.c&&d.k){T[d.k].c=d.c;}else if(d.bw)T.brush.w=+d.bw;else if(d.ts)T.text.s=+d.ts;else if(d.ps)T.patch.shape=d.ps;else if(d.pz)T.patch.s=+d.pz;else return;
 const keep=document.getElementById('txtIn').value;T.text.txt=keep;Object.values(rows).forEach(r=>r.remove());['opt-brush','opt-text','opt-patch'].forEach(id=>mk(id,''));renderRows();showRows();});
pane.addEventListener('input',e=>{if(e.target.id==='txtIn')T.text.txt=e.target.value;});
function showRows(){['brush','text','patch'].forEach(k=>rows['opt-'+k].classList.toggle('on',UI.tool===k));}
const HINT2={brush:'מציירים על הבד בצבע, כמו צבע לבד. רואים את זה מיד על הבובה',text:'כותבים טקסט למעלה ולוחצים על הבד, על השולחן או על הבובה, כדי להדפיס אותו',patch:'בוחרים צורה ולוחצים על הבד כדי לתפור טלאי',ruler:'גוררים קו כדי למדוד מרחק בס״מ'};
const origSet=window.setTool;
window.setTool=function(t){origSet(t);if(HINT2[t])document.getElementById('thint').textContent=HINT2[t];showRows();if(t!=='ruler'){RUL=null;}req2();};

/* ---------- drawing decorations onto the piece texture (inside the outline only) ---------- */
function patchPath(shape,r){const p=new Path2D();
 if(shape==='heart'){p.moveTo(0,r*0.9);p.bezierCurveTo(-r*1.3,-r*0.1,-r*0.7,-r*1.1,0,-r*0.45);p.bezierCurveTo(r*0.7,-r*1.1,r*1.3,-r*0.1,0,r*0.9);}
 else if(shape==='star'){for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,q=i%2?r*0.45:r;i?p.lineTo(Math.cos(a)*q,Math.sin(a)*q):p.moveTo(Math.cos(a)*q,Math.sin(a)*q);}p.closePath();}
 else if(shape==='flower'){for(let i=0;i<6;i++){const a=i*Math.PI/3;p.moveTo(Math.cos(a)*r*0.55+r*0.42,Math.sin(a)*r*0.55);p.arc(Math.cos(a)*r*0.55,Math.sin(a)*r*0.55,r*0.42,0,7);}}
 else if(shape==='bolt'){[[0.2,-1],[-0.45,0.1],[0,0.1],[-0.2,1],[0.45,-0.15],[0,-0.15]].forEach(([x,y],i)=>i?p.lineTo(x*r,y*r):p.moveTo(x*r,y*r));p.closePath();}
 else{p.arc(0,0,r,0,7);}
 return p;}
function drawDeco(pc){const g=pc.cv.getContext('2d'),ops=(P.ops[pc.id]||[]).filter(o=>o.t==='paint'||o.t==='text'||o.t==='patch');if(!ops.length)return false;
 g.save();g.globalCompositeOperation='source-atop';
 for(const o of ops){
  if(o.t==='paint'){g.strokeStyle=o.c;g.lineWidth=o.w*PX;g.lineCap=g.lineJoin='round';g.globalAlpha=0.92;pathOn(g,o.pts,pc);g.stroke();g.globalAlpha=1;}
  else if(o.t==='text'){g.save();g.translate((o.x-pc.u0)*PX,(o.y-pc.v0)*PX);g.fillStyle=o.c;g.font=`800 ${o.s*PX}px Heebo,Arial,sans-serif`;g.textAlign='center';g.textBaseline='middle';g.direction=/[֐-׿]/.test(o.txt)?'rtl':'ltr';g.globalAlpha=0.94;g.fillText(o.txt,0,0);g.restore();}
  else if(o.t==='patch'){g.save();g.translate((o.x-pc.u0)*PX,(o.y-pc.v0)*PX);const r=o.s/2*PX,p=patchPath(o.shape,r);
   g.shadowColor='rgba(0,0,0,.35)';g.shadowBlur=0.4*PX;g.shadowOffsetY=0.15*PX;g.fillStyle=o.c;g.fill(p);g.shadowColor='transparent';
   g.strokeStyle='rgba(255,255,255,.85)';g.lineWidth=0.09*PX;g.setLineDash([0.35*PX,0.22*PX]);g.scale(0.84,0.84);g.stroke(p);g.restore();}}
 g.restore();return true;}
const origRender=window.renderPiece;
window.renderPiece=function(pc){origRender(pc);if(drawDeco(pc))pc.tex.needsUpdate=true;};

/* ---------- table interaction ---------- */
let RUL=null;
c2.addEventListener('pointerdown',e=>{if(PTS.size>1)return;const t=UI.tool;const [X,Y]=toTable(e);
 if(t==='brush'){const pc=pieceAt(X,Y);if(pc)stroke={t:'paint',pc:pc.id,pts:[[X,Y]]};}
 else if(t==='text'||t==='patch'){const pc=pieceAt(X,Y);if(!pc){toast('לוחצים על הבד עצמו');return;}const [u,v]=loc(pc,X,Y);place(pc.id,u,v);}
 else if(t==='ruler'){RUL={a:[X,Y],b:[X,Y],on:true};req2();}});
c2.addEventListener('pointermove',e=>{if(RUL&&RUL.on){RUL.b=toTable(e);req2();}});
c2.addEventListener('pointerup',e=>{if(RUL)RUL.on=false;
 if(stroke&&stroke.t==='paint'){const st=stroke;stroke=null;if(st.pts.length>1){const pc=PC[st.pc];addOp(pc.id,{t:'paint',c:T.brush.c,w:T.brush.w,pts:st.pts.map(([x,y])=>loc(pc,x,y))});}req2();}},{capture:true});
function place(pid,u,v){if(UI.tool==='text'){const txt=(T.text.txt||'').trim();if(!txt){toast('כותבים טקסט בשורה למעלה');return;}addOp(pid,{t:'text',x:+u.toFixed(2),y:+v.toFixed(2),s:T.text.s,c:T.text.c,txt});}
 else addOp(pid,{t:'patch',x:+u.toFixed(2),y:+v.toFixed(2),s:T.patch.s,c:T.patch.c,shape:T.patch.shape});selectPiece(pid,true);}
/* place text / patch directly on the 3D figure */
let d3b=null;c3.addEventListener('pointerdown',e=>{d3b=[e.clientX,e.clientY];});
c3.addEventListener('pointerup',e=>{if(!d3b||!(UI.tool==='text'||UI.tool==='patch'))return;const d=Math.hypot(e.clientX-d3b[0],e.clientY-d3b[1]);d3b=null;if(d>6)return;const h=hit3(e);if(h&&h.piece)place(h.piece,h.u,h.v);});

/* ruler overlay */
const origDraw=window.draw2D;
window.draw2D=function(){origDraw();if(!RUL)return;const dpr=Math.min(devicePixelRatio,2),g=c2.getContext('2d');g.setTransform(dpr*view.s,0,0,dpr*view.s,dpr*view.ox,dpr*view.oy);
 const [ax,ay]=RUL.a,[bx,by]=RUL.b,L=Math.hypot(bx-ax,by-ay);g.save();g.strokeStyle='#ffd34d';g.lineWidth=2.5/view.s;g.beginPath();g.moveTo(ax,ay);g.lineTo(bx,by);g.stroke();
 const n=Math.floor(L),ux=(bx-ax)/(L||1),uy=(by-ay)/(L||1);for(let i=0;i<=n;i++){const k=i%5===0?0.8:0.4;g.beginPath();g.moveTo(ax+ux*i-uy*k,ay+uy*i+ux*k);g.lineTo(ax+ux*i+uy*k,ay+uy*i-ux*k);g.lineWidth=1.2/view.s;g.stroke();}
 g.fillStyle='#ffd34d';g.font=`700 ${14/view.s}px Heebo,sans-serif`;g.textAlign='center';g.fillText(L.toFixed(1)+' ס״מ',(ax+bx)/2,(ay+by)/2-10/view.s);g.restore();};

window.ZIP_TOOLS={T,place};
})();
