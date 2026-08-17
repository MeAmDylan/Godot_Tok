import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import {fileURLToPath} from "node:url";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=relative=>fs.readFileSync(path.join(root,relative),"utf8");
const assert=(condition,message)=>{if(!condition)throw new Error(message)};
const context=vm.createContext({window:{},URL});

vm.runInContext(read("js/data/learning.js"),context,{filename:"js/data/learning.js"});
vm.runInContext(read("js/data/library.js"),context,{filename:"js/data/library.js"});
vm.runInContext(read("js/data/videos.js"),context,{filename:"js/data/videos.js"});

const learning=context.window.GodotTokLearning;
const library=context.window.GodotTokLibrary;
const videos=context.window.GodotTokVideos;
assert(learning.flashcards.length===70,"Expected 70 built-in flashcards.");
assert(learning.quizzes.length===63,"Expected 63 built-in quizzes.");
assert(learning.guides.length===8,"Expected 8 Christophe resources.");
assert(library.recipes.length===24,"Expected 24 Code Library recipes.");
assert(videos.manual.length===24,"Expected 24 hand-picked videos.");
assert(videos.all.length===videos.manual.length+videos.automatic.length,"Combined video data is incomplete.");

const videoIds=new Set();
for(const video of videos.all){
  assert(!videoIds.has(video.id),"Duplicate video ID: "+video.id);
  videoIds.add(video.id);
  assert(video.type==="yt"||video.type==="tt","Unknown video type for "+video.id);
  assert(typeof video.title==="string"&&video.title.trim(),"Missing video title for "+video.id);
  assert(typeof video.creator==="string"&&video.creator.trim(),"Missing creator for "+video.id);
  assert(typeof video.long==="boolean","Missing longform flag for "+video.id);
  if(video.type==="yt")assert(/^[A-Za-z0-9_-]{11}$/.test(video.vid),"Invalid YouTube ID for "+video.id);
  if(video.automated){
    assert(video.type==="yt","Only YouTube videos may be imported automatically.");
    assert(Number.isInteger(video.durationSeconds)&&video.durationSeconds>0,"Invalid automatic duration for "+video.id);
    assert(!Number.isNaN(Date.parse(video.publishedAt)),"Invalid automatic publish date for "+video.id);
    assert(/^@[A-Za-z0-9._-]{3,30}$/.test(video.sourceHandle),"Invalid source handle for "+video.id);
  }
}

for(const section of library.sections){
  assert(library.recipes.filter(recipe=>recipe.section===section.id).length===8,section.id+" must have 8 recipes.");
}

const recipeIds=new Set(library.recipes.map(recipe=>recipe.id));
for(const recipe of library.recipes){
  assert(recipe.files.length>0,recipe.id+" has no complete files.");
  assert(recipe.files.every(file=>file.path&&file.code.includes("extends ")),recipe.id+" has an incomplete script.");
  assert(recipe.steps.length>=4,recipe.id+" has too few implementation steps.");
  assert(recipe.tests.length>=4,recipe.id+" has too few tests.");
  assert(recipe.sources.every(item=>{
    const url=new URL(item.url);
    if(url.hostname==="docs.godotengine.org")return url.pathname.startsWith("/en/4.7/");
    if(url.hostname==="github.com")return url.pathname.startsWith("/godotengine/")||url.pathname.startsWith("/gdquest");
    return url.hostname==="gdquest.com"||url.hostname==="www.gdquest.com";
  }),recipe.id+" has an unapproved or unpinned source.");
  assert(recipe.related.every(id=>recipeIds.has(id)),recipe.id+" links to an unknown recipe.");
}

const html=read("index.html");
const ids=[...html.matchAll(/\sid="([^"]+)"/g)].map(match=>match[1]);
assert(ids.length===new Set(ids).size,"index.html contains duplicate IDs.");
for(const id of ["view-feed","view-search","view-learn","view-ref","view-library","view-saved","view-add","libraryApp","searchResults"]){
  assert(ids.includes(id),"Missing required element #"+id);
}

const localRefs=[
  ...html.matchAll(/<script[^>]+src="([^"]+)"/g),
  ...html.matchAll(/<link[^>]+href="([^"]+)"/g)
].map(match=>match[1]).filter(value=>!value.startsWith("data:")&&!/^https?:/.test(value));
for(const relative of localRefs)assert(fs.existsSync(path.join(root,relative)),"Missing local asset "+relative);

const shell=read("sw.js");
for(const relative of [...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map(match=>match[1])){
  assert(shell.includes("'./"+relative+"'"),"Service worker does not cache "+relative);
}

for(const file of ["js/data/videos.js","js/data/learning.js","js/data/library.js","js/app.js"]){
  assert(!read(file).includes("docs.godotengine.org/en/stable"),file+" contains an unpinned docs link.");
}

console.log(`Validated ${videos.all.length} videos, 70 flashcards, 63 quizzes, 8 guides, and 24 complete Code Library recipes.`);
