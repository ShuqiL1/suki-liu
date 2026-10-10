(function(){
  const hero=document.getElementById('hero');
  const nav=document.querySelector('nav');
  if(!hero)return;

  const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer=window.matchMedia('(pointer: fine)');

  function setHeroReady(){
    hero.classList.add('hero-ready');
  }

  function updateHeroScroll(){
    const rect=hero.getBoundingClientRect();
    const height=Math.max(1,rect.height);
    const progress=Math.min(1,Math.max(0,-rect.top/height));
    const isHomeVisible=hero.closest('.home-story')&&getComputedStyle(hero.closest('.home-story')).display!=='none';

    if(nav){
      nav.classList.toggle('nav-solid',!isHomeVisible||progress>0.72);
    }

    if(!reduceMotion.matches){
      hero.style.setProperty('--hero-scroll-shift',`${progress*-26}px`);
      hero.style.setProperty('--hero-scroll-fade',`${1-progress*0.35}`);
      hero.style.setProperty('--hero-scroll-progress',progress.toFixed(3));
    }
  }

  function updatePointer(event){
    if(reduceMotion.matches||!finePointer.matches)return;
    const rect=hero.getBoundingClientRect();
    if(event.clientY<rect.top||event.clientY>rect.bottom)return;
    const x=((event.clientX-rect.left)/Math.max(1,rect.width)-0.5)*2;
    const y=((event.clientY-rect.top)/Math.max(1,rect.height)-0.5)*2;
    hero.style.setProperty('--hero-parallax-x',x.toFixed(3));
    hero.style.setProperty('--hero-parallax-y',y.toFixed(3));
  }

  function resetPointer(){
    hero.style.setProperty('--hero-parallax-x','0');
    hero.style.setProperty('--hero-parallax-y','0');
  }

  window.addEventListener('scroll',updateHeroScroll,{passive:true});
  window.addEventListener('resize',updateHeroScroll);
  window.addEventListener('mousemove',updatePointer,{passive:true});
  hero.addEventListener('mouseleave',resetPointer);

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',setHeroReady,{once:true});
  }else{
    requestAnimationFrame(setHeroReady);
  }

  updateHeroScroll();
})();
