/* Klo-Wand: Notfall-Knopf für Kinder. Große Bilder (Emojis) und kurze Sätze zu typischen Situationen.
   Ersetzt keinen Erste-Hilfe-Kurs. Wichtigste Botschaft immer: Erwachsenen holen, im Zweifel Notruf.
   Wird im Familien-Bereich (familie-app.js) über window.kloNotfall() geöffnet. */
(function () {
  // Notrufnummern je nach Sprache: Deutschland/Europa 112, Japan 119, Englisch zusätzlich 911 (USA)
  const N = LANG === "ja" ? "119" : "112";
  const CALL = LANG === "ja" ? [["119", "119"]] : LANG === "en" ? [["112", "112"], ["911", "911"]] : [["112", "112"]];
  const GIFT = LANG === "de" ? tr("Giftnotruf 030 19240 (für Kinder, ganz Deutschland) oder 112 anrufen.", "") : tr("", `Call ${N} or the poison control centre.`, `${N}に電話。`);

  const S = [
    { e: "📞", t: tr("So rufst du den Notruf", "How to call for help", "119番のかけかた"), steps: [
      ["📍", tr("Sag, wo du bist: Straße, Hausnummer, Stadt.", "Say where you are: street, house number, town.", "どこにいるか言う：住所。")],
      ["❓", tr("Sag, was passiert ist.", "Say what happened.", "何があったか言う。")],
      ["👥", tr("Sag, wie viele verletzt sind.", "Say how many people are hurt.", "けがをした人は何人か言う。")],
      ["⏳", tr("Warte auf Fragen. Leg nicht auf, bis man es dir sagt!", "Wait for questions. Don't hang up until they tell you!", "質問を待つ。言われるまで電話を切らない！")]] },
    { e: "😵", t: tr("Jemand wacht nicht auf", "Someone won't wake up", "人が起きない"), urgent: true, steps: [
      ["🗣️", tr("Laut ansprechen und an der Schulter rütteln.", "Speak loudly and shake their shoulder.", "大きな声で呼びかけ、肩をたたく。")],
      ["📣", tr("Ganz laut „Hilfe!“ rufen. Erwachsene holen.", "Shout “Help!” really loud. Get an adult.", "「助けて！」と大声で。大人を呼ぶ。")],
      ["📞", tr(`${N} anrufen. Die Leute am Telefon sagen dir, was du tun sollst.`, `Call ${N}. The people on the phone will tell you what to do.`, `${N}に電話。電話の人がやり方を教えてくれます。`)],
      ["🤝", tr("Bleib da, bis Hilfe kommt.", "Stay until help arrives.", "助けが来るまでそばにいる。")]] },
    { e: "🩸", t: tr("Nasenbluten", "Nosebleed", "鼻血"), steps: [
      ["🪑", tr("Hinsetzen.", "Sit down.", "すわる。")],
      ["⬇️", tr("Kopf nach vorne beugen, nicht nach hinten!", "Lean your head forward, not back!", "頭を前にかたむける。後ろはダメ！")],
      ["🤏", tr("Vorne die Nase zusammendrücken, etwa 10 Minuten.", "Pinch the soft part of your nose for about 10 minutes.", "鼻の先をつまむ（約10分）。")],
      ["🧊", tr("Ein kaltes, nasses Tuch in den Nacken legen.", "Put a cold, wet cloth on the back of your neck.", "首の後ろに冷たいタオル。")],
      ["🧑", tr("Hört es nicht auf: Erwachsenen holen.", "If it won't stop: get an adult.", "止まらなければ大人を呼ぶ。")]] },
    { e: "🩹", t: tr("Wunde / aufgeschürft", "Cut or graze", "すりきず・切りきず"), steps: [
      ["🧑", tr("Erwachsenen holen.", "Get an adult.", "大人を呼ぶ。")],
      ["🚿", tr("Dreck vorsichtig mit sauberem Wasser abspülen.", "Gently rinse off dirt with clean water.", "きれいな水でよごれを流す。")],
      ["🩹", tr("Pflaster oder Verband drauf.", "Put on a plaster or bandage.", "ばんそうこうをはる。")],
      ["❗", tr(`Blutet es stark: sauberes Tuch fest draufdrücken und ${N} anrufen.`, `Bleeding a lot: press a clean cloth on it hard and call ${N}.`, `血がたくさん出たら：きれいな布で強くおさえて${N}。`)]] },
    { e: "🔥", t: tr("Verbrannt / verbrüht", "Burn", "やけど"), steps: [
      ["🚿", tr("Sofort unter fließendes, handwarmes Wasser halten, etwa 10 Minuten. Kein Eis!", "Hold it under running lukewarm water straight away for about 10 minutes. No ice!", "すぐに流水で約10分冷やす。氷はダメ！")],
      ["🚫", tr("Keine Butter, Creme oder Mehl drauf. Blasen nicht aufmachen.", "No butter, cream or flour. Don't pop blisters.", "バターやクリームはぬらない。水ぶくれはつぶさない。")],
      ["🧑", tr("Erwachsenen holen.", "Get an adult.", "大人を呼ぶ。")],
      ["❗", tr(`Große Stelle oder im Gesicht: ${N} anrufen.`, `Big burn or on the face: call ${N}.`, `広いやけどや顔なら${N}。`)]] },
    { e: "🐝", t: tr("Bienen- oder Wespenstich", "Bee or wasp sting", "ハチにさされた"), steps: [
      ["👆", tr("Stachel vorsichtig wegschieben, nicht quetschen.", "Gently scrape the sting away, don't squeeze it.", "針はそっとはらう。つままない。")],
      ["🧊", tr("Kühlen: Eis in ein Tuch wickeln und drauflegen.", "Cool it: wrap ice in a cloth and hold it on.", "布で包んだ氷で冷やす。")],
      ["❗", tr(`Stich im Mund oder Hals, oder schwer atmen: sofort ${N}!`, `Sting in the mouth or throat, or hard to breathe: call ${N} now!`, `口やのど、息が苦しい：すぐ${N}！`)]] },
    { e: "🤕", t: tr("Kopf gestoßen", "Bumped head", "頭をぶつけた"), steps: [
      ["🧊", tr("Mit einem kalten Tuch kühlen.", "Cool it with a cold cloth.", "冷たいタオルで冷やす。")],
      ["🛋️", tr("Ausruhen und einem Erwachsenen Bescheid sagen.", "Rest and tell an adult.", "休んで大人に知らせる。")],
      ["❗", tr(`Wird einem schlecht, muss man brechen, ist man sehr müde oder durcheinander: ${N} anrufen.`, `Feeling sick, throwing up, very sleepy or confused: call ${N}.`, `気持ち悪い、吐く、すごく眠い、ぼーっとする：${N}。`)]] },
    { e: "🧴", t: tr("Etwas Giftiges geschluckt", "Swallowed something poisonous", "毒のあるものを飲んだ"), steps: [
      ["🚫", tr("Nicht zum Spucken oder Brechen bringen.", "Don't make them throw up.", "むりに吐かせない。")],
      ["📦", tr("Flasche, Packung oder Pflanze aufheben.", "Keep the bottle, packet or plant.", "ボトルや箱、植物をとっておく。")],
      ["🧑", tr("Sofort Erwachsenen holen.", "Get an adult right away.", "すぐ大人を呼ぶ。")],
      ["📞", GIFT || tr("", `Call ${N}.`, `${N}に電話。`)]] },
    { e: "😮", t: tr("Verschluckt", "Choking", "のどにつまった"), steps: [
      ["😮‍💨", tr("Hustet jemand? Weiter husten lassen.", "Still coughing? Let them keep coughing.", "せきが出ていたら、せきを続けさせる。")],
      ["❗", tr(`Kann nicht mehr husten oder atmen: sofort Erwachsenen holen und ${N} anrufen.`, `Can't cough or breathe: get an adult and call ${N} right away.`, `せきも息もできない：すぐ大人を呼んで${N}。`)]] },
  ];
  if (LANG === "de") S.push({ e: "💛", t: "Ich hab Sorgen", steps: [
    ["🧑", "Erzähl es einem Erwachsenen, dem du vertraust."],
    ["📞", "Nummer gegen Kummer: 116 111. Kostenlos und anonym, Mo–Sa 14–20 Uhr."]], tel: "116111" });
  if (LANG === "ja") S.push({ e: "💛", t: "なやみがある", steps: [["🧑", "信じられる大人に話す。"], ["📞", "チャイルドライン 0120-99-7777（無料）"]], tel: "0120997777" });

  const css = document.createElement("style");
  css.textContent = `
  .nf{position:fixed;inset:0;z-index:47;background:rgba(20,24,22,.85);display:flex;align-items:flex-start;justify-content:center;overflow-y:auto;padding:14px max(12px,env(safe-area-inset-left,0px)) 40px}
  .nf .box{width:min(560px,100%);background:#fff;color:var(--ink);border:4px solid #b3261e;border-radius:16px;padding:14px;box-shadow:0 18px 40px rgba(0,0,0,.45)}
  .nf .head{display:flex;align-items:center;justify-content:space-between;gap:8px}
  .nf h2{margin:0;font:400 1.7rem/1.1 var(--f-marker);color:#b3261e}
  .nf .x{font:700 1.5rem var(--f-ui);background:none;border:none;color:var(--ink);min-width:48px;min-height:48px;cursor:pointer}
  .nf .call{display:flex;gap:8px;margin:8px 0 12px}
  .nf .call a{flex:1;display:flex;align-items:center;justify-content:center;gap:10px;background:#b3261e;color:#fff;text-decoration:none;font:700 1.5rem var(--f-ui);letter-spacing:.04em;border-radius:12px;min-height:64px;box-shadow:0 4px 0 #7d1a15}
  .nf .grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
  .nf .tile{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;min-height:118px;background:#fff6d6;border:2px solid #e0a92e;border-radius:12px;cursor:pointer;font:700 1.05rem/1.15 var(--f-ui);color:var(--ink);padding:8px;text-align:center}
  .nf .tile.urgent{background:#fdeceb;border-color:#b3261e}
  .nf .tile span{font-size:2.8rem;line-height:1}
  .nf .big{font-size:4rem;text-align:center;line-height:1;margin:6px 0 2px}
  .nf h3{margin:0 0 10px;text-align:center;font:700 1.5rem var(--f-ui)}
  .nf ol{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:10px}
  .nf li{display:flex;gap:12px;align-items:center;background:#f4f7f5;border-radius:12px;padding:10px 12px;font:600 1.2rem/1.3 var(--f-ui)}
  .nf li b{flex:none;width:52px;height:52px;display:flex;align-items:center;justify-content:center;font-size:2.1rem;background:#fff;border-radius:50%;box-shadow:0 1px 3px rgba(0,0,0,.15)}
  .nf .row{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}
  .nf .btn{flex:1;font:700 1.05rem var(--f-ui);letter-spacing:.04em;border-radius:10px;border:2px solid var(--ink);background:#fff;color:var(--ink);min-height:52px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;text-decoration:none}
  .nf .btn.say{background:var(--ink);color:#fff}
  .nf .fine{margin:12px 0 0;font:600 .85rem/1.35 var(--f-ui);color:#5d6a63;text-align:center}`;
  document.head.appendChild(css);

  const callBtns = () => `<div class="call">${CALL.map(([n, t]) => `<a href="tel:${t}">📞 ${tr(`${n} anrufen`, `Call ${n}`, `${n}に電話`)}</a>`).join("")}</div>`;
  const fine = `<p class="fine">${tr("Im Zweifel immer einen Erwachsenen holen oder " + N + " anrufen. Diese Hilfe ersetzt keinen Erste-Hilfe-Kurs.", "When in doubt, always get an adult or call " + N + ". This doesn't replace a first-aid course.", "迷ったら大人を呼ぶか" + N + "へ。応急手当講習の代わりにはなりません。")}</p>`;

  function speak(text) {
    try {
      if (!("speechSynthesis" in window)) return;
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text); u.lang = LANG === "ja" ? "ja-JP" : LANG === "en" ? "en-GB" : "de-DE"; u.rate = 0.9;
      speechSynthesis.speak(u);
    } catch (e) {}
  }

  window.kloNotfall = function () {
    if (document.querySelector(".nf")) return;
    const el = document.createElement("div");
    el.className = "nf"; el.setAttribute("role", "dialog"); el.setAttribute("aria-label", tr("Notfall", "Emergency", "きんきゅう"));
    document.body.appendChild(el);
    const home = () => {
      el.innerHTML = `<div class="box"><div class="head"><h2>🚑 ${tr("Notfall", "Emergency", "きんきゅう")}</h2><button type="button" class="x" aria-label="${tr("Schließen", "Close", "閉じる")}">✕</button></div>
        ${callBtns()}
        <div class="grid">${S.map((s, i) => `<button type="button" class="tile${s.urgent ? " urgent" : ""}" data-i="${i}"><span>${s.e}</span>${s.t}</button>`).join("")}</div>${fine}</div>`;
    };
    const show = i => {
      const s = S[i];
      el.innerHTML = `<div class="box"><div class="head"><button type="button" class="btn back" style="flex:none;padding:0 14px">← ${tr("Zurück", "Back", "もどる")}</button><button type="button" class="x" aria-label="${tr("Schließen", "Close", "閉じる")}">✕</button></div>
        <div class="big">${s.e}</div><h3>${s.t}</h3>
        <ol>${s.steps.map(([e, t]) => `<li><b>${e}</b><span>${t}</span></li>`).join("")}</ol>
        <div class="row"><button type="button" class="btn say" data-say="${i}">🔊 ${tr("Vorlesen", "Read aloud", "読み上げ")}</button>
        ${s.tel ? `<a class="btn" href="tel:${s.tel}">📞 ${tr("Anrufen", "Call", "電話")}</a>` : ""}</div>
        ${s.urgent || s.steps.some(x => x[1].includes(N)) ? callBtns() : ""}${fine}</div>`;
      el.scrollTop = 0;
    };
    home();
    el.addEventListener("click", e => {
      if (e.target === el || e.target.closest(".x")) { try { speechSynthesis.cancel(); } catch (x) {} el.remove(); return; }
      if (e.target.closest(".back")) { try { speechSynthesis.cancel(); } catch (x) {} home(); return; }
      const t = e.target.closest(".tile[data-i]"); if (t) { show(Number(t.dataset.i)); return; }
      const sy = e.target.closest("[data-say]");
      if (sy) { const s = S[Number(sy.dataset.say)]; speak(s.t + ". " + s.steps.map(x => x[1]).join(" ")); }
    });
  };
})();
