'use strict';
const labels = {
 'comparison-given':'Given-human camera generation', 'comparison-joint':'Joint human–camera generation',
 'intensity-given':'Given-human', 'intensity-joint':'Joint generation',
 'ood-hml3d-given':'HumanML3D · Given-human', 'ood-hml3d-joint':'HumanML3D · Joint', 'ood-hymotion-given':'HY-Motion · Given-human'
};
const contexts = {
 'comparison-given':'', 'comparison-joint':'',
 'intensity-given':'PulpMotion · Given-human camera generation.',
 'intensity-joint':'PulpMotion · Joint human–camera generation.',
 'ood-hml3d-given':'Ground-truth motions → cameras. Varying translation intensity.',
 'ood-hml3d-joint':'Action text → humans + cameras. Varying translation intensity.',
 'ood-hymotion-given':'Synthesized motions → cameras.'
};
const galleries=[];
function el(tag,cls,text){const x=document.createElement(tag);if(cls)x.className=cls;if(text!==undefined)x.textContent=text;return x;}
function button(text,action){const b=el('button','',text);b.type='button';b.addEventListener('click',action);return b;}
class Gallery {
 constructor(root,options={}){this.root=root;this.keys=root.dataset.categories.split(',');this.key=this.keys[0];this.index=options.index||0;this.embedded=!!options.embedded;this.hideTabs=!!options.hideTabs;this.group=options.group;this.generation=0;this.render();}
 pause(){cancelAnimationFrame(this.syncFrame);this.generation++;this.videos?.forEach(v=>v.pause());if(this.playButton)this.playButton.textContent='Play all';if(this.playing&&this.status)this.status.textContent='Paused';this.playing=false;}
 duration(){return Math.min(...this.videos.map(v=>v.duration).filter(Number.isFinite));}
 updateTimeline(){const d=this.duration(),t=this.videos[0]?.currentTime||0;if(this.timeline&&Number.isFinite(d)){this.timeline.disabled=false;this.timeline.max=d;this.timeline.value=t;this.clock.textContent=`${t.toFixed(1)} / ${d.toFixed(1)} s`;}}
 sync(){if(!this.playing)return;const t=this.videos[0].currentTime,d=this.duration();if(t>=d-0.04){this.pause();this.status.textContent="Playback finished";this.updateTimeline();return;}this.videos.slice(1).forEach(v=>{if(!v.seeking&&Math.abs(v.currentTime-t)>0.08)v.currentTime=t;});this.updateTimeline();this.syncFrame=requestAnimationFrame(()=>this.sync());}
 seek(t){this.pause();this.videos.forEach(v=>{if(Number.isFinite(v.duration))v.currentTime=Math.min(t,v.duration);});this.updateTimeline();}
 async play(restart=false){
  this.pause();galleries.filter(g=>g!==this&&(!this.group||g.group!==this.group)).forEach(g=>g.pause());document.querySelector('#demo-video').pause();
  const token=this.generation;this.playButton.textContent='Loading…';
  try{
   await Promise.all(this.videos.map(v=>v.readyState>=3?Promise.resolve():new Promise((resolve,reject)=>{
    const timeout=setTimeout(()=>{cleanup();reject(new Error('timeout'));},15000);
    const cleanup=()=>{clearTimeout(timeout);v.removeEventListener('canplay',ok);v.removeEventListener('error',bad);};
    const ok=()=>{cleanup();resolve();};const bad=()=>{cleanup();reject(new Error('media'));};
    v.addEventListener('canplay',ok);v.addEventListener('error',bad);if(v.readyState===0)v.load();
   })));
   if(token!==this.generation)return;
   const target=restart||this.videos[0].ended?0:this.videos[0].currentTime;this.videos.forEach(v=>v.currentTime=target);
   await Promise.all(this.videos.map(v=>v.play()));
   if(token!==this.generation){this.videos.forEach(v=>v.pause());return;}
   this.playing=true;this.playButton.textContent='Pause all';this.status.textContent='Playing together';this.sync();
  }catch(e){if(token===this.generation){this.pause();this.status.textContent='Playback could not start. Press Play all to retry.';}}
 }
 render(){
  this.pause();this.root.replaceChildren();if(!this.embedded&&!this.hideTabs){const tabs=el('div','tabs');tabs.setAttribute('aria-label','Example categories');
  this.keys.forEach(k=>{const b=button(labels[k],()=>{this.key=k;this.index=0;this.render();});b.setAttribute('aria-pressed',String(k===this.key));tabs.append(b);});this.root.append(tabs);if(contexts[this.key])this.root.append(el('p','gallery-context',contexts[this.key]));
  }
  const list=window.AESOP_EXAMPLES[this.key],sample=list[this.index];if(!this.embedded&&list.length>1){const bar=el('div','gallery-toolbar'),pager=el('div','sample-nav');
  const prev=button('←',()=>{this.index--;this.render();});prev.disabled=this.index===0;prev.setAttribute('aria-label','Previous example');
  const next=button('→',()=>{this.index++;this.render();});next.disabled=this.index===list.length-1;next.setAttribute('aria-label','Next example');
  const count=el('span','counter',`Example ${this.index+1} / ${list.length}`);count.setAttribute('aria-live','polite');pager.append(prev,count,next);
  bar.append(pager);this.root.append(bar);}else if(this.embedded){this.root.append(el('h3','sample-title',`Sample ${this.index+1}`));}
  const prompts=el('div','prompts');for(const [key,label] of [['human','Human'],['camera','Camera']]){const p=el('p');p.append(el('b','',label+':'),document.createTextNode(sample[key]));prompts.append(p);}this.root.append(prompts);
  const grid=el('div','video-grid');grid.style.setProperty('--columns',sample.methods.length);this.videos=[];
  sample.methods.forEach(m=>{
   const f=el('figure','video-cell');const caption=el('figcaption','',m.name);if(Number.isFinite(m.net_displacement_m))caption.append(el('span','net-displacement',`Net displacement: ${m.net_displacement_m.toFixed(2)} m`));f.append(caption);
   ['Global','Projection'].forEach(label=>{
    const view=m.views.find(v=>v.label===label);const wrap=el('div','view-panel');wrap.append(el('span','view-label',label));
    const v=el('video');v.controls=false;v.disablePictureInPicture=true;v.muted=true;v.playsInline=true;v.preload='none';v.poster=view.poster;v.src=view.payload;
    v.setAttribute('aria-label',`${m.name}, ${label.toLowerCase()} view, example ${this.index+1}`);
    v.addEventListener('loadedmetadata',()=>this.updateTimeline());
    v.addEventListener('waiting',()=>{if(this.playing){this.pause();this.status.textContent='Buffering — press Play all to resume together.';}});
    v.addEventListener('ended',()=>{if(this.playing){this.pause();this.updateTimeline();this.status.textContent='Playback finished';}});
    v.addEventListener('error',()=>{this.status.textContent='A video could not load. Please reload or try another example.';});
    this.videos.push(v);if(label==='Projection'){const frame=el('div','film-frame');frame.append(v);wrap.append(frame);}else{wrap.append(v);}f.append(wrap);
   });grid.append(f);
  });this.root.append(grid);
  const playback=el('div','playback');this.status=el('span','','');this.status.setAttribute('role','status');this.playButton=button('Play all',()=>this.playing?this.pause():this.play());const reset=button('Restart',()=>this.play(true));this.timeline=el('input','group-timeline');this.timeline.type='range';this.timeline.min=0;this.timeline.max=1;this.timeline.step=0.01;this.timeline.value=0;this.timeline.disabled=true;this.timeline.setAttribute('aria-label','Seek all videos in this sample');this.timeline.addEventListener('input',()=>this.seek(Number(this.timeline.value)));this.clock=el('output','group-clock','0.0 s');playback.append(this.playButton,reset,this.timeline,this.clock,this.status);this.root.append(playback);
 }
}
document.querySelectorAll('.gallery:not(#external-gallery)').forEach(root=>galleries.push(new Gallery(root)));
const external=document.querySelector('#external-gallery');
let externalKey=external.dataset.categories.split(',')[0];let externalPage=0;
function renderExternal(){
 const old=galleries.filter(g=>g.group===external);
 old.forEach(g=>{g.pause();galleries.splice(galleries.indexOf(g),1);});
 external.replaceChildren();const tabs=el('div','tabs');tabs.setAttribute('aria-label','External example categories');
 external.dataset.categories.split(',').forEach(key=>{const b=button(labels[key],()=>{externalKey=key;externalPage=0;renderExternal();});b.setAttribute('aria-pressed',String(key===externalKey));tabs.append(b);});
 external.append(tabs,el('p','gallery-context',contexts[externalKey]));
 if(externalKey.startsWith('ood-hml3d')){const root=el('div','external-intensity');root.dataset.categories=externalKey;external.append(root);galleries.push(new Gallery(root,{hideTabs:true,group:external}));return;}
 const items=window.AESOP_EXAMPLES[externalKey];
 if(items.length>2){const pager=el('div','gallery-toolbar');const prev=button('←',()=>{externalPage--;renderExternal();});prev.disabled=externalPage===0;prev.setAttribute('aria-label','Previous examples');const next=button('→',()=>{externalPage++;renderExternal();});next.disabled=(externalPage+1)*2>=items.length;next.setAttribute('aria-label','Next examples');pager.append(prev,el('span','counter',`Examples ${externalPage*2+1}–${Math.min(externalPage*2+2,items.length)} / ${items.length}`),next);external.append(pager);}
 const pair=el('div','external-pair');
 items.slice(externalPage*2,externalPage*2+2).forEach((sample,localIndex)=>{const index=externalPage*2+localIndex;
  const root=el('section','external-sample');root.dataset.categories=externalKey;root.setAttribute('aria-label',`Sample ${index+1}`);pair.append(root);
  galleries.push(new Gallery(root,{index,embedded:true,group:external}));
 });external.append(pair);
}
renderExternal();
const demo=document.querySelector('#demo-video');demo.addEventListener('play',()=>galleries.forEach(g=>g.pause()));
document.querySelectorAll('[data-time]').forEach(b=>b.addEventListener('click',()=>{const seek=()=>{demo.currentTime=Number(b.dataset.time);demo.play().catch(()=>{});};if(demo.readyState){seek();}else{demo.addEventListener('loadedmetadata',seek,{once:true});demo.load();}}));
document.addEventListener('visibilitychange',()=>{if(document.hidden){demo.pause();galleries.forEach(g=>g.pause());}});
document.querySelector('#copy-citation').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(document.querySelector('#bibtex').textContent);document.querySelector('#copy-status').textContent='BibTeX copied.';}catch{document.querySelector('#copy-status').textContent='Select and copy the BibTeX text above.';}});
