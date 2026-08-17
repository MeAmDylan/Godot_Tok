(function(){
  "use strict";

  function create(deps){
    const {data,el,shuffle,readLocal,writeLocal,openExternal,toast,labelButton,reduceMotion}=deps;
    const DAY=24*60*60*1000;
    const categoryMap=new Map(data.categories.map(category=>[category.id,category]));
    let cards=[],queue=[],progress={},sessionTotal=0,sessionDone=0;
    let filters={category:"all",difficulty:"all"};
    let quizQueue=[],quizIndex=0,quizScore=0,quizAnswers=[],quizConfig={category:"all",difficulty:"all",count:10,mode:"all"};
    let quizProgress={};
    let initialized=false,guidesRendered=false,quizRendered=false;

    function stableId(value){
      let hash=2166136261;
      for(let index=0;index<value.length;index++){hash^=value.charCodeAt(index);hash=Math.imul(hash,16777619)}
      return "custom-"+(hash>>>0).toString(36);
    }

    function normalizeCustom(card){
      const question=String(card.question||card.q||"").trim();
      const answer=String(card.answer||card.a||"").trim();
      if(!question||!answer)return null;
      const category=categoryMap.has(card.category)?card.category:"fundamentals";
      const difficulty=["beginner","intermediate","advanced"].includes(card.difficulty)?card.difficulty:"beginner";
      return {
        id:card.id||stableId(question),question,answer,
        code:card.code||undefined,category,difficulty,
        topic:String(card.topic||"Custom").trim()||"Custom",
        godotVersion:card.godotVersion||data.version,
        source:card.source||null,_user:true
      };
    }

    function cardKey(card){return card.id}

    function migrateProgress(allCards){
      const current=readLocal("gt_fc_progress_v2",{});
      const legacy=readLocal("gt_fc_progress",{});
      const migrated=current&&typeof current==="object"&&!Array.isArray(current)?{...current}:{};
      for(const card of allCards){
        if(migrated[card.id])continue;
        const oldKey=(card._user?"custom:":"built-in:")+card.question;
        if(legacy&&legacy[oldKey])migrated[card.id]=legacy[oldKey];
      }
      writeLocal("gt_fc_progress_v2",migrated);
      return migrated;
    }

    function filteredCards(){
      return cards.filter(card=>(filters.category==="all"||card.category===filters.category)&&(filters.difficulty==="all"||card.difficulty===filters.difficulty));
    }

    function loadCards(reviewAll=false){
      const raw=readLocal("gt_fc_custom",[]);
      const custom=Array.isArray(raw)?raw.map(normalizeCustom).filter(Boolean):[];
      cards=[...data.flashcards,...custom];
      progress=migrateProgress(cards);
      const now=Date.now();
      const filtered=filteredCards();
      const due=filtered.filter(card=>{
        const item=progress[cardKey(card)];
        return !item||!Number.isFinite(item.due)||item.due<=now;
      });
      queue=shuffle(reviewAll?[...filtered]:due);
      sessionTotal=queue.length;sessionDone=0;
    }

    function status(card){
      const item=progress[cardKey(card)];
      if(!item)return "new";
      if(!Number.isFinite(item.due)||item.due<=Date.now())return "due now";
      return "level "+(item.streak||0)+" | review "+new Date(item.due).toLocaleDateString();
    }

    function grade(card,rating){
      const key=cardKey(card);
      const previous=progress[key]||{streak:0};
      const streak=Math.max(0,Number(previous.streak)||0);
      let nextStreak=streak,days=0,repeat=false;
      if(rating==="again"){nextStreak=0;repeat=true}
      if(rating==="hard"){nextStreak=Math.max(1,streak);days=[1,2,4,7,14][Math.min(nextStreak-1,4)]}
      if(rating==="good"){nextStreak=Math.min(streak+1,5);days=[1,3,7,14,30][nextStreak-1]}
      if(rating==="easy"){nextStreak=Math.min(streak+2,5);days=[3,7,14,30,60][nextStreak-1]}
      progress[key]={streak:nextStreak,due:repeat?Date.now():Date.now()+days*DAY,lastRating:rating,lastReviewed:Date.now()};
      if(repeat)queue.push(queue.shift());else{queue.shift();sessionDone++}
      writeLocal("gt_fc_progress_v2",progress);
      renderStudy();
    }

    function badge(text,className=""){
      return el("span","learning-badge "+className,text);
    }

    function renderFilters(host){
      const bar=el("div","fc-filter-bar");
      const category=document.createElement("select");category.setAttribute("aria-label","Flashcard category");
      category.appendChild(new Option("All categories","all"));
      data.categories.forEach(item=>category.appendChild(new Option(item.name,item.id)));
      category.value=filters.category;
      const difficulty=document.createElement("select");difficulty.setAttribute("aria-label","Flashcard difficulty");
      [["All difficulties","all"],["Beginner","beginner"],["Intermediate","intermediate"],["Advanced","advanced"]].forEach(([name,value])=>difficulty.appendChild(new Option(name,value)));
      difficulty.value=filters.difficulty;
      const update=()=>{filters={category:category.value,difficulty:difficulty.value};loadCards();renderStudy()};
      category.addEventListener("change",update);difficulty.addEventListener("change",update);
      bar.appendChild(category);bar.appendChild(difficulty);host.appendChild(bar);
    }

    function renderStats(wrap){
      const relevant=filteredCards();const now=Date.now();
      const due=relevant.filter(card=>!progress[card.id]||progress[card.id].due<=now).length;
      const fresh=relevant.filter(card=>!progress[card.id]).length;
      const mastered=relevant.filter(card=>(progress[card.id]?.streak||0)>=4).length;
      const dash=el("div","fc-dashboard");
      [[due,"due"],[fresh,"new"],[mastered,"mastered"]].forEach(([value,label])=>{
        const box=el("div","fc-stat");box.appendChild(el("strong","",String(value)));box.appendChild(el("span","",label));dash.appendChild(box);
      });
      wrap.appendChild(dash);
    }

    function renderStudy(){
      const host=document.getElementById("fcStudyView");host.innerHTML="";
      renderFilters(host);
      if(!cards.length)loadCards();
      const wrap=el("div","fc-study-wrap");renderStats(wrap);
      if(!queue.length){
        const empty=el("div","search-empty");
        empty.appendChild(el("div","","No cards are due for the selected filters."));
        const review=el("button","primary","Review selected cards now");review.type="button";
        review.addEventListener("click",()=>{loadCards(true);renderStudy()});empty.appendChild(review);wrap.appendChild(empty);host.appendChild(wrap);return;
      }
      const card=queue[0];const category=categoryMap.get(card.category);
      const outer=el("div","fc-card-outer");outer.tabIndex=0;outer.setAttribute("role","button");outer.setAttribute("aria-label","Show flashcard answer");outer.setAttribute("aria-pressed","false");
      if(reduceMotion)outer.classList.add("reduce-motion");
      const inner=el("div","fc-inner"),front=el("div","fc-face front"),back=el("div","fc-face back");
      const frontBadges=el("div","fc-badges");frontBadges.appendChild(badge(category?.name||card.category));frontBadges.appendChild(badge(card.topic));frontBadges.appendChild(badge(card.difficulty,"difficulty-"+card.difficulty));front.appendChild(frontBadges);
      front.appendChild(el("div","fc-label","QUESTION "+Math.min(sessionDone+1,sessionTotal)+" / "+sessionTotal));
      front.appendChild(el("div","fc-q",card.question));
      const backBadges=el("div","fc-badges");backBadges.appendChild(badge("Godot "+card.godotVersion));backBadges.appendChild(badge(status(card)));back.appendChild(backBadges);
      back.appendChild(el("div","fc-label","ANSWER"));back.appendChild(el("div","fc-a",card.answer));
      if(card.code)back.appendChild(el("pre","fc-code",card.code));
      if(card.source){const source=el("a","fc-source","Source: "+card.source.title);source.href=card.source.url;source.target="_blank";source.rel="noopener noreferrer";source.addEventListener("click",event=>event.stopPropagation());back.appendChild(source)}
      inner.appendChild(front);inner.appendChild(back);outer.appendChild(inner);
      function flip(){const flipped=outer.classList.toggle("flipped");outer.setAttribute("aria-pressed",String(flipped));outer.setAttribute("aria-label",flipped?"Show flashcard question":"Show flashcard answer")}
      outer.addEventListener("click",flip);outer.addEventListener("keydown",event=>{if(event.key==="Enter"||event.key===" "){event.preventDefault();flip()}});wrap.appendChild(outer);
      const progressText=el("div","fc-prog","Tap or press Enter to flip. Again repeats now; Hard, Good, and Easy schedule progressively longer reviews.");wrap.appendChild(progressText);
      const actions=el("div","fc-actions");
      [["again","Again"],["hard","Hard"],["good","Good"],["easy","Easy"]].forEach(([value,label])=>{const button=el("button",value,label);button.type="button";button.addEventListener("click",()=>grade(card,value));actions.appendChild(button)});
      wrap.appendChild(actions);host.appendChild(wrap);
    }

    function renderList(){
      const host=document.getElementById("fcListView");host.innerHTML="";renderFilters(host);
      const list=el("div","fc-list-wrap");
      filteredCards().forEach(card=>{
        const row=el("div","fc-list-item"),meta=el("div","");
        meta.appendChild(el("div","fq",card.question));meta.appendChild(el("div","fcust",(card._user?"custom | ":"")+categoryMap.get(card.category).name+" | "+card.topic+" | "+card.difficulty+" | "+status(card)));row.appendChild(meta);
        if(card._user){const remove=labelButton(el("button","","x"),"Delete custom flashcard");remove.addEventListener("click",()=>{
          const stored=readLocal("gt_fc_custom",[]);writeLocal("gt_fc_custom",Array.isArray(stored)?stored.filter(item=>(item.id||stableId(item.question||item.q||""))!==card.id):[]);delete progress[card.id];writeLocal("gt_fc_progress_v2",progress);loadCards();renderList();toast("card deleted");
        });row.appendChild(remove)}
        list.appendChild(row);
      });host.appendChild(list);
    }

    function addCustomCard(){
      const question=document.getElementById("fcQ").value.trim(),answer=document.getElementById("fcA").value.trim(),code=document.getElementById("fcCode").value.trim();
      const category=document.getElementById("fcCategory").value,difficulty=document.getElementById("fcDifficulty").value,topic=document.getElementById("fcTopic").value.trim()||"Custom";
      const message=document.getElementById("fcAddMsg");
      if(!question||!answer){message.textContent="Question and answer are required.";message.style.color="var(--red)";return}
      const stored=readLocal("gt_fc_custom",[]),custom=Array.isArray(stored)?stored:[];
      const item={id:stableId(question+Date.now()),question,answer,code:code||undefined,category,difficulty,topic,godotVersion:data.version};custom.push(item);
      if(!writeLocal("gt_fc_custom",custom)){message.textContent="Storage is unavailable on this device.";message.style.color="var(--red)";return}
      ["fcQ","fcA","fcCode","fcTopic"].forEach(id=>document.getElementById(id).value="");message.textContent="Card added.";message.style.color="var(--grn)";window.setTimeout(()=>message.textContent="",2000);loadCards();renderStudy();
    }

    function setMode(mode){
      ["Study","List","Add"].forEach(name=>{const active=name.toLowerCase()===mode;document.getElementById("fcMode"+name).classList.toggle("active",active);document.getElementById("fcMode"+name).setAttribute("aria-selected",String(active));document.getElementById("fc"+name+"View").style.display=active?"flex":"none"});
      if(mode==="study")renderStudy();if(mode==="list")renderList();
    }

    function masteryFor(category){
      const items=data.quizzes.filter(item=>item.category===category);if(!items.length)return 0;
      return Math.round(items.filter(item=>(quizProgress[item.id]?.correct||0)>0).length/items.length*100);
    }

    function quizHeader(host){
      const head=el("div","learning-head"),copy=el("div","");copy.appendChild(el("h2","","Quizzes"));copy.appendChild(el("p","","Choose a topic and difficulty. Every answer includes an explanation and a version-pinned source."));head.appendChild(copy);host.appendChild(head);
    }

    function renderQuizHome(){
      quizProgress=readLocal("gt_quiz_progress",{});const host=document.getElementById("quizApp");host.innerHTML="";quizHeader(host);
      const grid=el("div","category-grid");
      data.categories.forEach(category=>{const button=el("button","category-card"+(quizConfig.category===category.id?" selected":""));button.type="button";button.style.setProperty("--category-accent",category.accent);button.appendChild(el("strong","",category.name));button.appendChild(el("span","",category.description));button.appendChild(el("small","",masteryFor(category.id)+"% answered correctly"));button.addEventListener("click",()=>{quizConfig.category=category.id;renderQuizHome()});grid.appendChild(button)});host.appendChild(grid);
      const controls=el("div","quiz-controls");
      const makeSelect=(labelText,values,current,change)=>{const label=el("label","",labelText),select=document.createElement("select");values.forEach(([text,value])=>select.appendChild(new Option(text,value)));select.value=String(current);select.addEventListener("change",()=>change(select.value));label.appendChild(select);controls.appendChild(label)};
      makeSelect("Category",[["All categories","all"],...data.categories.map(item=>[item.name,item.id])],quizConfig.category,value=>quizConfig.category=value);
      makeSelect("Difficulty",[["All difficulties","all"],["Beginner","beginner"],["Intermediate","intermediate"],["Advanced","advanced"]],quizConfig.difficulty,value=>quizConfig.difficulty=value);
      makeSelect("Questions",[["5","5"],["10","10"],["20","20"]],quizConfig.count,value=>quizConfig.count=Number(value));
      makeSelect("Question set",[["All matching","all"],["Previously missed","missed"]],quizConfig.mode,value=>quizConfig.mode=value);
      const start=el("button","quiz-start","Start quiz");start.type="button";start.addEventListener("click",startQuiz);controls.appendChild(start);host.appendChild(controls);quizRendered=true;
    }

    function startQuiz(){
      let pool=data.quizzes.filter(item=>(quizConfig.category==="all"||item.category===quizConfig.category)&&(quizConfig.difficulty==="all"||item.difficulty===quizConfig.difficulty));
      if(quizConfig.mode==="missed")pool=pool.filter(item=>quizProgress[item.id]?.lastCorrect===false);
      if(!pool.length){toast("No questions match those filters");return}
      quizQueue=shuffle(pool).slice(0,Math.min(quizConfig.count,pool.length));quizIndex=0;quizScore=0;quizAnswers=[];renderQuizQuestion();
    }

    function renderQuizQuestion(){
      const host=document.getElementById("quizApp");host.innerHTML="";
      if(quizIndex>=quizQueue.length){renderQuizSummary();return}
      const item=quizQueue[quizIndex],category=categoryMap.get(item.category),card=el("div","quiz-card");
      const meta=el("div","quiz-meta");meta.appendChild(el("span","",category.name+" | "+item.topic+" | "+item.difficulty));meta.appendChild(el("span","","Question "+(quizIndex+1)+" / "+quizQueue.length));card.appendChild(meta);card.appendChild(el("h3","",item.prompt));
      const choices=el("div","quiz-choices");
      item.choices.forEach((choice,index)=>{const button=el("button","quiz-choice",choice);button.type="button";button.addEventListener("click",()=>answerQuiz(item,index,choices,card));choices.appendChild(button)});card.appendChild(choices);host.appendChild(card);
    }

    function answerQuiz(item,selected,choices,card){
      const correct=selected===item.correct;quizAnswers.push({id:item.id,correct});if(correct)quizScore++;
      [...choices.children].forEach((button,index)=>{button.disabled=true;if(index===item.correct)button.classList.add("correct");if(index===selected&&!correct)button.classList.add("incorrect")});
      const prior=quizProgress[item.id]||{attempts:0,correct:0,wrong:0};quizProgress[item.id]={attempts:prior.attempts+1,correct:prior.correct+(correct?1:0),wrong:prior.wrong+(correct?0:1),lastCorrect:correct,lastAttempt:Date.now()};writeLocal("gt_quiz_progress",quizProgress);
      const feedback=el("div","quiz-feedback",(correct?"Correct. ":"Not correct. ")+item.explanation);const source=el("a","","Source: "+item.source.title);source.href=item.source.url;source.target="_blank";source.rel="noopener noreferrer";feedback.appendChild(document.createElement("br"));feedback.appendChild(source);card.appendChild(feedback);
      const next=el("button","quiz-next",quizIndex+1===quizQueue.length?"See results":"Next question");next.type="button";next.addEventListener("click",()=>{quizIndex++;renderQuizQuestion()});card.appendChild(next);next.focus();
    }

    function renderQuizSummary(){
      const host=document.getElementById("quizApp");host.innerHTML="";const summary=el("div","quiz-summary");summary.appendChild(el("strong","",quizScore+" / "+quizQueue.length));summary.appendChild(el("h2","","Quiz complete"));summary.appendChild(el("p","",quizAnswers.filter(answer=>!answer.correct).length+" missed question(s) were saved for focused review."));
      const retry=el("button","quiz-next","Retry missed questions");retry.type="button";retry.disabled=!quizAnswers.some(answer=>!answer.correct);retry.addEventListener("click",()=>{const missed=new Set(quizAnswers.filter(answer=>!answer.correct).map(answer=>answer.id));quizQueue=shuffle(data.quizzes.filter(item=>missed.has(item.id)));quizIndex=0;quizScore=0;quizAnswers=[];renderQuizQuestion()});summary.appendChild(retry);
      const home=el("button","quiz-next","Choose another quiz");home.type="button";home.addEventListener("click",renderQuizHome);summary.appendChild(home);host.appendChild(summary);
    }

    function renderGuides(){
      if(guidesRendered)return;const host=document.getElementById("guidesApp");host.innerHTML="";
      const head=el("div","learning-head"),copy=el("div","");copy.appendChild(el("h2","","Christophe's Godot guides"));copy.appendChild(el("p","","Free interactive guides and downloadable cheatsheets from Christophe's itch.io catalogue."));head.appendChild(copy);host.appendChild(head);
      host.appendChild(el("div","source-note","These itch.io pages do not permit third-party framing. GodotTok shows their catalogue information and opens the selected official page only after you choose it. Their code is not copied into GodotTok's sourced code collection."));
      const grid=el("div","guide-grid");data.guides.forEach(guide=>{const card=el("article","guide-card");card.dataset.guideId=guide.id;card.tabIndex=-1;card.appendChild(el("div","guide-kind",guide.kind+" | "+guide.version));card.appendChild(el("h3","",guide.title));card.appendChild(el("p","",guide.description));const tags=el("div","guide-tags");guide.topics.forEach(topic=>tags.appendChild(badge(topic)));card.appendChild(tags);const link=el("a","","Open on itch.io");link.href=guide.url;link.target="_blank";link.rel="noopener noreferrer";card.appendChild(link);grid.appendChild(card)});host.appendChild(grid);guidesRendered=true;
    }

    function init(){
      if(initialized)return;initialized=true;
      const category=document.getElementById("fcCategory");data.categories.forEach(item=>category.appendChild(new Option(item.name,item.id)));
      document.getElementById("fcAddBtn").addEventListener("click",addCustomCard);
      document.getElementById("fcModeStudy").addEventListener("click",()=>setMode("study"));document.getElementById("fcModeList").addEventListener("click",()=>setMode("list"));document.getElementById("fcModeAdd").addEventListener("click",()=>setMode("add"));
      loadCards();quizProgress=readLocal("gt_quiz_progress",{});
    }

    function activate(id){
      init();
      if(id==="flashcards")renderStudy();
      if(id==="quizzes")renderQuizHome();
      if(id==="guides")renderGuides();
    }

    function openItem(type,id){
      init();
      if(type==="flashcard"){
        const item=cards.find(card=>card.id===id)||data.flashcards.find(card=>card.id===id);
        if(!item)return false;
        filters={category:"all",difficulty:"all"};
        queue=[item];sessionTotal=1;sessionDone=0;
        setMode("study");
        return true;
      }
      if(type==="quiz"){
        const item=data.quizzes.find(quiz=>quiz.id===id);
        if(!item)return false;
        quizQueue=[item];quizIndex=0;quizScore=0;quizAnswers=[];
        renderQuizQuestion();
        return true;
      }
      if(type==="guide"){
        const item=data.guides.find(guide=>guide.id===id);
        if(!item)return false;
        renderGuides();
        document.querySelectorAll(".guide-card.search-target").forEach(card=>card.classList.remove("search-target"));
        const card=[...document.querySelectorAll("[data-guide-id]")].find(item=>item.dataset.guideId===id);
        if(card){
          card.classList.add("search-target");
          card.scrollIntoView({block:"center",behavior:reduceMotion?"auto":"smooth"});
          card.focus({preventScroll:true});
        }
        return true;
      }
      return false;
    }

    return {init,activate,openItem,renderStudy,renderList,renderQuizHome,renderGuides,getSearchItems:()=>({flashcards:cards.length?cards:data.flashcards,quizzes:data.quizzes,guides:data.guides})};
  }

  window.GodotTokLearningUI=Object.freeze({create});
})();
