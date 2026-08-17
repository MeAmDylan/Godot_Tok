import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import {fileURLToPath} from "node:url";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const output=path.join(root,"build","gdscript-audit");
const read=relative=>fs.readFileSync(path.join(root,relative),"utf8");
const context=vm.createContext({window:{},URL});

vm.runInContext(read("js/data/library.js"),context,{filename:"js/data/library.js"});
for(const relative of ["js/data/library-expansion.js","js/data/library-expansion-2d.js","js/data/library-expansion-3d.js","js/data/library-bundles.js"]){
  vm.runInContext(read(relative),context,{filename:relative});
}

const base=context.window.GodotTokLibrary;
const expansion=context.window.GodotTokLibraryExpansion;
const recipes=[...base.recipes,...expansion.recipes];

fs.rmSync(output,{recursive:true,force:true});
fs.mkdirSync(output,{recursive:true});

const preloadLines=[];
const autoloads=new Map();
let scriptCount=0;

for(const recipe of recipes){
  const recipeDirectory=path.join(output,"recipes",recipe.id);
  fs.mkdirSync(recipeDirectory,{recursive:true});
  for(const file of recipe.files){
    if(file.language!=="gdscript")continue;
    const safePath=path.normalize(file.path).replace(/^(\.\.(\/|\\|$))+/,"");
    const destination=path.join(recipeDirectory,safePath);
    if(!destination.startsWith(recipeDirectory+path.sep))throw new Error("Unsafe script path: "+file.path);
    fs.mkdirSync(path.dirname(destination),{recursive:true});
    fs.writeFileSync(destination,file.code+"\n");
    const resourcePath="res://recipes/"+recipe.id+"/"+safePath.replaceAll("\\","/");
    preloadLines.push(`const SCRIPT_${scriptCount} = preload("${resourcePath}")`);
    if(/autoload/i.test(file.attachTo||"")){
      const classMatch=file.code.match(/^\s*class_name\s+([A-Za-z_][A-Za-z0-9_]*)/m);
      const attachMatch=String(file.attachTo).match(/^([A-Za-z_][A-Za-z0-9_]*)/);
      const autoloadName=classMatch?.[1]||attachMatch?.[1];
      if(autoloadName&&!autoloads.has(autoloadName))autoloads.set(autoloadName,resourcePath);
    }
    scriptCount++;
  }
}

const autoloadSection=[...autoloads].map(([name,resourcePath])=>`${name}="*${resourcePath}"`).join("\n");
fs.writeFileSync(path.join(output,"project.godot"),`[application]\nconfig/name="GodotTok GDScript Audit"\nrun/main_scene="res://audit_main.tscn"\n\n[autoload]\n${autoloadSection}\n\n[display]\nwindow/size/viewport_width=1280\nwindow/size/viewport_height=720\n\n[rendering]\nrenderer/rendering_method="gl_compatibility"\nrenderer/rendering_method.mobile="gl_compatibility"\n`);
fs.writeFileSync(path.join(output,"audit_main.gd"),`extends Node\n\n${preloadLines.join("\n")}\n\nfunc _ready() -> void:\n    print("Loaded ${scriptCount} Code Library scripts.")\n`);
fs.writeFileSync(path.join(output,"audit_main.tscn"),`[gd_scene load_steps=2 format=3]\n\n[ext_resource path="res://audit_main.gd" type="Script" id="1"]\n\n[node name="AuditMain" type="Node"]\nscript = ExtResource("1")\n`);

console.log(`Exported ${scriptCount} GDScript files from ${recipes.length} recipes to ${path.relative(root,output)}.`);
