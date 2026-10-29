(() => {
  "use strict";
  const C = window.WEDDING_CONFIG;
  const $ = (s) => document.querySelector(s);
  const text = (id, value) => { const el = document.getElementById(id); if (el) el.textContent = value; };
  const img = (id, src) => { const el = document.getElementById(id); if (el) el.src = src || ""; };
  function escapeHTML(str) { return String(str).replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[c])); }

  function getGuestName() {
    const params = new URLSearchParams(window.location.search);
    const queryName = params.get("to");
    if (queryName) return queryName.replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim();
    const path = window.location.pathname.replace(/\/+$/, "");
    const parts = path.split("/").filter(Boolean);
    const slug = parts.length ? parts[parts.length - 1] : "";
    if (!slug || /^(index\.html|404\.html|wedding-invitation)$/i.test(slug)) return "";
    try { return decodeURIComponent(slug).replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim(); }
    catch { return slug.replace(/[-_]+/g, " ").trim(); }
  }
  const guestName = getGuestName();

  // Final layout refinements are injected here so the same composition works on
  // the existing index.html and on personalised GitHub Pages 404 routes.
  const premiumStyle = document.createElement("style");
  premiumStyle.textContent = `
    @media(max-width:699px){
      .invitation-gate__guest{max-width:86vw;margin-left:auto;margin-right:auto;line-height:1.1}
      .schedule-item strong{white-space:nowrap}
    }
  `;
  document.head.appendChild(premiumStyle);

  const gate = document.createElement("div");
  gate.className = "invitation-gate";
  gate.setAttribute("role", "dialog");
  gate.setAttribute("aria-label", "Wedding invitation cover");
  const firstNames = [C.couple.bride.split(" ")[0], C.couple.groom.split(" ")[0]];
  // Cover (photo + script names) -> tap -> carved gunungan inside an arch frame -> it splits open -> the photo fills the screen.
  gate.innerHTML = `
    <div class="gate-ground" aria-hidden="true"></div>
    <div class="gate-photo" aria-hidden="true"></div>
    <div class="gate-box" aria-hidden="true">
      <div class="gate-window">
        <div class="gate-window__photo"></div>
        <div class="gate-window__ground"></div>
        <img class="kayon kayon--l" src="assets/ornaments/kayon-l.webp" alt="" decoding="async">
        <img class="kayon kayon--r" src="assets/ornaments/kayon-r.webp" alt="" decoding="async">
      </div>
      <svg class="gate-frame" viewBox="0 -14 200 354"><use href="#arch-frame"/></svg>
    </div>
    <div class="gate-cover">
      <div class="gate-cover__eyebrow">THE WEDDING OF</div>
      <h2 class="gate-cover__names"><span>${escapeHTML(firstNames[0])} <i class="amp">&amp;</i></span><span>${escapeHTML(firstNames[1])}</span></h2>
      ${guestName ? `<div class="invitation-gate__guest">Dear, ${escapeHTML(guestName)}</div>` : ""}
      <button class="invitation-gate__open" type="button">Buka Undangan</button>
    </div>`;
  document.body.prepend(gate);
  document.body.classList.add("is-locked");

  text("heroBride", C.couple.bride.split(" ")[0]);
  text("heroGroom", C.couple.groom.split(" ")[0]);
  text("heroDate", C.event.shortDateLabel || "15. 11. 2026");
  text("eventDate", C.event.dateLabel);
  try { // date lock-ups are filled from config (Jakarta time), static markup stays as fallback
    const d = new Date(C.event.startISO), f = o => new Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Jakarta", ...o }).format(d);
    const parts = { weekday: f({ weekday: "long" }), day: f({ day: "numeric" }), month: f({ month: "long" }), year: f({ year: "numeric" }) };
    document.querySelectorAll(".date-lockup").forEach(el => {
      el.setAttribute("aria-label", `${parts.weekday}, ${parts.day} ${parts.month} ${parts.year}`);
      el.querySelectorAll("[data-date]").forEach(n => { n.textContent = parts[n.dataset.date]; });
    });
  } catch {}
  text("eventTime", C.event.timeLabel);
  text("venueName", C.event.venue);
  text("venueAddress", C.event.address);
  text("brideName", C.couple.bride);
  text("groomName", C.couple.groom);
  text("brideParents", `${C.couple.brideFather} & ${C.couple.brideMother}`);
  text("groomParents", `${C.couple.groomFather} & ${C.couple.groomMother}`);
  text("bank1Name", C.gift.account1.bank);
  text("bank1Number", C.gift.account1.number);
  text("bank1Holder", `a.n. ${C.gift.account1.name}`);
  text("bank2Name", C.gift.account2.bank);
  text("bank2Number", C.gift.account2.number);
  text("bank2Holder", `a.n. ${C.gift.account2.name}`);
  text("giftAddress", C.gift.address);

  img("heroImage", C.assets.hero);
  img("bridePortrait", C.assets.bride);
  img("groomPortrait", C.assets.groom);
  img("closingImage", C.assets.couple);


  $("#mapsLink").href = C.event.mapsUrl;
  $("#calendarLink").href = buildGoogleCalendarUrl();
  const target = new Date(C.event.startISO).getTime();
  function tick() { const diff=Math.max(0,target-Date.now()); text("days",String(Math.floor(diff/86400000)).padStart(2,"0")); text("hours",String(Math.floor(diff/3600000)%24).padStart(2,"0")); text("minutes",String(Math.floor(diff/60000)%60).padStart(2,"0")); text("seconds",String(Math.floor(diff/1000)%60).padStart(2,"0")); }
  tick(); setInterval(tick,1000);
  function googleDate(iso){return new Date(iso).toISOString().replace(/[-:]/g,"").replace(/\.\d{3}Z$/,"Z");}
  function buildGoogleCalendarUrl(){const start=googleDate(C.event.startISO),end=googleDate(C.event.endISO);const params=new URLSearchParams({action:"TEMPLATE",text:C.event.title,dates:`${start}/${end}`,location:`${C.event.venue}, ${C.event.address}`,details:C.event.calendarDescription});return `https://calendar.google.com/calendar/render?${params.toString()}`;}

  const STORAGE_KEY="isti-adrian-rsvp-wishes-v1";
  const form=$("#rsvpForm"),status=$("#formStatus"),submit=$("#submitButton");
  function readLocal(){try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||"[]");}catch{return[];}}
  function saveLocal(item){const all=readLocal();all.unshift(item);localStorage.setItem(STORAGE_KEY,JSON.stringify(all.slice(0,50)));}
  function renderWishes(items){const list=$("#wishesList");if(!items.length){list.innerHTML='<div class="empty-state">Be the first to leave a wish.</div>';return;}list.innerHTML=items.filter(x=>x.message).slice(0,30).map(x=>`<article class="wish"><div class="wish__name">${escapeHTML(x.name||"A guest")}</div><p class="wish__message">“${escapeHTML(x.message)}”</p>${x.date?`<div class="wish__meta">${escapeHTML(x.date)}</div>`:""}</article>`).join("");}
  function loadLocalWishes(){renderWishes(readLocal());}
  function loadRemoteWishes(){if(!C.googleAppsScriptUrl){loadLocalWishes();return;}const cb=`weddingWishes_${Date.now()}`;const script=document.createElement("script");const cleanup=()=>{try{delete window[cb];}catch{}script.remove();};window[cb]=(data)=>{if(Array.isArray(data))renderWishes(data.length?data:readLocal());else loadLocalWishes();cleanup();};script.onerror=()=>{loadLocalWishes();cleanup();};script.src=`${C.googleAppsScriptUrl.replace(/\/$/,"")}?action=wishes&callback=${cb}`;document.body.appendChild(script);setTimeout(cleanup,10000);}
  form.addEventListener("submit",async e=>{e.preventDefault();const fd=new FormData(form);const item={name:String(fd.get("name")||"").trim(),attendance:String(fd.get("attendance")||""),guests:Number(fd.get("guests")||1),message:String(fd.get("message")||"").trim(),date:new Date().toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}),timestamp:new Date().toISOString()};if(!item.name||!item.message)return;submit.disabled=true;submit.textContent="Sending…";saveLocal(item);renderWishes(readLocal());status.textContent="Thank you — your RSVP has been received.";if(C.googleAppsScriptUrl){try{await fetch(C.googleAppsScriptUrl,{method:"POST",mode:"no-cors",headers:{"Content-Type":"application/x-www-form-urlencoded;charset=UTF-8"},body:new URLSearchParams(item)});status.textContent="Thank you — your RSVP has been recorded.";}catch{status.textContent="Saved on this device. Please try again when you have a connection.";}setTimeout(loadRemoteWishes,1200);}form.reset();submit.disabled=false;submit.textContent="Send RSVP";});
  document.querySelectorAll(".copy-button").forEach(btn=>btn.addEventListener("click",async()=>{const target=document.getElementById(btn.dataset.copyTarget),value=target?.textContent?.trim()||"";try{await navigator.clipboard.writeText(value);const old=btn.textContent;btn.textContent="Copied ✓";setTimeout(()=>btn.textContent=old,1400);}catch{window.prompt("Copy this:",value);}}));

  const audio=$("#weddingMusic"),musicButton=$("#musicButton"),musicControl=$(".music-control");audio.src=C.assets.music||"";audio.preload="auto";audio.autoplay=true;
  async function startMusic(){try{await audio.play();musicButton.setAttribute("aria-pressed","true");musicButton.setAttribute("aria-label","Pause wedding music");musicControl.classList.add("playing");return true;}catch{return false;}}
  const openButton=$(".invitation-gate__open");
  openButton.addEventListener("click",async()=>{
    openButton.disabled=true;
    document.body.classList.remove("is-locked");
    const timers=[];const at=(ms,fn)=>timers.push(setTimeout(fn,ms));
    const enterHome=()=>{document.body.classList.add("home-entering");at(3800,()=>document.body.classList.add("home-entered"));};
    if(window.matchMedia("(prefers-reduced-motion: reduce)").matches){
      gate.classList.add("is-opening","is-leaving");enterHome();setTimeout(()=>gate.remove(),700);await startMusic();return;
    }
    const win=gate.querySelector(".gate-window");
    gate.style.setProperty("--cover",(Math.max(innerWidth/win.offsetWidth,innerHeight/win.offsetHeight)*1.5).toFixed(2));
    gate.classList.add("is-opening");                       // cover text fades, photo melts into the ground
    at(700,()=>gate.classList.add("is-kayon"));              // gunungan + frame appear
    at(2300,()=>gate.classList.add("is-split"));             // gunungan opens like doors
    at(2900,()=>gate.classList.add("is-grow"));              // the window grows to fill the screen
    at(4300,()=>{gate.classList.add("is-leaving");enterHome();}); // hand over to the hero reveal
    at(5400,()=>gate.remove());
    at(500,()=>gate.addEventListener("click",()=>{           // tap anywhere to skip the rest
      if(gate.classList.contains("is-leaving"))return;
      timers.splice(0).forEach(clearTimeout);
      gate.classList.add("is-kayon","is-split","is-grow","is-leaving");enterHome();setTimeout(()=>gate.remove(),1000);
    }));
    await startMusic();
  });
  startMusic();["pointerdown","touchstart","keydown"].forEach(eventName=>window.addEventListener(eventName,()=>{if(audio.paused)startMusic();},{once:true,passive:true}));
  musicButton.addEventListener("click",async()=>{try{if(audio.paused)await startMusic();else{audio.pause();musicButton.setAttribute("aria-pressed","false");musicButton.setAttribute("aria-label","Play wedding music");musicControl.classList.remove("playing");}}catch{status.textContent="Tap the music button again to start the song.";}});

  const reduceMotion=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add("visible");observer.unobserve(entry.target);}});},{threshold:.12});
  const STAGGER=".couple-card,.countdown-grid,.event-schedule,.gift-list,.wishes-list";
  document.querySelectorAll("section > *").forEach((el,index)=>{
    if(el.classList.contains("hero__image")||el.classList.contains("hero__veil"))return;
    if(el.matches(STAGGER)){ // names, times and digits arrive one by one
      Array.from(el.children).forEach((child,i)=>{child.classList.add("reveal");child.style.transitionDelay=`${i*110}ms`;observer.observe(child);});
      return;
    }
    el.classList.add("reveal");el.dataset.revealDelay=String((index%4)+1);observer.observe(el);
  });
  document.querySelectorAll(".couple,.countdown,.event,.rsvp,.wishes,.gift,.closing").forEach(sec=>{const d=document.createElement("div");d.className="batik-divider";d.setAttribute("aria-hidden","true");sec.prepend(d);});
  if(!reduceMotion){
    const heroImage=$("#heroImage");
    const live=new Set();
    const seen=new IntersectionObserver(es=>es.forEach(e=>e.isIntersecting?live.add(e.target):live.delete(e.target)),{rootMargin:"20% 0px"});
    document.querySelectorAll("section").forEach(sec=>seen.observe(sec));
    let raf=0;
    const depth=()=>{
      raf=0;const vh=window.innerHeight;
      const y=Math.min(window.scrollY,vh)*.055;
      if(heroImage)heroImage.style.transform=`scale(1.06) translate3d(0, ${y}px, 0)`;
      live.forEach(sec=>{const r=sec.getBoundingClientRect();const p=(r.top+r.height/2-vh/2)/vh; // -1..1 around screen centre
        sec.style.setProperty("--drift",`${(p*-40).toFixed(1)}px`);   // gold rings drift against the scroll
        sec.style.setProperty("--float",`${(p*-14).toFixed(1)}px`);}); // framed portraits / closing photo ease past
    };
    window.addEventListener("scroll",()=>{if(!raf)raf=requestAnimationFrame(depth);},{passive:true});
    depth();
  }
  loadRemoteWishes();
})();
