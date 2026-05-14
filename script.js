const header = document.querySelector("[data-header]");
const announcement = document.querySelector("[data-announcement]");
const menuButton = document.querySelector("[data-menu-button]");
const mobileMenu = document.querySelector("[data-mobile-menu]");
const counters = document.querySelectorAll("[data-count]");
const liquidHeroCanvas = document.querySelector("[data-liquid-hero-canvas]");

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

const initLiquidHeroBackground = (canvas) => {
  const ctx = canvas?.getContext("2d", { alpha: false });
  if (!canvas || !ctx) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const state = {
    animationFrame: null,
    height: 0,
    lastFrame: 0,
    running: false,
    width: 0,
  };

  const palette = {
    black: "#02020d",
    deepBlue: "#0c0e4b",
    richBlue: "#1f26aa",
    skyBlue: "rgba(118, 185, 252,",
    mint: "rgba(92, 247, 187,",
    white: "rgba(255, 255, 255,",
  };

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  const turbulence = (x, y, time, seed = 0) => {
    const slow = Math.sin(x * 0.006 + time * 0.32 + seed) * 0.52;
    const cross = Math.sin((x + y) * 0.004 - time * 0.24 + seed * 1.7) * 0.34;
    const fine = Math.sin(x * 0.013 - y * 0.009 + time * 0.5 + seed * 0.4) * 0.14;
    return slow + cross + fine;
  };

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    const dpr = clamp(window.devicePixelRatio || 1, 1, 1.5);
    const width = Math.max(1, Math.floor(rect.width * dpr));
    const height = Math.max(1, Math.floor(rect.height * dpr));

    if (canvas.width === width && canvas.height === height) return;

    canvas.width = width;
    canvas.height = height;
    state.width = width;
    state.height = height;
  };

  const drawBase = (width, height) => {
    const base = ctx.createLinearGradient(0, 0, width, height);
    base.addColorStop(0, palette.black);
    base.addColorStop(0.42, palette.deepBlue);
    base.addColorStop(0.76, palette.richBlue);
    base.addColorStop(1, palette.black);
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, width, height);

    const glow = ctx.createRadialGradient(width * 0.72, height * 0.46, 0, width * 0.72, height * 0.46, width * 0.74);
    glow.addColorStop(0, `${palette.skyBlue} 0.2)`);
    glow.addColorStop(0.38, "rgba(31, 38, 170, 0.32)");
    glow.addColorStop(1, "rgba(2, 2, 13, 0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);

    const leftDepth = ctx.createRadialGradient(width * 0.22, height * 0.68, 0, width * 0.22, height * 0.68, width * 0.62);
    leftDepth.addColorStop(0, "rgba(0, 103, 244, 0.14)");
    leftDepth.addColorStop(0.6, "rgba(12, 14, 75, 0.2)");
    leftDepth.addColorStop(1, "rgba(2, 2, 13, 0)");
    ctx.fillStyle = leftDepth;
    ctx.fillRect(0, 0, width, height);
  };

  const drawLiquidBand = ({ alpha, amplitude, color, frequency, offset, phase, thickness, width, height }) => {
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.filter = `blur(${Math.max(14, width * 0.018)}px)`;

    const gradient = ctx.createLinearGradient(width * -0.1, height * 0.25, width * 1.1, height * 0.85);
    gradient.addColorStop(0, "rgba(255, 255, 255, 0)");
    gradient.addColorStop(0.34, color(alpha * 0.34));
    gradient.addColorStop(0.5, color(alpha));
    gradient.addColorStop(0.66, color(alpha * 0.36));
    gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.fillStyle = gradient;

    ctx.beginPath();

    for (let x = -width * 0.18; x <= width * 1.18; x += width / 24) {
      const y =
        height * offset +
        Math.sin(x * frequency + phase) * amplitude +
        turbulence(x, height * offset, phase, offset * 10) * amplitude * 0.9;

      if (x <= -width * 0.17) ctx.moveTo(x, y - thickness);
      else ctx.lineTo(x, y - thickness);
    }

    for (let x = width * 1.18; x >= -width * 0.18; x -= width / 24) {
      const y =
        height * offset +
        Math.sin(x * frequency + phase + 0.8) * amplitude +
        turbulence(x, height * offset, phase + 1.5, offset * 12) * amplitude;

      ctx.lineTo(x, y + thickness);
    }

    ctx.closePath();
    ctx.fill();
    ctx.restore();
  };

  const drawShadowBand = ({ alpha, amplitude, offset, phase, thickness, width, height }) => {
    ctx.save();
    ctx.globalCompositeOperation = "multiply";
    ctx.filter = `blur(${Math.max(18, width * 0.016)}px)`;

    const gradient = ctx.createLinearGradient(width * -0.12, height * 0.08, width * 1.12, height * 0.82);
    gradient.addColorStop(0, "rgba(2, 2, 13, 0)");
    gradient.addColorStop(0.36, `rgba(2, 2, 13, ${alpha * 0.55})`);
    gradient.addColorStop(0.5, `rgba(2, 2, 13, ${alpha})`);
    gradient.addColorStop(0.66, `rgba(2, 2, 13, ${alpha * 0.48})`);
    gradient.addColorStop(1, "rgba(2, 2, 13, 0)");
    ctx.fillStyle = gradient;

    ctx.beginPath();
    for (let x = -width * 0.2; x <= width * 1.2; x += width / 28) {
      const y =
        height * offset +
        Math.sin(x * 0.0048 + phase) * amplitude +
        turbulence(x, height * offset, phase, 4.6) * amplitude * 1.2;

      if (x <= -width * 0.19) ctx.moveTo(x, y - thickness);
      else ctx.lineTo(x, y - thickness);
    }

    for (let x = width * 1.2; x >= -width * 0.2; x -= width / 28) {
      const y =
        height * offset +
        Math.sin(x * 0.0048 + phase + 0.9) * amplitude +
        turbulence(x, height * offset, phase + 1.8, 6.2) * amplitude * 1.3;

      ctx.lineTo(x, y + thickness);
    }

    ctx.closePath();
    ctx.fill();
    ctx.restore();
  };

  const drawWaveRidge = ({ alpha, color, offset, phase, width, height }) => {
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.filter = `blur(${Math.max(8, width * 0.007)}px)`;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = Math.max(16, height * 0.045);

    const stroke = ctx.createLinearGradient(width * -0.08, height * offset, width * 1.08, height * (offset + 0.18));
    stroke.addColorStop(0, "rgba(255, 255, 255, 0)");
    stroke.addColorStop(0.38, color(alpha * 0.52));
    stroke.addColorStop(0.5, color(alpha));
    stroke.addColorStop(0.62, color(alpha * 0.48));
    stroke.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.strokeStyle = stroke;

    ctx.beginPath();
    for (let x = -width * 0.12; x <= width * 1.12; x += width / 34) {
      const y =
        height * offset +
        Math.sin(x * 0.0052 + phase) * height * 0.07 +
        turbulence(x, height * offset, phase, 9) * height * 0.05;

      if (x <= -width * 0.11) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.restore();
  };

  const drawBeams = (width, height, time) => {
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    ctx.translate(width * 0.5, height * 0.5);
    ctx.rotate(-0.18 + Math.sin(time * 0.08) * 0.035);
    ctx.translate(-width * 0.5, -height * 0.5);
    ctx.filter = `blur(${Math.max(18, width * 0.014)}px)`;

    const beam = ctx.createLinearGradient(0, height * 0.24, width, height * 0.76);
    beam.addColorStop(0, "rgba(255, 255, 255, 0)");
    beam.addColorStop(0.42, "rgba(118, 185, 252, 0.05)");
    beam.addColorStop(0.5, "rgba(255, 255, 255, 0.08)");
    beam.addColorStop(0.58, "rgba(92, 247, 187, 0.035)");
    beam.addColorStop(1, "rgba(255, 255, 255, 0)");

    const drift = Math.sin(time * 0.16) * width * 0.16;
    ctx.fillStyle = beam;
    ctx.fillRect(-width * 0.2 + drift, height * 0.08, width * 1.4, height * 0.32);
    ctx.restore();
  };

  const drawVignette = (width, height) => {
    ctx.save();
    ctx.globalCompositeOperation = "multiply";
    const vignette = ctx.createRadialGradient(width * 0.5, height * 0.48, width * 0.1, width * 0.5, height * 0.48, width * 0.74);
    vignette.addColorStop(0, "rgba(255, 255, 255, 0.95)");
    vignette.addColorStop(0.58, "rgba(40, 44, 120, 0.58)");
    vignette.addColorStop(1, "rgba(2, 2, 13, 0.88)");
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();

    const topShade = ctx.createLinearGradient(0, 0, 0, height);
    topShade.addColorStop(0, "rgba(2, 2, 13, 0.48)");
    topShade.addColorStop(0.36, "rgba(2, 2, 13, 0)");
    topShade.addColorStop(1, "rgba(2, 2, 13, 0.42)");
    ctx.fillStyle = topShade;
    ctx.fillRect(0, 0, width, height);
  };

  const render = (now = performance.now()) => {
    if (!state.running) return;
    if (document.hidden) {
      state.animationFrame = requestAnimationFrame(render);
      return;
    }

    if (now - state.lastFrame < 33) {
      state.animationFrame = requestAnimationFrame(render);
      return;
    }

    state.lastFrame = now;
    resize();

    const { width, height } = state;
    const time = now * 0.00115;

    drawBase(width, height);
    drawShadowBand({
      alpha: 0.68 + Math.sin(time * 0.18) * 0.08,
      amplitude: height * 0.12,
      height,
      offset: 0.25,
      phase: time * 0.34 + 3.2,
      thickness: height * 0.16,
      width,
    });
    drawShadowBand({
      alpha: 0.48 + Math.sin(time * 0.22 + 1.8) * 0.08,
      amplitude: height * 0.1,
      height,
      offset: 0.68,
      phase: -time * 0.28 + 1.4,
      thickness: height * 0.14,
      width,
    });
    drawLiquidBand({
      alpha: 0.56 + Math.sin(time * 0.22) * 0.1,
      amplitude: height * 0.09,
      color: (alpha) => `${palette.skyBlue} ${alpha})`,
      frequency: 0.006,
      height,
      offset: 0.46,
      phase: time * 0.52,
      thickness: height * 0.15,
      width,
    });
    drawLiquidBand({
      alpha: 0.3 + Math.sin(time * 0.28 + 1.4) * 0.06,
      amplitude: height * 0.075,
      color: (alpha) => `${palette.mint} ${alpha})`,
      frequency: 0.0075,
      height,
      offset: 0.58,
      phase: -time * 0.42 + 2.6,
      thickness: height * 0.1,
      width,
    });
    drawLiquidBand({
      alpha: 0.22,
      amplitude: height * 0.13,
      color: (alpha) => `${palette.white} ${alpha})`,
      frequency: 0.0045,
      height,
      offset: 0.34,
      phase: time * 0.32 + 4.4,
      thickness: height * 0.09,
      width,
    });
    drawWaveRidge({
      alpha: 0.34 + Math.sin(time * 0.18) * 0.06,
      color: (alpha) => `${palette.skyBlue} ${alpha})`,
      height,
      offset: 0.43,
      phase: time * 0.46 + 1.1,
      width,
    });
    drawWaveRidge({
      alpha: 0.18 + Math.sin(time * 0.24 + 2) * 0.04,
      color: (alpha) => `${palette.mint} ${alpha})`,
      height,
      offset: 0.57,
      phase: -time * 0.36 + 2.8,
      width,
    });
    drawBeams(width, height, time);
    drawVignette(width, height);

    state.animationFrame = requestAnimationFrame(render);
  };

  const start = () => {
    if (state.running || reduceMotion.matches) {
      resize();
      drawBase(state.width, state.height);
      drawVignette(state.width, state.height);
      return;
    }

    state.running = true;
    state.lastFrame = 0;
    state.animationFrame = requestAnimationFrame(render);
  };

  const stop = () => {
    state.running = false;
    if (state.animationFrame) cancelAnimationFrame(state.animationFrame);
    state.animationFrame = null;
    resize();
    drawBase(state.width, state.height);
    drawVignette(state.width, state.height);
  };

  const resizeObserver = new ResizeObserver(() => {
    resize();
    if (!state.running) {
      drawBase(state.width, state.height);
      drawVignette(state.width, state.height);
    }
  });

  resizeObserver.observe(canvas);
  reduceMotion.addEventListener("change", () => (reduceMotion.matches ? stop() : start()));
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) return;
    if (!reduceMotion.matches) start();
  });

  start();
};

initLiquidHeroBackground(liquidHeroCanvas);
