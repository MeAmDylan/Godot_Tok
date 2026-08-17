(function(){
  "use strict";

  function create(deps){
    const {data,el,toast,onRoute}=deps;
    const sectionMap=new Map(data.sections.map(section=>[section.id,section]));
    const recipeMap=new Map(data.recipes.map(recipe=>[recipe.id,recipe]));
    const bundleMap=new Map((data.bundles||[]).map(bundle=>[bundle.id,bundle]));
    let mode="recipes";
    let filters={section:"all",category:"all",difficulty:"all",query:""};
    let currentItem=null;
    let initialized=false;

    async function copyText(value,label){
      try{
        if(navigator.clipboard&&window.isSecureContext){
          await navigator.clipboard.writeText(value);
        }else{
          const field=document.createElement("textarea");
          field.value=value;
          field.setAttribute("readonly","");
          field.style.position="fixed";
          field.style.opacity="0";
          document.body.appendChild(field);
          field.select();
          if(!document.execCommand("copy"))throw new Error("Copy command failed");
          field.remove();
        }
        toast(label+" copied");
      }catch{
        toast("Copy failed. Select the code manually.");
      }
    }

    function badge(text,className=""){
      return el("span","library-badge "+className,text);
    }

    function sanitize(value){
      return String(value).toLowerCase().replace(/[^a-z0-9._/-]+/g,"-").replace(/^-+|-+$/g,"")||"scripts";
    }

    function fileMeta(recipe,file){
      const meta=recipe.fileMeta?.[file.path]||{};
      return {
        attachTo:file.attachTo||meta.attachTo||recipe.nodeTree?.[0]||"The node described in Scene tree",
        purpose:file.purpose||meta.purpose||("Implements the "+recipe.title+" system."),
        connections:file.connections||meta.connections||[]
      };
    }

    function commentedCode(recipe,file){
      const meta=fileMeta(recipe,file);
      const lines=[
        "# Godot "+recipe.version+" | "+recipe.title,
        "# File: "+file.path,
        "# Attach to: "+meta.attachTo,
        "# Purpose: "+meta.purpose,
        "# Required scene root: "+(recipe.nodeTree?.[0]||"See the recipe scene tree")
      ];
      if(recipe.inputActions?.length)lines.push("# Input Map: "+recipe.inputActions.map(action=>action.name).join(", "));
      if(recipe.signals?.length){
        lines.push("# Signal connections:");
        recipe.signals.forEach(item=>lines.push("# - "+item.from+"."+item.signal+" -> "+item.to+"."+item.method+" ("+item.why+")"));
      }else{
        lines.push("# Signal connections: none required beyond any connection stated in the Inspector steps.");
      }
      lines.push("# Setup: build the exact node tree, attach this file, assign exports, connect signals, then run the test checklist.","");
      return lines.join("\n")+file.code;
    }

    function downloadBlob(blob,filename){
      const link=document.createElement("a");
      const url=URL.createObjectURL(blob);
      link.href=url;
      link.download=filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(()=>URL.revokeObjectURL(url),1000);
    }

    function downloadFile(recipe,file,commented){
      const value=commented?commentedCode(recipe,file):file.code;
      downloadBlob(new Blob([value+"\n"],{type:"text/plain;charset=utf-8"}),sanitize(file.path));
      toast((commented?"Commented ":"Clean ")+file.path+" downloaded");
    }

    const crcTable=(()=>{
      const table=new Uint32Array(256);
      for(let index=0;index<256;index++){
        let value=index;
        for(let bit=0;bit<8;bit++)value=(value&1)?0xedb88320^(value>>>1):value>>>1;
        table[index]=value>>>0;
      }
      return table;
    })();

    function crc32(bytes){
      let value=0xffffffff;
      for(const byte of bytes)value=crcTable[(value^byte)&255]^(value>>>8);
      return (value^0xffffffff)>>>0;
    }

    function little(value,count){
      const bytes=new Uint8Array(count);
      for(let index=0;index<count;index++)bytes[index]=(value>>>(index*8))&255;
      return bytes;
    }

    function concat(parts){
      const total=parts.reduce((sum,part)=>sum+part.length,0);
      const result=new Uint8Array(total);
      let offset=0;
      parts.forEach(part=>{result.set(part,offset);offset+=part.length});
      return result;
    }

    function zipBlob(entries){
      const encoder=new TextEncoder();
      const local=[];
      const central=[];
      let offset=0;
      entries.forEach(entry=>{
        const name=encoder.encode(entry.name);
        const content=encoder.encode(entry.content.endsWith("\n")?entry.content:entry.content+"\n");
        const crc=crc32(content);
        const header=concat([
          little(0x04034b50,4),little(20,2),little(0x0800,2),little(0,2),little(0,2),little(0,2),
          little(crc,4),little(content.length,4),little(content.length,4),little(name.length,2),little(0,2),name
        ]);
        local.push(header,content);
        central.push(concat([
          little(0x02014b50,4),little(20,2),little(20,2),little(0x0800,2),little(0,2),little(0,2),little(0,2),
          little(crc,4),little(content.length,4),little(content.length,4),little(name.length,2),little(0,2),little(0,2),
          little(0,2),little(0,2),little(0,4),little(offset,4),name
        ]));
        offset+=header.length+content.length;
      });
      const centralBytes=concat(central);
      const end=concat([
        little(0x06054b50,4),little(0,2),little(0,2),little(entries.length,2),little(entries.length,2),
        little(centralBytes.length,4),little(offset,4),little(0,2)
      ]);
      return new Blob([concat([...local,centralBytes,end])],{type:"application/zip"});
    }

    function recipeEntries(recipe,commented,prefix=true){
      return recipe.files.map(file=>({
        name:(prefix?sanitize(recipe.id)+"/":"")+sanitize(file.path),
        content:commented?commentedCode(recipe,file):file.code
      }));
    }

    function downloadRecipe(recipe,commented){
      const suffix=commented?"commented":"clean";
      downloadBlob(zipBlob(recipeEntries(recipe,commented,false)),sanitize(recipe.id)+"-"+suffix+".zip");
      toast(recipe.title+" "+suffix+" scripts downloaded");
    }

    function downloadBundle(bundle,commented){
      const seen=new Set();
      const entries=[];
      bundle.recipeIds.map(id=>recipeMap.get(id)).filter(Boolean).forEach(recipe=>{
        recipeEntries(recipe,commented,true).forEach(entry=>{
          if(!seen.has(entry.name)){seen.add(entry.name);entries.push(entry)}
        });
      });
      const suffix=commented?"commented":"clean";
      downloadBlob(zipBlob(entries),sanitize(bundle.id)+"-"+suffix+".zip");
      toast(bundle.title+" "+suffix+" scripts downloaded");
    }

    function tabBar(active){
      const bar=el("div","library-tabs");
      [["recipes","Recipes"],["bundles","Recommended game bundles"]].forEach(([id,label])=>{
        const button=el("button",active===id?"active":"",label);
        button.type="button";
        button.setAttribute("aria-pressed",String(active===id));
        button.addEventListener("click",()=>{
          mode=id;
          currentItem=null;
          renderList();
          if(onRoute)onRoute(id==="bundles"?"library/bundles":"library",true);
        });
        bar.appendChild(button);
      });
      return bar;
    }

    function matches(recipe){
      if(filters.section!=="all"&&recipe.section!==filters.section)return false;
      if(filters.category!=="all"&&recipe.category!==filters.category)return false;
      if(filters.difficulty!=="all"&&recipe.difficulty!==filters.difficulty)return false;
      const query=filters.query.trim().toLowerCase();
      if(!query)return true;
      const haystack=[recipe.title,recipe.purpose,recipe.category,recipe.section,recipe.difficulty,...recipe.tags,...recipe.nodeTree,...recipe.files.map(file=>file.path+" "+file.code)].join(" ").toLowerCase();
      return query.split(/\s+/).every(token=>haystack.includes(token));
    }

    function availableCategories(){
      const source=filters.section==="all"?data.recipes:data.recipes.filter(recipe=>recipe.section===filters.section);
      return [...new Set(source.map(recipe=>recipe.category))].sort();
    }

    function recipeCard(recipe){
      const section=sectionMap.get(recipe.section);
      const button=el("button","library-card");
      button.type="button";
      button.style.setProperty("--library-accent",section?.accent||"#88C0D0");
      const meta=el("div","library-card-meta");
      meta.appendChild(badge(section?.name||recipe.section));
      meta.appendChild(badge(recipe.difficulty,"difficulty-"+recipe.difficulty));
      button.appendChild(meta);
      button.appendChild(el("h3","",recipe.title));
      button.appendChild(el("p","",recipe.purpose));
      button.appendChild(el("div","library-card-footer",recipe.category+" | "+recipe.files.length+" file"+(recipe.files.length===1?"":"s")));
      button.addEventListener("click",()=>openRecipe(recipe.id));
      return button;
    }

    function bundleCard(bundle){
      const button=el("button","library-card library-bundle-card");
      button.type="button";
      button.style.setProperty("--library-accent",bundle.dimension==="3D"?"#A3BE8C":"#EBCB8B");
      const meta=el("div","library-card-meta");
      meta.appendChild(badge(bundle.dimension));
      meta.appendChild(badge(bundle.difficulty,"difficulty-"+bundle.difficulty));
      button.appendChild(meta);
      button.appendChild(el("h3","",bundle.title));
      button.appendChild(el("p","",bundle.summary));
      button.appendChild(el("div","library-card-footer",bundle.inspiredBy+" | "+bundle.recipeIds.length+" systems"));
      button.addEventListener("click",()=>openBundle(bundle.id));
      return button;
    }

    function renderFilters(host){
      const controls=el("div","library-controls");
      const search=document.createElement("input");
      search.type="search";
      search.value=filters.query;
      search.placeholder="Filter recipes, nodes, APIs, or code...";
      search.setAttribute("aria-label","Filter Code Library recipes");
      search.addEventListener("input",()=>{filters.query=search.value;renderList(search)});
      const section=document.createElement("select");
      section.setAttribute("aria-label","Code Library section");
      section.appendChild(new Option("All sections","all"));
      data.sections.forEach(item=>section.appendChild(new Option(item.name,item.id)));
      section.value=filters.section;
      section.addEventListener("change",()=>{filters.section=section.value;if(!availableCategories().includes(filters.category))filters.category="all";renderList(section)});
      const category=document.createElement("select");
      category.setAttribute("aria-label","Code Library category");
      category.appendChild(new Option("All categories","all"));
      availableCategories().forEach(item=>category.appendChild(new Option(item,item)));
      category.value=filters.category;
      category.addEventListener("change",()=>{filters.category=category.value;renderList(category)});
      const difficulty=document.createElement("select");
      difficulty.setAttribute("aria-label","Code Library difficulty");
      [["All difficulties","all"],["Beginner","beginner"],["Intermediate","intermediate"],["Advanced","advanced"],["Expert","expert"]].forEach(([name,value])=>difficulty.appendChild(new Option(name,value)));
      difficulty.value=filters.difficulty;
      difficulty.addEventListener("change",()=>{filters.difficulty=difficulty.value;renderList(difficulty)});
      controls.append(search,section,category,difficulty);
      host.appendChild(controls);
    }

    function restoreFocus(host,returnFocus){
      if(!returnFocus)return;
      const label=returnFocus.getAttribute("aria-label");
      const replacement=label?host.querySelector('[aria-label="'+CSS.escape(label)+'"]'):null;
      if(replacement){replacement.focus();if(replacement.setSelectionRange)replacement.setSelectionRange(replacement.value.length,replacement.value.length)}
    }

    function renderList(returnFocus=null){
      currentItem=null;
      const host=document.getElementById("libraryApp");
      host.innerHTML="";
      host.appendChild(tabBar(mode));
      const intro=el("div","library-hero");
      const copy=el("div","");
      copy.appendChild(el("div","library-kicker","GODOT "+data.version+" CODE LIBRARY"));
      copy.appendChild(el("h2","",mode==="recipes"?"Build common game systems faster":"Build a complete game from tested systems"));
      copy.appendChild(el("p","",mode==="recipes"?data.recipes.length+" version-pinned recipes with scene trees, visual setup, node attachment, signals, files, detailed steps, tests, sources, and clean or commented downloads.":data.bundles.length+" mechanics-first bundles with ordered assembly, required systems, minimum art, minimum sound, integration signals, acceptance tests, and downloadable scripts."));
      intro.appendChild(copy);
      const count=el("div","library-total");
      count.appendChild(el("strong","",String(mode==="recipes"?data.recipes.length:data.bundles.length)));
      count.appendChild(el("span","",mode==="recipes"?"complete recipes":"game bundles"));
      intro.appendChild(count);
      host.appendChild(intro);
      host.appendChild(el("div","source-note",mode==="recipes"?"GDScript targets Godot 4.7.1. Code sources are restricted to current Godot documentation, Godot Engine sources, and GDQuest. Downloads include clean and guided-comment versions.":"Bundles reproduce reusable mechanic patterns only. Use original characters, art, audio, levels, writing, names, balance, and branding."));
      if(mode==="bundles"){
        const grid=el("div","library-grid library-bundle-grid");
        data.bundles.forEach(bundle=>grid.appendChild(bundleCard(bundle)));
        host.appendChild(el("div","library-result-meta",data.bundles.length+" complete game plans"));
        host.appendChild(grid);
        restoreFocus(host,returnFocus);
        return;
      }
      const sectionGrid=el("div","library-section-grid");
      data.sections.forEach(section=>{
        const button=el("button","library-section-card"+(filters.section===section.id?" selected":""));
        button.type="button";
        button.style.setProperty("--library-accent",section.accent);
        button.appendChild(el("strong","",section.name));
        button.appendChild(el("span","",section.description));
        button.appendChild(el("small","",data.recipes.filter(recipe=>recipe.section===section.id).length+" recipes"));
        button.addEventListener("click",()=>{filters.section=filters.section===section.id?"all":section.id;filters.category="all";renderList()});
        sectionGrid.appendChild(button);
      });
      host.appendChild(sectionGrid);
      renderFilters(host);
      const matchesList=data.recipes.filter(matches);
      host.appendChild(el("div","library-result-meta",matchesList.length+" recipe"+(matchesList.length===1?"":"s")+" shown"));
      if(!matchesList.length){
        host.appendChild(el("div","empty-state","No recipes match those filters."));
      }else{
        const grid=el("div","library-grid");
        matchesList.forEach(recipe=>grid.appendChild(recipeCard(recipe)));
        host.appendChild(grid);
      }
      restoreFocus(host,returnFocus);
    }

    function addTextList(host,title,items,ordered=false){
      if(!items?.length)return;
      const section=el("section","recipe-section");
      section.appendChild(el("h3","",title));
      const list=document.createElement(ordered?"ol":"ul");
      items.forEach(item=>list.appendChild(el("li","",item)));
      section.appendChild(list);
      host.appendChild(section);
    }

    function detailBlock(title,items,open=false){
      const details=el("details","walkthrough-block");
      details.open=open;
      details.appendChild(el("summary","",title));
      const list=document.createElement("ol");
      items.forEach(item=>list.appendChild(el("li","",item)));
      details.appendChild(list);
      return details;
    }

    function inputTable(actions){
      const section=el("section","recipe-section");
      section.appendChild(el("h3","","Input Map"));
      if(!actions.length){section.appendChild(el("p","recipe-muted","No custom input actions are required."));return section}
      const wrap=el("div","recipe-table-wrap");
      const table=document.createElement("table");
      const head=document.createElement("thead");
      const headRow=document.createElement("tr");
      ["Action","Suggested bindings"].forEach(label=>headRow.appendChild(el("th","",label)));
      head.appendChild(headRow);
      const body=document.createElement("tbody");
      actions.forEach(action=>{const row=document.createElement("tr");row.append(el("td","",action.name),el("td","",action.bindings));body.appendChild(row)});
      table.append(head,body);wrap.appendChild(table);section.appendChild(wrap);return section;
    }

    function signalTable(signals){
      const section=el("section","recipe-section");
      section.appendChild(el("h3","","Signal wiring"));
      if(!signals?.length){section.appendChild(el("p","recipe-muted","No custom signal connection is required. Keep built-in connections described in the Inspector and file setup."));return section}
      const wrap=el("div","recipe-table-wrap");
      const table=document.createElement("table");
      const head=document.createElement("thead");
      const row=document.createElement("tr");
      ["From","Signal","To","Method","Why"].forEach(label=>row.appendChild(el("th","",label)));
      head.appendChild(row);
      const body=document.createElement("tbody");
      signals.forEach(item=>{const line=document.createElement("tr");[item.from,item.signal,item.to,item.method,item.why].forEach(value=>line.appendChild(el("td","",value)));body.appendChild(line)});
      table.append(head,body);wrap.appendChild(table);section.appendChild(wrap);return section;
    }

    function walkthrough(recipe){
      const section=el("section","recipe-walkthrough recipe-section");
      section.appendChild(el("h3","","Detailed walkthrough"));
      section.appendChild(el("p","recipe-muted","Open each stage in order. Do not move on until its check passes."));
      section.appendChild(detailBlock("1. Build the scene and attach visuals",[
        "Create this hierarchy exactly: "+recipe.nodeTree.join(" > "),
        ...(recipe.visuals?.length?recipe.visuals:["Add the Sprite2D, AnimatedSprite2D, MeshInstance3D, or imported model shown in the scene tree. Drag the visual asset into its Texture, SpriteFrames, or Mesh property.","Align the visual at the gameplay root origin. Resize the imported asset or visual child, not a physics collision node.","Add and size the CollisionShape2D or CollisionShape3D after the visual is aligned. Keep the collision node scale at one."]),
        "Save the scene before attaching scripts. Run it once and confirm the visuals and collision appear at the same origin."
      ],true));
      section.appendChild(detailBlock("2. Create Input Map actions",recipe.inputActions.length?recipe.inputActions.map(action=>"Project Settings > Input Map: add "+action.name+", then bind "+action.bindings+"."):["This system requires no new Input Map actions."]));
      section.appendChild(detailBlock("3. Create and attach every script",recipe.files.flatMap(file=>{const meta=fileMeta(recipe,file);return ["Create "+file.path+" and paste the selected clean or commented version.","Attach "+file.path+" to "+meta.attachTo+". Purpose: "+meta.purpose]})));
      section.appendChild(detailBlock("4. Assign Inspector values",recipe.inspector));
      section.appendChild(detailBlock("5. Connect signals",recipe.signals?.length?recipe.signals.map(item=>"Connect "+item.from+" signal "+item.signal+" to "+item.to+" method "+item.method+". "+item.why):["No extra custom signal is required. Complete any built-in connection named in the Inspector or implementation steps."]));
      section.appendChild(detailBlock("6. Implement in order",recipe.steps));
      section.appendChild(detailBlock("7. Pass every acceptance test",recipe.tests));
      return section;
    }

    function codeFile(recipe,file){
      const meta=fileMeta(recipe,file);
      const block=el("section","recipe-code");
      const header=el("div","recipe-code-head");
      const label=el("div","");
      label.append(el("strong","",file.path),el("span","",file.language+" | attach to "+meta.attachTo));
      header.appendChild(label);
      const actions=el("div","recipe-code-actions");
      const toggle=el("button","","Show commented");
      toggle.type="button";
      const copy=el("button","","Copy clean");
      copy.type="button";
      const cleanDownload=el("button","","Download clean");
      cleanDownload.type="button";
      const commentedDownload=el("button","","Download commented");
      commentedDownload.type="button";
      const pre=document.createElement("pre");
      const codeNode=document.createElement("code");
      let showingComments=false;
      const render=()=>{codeNode.textContent=showingComments?commentedCode(recipe,file):file.code;toggle.textContent=showingComments?"Show clean":"Show commented";copy.textContent=showingComments?"Copy commented":"Copy clean"};
      toggle.addEventListener("click",()=>{showingComments=!showingComments;render()});
      copy.addEventListener("click",()=>copyText(showingComments?commentedCode(recipe,file):file.code,file.path));
      cleanDownload.addEventListener("click",()=>downloadFile(recipe,file,false));
      commentedDownload.addEventListener("click",()=>downloadFile(recipe,file,true));
      actions.append(toggle,copy,cleanDownload,commentedDownload);
      header.appendChild(actions);
      const about=el("div","recipe-file-about",meta.purpose);
      pre.appendChild(codeNode);
      block.append(header,about,pre);
      render();
      return block;
    }

    function topActions(backLabel,onBack,cleanAction,commentedAction){
      const top=el("div","recipe-top");
      const back=el("button","recipe-back",backLabel);
      back.type="button";
      back.addEventListener("click",onBack);
      const downloads=el("div","recipe-downloads");
      const clean=el("button","recipe-copy-all","Download clean scripts");
      clean.type="button";
      clean.addEventListener("click",cleanAction);
      const commented=el("button","recipe-copy-all","Download commented scripts");
      commented.type="button";
      commented.addEventListener("click",commentedAction);
      downloads.append(clean,commented);
      top.append(back,downloads);
      return {top,back};
    }

    function sourceSection(items,lead){
      const section=el("section","recipe-section");
      section.appendChild(el("h3","","Sources and research"));
      section.appendChild(el("p","recipe-muted",lead));
      const list=el("div","recipe-source-list");
      items.forEach(item=>{const link=document.createElement("a");link.href=item.url;link.target="_blank";link.rel="noopener noreferrer";link.append(el("strong","",item.title),el("span","",item.kind));list.appendChild(link)});
      section.appendChild(list);
      return section;
    }

    function openRecipe(id,options={}){
      const recipe=recipeMap.get(id);
      if(!recipe)return false;
      mode="recipes";
      currentItem={type:"recipe",id};
      filters.section=recipe.section;
      const section=sectionMap.get(recipe.section);
      const host=document.getElementById("libraryApp");
      host.innerHTML="";
      const nav=topActions("Back to Code Library",()=>{renderList();if(onRoute)onRoute("library",true)},()=>downloadRecipe(recipe,false),()=>downloadRecipe(recipe,true));
      host.appendChild(nav.top);
      const article=el("article","recipe-detail");
      article.style.setProperty("--library-accent",section?.accent||"#88C0D0");
      const badges=el("div","recipe-badges");
      badges.append(badge(section?.name||recipe.section),badge(recipe.category),badge(recipe.difficulty,"difficulty-"+recipe.difficulty),badge("Godot "+recipe.version));
      article.append(badges,el("h2","",recipe.title),el("p","recipe-purpose",recipe.purpose));
      const tags=el("div","recipe-tags");
      recipe.tags.forEach(tag=>tags.appendChild(badge(tag)));
      article.appendChild(tags);
      const overview=el("div","recipe-overview-grid");
      const tree=el("section","recipe-section");
      tree.append(el("h3","","Scene tree"),el("pre","recipe-tree",recipe.nodeTree.join("\n")));
      overview.append(tree,inputTable(recipe.inputActions));
      article.appendChild(overview);
      article.appendChild(walkthrough(recipe));
      article.appendChild(signalTable(recipe.signals||[]));
      const files=el("section","recipe-files");
      const filesHead=el("div","recipe-files-head");
      filesHead.append(el("h3","","Complete scripts"),el("span","",recipe.files.length+" file"+(recipe.files.length===1?"":"s")));
      files.appendChild(filesHead);
      recipe.files.forEach(file=>files.appendChild(codeFile(recipe,file)));
      article.appendChild(files);
      addTextList(article,"Acceptance test",recipe.tests);
      article.appendChild(sourceSection(recipe.sources,"Open the current implementation references. Game-specific expressive content is not copied."));
      const related=el("section","recipe-section");
      related.appendChild(el("h3","","Related recipes"));
      const relatedGrid=el("div","recipe-related");
      recipe.related.map(relatedId=>recipeMap.get(relatedId)).filter(Boolean).forEach(item=>{const button=el("button","",item.title);button.type="button";button.addEventListener("click",()=>openRecipe(item.id));relatedGrid.appendChild(button)});
      related.appendChild(relatedGrid);article.appendChild(related);host.appendChild(article);
      host.scrollTop=0;
      if(options.route!==false&&onRoute)onRoute("library/recipe/"+recipe.id,Boolean(options.replace));
      window.setTimeout(()=>nav.back.focus(),0);
      return true;
    }

    function openBundle(id,options={}){
      const bundle=bundleMap.get(id);
      if(!bundle)return false;
      mode="bundles";
      currentItem={type:"bundle",id};
      const host=document.getElementById("libraryApp");
      host.innerHTML="";
      const nav=topActions("Back to game bundles",()=>{renderList();if(onRoute)onRoute("library/bundles",true)},()=>downloadBundle(bundle,false),()=>downloadBundle(bundle,true));
      host.appendChild(nav.top);
      const article=el("article","recipe-detail bundle-detail");
      article.style.setProperty("--library-accent",bundle.dimension==="3D"?"#A3BE8C":"#EBCB8B");
      const badges=el("div","recipe-badges");
      badges.append(badge("Game bundle"),badge(bundle.dimension),badge(bundle.difficulty,"difficulty-"+bundle.difficulty),badge(bundle.recipeIds.length+" systems"));
      article.append(badges,el("h2","",bundle.title),el("p","recipe-purpose",bundle.summary));
      const inspiration=el("div","bundle-inspiration");
      inspiration.append(el("strong","","Mechanic reference: "),document.createTextNode(bundle.inspiredBy));
      inspiration.appendChild(el("p","",bundle.ipNote));
      article.appendChild(inspiration);
      addTextList(article,"Mechanic map",bundle.mechanics);
      const systems=el("section","recipe-section");
      systems.appendChild(el("h3","","Required Code Library systems"));
      const systemGrid=el("div","bundle-systems");
      bundle.recipeIds.forEach((recipeId,index)=>{
        const recipe=recipeMap.get(recipeId);
        const button=el("button","",(index+1)+". "+(recipe?.title||recipeId));
        button.type="button";
        button.disabled=!recipe;
        if(recipe)button.addEventListener("click",()=>openRecipe(recipe.id));
        systemGrid.appendChild(button);
      });
      systems.appendChild(systemGrid);article.appendChild(systems);
      const plan=el("section","recipe-section bundle-plan");
      plan.appendChild(el("h3","","Put it together in this order"));
      bundle.milestones.forEach((item,index)=>{
        const details=detailBlock(item.title,item.steps,index===0);
        details.appendChild(el("p","bundle-exit","Exit test: "+item.exitTest));
        plan.appendChild(details);
      });
      article.appendChild(plan);
      const assetGrid=el("div","bundle-asset-grid");
      const art=el("section","recipe-section");
      art.appendChild(el("h3","","Minimum original art assets"));
      const artList=document.createElement("ul");
      bundle.artAssets.forEach(item=>artList.appendChild(el("li","",item)));
      art.appendChild(artList);
      const audio=el("section","recipe-section");
      audio.appendChild(el("h3","","Minimum SFX and audio"));
      const audioList=document.createElement("ul");
      bundle.sfx.forEach(item=>audioList.appendChild(el("li","",item)));
      audio.appendChild(audioList);
      assetGrid.append(art,audio);article.appendChild(assetGrid);
      addTextList(article,"Signal and integration map",bundle.signals);
      addTextList(article,"Bundle acceptance audit",bundle.definitionOfDone);
      article.appendChild(sourceSection(bundle.research,"These references were used to identify broad mechanics. The implementation uses the linked Godot recipes and original expressive content."));
      host.appendChild(article);
      host.scrollTop=0;
      if(options.route!==false&&onRoute)onRoute("library/bundle/"+bundle.id,Boolean(options.replace));
      window.setTimeout(()=>nav.back.focus(),0);
      return true;
    }

    function openItem(type,id,options={}){
      return type==="bundle"?openBundle(id,options):openRecipe(id,options);
    }

    function showMode(next){
      mode=next==="bundles"?"bundles":"recipes";
      currentItem=null;
      renderList();
    }

    function init(){if(initialized)return;initialized=true;renderList()}
    function activate(){init();if(!currentItem&&document.getElementById("libraryApp").children.length===0)renderList()}

    return Object.freeze({
      init,activate,openRecipe,openBundle,openItem,showMode,renderList,
      getSearchItems:()=>data.recipes,
      getBundleSearchItems:()=>data.bundles,
      getCurrentItem:()=>currentItem
    });
  }

  window.GodotTokLibraryUI=Object.freeze({create});
})();
