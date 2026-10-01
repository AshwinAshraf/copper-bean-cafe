/* The Copper Bean: menu, video, tabs, opening hours, form validation and scroll animations */
(function(){
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Mobile menu */
  var t=document.querySelector('.nav-toggle'), n=document.getElementById('site-nav');
  function setNav(o){n.classList.toggle('open',o);t.setAttribute('aria-expanded',o?'true':'false');t.setAttribute('aria-label',o?'Close menu':'Open menu');}
  t.addEventListener('click',function(){setNav(!n.classList.contains('open'));});
  n.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){setNav(false);});});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&n.classList.contains('open')){setNav(false);t.focus();}});

  /* Hero video: respect reduced motion, allow pause */
  var hv=document.getElementById('hero-video'), vc=document.querySelector('.video-ctrl');
  function setPaused(p){if(p){hv.pause();}else{var pr=hv.play();if(pr&&pr.catch)pr.catch(function(){});}vc.setAttribute('aria-pressed',p?'true':'false');vc.setAttribute('aria-label',p?'Play background video':'Pause background video');}
  if(reduce){hv.removeAttribute('autoplay');setPaused(true);}
  vc.addEventListener('click',function(){setPaused(!hv.paused);});

  /* Lazy videos: load + play only when visible, pause when off-screen */
  var lazy=document.querySelectorAll('.lazy-video');
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        var v=en.target;
        if(en.isIntersecting){
          if(!v.dataset.loaded){v.querySelectorAll('source[data-src]').forEach(function(s){s.src=s.dataset.src;});v.load();v.dataset.loaded='1';}
          if(!reduce){var p=v.play();if(p&&p.catch)p.catch(function(){});}
        }else{v.pause();}
      });
    },{rootMargin:'200px 0px'});
    lazy.forEach(function(v){io.observe(v);});
  }

  /* Menu tabs (keyboard: arrows, Home, End) */
  var tabs=[].slice.call(document.querySelectorAll('[role="tab"]'));
  function select(tab){
    tabs.forEach(function(x){var on=x===tab;x.setAttribute('aria-selected',on);x.tabIndex=on?0:-1;document.getElementById(x.getAttribute('aria-controls')).hidden=!on;});
    if(window.gsap&&!reduce){gsap.fromTo('#'+tab.getAttribute('aria-controls')+' .menu-card',{y:24,opacity:0},{y:0,opacity:1,duration:.45,stagger:.07,ease:'back.out(1.4)',clearProps:'transform'});}
  }
  tabs.forEach(function(tab,i){
    tab.addEventListener('click',function(){select(tab);});
    tab.addEventListener('keydown',function(e){var k=e.key,j=null;if(k==='ArrowRight')j=(i+1)%tabs.length;if(k==='ArrowLeft')j=(i-1+tabs.length)%tabs.length;if(k==='Home')j=0;if(k==='End')j=tabs.length-1;if(j!==null){e.preventDefault();tabs[j].focus();select(tabs[j]);}});
  });

  /* Open now */
  (function(){
    var hrs={0:[9,15],1:[7.5,17],2:[7.5,17],3:[7.5,17],4:[7.5,17],5:[7.5,17],6:[8.5,17]};
    var d=new Date(),day=d.getDay(),h=d.getHours()+d.getMinutes()/60,r=hrs[day];
    var open=h>=r[0]&&h<r[1];
    var pill=document.getElementById('open-pill'),txt=document.getElementById('open-text');
    pill.classList.toggle('is-open',open);
    function fmt(x){var hh=Math.floor(x),mm=Math.round((x-hh)*60);return hh+':'+(mm<10?'0':'')+mm;}
    txt.textContent=open?('Open now · until '+fmt(r[1])):(h<r[0]?('Opens today at '+fmt(r[0])):'Closed now');
    document.querySelectorAll('.hours tr').forEach(function(tr){if(tr.dataset.days.split(',').indexOf(String(day))>-1)tr.classList.add('today');});
  })();

  /* Form validation */
  document.querySelectorAll('form.enquiry').forEach(function(form){
    var summary=document.createElement('div');summary.className='err-summary';summary.setAttribute('role','alert');summary.tabIndex=-1;summary.hidden=true;form.insertBefore(summary,form.firstChild);
    var fields=form.querySelectorAll('[required]');
    function labelFor(f){var l=form.querySelector('label[for="'+f.id+'"]');return l?l.childNodes[0].textContent.trim().toLowerCase():'this field';}
    function check(f){
      var err=document.getElementById(f.id+'-err');
      if(!err){err=document.createElement('p');err.id=f.id+'-err';err.className='field-err';f.insertAdjacentElement('afterend',err);}
      var v=f.validity,m='';
      if(v.valueMissing)m=(f.type==='date'?'Choose a ':'Enter your ')+labelFor(f);else if(v.typeMismatch||v.badInput)m='Enter a valid '+labelFor(f);
      err.textContent=m;err.hidden=!m;
      if(m){f.setAttribute('aria-invalid','true');f.setAttribute('aria-describedby',err.id);}else{f.removeAttribute('aria-invalid');f.removeAttribute('aria-describedby');}
      return m;
    }
    fields.forEach(function(f){f.addEventListener('blur',function(){if(f.value||f.getAttribute('aria-invalid'))check(f);});f.addEventListener('input',function(){if(f.getAttribute('aria-invalid'))check(f);});});
    form.addEventListener('submit',function(e){
      e.preventDefault();
      var problems=[];fields.forEach(function(f){var m=check(f);if(m)problems.push([f,m]);});
      if(problems.length){
        summary.innerHTML='';var h=document.createElement('p');h.className='err-title';h.textContent='There is a problem';summary.appendChild(h);
        var ul=document.createElement('ul');problems.forEach(function(p){var li=document.createElement('li');var a=document.createElement('a');a.href='#'+p[0].id;a.textContent=p[1];a.addEventListener('click',function(ev){ev.preventDefault();p[0].focus();});li.appendChild(a);ul.appendChild(li);});
        summary.appendChild(ul);summary.hidden=false;summary.focus();return;
      }
      var ok=document.createElement('div');ok.className='form-ok';ok.setAttribute('role','status');ok.tabIndex=-1;
      ok.innerHTML='<svg width="72" height="72" viewBox="0 0 120 130" aria-hidden="true"><path d="M22 52h76v22a38 38 0 0 1-76 0z" fill="#FFF7EC" stroke="#3B2314" stroke-width="4"/><path d="M98 60h8a12 12 0 0 1 0 24h-10" fill="none" stroke="#3B2314" stroke-width="4"/><path d="M44 74l10 10 22-22" fill="none" stroke="#B4541A" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></svg><p class="ok-title">Thank you!</p><p>Your enquiry is on its way. This is a sample site, so nothing was actually sent.</p>';
      form.replaceWith(ok);ok.focus();
    });
  });

  /* Motion (GSAP). Content stays visible if GSAP fails or motion is reduced. */
  if(reduce||!window.gsap||!window.ScrollTrigger){document.documentElement.classList.remove('js');return;}
  gsap.registerPlugin(ScrollTrigger);

  // Hero entrance
  var tl=gsap.timeline({defaults:{ease:'back.out(1.6)'}});
  tl.fromTo('.eyebrow',{opacity:0,scale:.6,rotate:-12},{opacity:1,scale:1,rotate:-2,duration:.5})
    .from('.hero h1 .word',{y:60,opacity:0,rotate:6,duration:.6,stagger:.08},'-=.2')
    .from('.hero .draw',{strokeDasharray:300,strokeDashoffset:300,duration:.8,ease:'power2.out'},'-=.2')
    .fromTo('.hero .lead, .hero .cta-row',{opacity:0,y:20},{opacity:1,y:0,duration:.5,stagger:.1,ease:'power2.out'},'-=.6')
    .from('.video-window',{scale:.85,opacity:0,duration:.7},'-=.8')
    .from('.sticker',{scale:0,duration:.4,stagger:.12},'-=.3')
    .from('.cup-mini',{y:40,opacity:0,rotate:-30,duration:.6},'-=.4');
  gsap.to('.cup-mini',{y:-10,duration:2.2,ease:'sine.inOut',yoyo:true,repeat:-1,delay:1.6});

  // Parallax on decorative layers only
  gsap.utils.toArray('.parallax').forEach(function(el){
    gsap.to(el,{y:Number(el.dataset.speed||-20),ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:.5}});
  });

  // Generic reveals
  gsap.utils.toArray('.reveal').forEach(function(el){
    if(el.closest('.hero'))return;
    gsap.fromTo(el,{opacity:0,y:28},{opacity:1,y:0,duration:.7,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 88%'}});
  });

  // Card stagger
  ScrollTrigger.batch('.reveal-card',{start:'top 90%',onEnter:function(b){gsap.fromTo(b,{opacity:0,y:40,scale:.94,rotate:-1.5},{opacity:1,y:0,scale:1,rotate:0,duration:.6,stagger:.08,ease:'back.out(1.4)',overwrite:true,clearProps:'transform'});}});
  gsap.set('.reveal-card',{opacity:0});

  // Bean-to-cup progress line drawn by scroll
  gsap.fromTo('.steps-wrap .progress',{scaleY:0},{scaleY:1,ease:'none',scrollTrigger:{trigger:'.steps',start:'top 70%',end:'bottom 60%',scrub:.4}});
  gsap.utils.toArray('.step .num').forEach(function(num){
    gsap.from(num,{scale:0,rotate:-90,duration:.5,ease:'back.out(2)',scrollTrigger:{trigger:num,start:'top 75%'}});
  });

  // Polaroids drift apart on scroll
  gsap.to('.polaroid.p1',{rotate:-10,x:-12,ease:'none',scrollTrigger:{trigger:'.polaroids',start:'top bottom',end:'bottom top',scrub:.6}});
  gsap.to('.polaroid.p2',{rotate:9,x:12,ease:'none',scrollTrigger:{trigger:'.polaroids',start:'top bottom',end:'bottom top',scrub:.6}});

  // Footer wave bob
  gsap.from('footer .wave',{yPercent:60,ease:'none',scrollTrigger:{trigger:'footer',start:'top bottom',end:'top 70%',scrub:true}});
})();
