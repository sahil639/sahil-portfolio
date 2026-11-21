(() => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Scramble text ---------- */
  const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*()_+{}|:<>?";
  const rand = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)];

  document.querySelectorAll("[data-scramble]").forEach((el) => {
    const text = el.dataset.scramble;
    const speed = Number(el.dataset.speed) || 300;
    const perTick = Number(el.dataset.chars) || 3;
    el.setAttribute("aria-label", text);
    if (reduceMotion) return;

    const slots = [...text].map((c, i) => (c === " " ? -1 : i)).filter((i) => i >= 0);
    let chars = [...text].map((c) => (c === " " ? " " : rand()));
    el.textContent = chars.join("");

    setInterval(() => {
      for (let n = 0; n < perTick; n++) chars[slots[Math.floor(Math.random() * slots.length)]] = rand();
      el.textContent = chars.join("");
    }, speed);
  });

  /* ---------- Copy email ---------- */
  document.querySelectorAll("[data-copy]").forEach((btn) => {
    let timer;
    btn.addEventListener("click", async () => {
      try { await navigator.clipboard.writeText(btn.dataset.copy); } catch (_) { /* clipboard blocked */ }
      btn.classList.add("copied");
      clearTimeout(timer);
      timer = setTimeout(() => btn.classList.remove("copied"), 1600);
    });
  });

  /* ---------- GitHub contributions ---------- */
  const box = document.querySelector("[data-github]");
  if (!box) return;

  const user = box.dataset.github;
  const year = Number(box.dataset.year);
  const CELL = 13, GAP = 3, STEP = CELL + GAP, TOP = 20, RADIUS = 3;
  const COLORS = ["#161b22", "#0e4429", "#006d32", "#26a641", "#39d353"];
  const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  const NS = "http://www.w3.org/2000/svg";

  const node = (tag, attrs) => {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    return n;
  };

  const toWeeks = (days) => {
    if (!days.length) return [];
    const padded = [...Array(new Date(days[0].date).getDay()).fill(null), ...days];
    const weeks = [];
    for (let i = 0; i < padded.length; i += 7) {
      const w = padded.slice(i, i + 7);
      while (w.length < 7) w.push(null);
      weeks.push(w);
    }
    return weeks;
  };

  const render = (weeks, total) => {
    const width = Math.max(weeks.length * STEP - GAP, 0);
    const height = TOP + 7 * STEP - GAP;
    const svg = node("svg", { viewBox: `0 0 ${width} ${height}`, role: "img", "aria-label": `${total} GitHub contributions in ${year}` });

    let lastMonth = -1;
    weeks.forEach((week, x) => {
      const first = week.find((d) => d && d.date);
      if (!first) return;
      const m = new Date(first.date).getMonth();
      if (m !== lastMonth) {
        const t = node("text", { x: x * STEP, y: 11, fill: "#39d353", "font-size": 11, "font-family": "'Courier New', monospace", "letter-spacing": "0.09em" });
        t.textContent = MONTHS[m];
        svg.appendChild(t);
        lastMonth = m;
      }
    });

    weeks.forEach((week, x) => week.forEach((day, y) => {
      if (!day) return;
      const r = node("rect", { x: x * STEP, y: TOP + y * STEP, width: CELL, height: CELL, rx: RADIUS, ry: RADIUS, fill: COLORS[day.level] || COLORS[0] });
      const tip = node("title", {});
      tip.textContent = `${day.count} contribution${day.count === 1 ? "" : "s"} on ${day.date}`;
      r.appendChild(tip);
      svg.appendChild(r);
    }));

    const label = document.createElement("p");
    label.className = "total";
    label.textContent = `${total.toLocaleString()} CONTRIBUTIONS IN ${year}`;
    box.replaceChildren(svg, label);
  };

  fetch(`https://github-contributions-api.jogruber.de/v4/${encodeURIComponent(user)}?y=${year}`)
    .then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then((data) => {
      const days = data.contributions || [];
      const total = (data.total && data.total[year]) ?? days.reduce((s, d) => s + d.count, 0);
      render(toWeeks(days), total);
    })
    .catch(() => {
      box.innerHTML = '<p class="state err">Could not load data — check username or network.</p>';
    });
})();
