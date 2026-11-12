/* Klo-Wand: 3D-Übersetzungs-Lupe. Lange auf die Wand drücken → Lupe erscheint über dem Finger.
   Über einen Spruch oder eine Antwort halten → in der Lupe steht die Übersetzung in der Sprache aus dem Übersetzer („Übersetzen in“). */
(function () {
  const wall = document.getElementById("wall"); if (!wall) return;
  const T = (de, en) => (typeof tr === "function" ? tr(de, en) : de);
  const g = k => { try { return localStorage.getItem(k); } catch (e) { return null; } }, s = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
  const NAMES = { de: "Deutsch", en: "Englisch", tr: "Türkisch", ar: "Arabisch", ru: "Russisch", uk: "Ukrainisch", pl: "Polnisch", ro: "Rumänisch", fa: "Persisch", it: "Italienisch", es: "Spanisch", fr: "Französisch", pt: "Portugiesisch", el: "Griechisch", hr: "Kroatisch", sr: "Serbisch", bg: "Bulgarisch", vi: "Vietnamesisch", "zh-CN": "Chinesisch", ja: "Japanisch", th: "Thailändisch", hi: "Hindi", nl: "Niederländisch", cs: "Tschechisch" };
  const target = () => { const t = g("klowand-ue-b") || "en"; return NAMES[t] ? t : "en"; };

  const css = document.createElement("style");
  css.textContent = `
  #wall{-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}
  .lupe{position:fixed;left:0;top:0;z-index:60;width:230px;height:230px;margin:-115px 0 0 -115px;pointer-events:none;opacity:0;transform:scale(.4) rotate(-8deg);transition:opacity .18s,transform .22s cubic-bezier(.3,1.6,.5,1)}
  .lupe.on{opacity:1;transform:scale(1) rotate(0)}
  .lupe .ring{position:absolute;inset:0;border-radius:50%;padding:13px;background:conic-gradient(from 210deg,#f6f1e4,#9c8f74,#fff7e0,#6d6250,#e9dfc6,#8a7d63,#f6f1e4);box-shadow:0 18px 40px rgba(0,0,0,.55),inset 0 0 0 2px rgba(255,255,255,.5),inset 0 -6px 10px rgba(0,0,0,.35)}
  .lupe .glass{position:relative;width:100%;height:100%;border-radius:50%;overflow:hidden;background:radial-gradient(circle at 50% 55%,rgba(255,252,240,.97),rgba(238,232,215,.95) 70%,rgba(200,192,170,.95));box-shadow:inset 0 10px 22px rgba(0,0,0,.25),inset 0 -4px 12px rgba(255,255,255,.6);display:flex;align-items:center;justify-content:center;text-align:center;padding:22px}
  .lupe .glass::before{content:"";position:absolute;left:14%;top:8%;width:46%;height:28%;border-radius:50%;background:linear-gradient(180deg,rgba(255,255,255,.85),rgba(255,255,255,0));transform:rotate(-20deg);pointer-events:none}
  .lupe .glass::after{content:"";position:absolute;inset:0;border-radius:50%;box-shadow:inset 0 0 0 1px rgba(0,0,0,.12),inset 0 0 26px rgba(120,100,60,.25);pointer-events:none}
  .lupe .tx{position:relative;font:700 1.35rem/1.2 var(--f-ui,"Barlow Condensed",sans-serif);color:#1b1424;overflow-wrap:anywhere;max-height:100%;overflow:hidden}
  .lupe .tx.small{font-size:1.05rem}.lupe .tx.hint{font-size:1rem;font-weight:600;color:#5d5068}
  .lupe .lng{position:absolute;left:50%;bottom:-8px;transform:translateX(-50%);z-index:2;font:700 .8rem var(--f-ui,"Barlow Condensed",sans-serif);background:#1b1424;color:#ffd166;border-radius:999px;padding:3px 10px;white-space:nowrap}
  .lupe .stiel{position:absolute;left:78%;top:78%;width:34px;height:120px;border-radius:17px;transform-origin:50% 0;transform:rotate(-45deg);background:linear-gradient(90deg,#2a1708,#7a4a22 35%,#a8703c 50%,#5a3415 70%,#24130a);box-shadow:0 10px 20px rgba(0,0,0,.45);z-index:-1}
  .lupe .stiel::before{content:"";position:absolute;left:-4px;right:-4px;top:-6px;height:22px;border-radius:8px;background:linear-gradient(90deg,#6d6250,#f6f1e4,#8a7d63)}
  .lupe-tip{position:fixed;left:50%;bottom:calc(150px + env(safe-area-inset-bottom,0px));transform:translateX(-50%);z-index:40;background:#1b1424;color:#ffd166;border:1px solid #ffd166;border-radius:999px;padding:8px 16px;font:700 .95rem var(--f-ui,"Barlow Condensed",sans-serif);box-shadow:0 8px 20px rgba(0,0,0,.4);max-width:90vw;text-align:center}
  .post.lupe-hit{outline:3px solid #ffd166;outline-offset:3px}`;
  document.head.appendChild(css);

  const lupe = document.createElement("div"); lupe.className = "lupe"; lupe.setAttribute("aria-hidden", "true");
  lupe.innerHTML = `<div class="stiel"></div><div class="ring"><div class="glass"><div class="tx hint"></div></div></div><span class="lng"></span>`;
  document.body.appendChild(lupe);
  const TX = lupe.querySelector(".tx"), LNG = lupe.querySelector(".lng");
  const live = document.createElement("div"); live.className = "sr-only"; live.setAttribute("aria-live", "polite"); live.style.cssText = "position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)"; document.body.appendChild(live);

  const cache = {};
  async function translate(text, to) {
    const key = to + "|" + text; if (cache[key]) return cache[key];
    const from = to === "de" ? "en" : "de";
    const p = (async () => {
      for (const src of ["Autodetect", from]) {
        try { const r = await fetch("https://api.mymemory.translated.net/get?q=" + encodeURIComponent(text.slice(0, 450)) + "&langpair=" + encodeURIComponent(src + "|" + to));
          const j = await r.json(); const out = j && j.responseData && j.responseData.translatedText;
          if (out && !/QUERY LENGTH LIMIT|INVALID|MYMEMORY WARNING|PLEASE SELECT/i.test(out)) return out.replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, "&");
        } catch (e) {}
      }
      throw new Error("x");
    })();
    cache[key] = p; p.catch(() => delete cache[key]); return p;
  }

  let on = false, timer = null, sx = 0, sy = 0, lastEl = null, lastPost = null, hideT = null;
  const OFF = 135; // Lupe sitzt über dem Finger
  function textOf(el) {
    const post = el && el.closest && el.closest(".post"); if (!post || !wall.contains(post)) return { post: null };
    const rep = el.closest(".reply"); if (rep) return { post, text: rep.textContent.trim() };
    const t = post.querySelector(":scope > .txt"); if (t) return { post, text: t.textContent.trim() };
    return { post, img: true };
  }
  function place(x, y) {
    const cx = Math.max(118, Math.min(innerWidth - 118, x)), cy = Math.max(90, y - OFF);
    lupe.style.left = cx + "px"; lupe.style.top = cy + "px";
    const el = document.elementFromPoint(cx, cy); if (el === lastEl) return; lastEl = el;
    const r = textOf(el);
    if (r.post !== lastPost) { lastPost && lastPost.classList.remove("lupe-hit"); lastPost = r.post; lastPost && lastPost.classList.add("lupe-hit"); }
    const to = target(); LNG.textContent = "→ " + NAMES[to];
    if (!r.post) { TX.className = "tx hint"; TX.textContent = T("Über einen Spruch halten …", "Hold over a post …"); return; }
    if (r.img) { TX.className = "tx hint"; TX.textContent = T("Das ist eine Kritzelei – da gibt's nichts zu übersetzen 🎨", "That's a doodle 🎨"); return; }
    const text = r.text; TX.className = "tx hint"; TX.textContent = T("übersetze …", "translating …");
    translate(text, to).then(out => { if (lastPost !== r.post || !on) return; TX.className = "tx" + (out.length > 70 ? " small" : ""); TX.textContent = out; TX.dir = ["ar", "fa"].includes(to) ? "rtl" : "auto"; live.textContent = out; })
      .catch(() => { if (lastPost === r.post) { TX.className = "tx hint"; TX.textContent = T("Übersetzen klappt gerade nicht (Internet? Tageslimit?)", "Translation failed"); } });
  }
  function start(x, y) { on = true; clearTimeout(hideT); lastEl = null; lupe.classList.add("on"); place(x, y); try { navigator.vibrate && navigator.vibrate(25); } catch (e) {} s("klowand-lupe-ok", "1"); const tip = document.querySelector(".lupe-tip"); tip && tip.remove(); }
  function end() { if (!on) return; on = false; hideT = setTimeout(() => { lupe.classList.remove("on"); lastPost && lastPost.classList.remove("lupe-hit"); lastPost = null; }, 1600); }
  const cancel = () => { clearTimeout(timer); timer = null; };

  // Touch
  wall.addEventListener("touchstart", e => { if (e.touches.length !== 1 || e.target.closest("button,a,input,textarea,form")) return; const t = e.touches[0]; sx = t.clientX; sy = t.clientY; cancel(); timer = setTimeout(() => { timer = null; start(sx, sy); }, 420); }, { passive: true });
  window.addEventListener("touchmove", e => { const t = e.touches[0]; if (!t) return; if (on) { e.preventDefault(); place(t.clientX, t.clientY); } else if (timer && Math.hypot(t.clientX - sx, t.clientY - sy) > 10) cancel(); }, { passive: false });
  window.addEventListener("touchend", () => { cancel(); end(); }); window.addEventListener("touchcancel", () => { cancel(); end(); });
  // Maus (PC)
  wall.addEventListener("mousedown", e => { if (e.button !== 0 || e.target.closest("button,a,input,textarea,form")) return; sx = e.clientX; sy = e.clientY; cancel(); timer = setTimeout(() => { timer = null; start(sx, sy); }, 420); });
  window.addEventListener("mousemove", e => { if (on) place(e.clientX, e.clientY); else if (timer && Math.hypot(e.clientX - sx, e.clientY - sy) > 6) cancel(); });
  window.addEventListener("mouseup", () => { cancel(); end(); });
  wall.addEventListener("contextmenu", e => { if (on || timer) e.preventDefault(); });
  // Klicks direkt nach der Lupe nicht als „Strich“ o. Ä. werten
  wall.addEventListener("click", e => { if (lupe.classList.contains("on")) { e.stopPropagation(); e.preventDefault(); } }, true);

  // Einmaliger Hinweis
  if (!g("klowand-lupe-ok")) setTimeout(() => { if (g("klowand-lupe-ok")) return; const t = document.createElement("div"); t.className = "lupe-tip"; t.textContent = "🔍 " + T("Neu: Lange auf die Wand drücken = Übersetzungs-Lupe", "New: long-press the wall for the translation loupe"); document.body.appendChild(t); setTimeout(() => t.remove(), 6000); }, 4000);
  window.kloLupe = { start, end, place };
})();
