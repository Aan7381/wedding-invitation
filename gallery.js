(() => {
  "use strict";
  const C = window.WEDDING_CONFIG;
  const gallery = document.querySelector(".gallery-grid");
  if (!gallery || !C?.assets) return;

  const images = [
    { src: C.assets.brideGallery || "assets/images/1.jpeg", alt: "Isti — gallery" },
    { src: C.assets.groomGallery || "assets/images/2.jpeg", alt: "Adrian — gallery" },
    { src: C.assets.galleryOne || "assets/images/3.jpeg", alt: "Isti & Adrian — gallery" },
    { src: C.assets.galleryTwo || "assets/images/4.jpeg", alt: "Isti & Adrian — gallery" },
    { src: C.assets.engagementWide, alt: "Isti & Adrian — engagement" },
    { src: C.assets.engagementClose, alt: "Isti & Adrian — engagement" }
  ].filter(item => item.src);

  if (!images.length) return;

  // A native scroll-snap story: one photo per screen, swipe or arrows, thin progress line.
  // No timers, no cloned slides, no JS-driven transforms — the browser does the scrolling.
  gallery.className = "gallery-slider";
  gallery.setAttribute("aria-label", "Wedding photo gallery");
  gallery.innerHTML = `
    <div class="gallery-slider__viewport" tabindex="0" role="group" aria-roledescription="carousel" aria-label="Photos">
      <div class="gallery-slider__track"></div>
    </div>
    <div class="gallery-slider__controls">
      <button type="button" class="gallery-slider__arrow gallery-slider__arrow--prev" aria-label="Previous photo">←</button>
      <div class="gallery-slider__count" aria-live="polite"><span class="gallery-slider__current">01</span><span>/</span><span>${String(images.length).padStart(2, "0")}</span></div>
      <button type="button" class="gallery-slider__arrow gallery-slider__arrow--next" aria-label="Next photo">→</button>
    </div>
    <div class="gallery-slider__progress" aria-hidden="true"><i></i></div>`;

  const viewport = gallery.querySelector(".gallery-slider__viewport");
  const track = gallery.querySelector(".gallery-slider__track");
  const currentEl = gallery.querySelector(".gallery-slider__current");
  const bar = gallery.querySelector(".gallery-slider__progress i");

  images.forEach((item, i) => {
    const figure = document.createElement("figure");
    figure.className = "gallery-slide";
    const img = document.createElement("img");
    img.src = item.src;
    img.alt = item.alt;
    img.decoding = "async";
    img.loading = i === 0 ? "eager" : "lazy"; // only the first photo costs bandwidth up front
    figure.appendChild(img);
    track.appendChild(figure);
  });

  const slides = Array.from(track.children);
  const step = () => (slides[1] ? slides[1].offsetLeft - slides[0].offsetLeft : viewport.clientWidth);
  const indexNow = () => Math.min(slides.length - 1, Math.max(0, Math.round(viewport.scrollLeft / step())));

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let raf = 0;
  function paint() {
    raf = 0;
    const max = viewport.scrollWidth - viewport.clientWidth;
    bar.style.transform = `scaleX(${max > 0 ? viewport.scrollLeft / max : 0})`;
    currentEl.textContent = String(indexNow() + 1).padStart(2, "0");
  }
  viewport.addEventListener("scroll", () => { if (!raf) raf = requestAnimationFrame(paint); }, { passive: true });

  const goTo = n => {
    const i = Math.min(slides.length - 1, Math.max(0, n));
    viewport.scrollTo({ left: i * step(), behavior: reduceMotion ? "auto" : "smooth" });
  };
  gallery.querySelector(".gallery-slider__arrow--next").addEventListener("click", () => goTo(indexNow() + 1));
  gallery.querySelector(".gallery-slider__arrow--prev").addEventListener("click", () => goTo(indexNow() - 1));
  viewport.addEventListener("keydown", e => {
    if (e.key === "ArrowRight") { e.preventDefault(); goTo(indexNow() + 1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); goTo(indexNow() - 1); }
  });

  // Desktop mouse drag (touch uses native scrolling).
  let down = false, startX = 0, startLeft = 0;
  viewport.addEventListener("pointerdown", e => {
    if (e.pointerType !== "mouse") return;
    down = true; startX = e.clientX; startLeft = viewport.scrollLeft;
    viewport.classList.add("is-dragging");
  });
  window.addEventListener("pointermove", e => { if (down) viewport.scrollLeft = startLeft - (e.clientX - startX); });
  window.addEventListener("pointerup", () => {
    if (!down) return;
    down = false;
    viewport.classList.remove("is-dragging");
    goTo(indexNow());
  });

  paint();
})();
