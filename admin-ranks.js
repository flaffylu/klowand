/* Admin: Ranglisten ansehen und Einträge löschen. Braucht aus admin.html: fs, isAdmin, WAENDE, esc, wallName, notice. */
(function () {
  const GAMES = { fang: "Klorollen-Fang", reflex: "Spül-Reflex", stapel: "Klopapier-Stapeln" };
  const $ = id => document.getElementById(id);
  const view = $("ranksView");
  let wall = Object.keys(WAENDE)[0], game = "fang", confirmId = null, rows = [];

  document.querySelectorAll(".views [data-v]").forEach(b => b.onclick = () => {
    const ranks = b.dataset.v === "ranks";
    document.querySelectorAll(".views [data-v]").forEach(x => x.setAttribute("aria-pressed", x === b));
    $("wallView").hidden = ranks; view.hidden = !ranks;
    if (ranks) load();
  });

  const ref = () => fs.collection("walls").doc(wall).collection("games").doc(game).collection("scores");
  const chip = (attr, key, label, on) => `<button type="button" class="chip" ${attr}="${key}" aria-pressed="${on}">${esc(label)}</button>`;

  function shell(listHtml) {
    view.innerHTML = `<div class="chips" style="margin-top:14px">${Object.keys(WAENDE).map(w => chip("data-w2", w, wallName(w), w === wall)).join("")}</div>
      <div class="chips" style="margin-top:8px">${Object.entries(GAMES).map(([k, l]) => chip("data-g", k, l, k === game)).join("")}</div>
      <div class="bar" style="margin:12px 0"><span style="color:var(--muted);font-size:.9rem">Die neuesten 100 Einträge, neueste zuerst.${isAdmin ? "" : " Zum Löschen mit dem Admin-Konto anmelden."}</span>
      <button type="button" id="rkReload" style="margin-left:auto">Neu laden</button></div>
      <div class="feed">${listHtml}</div>`;
  }
  function draw() {
    if (!rows.length) { shell('<p class="empty">Noch keine Einträge.</p>'); return; }
    shell(rows.map(r => {
      const key = r.id, conf = confirmId === key;
      const unit = game === "reflex" ? " ms" : r.score === 1 ? " Rolle" : " Rollen";
      return `<div class="rk-row"><div><span class="n">${esc(r.name)}</span><span class="m">${esc(r.day || "")}</span></div>
        <span class="s">${r.score}${unit}</span>
        ${isAdmin ? `<button type="button" class="del${conf ? " confirm" : ""}" data-rdel="${key}">${conf ? "Wirklich?" : "Löschen"}</button>` : "<span></span>"}</div>`;
    }).join(""));
  }
  async function load() {
    shell('<p class="empty">Rangliste lädt …</p>');
    try {
      const snap = await ref().orderBy("ts", "desc").limit(100).get();
      rows = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(r => typeof r.name === "string" && typeof r.score === "number");
      draw();
    } catch (e) { shell('<p class="empty">Rangliste gerade nicht erreichbar.</p>'); }
  }

  view.addEventListener("click", async e => {
    const w = e.target.closest("[data-w2]"), g = e.target.closest("[data-g]"), d = e.target.closest("[data-rdel]");
    if (e.target.id === "rkReload") { confirmId = null; load(); return; }
    if (w) { wall = w.dataset.w2; confirmId = null; load(); return; }
    if (g) { game = g.dataset.g; confirmId = null; load(); return; }
    if (d) {
      const id = d.dataset.rdel;
      if (confirmId !== id) { confirmId = id; draw(); setTimeout(() => { if (confirmId === id) { confirmId = null; draw(); } }, 4000); return; }
      confirmId = null; d.disabled = true;
      try { await ref().doc(id).delete(); rows = rows.filter(r => r.id !== id); draw(); }
      catch (err) { notice(err.code === "permission-denied" ? "Löschen abgelehnt. Sind die neuen Schutzregeln in Firebase veröffentlicht?" : "Löschen hat nicht geklappt."); draw(); }
    }
  });
  if (typeof auth !== "undefined") auth.onAuthStateChanged(() => { if (!view.hidden) draw(); });
})();
