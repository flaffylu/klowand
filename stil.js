/* Klo-Wand: Knopf „Hintergrund“. Jeder sucht sich auf seinem Handy einen Stil aus oder nimmt ein eigenes Foto.
   Die Wahl bleibt nur auf diesem Handy (localStorage), andere sehen weiter ihren eigenen Hintergrund. */
(function () {
  const extras = document.querySelector(".extras");
  if (!extras || typeof kloApplyBg !== "function") return;
  const img = n => `url("bilder/${n}.jpg")`;
  const STARS = "radial-gradient(2px 2px at 12% 18%,#fff,transparent),radial-gradient(2px 2px at 78% 12%,#fff,transparent),radial-gradient(3px 3px at 45% 40%,#ffe9a8,transparent),radial-gradient(2px 2px at 85% 55%,#fff,transparent),radial-gradient(2px 2px at 25% 70%,#fff,transparent),radial-gradient(3px 3px at 60% 85%,#bde0fe,transparent),radial-gradient(2px 2px at 8% 92%,#fff,transparent),radial-gradient(circle at 75% 25%,#4b3a8f,transparent 45%),linear-gradient(#120f2e,#2a1b5c)";
  const STILE = [
    { id: "kay", n: tr("Igel-Party", "Hedgehog party", "ハリネズミ"), css: img("kay-igel"), mini: "bilder/mini/kay-igel.jpg", light: true },
    { id: "konfetti", n: tr("Konfetti", "Confetti", "紙吹雪"), css: img("konfetti"), mini: "bilder/mini/konfetti.jpg", light: true },
    { id: "regenbogen", n: tr("Regenbogen", "Rainbow", "にじ"), css: "linear-gradient(160deg,#ffd1dc,#ffe9a8 30%,#c8f7c5 55%,#bde0fe 78%,#e3c8ff)", light: true },
    { id: "bonbon", n: tr("Bonbon", "Candy", "キャンディ"), css: "repeating-linear-gradient(45deg,#ffd6e7 0 28px,#fff5fa 28px 56px)", light: true },
    { id: "himmel", n: tr("Himmel", "Sky", "空"), css: img("himmel"), mini: "bilder/mini/himmel.jpg", light: true },
    { id: "weltall", n: tr("Weltall", "Space", "宇宙"), css: STARS, light: false },
    { id: "wasser", n: tr("Unterwasser", "Underwater", "海の中"), css: img("wasser"), mini: "bilder/mini/wasser.jpg", light: false },
    { id: "neonnacht", n: tr("Neon-Nacht", "Neon night", "ネオンの夜"), css: "radial-gradient(120% 70% at 100% 0%,#3a0b4d 0%,#0b0716 55%)", light: false, theme: "neon" },
    { id: "neon", n: "Neon", css: img("neon"), mini: "bilder/mini/neon.jpg", light: false },
    { id: "holz", n: tr("Holz", "Wood", "木"), css: img("holz"), mini: "bilder/mini/holz.jpg", light: true },
    { id: "fliesen", n: tr("Fliesen", "Tiles", "タイル"), css: img("fliesen"), mini: "bilder/mini/fliesen.jpg", light: true },
    { id: "hell", n: tr("Hell", "Bright", "明るい"), css: img("hell"), mini: "bilder/mini/hell.jpg", light: true },
    { id: "tuer", n: tr("Klotür", "Loo door", "トイレのドア"), css: "", light: false },
  ];
  const saved = () => { try { return JSON.parse(localStorage.getItem("klowand-stil") || "null"); } catch (e) { return null; } };

  const css = document.createElement("style");
  css.textContent = `
  .stil-ov{position:fixed;inset:0;z-index:44;background:rgba(20,24,22,.82);display:flex;align-items:flex-start;justify-content:center;overflow-y:auto;padding:16px max(12px,env(safe-area-inset-left,0px)) 40px}
  .stil-ov .box{width:min(560px,100%);background:#fbfcfb;color:var(--ink);border:3px solid var(--ink);border-radius:14px;padding:16px 14px;box-shadow:0 18px 40px rgba(0,0,0,.45)}
  .stil-ov .head{display:flex;align-items:center;justify-content:space-between}
  .stil-ov h2{margin:0;font:400 1.6rem/1.1 var(--f-marker)}
  .stil-ov .x{font:700 1.4rem var(--f-ui);background:none;border:none;color:var(--ink);min-width:44px;min-height:44px;cursor:pointer}
  .stil-ov p{margin:4px 0 10px;font:600 .95rem var(--f-ui);color:var(--muted)}
  .stil-ov .tiles{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
  .stil-ov .tile{display:flex;flex-direction:column;gap:6px;align-items:stretch;background:#fff;border:2px solid #c3cec7;border-radius:10px;padding:6px;cursor:pointer;font:700 .95rem var(--f-ui);color:var(--ink);text-align:center}
  .stil-ov .tile[aria-pressed=true]{border-color:var(--red);box-shadow:0 0 0 3px rgba(179,38,30,.25)}
  .stil-ov .tile i{display:block;aspect-ratio:3/4;border-radius:6px;background-size:cover;background-position:center;border:1px solid rgba(0,0,0,.1)}
  .stil-ov .tile.own i{display:flex;align-items:center;justify-content:center;font-size:2.2rem;font-style:normal;background:#eef2ef}
  .stil-ov .msg{margin:8px 0 0;font:600 .9rem var(--f-ui);color:var(--red)}
  .stil-ov .msg:empty{display:none}`;
  document.head.appendChild(css);

  const btn = document.createElement("button");
  btn.type = "button"; btn.id = "stilOpen"; btn.textContent = "🎨 " + tr("Hintergrund", "Background", "背景");
  extras.appendChild(btn);
  btn.onclick = open;

  function open() {
    const w = saved();
    const cur = w ? (w.own ? "own" : w.id) : null;
    const el = document.createElement("div");
    el.className = "stil-ov"; el.setAttribute("role", "dialog"); el.setAttribute("aria-label", tr("Hintergrund aussuchen", "Choose background", "背景を選ぶ"));
    el.innerHTML = `<div class="box"><div class="head"><h2>🎨 ${tr("Dein Hintergrund", "Your background", "背景をえらぶ")}</h2><button type="button" class="x" aria-label="${tr("Schließen", "Close", "閉じる")}">✕</button></div>
      <p>${tr("Tipp auf ein Bild. Das siehst nur du auf deinem Handy.", "Tap a picture. Only you see it on your phone.", "好きな絵をタップ。自分のスマホだけに表示されます。")}</p>
      <div class="tiles">
        <label class="tile own" aria-pressed="${cur === "own"}"><i>📷</i>${tr("Eigenes Foto", "Own photo", "自分の写真")}<input type="file" accept="image/*" hidden></label>
        ${STILE.map(s => `<button type="button" class="tile" data-id="${s.id}" aria-pressed="${cur === s.id}"><i style="background-image:${s.mini ? `url('${s.mini}')` : (s.css ? s.css.replace(/"/g, "'") : "none")};${s.css ? "" : "background-color:#b9c7bf"}"></i>${s.n}</button>`).join("")}
      </div><p class="msg" id="stilMsg"></p></div>`;
    document.body.appendChild(el);
    const close = () => el.remove();
    el.addEventListener("click", e => {
      if (e.target === el || e.target.closest(".x")) { close(); return; }
      const t = e.target.closest("[data-id]"); if (!t) return;
      const s = STILE.find(x => x.id === t.dataset.id); if (!s) return;
      kloApplyBg(s.css, s.light, s.theme);
      try { localStorage.setItem("klowand-stil", JSON.stringify({ id: s.id, css: s.css, light: s.light, theme: s.theme || "" })); localStorage.removeItem("klowand-stil-foto"); } catch (x) {}
      close();
    });
    el.querySelector("input[type=file]").addEventListener("change", async e => {
      const f = e.target.files && e.target.files[0]; if (!f) return;
      const m = el.querySelector("#stilMsg"); m.textContent = tr("Foto wird vorbereitet …", "Preparing photo …", "準備中 …");
      try {
        const { data, light } = await prepare(f);
        kloApplyBg(`url("${data}")`, light);
        try { localStorage.setItem("klowand-stil-foto", data); localStorage.setItem("klowand-stil", JSON.stringify({ own: true, light })); }
        catch (x) { m.textContent = tr("Das Foto ist zu groß zum Merken. Es bleibt nur bis zum Neuladen.", "The photo is too big to remember. It stays until you reload.", "写真が大きすぎて保存できません。"); return; }
        close();
      } catch (x) { m.textContent = tr("Dieses Bild konnte nicht geöffnet werden.", "This picture couldn't be opened.", "この画像は開けませんでした。"); }
    });
  }
  /* Foto verkleinern und schauen, ob es eher hell oder dunkel ist (dann passt die Schriftfarbe daneben) */
  async function prepare(file) {
    const url = URL.createObjectURL(file);
    try {
      const im = await new Promise((ok, bad) => { const i = new Image(); i.onload = () => ok(i); i.onerror = bad; i.src = url; });
      const s = Math.min(1, 1280 / Math.max(im.naturalWidth, im.naturalHeight));
      const cv = document.createElement("canvas"); cv.width = Math.round(im.naturalWidth * s); cv.height = Math.round(im.naturalHeight * s);
      const c = cv.getContext("2d"); c.drawImage(im, 0, 0, cv.width, cv.height);
      let data = cv.toDataURL("image/jpeg", 0.75);
      if (data.length > 1500000) data = cv.toDataURL("image/jpeg", 0.5);
      const t = document.createElement("canvas"); t.width = t.height = 24; const tc = t.getContext("2d"); tc.drawImage(cv, 0, 0, 24, 24);
      const px = tc.getImageData(0, 0, 24, 24).data; let sum = 0;
      for (let i = 0; i < px.length; i += 4) sum += 0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2];
      return { data, light: sum / (px.length / 4) > 140 };
    } finally { URL.revokeObjectURL(url); }
  }
})();
