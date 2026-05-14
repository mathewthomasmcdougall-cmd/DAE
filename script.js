const header = document.querySelector("[data-header]");
const announcement = document.querySelector("[data-announcement]");
const menuButton = document.querySelector("[data-menu-button]");
const mobileMenu = document.querySelector("[data-mobile-menu]");
const counters = document.querySelectorAll("[data-count]");
const heroNoiseCanvas = document.querySelector("[data-hero-noise]");

const setHeaderState = () => {
  const isScrolled = window.scrollY > 24;
  header?.classList.toggle("is-scrolled", isScrolled);
  announcement?.classList.toggle("is-hidden", isScrolled);
};

menuButton?.addEventListener("click", () => {
  const isOpen = mobileMenu?.classList.toggle("is-open");
  menuButton.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
});

mobileMenu?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    mobileMenu.classList.remove("is-open");
    menuButton?.setAttribute("aria-label", "Open navigation");
  });
});

window.addEventListener("scroll", setHeaderState, { passive: true });
setHeaderState();

const animateCounter = (element) => {
  const target = Number(element.dataset.count || 0);
  const duration = 1200;
  const start = performance.now();

  const tick = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    element.textContent = Math.round(target * eased).toLocaleString();
    if (progress < 1) requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);
};

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      animateCounter(entry.target);
      observer.unobserve(entry.target);
    });
  },
  { threshold: 0.5 }
);

counters.forEach((counter) => observer.observe(counter));

const initHeroNoise = (canvas) => {
  const context = canvas.getContext("2d", { alpha: true });
  if (!context) return;

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const noiseTile = document.createElement("canvas");
  const tileSize = 128;
  const noiseOpacity = 0.16;
  noiseTile.width = tileSize;
  noiseTile.height = tileSize;

  const tileContext = noiseTile.getContext("2d", { alpha: true });
  if (!tileContext) return;

  // Build a tiny reusable noise buffer once, then offset it every frame.
  const generateNoise = () => {
    const image = tileContext.createImageData(tileSize, tileSize);

    for (let index = 0; index < image.data.length; index += 4) {
      const value = Math.random() * 255;
      image.data[index] = value;
      image.data[index + 1] = value;
      image.data[index + 2] = value;
      image.data[index + 3] = 255;
    }

    tileContext.putImageData(image, 0, 0);
  };

  const resize = () => {
    const bounds = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.max(1, Math.round(bounds.width * dpr));
    canvas.height = Math.max(1, Math.round(bounds.height * dpr));
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    context.imageSmoothingEnabled = false;
  };

  const drawNoise = (width, height) => {
    const offsetX = Math.random() * tileSize;
    const offsetY = Math.random() * tileSize;

    context.save();
    context.globalAlpha = noiseOpacity;
    context.translate(-offsetX, -offsetY);

    for (let x = -tileSize; x < width + tileSize; x += tileSize) {
      for (let y = -tileSize; y < height + tileSize; y += tileSize) {
        context.drawImage(noiseTile, x, y, tileSize, tileSize);
      }
    }

    context.restore();
  };

  const draw = (time = 0) => {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    context.clearRect(0, 0, width, height);
    drawNoise(width, height);

    if (!prefersReducedMotion.matches) {
      requestAnimationFrame(draw);
    }
  };

  generateNoise();
  resize();
  draw();

  window.addEventListener("resize", resize, { passive: true });
  prefersReducedMotion.addEventListener("change", () => {
    resize();
    draw(performance.now());
  });
};

if (heroNoiseCanvas) {
  initHeroNoise(heroNoiseCanvas);
}
