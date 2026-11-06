/* Admin: Codes für Payhip erzeugen und sehen, wer welche Wand gekauft hat.
   Braucht aus admin.html: fs, isAdmin, DYN, esc, notice, ms. */
window.KloCodes = (function () {
  const $ = id => document.getElementById(id);
  const view = $("codesView");
  const ABC = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";   // ohne 0/O und 1/I, damit nichts verwechselt wird
  let codes = [], loaded = false, fresh = [], busy = false, stats = null;

  function newCode() {
    const r = new Uint32Array(8); crypto.getRandomValues(r);
    const s = Array.from(r, x => ABC[x % ABC.length]).join("");
    return `KLO-${s.slice(0, 4)}-${s.slice(4)}`;
  }
  function saveTxt(list, name) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([list.join("\n") + "\n"], { type: "text/plain" }));
    a.download = name; document.body.appendChild(a); a.click(); a.remove();
  }
  const day = t => new Date(t).toLocaleDateString("de-DE");

  async function load() {
    if (!isAdmin) { loaded = false; draw(); return; }
    try {
      const snap = await fs.collection("codes").limit(2000).get();
      codes = snap.docs.map(d => { const x = d.data(); const n = typeof x.n === "number" ? x.n : (x.used ? 1 : 0); return { id: d.id, n, used: n > 0 || !!x.used || !!x.wall, walls: Array.isArray(x.walls) ? x.walls : (x.wall ? [x.wall] : []), wall: x.wall || "", created: x.created && x.created.toMillis ? x.created.toMillis() : 0, at: x.at && x.at.toMillis ? x.at.toMillis() : 0 }; });
      loaded = true;
    } catch (e) { loaded = false; notice("Codes konnten nicht geladen werden. Sind die neuen Regeln in Firebase veröffentlicht?"); }
    try {
      const snap = await fs.collection("stats").limit(2000).get();
      stats = snap.docs.map(d => { const [page, day] = d.id.split("_"); return { page, day, n: Number(d.data().n) || 0 }; });
    } catch (e) { stats = null; }
    draw();
  }

  async function make(n) {
    if (busy || !isAdmin) return;
    busy = true; draw();
    try {
      const batch = fs.batch(), list = [];
      const taken = new Set(codes.map(c => c.id));
      while (list.length < n) { const c = newCode(); if (!taken.has(c)) { taken.add(c); list.push(c); } }
      list.forEach(c => batch.set(fs.collection("codes").doc(c), { used: false, created: firebase.firestore.FieldValue.serverTimestamp() }));
      await batch.commit();
      fresh = list; notice("");
      await load();
    } catch (e) { notice("Codes konnten nicht gespeichert werden. Sind die neuen Regeln in Firebase veröffentlicht?"); }
    busy = false; draw();
  }

  function draw() {
    if (view.hidden) return;
    if (!isAdmin) { view.innerHTML = '<p class="empty">Melde dich mit dem Admin-Konto an, um Codes zu sehen.</p>'; return; }
    const unused = codes.filter(c => !c.used).sort((a, b) => b.created - a.created);
    const used = codes.filter(c => c.used).sort((a, b) => b.at - a.at);
    const dayStr = t => { const d = new Date(t); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
    const today = dayStr(Date.now()), weekAgo = dayStr(Date.now() - 6 * 864e5);
    const sum = (page, from) => (stats || []).filter(r => r.page === page && (!from || r.day >= from)).reduce((a, r) => a + r.n, 0);
    const visitRow = (page, label) => `<div class="rk-row"><div><span class="n">${label}</span><span class="m">heute ${sum(page, today)} · 7 Tage ${sum(page, weekAgo)}</span></div><span class="s">${sum(page)}</span><span class="m">gesamt</span></div>`;
    view.innerHTML = `
      <h3 style="margin:18px 0 8px;font:700 1rem var(--f-ui);letter-spacing:.08em;text-transform:uppercase;color:var(--muted)">Besucher der Infoseiten</h3>
      ${stats ? `<div class="feed">${visitRow("familie", "Familien-Seite")}${visitRow("wirte", "Bar-Seite")}</div>
        <p style="margin:6px 0 0;color:var(--muted);font-size:.85rem">Jeder Besuch zählt einmal, egal wie oft die Seite neu geladen wird.</p>`
        : `<p style="color:var(--muted)">Noch keine Zahlen. Sind die neuen Regeln in Firebase veröffentlicht?</p>`}
      <div class="stats" style="margin-top:14px">
        <div class="stat"><b>${loaded ? unused.length : "–"}</b><span>Codes frei</span></div>
        <div class="stat"><b>${loaded ? used.length : "–"}</b><span>Eingelöst</span></div>
        <div class="stat"><b>${Object.keys(DYN).length}</b><span>Gekaufte Wände</span></div>
      </div>
      <div class="item" style="background:var(--panel);color:var(--fg);border:1px solid var(--line)">
        <b style="font-size:1.1rem">Neue Codes für Payhip</b>
        <p style="margin:6px 0 10px;color:var(--muted)">Erzeugen, als Datei speichern und bei Payhip im Produkt unter <i>License Keys → Upload</i> hochladen. Jeder Käufer bekommt automatisch einen Code. <b>Jeder Code reicht für 2 Wände.</b> Für das Update-Produkt (2 weitere Wände) einfach eine eigene Liste erzeugen und dort hochladen.</p>
        <div class="actions" style="margin-top:0">
          <button type="button" class="primary" data-make="20" ${busy ? "disabled" : ""}>20 Codes erzeugen</button>
          <button type="button" data-make="100" ${busy ? "disabled" : ""}>100 Codes erzeugen</button>
        </div>
        ${fresh.length ? `<p style="margin:12px 0 6px;color:var(--amber)"><b>${fresh.length} neue Codes erzeugt.</b> Lade genau diese Datei bei Payhip hoch:</p>
          <div class="actions" style="margin-top:0"><button type="button" class="primary" data-save="fresh">codes-neu.txt speichern</button><button type="button" data-copy="fresh">Kopieren</button></div>` : ""}
      </div>
      ${used.length ? `<h3 style="margin:18px 0 8px;font:700 1rem var(--f-ui);letter-spacing:.08em;text-transform:uppercase;color:var(--muted)">Eingelöst</h3>
        <div class="feed">${used.map(c => {
          const names = c.walls.map(id => DYN[id] ? DYN[id].name : id);
          return `<div class="rk-row"><div><span class="n">${esc(names.join(" · ") || c.wall)}</span><span class="m">${esc(c.id)} · ${c.walls.length || c.n} von 2 Wänden · ${c.at ? day(c.at) : ""}</span></div>
            <a href="./?wand=${encodeURIComponent(c.wall)}" target="_blank" rel="noopener" style="color:var(--ink);font-weight:700">Wand ansehen</a><span></span></div>`;
        }).join("")}</div>` : ""}
      ${unused.length ? `<details style="margin-top:18px"><summary style="cursor:pointer;color:var(--muted)">Alle ${unused.length} freien Codes anzeigen</summary>
        <div class="actions"><button type="button" data-save="unused">Als Datei speichern</button></div>
        <p style="font:600 .95rem ui-monospace,Menlo,monospace;line-height:1.7;color:var(--fg);overflow-wrap:anywhere">${unused.map(c => esc(c.id)).join("<br>")}</p></details>` : ""}`;
  }

  view.addEventListener("click", async e => {
    const m = e.target.closest("[data-make]"), s = e.target.closest("[data-save]"), c = e.target.closest("[data-copy]");
    if (m) make(Number(m.dataset.make));
    if (s) saveTxt(s.dataset.save === "fresh" ? fresh : codes.filter(x => !x.used).map(x => x.id), s.dataset.save === "fresh" ? "codes-neu.txt" : "codes-frei.txt");
    if (c) { try { await navigator.clipboard.writeText(fresh.join("\n")); c.textContent = "Kopiert ✓"; } catch (err) { c.textContent = "Kopieren ging nicht"; } }
  });
  if (typeof auth !== "undefined") auth.onAuthStateChanged(() => { if (!view.hidden) load(); });

  return { show: load, refresh: draw };
})();
