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

  gallery.className = "gallery-slider";
  gallery.setAttribute("aria-label", "Wedding photo gallery");
  gallery.innerHTML = `
    <div class="gallery-slider__viewport">
      <div class="gallery-slider__track"></div>
    </div>
    <div class="gallery-slider__controls">
      <button type="button" class="gallery-slider__arrow gallery-slider__arrow--prev" aria-label="Previous photo">←</button>
      <div class="gallery-slider__count" aria-live="polite"><span class="gallery-slider__current">01</span><span>/</span><span>${String(images.length).padStart(2, "0")}</span></div>
      <button type="button" class="gallery-slider__arrow gallery-slider__arrow--next" aria-label="Next photo">→</button>
    </div>`;

  const viewport = gallery.querySelector(".gallery-slider__viewport");
  const track = gallery.querySelector(".gallery-slider__track");
  const currentEl = gallery.querySelector(".gallery-slider__current");

  const makeSlide = (item, clone = false) => {
    const figure = document.createElement("figure");
    figure.className = "gallery-slide";
    if (clone) figure.setAttribute("aria-hidden", "true");
    const img = document.createElement("img");
    img.src = item.src;
    img.alt = item.alt;
    img.loading = "lazy";
    figure.appendChild(img);
    return figure;
  };

  // Clones create a seamless loop in both directions without a visible reset.
  track.appendChild(makeSlide(images[images.length - 1], true));
  images.forEach(item => track.appendChild(makeSlide(item)));
  track.appendChild(makeSlide(images[0], true));

  let index = 1;
  let timer = null;
  let isAnimating = false;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function setPosition(animate = true) {
    track.style.transition = animate && !reduceMotion ? "transform 850ms cubic-bezier(.22,.72,.18,1)" : "none";
    track.style.transform = `translate3d(${-index * 100}%, 0, 0)`;
    currentEl.textContent = String(((index - 1 + images.length) % images.length) + 1).padStart(2, "0");
  }

  function go(nextIndex) {
    if (isAnimating) return;
    isAnimating = true;
    index = nextIndex;
    setPosition(true);
    window.setTimeout(() => {
      if (index === 0) {
        index = images.length;
        setPosition(false);
      } else if (index === images.length + 1) {
        index = 1;
        setPosition(false);
      }
      isAnimating = false;
    }, reduceMotion ? 20 : 880);
  }

  function next() { go(index + 1); }
  function prev() { go(index - 1); }

  gallery.querySelector(".gallery-slider__arrow--next").addEventListener("click", next);
  gallery.querySelector(".gallery-slider__arrow--prev").addEventListener("click", prev);

  let startX = 0;
  let startY = 0;
  let dragging = false;
  viewport.addEventListener("touchstart", event => {
    const touch = event.changedTouches[0];
    startX = touch.clientX;
    startY = touch.clientY;
    dragging = true;
    stopAuto();
  }, { passive: true });
  viewport.addEventListener("touchend", event => {
    if (!dragging) return;
    dragging = false;
    const touch = event.changedTouches[0];
    const dx = touch.clientX - startX;
    const dy = touch.clientY - startY;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) next(); else prev();
    }
    startAuto();
  }, { passive: true });

  gallery.addEventListener("mouseenter", stopAuto);
  gallery.addEventListener("mouseleave", startAuto);
  gallery.addEventListener("focusin", stopAuto);
  gallery.addEventListener("focusout", startAuto);

  function startAuto() {
    if (reduceMotion || timer) return;
    timer = window.setInterval(next, 4200);
  }
  function stopAuto() {
    if (timer) window.clearInterval(timer);
    timer = null;
  }

  setPosition(false);
  startAuto();
})();
