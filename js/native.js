(function(){
  "use strict";

  const REMOTE_CATALOGUE="https://meamdylan.github.io/Godot_Tok/content/videos.json";
  const CACHE_KEY="gt_remote_videos_v1";
  const native=Boolean(window.__TAURI_INTERNALS__||window.__TAURI__);
  if(native)document.body.classList.add("native-shell");

  function validVideo(item){
    return Boolean(
      item&&item.automated===true&&item.type==="yt"&&
      typeof item.id==="string"&&typeof item.vid==="string"&&/^[A-Za-z0-9_-]{11}$/.test(item.vid)&&
      typeof item.title==="string"&&item.title.trim()&&item.title.length<=180&&
      typeof item.creator==="string"&&item.creator.trim()&&item.creator.length<=100&&
      typeof item.long==="boolean"&&Number.isInteger(item.durationSeconds)&&item.durationSeconds>0&&
      !Number.isNaN(Date.parse(item.publishedAt))&&/^@[A-Za-z0-9._-]{3,30}$/.test(item.sourceHandle)
    );
  }

  function validateCatalogue(value){
    if(!value||value.version!==1||!Array.isArray(value.automatic)||value.automatic.length>100)return null;
    if(!value.automatic.every(validVideo))return null;
    const ids=new Set();
    for(const item of value.automatic){
      if(ids.has(item.vid))return null;
      ids.add(item.vid);
    }
    return value.automatic;
  }

  function cachedCatalogue(){
    try{return validateCatalogue(JSON.parse(window.localStorage.getItem(CACHE_KEY))) }catch{return null}
  }

  function mergeVideos(base,automatic){
    const seen=new Set(base.manual.filter(item=>item.type==="yt").map(item=>item.vid));
    return [...base.manual,...automatic.filter(item=>{
      if(seen.has(item.vid))return false;
      seen.add(item.vid);
      return true;
    })];
  }

  async function loadVideos(base){
    if(!native)return [...base.all];
    const cached=cachedCatalogue();
    const controller=new AbortController();
    const timeout=window.setTimeout(()=>controller.abort(),2500);
    try{
      const response=await fetch(REMOTE_CATALOGUE,{cache:"no-store",signal:controller.signal,headers:{Accept:"application/json"}});
      if(!response.ok)throw new Error("catalogue request returned "+response.status);
      const payload=await response.json();
      const automatic=validateCatalogue(payload);
      if(!automatic)throw new Error("catalogue response failed validation");
      window.localStorage.setItem(CACHE_KEY,JSON.stringify({version:1,automatic}));
      return mergeVideos(base,automatic);
    }catch{
      return mergeVideos(base,cached||base.automatic);
    }finally{
      window.clearTimeout(timeout);
    }
  }

  function openExternal(url){
    const openUrl=window.__TAURI__?.opener?.openUrl;
    if(!native||typeof openUrl!=="function")return false;
    openUrl(url).catch(()=>{});
    return true;
  }

  async function setupUpdater(button,notify){
    const invoke=window.__TAURI__?.core?.invoke;
    if(!native||typeof invoke!=="function"||!button)return;
    let status;
    try{status=await invoke("native_update_status")}catch{return}
    if(!status?.supported||!status?.configured)return;
    button.hidden=false;
    button.addEventListener("click",async()=>{
      button.disabled=true;
      notify("checking for native update");
      try{
        const update=await invoke("check_native_update");
        if(!update.available){notify("native app is current");return}
        const notes=update.notes?"\n\n"+update.notes:"";
        if(!window.confirm(`Install GodotTok ${update.version}?${notes}`))return;
        notify("downloading signed update");
        await invoke("install_native_update");
      }catch(error){
        notify(typeof error==="string"?error:"native update failed");
      }finally{
        button.disabled=false;
      }
    });
  }

  window.GodotTokNative=Object.freeze({
    isNative:native,
    remoteCatalogue:REMOTE_CATALOGUE,
    loadVideos,
    openExternal,
    setupUpdater,
    validateCatalogue
  });
})();
