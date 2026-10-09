'use strict';
(() => {
 const controls=[...document.querySelectorAll('[data-layout]')];
 const nav=document.querySelector('.nav');
 const menu=document.querySelector('.menu-toggle');
 const links=[...nav.querySelectorAll('#contents-links a')];
 function apply(layout,updateURL=false){
  const left=layout==='left';document.body.classList.toggle('layout-left',left);
  document.body.classList.remove('menu-open');menu.setAttribute('aria-expanded','false');
  controls.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.layout===(left?'left':'top'))));
  if(updateURL){const url=new URL(location.href);url.searchParams.set('nav',left?'left':'top');history.replaceState(null,'',url);}
 }
 apply(new URLSearchParams(location.search).get('nav'));
 controls.forEach(b=>b.addEventListener('click',()=>apply(b.dataset.layout,true)));
 window.addEventListener('popstate',()=>apply(new URLSearchParams(location.search).get('nav')));
 menu.addEventListener('click',()=>{const open=document.body.classList.toggle('menu-open');menu.setAttribute('aria-expanded',String(open));});
 links.forEach(a=>a.addEventListener('click',()=>{document.body.classList.remove('menu-open');menu.setAttribute('aria-expanded','false');}));
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){document.body.classList.remove('menu-open');menu.setAttribute('aria-expanded','false');}});
 const sections=links.map(a=>document.querySelector(a.getAttribute('href')));
 let queued=false;
 function update(){queued=false;let index=0;sections.forEach((s,i)=>{if(s.getBoundingClientRect().top<=150)index=i;});if(innerHeight+scrollY>=document.documentElement.scrollHeight-8)index=sections.length-1;links.forEach((a,i)=>{if(i===index)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});}
 addEventListener('scroll',()=>{if(!queued){queued=true;requestAnimationFrame(update);}},{passive:true});addEventListener('resize',update);update();
})();
