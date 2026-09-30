const MIN = "\u2212";
const fmt = n => String(n).replace("-", MIN);
const esc = s => String(s).replace(/[&<>]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));

/* ---------- Gráficos (SVG) ---------- */
function graph(g){
  const W = 360, H = g.h || 270;
  const ml = g.cross ? 18 : 48, mr = 16, mt = 14, mb = g.cross ? 22 : 40;
  const [x0, x1] = g.xr, [y0, y1] = g.yr;
  const sx = x => ml + (x - x0) / (x1 - x0) * (W - ml - mr);
  const sy = y => H - mb - (y - y0) / (y1 - y0) * (H - mt - mb);
  const xs = g.xs || 1, ys = g.ys || 1;
  const ax = g.cross ? sx(0) : sx(x0), ay = g.cross ? sy(0) : sy(y0);
  const hl = g.hl || {};
  let s = `<svg viewBox="0 0 ${W} ${H}" class="gr" role="img" aria-label="Gráfico de una función">`;
  for (let x = x0; x <= x1; x += xs) s += `<line class="gl" x1="${sx(x)}" y1="${sy(y0)}" x2="${sx(x)}" y2="${sy(y1)}"/>`;
  for (let y = y0; y <= y1; y += ys) s += `<line class="gl" x1="${sx(x0)}" y1="${sy(y)}" x2="${sx(x1)}" y2="${sy(y)}"/>`;
  s += `<line class="ax" x1="${sx(x0)}" y1="${ay}" x2="${sx(x1)}" y2="${ay}"/>`;
  s += `<line class="ax" x1="${ax}" y1="${sy(y0)}" x2="${ax}" y2="${sy(y1)}"/>`;
  for (let x = x0; x <= x1; x += xs){
    if (g.cross && x === 0) continue;
    const lab = g.xfmt === "hora" ? x + ":00" : fmt(x);
    s += `<text class="tk" x="${sx(x)}" y="${ay + 14}" text-anchor="middle">${lab}</text>`;
  }
  for (let y = y0; y <= y1; y += ys){
    if (g.cross && y === 0) continue;
    s += `<text class="tk" x="${ax - 6}" y="${sy(y) + 4}" text-anchor="end">${fmt(y)}</text>`;
  }
  if (g.xt) s += `<text class="tt" x="${(sx(x0) + sx(x1)) / 2}" y="${H - 4}" text-anchor="middle">${esc(g.xt)}</text>`;
  if (g.yt) s += `<text class="tt" transform="rotate(-90 12 ${H / 2})" x="12" y="${H / 2}" text-anchor="middle">${esc(g.yt)}</text>`;
  if (hl.dom) s += `<line class="bd" x1="${sx(hl.dom[0])}" y1="${ay}" x2="${sx(hl.dom[1])}" y2="${ay}"/>`;
  if (hl.img) s += `<line class="bi" x1="${ax}" y1="${sy(hl.img[0])}" x2="${ax}" y2="${sy(hl.img[1])}"/>`;
  s += `<polyline class="ln" points="${g.pts.map(p => sx(p[0]) + "," + sy(p[1])).join(" ")}"/>`;
  if (g.dots) g.pts.forEach(p => s += `<circle class="dt" cx="${sx(p[0])}" cy="${sy(p[1])}" r="3.6"/>`);
  (g.mk || []).forEach(m => {
    s += m[2] === "o"
      ? `<circle class="op" cx="${sx(m[0])}" cy="${sy(m[1])}" r="5"/>`
      : `<circle class="dt" cx="${sx(m[0])}" cy="${sy(m[1])}" r="4.6"/>`;
  });
  (hl.pts || []).forEach(p => {
    if (hl.guides !== false){
      s += `<line class="gd" x1="${sx(p[0])}" y1="${sy(p[1])}" x2="${sx(p[0])}" y2="${ay}"/>`;
      s += `<line class="gd" x1="${sx(p[0])}" y1="${sy(p[1])}" x2="${ax}" y2="${sy(p[1])}"/>`;
    }
    s += `<circle class="ring" cx="${sx(p[0])}" cy="${sy(p[1])}" r="8"/>`;
  });
  return s + "</svg>";
}

/* ---------- Estado ---------- */
const app = document.getElementById("app");
let QZ, Q, done = {}, queue = [], pos = 0, order = [], locked = false;

const TOP = `<div class="top"><a href="index.html">← Todos los quizzes</a></div>`;

function fail(msg){
  app.innerHTML = `${TOP}<div class="card"><h1>Ups</h1><p>${esc(msg)}</p></div>`;
}

async function load(){
  const id = new URLSearchParams(location.search).get("q") || "";
  if (!/^[a-z0-9-]+$/.test(id)) return fail("Falta indicar qué quiz abrir.");
  try {
    const r = await fetch(`quizzes/${id}.json`, { cache: "no-cache" });
    if (!r.ok) throw new Error(r.status);
    QZ = await r.json();
  } catch (e) { return fail("No encontré ese quiz."); }
  Q = QZ.preguntas;
  document.title = `${QZ.titulo} – Quiz`;
  intro();
}

function shuffle(a){
  a = a.slice();
  for (let i = a.length - 1; i > 0; i--){ const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

function intro(){
  app.innerHTML = `${TOP}<div class="card">
    <h1>${esc(QZ.titulo)}</h1>
    <p>${esc(QZ.descripcion || "")}</p>
    <ul class="ideas"><li>${Q.length} preguntas, unos 10 minutos</li><li>Te explica cada respuesta</li><li>No es una nota: es para ver qué te quedó firme</li></ul>
    <button class="btn" id="go">Empezar</button></div>`;
  document.getElementById("go").onclick = () => start(Q.map((_, i) => i));
}

function start(list){ queue = list; pos = 0; render(); window.scrollTo(0, 0); }

function render(){
  if (pos >= queue.length) return summary();
  const qi = queue[pos], q = Q[qi];
  order = shuffle(q.opciones.map((_, i) => i));
  locked = false;
  app.innerHTML = `
    <div class="prog"><div style="width:${pos / queue.length * 100}%"></div></div>
    <div class="meta"><span>Pregunta ${pos + 1} de ${queue.length}</span><span class="chip">${esc(q.tema)}</span></div>
    <div class="card">
      <p class="q">${esc(q.texto)}</p>
      ${q.grafico ? `<div id="gw">${graph(QZ.graficos[q.grafico])}</div><div id="lg"></div>` : ""}
      <div id="opts">${order.map((oi, k) => `<button class="opt" data-k="${k}"><span class="let">${"ABCDEF"[k]}</span><span>${esc(q.opciones[oi])}</span></button>`).join("")}</div>
      <div id="fb"></div>
    </div>`;
  document.querySelectorAll(".opt").forEach(b => b.onclick = () => answer(+b.dataset.k));
}

function answer(k){
  if (locked) return;
  locked = true;
  const qi = queue[pos], q = Q[qi];
  const ok = order[k] === q.correcta;
  done[qi] = ok;
  document.querySelectorAll(".opt").forEach((b, i) => {
    b.disabled = true;
    if (order[i] === q.correcta) b.classList.add("ok");
    else if (i === k) b.classList.add("bad");
    else b.classList.add("dim");
  });
  const hl = q.resaltar;
  if (q.grafico && hl){
    document.getElementById("gw").innerHTML = graph(Object.assign({}, QZ.graficos[q.grafico], { hl }));
    if (hl.dom || hl.img){
      document.getElementById("lg").innerHTML = `<div class="lg">${hl.dom ? '<span class="sw" style="background:var(--blue)"></span>Dominio (eje x)' : ""}${hl.img ? '<span class="sw" style="background:var(--green)"></span>Imagen (eje y)' : ""}</div>`;
    }
  }
  const last = pos + 1 >= queue.length;
  document.getElementById("fb").innerHTML = `
    <div class="fb ${ok ? "good" : "wrong"}"><strong>${ok ? "¡Bien!" : "No era esa."}</strong> ${esc(q.explicacion)}</div>
    <button class="btn" id="nx">${last ? "Ver resultado" : "Siguiente"}</button>`;
  document.getElementById("nx").onclick = () => { pos++; render(); window.scrollTo(0, 0); };
  document.getElementById("fb").scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function summary(){
  const total = Q.length, good = Q.filter((_, i) => done[i]).length;
  const failed = Q.map((_, i) => i).filter(i => !done[i]);
  const temas = QZ.temas.map(t => {
    const idx = Q.map((q, i) => q.tema === t ? i : -1).filter(i => i >= 0);
    return { t, n: idx.filter(i => done[i]).length, m: idx.length };
  }).filter(x => x.m > 0);
  const msg = good === total ? "¡Perfecto! Te quedó todo firme."
    : good >= total * 0.75 ? "¡Muy bien! Repasá lo que falló y listo."
    : good >= total * 0.5 ? "Vas bien. Hay un par de cosas para afianzar."
    : "Es un repaso: sirve justamente para ver qué falta. Lo vemos en la próxima clase.";
  const cons = QZ.consejos || {};
  app.innerHTML = `${TOP}<div class="card">
    <h1>Resultado</h1>
    <div class="score">${good} / ${total}</div>
    <p>${msg}</p>
    ${temas.map(x => `<div class="row"><span class="nm">${esc(x.t)}</span><span class="bar"><div style="width:${x.n / x.m * 100}%"></div></span><span class="n">${x.n}/${x.m}</span></div>`).join("")}
    ${temas.filter(x => x.n < x.m && cons[x.t]).map(x => `<p class="tip"><strong>${esc(x.t)}:</strong> ${esc(cons[x.t])}</p>`).join("")}
    ${failed.length ? `<button class="btn" id="rt">Repetir las que fallé (${failed.length})</button>` : ""}
    <button class="btn sec" id="rs">Empezar de nuevo</button></div>`;
  if (failed.length) document.getElementById("rt").onclick = () => start(failed);
  document.getElementById("rs").onclick = () => { Object.keys(done).forEach(k => delete done[k]); start(Q.map((_, i) => i)); };
  window.scrollTo(0, 0);
}

load();
