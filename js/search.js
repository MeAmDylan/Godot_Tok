(function(){
  "use strict";

  const REFERENCES=Object.freeze([
    {id:"docs-home",kind:"docs",title:"Godot 4.7 documentation",description:"Official Godot Engine 4.7 manual and class reference.",topics:["docs","manual","reference"],url:"https://docs.godotengine.org/en/4.7/"},
    {id:"docs-gdscript",kind:"docs",title:"GDScript reference",description:"Language syntax, types, functions, annotations, and operators.",topics:["gdscript","syntax","variables","functions","types"],url:"https://docs.godotengine.org/en/4.7/tutorials/scripting/gdscript/gdscript_basics.html"},
    {id:"docs-signals",kind:"docs",title:"Using signals",description:"Connect nodes without tightly coupling their scripts.",topics:["signals","connect","emit","events"],url:"https://docs.godotengine.org/en/4.7/getting_started/step_by_step/signals.html"},
    {id:"docs-characterbody2d",kind:"docs",title:"CharacterBody2D",description:"Official 2D user-controlled physics body class.",topics:["2d","player","movement","collision"],url:"https://docs.godotengine.org/en/4.7/classes/class_characterbody2d.html"},
    {id:"docs-characterbody3d",kind:"docs",title:"CharacterBody3D",description:"Official 3D user-controlled physics body class.",topics:["3d","player","movement","collision"],url:"https://docs.godotengine.org/en/4.7/classes/class_characterbody3d.html"},
    {id:"docs-area2d",kind:"docs",title:"Area2D",description:"Detect 2D bodies and areas entering or leaving a region.",topics:["2d","hitbox","hurtbox","overlap"],url:"https://docs.godotengine.org/en/4.7/classes/class_area2d.html"},
    {id:"docs-navigation",kind:"docs",title:"Using NavigationAgents",description:"Pathfinding and path following with 2D and 3D agents.",topics:["navigation","pathfinding","ai","agent"],url:"https://docs.godotengine.org/en/4.7/tutorials/navigation/navigation_using_navigationagents.html"},
    {id:"docs-ui",kind:"docs",title:"Size and anchors",description:"Responsive Control-node sizing and anchor offsets.",topics:["ui","control","anchors","responsive"],url:"https://docs.godotengine.org/en/4.7/tutorials/ui/size_and_anchors.html"},
    {id:"docs-audio",kind:"docs",title:"Audio buses",description:"Mix, route, and apply effects to game audio.",topics:["audio","music","sfx","volume","bus"],url:"https://docs.godotengine.org/en/4.7/tutorials/audio/audio_buses.html"},
    {id:"docs-saving",kind:"docs",title:"Saving games",description:"Persist game data to user storage.",topics:["save","load","file","json","persistence"],url:"https://docs.godotengine.org/en/4.7/tutorials/io/saving_games.html"},
    {id:"cheat-variables",kind:"cheatsheet",title:"Cheatsheet: variables and types",description:"Typed variables, constants, exports, and onready references.",topics:["variables","types","export","onready"],anchor:"variables-types"},
    {id:"cheat-functions",kind:"cheatsheet",title:"Cheatsheet: functions and control flow",description:"Functions, callbacks, conditions, loops, and match.",topics:["function","if","for","while","match"],anchor:"functions"},
    {id:"cheat-signals",kind:"cheatsheet",title:"Cheatsheet: signals and nodes",description:"Declare, connect, emit, and find nodes.",topics:["signal","node","get_node","connect","emit"],anchor:"signals"},
    {id:"cheat-input",kind:"cheatsheet",title:"Cheatsheet: Input Map",description:"Read actions, axes, vectors, and one-shot presses.",topics:["input","action","axis","vector","keyboard","controller"],anchor:"input"},
    {id:"cheat-movement",kind:"cheatsheet",title:"Cheatsheet: CharacterBody2D movement",description:"Velocity, gravity, jump, and move_and_slide.",topics:["movement","characterbody2d","velocity","jump","gravity"],anchor:"characterbody2d-movement"},
    {id:"cheat-tween",kind:"cheatsheet",title:"Cheatsheet: Tween",description:"Create property and callback animation sequences.",topics:["tween","animation","transition","ease"],anchor:"tween"}
  ]);

  function create(deps){
    const {
      learningData,libraryData,getVideos,el,openModal,openExternal,
      openLearningItem,openLibraryRecipe,openReference,openDoc
    }=deps;
    const typeOrder=["recipe","flashcard","quiz","guide","video","reference"];
    const typeLabels={
      recipe:"Code Library",flashcard:"Flashcards",quiz:"Quizzes",
      guide:"Guides",video:"Videos",reference:"Reference"
    };
    let lastQuery="";

    function normalize(value){
      return String(value||"").toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g," ");
    }

    function staticItems(){
      const categoryName=new Map(learningData.categories.map(item=>[item.id,item.name]));
      const flashcards=learningData.flashcards.map(item=>({
        type:"flashcard",id:item.id,title:item.question,
        description:item.answer,meta:categoryName.get(item.category)+" | "+item.topic+" | "+item.difficulty,
        search:[item.question,item.answer,item.code,item.topic,item.category,item.difficulty].join(" "),
        raw:item
      }));
      const quizzes=learningData.quizzes.map(item=>({
        type:"quiz",id:item.id,title:item.prompt,
        description:item.explanation,meta:categoryName.get(item.category)+" | "+item.topic+" | "+item.difficulty,
        search:[item.prompt,item.explanation,...item.choices,item.topic,item.category,item.difficulty].join(" "),
        raw:item
      }));
      const guides=learningData.guides.map(item=>({
        type:"guide",id:item.id,title:item.title,description:item.description,
        meta:"Christophe | "+item.kind+" | "+item.version,search:["Christophe",item.title,item.description,...item.topics,item.kind].join(" "),raw:item
      }));
      const recipes=libraryData.recipes.map(item=>({
        type:"recipe",id:item.id,title:item.title,description:item.purpose,
        meta:item.section.toUpperCase()+" | "+item.category+" | "+item.difficulty,
        search:[
          item.title,item.purpose,item.section,item.category,item.difficulty,
          ...item.tags,...item.nodeTree,...item.files.map(file=>file.path+" "+file.code)
        ].join(" "),raw:item
      }));
      const references=REFERENCES.map(item=>({
        type:"reference",id:item.id,title:item.title,description:item.description,
        meta:item.kind==="docs"?"Official Godot 4.7 docs":"In-app cheatsheet",
        search:[item.title,item.description,...item.topics].join(" "),raw:item
      }));
      return [...recipes,...flashcards,...quizzes,...guides,...references];
    }

    function videoItems(){
      return getVideos().map(item=>({
        type:"video",id:item.id,title:item.title,description:item.creator||"Godot video",
        meta:(item.type==="yt"?"YouTube":"TikTok")+" | "+(item.long?"Longform":"Feed"),
        search:[item.title,item.creator,item.type,item.long?"longform":""].join(" "),raw:item
      }));
    }

    function rank(item,tokens,fullQuery){
      const title=normalize(item.title);
      const haystack=normalize(item.search+" "+item.description+" "+item.meta);
      let score=0;
      if(title===fullQuery)score+=80;
      if(title.startsWith(fullQuery))score+=35;
      if(title.includes(fullQuery))score+=20;
      for(const token of tokens){
        if(!haystack.includes(token))return -1;
        score+=title.includes(token)?12:3;
        if(title.split(/\s+/).some(word=>word.startsWith(token)))score+=5;
      }
      return score;
    }

    function search(query){
      const fullQuery=normalize(query).trim();
      if(!fullQuery)return [];
      const tokens=fullQuery.split(/\s+/).filter(Boolean);
      return [...staticItems(),...videoItems()]
        .map(item=>({...item,score:rank(item,tokens,fullQuery)}))
        .filter(item=>item.score>=0)
        .sort((a,b)=>b.score-a.score||typeOrder.indexOf(a.type)-typeOrder.indexOf(b.type)||a.title.localeCompare(b.title));
    }

    function resultCard(item){
      const button=el("button","search-card");
      button.type="button";
      button.dataset.searchType=item.type;
      button.dataset.searchId=item.id;
      if(item.type==="video"&&item.raw.type==="yt"){
        const image=document.createElement("img");
        image.src="https://i.ytimg.com/vi/"+item.raw.vid+"/mqdefault.jpg";
        image.alt="";
        image.loading="lazy";
        button.appendChild(image);
      }else{
        const marker=el("div","search-marker",typeLabels[item.type].slice(0,2).toUpperCase());
        button.appendChild(marker);
      }
      const body=el("div","search-card-body");
      const type=el("div","search-card-type",typeLabels[item.type]);
      body.appendChild(type);
      body.appendChild(el("strong","",item.title));
      body.appendChild(el("p","",item.description));
      body.appendChild(el("small","",item.meta));
      button.appendChild(body);
      button.appendChild(el("span","search-card-action",item.type==="video"?"Play in app":"Open in app"));
      button.addEventListener("click",()=>activate(item));
      return button;
    }

    function activate(item){
      if(item.type==="video"){openModal(item.raw);return}
      if(item.type==="recipe"){openLibraryRecipe(item.id);return}
      if(item.type==="flashcard"||item.type==="quiz"||item.type==="guide"){
        openLearningItem(item.type,item.id);
        return;
      }
      if(item.raw.kind==="docs")openDoc(item.raw.url);
      else openReference(item.raw.anchor);
    }

    function externalSearchActions(host,query){
      const section=el("section","search-external");
      section.appendChild(el("h3","","Search the web after you choose a destination"));
      section.appendChild(el("p","","These buttons leave GodotTok. Results above stay inside the app."));
      const actions=el("div","doclinks");
      const links=[
        ["Open official docs search","https://docs.godotengine.org/en/4.7/search.html?q="+encodeURIComponent(query)],
        ["Open GDQuest search","https://www.gdquest.com/?s="+encodeURIComponent(query)],
        ["Open Godot community Q&A","https://forum.godotengine.org/search?q="+encodeURIComponent(query)]
      ];
      links.forEach(([label,url])=>{
        const button=el("button","doclinkbtn",label);
        button.type="button";
        button.addEventListener("click",()=>openExternal(url));
        actions.appendChild(button);
      });
      section.appendChild(actions);
      host.appendChild(section);
    }

    function renderEmpty(host){
      const hero=el("div","search-home");
      hero.appendChild(el("div","search-home-kicker","ONE SEARCH, SIX CONTENT TYPES"));
      hero.appendChild(el("h2","","Find it without leaving GodotTok"));
      hero.appendChild(el("p","","Search videos, flashcards, quizzes, guides, the Code Library, and the in-app reference. A result opens inside the app. External sites open only when you choose an external button."));
      const types=el("div","search-type-grid");
      [
        ["Code Library",libraryData.recipes.length+" complete recipes"],
        ["Flashcards",learningData.flashcards.length+" sourced cards"],
        ["Quizzes",learningData.quizzes.length+" explained questions"],
        ["Guides",learningData.guides.length+" Christophe resources"],
        ["Videos",getVideos().length+" current videos"],
        ["Reference",REFERENCES.length+" docs and cheatsheet entries"]
      ].forEach(([title,count])=>{
        const item=el("div","search-type-card");
        item.appendChild(el("strong","",title));
        item.appendChild(el("span","",count));
        types.appendChild(item);
      });
      hero.appendChild(types);
      host.appendChild(hero);
    }

    function renderSearch(query){
      lastQuery=query;
      const host=document.getElementById("searchResults");
      host.innerHTML="";
      if(!query.trim()){
        renderEmpty(host);
        return;
      }
      const results=search(query);
      const status=el("div","search-summary",results.length+" in-app result"+(results.length===1?"":"s")+" for \""+query.trim()+"\"");
      status.setAttribute("role","status");
      host.appendChild(status);
      if(!results.length){
        host.appendChild(el("div","search-empty","No in-app matches. Try a shorter term or choose an external search below."));
      }else{
        typeOrder.forEach(type=>{
          const group=results.filter(item=>item.type===type).slice(0,type==="recipe"?12:8);
          if(!group.length)return;
          const section=el("section","search-group");
          const heading=el("div","search-group-head");
          heading.appendChild(el("h3","",typeLabels[type]));
          heading.appendChild(el("span","",results.filter(item=>item.type===type).length+" found"));
          section.appendChild(heading);
          const list=el("div","search-card-list");
          group.forEach(item=>list.appendChild(resultCard(item)));
          section.appendChild(list);
          host.appendChild(section);
        });
      }
      externalSearchActions(host,query.trim());
    }

    function init(){
      const input=document.getElementById("searchInput");
      input.addEventListener("input",event=>renderSearch(event.target.value));
      renderSearch(input.value);
    }

    return Object.freeze({
      init,renderSearch,search,getReferences:()=>REFERENCES,getLastQuery:()=>lastQuery
    });
  }

  window.GodotTokSearch=Object.freeze({create});
})();
