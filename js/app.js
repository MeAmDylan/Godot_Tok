'use strict';
const PREVIEW = new URLSearchParams(window.location.search).get('preview')==='1';

/* ================================================================
   🎮  ADD VIDEOS HERE
   Copy any line, paste above it, change the values.

   YouTube ID: the 11-char string after v= in the URL
   TikTok ID:  the number at end of @user/video/NUMBER

   long:false  always shown (shorts, tips, medium vids)
   long:true   only shown when the "longform" toggle is on
   ================================================================ */
const SEED_VIDEOS = [
  /* ── TikTok test ── */
  {id:'tt_7621614029471059233',type:'tt',vid:'7621614029471059233',handle:'@godot_tutorial',title:'Godot engine tips and tricks',creator:'@godot_tutorial',long:false},

  /* ── YouTube Shorts ── */
  {id:'yt_v7d8uYw59jk',type:'yt',vid:'v7d8uYw59jk',title:'60-Second Godot Roadmap for 2025',creator:'GDQuest',long:false},
  {id:'yt_7bDRWiPMVjM',type:'yt',vid:'7bDRWiPMVjM',title:'3 Simple Tips for Godot 4.3',creator:'TheGodotRookie',long:false},
  {id:'yt__JfiGCH3IH4',type:'yt',vid:'_JfiGCH3IH4',title:'Disabling Nodes | Godot Tips',creator:'Bitlytic',long:false},
  {id:'yt_2KL1cAe2NFI',type:'yt',vid:'2KL1cAe2NFI',title:'Biggest Game Made with Godot 4',creator:'GameDevShorts',long:false},
  {id:'yt_ckQGoa6-TMU',type:'yt',vid:'ckQGoa6-TMU',title:'Change Game Scene in Godot 4.4',creator:'GodotTips',long:false},
  {id:'yt_bChoEFDe5ks',type:'yt',vid:'bChoEFDe5ks',title:"Godot 4.6 — What's New",creator:'Zenva',long:false},
  {id:'yt_iletwmlcsEM',type:'yt',vid:'iletwmlcsEM',title:'Why AI Will Never Be Good at Godot 4',creator:'Zenva',long:false},
  {id:'yt_-zwY2jM32A',type:'yt',vid:'-zwY2jM3-2A',title:'Control Projectile Direction in Godot 4',creator:'Quick Guide',long:false},

  /* ── Regular YouTube ── */
  {id:'yt_UuEqUN98uZo',type:'yt',vid:'UuEqUN98uZo',title:'5 Invaluable Godot 4 Code Patterns ft. GDQuest',creator:'PlayWithFurcifer',long:false},
  {id:'yt_Pm-Gu8d_2Ug',type:'yt',vid:'Pm-Gu8d_2Ug',title:'Should You Use Godot 4 Already?',creator:'GDQuest',long:false},
  {id:'yt_D0uGtnMhB-E',type:'yt',vid:'D0uGtnMhB-E',title:'Resources vs Dictionaries in Godot 4',creator:'DevWorm',long:false},
  {id:'yt_XvRY-g27OQk',type:'yt',vid:'XvRY-g27OQk',title:'Easy 3D Pathfinding in Godot',creator:'Chap.C Creates',long:false},
  {id:'yt_h7O2lLNgbn4',type:'yt',vid:'h7O2lLNgbn4',title:'Procedural Dungeon with Drunkard Walk',creator:'DeveloperEzra',long:false},
  {id:'yt_xoExhXu-Aw0',type:'yt',vid:'xoExhXu-Aw0',title:'GodotCon 2025: C# in Godot',creator:'GodotCon',long:false},

  /* ── GodotCon 2025 ── */
  {id:'yt_u_WMJG0menc',type:'yt',vid:'u_WMJG0menc',title:'State of Godot and the Web — GodotCon 2025',creator:'GodotCon',long:false},
  {id:'yt_wWD7OCx7tNs',type:'yt',vid:'wWD7OCx7tNs',title:'Open Language Models in Godot — GodotCon 2025',creator:'GodotCon',long:false},
  {id:'yt_JqL_oZ9SG7Q',type:'yt',vid:'JqL_oZ9SG7Q',title:'Building a Godot Plugin — GodotCon 2025',creator:'Scott Doxey',long:false},
  {id:'yt_kXn2WoWK0rc',type:'yt',vid:'kXn2WoWK0rc',title:'Making a Fake OS in Godot — GodotCon 2025',creator:'Davide Di Staso',long:false},
  {id:'yt_ITRuS1ge9AY',type:'yt',vid:'ITRuS1ge9AY',title:'3D Particle Trail in Godot 4',creator:'FencerDevLog',long:false},

  /* ── Longform ── */
  {id:'yt_LOhfqjmasi0',type:'yt',vid:'LOhfqjmasi0',title:'How to Make a Video Game — Godot Beginner Tutorial',creator:'Brackeys',long:true},
  {id:'yt_e1zJS31tr88',type:'yt',vid:'e1zJS31tr88',title:'How to Program in Godot — GDScript in 1 Hour',creator:'Brackeys',long:true},
  {id:'yt_nAh_Kx5Zh5Q',type:'yt',vid:'nAh_Kx5Zh5Q',title:'The Ultimate Introduction to Godot 4',creator:'Clear Code',long:true},
  {id:'yt_HRxw8Ecrqxk',type:'yt',vid:'HRxw8Ecrqxk',title:'Complete FREE Godot 4 Beginner Course 2025',creator:'Red Fools Studio',long:true},
];

const LEARNING=window.GodotTokLearning;
const LEARNING_CATEGORIES=LEARNING.categories;

/* ── tips ─────────────────────────────────────────────────────── */
const TIPS = [
  {f:'scope.gd',t:'Make smaller games than you think you should',p:'Your first ten games are practice. A finished tiny game teaches more than an abandoned epic: menus, saving, balancing, shipping. Cut your idea in half, then cut it again.'},
  {f:'game_feel.gd',t:'Juice is cheap and changes everything',p:'Screen shake, hit-stop, particles and a sound on every action turn a stiff prototype into something that feels good. A few lines on <code>Camera2D</code> and an <code>AnimationPlayer</code> get you most of the way.'},
  {f:'typing.gd',t:'Use static typing in GDScript',p:'Write <code>var speed: float = 300.0</code> and <code>func hit(damage: int) -> void:</code>. You get real autocomplete, errors at parse time instead of runtime, and faster execution.'},
  {f:'signals.gd',t:'Call down, signal up',p:'Parents may call methods on their children directly. Children should never reach up — they emit signals and let whoever cares connect. This one rule keeps scenes reusable.'},
  {f:'git.gd',t:'Version control from day one',p:'<code>git init</code> before you write a line. Ignore the <code>.godot/</code> folder. The first time a refactor goes wrong or a scene file corrupts, one command gets you back.'},
  {f:'playtest.gd',t:'Watch strangers play, silently',p:'Friends are polite and you explain too much. Hand the build to someone who owes you nothing, say nothing, write down everywhere they get confused. That list is your real backlog.'},
  {f:'pixels.gd',t:'Pick one pixel density and commit',p:'Choose a tile size (16 or 32) and keep every sprite at that scale. Set the default texture filter to Nearest and use the viewport stretch mode for crisp scaling on any screen.'},
  {f:'slice.gd',t:'Build a vertical slice first',p:'One polished minute of real gameplay, real art, real sound tells you whether the loop is fun. Find that out before you build ten levels for a loop that does not work.'},
  {f:'scenes.gd',t:'If you use it twice, make it a scene',p:'Bullets, pickups, enemies, UI panels — anything reused becomes its own scene, instanced where needed. Scenes are prefabs. Composition beats one giant scene tree.'},
  {f:'delta.gd',t:'Use delta for manual position changes',p:'For manual motion use <code>position += velocity * delta</code>. For <code>CharacterBody2D</code>, set <code>velocity</code> in <code>_physics_process</code> and call <code>move_and_slide()</code>; it applies the physics timestep for you.'},
  {f:'audio.gd',t:'Audio is half the experience',p:'Even rough placeholder sounds beat silence — players forgive simple art far faster than a mute game. Balance with audio buses early so you do not have to redo it at the end.'},
  {f:'marketing.gd',t:'Marketing starts at the prototype',p:'Post short clips of your juiciest moments while you build. An audience grows slowly. The day your store page goes live should not be the first day strangers hear about your game.'},
];

/* ── storage adapter ─────────────────────────────────────────── */
const mem = {};
function safeJsonParse(raw,fallback){
  if(raw==null)return fallback;
  try{const value=JSON.parse(raw);return value==null?fallback:value}catch{return fallback}
}
function readLocal(key,fallback){
  try{return safeJsonParse(window.localStorage.getItem(key),fallback)}catch{return fallback}
}
function writeLocal(key,value){
  try{window.localStorage.setItem(key,JSON.stringify(value));return true}catch{return false}
}
const store = {
  async get(k){
    try{const v=window.localStorage.getItem(k);return safeJsonParse(v,mem[k]??null)}catch{return mem[k]??null}
  },
  async set(k,v){
    if(!writeLocal(k,v)){mem[k]=v;return false}
    return true;
  }
};

/* ── state ───────────────────────────────────────────────────── */
let userVideos=[], savedIds=[], savedItems={}, longformOn=false, showTikTok=true, muted=true;
let volume=65,lastVolume=65,sidebarExpanded=false;
let activeCard=null, activeIframe=null;
const cardState=new Map(); // {kind,playing,currentTime,duration}
const ytPlayers=new Map();
let shuffledFeed=[]; // set once per session, randomised
let modalReturnFocus=null;
const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ── utils ───────────────────────────────────────────────────── */
function shuffle(a){const b=[...a];for(let i=b.length-1;i>0;i--){const j=0|Math.random()*(i+1);[b[i],b[j]]=[b[j],b[i]]};return b}

function el(tag,cls,txt){const e=document.createElement(tag);if(cls)e.className=cls;if(txt!=null)e.textContent=txt;return e}
function svgUse(id){const s=document.createElementNS('http://www.w3.org/2000/svg','svg');s.innerHTML='<use href="#'+id+'"/>';return s}
function toast(m){const t=document.getElementById('toast');t.textContent=m;t.classList.add('show');clearTimeout(t._t);t._t=setTimeout(()=>t.classList.remove('show'),2200)}
function labelButton(button,label){button.type='button';button.setAttribute('aria-label',label);button.title=label;return button}
function openExternal(url){const win=window.open(url,'_blank','noopener,noreferrer');if(win)win.opener=null}
function updateMuteButtons(){
  document.querySelectorAll('.mutebtn').forEach(button=>{
    button.innerHTML='';button.appendChild(svgUse(muted?'ic-vol-off':'ic-vol-on'));
    button.setAttribute('aria-label',muted?'Turn sound on':'Mute videos');
    button.title=muted?'Turn sound on':'Mute videos';
    button.setAttribute('aria-pressed',String(!muted));
  });
  document.querySelectorAll('.volume-slider').forEach(input=>{
    input.value=String(muted?0:volume);
    input.setAttribute('aria-valuetext',(muted?0:volume)+' percent');
  });
  document.querySelectorAll('.volume-value').forEach(value=>{value.textContent=(muted?0:volume)+'%'});
}
function setMuted(next,announce=true){
  muted=Boolean(next);
  if(!muted&&volume===0)volume=lastVolume||65;
  ytPlayers.forEach(player=>{
    try{player.setVolume(volume);muted?player.mute():player.unMute()}catch{}
  });
  updateMuteButtons();
  writeLocal('gt_audio',{muted,volume,lastVolume});
  if(announce)toast(muted?'muted':'sound on');
}
function setVolume(next,announce=false){
  const parsed=Math.round(Number(next));
  volume=Math.max(0,Math.min(100,Number.isFinite(parsed)?parsed:65));
  if(volume>0){lastVolume=volume;muted=false}else{muted=true}
  ytPlayers.forEach(player=>{
    try{player.setVolume(volume);muted?player.mute():player.unMute()}catch{}
  });
  updateMuteButtons();
  writeLocal('gt_audio',{muted,volume,lastVolume});
  if(announce)toast('volume '+volume+'%');
}

function itemUrl(v){
  if(v.url)return v.url;
  if(v.type==='yt')return 'https://www.youtube.com/watch?v='+v.vid;
  return v.handle?'https://www.tiktok.com/'+v.handle+'/video/'+v.vid:'https://www.tiktok.com/player/v1/'+v.vid;
}
function ytThumb(id){return 'https://i.ytimg.com/vi/'+id+'/mqdefault.jpg'}
function validYouTubeId(id){return typeof id==='string'&&/^[A-Za-z0-9_-]{11}$/.test(id)}

function parseVideoUrl(raw){
  let u;try{u=new URL(raw.trim())}catch{return null}
  const h=u.hostname.replace(/^www\./,'');
  if(h==='youtu.be'){const id=u.pathname.split('/')[1];if(validYouTubeId(id))return{type:'yt',vid:id,url:u.href}}
  if(h.endsWith('youtube.com')){
    const v=u.searchParams.get('v');if(validYouTubeId(v))return{type:'yt',vid:v,url:u.href};
    const m=u.pathname.match(/\/(shorts|embed|live)\/([A-Za-z0-9_-]{11})(?:\/|$)/);if(m)return{type:'yt',vid:m[2],url:u.href};
  }
  if(h.endsWith('tiktok.com')){
    if(h.startsWith('vm.')||h.startsWith('vt.'))return{type:'tt_short'};
    const m=u.pathname.match(/\/@([^\/]+)\/video\/(\d+)/);if(m)return{type:'tt',vid:m[2],handle:'@'+m[1],url:u.href};
    const m2=u.pathname.match(/\/video\/(\d+)/);if(m2)return{type:'tt',vid:m2[1],url:u.href};
  }
  return null;
}

/* ── official YouTube IFrame Player API ──────────────────────── */
let ytApiPromise=null;
function loadYouTubeApi(){
  if(window.YT&&typeof window.YT.Player==='function')return Promise.resolve(window.YT);
  if(ytApiPromise)return ytApiPromise;
  ytApiPromise=new Promise((resolve,reject)=>{
    const timeout=window.setTimeout(()=>reject(new Error('YouTube Player API timed out')),15000);
    const previous=window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady=()=>{
      window.clearTimeout(timeout);
      if(typeof previous==='function')previous();
      resolve(window.YT);
    };
    let script=document.querySelector('script[data-godottok-youtube-api]');
    if(!script){
      script=document.createElement('script');
      script.src='https://www.youtube.com/iframe_api';
      script.async=true;
      script.dataset.godottokYoutubeApi='true';
      script.addEventListener('error',()=>{window.clearTimeout(timeout);reject(new Error('YouTube Player API failed to load'))},{once:true});
      document.head.appendChild(script);
    }
  });
  return ytApiPromise;
}

function ytCmd(card,fn,args=[]){
  const player=ytPlayers.get(card);
  if(!player||typeof player[fn]!=='function')return undefined;
  try{return player[fn](...(Array.isArray(args)?args:[]))}catch{return undefined}
}
function seekRelative(card,secs){
  const st=cardState.get(card);if(!st||st.kind!=='yt')return;
  const t=Math.max(0,Math.min(st.duration||Infinity,(st.currentTime||0)+secs));
  ytCmd(card,'seekTo',[t,true]);
  st.currentTime=t;
  updateScrubber(card,st);
}

function syncActivePlayer(){
  if(!activeCard||document.hidden)return;
  const player=ytPlayers.get(activeCard);
  const st=cardState.get(activeCard);
  if(!player||!st||st.kind!=='yt')return;
  try{
    const current=Number(player.getCurrentTime());
    const duration=Number(player.getDuration());
    if(Number.isFinite(current))st.currentTime=current;
    if(Number.isFinite(duration)&&duration>0)st.duration=duration;
    if(window.YT&&window.YT.PlayerState)st.playing=player.getPlayerState()===window.YT.PlayerState.PLAYING;
    activeCard.classList.toggle('paused',!st.playing);
    updateScrubber(activeCard,st);
  }catch{}
}
window.setInterval(syncActivePlayer,250);

function updateScrubber(card,st){
  const ratio=st.duration?Math.max(0,Math.min(1,st.currentTime/st.duration)):0;
  const pct=(ratio*100).toFixed(2)+'%';
  const fill=card.querySelector('.scrub-fill');
  const dot=card.querySelector('.scrub-dot');
  const hit=card.querySelector('.scrub-hit');
  if(fill)fill.style.width=pct;
  if(dot)dot.style.left=pct;
  if(hit){hit.setAttribute('aria-valuemax',String(Math.round(st.duration)));hit.setAttribute('aria-valuenow',String(Math.round(st.currentTime)))}
}

/* ── gestures ────────────────────────────────────────────────── */
function attachGestures(card,layer){
  let pd=null, lastTap=0, singleTapTimer=null;
  layer.addEventListener('contextmenu',e=>e.preventDefault());

  layer.addEventListener('pointerdown',e=>{
    pd={x:e.clientX,y:e.clientY,hold:false};
    pd.timer=setTimeout(()=>{
      if(!pd)return;
      pd.hold=true;
      card.classList.add('boosting');
      ytCmd(card,'setPlaybackRate',[2]);
    },280);
  });

  layer.addEventListener('pointermove',e=>{
    if(!pd)return;
    if(Math.hypot(e.clientX-pd.x,e.clientY-pd.y)>14){
      clearTimeout(pd.timer);
      if(pd.hold){card.classList.remove('boosting');ytCmd(card,'setPlaybackRate',[1])}
      pd=null;
    }
  });

  layer.addEventListener('pointerup',e=>{
    if(!pd)return;
    clearTimeout(pd.timer);
    const wasHold=pd.hold;
    const tapX=e.clientX-layer.getBoundingClientRect().left;
    const tapW=layer.offsetWidth;
    pd=null;
    if(wasHold){card.classList.remove('boosting');ytCmd(card,'setPlaybackRate',[1]);return}
    // double-tap detection
    const now=Date.now();
    if(now-lastTap<300){
      clearTimeout(singleTapTimer); lastTap=0;
      if(tapX<tapW*0.38){seekRelative(card,-10);showSeekHint(card,'l');return}
      if(tapX>tapW*0.62){seekRelative(card,10);showSeekHint(card,'r');return}
      // middle double-tap: treat as single
    } else {
      lastTap=now;
      singleTapTimer=setTimeout(()=>{togglePlay(card)},220);
    }
  });

  layer.addEventListener('pointercancel',()=>{
    if(!pd)return;
    clearTimeout(pd.timer);
    if(pd.hold){card.classList.remove('boosting');ytCmd(card,'setPlaybackRate',[1])}
    pd=null;
  });
}

function togglePlay(card){
  const st=cardState.get(card);if(!st||st.kind!=='yt')return;
  if(st.playing){ytCmd(card,'pauseVideo');st.playing=false;card.classList.add('paused')}
  else{ytCmd(card,'setVolume',[volume]);if(muted)ytCmd(card,'mute');else ytCmd(card,'unMute');ytCmd(card,'playVideo');st.playing=true;card.classList.remove('paused')}
}

function showSeekHint(card,side){
  const cls=side==='l'?'sl':'sr';
  const h=card.querySelector('.seek-hint.'+cls);
  if(!h)return;
  h.classList.remove('show');
  void h.offsetWidth;
  h.classList.add('show');
  setTimeout(()=>h.classList.remove('show'),550);
}

let theatreCard=null;
function updateFullscreenButtons(){
  const expanded=Boolean(document.fullscreenElement||theatreCard);
  document.querySelectorAll('.fullscreenbtn').forEach(button=>{
    button.setAttribute('aria-pressed',String(expanded&&button.closest('.card')===(document.fullscreenElement||theatreCard)));
    button.setAttribute('aria-label',expanded?'Exit fullscreen':'Enter fullscreen');
    button.title=expanded?'Exit fullscreen':'Enter fullscreen';
  });
}
function toggleTheatre(card){
  const next=theatreCard===card?null:card;
  theatreCard=next;
  document.body.classList.toggle('theatre-mode',Boolean(next));
  updateFullscreenButtons();
  toast(next?'theatre mode on':'theatre mode off');
}
async function toggleFullscreen(card){
  if(document.fullscreenElement){
    try{await document.exitFullscreen()}catch{}
    return;
  }
  if(theatreCard){toggleTheatre(theatreCard);return}
  if(card&&typeof card.requestFullscreen==='function'){
    try{await card.requestFullscreen();return}catch{}
  }
  toggleTheatre(card);
}
document.addEventListener('fullscreenchange',updateFullscreenButtons);

/* ── scrubber drag ───────────────────────────────────────────── */
function attachScrubber(card,hitEl){
  function seek(e){
    const st=cardState.get(card);if(!st)return;
    const track=card.querySelector('.scrub-track');
    const rect=(track||hitEl).getBoundingClientRect();
    const pct=Math.max(0,Math.min(1,(e.clientX-rect.left)/rect.width));
    const t=st.duration?pct*st.duration:0;
    ytCmd(card,'seekTo',[t,true]);
    st.currentTime=t;updateScrubber(card,st);
  }
  let dragging=false;
  hitEl.tabIndex=0;
  hitEl.setAttribute('role','slider');
  hitEl.setAttribute('aria-label','Video position');
  hitEl.setAttribute('aria-valuemin','0');
  hitEl.setAttribute('aria-valuemax','0');
  hitEl.setAttribute('aria-valuenow','0');
  hitEl.addEventListener('pointerdown',e=>{e.stopPropagation();dragging=true;hitEl.setPointerCapture(e.pointerId);seek(e)});
  hitEl.addEventListener('pointermove',e=>{if(dragging){e.stopPropagation();seek(e)}});
  hitEl.addEventListener('pointerup',e=>{dragging=false});
  hitEl.addEventListener('keydown',e=>{
    if(e.key!=='ArrowLeft'&&e.key!=='ArrowRight')return;
    e.preventDefault();seekRelative(card,e.key==='ArrowLeft'?-5:5);
  });
}

/* ── build video card ────────────────────────────────────────── */
function buildVideoCard(v){
  const card=el('div','card');
  card.dataset.vid=v.id;
  card.dataset.type=v.type;
  card._video=v;
  card.setAttribute('aria-label',(v.type==='yt'?'YouTube: ':'TikTok: ')+v.title);

  if(PREVIEW){
    const fb=el('div','fallback');
    const img=document.createElement('img');
    img.src='https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/godot/godot-original.svg';
    img.alt='';fb.appendChild(img);
    fb.appendChild(el('div','ft','embeds disabled in preview mode'));
    fb.appendChild(el('div','fs','Open the hosted app without ?preview=1 to load external video embeds.'));
    const go=labelButton(el('button','fb',v.type==='yt'?'watch on youtube':'open on tiktok'),'Open video in a new tab');
    go.addEventListener('click',()=>openExternal(itemUrl(v)));
    fb.appendChild(go);card.appendChild(fb);
  } else {
    const placeholder=el('div','video-placeholder');
    if(v.type==='yt'){
      const img=document.createElement('img');img.src=ytThumb(v.vid);img.alt='';placeholder.appendChild(img);
      const mark=el('span','vp-mark');mark.appendChild(svgUse('ic-play'));placeholder.appendChild(mark);
    } else {
      placeholder.appendChild(el('span','vp-mark','TT'));
    }
    placeholder.setAttribute('aria-hidden','true');
    card.appendChild(placeholder);
  }

  card.appendChild(el('div','scrim'));

  const meta=el('div','meta');
  const cr=el('div','mcr');
  const badgeEl=el('span','badge '+(v.type==='yt'?'yt':'tt'),v.type==='yt'?'YT':'TT');
  cr.appendChild(badgeEl);
  if(v.long){cr.appendChild(document.createTextNode(' '));cr.appendChild(el('span','badge long','LONG'))}
  cr.appendChild(el('span','',v.creator||''));
  meta.appendChild(cr);
  meta.appendChild(el('div','mtitle',v.title));
  card.appendChild(meta);

  /* rail */
  const rail=el('div','rail');rail.setAttribute('aria-label','Video actions');

  if(v.type==='yt'&&!PREVIEW){
    const volumeControl=el('div','volume-control');
    const bM=labelButton(el('button','mutebtn'),muted?'Turn sound on':'Mute videos');bM.appendChild(svgUse(muted?'ic-vol-off':'ic-vol-on'));bM.setAttribute('aria-pressed',String(!muted));
    bM.addEventListener('click',e=>{
      e.stopPropagation();setMuted(!muted);
      volumeControl.classList.add('open');
    });
    const popover=el('div','volume-popover');
    const slider=document.createElement('input');
    slider.className='volume-slider';slider.type='range';slider.min='0';slider.max='100';slider.step='1';slider.value=String(muted?0:volume);
    slider.setAttribute('aria-label','Video volume');slider.setAttribute('aria-valuetext',(muted?0:volume)+' percent');
    slider.addEventListener('pointerdown',e=>e.stopPropagation());
    slider.addEventListener('input',e=>{e.stopPropagation();setVolume(e.target.value)});
    slider.addEventListener('change',e=>{e.stopPropagation();setVolume(e.target.value,true)});
    const value=el('span','volume-value',(muted?0:volume)+'%');
    popover.appendChild(slider);popover.appendChild(value);
    volumeControl.appendChild(bM);volumeControl.appendChild(popover);rail.appendChild(volumeControl);
  }

  const isSaved=savedIds.includes(v.id);
  const bSv=labelButton(el('button'),isSaved?'Remove from saved videos':'Save video');bSv.appendChild(svgUse('ic-bm'));
  bSv.setAttribute('aria-pressed',String(isSaved));
  if(isSaved)bSv.classList.add('on');
  bSv.addEventListener('click',async e=>{
    e.stopPropagation();
    const i=savedIds.indexOf(v.id);
    if(i>=0){savedIds.splice(i,1);delete savedItems[v.id];bSv.classList.remove('on');bSv.setAttribute('aria-pressed','false');bSv.setAttribute('aria-label','Save video');bSv.title='Save video';toast('removed from saved')}
    else{savedIds.push(v.id);savedItems[v.id]=v;bSv.classList.add('on');bSv.setAttribute('aria-pressed','true');bSv.setAttribute('aria-label','Remove from saved videos');bSv.title='Remove from saved videos';toast('saved to playlist')}
    await store.set('gt_saved',{ids:savedIds,items:savedItems});renderSaved();
  });
  rail.appendChild(bSv);

  const bSh=labelButton(el('button'),'Share video');bSh.appendChild(svgUse('ic-share'));
  bSh.addEventListener('click',e=>{e.stopPropagation();shareUrl(itemUrl(v),v.title)});
  rail.appendChild(bSh);

  const bEx=labelButton(el('button'),'Open video in a new tab');bEx.appendChild(svgUse('ic-ext'));
  bEx.addEventListener('click',e=>{e.stopPropagation();openExternal(itemUrl(v))});
  rail.appendChild(bEx);

  const bFs=labelButton(el('button','fullscreenbtn'),'Enter fullscreen');bFs.appendChild(svgUse('ic-fullscreen'));bFs.setAttribute('aria-pressed','false');
  bFs.addEventListener('click',e=>{e.stopPropagation();toggleFullscreen(card)});
  rail.appendChild(bFs);

  card.appendChild(rail);

  if(v.type==='yt'){
    const cs=el('div','center-state');const ps=document.createElementNS('http://www.w3.org/2000/svg','svg');ps.setAttribute('viewBox','0 0 24 24');ps.innerHTML='<polygon points="6 4 20 12 6 20 6 4" fill="rgba(236,239,244,.8)"/>';cs.appendChild(ps);card.appendChild(cs);
    card.appendChild(el('div','boost-badge','2x'));

    /* seek hints */
    const hl=el('div','seek-hint sl');hl.innerHTML='<svg viewBox="0 0 24 24"><use href="#ic-rewind"/></svg><span>-10s</span>';card.appendChild(hl);
    const hr=el('div','seek-hint sr');hr.innerHTML='<svg viewBox="0 0 24 24"><use href="#ic-fwd"/></svg><span>+10s</span>';card.appendChild(hr);

    if(!PREVIEW){
      const tap=el('div','taplayer');attachGestures(card,tap);card.appendChild(tap);
    }
  }

  /* scrubber */
  if(v.type==='yt'&&!PREVIEW){
    const sb=el('div','scrubber');
    sb.appendChild(el('div','scrub-track'));
    sb.querySelector('.scrub-track').appendChild(el('div','scrub-fill'));
    sb.querySelector('.scrub-track').appendChild(el('div','scrub-dot'));
    const hit=el('div','scrub-hit');
    attachScrubber(card,hit);
    sb.appendChild(hit);
    card.appendChild(sb);
  }

  cardState.set(card,{kind:v.type==='yt'?'yt':'tt',playing:false,currentTime:0,duration:0});
  return card;
}

function ensureCardEmbed(card){
  if(PREVIEW||!card||!card._video)return null;
  const existing=card.querySelector('iframe');
  if(existing)return existing;
  const v=card._video;
  const frame=document.createElement('iframe');
  frame.setAttribute('allow','autoplay; encrypted-media; picture-in-picture; fullscreen');
  frame.setAttribute('allowfullscreen','');
  frame.referrerPolicy='strict-origin-when-cross-origin';
  frame.loading='eager';
  frame.title=(v.type==='yt'?'YouTube video: ':'TikTok video: ')+v.title;
  if(v.type==='yt'){
    const origin=window.location.origin&&window.location.origin!=='null'?'&origin='+encodeURIComponent(window.location.origin):'';
    frame.src='https://www.youtube-nocookie.com/embed/'+encodeURIComponent(v.vid)+'?enablejsapi=1&playsinline=1&controls=0&rel=0&mute=1&iv_load_policy=3'+origin;
  }else{
    frame.src='https://www.tiktok.com/embed/v2/'+encodeURIComponent(v.vid);
  }
  const scrim=card.querySelector('.scrim');
  card.insertBefore(frame,scrim||card.firstChild);
  if(v.type==='yt'){
    loadYouTubeApi().then(YT=>{
      if(!frame.isConnected)return;
      const player=new YT.Player(frame,{
        events:{
          onReady:event=>{
            if(!card.isConnected)return;
            const readyPlayer=event.target;
            ytPlayers.set(card,readyPlayer);
            card.classList.add('embed-ready');card.classList.remove('player-error');
            try{readyPlayer.setVolume(volume);muted?readyPlayer.mute():readyPlayer.unMute()}catch{}
            const state=cardState.get(card);
            if(state&&state.currentTime>1){try{readyPlayer.seekTo(state.currentTime,true)}catch{}}
            if(card===activeCard&&document.getElementById('view-feed').classList.contains('active')){
              activeIframe=readyPlayer.getIframe();
              try{readyPlayer.playVideo()}catch{}
            }
          },
          onStateChange:event=>{
            const state=cardState.get(card);if(!state)return;
            state.playing=event.data===YT.PlayerState.PLAYING;
            card.classList.toggle('paused',!state.playing);
            syncActivePlayer();
          },
          onError:()=>{card.classList.add('player-error');if(card===activeCard)toast('video unavailable')}
        }
      });
      ytPlayers.set(card,player);
    }).catch(()=>{card.classList.add('player-error')});
  }else{
    frame.addEventListener('load',()=>card.classList.add('embed-ready'),{once:true});
  }
  return frame;
}

function unloadCardEmbed(card){
  if(!card||card===activeCard)return;
  const player=ytPlayers.get(card);
  if(player){
    const state=cardState.get(card);
    try{
      if(state){state.currentTime=Number(player.getCurrentTime())||state.currentTime;state.duration=Number(player.getDuration())||state.duration}
      player.pauseVideo();player.destroy();
    }catch{}
    ytPlayers.delete(card);
  }
  const frame=card.querySelector('iframe');if(frame)frame.remove();
  card.classList.remove('embed-ready','player-error');
  const state=cardState.get(card);if(state)state.playing=false;
}

function syncNearbyEmbeds(focusCard){
  if(PREVIEW||!focusCard)return;
  const desired=new Set();
  if(focusCard._video)desired.add(focusCard);
  for(const direction of ['previousElementSibling','nextElementSibling']){
    let cursor=focusCard[direction];
    while(cursor&&!cursor._video)cursor=cursor[direction];
    if(cursor)desired.add(cursor);
  }
  desired.forEach(ensureCardEmbed);
  document.querySelectorAll('#feed .card[data-vid]').forEach(card=>{if(!desired.has(card))unloadCardEmbed(card)});
}

function buildTipCard(tip,n){
  const card=el('div','card tip');
  const box=el('div','tipbox');
  const tf=el('div','tfile');
  const tfl=el('span');tfl.innerHTML='res://tips/<b>'+tip.f+'</b>';
  tf.appendChild(tfl);tf.appendChild(el('span','','tip '+n));
  box.appendChild(tf);box.appendChild(el('h2','',tip.t));
  const p=el('p');p.innerHTML=tip.p;box.appendChild(p);
  card.appendChild(box);
  cardState.set(card,{kind:'tip'});
  return card;
}

/* ── build shuffled feed ─────────────────────────────────────── */
function buildShuffledFeed(){
  const vids=shuffle([...userVideos,...SEED_VIDEOS]);
  const tips=shuffle([...TIPS]);
  shuffledFeed=[];let ti=0;
  vids.forEach((v,i)=>{
    shuffledFeed.push({kind:'video',data:v});
    if((i+1)%2===0&&ti<tips.length){shuffledFeed.push({kind:'tip',data:tips[ti++]})}
  });
  while(ti<tips.length){shuffledFeed.push({kind:'tip',data:tips[ti++]})}
}

/* ── render feed ─────────────────────────────────────────────── */
let feedObs=null,feedResizeObs=null;
function renderFeed(){
  const feedEl=document.getElementById('feed');
  ytPlayers.forEach(player=>{try{player.destroy()}catch{}});ytPlayers.clear();
  feedEl.innerHTML='';cardState.clear();activeCard=null;activeIframe=null;
  if(feedObs){feedObs.disconnect();feedObs=null}
  if(feedResizeObs){feedResizeObs.disconnect();feedResizeObs=null}
  const items=shuffledFeed.filter(it=>it.kind==='tip'||((showTikTok||it.data.type!=='tt')&&(longformOn||!it.data.long)));
  let tn=0;
  items.forEach(it=>{
    const c=it.kind==='video'?buildVideoCard(it.data):buildTipCard(it.data,++tn);
    feedEl.appendChild(c);
  });
  /* height observer so cards fill the scroll container */
  const wrap=feedEl;
  function setH(){const h=wrap.clientHeight;feedEl.querySelectorAll('.card').forEach(c=>c.style.height=h+'px')}
  feedResizeObs=new ResizeObserver(setH);feedResizeObs.observe(wrap);setH();
  feedObs=new IntersectionObserver(entries=>{
    entries.forEach(en=>{
      const card=en.target;
      if(en.intersectionRatio>=0.6){
        if(activeCard&&activeCard!==card){ytCmd(activeCard,'pauseVideo');const s=cardState.get(activeCard);if(s)s.playing=false}
        activeCard=card;
        syncNearbyEmbeds(card);
        const iframe=card.querySelector('iframe');activeIframe=iframe||null;
        const st=cardState.get(card);
        if(st&&st.kind==='yt'&&!PREVIEW&&iframe){ytCmd(card,'setVolume',[volume]);muted?ytCmd(card,'mute'):ytCmd(card,'unMute');ytCmd(card,'playVideo');st.playing=true;card.classList.remove('paused')}
      }else if(card===activeCard&&en.intersectionRatio<0.4){
        ytCmd(card,'pauseVideo');const st=cardState.get(card);if(st)st.playing=false;
      }
    });
  },{root:feedEl,threshold:[0.4,0.6]});
  feedEl.querySelectorAll('.card').forEach(c=>feedObs.observe(c));
  syncNearbyEmbeds(feedEl.firstElementChild);
}

/* ── search ──────────────────────────────────────────────────── */
function renderSearch(q){
  const host=document.getElementById('searchResults');host.innerHTML='';
  if(!q.trim()){
    host.innerHTML='<div class="search-empty">search videos, gdscript topics, or a godot class name</div>';
    const dl=el('div','doclinks');
    [['All docs','https://docs.godotengine.org/en/4.7/'],
     ['GDScript basics','https://docs.godotengine.org/en/4.7/tutorials/scripting/gdscript/gdscript_basics.html'],
     ['Signals','https://docs.godotengine.org/en/4.7/getting_started/step_by_step/signals.html'],
     ['CharacterBody2D','https://docs.godotengine.org/en/4.7/classes/class_characterbody2d.html'],
     ['Node2D','https://docs.godotengine.org/en/4.7/classes/class_node2d.html'],
     ['Area2D','https://docs.godotengine.org/en/4.7/classes/class_area2d.html'],
    ].forEach(([label,url])=>{const b=el('button','doclinkbtn',label);b.type='button';b.addEventListener('click',()=>openExternal(url));dl.appendChild(b)});
    host.appendChild(dl);return;
  }
  const ql=q.toLowerCase();
  const vids=[...userVideos,...SEED_VIDEOS].filter(v=>v.title.toLowerCase().includes(ql)||(v.creator||'').toLowerCase().includes(ql));
  if(vids.length){
    host.appendChild(el('div','search-section','videos'));
    vids.forEach(v=>{
      const row=el('div','search-vid');
      if(v.type==='yt'){const img=document.createElement('img');img.src=ytThumb(v.vid);img.alt='';row.appendChild(img)}
      else{row.appendChild(el('div','sithumb','TT'))}
      const m=el('div','svm');m.appendChild(el('div','svm-t',v.title));m.appendChild(el('div','svm-s',v.creator||''));row.appendChild(m);
      row.addEventListener('click',()=>openModal(v));host.appendChild(row);
    });
  }
  host.appendChild(el('div','search-section','godot docs'));
  const dl=el('div','doclinks');
  [['Search docs for "'+q+'"','https://docs.godotengine.org/en/4.7/search.html?q='+encodeURIComponent(q)],
   ['GDQuest search','https://www.gdquest.com/?s='+encodeURIComponent(q)],
   ['Ask on Godot QA','https://ask.godotengine.org/search?q='+encodeURIComponent(q)],
  ].forEach(([label,url])=>{const b=el('button','doclinkbtn',label);b.type='button';b.addEventListener('click',()=>openExternal(url));dl.appendChild(b)});
  host.appendChild(dl);
}

document.getElementById('searchInput').addEventListener('input',e=>renderSearch(e.target.value));

/* ── learning tools ──────────────────────────────────────────── */
const learningUI=window.GodotTokLearningUI.create({
  data:LEARNING,el,shuffle,readLocal,writeLocal,openExternal,toast,labelButton,reduceMotion
});
learningUI.init();

/* ── cheatsheet ──────────────────────────────────────────────── */
function buildCheatsheet(){
  const host=document.getElementById('cheatContent');
  host.innerHTML=`
<h2>Variables &amp; Types</h2>
<pre><span class="ck">var</span> speed: <span class="cn">float</span> = <span class="cn">300.0</span>
<span class="ck">var</span> name: <span class="cn">String</span> = <span class="cs">"Player"</span>
<span class="ck">var</span> alive: <span class="cn">bool</span> = <span class="ck">true</span>
<span class="ck">const</span> MAX_HP: <span class="cn">int</span> = <span class="cn">100</span>
<span class="ck">var</span> pos: <span class="cn">Vector2</span> = Vector2(<span class="cn">0</span>, <span class="cn">0</span>)
<span class="ck">@export var</span> damage: <span class="cn">int</span> = <span class="cn">10</span>       <span class="cm"># editable in inspector</span>
<span class="ck">@onready var</span> sprite = $Sprite2D    <span class="cm"># resolved when node is ready</span></pre>

<h2>Functions</h2>
<pre><span class="ck">func</span> <span class="cf">move</span>(delta: <span class="cn">float</span>) -> <span class="cn">void</span>:
    position += velocity * delta

<span class="ck">func</span> <span class="cf">get_speed</span>() -> <span class="cn">float</span>:
    <span class="ck">return</span> speed

<span class="ck">func</span> <span class="cf">_ready</span>():        <span class="cm"># runs once on enter tree</span>
<span class="ck">func</span> <span class="cf">_process</span>(delta):  <span class="cm"># every frame</span>
<span class="ck">func</span> <span class="cf">_physics_process</span>(delta): <span class="cm"># fixed 60 Hz</span></pre>

<h2>Control Flow</h2>
<pre><span class="ck">if</span> health &lt;= <span class="cn">0</span>:  die()
<span class="ck">elif</span> health &lt; <span class="cn">20</span>: warn()
<span class="ck">else</span>: heal()

<span class="ck">for</span> i <span class="ck">in</span> range(<span class="cn">10</span>): print(i)
<span class="ck">for</span> item <span class="ck">in</span> inventory: item.use()

<span class="ck">while</span> running: update()

<span class="ck">match</span> state:
    <span class="cs">"idle"</span>:  play_idle()
    <span class="cs">"run"</span>:   play_run()
    _:       pass  <span class="cm"># default</span></pre>

<h2>Arrays &amp; Dictionaries</h2>
<pre><span class="ck">var</span> arr: Array[<span class="cn">int</span>] = [<span class="cn">1</span>, <span class="cn">2</span>, <span class="cn">3</span>]
arr.append(<span class="cn">4</span>)      <span class="cm"># add to end</span>
arr.size()          <span class="cm"># length</span>
arr.has(<span class="cn">2</span>)          <span class="cm"># contains</span>
arr.erase(<span class="cn">2</span>)        <span class="cm"># remove value</span>

<span class="ck">var</span> d: <span class="cn">Dictionary</span> = {<span class="cs">"hp"</span>: <span class="cn">100</span>, <span class="cs">"name"</span>: <span class="cs">"hero"</span>}
d[<span class="cs">"mp"</span>] = <span class="cn">50</span>
d.has(<span class="cs">"hp"</span>)          <span class="cm"># true</span>
d.keys()            <span class="cm"># array of keys</span></pre>

<h2>Signals</h2>
<pre><span class="ck">signal</span> health_changed(val: <span class="cn">int</span>)   <span class="cm"># declare</span>
health_changed.<span class="cf">emit</span>(health)        <span class="cm"># fire</span>
health_changed.<span class="cf">connect</span>(_on_health_changed)  <span class="cm"># listen</span>

<span class="ck">func</span> <span class="cf">_on_health_changed</span>(val: <span class="cn">int</span>):
    hud.update(val)</pre>

<h2>Nodes &amp; Scene Tree</h2>
<pre>$<span class="cf">NodeName</span>                          <span class="cm"># child by name</span>
get_node(<span class="cs">"Path/To/Node"</span>)
get_parent()
add_child(node)
queue_free()                       <span class="cm"># safe delete (end of frame)</span>

<span class="ck">var</span> S = preload(<span class="cs">"res://enemy.tscn"</span>)
<span class="ck">var</span> e = S.<span class="cf">instantiate</span>()
add_child(e)</pre>

<h2>CharacterBody2D Movement</h2>
<pre><span class="ck">const</span> SPEED = <span class="cn">300.0</span>
<span class="ck">const</span> GRAVITY = <span class="cn">980.0</span>
<span class="ck">const</span> JUMP_V = <span class="cn">-600.0</span>

<span class="ck">func</span> <span class="cf">_physics_process</span>(delta):
    velocity.x = Input.<span class="cf">get_axis</span>(<span class="cs">"left"</span>, <span class="cs">"right"</span>) * SPEED
    <span class="ck">if not</span> is_on_floor():
        velocity.y += GRAVITY * delta
    <span class="ck">if</span> is_on_floor() <span class="ck">and</span> Input.<span class="cf">is_action_just_pressed</span>(<span class="cs">"jump"</span>):
        velocity.y = JUMP_V
    <span class="cf">move_and_slide</span>()</pre>

<h2>Input</h2>
<table>
<tr><th>code</th><th>use</th></tr>
<tr><td><code>Input.is_action_pressed("x")</code></td><td>held down</td></tr>
<tr><td><code>Input.is_action_just_pressed("x")</code></td><td>first frame only</td></tr>
<tr><td><code>Input.is_action_just_released("x")</code></td><td>released frame</td></tr>
<tr><td><code>Input.get_axis("left","right")</code></td><td>returns -1 to 1</td></tr>
<tr><td><code>Input.get_vector("l","r","u","d")</code></td><td>Vector2 direction</td></tr>
<tr><td><code>get_global_mouse_position()</code></td><td>world mouse pos</td></tr>
</table>

<h2>Vector2 Cheatsheet</h2>
<table>
<tr><th>code</th><th>use</th></tr>
<tr><td><code>Vector2(x, y)</code></td><td>create</td></tr>
<tr><td><code>v.normalized()</code></td><td>unit vector</td></tr>
<tr><td><code>v.length()</code></td><td>magnitude</td></tr>
<tr><td><code>v.dot(other)</code></td><td>dot product</td></tr>
<tr><td><code>a.distance_to(b)</code></td><td>distance</td></tr>
<tr><td><code>a.lerp(b, 0.1)</code></td><td>smooth blend</td></tr>
<tr><td><code>Vector2.UP / DOWN / LEFT / RIGHT</code></td><td>unit constants</td></tr>
</table>

<h2>Tween &amp; Timer</h2>
<pre><span class="ck">var</span> tw = <span class="cf">create_tween</span>()
tw.<span class="cf">tween_property</span>(self, <span class="cs">"position"</span>, target, <span class="cn">0.3</span>)
tw.<span class="cf">tween_property</span>(self, <span class="cs">"modulate:a"</span>, <span class="cn">0.0</span>, <span class="cn">0.2</span>)

<span class="ck">var</span> t = get_tree().<span class="cf">create_timer</span>(<span class="cn">2.0</span>)
<span class="ck">await</span> t.timeout
print(<span class="cs">"2 seconds done"</span>)</pre>

<h2>Common Node Types</h2>
<table>
<tr><th>node</th><th>use it for</th></tr>
<tr><td><code>CharacterBody2D</code></td><td>player / enemy movement (manual control)</td></tr>
<tr><td><code>RigidBody2D</code></td><td>physics objects (automatic simulation)</td></tr>
<tr><td><code>Area2D</code></td><td>overlap detection, hitboxes, triggers</td></tr>
<tr><td><code>AnimationPlayer</code></td><td>keyframe animations</td></tr>
<tr><td><code>Timer</code></td><td>countdowns, cooldowns</td></tr>
<tr><td><code>AudioStreamPlayer2D</code></td><td>positional 2D sound</td></tr>
<tr><td><code>TileMapLayer</code></td><td>grid-based level design</td></tr>
<tr><td><code>CanvasLayer</code></td><td>UI that stays fixed on screen</td></tr>
<tr><td><code>GPUParticles2D</code></td><td>visual effects, particles</td></tr>
</table>
`;
}

/* ── saved / playlist ────────────────────────────────────────── */
function renderSaved(){
  const host=document.getElementById('savedList');host.innerHTML='';
  if(!savedIds.length){host.appendChild(el('div','empty-state','playlist is empty\ntap the bookmark on any video'));return}
  savedIds.forEach(id=>{
    const v=savedItems[id];if(!v)return;
    const row=el('div','saveditem');
    const th=el('div','sithumb');
    if(v.type==='yt'){const img=document.createElement('img');img.src=ytThumb(v.vid);img.alt='';th.appendChild(img)}
    else th.textContent='TT';
    row.appendChild(th);
    const m=el('div','simeta');
    m.appendChild(el('div','sit',v.title));
    m.appendChild(el('div','sis',(v.type==='yt'?'youtube':'tiktok')+(v.creator?' / '+v.creator:'')));
    row.appendChild(m);
    const acts=el('div','siact');
    const sh=labelButton(el('button'),'Share saved video');sh.appendChild(svgUse('ic-share'));sh.addEventListener('click',e=>{e.stopPropagation();shareUrl(itemUrl(v),v.title)});
    const del=labelButton(el('button'),'Remove saved video');del.appendChild(svgUse('ic-trash'));
    del.addEventListener('click',async e=>{
      e.stopPropagation();savedIds=savedIds.filter(x=>x!==id);delete savedItems[id];
      await store.set('gt_saved',{ids:savedIds,items:savedItems});renderSaved();renderFeed();toast('removed');
    });
    acts.appendChild(sh);acts.appendChild(del);row.appendChild(acts);
    row.tabIndex=0;row.setAttribute('role','button');row.setAttribute('aria-label','Play '+v.title);
    row.addEventListener('click',()=>openModal(v));row.addEventListener('keydown',e=>{if(e.key==='Enter'){openModal(v)}});host.appendChild(row);
  });
}

/* ── modal ───────────────────────────────────────────────────── */
function openModal(v){
  if(PREVIEW){openExternal(itemUrl(v));return}
  modalReturnFocus=document.activeElement;
  const f=document.createElement('iframe');
  f.setAttribute('allow','autoplay; encrypted-media; fullscreen; picture-in-picture');f.setAttribute('allowfullscreen','');f.title=v.title;
  f.src=v.type==='yt'?'https://www.youtube-nocookie.com/embed/'+encodeURIComponent(v.vid)+'?autoplay=1&rel=0':'https://www.tiktok.com/embed/v2/'+encodeURIComponent(v.vid);
  document.getElementById('mhost').innerHTML='';document.getElementById('mhost').appendChild(f);
  document.getElementById('mtitle').textContent=v.title;
  if(activeCard){ytCmd(activeCard,'pauseVideo');const st=cardState.get(activeCard);if(st)st.playing=false}
  const modal=document.getElementById('modal');modal.classList.add('open');modal.setAttribute('aria-hidden','false');
  document.getElementById('mclose').focus();
}
function closeModal(){
  const modal=document.getElementById('modal');if(!modal.classList.contains('open'))return;
  modal.classList.remove('open');modal.setAttribute('aria-hidden','true');document.getElementById('mhost').innerHTML='';
  if(modalReturnFocus&&typeof modalReturnFocus.focus==='function')modalReturnFocus.focus();modalReturnFocus=null;
}
document.getElementById('mclose').addEventListener('click',closeModal);

/* ── share ───────────────────────────────────────────────────── */
async function shareUrl(url,title){
  if(navigator.share){try{await navigator.share({title,url});return}catch{}}
  try{await navigator.clipboard.writeText(url);toast('link copied')}catch{window.prompt('Copy link:',url)}
}

/* ── add video ───────────────────────────────────────────────── */
document.getElementById('addBtn').addEventListener('click',async()=>{
  const msg=document.getElementById('addmsg');
  const raw=document.getElementById('addUrl').value;
  const p=parseVideoUrl(raw);
  msg.className='';
  if(!p){msg.className='err';msg.textContent='could not parse that url';return}
  if(p.type==='tt_short'){msg.className='err';msg.textContent='shortened tiktok link — open it in a browser and copy the full url';return}
  if([...userVideos,...SEED_VIDEOS].some(video=>video.type===p.type&&video.vid===p.vid)){msg.className='err';msg.textContent='that video is already in the feed';return}
  const title=document.getElementById('addTitle').value.trim()||(p.type==='yt'?'YouTube video':'TikTok video');
  const v={id:p.type+'_'+p.vid+'_'+Date.now(),type:p.type,vid:p.vid,handle:p.handle||null,url:p.url||null,title,creator:document.getElementById('addCreator').value.trim(),long:document.getElementById('addLong').checked,user:true};
  userVideos.unshift(v);if(!await store.set('gt_uv',userVideos)){userVideos.shift();msg.className='err';msg.textContent='storage is unavailable on this device';return}
  document.getElementById('addUrl').value='';document.getElementById('addTitle').value='';document.getElementById('addCreator').value='';document.getElementById('addLong').checked=false;
  msg.className='ok';msg.textContent='added! rebuilding feed...';
  buildShuffledFeed();renderFeed();renderUserList();
  setTimeout(()=>msg.textContent='',3000);
});

function renderUserList(){
  const host=document.getElementById('userList');host.innerHTML='';
  if(!userVideos.length){host.appendChild(el('p','','nothing added yet'));return}
  userVideos.forEach(v=>{
    const row=el('div','saveditem');
    const m=el('div','simeta');
    m.appendChild(el('div','sit',v.title));
    m.appendChild(el('div','sis',(v.type==='yt'?'youtube':'tiktok')+(v.long?' / longform':'')));
    row.appendChild(m);
    const del=labelButton(el('button'),'Delete added video');del.appendChild(svgUse('ic-trash'));
    del.addEventListener('click',async()=>{userVideos=userVideos.filter(x=>x.id!==v.id);await store.set('gt_uv',userVideos);buildShuffledFeed();renderFeed();renderUserList();toast('removed')});
    const da=el('div','siact');da.appendChild(del);row.appendChild(da);
    host.appendChild(row);
  });
}

function renderSettings(){
  const host=document.getElementById('settingsArea');host.innerHTML='';
  const label='Show TikTok in feed';
  const row=el('button','toggle-row');row.type='button';row.setAttribute('aria-pressed',String(showTikTok));
  const tl=el('div','trlabel');
  tl.appendChild(el('div','',label));
  tl.appendChild(el('div','','TikTok embeds keep their own controls. GodotTok gestures apply to YouTube only.'));
  const knob=el('div','toggle-knob'+(showTikTok?' on':''));knob.setAttribute('aria-hidden','true');
  row.appendChild(tl);row.appendChild(knob);
  row.addEventListener('click',async()=>{
    showTikTok=!showTikTok;await store.set('gt_showTT',showTikTok);
    knob.classList.toggle('on',showTikTok);row.setAttribute('aria-pressed',String(showTikTok));renderFeed();
    toast(label+': '+(showTikTok?'on':'off'));
  });
  host.appendChild(row);
}

/* ── docs ────────────────────────────────────────────────────── */
let docsFrame=null,currentDoc='https://docs.godotengine.org/en/4.7/';
function loadDoc(url){
  currentDoc=url;
  if(PREVIEW){openExternal(url);return}
  if(!docsFrame){docsFrame=document.createElement('iframe');docsFrame.title='Godot documentation';document.getElementById('docsHost').appendChild(docsFrame)}
  docsFrame.src=url;
}
document.querySelectorAll('.chip[data-doc]').forEach(c=>{
  c.addEventListener('click',()=>{document.querySelectorAll('.chip[data-doc]').forEach(x=>x.classList.remove('sel'));c.classList.add('sel');currentDoc=c.dataset.doc;loadDoc(c.dataset.doc)});
});
document.getElementById('docsExt').addEventListener('click',()=>openExternal(currentDoc));

/* ── tabs ────────────────────────────────────────────────────── */
let learnInitDone=false;
function initLearn(){
  if(learnInitDone)return;learnInitDone=true;
  if(PREVIEW){
    const host=document.getElementById('learnHost');host.style.background='var(--n0)';
    const p=el('div','pagefall');
    const img=document.createElement('img');img.src='https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/godot/godot-original.svg';img.alt='';
    p.appendChild(img);p.appendChild(el('div','ft','embed disabled in preview mode'));p.appendChild(el('div','fs','Open the hosted app without ?preview=1 to use the learning app.'));
    const b=el('button','fb','open gdquest learn');b.addEventListener('click',()=>openExternal('https://gdquest.github.io/learn-gdscript/'));p.appendChild(b);host.appendChild(p);
  } else {
    const f=document.createElement('iframe');f.src='https://gdquest.github.io/learn-gdscript/';f.title='GDQuest Learn GDScript';f.setAttribute('allow','fullscreen; autoplay');document.getElementById('learnHost').appendChild(f);
  }
}

let refInitDone={docs:false,recipes:false};
function initDocs(){
  if(refInitDone.docs)return;refInitDone.docs=true;
  if(PREVIEW){
    const host=document.getElementById('docsHost');host.style.background='var(--n0)';
    const p=el('div','pagefall');
    const img=document.createElement('img');img.src='https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/godot/godot-original.svg';img.alt='';
    p.appendChild(img);p.appendChild(el('div','ft','embed disabled in preview mode'));p.appendChild(el('div','fs','Open the hosted app without ?preview=1 to use embedded documentation.'));
    const b=el('button','fb','open godot docs');b.addEventListener('click',()=>openExternal('https://docs.godotengine.org/en/4.7/'));p.appendChild(b);host.appendChild(p);
  } else {
    loadDoc('https://docs.godotengine.org/en/4.7/');
  }
}
function initRecipes(){
  if(refInitDone.recipes)return;refInitDone.recipes=true;
  if(PREVIEW){
    const host=document.getElementById('recipesHost');host.style.background='var(--n0)';
    const p=el('div','pagefall');
    const img=document.createElement('img');img.src='https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/godot/godot-original.svg';img.alt='';
    p.appendChild(img);p.appendChild(el('div','ft','embed disabled in preview mode'));
    const b=el('button','fb','open godot recipes');b.addEventListener('click',()=>openExternal('https://kidscancode.org/godot_recipes/4.x/'));p.appendChild(b);host.appendChild(p);
  } else {
    const f=document.createElement('iframe');f.src='https://kidscancode.org/godot_recipes/4.x/';f.title='KidsCanCode Godot recipes';document.getElementById('recipesHost').appendChild(f);
  }
}

function activateSubtab(group, id){
  document.querySelectorAll('#'+group+'-stabs .stab').forEach(b=>{
    const selected=b.dataset.stab===id;b.classList.toggle('active',selected);b.setAttribute('aria-selected',String(selected));
  });
  // handle subviews for learn and ref
  if(group==='learn'){
    document.getElementById('sv-gdquest').classList.toggle('active',id==='gdquest');
    document.getElementById('sv-flashcards').classList.toggle('active',id==='flashcards');
    document.getElementById('sv-quizzes').classList.toggle('active',id==='quizzes');
    document.getElementById('sv-guides').classList.toggle('active',id==='guides');
    if(id==='gdquest')initLearn();
    if(id!=='gdquest')learningUI.activate(id);
  }
  if(group==='ref'){
    document.getElementById('sv-docs').classList.toggle('active',id==='docs');
    document.getElementById('sv-cheatsheet').classList.toggle('active',id==='cheatsheet');
    document.getElementById('sv-recipes').classList.toggle('active',id==='recipes');
    if(id==='docs')initDocs();
    if(id==='recipes')initRecipes();
  }
}
document.querySelectorAll('#learn-stabs .stab').forEach(b=>b.addEventListener('click',()=>activateSubtab('learn',b.dataset.stab)));
document.querySelectorAll('#ref-stabs .stab').forEach(b=>b.addEventListener('click',()=>activateSubtab('ref',b.dataset.stab)));

function setSidebarExpanded(next){
  sidebarExpanded=Boolean(next);
  document.body.classList.toggle('sidebar-expanded',sidebarExpanded);
  const button=document.getElementById('sidebarToggle');
  button.setAttribute('aria-expanded',String(sidebarExpanded));
  button.setAttribute('aria-label',sidebarExpanded?'Collapse sidebar':'Expand sidebar');
  writeLocal('gt_sidebar_expanded',sidebarExpanded);
}
document.getElementById('sidebarToggle').addEventListener('click',()=>setSidebarExpanded(!sidebarExpanded));

document.querySelectorAll('#tabbar button[data-view]').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.querySelectorAll('#tabbar button[data-view]').forEach(b=>{b.classList.remove('active');b.removeAttribute('aria-current')});
    btn.classList.add('active');btn.setAttribute('aria-current','page');
    const v=btn.dataset.view;
    document.querySelectorAll('.view').forEach(s=>s.classList.remove('active'));
    document.getElementById('view-'+v).classList.add('active');
    if(v!=='feed'&&activeCard){ytCmd(activeCard,'pauseVideo');const st=cardState.get(activeCard);if(st){st.playing=false;activeCard.classList.add('paused')}}
    if(v==='feed'&&activeCard){const st=cardState.get(activeCard);if(st&&st.kind==='yt'&&!PREVIEW){ensureCardEmbed(activeCard);ytCmd(activeCard,'setVolume',[volume]);muted?ytCmd(activeCard,'mute'):ytCmd(activeCard,'unMute');ytCmd(activeCard,'playVideo');st.playing=true;activeCard.classList.remove('paused')}}
    if(v==='search')document.getElementById('searchInput').focus();
  });
});

document.getElementById('hintsOk').addEventListener('click',async()=>{document.getElementById('hints').classList.remove('show');await store.set('gt_hints',true)});
document.getElementById('longToggle').addEventListener('click',async()=>{
  longformOn=!longformOn;const toggle=document.getElementById('longToggle');toggle.textContent='longform: '+(longformOn?'on':'off');toggle.classList.toggle('on',longformOn);toggle.setAttribute('aria-pressed',String(longformOn));await store.set('gt_lf',longformOn);renderFeed();
});

function moveFeed(direction){
  const cards=[...document.querySelectorAll('#feed .card')];if(!cards.length)return;
  const index=Math.max(0,cards.indexOf(activeCard));
  const target=cards[Math.max(0,Math.min(cards.length-1,index+direction))];
  if(target)target.scrollIntoView({behavior:reduceMotion?'auto':'smooth',block:'start'});
}

document.addEventListener('keydown',event=>{
  if(event.key==='Escape'&&theatreCard){event.preventDefault();toggleTheatre(theatreCard);return}
  if(event.key==='Escape'&&document.getElementById('modal').classList.contains('open')){event.preventDefault();closeModal();return}
  const target=event.target;
  if(target&&(/^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)||target.isContentEditable))return;
  if(target&&target.closest&&target.closest('button,a,[role="slider"]'))return;
  if(!document.getElementById('view-feed').classList.contains('active'))return;
  if(event.key===' '){event.preventDefault();if(activeCard)togglePlay(activeCard)}
  else if(event.key==='ArrowUp'){event.preventDefault();moveFeed(-1)}
  else if(event.key==='ArrowDown'){event.preventDefault();moveFeed(1)}
  else if(event.key==='ArrowLeft'){event.preventDefault();if(activeCard)seekRelative(activeCard,-10)}
  else if(event.key==='ArrowRight'){event.preventDefault();if(activeCard)seekRelative(activeCard,10)}
  else if(event.key.toLowerCase()==='m'){event.preventDefault();setMuted(!muted)}
  else if(event.key.toLowerCase()==='f'&&activeCard){event.preventDefault();toggleFullscreen(activeCard)}
});

/* ── PWA installation and update lifecycle ──────────────────── */
let installPrompt=null,swRegistration=null,reloadingForUpdate=false;
const installButton=document.getElementById('installApp');
const updateButton=document.getElementById('updateApp');
window.addEventListener('beforeinstallprompt',event=>{
  event.preventDefault();installPrompt=event;installButton.hidden=false;
});
window.addEventListener('appinstalled',()=>{installPrompt=null;installButton.hidden=true;toast('app installed')});
installButton.addEventListener('click',async()=>{
  if(!installPrompt)return;
  installButton.hidden=true;
  await installPrompt.prompt();
  await installPrompt.userChoice;
  installPrompt=null;
});
function showAvailableUpdate(registration){
  swRegistration=registration;updateButton.hidden=false;
}
updateButton.addEventListener('click',()=>{
  const waiting=swRegistration&&swRegistration.waiting;
  if(waiting){updateButton.disabled=true;waiting.postMessage({type:'SKIP_WAITING'})}
});
async function setupPwa(){
  if(!('serviceWorker' in navigator)||!window.location.protocol.startsWith('http'))return;
  try{
    const registration=await navigator.serviceWorker.register('./sw.js');
    swRegistration=registration;
    if(registration.waiting&&navigator.serviceWorker.controller)showAvailableUpdate(registration);
    registration.addEventListener('updatefound',()=>{
      const worker=registration.installing;if(!worker)return;
      worker.addEventListener('statechange',()=>{
        if(worker.state==='installed'&&navigator.serviceWorker.controller)showAvailableUpdate(registration);
      });
    });
    navigator.serviceWorker.addEventListener('controllerchange',()=>{
      if(reloadingForUpdate)return;reloadingForUpdate=true;window.location.reload();
    });
  }catch{toast('offline support unavailable')}
}

/* ── init ────────────────────────────────────────────────────── */
(async function init(){
  const storedVideos=await store.get('gt_uv');userVideos=Array.isArray(storedVideos)?storedVideos.filter(v=>v&&v.id&&v.type&&v.vid):[];
  const sv=await store.get('gt_saved');if(sv&&typeof sv==='object'){savedIds=Array.isArray(sv.ids)?sv.ids:[];savedItems=sv.items&&typeof sv.items==='object'?sv.items:{}}
  const storedLongform=await store.get('gt_lf');longformOn=typeof storedLongform==='boolean'?storedLongform:false;
  const storedTikTok=await store.get('gt_showTT');showTikTok=typeof storedTikTok==='boolean'?storedTikTok:true;
  const storedAudio=await store.get('gt_audio');
  if(storedAudio&&typeof storedAudio==='object'){
    const storedVolume=Number(storedAudio.volume);const storedLast=Number(storedAudio.lastVolume);
    if(Number.isFinite(storedVolume))volume=Math.max(0,Math.min(100,Math.round(storedVolume)));
    if(Number.isFinite(storedLast)&&storedLast>0)lastVolume=Math.max(1,Math.min(100,Math.round(storedLast)));
    muted=typeof storedAudio.muted==='boolean'?storedAudio.muted:volume===0;
  }
  sidebarExpanded=readLocal('gt_sidebar_expanded',false)===true;setSidebarExpanded(sidebarExpanded);
  const longToggle=document.getElementById('longToggle');longToggle.textContent='longform: '+(longformOn?'on':'off');
  longToggle.classList.toggle('on',longformOn);longToggle.setAttribute('aria-pressed',String(longformOn));
  const seenHints=await store.get('gt_hints');
  if(!seenHints)document.getElementById('hints').classList.add('show');
  buildShuffledFeed();
  renderFeed();
  renderSaved();
  renderUserList();
  renderSettings();
  buildCheatsheet();
  renderSearch('');
  setupPwa();
  if(PREVIEW){
    const b=el('div','pbanner');
    const tx=el('span');tx.innerHTML='<b>preview mode:</b> external video and learning embeds are disabled. Remove <code>?preview=1</code> to load them.';
    const x=labelButton(el('button','','×'),'Close preview notice');x.addEventListener('click',()=>b.remove());
    b.appendChild(tx);b.appendChild(x);document.body.appendChild(b);
  }
})();
