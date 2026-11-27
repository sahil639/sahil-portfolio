(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Keyboard shortcuts: press the letter in [ ] ---------- */
  const keys = new Map([...document.querySelectorAll("[data-key]")].map((a) => [a.dataset.key.toLowerCase(), a]));
  addEventListener("keydown", (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey || /input|textarea/i.test(e.target.tagName)) return;
    const a = keys.get(e.key.toLowerCase());
    if (!a) return;
    a.classList.add("flash");
    setTimeout(() => { a.classList.remove("flash"); a.click(); }, 140);
  });

  /* ---------- Hero pixels: a small blinking "S" made of squares ---------- */
  const px = document.querySelector(".pixels");
  if (px) {
    const S = [[1,0],[2,0],[3,0],[0,1],[0,2],[1,2],[2,2],[3,3],[3,4],[0,5],[1,5],[2,5],[6,5],[7,4],[8,3],[9,1]];
    const nodes = S.map(([x, y]) => {
      const i = document.createElement("i");
      i.style.left = `${0.1 + x * 0.085}em`;
      i.style.top = `${y * 0.085}em`;
      px.appendChild(i);
      return i;
    });
    if (!reduce) setInterval(() => {
      nodes.forEach((n) => { n.style.opacity = Math.random() < 0.85 ? 1 : 0; });
    }, 450);
  }

  /* ---------- Figures: generative line drawings ---------- */
  const figs = [...document.querySelectorAll("canvas[data-fig]")];
  const draw = {
    burst(x, w, h, t) {
      const cx = w / 2, cy = h / 2, arms = 6;
      for (let a = 0; a < arms; a++) {
        for (let i = 0; i < 26; i++) {
          const ang = (a / arms) * Math.PI * 2 + i * 0.035 + Math.sin(t * 0.6 + a) * 0.12;
          const r0 = Math.min(w, h) * (0.1 + 0.012 * i);
          const r1 = r0 + Math.min(w, h) * (0.12 + 0.06 * Math.sin(t + i * 0.3 + a));
          x.beginPath();
          x.moveTo(cx + Math.cos(ang) * r0, cy + Math.sin(ang) * r0);
          x.lineTo(cx + Math.cos(ang + 0.25) * r1, cy + Math.sin(ang + 0.25) * r1);
          x.stroke();
        }
      }
    },
    orbits(x, w, h, t) {
      for (let i = 0; i < 9; i++) {
        const cx = w * (0.2 + 0.08 * i) + Math.sin(t * 0.5 + i) * 10;
        const cy = h * 0.5 + Math.cos(t * 0.4 + i * 0.7) * h * 0.2;
        x.beginPath();
        x.ellipse(cx, cy, w * (0.12 + 0.02 * i), h * (0.18 + 0.015 * i), t * 0.15 + i * 0.4, 0, Math.PI * 2);
        x.stroke();
      }
    },
    wave(x, w, h, t) {
      const n = 22, s = w / 26;
      for (let i = 0; i < n; i++) {
        const px = w * 0.06 + i * (w * 0.88 / n);
        const py = h * 0.55 + Math.sin(t * 1.4 + i * 0.45) * h * 0.14;
        x.save();
        x.translate(px, py);
        x.rotate(Math.sin(t + i * 0.3) * 0.6);
        x.strokeRect(-s / 2, -s / 2, s, s);
        x.restore();
      }
    },
  };
  const dots = (x, w, h) => {
    x.fillStyle = "#1f3a4c";
    for (let y = 10; y < h; y += 16) for (let xx = 10; xx < w; xx += 16) x.fillRect(xx, y, 1.5, 1.5);
  };
  const visible = new Set();
  const io = new IntersectionObserver((es) => es.forEach((e) => (e.isIntersecting ? visible.add(e.target) : visible.delete(e.target))));
  figs.forEach((c) => io.observe(c));
  const render = (t) => {
    for (const c of figs) {
      if (!visible.has(c) && t) continue;
      const dpr = devicePixelRatio || 1, w = c.clientWidth, h = c.clientHeight;
      if (c.width !== w * dpr) { c.width = w * dpr; c.height = h * dpr; }
      const x = c.getContext("2d");
      x.setTransform(dpr, 0, 0, dpr, 0, 0);
      x.clearRect(0, 0, w, h);
      dots(x, w, h);
      x.strokeStyle = "#c0c7d1";
      x.lineWidth = 0.8;
      draw[c.dataset.fig](x, w, h, (t || 0) / 1000);
    }
    if (!reduce) requestAnimationFrame(render);
  };
  render(0);

  /* ---------- Project filters ---------- */
  const boxes = [...document.querySelectorAll("[data-filter]")];
  const rows = [...document.querySelectorAll(".row-item")];
  const none = document.querySelector(".rows .none");
  const apply = () => {
    const groups = boxes.filter((b) => b.checked && b.dataset.filter === "group").map((b) => b.value);
    const tags = boxes.filter((b) => b.checked && b.dataset.filter === "tag").map((b) => b.value);
    let shown = 0;
    rows.forEach((r) => {
      const ok = (!groups.length || groups.includes(r.dataset.group)) &&
        (!tags.length || tags.some((t) => r.dataset.tags.split("|").includes(t)));
      r.hidden = !ok;
      shown += ok;
    });
    if (none) none.hidden = shown > 0;
  };
  boxes.forEach((b) => b.addEventListener("change", apply));
  document.querySelector(".clear")?.addEventListener("click", () => { boxes.forEach((b) => (b.checked = false)); apply(); });

  /* ---------- Typing examples ---------- */
  if (!reduce) {
    const typers = [...document.querySelectorAll(".type")];
    const tio = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      tio.unobserve(e.target);
      const el = e.target, text = el.dataset.text;
      let i = 0;
      el.textContent = "";
      el.classList.add("typing");
      const step = () => {
        el.textContent = text.slice(0, ++i);
        if (i < text.length) setTimeout(step, 28 + Math.random() * 40);
      };
      setTimeout(step, 300);
    }), { threshold: 0.6 });
    typers.forEach((t) => tio.observe(t));
  }
})();
