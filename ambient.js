(() => {
  "use strict";
  // Gold dust drifting over the hero and closing photo. Tiny canvas, capped particles, 30 fps,
  // paused when offscreen / tab hidden / gate closed. Skipped entirely for reduced-motion and Save-Data.
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const saver = navigator.connection && navigator.connection.saveData;
  if (reduce || saver) return;

  const small = window.innerWidth < 500;
  const hosts = [
    { el: document.querySelector(".hero"), count: small ? 16 : 28 },
    { el: document.querySelector(".closing"), count: small ? 10 : 18 }
  ].filter(h => h.el);
  if (!hosts.length) return;

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const rand = (a, b) => a + Math.random() * (b - a);

  hosts.forEach(h => {
    const canvas = document.createElement("canvas");
    canvas.className = "ambient-dust";
    canvas.setAttribute("aria-hidden", "true");
    h.el.appendChild(canvas);
    h.canvas = canvas;
    h.ctx = canvas.getContext("2d");
    h.visible = false;
    h.parts = Array.from({ length: h.count }, () => ({
      x: Math.random(), y: Math.random(), r: rand(.6, 1.9),
      vy: rand(5, 16), amp: rand(6, 22), f: rand(.15, .45), ph: rand(0, 6.28),
      a: rand(.25, .75), tw: rand(.6, 1.6)
    }));
    const fit = () => {
      const r = h.el.getBoundingClientRect();
      h.w = r.width; h.h = r.height;
      canvas.width = Math.round(r.width * dpr); canvas.height = Math.round(r.height * dpr);
      h.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    fit();
    new ResizeObserver(fit).observe(h.el);
    new IntersectionObserver(es => es.forEach(e => { h.visible = e.isIntersecting; }), { rootMargin: "10% 0px" }).observe(h.el);
  });

  let last = 0, running = false, t0 = performance.now();
  function frame(now) {
    if (document.hidden) { running = false; return; }
    if (document.body.classList.contains("is-locked")) { setTimeout(() => requestAnimationFrame(frame), 400); return; }
    requestAnimationFrame(frame);
    if (now - last < 33) return; // ~30 fps
    const dt = Math.min((now - last) / 1000, .1); last = now;
    const t = (now - t0) / 1000;
    hosts.forEach(h => {
      if (!h.visible) return;
      h.canvas.classList.add("on");
      const c = h.ctx; c.clearRect(0, 0, h.w, h.h);
      h.parts.forEach(p => {
        p.y -= (p.vy * dt) / h.h;
        if (p.y < -.03) { p.y = 1.03; p.x = Math.random(); }
        const x = p.x * h.w + Math.sin(t * p.f + p.ph) * p.amp, y = p.y * h.h;
        const a = p.a * (.6 + .4 * Math.sin(t * p.tw + p.ph));
        c.fillStyle = "#d9c28a";
        if (p.r > 1.3) { c.globalAlpha = a * .16; c.beginPath(); c.arc(x, y, p.r * 3.2, 0, 6.283); c.fill(); }
        c.globalAlpha = a; c.beginPath(); c.arc(x, y, p.r, 0, 6.283); c.fill();
      });
      c.globalAlpha = 1;
    });
  }
  function start() { if (!running) { running = true; requestAnimationFrame(frame); } }
  document.addEventListener("visibilitychange", () => { if (!document.hidden) start(); });
  start();
})();
