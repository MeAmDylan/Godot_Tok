(function(){
  "use strict";

  function create(deps){
    const {data,el,toast,onRoute}=deps;
    const sectionMap=new Map(data.sections.map(section=>[section.id,section]));
    let filters={section:"all",category:"all",difficulty:"all",query:""};
    let currentRecipeId=null;
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

    function matches(recipe){
      if(filters.section!=="all"&&recipe.section!==filters.section)return false;
      if(filters.category!=="all"&&recipe.category!==filters.category)return false;
      if(filters.difficulty!=="all"&&recipe.difficulty!==filters.difficulty)return false;
      const query=filters.query.trim().toLowerCase();
      if(!query)return true;
      const haystack=[
        recipe.title,recipe.purpose,recipe.category,recipe.section,
        recipe.difficulty,...recipe.tags,...recipe.nodeTree,
        ...recipe.files.map(file=>file.path+" "+file.code)
      ].join(" ").toLowerCase();
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
      button.dataset.recipeId=recipe.id;
      button.style.setProperty("--library-accent",section.accent);
      const meta=el("div","library-card-meta");
      meta.appendChild(badge(section.name));
      meta.appendChild(badge(recipe.difficulty,"difficulty-"+recipe.difficulty));
      button.appendChild(meta);
      button.appendChild(el("h3","",recipe.title));
      button.appendChild(el("p","",recipe.purpose));
      const footer=el("div","library-card-footer",recipe.category+" | "+recipe.files.length+" file"+(recipe.files.length===1?"":"s"));
      button.appendChild(footer);
      button.addEventListener("click",()=>openRecipe(recipe.id));
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
      section.addEventListener("change",()=>{
        filters.section=section.value;
        if(!availableCategories().includes(filters.category))filters.category="all";
        renderList(section);
      });

      const category=document.createElement("select");
      category.setAttribute("aria-label","Code Library category");
      category.appendChild(new Option("All categories","all"));
      availableCategories().forEach(item=>category.appendChild(new Option(item,item)));
      category.value=filters.category;
      category.addEventListener("change",()=>{filters.category=category.value;renderList(category)});

      const difficulty=document.createElement("select");
      difficulty.setAttribute("aria-label","Code Library difficulty");
      [["All difficulties","all"],["Beginner","beginner"],["Intermediate","intermediate"],["Advanced","advanced"]]
        .forEach(([name,value])=>difficulty.appendChild(new Option(name,value)));
      difficulty.value=filters.difficulty;
      difficulty.addEventListener("change",()=>{filters.difficulty=difficulty.value;renderList(difficulty)});

      controls.appendChild(search);
      controls.appendChild(section);
      controls.appendChild(category);
      controls.appendChild(difficulty);
      host.appendChild(controls);
    }

    function renderList(returnFocus=null){
      currentRecipeId=null;
      const host=document.getElementById("libraryApp");
      host.innerHTML="";

      const intro=el("div","library-hero");
      const copy=el("div","");
      copy.appendChild(el("div","library-kicker","GODOT "+data.version+" CODE LIBRARY"));
      copy.appendChild(el("h2","","Build common game systems faster"));
      copy.appendChild(el("p","","Twenty-four complete, version-pinned recipes. Each includes the scene tree, Input Map, Inspector settings, full files, setup steps, tests, sources, and related systems."));
      intro.appendChild(copy);
      const count=el("div","library-total");
      count.appendChild(el("strong","",String(data.recipes.length)));
      count.appendChild(el("span","","complete recipes"));
      intro.appendChild(count);
      host.appendChild(intro);

      const note=el("div","source-note","Code is adapted only from Godot 4.7 documentation, Godot Engine sources, or GDQuest. Every recipe links its source and states the target Godot version.");
      host.appendChild(note);

      const sectionGrid=el("div","library-section-grid");
      data.sections.forEach(section=>{
        const button=el("button","library-section-card"+(filters.section===section.id?" selected":""));
        button.type="button";
        button.style.setProperty("--library-accent",section.accent);
        button.appendChild(el("strong","",section.name));
        button.appendChild(el("span","",section.description));
        button.appendChild(el("small","",data.recipes.filter(recipe=>recipe.section===section.id).length+" recipes"));
        button.addEventListener("click",()=>{
          filters.section=filters.section===section.id?"all":section.id;
          filters.category="all";
          renderList();
        });
        sectionGrid.appendChild(button);
      });
      host.appendChild(sectionGrid);
      renderFilters(host);

      const matchesList=data.recipes.filter(matches);
      const resultMeta=el("div","library-result-meta",matchesList.length+" recipe"+(matchesList.length===1?"":"s")+" shown");
      host.appendChild(resultMeta);
      if(!matchesList.length){
        host.appendChild(el("div","empty-state","No recipes match those filters."));
      }else{
        const grid=el("div","library-grid");
        matchesList.forEach(recipe=>grid.appendChild(recipeCard(recipe)));
        host.appendChild(grid);
      }
      if(returnFocus){
        const replacement=host.querySelector(returnFocus.tagName==="SELECT"?"select[aria-label=\""+returnFocus.getAttribute("aria-label")+"\"]":"input[aria-label=\""+returnFocus.getAttribute("aria-label")+"\"]");
        if(replacement){
          replacement.focus();
          if(replacement.setSelectionRange){
            const end=replacement.value.length;
            replacement.setSelectionRange(end,end);
          }
        }
      }
    }

    function addTextList(host,title,items,ordered=false){
      const section=el("section","recipe-section");
      section.appendChild(el("h3","",title));
      const list=document.createElement(ordered?"ol":"ul");
      items.forEach(item=>list.appendChild(el("li","",item)));
      section.appendChild(list);
      host.appendChild(section);
    }

    function inputTable(actions){
      const section=el("section","recipe-section");
      section.appendChild(el("h3","","Input Map"));
      if(!actions.length){
        section.appendChild(el("p","recipe-muted","No custom input actions are required."));
        return section;
      }
      const wrap=el("div","recipe-table-wrap");
      const table=document.createElement("table");
      const head=document.createElement("thead");
      const headRow=document.createElement("tr");
      ["Action","Suggested bindings"].forEach(label=>headRow.appendChild(el("th","",label)));
      head.appendChild(headRow);
      const body=document.createElement("tbody");
      actions.forEach(action=>{
        const row=document.createElement("tr");
        row.appendChild(el("td","",action.name));
        row.appendChild(el("td","",action.bindings));
        body.appendChild(row);
      });
      table.appendChild(head);
      table.appendChild(body);
      wrap.appendChild(table);
      section.appendChild(wrap);
      return section;
    }

    function codeFile(file){
      const block=el("section","recipe-code");
      const header=el("div","recipe-code-head");
      const label=el("div","");
      label.appendChild(el("strong","",file.path));
      label.appendChild(el("span","",file.language));
      header.appendChild(label);
      const copy=el("button","","Copy file");
      copy.type="button";
      copy.addEventListener("click",()=>copyText(file.code,file.path));
      header.appendChild(copy);
      const pre=document.createElement("pre");
      const codeNode=document.createElement("code");
      codeNode.textContent=file.code;
      pre.appendChild(codeNode);
      block.appendChild(header);
      block.appendChild(pre);
      return block;
    }

    function openRecipe(id,options={}){
      const recipe=data.recipes.find(item=>item.id===id);
      if(!recipe)return false;
      currentRecipeId=id;
      filters.section=recipe.section;
      const section=sectionMap.get(recipe.section);
      const host=document.getElementById("libraryApp");
      host.innerHTML="";

      const top=el("div","recipe-top");
      const back=el("button","recipe-back","Back to Code Library");
      back.type="button";
      back.addEventListener("click",()=>{
        renderList();
        if(onRoute)onRoute("library",true);
      });
      top.appendChild(back);
      const copyAll=el("button","recipe-copy-all","Copy all files");
      copyAll.type="button";
      copyAll.addEventListener("click",()=>{
        const bundle=recipe.files.map(file=>"# "+file.path+"\n"+file.code).join("\n\n");
        copyText(bundle,recipe.title);
      });
      top.appendChild(copyAll);
      host.appendChild(top);

      const article=el("article","recipe-detail");
      article.style.setProperty("--library-accent",section.accent);
      const badges=el("div","recipe-badges");
      badges.appendChild(badge(section.name));
      badges.appendChild(badge(recipe.category));
      badges.appendChild(badge(recipe.difficulty,"difficulty-"+recipe.difficulty));
      badges.appendChild(badge("Godot "+recipe.version));
      article.appendChild(badges);
      article.appendChild(el("h2","",recipe.title));
      article.appendChild(el("p","recipe-purpose",recipe.purpose));
      const tags=el("div","recipe-tags");
      recipe.tags.forEach(tag=>tags.appendChild(badge(tag)));
      article.appendChild(tags);

      const overview=el("div","recipe-overview-grid");
      const tree=el("section","recipe-section");
      tree.appendChild(el("h3","","Scene tree"));
      tree.appendChild(el("pre","recipe-tree",recipe.nodeTree.join("\n")));
      overview.appendChild(tree);
      overview.appendChild(inputTable(recipe.inputActions));
      article.appendChild(overview);

      addTextList(article,"Inspector setup",recipe.inspector);
      addTextList(article,"Implementation",recipe.steps,true);

      const files=el("section","recipe-files");
      const filesHead=el("div","recipe-files-head");
      filesHead.appendChild(el("h3","","Complete files"));
      filesHead.appendChild(el("span","",recipe.files.length+" file"+(recipe.files.length===1?"":"s")));
      files.appendChild(filesHead);
      recipe.files.forEach(file=>files.appendChild(codeFile(file)));
      article.appendChild(files);

      addTextList(article,"Test checklist",recipe.tests);

      const sourceSection=el("section","recipe-section");
      sourceSection.appendChild(el("h3","","Sources and attribution"));
      sourceSection.appendChild(el("p","recipe-muted","Adapted for GodotTok. Open a source to compare against the current reference."));
      const sourceList=el("div","recipe-source-list");
      recipe.sources.forEach(item=>{
        const link=document.createElement("a");
        link.href=item.url;
        link.target="_blank";
        link.rel="noopener noreferrer";
        link.appendChild(el("strong","",item.title));
        link.appendChild(el("span","",item.kind));
        sourceList.appendChild(link);
      });
      sourceSection.appendChild(sourceList);
      article.appendChild(sourceSection);

      const related=el("section","recipe-section");
      related.appendChild(el("h3","","Related recipes"));
      const relatedGrid=el("div","recipe-related");
      recipe.related.map(relatedId=>data.recipes.find(item=>item.id===relatedId)).filter(Boolean).forEach(item=>{
        const button=el("button","",item.title);
        button.type="button";
        button.addEventListener("click",()=>openRecipe(item.id));
        relatedGrid.appendChild(button);
      });
      related.appendChild(relatedGrid);
      article.appendChild(related);
      host.appendChild(article);
      host.scrollTop=0;
      if(options.route!==false&&onRoute)onRoute("library/"+recipe.id,Boolean(options.replace));
      window.setTimeout(()=>back.focus(),0);
      return true;
    }

    function init(){
      if(initialized)return;
      initialized=true;
      renderList();
    }

    function activate(){
      init();
      if(!currentRecipeId&&document.getElementById("libraryApp").children.length===0)renderList();
    }

    return Object.freeze({
      init,activate,openRecipe,renderList,
      getSearchItems:()=>data.recipes,
      getCurrentRecipeId:()=>currentRecipeId
    });
  }

  window.GodotTokLibraryUI=Object.freeze({create});
})();
