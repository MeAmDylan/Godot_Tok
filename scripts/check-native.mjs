import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import {fileURLToPath} from "node:url";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=relative=>fs.readFileSync(path.join(root,relative),"utf8");
const json=relative=>JSON.parse(read(relative));
const assert=(condition,message)=>{if(!condition)throw new Error(message)};

const packageData=json("package.json");
const config=json("src-tauri/tauri.conf.json");
const releaseConfig=json("src-tauri/tauri.release.conf.json");
const cargo=read("src-tauri/Cargo.toml");
const html=read("index.html");
const content=json("content/videos.json");
const packageLock=json("package-lock.json");
const context=vm.createContext({window:{}});
vm.runInContext(read("js/data/videos.js"),context);

assert(packageData.version===config.version,"package.json and Tauri versions differ.");
assert(packageLock.packages?.["node_modules/@tauri-apps/cli"]?.version===packageData.devDependencies["@tauri-apps/cli"],"Tauri CLI lockfile version differs.");
assert(cargo.includes(`version = "${config.version}"`),"Cargo and Tauri versions differ.");
assert(cargo.includes('serde_json = "1"'),"Tauri generate_context requires serde_json as a direct dependency.");
assert(config.identifier==="io.github.meamdylan.godottok","Unexpected native application identifier.");
assert(config.build.beforeBuildCommand==="node scripts/prepare-native.mjs","Native build hook must prepare the shared web app from the repository root.");
assert(config.build.frontendDist==="../dist","Native frontendDist must be ../dist.");
assert(config.app.withGlobalTauri===true,"Vanilla Tauri API bridge is not enabled.");
assert(typeof config.app.security.csp==="string"&&config.app.security.csp.includes("object-src 'none'"),"Native CSP is missing or unsafe.");
assert(config.app.windows.some(window=>window.label==="main"&&window.minWidth>=360&&window.minHeight>=600),"Native main window constraints are missing.");
assert(releaseConfig.bundle.createUpdaterArtifacts===true,"Release builds must create updater artifacts.");
assert(html.indexOf('src="js/native.js"')<html.indexOf('src="js/app.js"'),"Native bridge must load before app.js.");
assert(content.version===1&&Array.isArray(content.automatic),"Remote video catalogue schema is invalid.");
assert(JSON.stringify(content.automatic)===JSON.stringify(context.window.GodotTokVideos.automatic),"Remote and bundled automatic video catalogues differ.");

const nativeStorage=new Map();
const opened=[];
const remoteVideo={
  id:"yt_abcdefghijk",type:"yt",vid:"abcdefghijk",title:"Remote Godot guide",creator:"Verified Creator",
  long:false,durationSeconds:90,publishedAt:"2026-08-01T00:00:00Z",sourceHandle:"@VerifiedCreator",automated:true
};
const nativeWindow={
  __TAURI__:{opener:{openUrl:async url=>{opened.push(url)}}},
  localStorage:{
    getItem:key=>nativeStorage.has(key)?nativeStorage.get(key):null,
    setItem:(key,value)=>nativeStorage.set(key,value)
  },
  setTimeout,
  clearTimeout
};
const nativeContext=vm.createContext({
  window:nativeWindow,
  document:{body:{classList:{add:()=>{}}}},
  fetch:async()=>({ok:true,json:async()=>({version:1,automatic:[remoteVideo]})}),
  AbortController,
  Date,
  Object,
  JSON,
  Number,
  Boolean,
  RegExp,
  Set
});
vm.runInContext(read("js/native.js"),nativeContext,{filename:"js/native.js"});
assert(nativeWindow.GodotTokNative.isNative===true,"Native bridge detection failed.");
assert(nativeWindow.GodotTokNative.validateCatalogue({version:2,automatic:[]})===null,"Native catalogue accepted an unknown schema version.");
const loaded=await nativeWindow.GodotTokNative.loadVideos({manual:[],automatic:[],all:[]});
assert(loaded.length===1&&loaded[0].vid===remoteVideo.vid,"Native remote catalogue loading failed.");
assert(nativeStorage.has("gt_remote_videos_v1"),"Native remote catalogue was not cached.");
assert(nativeWindow.GodotTokNative.openExternal("https://docs.godotengine.org/")===true,"Native opener was not selected.");
await Promise.resolve();
assert(opened[0]==="https://docs.godotengine.org/","Native opener did not receive the URL.");

for(const relative of [
  "src-tauri/build.rs","src-tauri/src/main.rs","src-tauri/src/lib.rs",
  "src-tauri/capabilities/default.json",".github/workflows/native-check.yml",
  ".github/workflows/native-release.yml",".github/workflows/native-mobile.yml"
])assert(fs.existsSync(path.join(root,relative)),"Missing native project file: "+relative);

for(const relative of [
  "src-tauri/icons/32x32.png","src-tauri/icons/128x128.png","src-tauri/icons/128x128@2x.png",
  "src-tauri/icons/icon.icns","src-tauri/icons/icon.ico","src-tauri/icons/android/mipmap-xxhdpi/ic_launcher_foreground.png",
  "src-tauri/icons/ios/AppIcon-512@2x.png"
]){
  const absolute=path.join(root,relative);
  assert(fs.existsSync(absolute)&&fs.statSync(absolute).size>0,"Missing or empty native icon: "+relative);
}

const distManifest=path.join(root,"dist/native-assets.json");
if(fs.existsSync(distManifest)){
  const manifest=JSON.parse(fs.readFileSync(distManifest,"utf8"));
  const paths=new Set(manifest.files.map(file=>file.path));
  for(const relative of ["index.html","js/native.js","js/app.js","content/videos.json","assets/styles.css"]){
    assert(paths.has(relative),"Prepared native bundle is missing "+relative);
  }
  assert(![...paths].some(relative=>relative.startsWith("src-tauri/")||relative.startsWith(".git/")),"Prepared native bundle contains project internals.");
}

console.log("Native project configuration passed its deterministic audit.");
