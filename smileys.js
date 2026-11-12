/* Klo-Wand: Smileys beim Schreiben. Schnellleiste unter dem Textfeld + großes Smiley-Fach mit Kategorien.
   Funktioniert für das Schreibfeld und für Antworten unter Sprüchen. Zuletzt benutzte merken wir uns auf dem Handy. */
(function () {
  const msg = document.getElementById("msg"); if (!msg) return;
  const T = (de, en) => (typeof tr === "function" ? tr(de, en) : de);
  const g = k => { try { return localStorage.getItem(k); } catch (e) { return null; } }, s = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
  const FAM = typeof famBase !== "undefined" && !!famBase || /familie/.test(location.search);
  const CATS = [
    ["😀", T("Gesichter", "Faces"), "😀 😃 😄 😁 😆 😅 🤣 😂 🙂 🙃 😉 😊 😇 🥰 😍 🤩 😘 😗 😚 😙 🥲 😋 😛 😜 🤪 😝 🤑 🤗 🤭 🫢 🤫 🤔 🫡 🤐 🤨 😐 😑 😶 🫥 😏 😒 🙄 😬 😮‍💨 😌 😔 😪 🤤 😴 😷 🤒 🤕 🤢 🤮 🤧 🥵 🥶 🥴 😵 😵‍💫 🤯 🤠 🥳 🥸 😎 🤓 🧐 😕 🫤 😟 🙁 ☹️ 😮 😯 😲 😳 🥺 🥹 😦 😧 😨 😰 😥 😢 😭 😱 😖 😣 😞 😓 😩 😫 🥱 😤 😡 😠 🤬 😈 👿 💀 ☠️ 👻 👽 🤖 🎃 😺 😸 😹 😻 😼 😽 🙀 😿 😾 🙈 🙉 🙊"],
    ["❤️", T("Liebe", "Love"), "❤️ 🧡 💛 💚 💙 💜 🤎 🖤 🤍 🩷 🩵 🩶 💖 💗 💓 💞 💕 💘 💝 💟 ❣️ 💔 ❤️‍🔥 ❤️‍🩹 💌 💋 🫶 🥰 😍 😘 🌹 💐 🌷 🌸 💍 💑 💏 👩‍❤️‍👨 🤝 🙏 🫂"],
    ["👍", T("Hände", "Hands"), "👍 👎 👌 🤌 🤏 ✌️ 🤞 🫰 🤟 🤘 🤙 👈 👉 👆 👇 ☝️ ✋ 🤚 🖐️ 🖖 👋 🫡 👏 🙌 🫶 👐 🤲 🙏 💪 🦾 ✍️ 🤳 💅 👀 👁️ 👅 🧠 🫀 👣"],
    ["🎉", T("Party", "Party"), "🎉 🎊 🥳 🎈 🎂 🍰 🧁 🎁 🎀 🪅 🪩 🎶 🎵 🎤 🎧 🎸 🥁 🎹 🎷 🎺 💃 🕺 🪇 🎮 🕹️ 🎲 🧩 🎯 🎳 🎱 🏆 🥇 🥈 🥉 🏅 ⚽ 🏀 🏈 ⚾ 🎾 🏐 🏓 🥊 🛹 ✨ 🌟 ⭐ 💫 🔥 💥 🎆 🎇 🌈 ☀️ 🌙 ⚡ ❄️ ☃️ 🎄 🐣 🎃 🦄"],
    ["🍕", T("Essen", "Food"), "🍕 🍔 🍟 🌭 🥪 🌮 🌯 🥙 🧆 🥗 🍝 🍜 🍲 🍣 🍱 🥟 🍤 🍙 🍚 🍛 🥨 🥐 🍞 🥖 🧀 🥚 🍳 🥞 🧇 🥓 🍗 🍖 🍦 🍧 🍨 🍩 🍪 🎂 🍰 🧁 🍫 🍬 🍭 🍮 🍯 🍎 🍐 🍊 🍋 🍌 🍉 🍇 🍓 🫐 🍒 🥝 🍍 🥥 🥑 🥕 🌽 🥦 🥒 🌶️ 🍄 🥜 🍿 🧂 ☕ 🍵 🧋 🥤 🧃 🥛 🍼" + (FAM ? "" : " 🍺 🍻 🥂 🍷 🍸 🍹 🍾 🥃")],
    ["🐶", T("Tiere", "Animals"), "🐶 🐱 🐭 🐹 🐰 🦊 🐻 🐼 🐻‍❄️ 🐨 🐯 🦁 🐮 🐷 🐸 🐵 🙈 🐔 🐧 🐦 🐤 🦆 🦅 🦉 🦇 🐺 🐗 🐴 🦄 🐝 🪱 🐛 🦋 🐌 🐞 🐜 🪲 🐢 🐍 🦎 🦖 🦕 🐙 🦑 🦐 🦀 🐡 🐠 🐟 🐬 🐳 🐋 🦈 🐊 🐅 🐆 🦓 🦍 🐘 🦛 🦏 🐪 🦒 🦘 🐃 🐄 🐎 🐖 🐑 🦙 🐐 🦌 🐕 🐩 🐈 🐓 🦃 🦚 🦜 🦢 🦩 🕊️ 🐇 🦝 🦨 🦡 🦫 🦦 🦥 🐁 🐿️ 🦔 🐾"],
    ["🚽", T("Klo & Spaß", "Loo & fun"), "🚽 🧻 🪠 🧼 🫧 🚿 🛁 🪥 🧴 🚪 🪞 💩 🤡 👻 👀 🙈 🙊 🤫 🤪 🫠 🥴 🤯 💤 💬 💭 🗯️ 💯 ✅ ❌ ⁉️ ❓ ❗ 💡 📣 📸 📱 💻 📺 🎬 📚 ✏️ 🖍️ 🎨 🖌️ 🧸 🪀 🛼 🚀 🛸 🏠 🏖️ ⛺ 🚗 🚲 ✈️ 🗺️ ⏰ ⌛ 🌍 🍀 🌻 🌵 🌴 🍁 🌊"]];
  const ALL = CATS.map(c => c[2].split(" ").filter(Boolean));
  const QUICK = ["😂", "❤️", "😍", "🔥", "👍", "🥳", "😎", "🙈", "💩", "🚽", "😭", "🤣", "✨", "🙏", "😘"];
  const recent = () => { try { return JSON.parse(g("klowand-smileys") || "[]").filter(x => typeof x === "string").slice(0, 16); } catch (e) { return []; } };
  const remember = e => { const r = recent().filter(x => x !== e); r.unshift(e); s("klowand-smileys", JSON.stringify(r.slice(0, 16))); };

  const css = document.createElement("style");
  css.textContent = `
  .smq{display:flex;gap:4px;align-items:center;overflow-x:auto;scrollbar-width:none;padding:4px 2px 2px;-webkit-overflow-scrolling:touch}
  .smq::-webkit-scrollbar{display:none}
  .smq button,.smp .grid button{flex:none;min-width:40px;height:40px;border:0;border-radius:12px;background:rgba(255,255,255,.07);font-size:1.45rem;line-height:1;cursor:pointer;padding:0;font-family:"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif}
  .smq button:active,.smp .grid button:active{transform:scale(.88);background:rgba(255,209,102,.3)}
  .smq .more{min-width:auto;padding:0 12px;font:700 .95rem "Barlow Condensed",system-ui,sans-serif;color:#1b1424;background:#ffd166;white-space:nowrap}
  .smp{position:fixed;left:8px;right:8px;bottom:calc(8px + env(safe-area-inset-bottom,0px));z-index:65;max-width:560px;margin:0 auto;background:#1b1424;border:1px solid rgba(255,209,102,.5);border-radius:20px;box-shadow:0 -10px 40px rgba(0,0,0,.55);padding:10px 10px 12px;color:#fff;font-family:"Barlow Condensed",system-ui,sans-serif}
  .smp[hidden]{display:none}
  .smp .top{display:flex;align-items:center;gap:8px;margin-bottom:8px}
  .smp .top b{flex:none;font-size:1.1rem}
  .smp .pv{flex:1;min-width:0;background:rgba(255,255,255,.08);border-radius:10px;padding:6px 10px;font:600 1.05rem "Barlow Condensed",sans-serif;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;direction:rtl;text-align:left}
  .smp .x{min-width:44px;height:40px;border-radius:12px;border:1px solid rgba(255,255,255,.25);background:transparent;color:#fff;font:700 1rem "Barlow Condensed",sans-serif;cursor:pointer}
  .smp .tabs{display:flex;flex-wrap:nowrap;gap:4px;overflow-x:auto;scrollbar-width:none;margin-bottom:8px}
  .smp .tabs::-webkit-scrollbar{display:none}
  .smp .tabs button{flex:none;height:40px;min-width:44px;border-radius:12px;border:1px solid rgba(255,255,255,.18);background:transparent;font-size:1.3rem;cursor:pointer}
  .smp .tabs button[aria-pressed="true"]{background:#ffd166;border-color:#ffd166}
  .smp .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(42px,1fr));gap:4px;max-height:min(44vh,300px);overflow-y:auto;overscroll-behavior:contain}
  .smp .cat{grid-column:1/-1;font:700 .85rem "Barlow Condensed",sans-serif;letter-spacing:.08em;text-transform:uppercase;color:#b9adc9;margin:4px 2px 0}
  .smp .full{grid-column:1/-1;color:#ff8fab;font-size:.95rem;margin:2px}
  .rform .smb{flex:none;min-width:44px;height:44px;border-radius:12px;border:1px solid rgba(255,255,255,.2);background:transparent;font-size:1.3rem;cursor:pointer}`;
  document.head.appendChild(css);

  let target = msg;
  function insert(e) { const el = target && document.body.contains(target) ? target : msg; const max = +el.getAttribute("maxlength") || 999;
    const a = el.selectionStart != null ? el.selectionStart : el.value.length, b = el.selectionEnd != null ? el.selectionEnd : a;
    if (el.value.length - (b - a) + e.length > max) { flash(T("Das Feld ist voll.", "The field is full.")); return; }
    el.value = el.value.slice(0, a) + e + el.value.slice(b); const p = a + e.length;
    try { el.setSelectionRange(p, p); } catch (er) {}
    el.dispatchEvent(new Event("input", { bubbles: true })); remember(e); drawQuick(); pv(); }

  // Schnellleiste unter dem Schreibfeld
  const quick = document.createElement("div"); quick.className = "smq"; quick.setAttribute("role", "group"); quick.setAttribute("aria-label", T("Smileys", "Smileys"));
  msg.insertAdjacentElement("afterend", quick);
  function drawQuick() { const list = [...new Set(recent().concat(QUICK))].slice(0, 18);
    quick.innerHTML = `<button type="button" class="more" aria-haspopup="dialog">😀 ${T("Mehr Smileys", "More smileys")}</button>` + list.map(e => `<button type="button" data-e="${e}" aria-label="${e}">${e}</button>`).join(""); }
  drawQuick();
  // Damit das Textfeld nicht den Fokus verliert (Handy-Tastatur bleibt offen)
  const keep = ev => { if (ev.target.closest("button")) ev.preventDefault(); };
  quick.addEventListener("mousedown", keep); quick.addEventListener("pointerdown", keep);
  quick.addEventListener("click", ev => { const b = ev.target.closest("button"); if (!b) return; if (b.classList.contains("more")) { target = msg; open(); return; } target = msg; insert(b.dataset.e); });

  // Großes Smiley-Fach
  const pan = document.createElement("div"); pan.className = "smp"; pan.hidden = true; pan.setAttribute("role", "dialog"); pan.setAttribute("aria-label", T("Smileys auswählen", "Choose smileys"));
  document.body.appendChild(pan); let cat = 0, fullT = null;
  function flash(t) { const f = pan.querySelector(".full"); if (f) { f.textContent = t; clearTimeout(fullT); fullT = setTimeout(() => f.textContent = "", 1800); } }
  function draw() { const r = recent();
    pan.innerHTML = `<div class="top"><b>😀</b><span class="pv" aria-live="polite"></span><button type="button" class="x">${T("Fertig", "Done")}</button></div>
      <div class="tabs">${r.length ? `<button type="button" data-c="-1" aria-pressed="${cat === -1}" aria-label="${T("Zuletzt", "Recent")}">🕘</button>` : ""}${CATS.map((c, i) => `<button type="button" data-c="${i}" aria-pressed="${cat === i}" aria-label="${c[1]}">${c[0]}</button>`).join("")}</div>
      <div class="grid"><span class="full" aria-live="polite"></span><span class="cat">${cat === -1 ? T("Zuletzt benutzt", "Recently used") : CATS[cat][1]}</span>${(cat === -1 ? r : ALL[cat]).map(e => `<button type="button" data-e="${e}" aria-label="${e}">${e}</button>`).join("")}</div>`; }
  function pv() { const el = target && document.body.contains(target) ? target : msg, q = pan.querySelector(".pv"); if (q) q.textContent = "\u200e" + (el.value || T("Dein Text …", "Your text …")) + "\u200e"; }
  function open() { if (cat === -1 && !recent().length) cat = 0; draw(); pv(); pan.hidden = false; }
  pan.addEventListener("mousedown", keep); pan.addEventListener("pointerdown", keep);
  pan.addEventListener("click", ev => { const b = ev.target.closest("button"); if (!b) return;
    if (b.classList.contains("x")) { pan.hidden = true; return; }
    if (b.dataset.c != null) { cat = +b.dataset.c; draw(); pv(); return; }
    if (b.dataset.e) insert(b.dataset.e); });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && !pan.hidden) pan.hidden = true; });
  document.addEventListener("pointerdown", e => { if (!pan.hidden && !pan.contains(e.target) && !quick.contains(e.target) && !e.target.closest(".smb")) pan.hidden = true; }, true);

  // Antworten unter Sprüchen: kleiner 😀-Knopf im Antwortfeld
  function addReplyBtn(f) { if (f.querySelector(".smb")) return; const inp = f.querySelector("input"); if (!inp) return;
    const b = document.createElement("button"); b.type = "button"; b.className = "smb"; b.textContent = "😀"; b.setAttribute("aria-label", T("Smileys", "Smileys"));
    b.addEventListener("mousedown", keep); b.addEventListener("pointerdown", keep);
    b.onclick = () => { target = inp; open(); }; inp.insertAdjacentElement("afterend", b); }
  const wall = document.getElementById("wall");
  if (wall) { new MutationObserver(() => wall.querySelectorAll(".rform").forEach(addReplyBtn)).observe(wall, { childList: true, subtree: true }); wall.querySelectorAll(".rform").forEach(addReplyBtn); }
  document.addEventListener("focusin", e => { if (e.target === msg || (e.target.closest && e.target.closest(".rform"))) target = e.target; });
})();
