/* זיפ · מראה: תאורת סביבה אמיתית, חומרים פיזיקליים לעור, לשיער ולבד */
(function(){
let envReady=false;
function loadEnv(){const sc=document.createElement('script');sc.src='https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/environments/RoomEnvironment.js';
 sc.onload=()=>{try{const pm=new THREE.PMREMGenerator(renderer);scene.environment=pm.fromScene(new THREE.RoomEnvironment(),0.04).texture;pm.dispose();envReady=true;tune();}catch(e){console.warn(e);}};document.head.appendChild(sc);}
const SKIN=new WeakMap();
function tune(){if(typeof avatar==='undefined')return;
 renderer.toneMappingExposure=0.8;
 if(envReady)scene.traverse(o=>{if(o.isMesh&&o.material&&!o.userData.piece&&!o.isSkinnedMesh){(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>{if(m.envMapIntensity!==undefined&&!m.userData.envSet){m.envMapIntensity=0.15;m.userData.envSet=1;}});}});
 avatar.traverse(o=>{if(!o.isMesh||!o.material)return;const m=o.material;
  if(o.userData.piece){m.envMapIntensity=0.3;return;}
  if(o.isSkinnedMesh){const n=m.name||'';
   if(/opacity/.test(n)){m.alphaToCoverage=true;m.alphaTest=0.3;m.roughness=0.5;m.envMapIntensity=0.22;m.needsUpdate=true;return;}
   if(/head|body/.test(n)&&!SKIN.has(o)){const p=new THREE.MeshPhysicalMaterial({name:n,map:m.map,normalMap:m.normalMap,normalScale:new THREE.Vector2(0.9,0.9),
     roughness:/head/.test(n)?0.5:0.6,metalness:0,clearcoat:/head/.test(n)?0.06:0,clearcoatRoughness:0.6,envMapIntensity:0.22});
    p.skinning=true;o.material=p;SKIN.set(o,p);}
   else if(SKIN.has(o)){const p=SKIN.get(o);if(p.map!==m.map&&m!==p){p.map=m.map;p.needsUpdate=true;o.material=p;}}}});}
const orig=window.buildAvatar;window.buildAvatar=function(){orig();setTimeout(tune,30);setTimeout(tune,600);};
loadEnv();setTimeout(tune,1500);
window.ZIP_LOOK={tune};
})();
