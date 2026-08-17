import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import vm from "node:vm";
import {
  matchesSource,
  normalizeVideo,
  parseDurationSeconds,
  renderVideosFile,
  selectAutomaticVideos,
  syncYouTube,
  validateConfig
} from "./sync-youtube.mjs";

assert.equal(parseDurationSeconds("PT45S"),45);
assert.equal(parseDurationSeconds("PT1H2M3S"),3723);
assert.equal(parseDurationSeconds("P1DT2H"),93600);
assert.throws(()=>parseDurationSeconds("1:23"),/Unsupported YouTube duration/);

const source={
  handle:"@Gdquest",label:"GDQuest",scanLimit:20,keep:5,
  includeTerms:["godot","gdscript"],excludeTerms:["godot 3"]
};
const apiVideo={
  id:"abcdefghijk",
  snippet:{title:"Typed GDScript patterns",description:"Current Godot tutorial",channelTitle:"GDQuest",publishedAt:"2026-08-01T00:00:00Z"},
  contentDetails:{duration:"PT21M4S"},
  status:{privacyStatus:"public",embeddable:true}
};
assert.equal(matchesSource(apiVideo,source),true);
assert.equal(matchesSource({...apiVideo,snippet:{...apiVideo.snippet,title:"Godot 3 tutorial",description:""}},source),false);
assert.deepEqual(normalizeVideo(apiVideo,source,1200),{
  id:"yt_abcdefghijk",type:"yt",vid:"abcdefghijk",title:"Typed GDScript patterns",
  creator:"GDQuest",long:true,durationSeconds:1264,publishedAt:"2026-08-01T00:00:00Z",
  sourceHandle:"@Gdquest",automated:true
});

const config={version:1,maxAutomaticVideos:2,longformThresholdSeconds:1200,sources:[source]};
validateConfig(config);
const selected=selectAutomaticVideos([
  {...normalizeVideo(apiVideo,source,1200),vid:"manualvideo1",id:"yt_manualvideo1"},
  {...normalizeVideo(apiVideo,source,1200),vid:"newervideo1",id:"yt_newervideo1",publishedAt:"2026-08-03T00:00:00Z"},
  {...normalizeVideo(apiVideo,source,1200),vid:"oldervideo1",id:"yt_oldervideo1",publishedAt:"2026-08-02T00:00:00Z"},
  {...normalizeVideo(apiVideo,source,1200),vid:"oldervideo1",id:"yt_oldervideo1",publishedAt:"2026-08-02T00:00:00Z"}
],config,[{type:"yt",vid:"manualvideo1"}]);
assert.deepEqual(selected.map(item=>item.vid),["newervideo1","oldervideo1"]);

const rendered=renderVideosFile([{id:"tt_1",type:"tt",vid:"1",title:"Manual",creator:"Creator",long:false}],selected);
const context=vm.createContext({window:{}});
vm.runInContext(rendered,context);
assert.equal(context.window.GodotTokVideos.manual.length,1);
assert.equal(context.window.GodotTokVideos.automatic.length,2);
assert.equal(context.window.GodotTokVideos.all.length,3);
assert.equal(Object.isFrozen(context.window.GodotTokVideos),true);

const temporary=fs.mkdtempSync(path.join(os.tmpdir(),"godottok-youtube-test-"));
try{
  const configPath=path.join(temporary,"youtube-sources.json");
  const videosPath=path.join(temporary,"videos.js");
  fs.writeFileSync(configPath,JSON.stringify({
    version:1,maxAutomaticVideos:2,longformThresholdSeconds:1200,
    sources:[{handle:"@TestChannel",label:"Test Channel",scanLimit:3,keep:2,includeTerms:["godot"],excludeTerms:[]}]
  }),"utf8");
  fs.writeFileSync(videosPath,renderVideosFile([{id:"yt_manualvideo1",type:"yt",vid:"manualvideo1",title:"Manual",creator:"Creator",long:false}],[]),"utf8");

  let playlistPage=0;
  const fetchImpl=async url=>{
    const resource=url.pathname.split("/").pop();
    let payload;
    if(resource==="channels"){
      payload={items:[{snippet:{title:"Verified Test Channel"},contentDetails:{relatedPlaylists:{uploads:"UPLOADS"}}}]};
    }else if(resource==="playlistItems"){
      playlistPage+=1;
      payload=playlistPage===1
        ?{items:[{contentDetails:{videoId:"newervideo1"}}],nextPageToken:"page-2"}
        :{items:[{contentDetails:{videoId:"oldervideo1"}},{contentDetails:{videoId:"ignoredvid1"}}]};
    }else if(resource==="videos"){
      payload={items:[
        {...apiVideo,id:"newervideo1",snippet:{...apiVideo.snippet,title:"New Godot guide",publishedAt:"2026-08-03T00:00:00Z"}},
        {...apiVideo,id:"oldervideo1",snippet:{...apiVideo.snippet,title:"Older Godot guide",publishedAt:"2026-08-02T00:00:00Z"}},
        {...apiVideo,id:"ignoredvid1",snippet:{...apiVideo.snippet,title:"Unrelated tutorial",description:"No matching topic",publishedAt:"2026-08-01T00:00:00Z"}}
      ]};
    }else{
      throw new Error("Unexpected test endpoint: "+resource);
    }
    return {ok:true,status:200,json:async()=>payload,text:async()=>JSON.stringify(payload)};
  };

  const first=await syncYouTube({apiKey:"test-key",configPath,videosPath,fetchImpl});
  assert.equal(playlistPage,2);
  assert.equal(first.changed,true);
  assert.deepEqual(first.automatic.map(item=>item.vid),["newervideo1","oldervideo1"]);
  playlistPage=0;
  const second=await syncYouTube({apiKey:"test-key",configPath,videosPath,fetchImpl});
  assert.equal(second.changed,false);
}finally{
  fs.rmSync(temporary,{recursive:true,force:true});
}

console.log("YouTube sync unit tests passed.");
