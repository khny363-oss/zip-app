/* זיפ · העוזרת — צ'אט פקודות בעברית שמבצע פעולות על הבגד ומסביר תפירה */
(function(){
const css=`
.chat{position:fixed;left:16px;bottom:16px;width:370px;height:min(580px,78vh);background:#1f1c19;border:1px solid rgba(255,255,255,.12);border-radius:18px;z-index:26;display:none;flex-direction:column;box-shadow:0 24px 70px rgba(0,0,0,.55);direction:rtl}
.chat.on{display:flex}
.chead{display:flex;align-items:center;gap:8px;padding:12px 14px;border-bottom:1px solid var(--line)}
.chead b{flex:1;font-weight:700;font-size:15px}
.chead small{display:block;font-weight:300;color:var(--mut);font-size:11.5px}
.chead button{background:none;border:1px solid var(--line);color:var(--txt);width:32px;height:32px;border-radius:9px;cursor:pointer;font-size:14px}
.clog{flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:8px}
.msg{max-width:88%;padding:9px 12px;border-radius:14px;font-size:14px;line-height:1.6;white-space:pre-line;word-wrap:break-word}
.msg.me{align-self:flex-start;background:var(--acc);color:#fff;border-bottom-right-radius:4px}
.msg.bot{align-self:flex-end;background:rgba(255,255,255,.07);border-bottom-left-radius:4px}
.msg.bot b{color:var(--acc2);font-weight:500}
.csug{display:flex;gap:6px;overflow-x:auto;padding:2px 12px 8px;scrollbar-width:none}
.csug::-webkit-scrollbar{display:none}
.csug button{flex:none;border:1px solid var(--line);background:rgba(255,255,255,.04);color:var(--txt);font:13px Heebo,sans-serif;padding:6px 11px;border-radius:999px;cursor:pointer;white-space:nowrap}
.cin{display:flex;gap:6px;padding:10px;border-top:1px solid var(--line)}
.cin input{flex:1;min-width:0;background:rgba(255,255,255,.06);border:1px solid var(--line);color:var(--txt);font:15px Heebo,sans-serif;padding:10px 12px;border-radius:12px;outline:none}
.cin input:focus{border-color:var(--acc)}
.cin button{background:var(--acc);border:0;color:#fff;font:500 14px Heebo,sans-serif;padding:0 16px;border-radius:12px;cursor:pointer}
@media(max-width:900px){.chat{left:0;right:0;bottom:0;width:auto;height:52vh;border-radius:18px 18px 0 0;padding-bottom:env(safe-area-inset-bottom)}.cin input{font-size:16px}}
`;
const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
const box=document.createElement('div');box.className='chat';box.id='chat';
box.innerHTML=`<div class="chead"><b>💬 העוזרת של זיפ<small>כותבים מה רוצים, במילים שלכם</small></b><button id="chX" aria-label="סגירה">✕</button></div>
<div class="clog" id="clog"></div><div class="csug" id="csug"></div>
<form class="cin" id="cin"><input id="cq" autocomplete="off" enterkeyhint="send" placeholder="למשל: שלושה חורים קטנים בכתף"><button type="submit">שלח</button></form>`;
document.body.appendChild(box);
const log=box.querySelector('#clog'),sug=box.querySelector('#csug'),inp=box.querySelector('#cq');

function say(text,who){const m=document.createElement('div');m.className='msg '+(who||'bot');
 if(who==='me')m.textContent=text;else m.innerHTML=text;log.appendChild(m);log.scrollTop=log.scrollHeight;}
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const SUG=['תזרקי את הבגד','חולצה שחורה מג׳ינס','שלושה חורים קטנים בכתף','שרוולים ארוכים וצווארון וי','איך מחברים את השרוול?','איך שמים שני בדים במכונה?','תפר זיגזג בצדדים','חוט צהוב בכל התפרים','חריץ למטה','גזרה רחבה וקצרה','בטל'];
function renderSug(list){sug.innerHTML='';(list||SUG).forEach(s=>{const b=document.createElement('button');b.type='button';b.textContent=s;b.onclick=()=>send(s);sug.appendChild(b);});}
let greeted=false;
function open(){box.classList.add('on');if(!greeted){greeted=true;say('היי! אני העוזרת של זיפ ✂️\nכותבים לי מה בא לכם, ואני עושה את זה על הבגד, או מסבירה איך תופרים את זה באמת.\nאפשר לבחור חלק בלחיצה ואז לכתוב "פה".');renderSug();}setTimeout(()=>{if(innerWidth>900)inp.focus();},50);}
box.querySelector('#chX').onclick=()=>box.classList.remove('on');
const btn=document.getElementById('bChat');if(btn)btn.onclick=()=>box.classList.contains('on')?box.classList.remove('on'):open();
box.querySelector('#cin').onsubmit=e=>{e.preventDefault();const q=inp.value.trim();if(!q)return;inp.value='';send(q);};
function send(q){say(q,'me');let r;try{r=handle(q);}catch(err){console.error(err);r='משהו השתבש אצלי בביצוע 😬 נסו שוב, או לכתוב את זה אחרת.';}setTimeout(()=>say(r),180);}

/* ---------- parsing helpers ---------- */
const norm=s=>' '+String(s).replace(/[֑-ׇ]/g,'').replace(/[״“”]/g,'"').replace(/[׳’`]/g,"'").replace(/[.,!?;:()\-–—]/g,' ').replace(/\s+/g,' ').trim().toLowerCase()+' ';
const W=(t,f,pre)=>new RegExp('\\s'+(pre===undefined?'[ובלמהשכ]{0,3}':pre)+'(?:'+f+')(?=\\s)').test(t);
const NUMW={'אחד':1,'אחת':1,'שני':2,'שתי':2,'שניים':2,'שתיים':2,'זוג':2,'שלוש':3,'שלושה':3,'ארבע':4,'ארבעה':4,'חמש':5,'חמישה':5,'שש':6,'שישה':6,'שבע':7,'שבעה':7,'שמונה':8};
const COL=[
 ['אדום|אדומה|אדומים|אדומות','#b3262e','אדום'],['בורדו','#7a2e2a','בורדו'],['יין','#9b2f3f','יין'],['כתום|כתומה|כתומים','#d9662e','כתום'],
 ['צהוב|צהובה|צהובים|צהובות','#e8c547','צהוב'],['חרדל','#d9a441','חרדל'],['ירוק|ירוקה|ירוקים|ירוקות','#2f4a3a','ירוק'],['זית','#5d6b52','זית'],
 ['תכלת','#8aa4c1','תכלת'],['כחול|כחולה|כחולים|כחולות','#2f4560','כחול'],['נייבי|כחול כהה','#1f2a44','נייבי'],['סגול|סגולה|סגולים','#6b4a8a','סגול'],
 ['ורוד|ורודה|ורודים|ורודות','#d58aa0','ורוד'],["בז'|בז|בייג'|בייג",'#c9b79c','בז׳'],['קרם|שמנת','#e8e2d6','קרם'],['לבן|לבנה|לבנים|לבנות','#f3eee7','לבן'],
 ['שחור|שחורה|שחורים|שחורות','#151515','שחור'],['אפור|אפורה|אפורים','#8a8a86','אפור'],['חום|חומה|חומים','#6b4a33','חום'],['טרקוטה|חמרה','#b5653f','טרקוטה'],['זהב|זהוב|זהובה','#d9a441','זהב']];
const FABW={cotton:'כותנה',linen:'פשתן',denim:"ג'ינס|גינס|דנים|ג'ינסים",silk:'משי|סאטן',knit:'סריג|טריקו|סריגה',velvet:'קטיפה'};
const STW={zigzag:'זיגזג|זיג זג|זגזג',overlock:'אוברלוק|אוורלוק|overlock',french:'צרפתי|צרפתית',double:'כפול|כפולה|כפולים',straight:'ישר|ישרה|רגיל',top:'עליון|בולט|בולטת|דקורטיבי'};
const FEMC={'אדום':'אדומה','כתום':'כתומה','צהוב':'צהובה','ירוק':'ירוקה','כחול':'כחולה','סגול':'סגולה','ורוד':'ורודה','לבן':'לבנה','שחור':'שחורה','אפור':'אפורה','חום':'חומה'};
function colorIn(t){for(const [f,hex,n] of COL)if(W(t,f))return {hex,n};return null;}
function partsIn(t){const a=[];
 if(W(t,'חזית|קדמי|קדמית|מלפנים|קדימה|החזה'))a.push('front');
 if(W(t,'גב|אחורי|אחורית|מאחור|מאחורה'))a.push('back');
 if(/שרוול/.test(t))a.push('sleeve');return a;}
const allWord=t=>W(t,'הכל|הכול|כולה|כולו')||/כל (ה)?(חלקים|החלקים|החולצה|חולצה|הבגד|בגד)/.test(t);
const hereWord=t=>W(t,'פה|כאן|הזה|הזאת|הזו|זה','[ובלמהש]{0,2}');
const nameList=ids=>{const n=ids.map(i=>PNAME[i]);return n.length>1?n.slice(0,-1).join(', ')+' וה'+n[n.length-1]:n[0];};

function seamsIn(t){const s=[];
 if(W(t,'כתף|כתפיים|כתפיה|כתפה'))s.push('shoulder');
 if(/בית ה?יד|בתי ה?יד|חיבור ה?שרוול|בית ה?שחי/.test(t))s.push('armhole');
 if(W(t,'צד|צדדים|צדדי'))s.push('side');
 if(/מתחת ל?זרוע|תפר ה?שרוול|לאורך ה?שרוול/.test(t))s.push('underarm');
 if(/צווארון|צוואר/.test(t))s.push('neck');
 if(/מכפלת|מכפלה/.test(t))s.push('hem');
 if(/קצה ה?שרוול|גימור ה?שרוול|שפת ה?שרוול|סוף ה?שרוול/.test(t))s.push('cuff');
 const act=activeSeams();return s.filter(x=>act.includes(x));}

/* ---------- geometry helpers for holes ---------- */
function inside(pc,u,v){const lx=Math.floor((u-pc.u0)*PX),ly=Math.floor((v-pc.v0)*PX);if(lx<0||ly<0||lx>=pc.mask.width||ly>=pc.mask.height)return false;return pc.md[(ly*pc.mask.width+lx)*4+3]>=128;}
function nudge(pc,u,v,r){for(let k=0;k<40;k++){if(inside(pc,u,v)&&inside(pc,u+r,v)&&inside(pc,u-r,v)&&inside(pc,u,v+r)&&inside(pc,u,v-r))return [u,v];u+=(pc.cen[0]-u)*0.08;v+=(pc.cen[1]-v)*0.08;}return inside(pc,u,v)?[u,v]:null;}
function bounds(pc){let a=1e9,b=-1e9,c=1e9,d=-1e9;pc.outline.forEach(([u,v])=>{a=Math.min(a,u);b=Math.max(b,u);c=Math.min(c,v);d=Math.max(d,v);});return {umin:a,umax:b,vmin:c,vmax:d};}
function spot(pc,where){const B=bounds(pc);
 if(pc.id==='sleeve'){const mid=(B.vmin+B.vmax)/2;return where==='hem'?[0,B.vmax-3]:[0,mid];}
 const nd=pc.id==='front'?GEO.ndF:3;
 switch(where){case 'shoulder':return [GEO.S*0.7,GEO.s*4+4];case 'neck':return [0,nd+3.5];case 'hem':return [0,B.vmax-4];case 'side':return [B.umax-5,(GEO.va+B.vmax)/2];default:return [0,(nd+B.vmax)/2-3];}}

/* ---------- sewing knowledge ---------- */
const JOIN={shoulder:'מחברים חזית לגב בקו הכתף',side:'מחברים חזית לגב, מבית השחי ועד המכפלת',armhole:'מחברים את כיפת השרוול לבית היד, כשאמצע הכיפה מול תפר הכתף',underarm:'מקפלים את השרוול לאורכו ותופרים אותו לעצמו',neck:'גימור של קו הצווארון',hem:'גימור של התחתית',cuff:'גימור של קצה השרוול'};
function fabNote(){const fs=new Set(Object.keys(PC).map(k=>P.fab[k].fab));const n=[];
 if(fs.has('knit'))n.push('בסריג: מחט כדורית (ballpoint) ותפר זיגזג או תפר נמתח, ולא מותחים את הבד בזמן התפירה.');
 if(fs.has('silk'))n.push('במשי: מחט דקה, סיכות רק בתוך השוליים כי הן משאירות סימן, ותפר צרפתי לגימור נקי.');
 if(fs.has('denim'))n.push('בג׳ינס: מחט ג׳ינס עבה, צעד תפר ארוך יותר, ובחיבורים עבים מסובבים את הגלגל ביד.');
 if(fs.has('velvet'))n.push('בקטיפה: הסיב צריך לפנות לאותו כיוון בכל החלקים, ותופרים לאט כי הבד נוטה להחליק.');
 return n.join('\n');}
function explainJoin(ids){const lines=ids.map(id=>{const S0=SEAMS[id];return `${S0.L?`<b>${S0.L}</b> · `:''}<b>${esc(seamName(id))}</b>: ${JOIN[id]}. תפר ${STITCH[P.seams[id].t].n}.`;});
 const fin=ids.every(i=>['neck','hem','cuff'].includes(i));
 let how=fin?'איך: מקפלים את הקצה פנימה פעמיים (0.5 ואז 1 ס״מ), מגהצים כדי שהקיפול יחזיק, סוגרים בסיכות ותופרים קרוב לקיפול הפנימי.'
 :'במכונה, צעד אחר צעד:\n1. מניחים את שני הבדים פנים אל פנים (הצד היפה פנימה), והקצוות המסומנים באותה אות ובאותו צבע מיושרים.\n2. סיכות כל 5–8 ס״מ, בניצב לקצה.\n3. מכניסים מתחת לרגלית כשקצה הבד צמוד לקו 1 ס״מ שעל הפלטה, כי זה השוליים שבגזרה.\n4. 2–3 תפרים אחורה בהתחלה ובסוף, כדי לנעול את התפר.\n5. מוציאים כל סיכה לפני שהיא מגיעה למחט.\n6. גומרים את השוליים באוברלוק או בזיגזג, פותחים ומגהצים.';
 const fn=fabNote();
 return lines.join('\n')+'\n\n'+how+(fn?'\n\n'+fn:'')+'\n\nהדלקתי את הקצוות האלה על השולחן ועל הבובה, באותו צבע.';}

/* ---------- main handler ---------- */
function handle(raw){const t=norm(raw);const done=[];let explain=null,regenNeeded=false;

 // help
 if(/^\s*(עזרה|help|מה אפשר|מה את יודעת|מה את יכולה|מה אפשר לעשות)\s*$/.test(t)||/מה את (יודעת|יכולה) לעשות/.test(t))return helpText();

 // gravity drop
 if(/כבידה|לזרוק|תזרוק|תזרקי|תזרקו|זריקה|להלביש|תלביש|תלבישי|תלבישו/.test(t)&&window.ZIP_CLOTH){ZIP_CLOTH.drop();return 'זורקת את הבגד 👕 תראו איך הוא נופל ומתיישב על הגוף. אפשר גם ללחוץ על "👕 זריקה" ליד הדמות.';}

 // undo / share / export / print
 if(W(t,'בטל|תבטל|תבטלי|תבטלו|אנדו|undo|ביטול')&&t.trim().split(' ').length<=4){if(!HIST.length)return 'אין עדיין מה לבטל.';document.getElementById('tUndo').click();return 'ביטלתי את הפעולה האחרונה על השולחן ↶';}
 if(/סטורי|אינסטגרם|אינסטה|לשתף|שתפי|שתף/.test(t)){document.getElementById('bShare').click();return 'הכנתי תמונת סטורי. לוחצים "שיתוף" ובוחרים אינסטגרם 📸';}
 if(/ייצוא|לייצא|תייצא|תייצאי|למפעל|לתופרת|פרומפט/.test(t)){openIO('export');return 'פתחתי את ייצוא הגזרה. אפשר להעתיק כפרומפט או להוריד קובץ ולשלוח לתופרת או למפעל.';}
 if(/הדפס|להדפיס|תדפיס|תדפיסי/.test(t)){printPattern();return 'פותחת הדפסה בגודל אמיתי 1:1. חשוב לבחור "גודל בפועל" או 100%, ולבדוק שהריבוע בעמוד הראשון יוצא 5×5 ס״מ.';}

 // body piercing (not supported on current avatar)
 const pierce=/פירסינג|פירסינגים|piercing|עגיל|עגילים|נזם/.test(t);
 if(pierce&&(W(t,'אוזן|אוזניים|אף|גבה|שפה|טבור|לשון|תנוך|פנים','[ובלמה]{0,3}')||/עגיל|נזם/.test(t))&&!/חולצה|בגד|חזית|גב|שרוול|כתף|בד/.test(t))
  return 'פירסינג ועגילים על הגוף עצמו יגיעו עם הבובה החדשה, שיהיו לה פנים ואוזניים 💎\nבינתיים אפשר לעשות פירסינג לבגד: חורים ואילתות. למשל "שלוש אילתות בכתף" או "שורת חורים בצווארון".';

 // body measurements
 const meas=[['h','גובה',145,195],['chest','חזה|היקף חזה',70,130],['waist','מותן|מותניים',55,120],['hips','ירכיים|ירך|אגן',80,140]];let mchg=[];
 meas.forEach(([k,f,a,b])=>{const m=t.match(new RegExp('(?:'+f+')\\s*(?:של\\s*)?(\\d{2,3})'));if(m){const v=clamp(+m[1],a,b);P.body[k]=v;mchg.push(`${f.split('|')[0]} ${v}`);}});
 if(mchg.length){syncBody();regenNeeded=true;done.push('עדכנתי מידות: '+mchg.join(', ')+' ס״מ');}

 // cut parameters
 let slp=null;if(/בלי (ה)?שרוול|ללא (ה)?שרוול|גופיה|גופייה/.test(t))slp='none';else if(/שרוול\S*\s+(ה)?ארוכ/.test(t)||/ארוכ\S* שרוול/.test(t))slp='long';else if(/שרוול\S*\s+(ה)?קצר/.test(t)||/קצר\S* שרוול/.test(t))slp='short';
 const t2=t.replace(/שרוול\S*\s+\S+/g,' ').replace(/\S+\s+שרוול\S*/g,' ');
 let len=null;if(/חריץ|שסע|חוט/.test(t)){}else if(/קרופ|בטן חשופה|crop/.test(t2)||W(t2,'קצרה|לקצר|תקצר|תקצרי|תקצרו|קצר'))len='crop';else if(W(t2,'ארוכה|להאריך|תאריך|תאריכי|תאריכו|ארוך|עד הירכיים'))len='long';else if(/אורך רגיל/.test(t))len='regular';
 let fit=null;if(W(t,'צמודה|צמוד|צמודים|צמודות|צרה'))fit='tight';else if(W(t,'רחבה|רחב|אוברסייז|אוברסייזד|oversize|oversized|רפויה|רפוי'))fit='loose';else if(/גזרה רגילה/.test(t))fit='regular';
 let neck=null;if(/(^|\s)(ב|ה)?וי(\s|$)|v neck|וי נק/.test(t)&&/צווארון|צוואר|וי/.test(t))neck='v';else if(/סירה/.test(t))neck='boat';else if(/צווארון (ה)?עגול|עגול/.test(t))neck='round';
 const cutNames=[];
 if(slp&&slp!==P.params.sleeve){P.params.sleeve=slp;cutNames.push({none:'בלי שרוולים',short:'שרוולים קצרים',long:'שרוולים ארוכים'}[slp]);}
 if(len&&len!==P.params.len){P.params.len=len;cutNames.push({crop:'אורך קצר',regular:'אורך רגיל',long:'אורך ארוך'}[len]);}
 if(fit&&fit!==P.params.fit){P.params.fit=fit;cutNames.push({tight:'גזרה צמודה',regular:'גזרה רגילה',loose:'גזרה רחבה'}[fit]);}
 if(neck&&neck!==P.params.neck){P.params.neck=neck;cutNames.push({round:'צווארון עגול',v:'צווארון וי',boat:'צווארון סירה'}[neck]);}
 if(cutNames.length){regenNeeded=true;done.push('שיניתי את הגזרה: '+cutNames.join(', ')+'. החלקים על השולחן חושבו מחדש לפי המידות');}
 if(regenNeeded)regen(true);

 // targets for fabric/colour
 let pp=partsIn(t);if(slp)pp=pp.filter(x=>x!=='sleeve');
 let targets;if(allWord(t))targets=Object.keys(P.fab);else if(pp.length)targets=pp;else if(hereWord(t))targets=[UI.sel];else targets=Object.keys(P.fab);
 const shown=targets.filter(k=>PC[k]);const tName=targets.length>=Object.keys(P.fab).length?'כל הבגד':nameList(shown.length?shown:targets);

 // thread colour
 const col=colorIn(t),thread=/חוט|חוטים|תפרים בצבע/.test(t);
 const sIn=seamsIn(t);
 if(col&&thread){const ids=sIn.length?sIn:activeSeams();ids.forEach(id=>P.seams[id].c=col.hex);renderAll();renderSeam();renderSheet();dirty();done.push(`חוט ${col.n} ב${sIn.length?ids.map(seamName).join(', '):'כל התפרים'}`);}

 // fabric / colour / print
 let fab=null;for(const k in FABW)if(W(t,FABW[k]))fab=k;
 let pr=null;if(/פסים|מפוספס|מפוספסת/.test(t))pr='stripes';else if(/משבצות|משובץ|משובצת/.test(t))pr='check';else if(/נקודות|מנוקד|מנוקדת|פולקה/.test(t))pr='dots';else if(/בלי הדפס|בלי דוגמה|בד חלק|חלקה/.test(t))pr='solid';
 const fcol=col&&!thread?col:null;
 if(fab||pr||fcol){targets.forEach(k=>{if(fab)P.fab[k].fab=fab;if(pr)P.fab[k].print=pr;if(fcol)P.fab[k].color=fcol.hex;});onFab();
  const fem=fab==='cotton'||fab==='velvet';const what=[fab?FAB[fab].n:'',fcol?(fab&&fem&&FEMC[fcol.n]?FEMC[fcol.n]:fcol.n):'',pr?(fab||fcol?'בהדפס ':'הדפס ')+PRINTS[pr]:''].filter(Boolean).join(' ');done.push(`שמתי ${what} על ${tName==='כל הבגד'?'כל הבגד':'ה'+tName}`);}

 // stitch type
 let stt=null;for(const k in STW){if(W(t,STW[k])){if(['double','straight','top'].includes(k)&&!/תפר|תפרים|תפירה/.test(t))continue;stt=k;break;}}
 if(stt){const ids=sIn.length?sIn:activeSeams();ids.forEach(id=>P.seams[id].t=stt);UI.seamSel=ids[0];renderAll();renderSeam();renderSheet();dirty();
  done.push(`תפר ${STITCH[stt].n} ב${sIn.length?ids.map(seamName).join(', '):'כל התפרים'}`);const a=advice(ids[0]);if(a)done.push('💡 '+a);}

 // holes / eyelets / piercing on garment
 const holeI=pierce||W(t,'חור|חורים|חורון|ניקוב|ניקובים|לנקב|תנקב|תנקבי|תנקבו|נקב|אילת|אילתות|eyelet','[ובלמהכ]{0,3}');
 if(holeI){let pid=pp.find(x=>PC[x])||(hereWord(t)||!pp.length?UI.sel:null)||'front';if(!PC[pid])pid='front';const pc=PC[pid];
  let d=1.5;if(W(t,'קטן|קטנים|קטנה|קטנות|קטנטן|קטנטנים|אילת|אילתות|עדין|עדינים|מיני'))d=0.6;else if(W(t,'גדול|גדולים|גדולה|ענק|עיגול|עיגולים'))d=4;
  let n=1;const md=t.match(/(\d+)\s*\S*(חור|אילת|ניקוב|נקב|פירסינג)/);if(md)n=clamp(+md[1],1,12);else{for(const w in NUMW)if(W(t,w,'[ו]?'))n=Math.max(n,NUMW[w]);}
  if(n===1&&/שורה|שורת/.test(t))n=5;
  let where='center';if(W(t,'כתף|כתפיים|כתפה'))where='shoulder';else if(/צווארון|צוואר/.test(t))where='neck';else if(/מכפלת|למטה|תחתית|בתחתית/.test(t))where='hem';else if(W(t,'צד|צדדים'))where='side';
  const [cu,cv]=spot(pc,where),sp=Math.max(d*2.2,2.2),vert=where==='shoulder'||where==='side';let placed=0;
  for(let i=0;i<n;i++){const o=(i-(n-1)/2)*sp;const q=nudge(pc,vert?cu:cu+o,vert?cv+o:cv,d/2+0.4);if(!q)continue;addOp(pid,{t:'hole',x:+q[0].toFixed(2),y:+q[1].toFixed(2),d});placed++;}
  selectPiece(pid,true);
  const wn={center:'במרכז',shoulder:'ליד הכתף',neck:'מתחת לצווארון',hem:'ליד המכפלת',side:'ליד הצד'}[where];
  const one=placed===1,dn=d===0.6?(one?'אילת אחת של 6 מ״מ':placed+' אילתות של 6 מ״מ'):d===4?(one?'עיגול אחד של 4 ס״מ':placed+' עיגולים של 4 ס״מ'):(one?'חור אחד של 1.5 ס״מ':placed+' חורים של 1.5 ס״מ');
  if(placed)done.push(`ניקבתי ${dn} ב${PNAME[pid]}, ${wn}${pierce?'. בייצור אפשר לשים בהם טבעות או אילתות מתכת':''}. "בטל" מחזיר אחורה`);
  else done.push('לא מצאתי שם מקום על הבד לניקוב. נסו מקום אחר, למשל "באמצע"');}

 // slit
 if(/חריץ|שסע|פתח למטה/.test(t)&&!holeI){let pid=pp.find(x=>PC[x]&&x!=='sleeve')||(PC[UI.sel]&&UI.sel!=='sleeve'?UI.sel:'front');const pc=PC[pid],B=bounds(pc);const side=W(t,'צד|צדדים|בצד');
  const L=W(t,'ארוך|עמוק')?14:8;const u=side?B.umax-0.6:0;const pts=[];for(let k=0;k<=8;k++)pts.push([+u.toFixed(2),+(B.vmax+1-k*(L+1)/8).toFixed(2)]);
  addOp(pid,{t:'cut',pts});selectPiece(pid,true);done.push(`חתכתי חריץ של ${L} ס״מ מהמכפלת למעלה, ב${PNAME[pid]}${side?' בצד':' באמצע'}`);}

 // sewing explanation
 const ask=/איך|מכונ|על השני|על השנייה|אחד על|אחת על|לחבר|מחבר|מתחבר|ביחד|לתפור|תופרים|מסבירה|תסבירי|להסביר/.test(t);
 if(ask&&!holeI&&!stt){
  if(/שלבים|סדר|מאיפה מתחילים|מדריך|כל החולצה|את החולצה/.test(t)&&!sIn.length&&partsIn(t).length<2){openTab('learn');const ss=steps();explain='זה סדר התפירה של הבגד שלכם:\n'+ss.map((s,i)=>`${i+1}. ${esc(s.t)}`).join('\n')+'\n\nפתחתי את לשונית "לימוד". כל שלב מדליק את הקצוות הרלוונטיים על השולחן ועל הבובה.';}
  else{let ids=sIn.slice();const ap=partsIn(t);
   if(!ids.length){if(ap.includes('sleeve')&&(ap.includes('front')||ap.includes('back')))ids=['armhole'];else if(ap.includes('sleeve'))ids=PC.sleeve?['armhole','underarm']:[];else ids=['shoulder','side'];}
   ids=ids.filter(i=>activeSeams().includes(i));
   if(!ids.length)explain='בגזרה הנוכחית אין שרוולים. אפשר לכתוב "שרוולים קצרים" ואז לשאול שוב.';
   else{UI.seamSel=ids[0];openTab('seam');renderSeam();setHL(ids);explain=explainJoin(ids);}}}

 if(!done.length&&!explain){if(regenNeeded)return 'עדכנתי.';return fallback();}
 return [done.length?done.map(x=>'✓ '+x).join('\n'):'',explain||''].filter(Boolean).join('\n\n');}

function helpText(){return 'כרגע אני יודעת:\n✓ בד, צבע והדפס: "חולצה ורודה מקטיפה", "גב מפוספס"\n✓ גזרה: "שרוולים ארוכים", "צווארון וי", "רחבה וקצרה"\n✓ ניקובים ופירסינג לבגד: "שלוש אילתות בכתף", "חור גדול באמצע"\n✓ חריץ: "חריץ בצד"\n✓ תפרים וחוטים: "תפר זיגזג בצדדים", "חוט צהוב בצווארון"\n✓ מידות: "גובה 160 חזה 84"\n✓ הסברים: "איך מחברים את השרוול?", "איך שמים שני בדים במכונה?"\n✓ "בטל", "סטורי", "ייצוא", "הדפסה"';}
function fallback(){return 'את זה עוד לא הבנתי 🙈\nאפשר לכתוב את זה אחרת, לבחור מההצעות למטה, או לכתוב "עזרה" ולראות כל מה שאני יודעת לעשות.';}
window.MIDA_CHAT={open,handle};
})();
