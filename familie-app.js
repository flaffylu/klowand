/* Klo-Wand: Familien-Bereich mit Stundenplan und Familienfotos.
   Nur auf gekauften Wänden, auf denen die Eltern auf „Meine Wand“ den Familien-Bereich eingeschaltet haben.
   Wer den Familien-QR-Code (Link mit &k=…) einmal geöffnet hat, sieht ihn auf diesem Handy dauerhaft.
   Alles liegt in der Datenbank unter walls/{wand}/familie/{geheimer Schlüssel}/…, ohne Schlüssel kommt niemand dran.
   Auf der Demo-Wand gibt es nur einen gesperrten Vorgeschmack. */
(function () {
  if (typeof WALL === "undefined" || typeof fs === "undefined" || !document.querySelector(".plate")) return;
  const STORE = "klowand-fam-" + WALL;
  const DAYS = [tr("Mo", "Mon", "月"), tr("Di", "Tue", "火"), tr("Mi", "Wed", "水"), tr("Do", "Thu", "木"), tr("Fr", "Fri", "金")];
  const ROWS = 8, CELLS = DAYS.length * ROWS;
  const escF = s => String(s).replace(/[&<>"]/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[m]));

  const css = document.createElement("style");
  css.textContent = `
  .fambar{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:12px 0 0;padding:10px 12px;border-radius:8px;background:#fff;border:1.5px solid var(--ink);font:600 .95rem/1.3 var(--f-ui);color:var(--ink)}
  .fambar b{flex:1 1 100%;font:700 .8rem var(--f-ui);letter-spacing:.12em;text-transform:uppercase;color:var(--muted)}
  .fambar button{flex:1 1 140px;font:700 1rem var(--f-ui);letter-spacing:.04em;background:var(--ink);color:#fff;border:none;border-radius:7px;padding:10px 12px;min-height:46px;cursor:pointer}
  .fambar button+button{background:var(--red)}
  .fambar button.locked::before{content:"🔒 "}
  .fam-ov{position:fixed;inset:0;z-index:44;background:rgba(20,24,22,.82);display:flex;align-items:flex-start;justify-content:center;overflow-y:auto;padding:16px max(12px,env(safe-area-inset-left,0px)) 40px}
  .fam-ov .box{width:min(560px,100%);background:#fbfcfb;color:var(--ink);border:3px solid var(--ink);border-radius:14px;padding:16px 14px 14px;box-shadow:0 18px 40px rgba(0,0,0,.45)}
  .fam-ov .head{display:flex;align-items:center;justify-content:space-between;gap:8px}
  .fam-ov h2{margin:0;font:400 1.6rem/1.1 var(--f-marker)}
  .fam-ov .x{font:700 1.4rem var(--f-ui);background:none;border:none;color:var(--ink);min-width:44px;min-height:44px;cursor:pointer}
  .fam-ov .note{margin:4px 0 10px;font:600 .9rem/1.35 var(--f-ui);color:var(--muted)}
  .fam-ov .kids{display:flex;gap:6px;flex-wrap:wrap;margin:6px 0 10px}
  .fam-ov .kids button{font:700 .95rem var(--f-ui);border:1.5px solid var(--ink);background:#fff;color:var(--ink);border-radius:999px;padding:6px 14px;min-height:40px;cursor:pointer}
  .fam-ov .kids button[aria-pressed=true]{background:var(--ink);color:#fff}
  .fam-ov .kids .add{border-style:dashed}
  .fam-ov table{width:100%;border-collapse:collapse;table-layout:fixed;font:600 .85rem var(--f-ui)}
  .fam-ov th{font:700 .85rem var(--f-ui);letter-spacing:.06em;padding:4px 2px;color:var(--muted)}
  .fam-ov th.today{color:#fff;background:var(--red);border-radius:6px 6px 0 0}
  .fam-ov td{padding:2px;border-top:1px solid #dfe5e1}
  .fam-ov td.n{width:26px;text-align:center;color:var(--muted);font-weight:700}
  .fam-ov td.today{background:#fdeceb}
  .fam-ov td input{width:100%;box-sizing:border-box;border:1px solid transparent;border-radius:5px;background:transparent;font:600 .9rem var(--f-ui);color:var(--ink);padding:6px 3px;min-height:36px;text-align:center}
  .fam-ov td input:focus{border-color:var(--ink);background:#fff;outline:none}
  .fam-ov .row{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}
  .fam-ov .btn{font:700 .95rem var(--f-ui);letter-spacing:.05em;text-transform:uppercase;border-radius:7px;border:1.5px solid var(--ink);background:#fff;color:var(--ink);padding:10px 14px;min-height:44px;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;gap:6px}
  .fam-ov .btn.primary{background:var(--red);border-color:var(--red);color:#fff}
  .fam-ov .btn.dark{background:var(--ink);color:#fff}
  .fam-ov .btn:disabled{opacity:.5}
  .fam-ov .msg{margin:8px 0 0;font:600 .9rem var(--f-ui);color:var(--red)}
  .fam-ov .msg.ok{color:var(--green)}
  .fam-ov .msg:empty{display:none}
  .fam-ov input.name,.fam-ov input.cap{display:block;width:100%;box-sizing:border-box;font:600 1.05rem var(--f-ui);padding:9px 11px;border:1.5px solid #c3cec7;border-radius:7px;margin-top:6px;min-height:44px;background:#fff;color:var(--ink)}
  .fam-ov .prev{display:block;max-width:100%;max-height:50vh;margin:10px auto 0;border-radius:8px}
  .fam-ov .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:8px;margin-top:12px}
  .fam-ov figure{margin:0;background:#fff;border:1px solid #dfe5e1;border-radius:8px;overflow:hidden;cursor:zoom-in}
  .fam-ov figure img{display:block;width:100%;aspect-ratio:1;object-fit:cover}
  .fam-ov figcaption{padding:5px 7px;font:600 .82rem/1.25 var(--f-ui);color:var(--ink);overflow-wrap:anywhere}
  .fam-ov figcaption span{display:block;color:var(--muted);font-weight:500}
  .fam-ov .empty{margin:16px 0;text-align:center;font:600 1rem var(--f-ui);color:var(--muted)}
  .fam-big{position:fixed;inset:0;z-index:46;background:rgba(0,0,0,.92);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:16px;gap:10px}
  .fam-big img{max-width:100%;max-height:82vh;border-radius:6px}
  .fam-big p{margin:0;color:#fff;font:600 1rem var(--f-ui);text-align:center}`;
  document.head.appendChild(css);

  function bar(locked) {
    const at = document.querySelector(".demobar") || document.querySelector(".plate");
    at.insertAdjacentHTML("afterend", `<div class="fambar"><b>${tr("Familien-Bereich · nur für euch", "Family area · just for you", "家族エリア・家族だけ")}</b>
      <button type="button" id="famPlan" class="${locked ? "locked" : ""}">📅 ${tr("Stundenplan", "Timetable", "時間割")}</button>
      <button type="button" id="famFoto" class="${locked ? "locked" : ""}">📷 ${tr("Familienfotos", "Family photos", "家族の写真")}</button></div>`);
  }

  /* Demo: nur zeigen, dass es das gibt */
  if (typeof DEMO !== "undefined" && DEMO) {
    bar(true);
    const up = () => window.kloUpsell && kloUpsell("familie");
    document.getElementById("famPlan").onclick = up; document.getElementById("famFoto").onclick = up;
    return;
  }
  if (typeof FIXED !== "undefined" && FIXED) return;

  /* Schlüssel aus dem Familien-Link merken und aus der Adresszeile entfernen, damit er nicht aus Versehen weitergeteilt wird */
  let key = null;
  const fromLink = (typeof params !== "undefined" ? params : new URLSearchParams(location.search)).get("k");
  if (fromLink && /^[A-Za-z0-9]{24,40}$/.test(fromLink)) {
    key = fromLink;
    try { localStorage.setItem(STORE, key); } catch (e) {}
    try { const u = new URL(location.href); u.searchParams.delete("k"); history.replaceState(history.state, "", u.href); } catch (e) {}
  } else { try { key = localStorage.getItem(STORE); } catch (e) {} }
  if (!key) return;

  const base = fs.collection("walls").doc(WALL).collection("familie").doc(key);
  const now = () => firebase.firestore.FieldValue.serverTimestamp();
  let flash = null, plans = [], plansLoaded = false, current = null, dirty = false, view = null, fotoUnsub = null, fotos = [], pending = null;

  bar(false);
  document.getElementById("famPlan").onclick = () => openPlan();
  document.getElementById("famFoto").onclick = () => openFotos();

  /* Pläne live mithören. Klappt das nicht, ist der Familien-Code nicht mehr gültig (z. B. von den Eltern erneuert). */
  base.collection("plaene").limit(20).onSnapshot(s => {
    plans = s.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    plansLoaded = true;
    if (current && !plans.some(p => p.id === current)) current = null;
    if (!current && plans.length) current = plans[0].id;
    if (view === "plan" && !dirty) drawPlan();
  }, err => {
    if (err && err.code === "permission-denied") {
      try { localStorage.removeItem(STORE); } catch (e) {}
      const b = document.querySelector(".fambar");
      if (b) b.innerHTML = `<b>${tr("Familien-Bereich", "Family area", "家族エリア")}</b><span>${tr("Dieser Familien-Code gilt nicht mehr. Lass dir von deinen Eltern den neuen QR-Code geben.", "This family code is no longer valid. Ask your parents for the new QR code.", "この家族コードは無効です。新しいQRコードを家族にもらってください。")}</span>`;
      close();
    }
  });

  function overlay(html) {
    close();
    const el = document.createElement("div");
    el.className = "fam-ov"; el.setAttribute("role", "dialog");
    el.innerHTML = `<div class="box">${html}</div>`;
    document.body.appendChild(el);
    el.addEventListener("click", e => { if (e.target === el || e.target.closest(".x")) tryClose(); });
    return el;
  }
  function tryClose() {
    if (view === "plan" && dirty && !confirm(tr("Änderungen am Stundenplan sind noch nicht gespeichert. Trotzdem schließen?", "Timetable changes aren't saved yet. Close anyway?", "時間割の変更が保存されていません。閉じますか？"))) return;
    close();
  }
  function close() {
    const o = document.querySelector(".fam-ov"); if (o) o.remove();
    if (fotoUnsub) { fotoUnsub(); fotoUnsub = null; }
    view = null; dirty = false; pending = null;
  }
  const head = t => `<div class="head"><h2>${t}</h2><button type="button" class="x" aria-label="${tr("Schließen", "Close", "閉じる")}">✕</button></div>`;

  /* ---------- Stundenplan ---------- */
  function openPlan() { view = "plan"; dirty = false; drawPlan(); }
  function cellsOf(p) {
    let z = []; try { z = JSON.parse(p.z || "[]"); } catch (e) {}
    return Array.from({ length: CELLS }, (_, i) => typeof z[i] === "string" ? z[i] : "");
  }
  function drawPlan(adding) {
    const p = plans.find(x => x.id === current);
    const wd = new Date().getDay(), today = wd >= 1 && wd <= 5 ? wd - 1 : -1;
    const kids = plans.map(x => `<button type="button" data-kid="${escF(x.id)}" aria-pressed="${x.id === current}">${escF(x.name)}</button>`).join("")
      + `<button type="button" class="add" data-addkid>+ ${tr("Kind", "Child", "子ども")}</button>`;
    let body;
    if (adding || (plansLoaded && !plans.length)) {
      body = `<p class="note">${plans.length ? "" : tr("Noch kein Stundenplan da. Leg für jedes Kind einen an.", "No timetable yet. Create one for each child.", "まだ時間割がありません。子どもごとに作りましょう。")}</p>
        <form id="famKid" autocomplete="off"><input class="name" name="n" maxlength="20" placeholder="${tr("Name des Kindes, z. B. Mia", "Child's name, e.g. Mia", "子どもの名前（例：ミア）")}" required>
        <div class="row"><button type="submit" class="btn primary">${tr("Plan anlegen", "Create timetable", "時間割を作る")}</button>${plans.length ? `<button type="button" class="btn" data-cancel>${tr("Abbrechen", "Cancel", "キャンセル")}</button>` : ""}</div></form>`;
    } else if (!p) {
      body = `<p class="empty">${tr("Lädt …", "Loading …", "読み込み中 …")}</p>`;
    } else {
      const c = cellsOf(p);
      body = `<table><thead><tr><th></th>${DAYS.map((d, i) => `<th class="${i === today ? "today" : ""}">${d}</th>`).join("")}</tr></thead><tbody>
        ${Array.from({ length: ROWS }, (_, r) => `<tr><td class="n">${r + 1}</td>${DAYS.map((_, d) => `<td class="${d === today ? "today" : ""}"><input data-i="${d * ROWS + r}" maxlength="20" value="${escF(c[d * ROWS + r])}" aria-label="${DAYS[d]} ${r + 1}."></td>`).join("")}</tr>`).join("")}
        </tbody></table>
        <div class="row"><button type="button" class="btn primary" id="famSave" disabled>${tr("Speichern", "Save", "保存")}</button>
        <button type="button" class="btn" data-delkid>${tr("Plan löschen", "Delete timetable", "時間割を削除")}</button></div>`;
    }
    const el = overlay(`${head("📅 " + tr("Stundenplan", "Timetable", "時間割"))}
      <p class="note">${tr("Tippe ein Feld an und schreib das Fach rein. Alle mit dem Familien-Code sehen und ändern denselben Plan.", "Tap a box and type the subject. Everyone with the family code sees and edits the same timetable.", "マスをタップして教科を入力。家族コードを持つ全員が同じ時間割を見て編集できます。")}</p>
      <div class="kids">${kids}</div>${body}<p class="msg" id="famMsg"></p>`);
    view = "plan";
    if (flash) { msg(flash, true); flash = null; }
    el.addEventListener("input", e => { if (e.target.matches("td input")) { dirty = true; const s = document.getElementById("famSave"); if (s) s.disabled = false; } });
    el.addEventListener("click", async e => {
      const k = e.target.closest("[data-kid]");
      if (k) { if (dirty && !confirm(tr("Änderungen verwerfen?", "Discard changes?", "変更を破棄しますか？"))) return; current = k.dataset.kid; dirty = false; drawPlan(); return; }
      if (e.target.closest("[data-addkid]")) { if (dirty && !confirm(tr("Änderungen verwerfen?", "Discard changes?", "変更を破棄しますか？"))) return; dirty = false; drawPlan(true); const ni = document.querySelector(".fam-ov input.name"); if (ni) ni.focus(); return; }
      if (e.target.closest("[data-cancel]")) { drawPlan(); return; }
      if (e.target.closest("#famSave")) { save(el); return; }
      const del = e.target.closest("[data-delkid]");
      if (del && p) {
        if (!confirm(tr(`Stundenplan von ${p.name} wirklich löschen?`, `Really delete ${p.name}'s timetable?`, `${p.name}の時間割を削除しますか？`))) return;
        try { await base.collection("plaene").doc(p.id).delete(); current = null; dirty = false; } catch (x) { msg(tr("Löschen hat nicht geklappt.", "Deleting didn't work.", "削除できませんでした。")); }
      }
    });
    const f = el.querySelector("#famKid");
    if (f) f.addEventListener("submit", async e => {
      e.preventDefault();
      const n = f.n.value.trim().slice(0, 20); if (!n) return;
      const id = Array.from(crypto.getRandomValues(new Uint8Array(10)), b => "abcdefghijklmnopqrstuvwxyz0123456789"[b % 36]).join("");
      try { await base.collection("plaene").doc(id).set({ name: n, z: JSON.stringify(Array(CELLS).fill("")), ts: now() }); current = id; dirty = false; drawPlan(); }
      catch (x) { msg(tr("Anlegen hat nicht geklappt. Bist du online?", "Couldn't create it. Are you online?", "作成できませんでした。オンラインですか？")); }
    });
  }
  async function save(el) {
    const p = plans.find(x => x.id === current); if (!p) return;
    const z = Array(CELLS).fill("");
    el.querySelectorAll("td input").forEach(i => { z[Number(i.dataset.i)] = i.value.trim().slice(0, 20); });
    const b = document.getElementById("famSave"); b.disabled = true;
    try { await base.collection("plaene").doc(p.id).set({ name: p.name, z: JSON.stringify(z), ts: now() }); dirty = false; flash = tr("Gespeichert ✓", "Saved ✓", "保存しました ✓"); msg(flash, true); setTimeout(() => { flash = null; }, 1500); }
    catch (x) { b.disabled = false; msg(tr("Speichern hat nicht geklappt. Bist du online?", "Saving didn't work. Are you online?", "保存できませんでした。オンラインですか？")); }
  }
  function msg(t, ok) { const m = document.getElementById("famMsg"); if (m) { m.textContent = t; m.className = "msg" + (ok ? " ok" : ""); } }

  /* ---------- Familienfotos ---------- */
  function openFotos() {
    const el = overlay(`${head("📷 " + tr("Familienfotos", "Family photos", "家族の写真"))}
      <p class="note">${tr("Nur wer euren Familien-Code hat, sieht diese Fotos. Löschen können die Eltern auf „Meine Wand“.", "Only people with your family code see these photos. Parents can delete them on “My wall”.", "家族コードを持つ人だけが見られます。削除は保護者が「マイウォール」で。")}</p>
      <div class="row" style="margin-top:4px">
        <label class="btn primary">📷 ${tr("Foto machen", "Take photo", "写真を撮る")}<input type="file" accept="image/*" capture="environment" hidden data-pick></label>
        <label class="btn dark">🖼️ ${tr("Aus der Galerie", "From gallery", "ギャラリーから")}<input type="file" accept="image/*" hidden data-pick></label>
      </div>
      <div id="famNew"></div><p class="msg" id="famMsg"></p>
      <div class="grid" id="famGrid"><p class="empty">${tr("Lädt …", "Loading …", "読み込み中 …")}</p></div>`);
    view = "foto";
    el.addEventListener("change", e => { const i = e.target.closest("[data-pick]"); if (i && i.files && i.files[0]) pick(i.files[0]); i && (i.value = ""); });
    el.addEventListener("click", e => {
      if (e.target.closest("[data-post]")) post();
      if (e.target.closest("[data-drop]")) { pending = null; document.getElementById("famNew").innerHTML = ""; }
      const f = e.target.closest("figure[data-i]"); if (f) big(fotos[Number(f.dataset.i)]);
    });
    fotoUnsub = base.collection("fotos").orderBy("ts", "desc").limit(30).onSnapshot(s => {
      fotos = s.docs.map(d => ({ id: d.id, ...d.data() }));
      drawGrid();
    }, () => { const g = document.getElementById("famGrid"); if (g) g.innerHTML = `<p class="empty">${tr("Fotos konnten nicht geladen werden.", "Photos couldn't be loaded.", "写真を読み込めませんでした。")}</p>`; });
  }
  const agoF = d => { const t = d.ts && d.ts.toMillis ? d.ts.toMillis() : Date.now(); return new Date(t).toLocaleDateString(LANG === "de" ? "de-DE" : LANG === "ja" ? "ja-JP" : "en-GB", { day: "numeric", month: "short" }); };
  function drawGrid() {
    const g = document.getElementById("famGrid"); if (!g) return;
    g.innerHTML = fotos.length ? fotos.map((f, i) => `<figure data-i="${i}"><img src="${f.img}" alt="${escF(f.cap || tr("Familienfoto", "Family photo", "家族の写真"))}" loading="lazy">
      <figcaption>${f.cap ? escF(f.cap) : ""}<span>${agoF(f)}</span></figcaption></figure>`).join("")
      : `<p class="empty">${tr("Noch keine Fotos. Mach das erste!", "No photos yet. Take the first one!", "まだ写真がありません。最初の1枚を！")}</p>`;
  }
  function big(f) {
    if (!f) return;
    const el = document.createElement("div"); el.className = "fam-big";
    el.innerHTML = `<img src="${f.img}" alt=""><p>${escF(f.cap || "")}</p>`;
    el.onclick = () => el.remove(); document.body.appendChild(el);
  }
  /* Foto verkleinern (längste Seite 1000 px, JPEG), damit es schnell lädt und in die Datenbank passt */
  async function shrink(file) {
    const url = URL.createObjectURL(file);
    try {
      const img = await new Promise((ok, bad) => { const i = new Image(); i.onload = () => ok(i); i.onerror = bad; i.src = url; });
      let side = 1000, out = null;
      for (let tries = 0; tries < 6; tries++) {
        const s = Math.min(1, side / Math.max(img.naturalWidth, img.naturalHeight));
        const cv = document.createElement("canvas"); cv.width = Math.round(img.naturalWidth * s); cv.height = Math.round(img.naturalHeight * s);
        const c = cv.getContext("2d"); c.fillStyle = "#fff"; c.fillRect(0, 0, cv.width, cv.height); c.drawImage(img, 0, 0, cv.width, cv.height);
        for (const q of [0.8, 0.65, 0.5]) { out = cv.toDataURL("image/jpeg", q); if (out.length <= 280000) return out; }
        side = Math.round(side * 0.75);
      }
      return out && out.length <= 280000 ? out : null;
    } finally { URL.revokeObjectURL(url); }
  }
  async function pick(file) {
    msg("");
    const box = document.getElementById("famNew");
    box.innerHTML = `<p class="empty">${tr("Foto wird vorbereitet …", "Preparing photo …", "写真を準備中 …")}</p>`;
    let img = null; try { img = await shrink(file); } catch (e) {}
    if (!img || !img.startsWith("data:image/jpeg")) { box.innerHTML = ""; msg(tr("Dieses Bild konnte nicht geöffnet werden.", "This picture couldn't be opened.", "この画像は開けませんでした。")); return; }
    pending = img;
    box.innerHTML = `<img class="prev" src="${img}" alt="">
      <input class="cap" maxlength="80" placeholder="${tr("Was ist drauf? (freiwillig)", "What's in it? (optional)", "ひとこと（任意）")}">
      <div class="row"><button type="button" class="btn primary" data-post>${tr("Posten", "Post", "投稿")}</button><button type="button" class="btn" data-drop>${tr("Verwerfen", "Discard", "やめる")}</button></div>`;
  }
  async function post() {
    if (!pending) return;
    const b = document.querySelector("[data-post]"); if (b) b.disabled = true;
    const capEl = document.querySelector(".fam-ov input.cap"), cap = capEl ? capEl.value.trim().slice(0, 80) : "";
    const d = { img: pending, ts: now() }; if (cap) d.cap = cap;
    try { await base.collection("fotos").add(d); pending = null; document.getElementById("famNew").innerHTML = ""; msg(tr("Gepostet ✓", "Posted ✓", "投稿しました ✓"), true); }
    catch (x) { if (b) b.disabled = false; msg(tr("Posten hat nicht geklappt. Bist du online?", "Posting didn't work. Are you online?", "投稿できませんでした。オンラインですか？")); }
  }
})();
