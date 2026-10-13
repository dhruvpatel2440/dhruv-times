(function(){
  var $=function(s,r){return (r||document).querySelector(s)}, $$=function(s,r){return [].slice.call((r||document).querySelectorAll(s))};
  var reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;

  // ===== live content from Supabase (read-only public key; falls back to the built-in content) =====
  var CFG=window.DT_CONFIG||{}, contentP=null, CONTACT_EMAIL='dhruvkhirsariya590@gmail.com';
  if(CFG.supabaseAnonKey&&/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(CFG.supabaseUrl||'')){
    var sbBase=CFG.supabaseUrl.replace(/\/$/,'')+'/rest/v1/', sbHdr={apikey:CFG.supabaseAnonKey,Authorization:'Bearer '+CFG.supabaseAnonKey};
    var sbGet=function(q){return fetch(sbBase+q,{headers:sbHdr,cache:'no-store',credentials:'omit'}).then(function(r){if(!r.ok)throw new Error('HTTP '+r.status);return r.json()})};
    var pub='&published=eq.true&order=sort.asc';
    contentP=Promise.race([
      Promise.all([sbGet('settings?select=*&id=eq.1&published=eq.true'),sbGet('projects?select=*'+pub),sbGet('certificates?select=*'+pub),
                   sbGet('courses?select=*'+pub),sbGet('press_cards?select=*'+pub),sbGet('skill_groups?select=*'+pub),sbGet('timeline?select=*'+pub)]),
      new Promise(function(_,rej){setTimeout(function(){rej(new Error('timeout'))},8000)})
    ]);
  }
  // only http(s), mailto or site-relative links ever reach an href/src
  function safeUrl(u){u=String(u==null?'':u).trim();return (/^(https?:\/\/|mailto:)/i.test(u)||/^[A-Za-z0-9_./#-][^:]*$/.test(u))?u:'#'}

  // intro curtain
  var intro=$('#intro');
  setTimeout(function(){intro.classList.add('go');setTimeout(function(){intro.remove()},1000)},reduce?0:1900);

  // masthead letters drop in
  var m=$('#mast'), t=m.textContent, out='', i=0;
  $$('#mast').forEach(function(){});
  m.innerHTML='';
  function addWord(w,cls){
    var s=document.createElement('span'); s.className='w'+(cls?' '+cls:'');
    w.split('').forEach(function(c){var l=document.createElement('span');l.className='l';l.textContent=c;l.style.animationDelay=(2+i*.07)+'s';i++;s.appendChild(l)});
    m.appendChild(s);
  }
  addWord('The'); m.appendChild(document.createTextNode(' ')); addWord('Dhruv','p'); m.appendChild(document.createTextNode(' ')); addWord('Times');

  // typewriter
  var phrases=['CS Student','Security Researcher','Ethical Hacker','Full-Stack Builder'], pi=0, ci=0, del=false, el=$('#type');
  (function tick(){
    var p=phrases[pi];
    el.textContent=p.slice(0,ci);
    if(!del&&ci<p.length){ci++;setTimeout(tick,95)}
    else if(!del){del=true;setTimeout(tick,1500)}
    else if(ci>0){ci--;setTimeout(tick,45)}
    else{del=false;pi=(pi+1)%phrases.length;setTimeout(tick,300)}
  })();

  // terminal interests typewriter
  var tInt=['ethical hacking','network security','ctf challenges','full-stack dev','embedded systems'], ti=0, tc=0, tdel=false, tEl=$('#termOut');
  if(tEl&&!reduce)(function ttick(){
    var p=tInt[ti];
    tEl.textContent=p.slice(0,tc);
    if(!tdel&&tc<p.length){tc++;setTimeout(ttick,80)}
    else if(!tdel){tdel=true;setTimeout(ttick,1300)}
    else if(tc>0){tc--;setTimeout(ttick,40)}
    else{tdel=false;ti=(ti+1)%tInt.length;setTimeout(ttick,250)}
  })();

  // ticker
  var news=['Breaking: CyberKavach events draw 300+ participants','Dhruv open to internships and collaborations','Kali Linux sightings reported at CHARUSAT','Ethical hacking: now trending','POS billing system goes live','SentinelCore spots trouble on the wire','Patel Farshan now taking orders online','Now studying: CCNA and Google Cloud Cybersecurity'];
  var h=news.map(function(n){return n+'<b>&#9670;</b>'}).join('');
  $('#tk').innerHTML=h+h;

  // progress + parallax + active nav
  var bar=$('#bar'), navEl=$('#nav'), links=$$('nav a'), secs=links.map(function(a){return $(a.getAttribute('href'))}), curNav=-1;
  function onScroll(){
    var y=scrollY, max=document.documentElement.scrollHeight-innerHeight;
    bar.style.transform='scaleX('+(max>0?y/max:0)+')';
    document.documentElement.style.setProperty('--sy',y);
    var cur=0; secs.forEach(function(s,k){if(s&&s.getBoundingClientRect().top<innerHeight*.4)cur=k});
    links.forEach(function(a,k){a.classList.toggle('on',k===cur)});
    if(cur!==curNav){
      curNav=cur;
      if(navEl&&innerWidth<=700&&links[cur]){
        var l=links[cur], target=l.offsetLeft-(navEl.clientWidth/2)+(l.clientWidth/2);
        navEl.scrollTo({left:Math.max(0,target),behavior:reduce?'auto':'smooth'});
      }
    }
  }
  addEventListener('scroll',onScroll,{passive:true}); onScroll();

  // reveal + counters
  function count(el){
    var to=parseFloat(el.dataset.n), d=parseInt(el.dataset.d||0), s=el.dataset.s||'', st=performance.now(), dur=1400;
    (function f(now){var p=Math.min((now-st)/dur,1), e=1-Math.pow(1-p,3);el.textContent=(to*e).toFixed(d)+(p===1?s:'');if(p<1)requestAnimationFrame(f)})(st);
  }
  var io=new IntersectionObserver(function(es){es.forEach(function(e){
    if(e.isIntersecting){if(!e.target.classList.contains('in')){e.target.classList.add('in'); $$('[data-n]',e.target).forEach(count)} io.unobserve(e.target)}
  })},{threshold:0,rootMargin:'0px 0px -15% 0px'});
  $$('.rv').forEach(function(n){io.observe(n)});


  // staggered reveals
  var io2=new IntersectionObserver(function(es){es.forEach(function(e){
    if(e.isIntersecting){var n=e.target;n.classList.add('in');io2.unobserve(n);setTimeout(function(){n.classList.add('done')},(parseInt(n.style.getPropertyValue('--i'))||0)*120+1100)}
  })},{threshold:.12,rootMargin:'0px 0px -6% 0px'});
  function stagger(sel){
    $$(sel).forEach(function(parent){
      $$(':scope > *',parent).forEach(function(c,k){
        if(c.classList.contains('st')||c.classList.contains('scribble'))return;
        c.classList.add('st');c.style.setProperty('--i',k%4);io2.observe(c);
      });
    });
  }
  ['.cols','.stats','.class','.grid-poster','#about .term'].forEach(function(s){ if(s==='#about .term'){var t=$(s);if(t){t.classList.add('st');io2.observe(t)}} else stagger(s) });
  $$('.ransom span:not(.sep)').forEach(function(n,k){n.style.setProperty('--j',k)});

  // sound removed: silent stub so existing calls (stamp, crossword, stickers) stay harmless
  var root2=document.documentElement;
  var sfx={on:false,set:function(){},wake:function(){},clack:function(){},pick:function(){},rustle:function(){},thunk:function(){}};

  // scroll-linked: sticker parallax + drag, fold-out page, film reel
  var stk=$$('.sticker').map(function(el,k){return {el:el,par:el.parentElement,f:el.dataset.np?0:(0.05+(k%4)*0.025)*(k%2?-1:1),py:0,dx:0,dy:0,vx:0,vy:0,flag:el.dataset.flag?$('#'+el.dataset.flag):null}}), ticking=false;
  function applyS(o){o.el.style.translate=o.dx.toFixed(1)+'px '+(o.py+o.dy).toFixed(1)+'px'; if(o.flag)o.flag.classList.toggle('exposed',Math.hypot(o.dx,o.dy)>30)}
  var poster=$('.grid-poster'), pin=$('.film-pin'), fstick=$('.film-sticky'), ftrack=$('.film-track'), filmOn=false, fdist=0;
  function filmSize(){
    if(!pin)return;
    filmOn=!reduce; pin.classList.toggle('film-static',!filmOn);
    if(filmOn){var nh=navEl.offsetHeight;fstick.style.top=nh+'px';fstick.style.height=(innerHeight-nh)+'px';fdist=Math.max(0,ftrack.scrollWidth-innerWidth);pin.style.height=(innerHeight-nh+fdist)+'px'}
    else{pin.style.height='';fstick.style.height='';ftrack.style.transform=''}
  }
  function revealCheck(){
    $$('.rv:not(.in)').forEach(function(n){if(n.getBoundingClientRect().top<innerHeight*.85){n.classList.add('in');$$('[data-n]',n).forEach(count)}});
    $$('.st:not(.in)').forEach(function(n){var r=n.getBoundingClientRect();if(r.top<innerHeight*.92&&r.bottom>0){n.classList.add('in');setTimeout(function(){n.classList.add('done')},(parseInt(n.style.getPropertyValue('--i'))||0)*120+1100)}});
  }
  function motion(){
    ticking=false;
    revealCheck();
    if(!reduce&&innerWidth>700)stk.forEach(function(o){
      if(!o.f)return; var r=o.par.getBoundingClientRect(); if(r.bottom<-200||r.top>innerHeight+200)return;
      var d=(r.top+r.height/2-innerHeight/2)*o.f; o.py=Math.max(-34,Math.min(34,d)); applyS(o);
    });
    if(poster&&!reduce){var pr=poster.getBoundingClientRect(),fo=(pr.top-innerHeight*.45)/(innerHeight*.45);poster.style.setProperty('--fold',Math.max(0,Math.min(1,fo)).toFixed(3))}
    if(filmOn){var r=pin.getBoundingClientRect(),nh=navEl.offsetHeight,tot=pin.offsetHeight-(innerHeight-nh),fp=Math.max(0,Math.min(1,(nh-r.top)/(tot||1)));
      ftrack.style.transform='translateX('+(-fp*fdist).toFixed(1)+'px)';fstick.style.setProperty('--fp',fp.toFixed(3))}
  }
  addEventListener('scroll',function(){if(!ticking){ticking=true;requestAnimationFrame(motion)}},{passive:true});
  addEventListener('resize',function(){filmSize();motion()}); addEventListener('load',function(){filmSize();motion()}); filmSize(); motion();

  // draggable stickers that spring back
  stk.forEach(function(o){
    var sx=0,sy=0,linger=0,raf=0;
    function spring(){
      o.vx+=-.07*o.dx-.16*o.vx; o.vy+=-.07*o.dy-.16*o.vy; o.dx+=o.vx; o.dy+=o.vy; applyS(o);
      if(Math.abs(o.dx)+Math.abs(o.dy)+Math.abs(o.vx)+Math.abs(o.vy)>.2)raf=requestAnimationFrame(spring); else{o.dx=o.dy=0;applyS(o)}
    }
    o.el.addEventListener('pointerdown',function(e){
      e.preventDefault();clearTimeout(linger);cancelAnimationFrame(raf);o.el.setPointerCapture(e.pointerId);
      sx=e.clientX-o.dx;sy=e.clientY-o.dy;o.drag=true;o.el.classList.add('held');sfx.pick();
    });
    o.el.addEventListener('pointermove',function(e){if(!o.drag)return;o.dx=e.clientX-sx;o.dy=e.clientY-sy;applyS(o)});
    function drop(){if(!o.drag)return;o.drag=false;o.el.classList.remove('held');o.vx=o.vy=0;linger=setTimeout(function(){raf=requestAnimationFrame(spring)},o.flag?2500:900)}
    o.el.addEventListener('pointerup',drop);o.el.addEventListener('pointercancel',drop);
  });

  // ===== extra flair =====
  var fine=matchMedia('(hover:hover) and (pointer:fine)').matches;

  // decrypt-scramble section titles
  var glyphs='!<>-_\\/[]{}=+*^?#01$%&';
  function scramble(node){
    var tn=[],w=document.createTreeWalker(node,NodeFilter.SHOW_TEXT);while(w.nextNode())tn.push(w.currentNode);
    tn.forEach(function(t){
      var orig=t.nodeValue, st=performance.now(), dur=900+Math.random()*300;
      (function f(now){var p=Math.min((now-st)/dur,1),out='';
        for(var i=0;i<orig.length;i++){var c=orig[i];out+=(c===' '||i/orig.length<p)?c:glyphs[Math.random()*glyphs.length|0]}
        t.nodeValue=out; if(p<1)requestAnimationFrame(f); else t.nodeValue=orig;})(st);
    });
  }
  if(!reduce){var io3=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){var n=e.target;setTimeout(function(){scramble(n)},150);io3.unobserve(n)}})},{threshold:.6});
    $$('.sec-title').forEach(function(t){io3.observe(t)});}

  // ink splats, magnetic buttons, card tilt
  if(fine&&!reduce){
    var inks=['var(--purple)','var(--red)','var(--ink)','var(--yellow)'];
    addEventListener('mousedown',function(e){
      if(e.target.closest('.sticker'))return;
      var c=inks[Math.random()*inks.length|0], d='<circle cx="45" cy="45" r="'+(10+Math.random()*6).toFixed(1)+'"/>';
      for(var k=0;k<7;k++){var a=Math.random()*6.28,r=18+Math.random()*24;d+='<circle cx="'+(45+Math.cos(a)*r).toFixed(1)+'" cy="'+(45+Math.sin(a)*r).toFixed(1)+'" r="'+(1.5+Math.random()*4).toFixed(1)+'"/>'}
      var sp=document.createElement('div');sp.className='splat';sp.style.left=e.clientX+'px';sp.style.top=e.clientY+'px';
      sp.innerHTML='<svg viewBox="0 0 90 90" width="90" height="90" style="fill:'+c+';rotate:'+(Math.random()*360|0)+'deg">'+d+'</svg>';
      document.body.appendChild(sp);setTimeout(function(){sp.remove()},950);
    });

    // magnetic buttons
    $$('.btn,.toggle').forEach(function(b){
      b.addEventListener('mousemove',function(e){var r=b.getBoundingClientRect();b.style.translate=((e.clientX-r.left-r.width/2)*.3).toFixed(1)+'px '+((e.clientY-r.top-r.height/2)*.4).toFixed(1)+'px'});
      b.addEventListener('mouseleave',function(){b.style.translate=''});
    });

    // 3D tilt on project clippings
    $$('.clip-card').forEach(bindTilt);
  }
  function bindTilt(c){
    if(!fine||reduce||c.dataset.tilt)return;c.dataset.tilt=1;
    {
      c.addEventListener('mousemove',function(e){var r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
        c.classList.add('tilting');c.style.transform='perspective(700px) rotateY('+(x*16).toFixed(1)+'deg) rotateX('+(-y*16).toFixed(1)+'deg) translateY(-8px) scale(1.03)'});
      c.addEventListener('mouseleave',function(){c.classList.remove('tilting');c.style.transform=''});
    }
  }

  // velocity marquee + polaroid scroll tilt
  var rows=$$('.mq .row').map(function(r){return {el:r,x:0,dir:+r.dataset.dir}}), lastY=scrollY, vel=0, heroEl=$('.hero');
  (function mq(){
    var y=scrollY; vel+=((y-lastY)-vel)*.15; lastY=y;
    if(!reduce)rows.forEach(function(o){
      var half=o.el.scrollWidth/2; o.x-=(0.6+Math.abs(vel)*.35)*o.dir*(vel<-0.5?-1:1);
      if(o.x<=-half)o.x+=half; if(o.x>0)o.x-=half;
      o.el.style.transform='translateX('+o.x.toFixed(1)+'px)';
    });
    if(heroEl&&!reduce){var r=heroEl.getBoundingClientRect(),p=Math.max(0,Math.min(1,(innerHeight*.35-r.top)/r.height));heroEl.style.setProperty('--pr',p.toFixed(3))}
    requestAnimationFrame(mq);
  })();

  // HACK mode easter egg
  var hk=$('#hack'),cv=$('#hack canvas'),buf='',raf=0,hideT=0;
  function hackOn(){
    if(hk.classList.contains('on'))return;
    hk.classList.add('on');
    var ctx=cv.getContext('2d'),W=cv.width=innerWidth,H=cv.height=innerHeight,fs=16,cols=Math.ceil(W/fs),drops=[];
    for(var i=0;i<cols;i++)drops[i]=Math.random()*-40;
    (function rain(){ctx.fillStyle='rgba(5,8,5,.12)';ctx.fillRect(0,0,W,H);ctx.fillStyle='#8fe3a1';ctx.font=fs+'px monospace';
      for(var i=0;i<cols;i++){ctx.fillText('01DHRUV#$<>'[Math.random()*11|0],i*fs,drops[i]*fs);if(drops[i]*fs>H&&Math.random()>.97)drops[i]=0;drops[i]++}
      raf=requestAnimationFrame(rain)})();
    hideT=setTimeout(hackOff,4200);
  }
  function hackOff(){hk.classList.remove('on');cancelAnimationFrame(raf);clearTimeout(hideT)}
  hk.addEventListener('click',hackOff);
  $('#psst').addEventListener('click',hackOn);
  addEventListener('keydown',function(e){
    if(e.key==='Escape')return hackOff();
    if(/input|textarea/i.test(e.target.tagName)||e.key.length!==1)return;
    buf=(buf+e.key.toLowerCase()).slice(-4); if(buf==='hack')hackOn();
  });

  // photo tilt
  var fr=$('#frame');
  if(fr&&!reduce){
    fr.addEventListener('mousemove',function(e){var r=fr.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;fr.style.transform='rotateY('+x*14+'deg) rotateX('+(-y*14)+'deg)'});
    fr.addEventListener('mouseleave',function(){fr.style.transform=''});
  }

  // 4 daily edition dateline
  (function(){
    var d=new Date(), h=d.getHours(), start=new Date(d.getFullYear(),0,0), doy=Math.floor((d-start)/864e5);
    var roman=['I','II','III','IV','V','VI','VII','VIII','IX','X'][Math.max(0,Math.min(9,d.getFullYear()-2024))];
    $('#dlDate').textContent=d.toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
    $('#dlEd').textContent=(h<12?'Morning':h<18?'Afternoon':'Late City')+' Edition · Vol. '+roman+' · No. '+String(doy).padStart(3,'0');
  })();

  // 3 redactions: tap to declassify on touch
  $$('.redact').forEach(function(r){r.addEventListener('click',function(){r.classList.toggle('open');sfx.clack()})});

  // 5 crossword
  var XW=[{n:1,d:'D',r:0,c:4,w:'MONGODB',q:'Document database with a leaf logo'},{n:2,d:'A',r:1,c:1,w:'VSCODE',q:'Editor of choice, two words'},
          {n:3,d:'D',r:1,c:9,w:'KALI',q:'Linux distro built for pentesters'},{n:4,d:'A',r:3,c:0,w:'POSTGRESQL',q:'Elephant-branded SQL database'},
          {n:4,d:'D',r:3,c:0,w:'PHP',q:'Server-side language, recursively named'}];
  var xwEl=$('#xw');
  if(xwEl){
    var cells={},solved=0;
    XW.forEach(function(o){o.cells=[];for(var k=0;k<o.w.length;k++){var r=o.r+(o.d==='D'?k:0),c=o.c+(o.d==='A'?k:0),key=r+'_'+c;cells[key]=cells[key]||{r:r,c:c,ch:o.w[k],words:[]};cells[key].words.push(o);o.cells.push(cells[key])}});
    for(var r=0;r<7;r++)for(var c=0;c<10;c++){var cell=cells[r+'_'+c],div=document.createElement('div');
      if(cell){div.className='c';cell.el=div;var num=XW.filter(function(o){return o.r===r&&o.c===c})[0];if(num){var sm=document.createElement('small');sm.textContent=num.n;div.appendChild(sm)}
        (function(cl){div.addEventListener('click',function(){var w=cl.words.filter(function(o){return !o.done})[0]||cl.words[0];fill(w)})})(cell)}
      xwEl.appendChild(div)}
    function fill(o){
      if(o.done||o.busy)return;o.busy=true;
      o.cells.forEach(function(cl){cl.el.classList.add('hl')});
      o.cells.forEach(function(cl,k){setTimeout(function(){
        if(!cl.el.querySelector('b')){var b=document.createElement('b');b.textContent=cl.ch;cl.el.appendChild(b)}sfx.clack();
        if(k===o.cells.length-1){o.done=true;o.busy=false;o.li.classList.add('done');setTimeout(function(){o.cells.forEach(function(x){x.el.classList.remove('hl')})},500);
          if(++solved===XW.length){$('#xwDone').classList.add('on');sfx.thunk()}}
      },reduce?0:k*110)});
    }
    XW.forEach(function(o){var li=document.createElement('li');li.innerHTML='<b>'+o.n+'</b>';li.appendChild(document.createTextNode(o.q+' ('+o.w.length+')'));li.tabIndex=0;
      li.addEventListener('click',function(){fill(o)});li.addEventListener('keydown',function(e){if(e.key==='Enter')fill(o)});o.li=li;$(o.d==='A'?'#xwA':'#xwD').appendChild(li)});
    $('#xwAll').addEventListener('click',function(){XW.forEach(function(o,k){setTimeout(function(){fill(o)},k*500)})});
  }

  // 8 photo HUD label
  var hudL=$('#hudLbl'),hudT=0;
  if(fr&&hudL){fr.addEventListener('mouseenter',function(){hudL.textContent='Scanning...';clearTimeout(hudT);hudT=setTimeout(function(){hudL.textContent='Subject identified · Dhruv K. · 99.7%'},900)})}

  // 9 CTF
  console.log('%cTHE DHRUV TIMES','font:bold 30px Georgia,serif;color:#5a3d6b');
  console.log('%cIntercepted transmission (base64): ZmxhZ3tjb25zb2xlX2Nvd2JveX0=','font-family:monospace;font-size:13px;color:#3c6e4a');
  var FL=['ZmxhZ3t2aWV3X3NvdXJjZV9saWtlX2FfcHJvfQ==','ZmxhZ3tjb25zb2xlX2Nvd2JveX0=','ZmxhZ3twZWVsZWRfaXR9'], got=[];
  try{got=JSON.parse(localStorage.getItem('ctf')||'[]')}catch(e){}
  function ctfRender(){
    $$('.flags span').forEach(function(f,k){f.classList.toggle('got',got.indexOf(k)>-1)});
    $('#lockTxt').textContent='Locked · '+got.length+'/3';
    $('#file').classList.toggle('locked',got.length<3);
  }
  ctfRender();
  $('#flagForm').addEventListener('submit',function(e){
    e.preventDefault();var v=$('#flagIn').value.trim(),k=-1,msg=$('#flagMsg');
    try{k=FL.indexOf(btoa(v))}catch(err){}
    if(k<0){msg.textContent='Access denied. That flag is not on file.';msg.style.color='var(--red)';return}
    if(got.indexOf(k)>-1){msg.textContent='Already captured that one, agent.';msg.style.color='var(--muted)';return}
    got.push(k);try{localStorage.setItem('ctf',JSON.stringify(got))}catch(err){}
    $('#flagIn').value='';msg.style.color='var(--green)';
    msg.textContent=got.length<3?'Flag accepted. '+(3-got.length)+' to go.':'All flags captured. File declassified.';
    ctfRender();if(got.length===3)sfx.thunk();else sfx.clack();
  });

  // stamp re-stamps on click
  var stp=$('.stamp');
  if(stp)stp.addEventListener('click',function(){stp.style.animation='none';void stp.offsetWidth;stp.style.animation='thud .7s both';setTimeout(sfx.thunk,400)});

  // 6 ember flash when switching to night
  $('#theme').addEventListener('click',function(){setTimeout(function(){if(root2.dataset.theme==='night'&&!reduce){root2.classList.add('burning');setTimeout(function(){root2.classList.remove('burning')},950)}},0)});

  // 12 paper-tear reveal for sections
  if(!reduce)$$('section.rv').forEach(function(sec){sec.classList.add('tear');
    new MutationObserver(function(){if(sec.classList.contains('in')&&!sec.dataset.t){sec.dataset.t=1;setTimeout(function(){sec.classList.add('torn-done');revealCheck()},1400)}}).observe(sec,{attributes:true,attributeFilter:['class']});
  });

  // ===== story pages (edit the text in STORIES to match your real projects) =====
  var STORIES={
    pos:{no:'A',kicker:'Exclusive · Full-Stack',icon:'ic-pc',title:'POS Billing System',
      deck:'A point-of-sale and billing system built for real shop counters: faster checkout, clean invoices and stock that keeps itself up to date.',
      caption:'The billing counter, rebuilt in code.',
      facts:{Type:'Web application',Role:'Solo developer · design to deployment',Status:'Completed'},
      stack:['PHP','MySQL','phpMyAdmin','HTML','CSS','JavaScript'],
      link:'https://github.com/dhruvpatel2440',
      body:[
        ['p','Small shops still lose time and money to handwritten bills and guesswork stock counts. This project set out to replace the paper pad with a simple system a cashier can learn in minutes.'],
        ['h3','The problem'],
        ['p','Manual billing is slow at rush hour, totals get miscalculated, and nobody knows what is running low until it has already run out. Owners also had no easy way to see daily sales.'],
        ['h3','What it does'],
        ['ul',['Product catalogue with prices, categories and search for quick lookup at the counter','Cart-style billing with automatic totals, tax and discounts','Printable invoices with a unique bill number','Stock is reduced automatically on every sale, with low-stock alerts','Daily and monthly sales reports for the owner','Login roles so cashiers and admins see different screens']],
        ['pull','“If a cashier needs training to use it, the design has failed.”'],
        ['h3','How it is built'],
        ['p','The front end is plain HTML, CSS and JavaScript so it runs on any old counter PC. PHP handles the business logic and a relational MySQL database stores products, bills and line items, managed through phpMyAdmin.'],
        ['h3','Challenges'],
        ['ul',['Keeping stock correct when two bills are saved at the same moment','Designing a database schema that makes reports fast without duplicating data','Validating every input on the server so prices cannot be tampered with from the browser']],
        ['h3','What I learned'],
        ['p','Real users care about speed and clarity more than features. Building it end to end taught database design, secure form handling and how to turn a messy real-world process into clean software.']
      ]},
    farshan:{no:'B',kicker:'Business Desk · E-Commerce',icon:'ic-flame',title:'Patel Farshan',
      deck:'A full online ordering store for a Gujarati farsan shop. Customers browse, pay by UPI and track their order live; the shop runs everything from its own admin panel.',
      caption:'Patel Farsan ·પટેલ ફરસાણ, now taking orders online.',
      facts:{Type:'Full-stack web app + installable PWA',Role:'Full-stack developer',Status:'Live on Vercel'},
      stack:['Next.js','React','TypeScript','Supabase','Tailwind CSS','shadcn/ui','Zustand','Zod','Upstash Redis','Web Push'],
      link:'https://github.com/dhruvpatel2440/Patel-Farshan',live:'https://patel-farshan.vercel.app',
      body:[
        ['p','A neighbourhood farsan shop runs on phone calls and WhatsApp messages. Patel Farshan turns that into a proper online store, without taking away the WhatsApp habit customers and the shop already trust.'],
        ['h3','For customers'],
        ['ul',['Browse the menu by category, with filters, ratings and weight-based sizes like 250g, 500g or 1kg','A cart that remembers what you picked, with delivery charges worked out from the order weight','Delivery by bus pickup to a list of supported cities, each with its own estimated delivery time','Pay by UPI: the checkout shows a QR code and the UPI ID, then asks for the UTR number so the shop can verify it, or choose cash on delivery','A live order tracker that moves through Placed, Confirmed, Packed, Out for delivery and Delivered','One tap to send the full order summary to the shop on WhatsApp','Install it like an app on your phone, with push notifications and an offline page']],
        ['h3','For the shop'],
        ['ul',['An admin panel to manage products, categories and delivery cities','An order desk to confirm payments, move orders through each stage and print bills','A switch to close the shop, which shows a banner to every customer','Customer feedback and an audit log of every admin action']],
        ['pull','“Keep the WhatsApp habit. Remove the guesswork.”'],
        ['h3','Security built in'],
        ['p','Login uses one-time codes that are cryptographically random, stored only as peppered hashes, compared in constant time and burned after five wrong guesses. Sensitive endpoints are rate-limited with Upstash Redis, every form is validated with Zod on the server, and admin sessions are kept separate from customer accounts.'],
        ['h3','Challenges'],
        ['ul',['Verifying UPI payments without a payment gateway: a timed payment window, UTR capture and manual confirmation, with unpaid orders cancelled automatically','Keeping order status in sync live for both the customer and the shop','Making a web app feel like a native app on cheap phones: installable, fast and usable on slow networks']],
        ['h3','What I learned'],
        ['p','Building for a real business means designing around how people already work. It was also a full tour of modern full-stack development, from database design in Supabase to push notifications, PWAs and deployment on Vercel.']
      ]},
    sentinel:{no:'C',kicker:'Investigation · Security',icon:'ic-lock',title:'SentinelCore',
      deck:'A modular network detection and incident response platform. Suricata watches the wire, a rule-based pipeline turns raw alerts into incidents, and analysts triage, contain and report.',
      caption:'Every alert traces back to a signature or rule you can read.',
      facts:{Type:'Network detection & incident response (NDR / IR)',Team:'Built with Nisarg Dedakiya',Deploy:'One docker compose up on Ubuntu Server',Status:'Working platform, lab use'},
      stack:['Python','FastAPI','React','Tailwind CSS','PostgreSQL','Redis','Suricata','nmap','tshark','iptables','Docker Compose','nginx'],
      link:'https://github.com/dhruvpatel2440/Sentinelcore',
      body:[
        ['p','Most small labs and teams have no visibility into what is happening on their network. SentinelCore puts a full detection and response workflow on a single machine, and it deliberately keeps AI and machine learning out of the detection path, so every alert can be explained.'],
        ['h3','How it works'],
        ['p','Suricata listens on a mirrored network interface and writes its alerts as EVE JSON. A pipeline worker tails that log, normalises and de-duplicates the alerts into events, and a correlation engine groups related events into incidents. Analysts work those incidents from a React dashboard served through nginx, backed by a FastAPI API, PostgreSQL and Redis.'],
        ['h3','Twelve modules'],
        ['ul',['Login with Argon2 password hashing, JWT tokens and three roles: viewer, analyst and admin','Asset discovery with nmap scans and a host and port inventory','Suricata sensor control, rule staging and event search with facets','Rule-based correlation and an incident triage workflow with evidence linking','Scheduled reports exported as PDF, CSV or JSON','PCAP upload and analysis with tshark: flows, artifacts and stream follow','Threat intelligence: IOC management, feed ingestion, live matching and retro-hunts','Firewall containment that blocks a host straight from an incident']],
        ['pull','“No black boxes: if it raises an alert, you can read the rule that fired.”'],
        ['h3','Security by design'],
        ['ul',['Privilege separation: the API runs unprivileged with every Linux capability dropped; only a small helper container can scan, control Suricata or touch the firewall, through one validated Unix socket','Every firewall block has a mandatory time limit, from 60 seconds to 24 hours, so nothing is ever blocked forever','The gateway, DNS servers and the platform itself can never be blocked, enforced inside the helper','An append-only audit log the database itself refuses to edit or delete, protected by a SHA-256 hash chain']],
        ['h3','Testing'],
        ['p','Unit tests cover the backend and the helper’s guard logic, an end-to-end suite drives every module through the real API, and a browser test checks the dashboard through nginx. It runs only on networks we own or are authorised to test.'],
        ['h3','What I learned'],
        ['p','SentinelCore was a crash course in how a security operations team actually works: from packets to alerts to incidents to containment. Designing it so a compromised web layer still could not touch the firewall taught me more about least privilege than any textbook.']
      ]}
  };
  var storyOrder=['pos','farshan','sentinel'], sv=$('#story'), sb=$('#stBody');
  function esc(t){return String(t==null?'':t).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function renderStory(id){
    var d=STORIES[id], k=0, h='';
    function blk(html){return html.replace(/^<(\w+)/,'<$1 style="--d:'+(k++)+'"')}
    h+=blk('<p class="kicker">'+esc(d.kicker)+'</p>');
    h+=blk('<h1 class="st-h distress" id="stTitle">'+esc(d.title)+'</h1>');
    h+=blk('<p class="st-deck">'+esc(d.deck)+'</p>');
    h+=blk('<div class="st-by"><span>By Dhruv Khirsariya, staff correspondent</span><span>Exhibit '+d.no+'</span></div>');
    h+=blk('<figure><div class="st-hero"><span class="st-label">Exhibit '+d.no+'</span><svg viewBox="0 0 48 48"><use href="#'+d.icon+'"/></svg></div><figcaption class="st-cap">'+esc(d.caption)+'</figcaption></figure>');
    var body='';
    d.body.forEach(function(b){
      if(b[0]==='ul')body+='<ul>'+b[1].map(function(li){return '<li>'+esc(li)+'</li>'}).join('')+'</ul>';
      else if(b[0]==='pull')body+='<p class="st-pull">'+esc(b[1])+'</p>';
      else body+='<'+b[0]+'>'+esc(b[1])+'</'+b[0]+'>';
    });
    var facts='';for(var f in d.facts)facts+='<dt>'+esc(f)+'</dt><dd>'+esc(d.facts[f])+'</dd>';
    h+=blk('<div class="st-grid"><div class="st-body">'+body+'</div><aside><div class="fact"><h4>Fact box</h4><dl>'+facts+'<dt>Stack</dt><dd><div class="tags">'+d.stack.map(function(t){return '<span>'+esc(t)+'</span>'}).join('')+'</div></dd></dl>'+(d.link?'<a class="btn" href="'+esc(safeUrl(d.link))+'" target="_blank" rel="noopener">View code on GitHub</a>':'')+(d.live?'<a class="btn alt" href="'+esc(safeUrl(d.live))+'" target="_blank" rel="noopener">Visit live site</a>':'')+'</div></aside></div>');
    var nx=storyOrder[(storyOrder.indexOf(id)+1)%storyOrder.length];
    h+=blk('<a class="st-next" href="#story/'+nx+'"><span>Continued on next page &rarr;</span><b>'+esc(STORIES[nx].title)+'</b></a>');
    sb.innerHTML=h;
    $('#stNo').textContent='Exhibit '+d.no+' · '+(storyOrder.indexOf(id)+1)+' of '+storyOrder.length;
    document.title=d.title+' | The Dhruv Times';
  }

  // ===== certificate archive (images in /certificates, originals on Google Drive) =====
  var CERT_FOLDER='https://drive.google.com/drive/folders/1J5lrDJ4VdXlESmYwA4TTgB9xzoWG90ad';
  var ROLES=[
    {k:'now',t:'Currently Studying',s:'In progress',d:'Courses underway right now. Each one gets filed in the archive the day the certificate is earned.'},
    {k:'lead',t:'Leadership & Event Coordination',s:'Organiser',d:'Planning and running CyberKavach’s cybersecurity events from start to finish.'},
    {k:'sec',t:'Cybersecurity & Digital Forensics',s:'Investigator',d:'Courses, workshops and competitions in forensics, network analysis and CTFs.'},
    {k:'intern',t:'Internship',s:'Intern',d:'Industry work experience.'},
    {k:'award',t:'Awards',s:'Winner',d:'Competitions won.'},
    {k:'nss',t:'Community Service',s:'Volunteer',d:'Giving back through the National Service Scheme.'}
  ];
  var CERTS=[
    {f:'zero-day-chase-coordinator',id:'1yYMaMobnBiY-KVSvJXw8OEuyuEoM7neC',role:'lead',as:'Event Coordinator',title:'The Zero Day Chase',issuer:'CyberKavach Club, CHARUSAT',date:'24 Dec 2025',type:'Certificate of Appreciation',note:'Awarded for outstanding leadership, dedication and structured coordination as Event Coordinator, ensuring the event’s success.'},
    {f:'warzone-hackathon-coordinator',id:'1mKBUxefVDG1Loj7M6UCupzqff68sRMVs',role:'lead',as:'Event Coordinator',title:'Warzone: Industry Readiness Cybersecurity Hackathon',issuer:'CyberKavach × Barracks, CHARUSAT',date:'23 Dec 2025',type:'Certificate of Appreciation',note:'Led the CyberKavach × Barracks hackathon as Event Coordinator, from planning to execution.'},
    {f:'belkasoft-advanced-sqlite',id:'1NdVwPUQyVsi1PKF7Ip-YLkkckA10ermx',role:'sec',as:'Course graduate',title:'Advanced SQLite Queries with Belkasoft',issuer:'Belkasoft',date:'12 Jul 2026',type:'Certificate of Completion',note:'Digital forensics training course on querying SQLite evidence. 6 CPE credits. Certificate ID: e2vl51p9sv.'},
    {f:'digital-forensics-rru',id:'1rrfgn06rdPZLJPRS_1fr_jTAjpl-qTyq',role:'sec',as:'Course graduate',title:'Certification Course on Digital Forensics',issuer:'CHARUSAT × Rashtriya Raksha University (RRU)',date:'30 Mar – 3 Apr 2026',type:'Certificate of Completion',note:'Five-day certification course in digital forensics, run with Rashtriya Raksha University’s SITAICS.'},
    {f:'hackquest-ctf-cognizancex26',id:'1ySt3534sKXHt4VlK-7miWZaEtn7EfX6E',role:'sec',as:'CTF competitor',title:'HackQuest Arena (Capture the Flag)',issuer:'CognizanceX’26 Techfest, CHARUSAT',date:'12–13 Feb 2026',type:'Certificate of Appreciation',note:'Competed in the Capture the Flag event at CognizanceX’26, the flagship techfest of CHARUSAT’s Faculty of Technology and Engineering.'},
    {f:'ieee-wireshark-workshop',id:'1tGHwwmuiZJ4yY7Z9yU4kDl4LCCxPaJrb',role:'sec',as:'Workshop participant',title:'Introduction to Network Sniffing: Hands-on with Wireshark',issuer:'IEEE Student Branch, CHARUSAT',date:'30 Jul 2025',type:'Certificate of Participation',note:'Hands-on workshop on capturing and analysing network traffic with Wireshark.'},
    {f:'oasis-infobyte-internship',id:'1ERx8AwjZp_Qmnjqd8NGLIo-zen99Cp4s',role:'intern',as:'Web Development Intern',title:'Web Development & Designing Internship',issuer:'Oasis Infobyte · AICTE OIB-SIP',date:'5 May – 15 Jun 2026',type:'Certificate of Completion',note:'One-month AICTE internship in web development and designing, completed with wonderful remarks.'},
    {f:'logo-competition-winner',id:'16qmGjsPs58vgV3C3qdg_Clht3UgNzaAm',role:'award',as:'Winner',title:'CSE Department Logo Competition',issuer:'CSPIT – CSE, CHARUSAT',date:'',type:'Certificate of Appreciation',note:'Winner of the Department of Computer Science and Engineering logo competition, recognised for creativity and excellence.'},
    {f:'nss-rural-skill-development',id:'1Iw7S5i0BoYaH6RkiqF6p3ICNrvfIaOmz',role:'nss',as:'NSS Volunteer',title:'NSS Rural Skill Development Program',issuer:'CHARUSAT NSS Unit · CSE / AIML',date:'26 Sep 2024',type:'Certificate of Appreciation',note:'Took part in the National Service Scheme rural skill development programme at Malataj village.'}
  ];
  function certImg(c){return c.img?esc(safeUrl(c.img)):'certificates/'+c.f+'.jpg'}
  function driveThumb(id){return 'https://drive.google.com/thumbnail?id='+id+'&sz=w1200'}
  function driveView(id){return 'https://drive.google.com/file/d/'+id+'/view'}
  function certOriginal(c){return c.id?driveView(c.id):certImg(c)}
  // fall back to the Drive copy if a local image is missing
  document.addEventListener('error',function(e){var im=e.target;if(im.tagName!=='IMG'||im.dataset.fb)return;var id=im.dataset.drive;if(id){im.dataset.fb=1;im.src=driveThumb(id)}},true);
  $$('img[data-drive]').forEach(function(im){if(im.complete&&!im.naturalWidth&&!im.dataset.fb){im.dataset.fb=1;im.src=driveThumb(im.dataset.drive)}});
  // courses in progress: move them into CERTS (with an image) once completed
  var STUDYING=[
    {title:'CCNA: Introduction to Networks',sub:'CCNA · Module 1',issuer:'Cisco Networking Academy',mark:'CISCO',
     topics:['Network fundamentals','Ethernet & IP addressing','IPv4 / IPv6 subnetting','Switch & router basics','Packet Tracer labs'],
     note:'The first course of the CCNA track: how networks are built, addressed and secured, practised hands-on in Cisco Packet Tracer.'},
    {title:'Google Cloud Cybersecurity Certificate',sub:'Professional certificate',issuer:'Google Cloud',mark:'GOOGLE CLOUD',
     topics:['Cloud security foundations','Identity & access management','Threat detection & response','Risk & compliance'],
     note:'Google Cloud’s cybersecurity programme: protecting cloud workloads, managing identity and responding to threats.'}
  ];
  function roleCount(k){return k==='now'?STUDYING.length:CERTS.filter(function(c){return c.role===k}).length}
  // front-page teaser chips
  var cr=$('#certRoles');
  function certTeaser(){if(!cr)return;cr.innerHTML='';ROLES.forEach(function(r){var li=document.createElement('li');li.innerHTML='<a href="#certificates/'+r.k+'">'+esc(r.s)+' <b>'+roleCount(r.k)+'</b></a>';cr.appendChild(li)});
    $('#certLead').textContent=CERTS.length+' certificates on file and '+STUDYING.length+' in progress, sorted by the role he played: organiser, investigator, intern, winner and volunteer.'}
  certTeaser();

  function renderCerts(filter){
    var k=0,h='';
    function blk(html){return html.replace(/^<(\w+)/,'<$1 style="--d:'+(k++)+'"')}
    h+=blk('<p class="kicker">Special supplement</p>');
    h+=blk('<h1 class="st-h distress" id="stTitle">The Certificate Archive</h1>');
    h+=blk('<p class="st-deck">Every certificate on file, sorted by the role Dhruv played: organising events, investigating systems, interning, winning and volunteering. Click any certificate to read it in full.</p>');
    h+=blk('<div class="st-by"><span>'+CERTS.length+' certificates · '+STUDYING.length+' in progress</span><a href="'+CERT_FOLDER+'" target="_blank" rel="noopener" style="color:inherit">Originals on Google Drive &#8599;</a></div>');
    var f='<div class="ca-filters" role="toolbar" aria-label="Filter by role"><button type="button" data-f="all">All<b>'+(CERTS.length+STUDYING.length)+'</b></button>';
    ROLES.forEach(function(r){f+='<button type="button" data-f="'+r.k+'">'+esc(r.s)+'<b>'+roleCount(r.k)+'</b></button>'});
    h+=blk(f+'</div>');
    var g='<div class="ca-all">';
    ROLES.forEach(function(r){
      g+='<section class="ca-role" data-role="'+r.k+'"><h2>'+esc(r.t)+' <small>'+roleCount(r.k)+(r.k==='now'?' underway':' on file')+'</small></h2><p>'+esc(r.d)+'</p><div class="ca-grid">';
      if(r.k==='now')STUDYING.forEach(function(c){
        g+='<div class="cert wip"><div class="wip-top"><span class="wip-mark">'+esc(c.mark)+'</span><span class="wip-stamp">In progress</span></div>'
          +'<span class="role-tag">'+esc(c.sub)+'</span><h3>'+esc(c.title)+'</h3><span class="iss">'+esc(c.issuer)+'</span>'
          +'<p class="wip-note">'+esc(c.note)+'</p><ul class="topics">'+c.topics.map(function(t){return '<li>'+esc(t)+'</li>'}).join('')+'</ul>'
          +'<div class="wip-bar" role="img" aria-label="Course in progress"></div><span class="dt"><span>Status: studying</span><span>Certificate pending</span></span></div>';
      });
      CERTS.forEach(function(c,i){if(c.role!==r.k)return;
        g+='<button class="cert" type="button" data-i="'+i+'" aria-label="View certificate: '+esc(c.title)+'"><img src="'+certImg(c)+'" data-drive="'+esc(c.id||'')+'" alt="'+esc(c.title)+' certificate" loading="lazy">'
          +'<span class="role-tag">'+esc(c.as)+'</span><h3>'+esc(c.title)+'</h3><span class="iss">'+esc(c.issuer)+'</span>'
          +'<span class="dt"><span>'+esc(c.date||c.type.replace('Certificate of ',''))+'</span><span>View &rarr;</span></span></button>';
      });
      g+='</div></section>';
    });
    h+=blk(g+'</div>');
    sb.innerHTML=h;
    $('#stNo').textContent=CERTS.length+' certificates on file';
    document.title='Certificate Archive | The Dhruv Times';
    setFilter(filter||'all',true);
  }
  function setFilter(fk,silent){
    if(fk!=='all'&&!ROLES.some(function(r){return r.k===fk}))fk='all';
    $$('.ca-filters button',sb).forEach(function(b){var on=b.dataset.f===fk;b.classList.toggle('on',on);b.setAttribute('aria-pressed',on)});
    $$('.ca-role',sb).forEach(function(sec){sec.hidden=!(fk==='all'||sec.dataset.role===fk)});
    if(!silent){try{history.replaceState(null,'',fk==='all'?'#certificates':'#certificates/'+fk)}catch(e){}sfx.clack()}
  }
  sb.addEventListener('click',function(e){
    var fb=e.target.closest('.ca-filters button');if(fb){setFilter(fb.dataset.f);return}
    var c=e.target.closest('.cert');if(c)openLb(+c.dataset.i);
  });

  // lightbox
  var lb=$('#lb'),lbImg=$('.lb-img',lb),lbCap=$('.lb-cap',lb),lbI=0,lbLast=null;
  function lbShow(i){
    lbI=(i+CERTS.length)%CERTS.length;var c=CERTS[lbI],r=ROLES.filter(function(x){return x.k===c.role})[0];
    lbImg.dataset.fb='';lbImg.dataset.drive=c.id;lbImg.src=certImg(c);lbImg.alt=c.title+' certificate';
    lbImg.style.animation='none';void lbImg.offsetWidth;lbImg.style.animation='';
    lbCap.innerHTML='<p class="kicker">'+esc(r.t)+'</p><h3>'+esc(c.title)+'</h3><p>'+esc(c.note)+'</p><dl>'
      +'<dt>Role</dt><dd>'+esc(c.as)+'</dd><dt>Issued by</dt><dd>'+esc(c.issuer)+'</dd>'+(c.date?'<dt>Date</dt><dd>'+esc(c.date)+'</dd>':'')+'<dt>Type</dt><dd>'+esc(c.type)+'</dd></dl>'
      +'<a class="btn" href="'+certOriginal(c)+'" target="_blank" rel="noopener">Open original &#8599;</a><p class="lb-count">'+(lbI+1)+' of '+CERTS.length+' · use ← → keys</p>';
  }
  function openLb(i){lbLast=document.activeElement;lbShow(i);lb.classList.add('on');lb.setAttribute('aria-hidden','false');$('.lb-x',lb).focus({preventScroll:true});sfx.pick()}
  function closeLb(){lb.classList.remove('on');lb.setAttribute('aria-hidden','true');if(lbLast&&lbLast.focus)lbLast.focus({preventScroll:true})}
  $('.lb-x',lb).addEventListener('click',closeLb);
  $('.lb-nav.prev',lb).addEventListener('click',function(){lbShow(lbI-1);sfx.clack()});
  $('.lb-nav.next',lb).addEventListener('click',function(){lbShow(lbI+1);sfx.clack()});
  lb.addEventListener('click',function(e){if(e.target===lb)closeLb()});
  addEventListener('keydown',function(e){
    if(!lb.classList.contains('on'))return;
    if(e.key==='Escape'){closeLb();e.stopImmediatePropagation();e.preventDefault()}
    else if(e.key==='ArrowRight'){lbShow(lbI+1);e.preventDefault()}
    else if(e.key==='ArrowLeft'){lbShow(lbI-1);e.preventDefault()}
  },true);
  var baseTitle=document.title;
  var retAnchor='#projects';
  function openStory(id){
    retAnchor='#projects';renderStory(id);sv.scrollTop=0;sv.classList.add('on');sv.setAttribute('aria-hidden','false');document.documentElement.style.overflow='hidden';sfx.rustle();
    setTimeout(function(){$('.st-back').focus({preventScroll:true})},50);
  }
  function closeStory(){
    if(!sv.classList.contains('on'))return;
    sv.classList.remove('on');sv.setAttribute('aria-hidden','true');document.documentElement.style.overflow='';document.title=baseTitle;
  }
  function openCerts(f){
    retAnchor='#certs';renderCerts(f);sv.scrollTop=0;sv.classList.add('on');sv.setAttribute('aria-hidden','false');document.documentElement.style.overflow='hidden';sfx.rustle();
    setTimeout(function(){$('.st-back').focus({preventScroll:true})},50);
  }
  function routeStory(){var h=location.hash,m=h.match(/^#story\/(\w+)/),c=h.match(/^#certificates(?:\/(\w+))?$/);
    if(m&&STORIES[m[1]])openStory(m[1]);else if(c)openCerts(c[1]);else{closeLb();closeStory()}}
  function go(hash){try{history.pushState(null,'',hash)}catch(e){}}
  document.addEventListener('click',function(e){
    var a=e.target.closest('a[href^="#story/"],a[href^="#certificates"],.st-back');
    if(!a||e.ctrlKey||e.metaKey||e.shiftKey)return;
    e.preventDefault();
    if(a.classList.contains('st-back'))return backToFront();
    var hr=a.getAttribute('href');
    if(hr.indexOf('#certificates')===0){go(hr);openCerts(hr.split('/')[1]);return}
    var id=hr.slice(7); if(!STORIES[id])return;
    go('#story/'+id); openStory(id);
  });
  function backToFront(){var r=retAnchor;go(r);closeLb();closeStory();var pj=$(r);if(pj)pj.scrollIntoView({behavior:'instant'})}
  addEventListener('popstate',routeStory); addEventListener('hashchange',routeStory); routeStory();
  addEventListener('keydown',function(e){if(e.key==='Escape'&&sv.classList.contains('on'))backToFront()});

  // theme toggle
  var tb=$('#theme'), root=document.documentElement;
  try{if(localStorage.getItem('theme')==='night'){root.dataset.theme='night';tb.textContent='Day edition'}}catch(e){}
  tb.onclick=function(){
    var n=root.dataset.theme==='night';
    if(n){delete root.dataset.theme;tb.textContent='Night edition'}else{root.dataset.theme='night';tb.textContent='Day edition'}
    try{localStorage.setItem('theme',n?'day':'night')}catch(e){}
  };

  // contact form -> mailto
  $('#form').addEventListener('submit',function(e){
    e.preventDefault();var f=e.target;
    location.href='mailto:'+CONTACT_EMAIL+'?subject='+encodeURIComponent('Portfolio message from '+f.n.value)+'&body='+encodeURIComponent(f.m.value+'\n\n- '+f.n.value+' ('+f.e.value+')');
  });

  // Latest from the press (hand-picked repos)
  stagger('#repoGrid');

  // profile photo fallback (was an inline onerror; moved here for the Content-Security-Policy)
  var ph=$('#photo');
  function phFb(){ph.removeEventListener('error',phFb);ph.src='https://portfolio-seven-lake-21.vercel.app/profile.jpeg'}
  if(ph){ph.addEventListener('error',phFb);if(ph.complete&&!ph.naturalWidth)phFb()}

  // ===== render live content =====
  // story/about markup: "## heading", "- list item", "> pull quote", blank line = new paragraph, [[text]] = redacted
  function mdBlocks(t){
    var out=[],para=[],list=null;
    function flush(){if(para.length){out.push(['p',para.join(' ')]);para=[]}if(list){out.push(['ul',list]);list=null}}
    String(t||'').replace(/\r/g,'').split('\n').forEach(function(line){
      var l=line.trim();
      if(!l){flush();return}
      if(/^## /.test(l)){flush();out.push(['h3',l.slice(3)]);return}
      if(/^> /.test(l)){flush();out.push(['pull',l.slice(2)]);return}
      if(/^- /.test(l)){if(para.length){out.push(['p',para.join(' ')]);para=[]}(list=list||[]).push(l.slice(2));return}
      if(list){out.push(['ul',list]);list=null}
      para.push(l);
    });
    flush();return out;
  }
  function redacted(t){return esc(t).replace(/\[\[(.+?)\]\]/g,'<span class="redact" tabindex="0" title="Hover to declassify">$1</span>')}
  function setTicker(list){var h=list.map(function(n){return esc(n)+'<b>&#9670;</b>'}).join('');$('#tk').innerHTML=h+h}
  function setLink(id,u){var a=$('#'+id);if(a){if(u){a.href=safeUrl(u);a.hidden=false}else a.hidden=true}}

  function applyContent(r){
    var st=r[0]&&r[0][0], pj=r[1]||[], ce=r[2]||[], co=r[3]||[], pr=r[4]||[], sk=r[5]||[], tl=r[6]||[];
    if(st){
      if(st.headline_phrases&&st.headline_phrases.length){phrases.length=0;[].push.apply(phrases,st.headline_phrases);pi=0;ci=0;del=false}
      if(st.deck)$('.deck').textContent=st.deck;
      if(st.ticker&&st.ticker.length)setTicker(st.ticker);
      if(st.about){var cols=$('.cols');cols.innerHTML=mdBlocks(st.about).map(function(b){
          return b[0]==='pull'?'<p class="pull">'+redacted(b[1])+'</p>':b[0]==='ul'?'<p>'+b[1].map(redacted).join('<br>')+'</p>':'<p>'+redacted(b[1])+'</p>'}).join('');
        $$('.redact',cols).forEach(function(x){x.addEventListener('click',function(){x.classList.toggle('open')})});stagger('.cols')}
      if(st.email)CONTACT_EMAIL=st.email;
      setLink('lnkResume',st.resume_url);setLink('lnkGithub',st.github_url);setLink('lnkLinkedin',st.linkedin_url);
      if(st.photo_url&&ph){ph.src=safeUrl(st.photo_url)}
      if(st.cert_folder_url)CERT_FOLDER=safeUrl(st.cert_folder_url);
    }
    if(pj.length){
      for(var k in STORIES)delete STORIES[k];storyOrder.length=0;
      var gp=$('.grid-poster'),html='';
      pj.forEach(function(p,i){
        STORIES[p.slug]={no:p.exhibit||String.fromCharCode(65+i),kicker:p.kicker,icon:p.icon,title:p.title,deck:p.deck,caption:p.caption,
          facts:p.facts||{},stack:p.stack||[],link:p.github_url,live:p.live_url,body:mdBlocks(p.body)};
        storyOrder.push(p.slug);
        html+='<a class="clip-card" href="#story/'+esc(p.slug)+'"><span class="exhibit" style="top:-11px;right:14px">Exhibit '+esc(STORIES[p.slug].no)+'</span>'
          +'<span class="tape" style="position:absolute;top:-12px;left:50%;width:70px;height:20px;transform:translateX(-50%) rotate('+(i%2?3:-4)+'deg)" aria-hidden="true"></span>'
          +'<span class="kicker">'+esc(p.kicker)+'</span><h3>'+esc(p.title)+'</h3><p>'+esc(p.summary)+'</p>'
          +'<div class="meta"><span>'+esc(p.meta)+'</span><span>Read more &rarr;</span></div></a>';
      });
      if(gp){gp.innerHTML=html;stagger('.grid-poster');$$('.clip-card',gp).forEach(bindTilt)}
    }
    if(pr.length){var rg=$('#repoGrid');rg.innerHTML=pr.map(function(c){
        return '<a class="card" href="'+esc(safeUrl(c.url))+'" target="_blank" rel="noopener"><span class="kicker">'+esc(c.kicker)+'</span><h3>'+esc(c.title)+'</h3><p>'+esc(c.summary)+'</p><div class="meta"><span>'+esc(c.meta)+'</span><span>Read more &rarr;</span></div></a>'}).join('');
      stagger('#repoGrid')}
    if(sk.length){var cl=$('.class');cl.innerHTML=sk.map(function(g){
        return '<div class="ad"><h4>'+esc(g.title)+'</h4><div class="tags">'+(g.tags||[]).map(function(t){return '<span>'+esc(t)+'</span>'}).join('')+'</div></div>'}).join('');
      stagger('.class')}
    if(tl.length){var ft=$('.film-track');ft.innerHTML=tl.map(function(e){
        return '<div class="ev rv"><div class="when">'+esc(e.when_label)+'</div><h3>'+esc(e.title)+'</h3><div class="where">'+esc(e.place)+'</div><p>'+esc(e.body)+'</p></div>'}).join('');
      $$('.ev',ft).forEach(function(n){io.observe(n)});filmSize()}
    if(ce.length){CERTS.length=0;ce.forEach(function(c){CERTS.push({img:c.image_url,id:c.drive_id,role:c.role,as:c.role_label,title:c.title,issuer:c.issuer,date:c.date_label,type:c.cert_type,note:c.note})});
      var fan=$$('.cert-fan img');CERTS.filter(function(c){return c.img||c.id}).slice(0,3).forEach(function(c,i){if(fan[i]){fan[i].dataset.fb='';fan[i].dataset.drive=c.id||'';fan[i].src=c.img?safeUrl(c.img):driveThumb(c.id)}})}
    if(co.length||ce.length){STUDYING.length=0;co.forEach(function(c){STUDYING.push({title:c.title,sub:c.subtitle,issuer:c.provider,mark:c.mark,topics:c.topics||[],note:c.note})});certTeaser()}
    revealCheck();dispatchEvent(new Event('scroll'));
    if(/^#(story|certificates)/.test(location.hash))routeStory();
  }
  if(contentP)contentP.then(applyContent).catch(function(e){console.info('[Dhruv Times] using built-in content:',e.message)});
})();
