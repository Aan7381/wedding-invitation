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
    @media(min-width:700px){
      .couple-card{grid-template-columns:1fr 1fr;gap:70px;align-items:start}
      .couple-amp{position:absolute;left:50%;top:49%;transform:translate(-50%,-50%);z-index:5;margin:0;background:var(--ink);padding:12px 14px}
      .couple-person--bride,.couple-person--groom{padding:0}
    }
    @media(max-width:699px){
      .invitation-gate__guest{max-width:86vw;margin-left:auto;margin-right:auto;line-height:1.1}
      .couple-photo-pair{will-change:transform}
      .couple-photo-wrap--secondary{box-shadow:0 16px 36px rgba(0,0,0,.32)}
      .schedule-item strong{white-space:nowrap}
    }
  `;
  document.head.appendChild(premiumStyle);

  const gate = document.createElement("div");
  gate.className = "invitation-gate";
  gate.innerHTML = `
    <div class="invitation-gate__inner">
      <div class="invitation-gate__monogram">I & A</div>
      <div class="invitation-gate__rule"></div>
      <p>THE WEDDING OF</p>
      <h2>Isti & Adrian</h2>
      <p>Minggu, 15 November 2026</p>
      ${guestName ? `<p class="invitation-gate__guest">Dear, ${escapeHTML(guestName)}</p>` : ""}
      <button class="invitation-gate__open" type="button">Buka Undangan</button>
    </div>`;
  document.body.prepend(gate);
  document.body.classList.add("is-locked");

  text("heroBride", C.couple.bride.split(" ")[0]);
  text("heroGroom", C.couple.groom.split(" ")[0]);
  text("heroDate", C.event.dateLabel);
  text("eventDate", C.event.dateLabel);
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
  img("galleryWide", C.assets.galleryOne);
  img("galleryBride", C.assets.galleryTwo);
  img("galleryGroom", C.assets.engagementWide);
  img("galleryClose", C.assets.engagementClose);
  img("closingImage", C.assets.couple);

  function buildCouplePhotoPairs() {
    const people = [
      { selector: ".couple-person--bride", src: C.assets.brideSecond, label: "THE BRIDE" },
      { selector: ".couple-person--groom", src: C.assets.groomSecond, label: "THE GROOM" }
    ];
    people.forEach(person => {
      const article = document.querySelector(person.selector);
      const original = article?.querySelector(".couple-photo-wrap");
      if (!article || !original || article.querySelector(".couple-photo-pair")) return;
      original.classList.add("couple-photo-wrap--main");
      const pair = document.createElement("div");
      pair.className = "couple-photo-pair";
      original.parentNode.insertBefore(pair, original);
      pair.appendChild(original);
      const secondary = document.createElement("div");
      secondary.className = "couple-photo-wrap couple-photo-wrap--secondary";
      const secondaryImg = document.createElement("img");
      secondaryImg.src = person.src || "";
      secondaryImg.alt = person.label;
      secondaryImg.loading = "lazy";
      secondary.appendChild(secondaryImg);
      pair.appendChild(secondary);
      const names = article.querySelector(".names");
      if (names && !names.querySelector(".person-label")) {
        const label = document.createElement("span");
        label.className = "person-label";
        label.textContent = person.label;
        names.prepend(label);
      }
    });
  }
  buildCouplePhotoPairs();

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
  const openButton=$(".invitation-gate__open");openButton.addEventListener("click",async()=>{document.body.classList.remove("is-locked");gate.classList.add("is-opening");await startMusic();setTimeout(()=>gate.remove(),1100);});
  startMusic();["pointerdown","touchstart","keydown"].forEach(eventName=>window.addEventListener(eventName,()=>{if(audio.paused)startMusic();},{once:true,passive:true}));
  musicButton.addEventListener("click",async()=>{try{if(audio.paused)await startMusic();else{audio.pause();musicButton.setAttribute("aria-pressed","false");musicButton.setAttribute("aria-label","Play wedding music");musicControl.classList.remove("playing");}}catch{status.textContent="Tap the music button again to start the song.";}});

  const reduceMotion=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add("visible");observer.unobserve(entry.target);}});},{threshold:.12});
  document.querySelectorAll("section > *").forEach((el,index)=>{if(!el.classList.contains("hero__image")&&!el.classList.contains("hero__veil")){el.classList.add("reveal");el.dataset.revealDelay=String((index%4)+1);observer.observe(el);}});
  if(!reduceMotion){const heroImage=$("#heroImage");let raf=0;const parallax=()=>{raf=0;const y=Math.min(window.scrollY,window.innerHeight)*.055;if(heroImage)heroImage.style.transform=`scale(1.06) translate3d(0, ${y}px, 0)`;};window.addEventListener("scroll",()=>{if(!raf)raf=requestAnimationFrame(parallax);},{passive:true});}
  loadRemoteWishes();
})();
