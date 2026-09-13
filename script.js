(() => {
  "use strict";
  const C = window.WEDDING_CONFIG;
  const $ = (s) => document.querySelector(s);

  const text = (id, value) => { const el = document.getElementById(id); if (el) el.textContent = value; };
  const img = (id, src) => { const el = document.getElementById(id); if (el) el.src = normalizeAssetPath(src); };

  // The GitHub Pages repo currently stores media at the repository root.
  // Keep config.js compatible with the original /assets paths as well.
  function normalizeAssetPath(src) {
    if (!src) return "";
    return String(src).replace(/^\.\/?assets\/images\//, "").replace(/^\.\/?assets\/audio\//, "");
  }

  // Content
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
  img("coupleImage", C.assets.couple);
  img("galleryWide", C.assets.engagementWide);
  img("galleryBride", C.assets.bride);
  img("galleryGroom", C.assets.groom);
  img("galleryClose", C.assets.engagementClose);
  img("closingImage", C.assets.couple);

  $("#mapsLink").href = C.event.mapsUrl;
  $("#calendarLink").href = buildGoogleCalendarUrl();

  // Countdown
  const target = new Date(C.event.startISO).getTime();
  function tick() {
    const diff = Math.max(0, target - Date.now());
    const d = Math.floor(diff / 86400000);
    const h = Math.floor(diff / 3600000) % 24;
    const m = Math.floor(diff / 60000) % 60;
    const s = Math.floor(diff / 1000) % 60;
    text("days", String(d).padStart(2,"0"));
    text("hours", String(h).padStart(2,"0"));
    text("minutes", String(m).padStart(2,"0"));
    text("seconds", String(s).padStart(2,"0"));
  }
  tick(); setInterval(tick, 1000);

  function googleDate(iso) {
    return new Date(iso).toISOString().replace(/[-:]/g,"").replace(/\.\d{3}Z$/,"Z");
  }
  function buildGoogleCalendarUrl() {
    const start = googleDate(C.event.startISO);
    const end = googleDate(C.event.endISO);
    const params = new URLSearchParams({
      action: "TEMPLATE",
      text: C.event.title,
      dates: `${start}/${end}`,
      location: `${C.event.venue}, ${C.event.address}`,
      details: C.event.calendarDescription
    });
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  }

  // RSVP + wishes
  const STORAGE_KEY = "isti-adrian-rsvp-wishes-v1";
  const form = $("#rsvpForm");
  const status = $("#formStatus");
  const submit = $("#submitButton");

  function readLocal() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
  }
  function saveLocal(item) {
    const all = readLocal(); all.unshift(item);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all.slice(0,50)));
  }
  function escapeHTML(str) {
    return String(str).replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" }[c]));
  }
  function renderWishes(items) {
    const list = $("#wishesList");
    if (!items.length) {
      list.innerHTML = '<div class="empty-state">Be the first to leave a wish.</div>';
      return;
    }
    list.innerHTML = items.filter(x => x.message).slice(0,30).map(x => `
      <article class="wish">
        <div class="wish__name">${escapeHTML(x.name || "A guest")}</div>
        <p class="wish__message">“${escapeHTML(x.message)}”</p>
        ${x.date ? `<div class="wish__meta">${escapeHTML(x.date)}</div>` : ""}
      </article>
    `).join("");
  }

  function loadLocalWishes() { renderWishes(readLocal()); }

  function loadRemoteWishes() {
    if (!C.googleAppsScriptUrl) { loadLocalWishes(); return; }
    const cb = `weddingWishes_${Date.now()}`;
    const script = document.createElement("script");
    const cleanup = () => { try { delete window[cb]; } catch {} script.remove(); };
    window[cb] = (data) => {
      if (Array.isArray(data)) {
        const local = readLocal();
        renderWishes([...local, ...data].filter((v,i,a) =>
          i === a.findIndex(t => (t.timestamp || t.date || "") + (t.name || "") + (t.message || "") ===
            (v.timestamp || v.date || "") + (v.name || "") + (v.message || ""))
        ));
      } else loadLocalWishes();
      cleanup();
    };
    script.onerror = () => { loadLocalWishes(); cleanup(); };
    script.src = `${C.googleAppsScriptUrl.replace(/\/$/,"")}?action=wishes&callback=${cb}`;
    document.body.appendChild(script);
    setTimeout(cleanup, 10000);
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const item = {
      name: String(fd.get("name") || "").trim(),
      attendance: String(fd.get("attendance") || ""),
      guests: Number(fd.get("guests") || 1),
      message: String(fd.get("message") || "").trim(),
      date: new Date().toLocaleDateString("en-GB", {day:"2-digit",month:"short",year:"numeric"}),
      timestamp: new Date().toISOString()
    };
    if (!item.name || !item.message) return;

    submit.disabled = true; submit.textContent = "Sending…";
    saveLocal(item);
    renderWishes(readLocal());
    status.textContent = "Thank you — your RSVP has been received.";

    if (C.googleAppsScriptUrl) {
      try {
        const body = new URLSearchParams(item);
        await fetch(C.googleAppsScriptUrl, {
          method:"POST", mode:"no-cors",
          headers: {"Content-Type":"application/x-www-form-urlencoded;charset=UTF-8"},
          body
        });
        status.textContent = "Thank you — your RSVP has been recorded.";
      } catch {
        status.textContent = "Saved on this device. Please try again when you have a connection.";
      }
      setTimeout(loadRemoteWishes, 1200);
    }
    form.reset();
    submit.disabled = false; submit.textContent = "Send RSVP";
  });

  document.querySelectorAll(".copy-button").forEach(btn => {
    btn.addEventListener("click", async () => {
      const target = document.getElementById(btn.dataset.copyTarget);
      const value = target?.textContent?.trim() || "";
      try {
        await navigator.clipboard.writeText(value);
        const old = btn.textContent; btn.textContent = "Copied ✓";
        setTimeout(() => btn.textContent = old, 1400);
      } catch { window.prompt("Copy this:", value); }
    });
  });

  // Music: attempt autoplay immediately. Modern browsers may block unmuted
  // autoplay; in that case the first tap/click/keypress starts it automatically.
  const audio = $("#weddingMusic"), musicButton = $("#musicButton"), musicControl = $(".music-control");
  audio.src = normalizeAssetPath(C.assets.music);
  audio.preload = "auto";
  audio.autoplay = true;

  async function startMusic() {
    try {
      await audio.play();
      musicButton.setAttribute("aria-pressed","true");
      musicButton.setAttribute("aria-label","Pause wedding music");
      musicControl.classList.add("playing");
      return true;
    } catch {
      return false;
    }
  }

  // This works on browsers that allow autoplay and also satisfies browser
  // policies that require a user gesture without leaving the user wondering.
  startMusic();
  ["pointerdown", "touchstart", "keydown"].forEach(eventName => {
    window.addEventListener(eventName, () => {
      if (audio.paused) startMusic();
    }, { once: true, passive: true });
  });

  musicButton.addEventListener("click", async () => {
    try {
      if (audio.paused) await startMusic();
      else {
        audio.pause();
        musicButton.setAttribute("aria-pressed","false");
        musicButton.setAttribute("aria-label","Play wedding music");
        musicControl.classList.remove("playing");
      }
    } catch { status.textContent = "Tap the music button again to start the song."; }
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add("visible"); observer.unobserve(entry.target); } });
  }, {threshold:.12});
  document.querySelectorAll("section > *").forEach(el => {
    if (!el.classList.contains("hero__image") && !el.classList.contains("hero__veil")) { el.classList.add("reveal"); observer.observe(el); }
  });

  loadRemoteWishes();
})();