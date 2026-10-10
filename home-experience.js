(function(){
  const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
  const story=document.querySelector('.work-story');
  const visual=document.getElementById('workVisual');
  const progressEl=document.getElementById('workProgress');
  const titleEl=document.getElementById('workTitle');
  const descEl=document.getElementById('workDesc');
  const tagsEl=document.getElementById('workTags');
  const countEl=document.getElementById('workCount');
  const cta=document.getElementById('workCta');
  const cards=[...document.querySelectorAll('#projects .project-card')];
  if(!story||!visual||!progressEl||!cards.length)return;

  const getTarget=card=>{
    const attr=card.getAttribute('onclick')||'';
    const match=attr.match(/showDetail\('([^']+)'\)/);
    return match?match[1]:'';
  };

  const slug=text=>text.toLowerCase().replace(/&[a-z]+;/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');

  const projects=cards.map((card,index)=>{
    const target=getTarget(card);
    const title=card.querySelector('.proj-title')?.textContent?.trim()||`Project ${index+1}`;
    const desc=card.querySelector('.proj-desc')?.textContent?.trim()||'';
    const tags=[...card.querySelectorAll('.ptag')].map(tag=>tag.textContent.trim());
    const image=card.querySelector('.project-media img');
    const source=image?.getAttribute('src')||'';
    return {index,target,title,desc,tags,source,kind:slug(title.split(' ')[0]||title)};
  });

  story.style.setProperty('--project-count',projects.length);

  const panes=projects.map(project=>{
    const pane=document.createElement('div');
    pane.className=`work-pane ${project.kind}`;
    pane.dataset.index=project.index;
    if(project.source){
      const img=document.createElement('img');
      img.src=project.source;
      img.alt='';
      img.loading='lazy';
      img.decoding='async';
      pane.appendChild(img);
    }
    visual.appendChild(pane);
    return pane;
  });

  const buttons=projects.map((project,index)=>{
    const button=document.createElement('button');
    button.type='button';
    button.textContent=String(index+1).padStart(2,'0');
    button.setAttribute('aria-label',`View ${project.title}`);
    button.addEventListener('click',()=>{
      const rect=story.getBoundingClientRect();
      const scrollable=Math.max(1,story.offsetHeight-window.innerHeight);
      const targetY=window.scrollY+rect.top+(scrollable*(projects.length===1?0:index/(projects.length-1)));
      window.scrollTo({top:targetY,behavior:reduceMotion.matches?'auto':'smooth'});
    });
    progressEl.appendChild(button);
    return button;
  });

  let activeIndex=-1;
  let latestProgress=0;
  let ticking=false;

  function setActive(index){
    if(index===activeIndex)return;
    activeIndex=index;
    const project=projects[index];
    titleEl.textContent=project.title;
    descEl.textContent=project.desc;
    countEl.textContent=`${String(index+1).padStart(2,'0')} / ${String(projects.length).padStart(2,'0')}`;
    tagsEl.innerHTML='';
    project.tags.forEach(tag=>{
      const span=document.createElement('span');
      span.textContent=tag;
      tagsEl.appendChild(span);
    });
    cta.onclick=()=>showDetail(project.target);
    buttons.forEach((button,buttonIndex)=>button.classList.toggle('active',buttonIndex===index));
  }

  function update(){
    ticking=false;
    const rect=story.getBoundingClientRect();
    const scrollable=Math.max(1,story.offsetHeight-window.innerHeight);
    const raw=(-rect.top)/scrollable;
    latestProgress=Math.min(1,Math.max(0,raw));
    const position=latestProgress*Math.max(0,projects.length-1);
    const nextIndex=Math.min(projects.length-1,Math.max(0,Math.round(position)));
    setActive(nextIndex);

    panes.forEach((pane,index)=>{
      const delta=index-position;
      const distance=Math.min(1,Math.abs(delta));
      const opacity=reduceMotion.matches?(index===nextIndex?1:0):1-distance;
      pane.style.opacity=opacity.toFixed(3);
      pane.style.transform=reduceMotion.matches
        ? 'none'
        : `translate3d(${delta*18}%,${delta*7}%,0) scale(${1-Math.min(0.16,distance*0.12)})`;
      pane.style.zIndex=String(20-Math.round(distance*10));
    });
  }

  function requestUpdate(){
    if(ticking)return;
    ticking=true;
    requestAnimationFrame(update);
  }

  cards.forEach(card=>{
    card.setAttribute('tabindex','0');
    card.setAttribute('role','button');
    card.addEventListener('keydown',event=>{
      if(event.key==='Enter'||event.key===' '){
        event.preventDefault();
        const target=getTarget(card);
        if(target)showDetail(target);
      }
    });
  });

  window.addEventListener('scroll',requestUpdate,{passive:true});
  window.addEventListener('resize',requestUpdate);
  setActive(0);
  update();
})();
