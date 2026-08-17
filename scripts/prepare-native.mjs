import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import {fileURLToPath} from "node:url";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const destination=path.join(root,"dist");
const files=["index.html","icon.png","icon-192.png","manifest.webmanifest","sw.js"];
const directories=["assets","content","js"];

if(path.dirname(destination)!==root||path.basename(destination)!=="dist"){
  throw new Error("Refusing to prepare an unexpected native output directory.");
}

fs.rmSync(destination,{recursive:true,force:true});
fs.mkdirSync(destination,{recursive:true});

for(const relative of files){
  const source=path.join(root,relative);
  if(!fs.existsSync(source))throw new Error("Missing native asset: "+relative);
  fs.copyFileSync(source,path.join(destination,relative));
}
for(const relative of directories){
  const source=path.join(root,relative);
  if(!fs.existsSync(source))throw new Error("Missing native asset directory: "+relative);
  fs.cpSync(source,path.join(destination,relative),{recursive:true});
}

function walk(directory,prefix=""){
  return fs.readdirSync(directory,{withFileTypes:true})
    .flatMap(entry=>{
      const relative=path.posix.join(prefix,entry.name);
      return entry.isDirectory()?walk(path.join(directory,entry.name),relative):[relative];
    })
    .sort();
}

const manifest=walk(destination).map(relative=>{
  const bytes=fs.readFileSync(path.join(destination,relative));
  return {
    path:relative,
    bytes:bytes.length,
    sha256:crypto.createHash("sha256").update(bytes).digest("hex")
  };
});
fs.writeFileSync(
  path.join(destination,"native-assets.json"),
  JSON.stringify({version:1,files:manifest},null,2)+"\n",
  "utf8"
);

console.log(`Prepared ${manifest.length} native assets in dist/.`);
