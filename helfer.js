/* Klo-Wand: kleiner Helfer (Leo an der Bar-Wand, Pia im Familien-Planner).
   Beantwortet Fragen zur Wand. Läuft komplett auf dem Handy: keine Daten gehen raus, nichts wird gespeichert.
   Neue Antworten einfach unten in die Liste FAQ schreiben: k = Stichwörter (klein), a = Antwort, go = Knopf. */
(() => {
  if (typeof tr !== "function") return;
  const FAM = typeof FAM_DEVICE !== "undefined" && FAM_DEVICE;
  const IS_DEMO = typeof DEMO !== "undefined" && DEMO;
  const SHOP = (typeof UPDATE_LINK === "string" && UPDATE_LINK) || "https://payhip.com/Pikumio";
  const NAME = FAM ? "Pia" : "Leo";
  const C = FAM
    ? { b1: "#ffffff", b2: "#f1ece5", st: "#e3dbd0", face: "#243238", ear: "#d9483b", eye: "#8ef0d4", cheek: true, accent: "#d9483b" }
    : { b1: "#3a4a5c", b2: "#26313d", st: "#5a6f86", face: "#080d10", ear: "#f2c14e", eye: "#ffd27a", cheek: false, accent: "#f2c14e" };

  const head = (id) => `<svg viewBox="0 0 440 360" aria-hidden="true">
    <defs><linearGradient id="${id}b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.b1}"/><stop offset="1" stop-color="${C.b2}"/></linearGradient></defs>
    <line x1="220" y1="78" x2="220" y2="40" stroke="${FAM ? "#1f2a2e" : C.st}" stroke-width="10" stroke-linecap="round"/>
    <path class="hf-heart" d="M220 44 C 200 30, 196 10, 210 8 C 216 7, 220 12, 220 16 C 220 12, 224 7, 230 8 C 244 10, 240 30, 220 44 Z" fill="${C.accent}"/>
    <rect x="20" y="170" width="40" height="90" rx="20" fill="${C.ear}"/><rect x="380" y="170" width="40" height="90" rx="20" fill="${C.ear}"/>
    <rect x="40" y="76" width="360" height="270" rx="110" fill="url(#${id}b)" stroke="${C.st}" stroke-width="6"/>
    <rect x="78" y="112" width="284" height="196" rx="86" fill="${C.face}"/>
    <g class="hf-eyes" fill="${C.eye}"><ellipse cx="168" cy="196" rx="26" ry="32"/><ellipse cx="272" cy="196" rx="26" ry="32"/></g>
    <circle cx="176" cy="184" r="8" fill="#fff" opacity=".85"/><circle cx="280" cy="184" r="8" fill="#fff" opacity=".85"/>
    ${C.cheek ? `<ellipse cx="128" cy="250" rx="22" ry="12" fill="#ff8f8f" opacity=".55"/><ellipse cx="312" cy="250" rx="22" ry="12" fill="#ff8f8f" opacity=".55"/>` : ""}
    <path class="hf-mouth" d="M 186 252 Q 220 286 254 252 Q 220 262 186 252 Z" fill="#ff9a7a" stroke="${C.eye}" stroke-width="6" stroke-linejoin="round"/>
  </svg>`;

  /* ---------- Was der Helfer weiß ---------- */
  const has = id => !!document.getElementById(id);
  const click = sel => () => { close(); setTimeout(() => { const el = document.querySelector(sel); if (el) el.click(); }, 150); };
  const toMsg = () => { close(); setTimeout(() => { const m = document.getElementById("msg"); if (m) { m.scrollIntoView({ block: "center" }); m.focus(); } }, 150); };
  const sos = () => { close(); setTimeout(() => window.kloNotfall && kloNotfall(), 150); };
  const link = url => () => { location.href = url; };

  const JOKES = [
    tr("Warum nimmt die Klorolle nie den Aufzug? Sie rollt lieber! 🧻", "Why does the toilet roll never take the elevator? It'd rather roll! 🧻"),
    tr("Was sagt die Klobrille zum Kind? „Setz dich, ich hab Zeit!“ 🚽", "What did the toilet seat say? “Take a seat, I've got time!” 🚽"),
    tr("Treffen sich zwei Seifen. Sagt die eine: „Na, alles sauber?“ 🧼", "Two soaps meet. One says: “All clean?” 🧼"),
    tr("Warum ist das Waschbecken so gut gelaunt? Es lässt einfach alles abfließen. 😄", "Why is the sink always happy? It just lets everything drain away. 😄"),
    tr("Was ist weiß und hüpft durchs Bad? Ein Klopapier-Hase! 🐰", "What's white and hops around the bathroom? A toilet-paper bunny! 🐰"),
  ];

  const FAQ = [
    { k: ["hallo", "hi ", "hey", "moin", "servus", "wer bist", "wie heißt", "hello", "who are you", "your name"],
      a: () => FAM ? tr("Hallo, ich bin Pia! 💛 Ich helfe dir mit dem Familien-Planner. Frag mich einfach, zum Beispiel: „Wie mache ich einen Stundenplan?“", "Hi, I'm Pia! 💛 I help you with the Family Planner. Just ask me, for example: “How do I make a timetable?”")
        : tr("Hey, ich bin Leo! 🤖 Ich kenne mich an dieser Wand aus. Frag mich einfach, zum Beispiel: „Wie male ich was?“", "Hey, I'm Leo! 🤖 I know my way around this wall. Just ask, for example: “How do I draw?”") },
    { k: ["schreib", "spruch", "text", "poste", "posten", "nachricht", "write", "post", "message"],
      a: () => tr("Unten auf „✏️ Schreiben“ tippen, deinen Spruch ins Feld schreiben und abschicken. Bis zu 120 Zeichen. Darunter kannst du Farbe und Schrift wählen.", "Tap “✏️ Write” at the bottom, type your line into the box and send it. Up to 120 characters. You can pick a color and font below."),
      go: [tr("✏️ Los schreiben", "✏️ Start writing"), toMsg] },
    { k: [" mal", "zeichn", "kritzel", "draw", "paint", "doodle"],
      a: () => IS_DEMO ? tr("Malen gibt's in der Vollversion. In der Demo kannst du schon schreiben, Striche setzen und antworten.", "Drawing is in the full version. In the demo you can already write, mark and reply.")
        : tr("Unten auf „🖍️ Malen“ tippen und mit dem Finger auf die Fläche malen. Mit „Wegwischen“ fängst du neu an. Dann abschicken, fertig!", "Tap “🖍️ Draw” at the bottom and paint with your finger. “Wipe” starts over. Then send it, done!"),
      go: () => IS_DEMO ? null : [tr("🖍️ Malen öffnen", "🖍️ Open drawing"), click("[data-m=draw]")] },
    { k: ["farbe", "schrift", "font", "color", "colour", "bunt"],
      a: () => tr("Wenn „✏️ Schreiben“ an ist, siehst du unter dem Textfeld die Farben und Schriften. Einfach antippen, bevor du abschickst.", "With “✏️ Write” on, you'll see colors and fonts under the text box. Tap one before sending.") },
    { k: ["strich", "like", "gefällt", "gefallt", "herz", "daumen", "mag ich"],
      a: () => tr("Unter jedem Spruch ist der Knopf „Strich setzen“. Das ist wie ein Like. Pro Spruch geht das einmal. Die meisten Striche landen bei „Beliebt“.", "Under every post there's a “Mark” button. It's like a like. Once per post. The most marked posts show up under “Popular”.") },
    { k: ["antwort", "kommentar", "drunter", "reply", "comment"],
      a: () => tr("Tipp unter einem Spruch auf „Antworten“ und schreib etwas drunter. Bis zu 60 Zeichen.", "Tap “Reply” under a post and write something below it. Up to 60 characters.") },
    { k: ["melden", "gemein", "beleidig", "doof", "blöd", "mobb", "report", "mean", "rude", "bully"],
      a: () => FAM ? tr("Im Familien-Planner schreibt nur deine Familie. Wenn dich etwas stört, sag es Mama oder Papa. Die können jeden Beitrag löschen.", "In the Family Planner only your family writes. If something bothers you, tell a parent. They can delete any post.")
        : tr("Wenn etwas gemein ist: unter dem Spruch auf „Melden“ tippen. Nach 3 Meldungen verschwindet er. Der Besitzer der Wand kann ihn auch löschen. Gemeine Wörter blockt die Wand schon beim Schreiben.", "If something is mean, tap “Report” under it. After 3 reports it disappears. The wall owner can delete it too. Mean words are blocked before they're even posted.") },
    { k: ["lösch", "losch", "weg mach", "zurück", "rückgängig", "delete", "remove", "undo"],
      a: () => tr("Du schreibst anonym, darum kannst du einen Spruch nicht selbst löschen. Das kann nur der Besitzer der Wand auf „Meine Wand“. Überleg also kurz vorm Abschicken. 😉", "You post anonymously, so you can't delete your own post. Only the wall owner can, on “My wall”. So think twice before sending. 😉") },
    { k: ["beliebt", " neu ", "sortier", "reihenfolge", "popular", "newest", "sort"],
      a: () => tr("Oben über der Wand: „Neu“ zeigt die neuesten Sprüche, „Beliebt“ die mit den meisten Strichen.", "Above the wall: “New” shows the latest posts, “Popular” the ones with the most marks.") },
    { k: ["challenge", "aufgabe", "wochen", "thema", "weekly"],
      a: () => tr("Jede Woche gibt es eine neue Challenge oben an der Wand. Schreib oder mal was dazu und tipp vorm Abschicken auf „Für die Challenge“. Der beste Beitrag der Woche bekommt einen Ehrenplatz.", "There's a new challenge at the top of the wall every week. Write or draw something and tap “For the challenge” before sending. The best post of the week gets a place of honor.") },
    { k: ["spiel", "game", "rangliste", "highscore", "punkte", "zocken", "leaderboard", "score", "play"],
      a: () => tr("Es gibt 3 Spiele: Klorollen-Fang, Spül-Reflex und Klopapier-Stapeln. Mit Rangliste für heute und die ganze Woche! Tipp auf „🎮 Spiele & Rangliste“.", "There are 3 games: Roll Catch, Flush Reflex and Paper Tower, with leaderboards for today and the whole week! Tap “🎮 Games & Leaderboard”."),
      go: () => has("kgOpen") ? [tr("🎮 Spiele öffnen", "🎮 Open games"), click("#kgOpen")] : null },
    { k: ["musik", "lied", "song", "music", "sound"],
      a: () => tr("Tipp auf „Musik an“ über der Wand. Mit „Lied“ wechselst du den Song.", "Tap “Music on” above the wall. “Song” switches the track."),
      go: () => has("kgMusic") ? [tr("🎵 Musik an/aus", "🎵 Music on/off"), click("#kgMusic")] : null },
    { k: ["orakel", "zukunft", "wahrsag", "oracle", "fortune"],
      a: () => tr("Das Orakel sagt dir einen lustigen Spruch für heute. Tipp auf „🔮 Orakel“ und lass dich überraschen!", "The oracle gives you a funny saying for today. Tap “🔮 Oracle” and be surprised!"),
      go: () => has("orcOpen") ? [tr("🔮 Orakel fragen", "🔮 Ask the oracle"), click("#orcOpen")] : null },
    { k: ["hintergrund", "stil", "design", "aussehen", "eigenes foto", "background", "theme", "wallpaper"],
      a: () => tr("Tipp auf „🎨 Hintergrund“. Da gibt es Konfetti, Weltall, Regenbogen und mehr. Du kannst auch ein eigenes Foto nehmen. Das bleibt nur auf deinem Handy.", "Tap “🎨 Background”. There's confetti, space, rainbow and more. You can also use your own photo. It stays on your phone only."),
      go: () => has("stilOpen") ? [tr("🎨 Hintergrund wählen", "🎨 Pick a background"), click("#stilOpen")] : null },
    { k: ["stundenplan", "schule", "fach", "fächer", "unterricht", "timetable", "school", "class"],
      a: () => FAM ? tr("Tipp auf „📅 Stundenplan“. Für jedes Kind gibt es einen eigenen Plan. Mit „Woche bearbeiten“ trägst du die Fächer ein, mit „🔊 Vorlesen“ liest das Handy den Tag vor.", "Tap “📅 Timetable”. Each child gets their own plan. “Edit week” lets you fill in subjects, “🔊 Read aloud” reads the day to you.")
        : tr("Den Stundenplan gibt's im Familien-Planner, der privaten Familien-Wand.", "The timetable is part of the Family Planner, the private family wall."),
      go: () => has("famPlan") ? [tr("📅 Stundenplan öffnen", "📅 Open timetable"), click("#famPlan")] : null },
    { k: ["foto", "bild hoch", "bilder", "photo", "picture", " pic"],
      a: () => FAM ? tr("Tipp auf „📷 Familienfotos“ und dann aufs Plus. Die Fotos sieht nur eure Familie, sofort auf allen Handys.", "Tap “📷 Family photos”, then the plus. Only your family sees the photos, right away on every phone.")
        : tr("Fotos gibt es nur im privaten Familien-Planner. An dieser Wand kannst du schreiben und malen.", "Photos are only in the private Family Planner. On this wall you can write and draw."),
      go: () => has("famFoto") ? [tr("📷 Fotos öffnen", "📷 Open photos"), click("#famFoto")] : null },
    { k: ["notfall", "verletzt", "blut", "unfall", "krank", "112", "notruf", "emergency", "hurt", "injur", "bleed", "ambulance"],
      a: () => tr("Wenn jemand in Gefahr ist: sofort 112 anrufen! Und einem Erwachsenen Bescheid sagen. Im Notfall-Bereich siehst du Bilder, was man tun kann.", "If someone's in danger: call 112 (911 in the US) right away! And tell an adult. The emergency section shows pictures of what to do."),
      go: () => window.kloNotfall ? [tr("🚑 Notfall-Hilfe öffnen", "🚑 Open emergency help"), sos] : null },
    { k: ["traurig", "angst", "sorge", "einsam", "allein", "weinen", "kummer", "sad", "scared", "afraid", "lonely", "cry", "worried"],
      a: () => tr("Das tut mir leid. 💛 Sprich mit jemandem, dem du vertraust, zum Beispiel Mama, Papa, Lehrerin oder Lehrer. Du kannst auch kostenlos anrufen: Nummer gegen Kummer 116 111 (Mo–Sa 14–20 Uhr). Im Notfall: 112.", "I'm sorry. 💛 Please talk to someone you trust, like a parent or teacher. In an emergency call 112 (911 in the US).") },
    { k: ["privat", "wer sieht", "wer kann", "sicher", "anonym", "daten", "datenschutz", "konto", "privacy", "private", "who can see", "safe", "account"],
      a: () => FAM ? tr("Der Familien-Planner ist privat. Nur Handys mit eurem Familien-Code sehen, was ihr schreibt. Ein Konto braucht ihr nicht, und alle schreiben ohne Namen.", "The Family Planner is private. Only phones with your family code can see what you write. No account needed, and nobody uses names.")
        : tr("Du schreibst anonym, ohne Konto und ohne Namen. Bitte schreib auch keine Namen, Nummern oder Adressen an die Wand. Die Wand blockt so was automatisch.", "You post anonymously, no account, no name. Please don't post names, numbers or addresses either. The wall blocks that automatically.") },
    { k: ["regel", "erlaubt", "verboten", "darf", "politik", "rules", "allowed"],
      a: () => tr("Die Wand-Regeln: Sei nett und witzig. Nicht erlaubt sind Schimpfwörter, Gemeinheiten, Politik, Gewalt, Drogen, Namen, Nummern, Links und Treffen mit Fremden. Das schützt alle, besonders Kinder.", "Wall rules: be nice and funny. Not allowed: swear words, meanness, politics, violence, drugs, names, numbers, links and meeting strangers. That keeps everyone safe, especially kids.") },
    { k: ["kauf", "preis", "kostet", "kosten", "eigene wand", "vollversion", "bezahl", "abo", "buy", "price", "cost", "own wall", "full version"],
      a: () => tr("Eine eigene Wand kaufst du einmalig im Shop. Kein Abo, keine App aus dem Store. Mit einem Code bekommst du 2 Wände, zum Beispiel eine für die Bar und eine für die Familie.", "You buy your own wall once in the shop. No subscription, no app store. One code gives you 2 walls, for example one for your bar and one for your family."),
      go: () => [tr("🛒 Zum Shop", "🛒 Go to shop"), link(SHOP)] },
    { k: ["gesperrt", "schloss", "🔒", "demo", "geht nicht", "locked"],
      a: () => IS_DEMO ? tr("Das hier ist die Demo. Schreiben, Striche setzen und Antworten gehen schon. Alles mit 🔒 (Malen, Musik, 2 Spiele, Familien-Planner) gibt's in der Vollversion.", "This is the demo. Writing, marking and replying already work. Everything with 🔒 (drawing, music, 2 games, Family Planner) is in the full version.")
        : tr("Wenn etwas nicht geht: Seite einmal neu laden. Hilft das nicht, frag den Besitzer der Wand.", "If something doesn't work: reload the page once. If that doesn't help, ask the wall owner.") },
    { k: [" app", "installier", "startbildschirm", "homescreen", "home screen", "download", "herunterlad"],
      a: () => tr("Die Wand ist keine Store-App, sie läuft im Browser. So kommt sie auf den Startbildschirm: Android/Chrome: oben rechts ⋮ → „Zum Startbildschirm hinzufügen“. iPhone/Safari: Teilen-Knopf → „Zum Home-Bildschirm“.", "The wall isn't a store app, it runs in your browser. To add it to your home screen: Android/Chrome: ⋮ top right → “Add to Home screen”. iPhone/Safari: Share button → “Add to Home Screen”.") },
    { k: ["meine wand", "besitzer", "verwalt", "code einlös", "einlösen", "admin", "my wall", "owner", "redeem"],
      a: () => tr("Als Besitzer gehst du auf „Meine Wand“. Dort löst du deinen Code ein, druckst den QR-Code, löschst Beiträge und schaltest den Familien-Planner ein.", "As the owner, go to “My wall”. There you redeem your code, print the QR code, delete posts and switch on the Family Planner."),
      go: () => [tr("🔑 Meine Wand öffnen", "🔑 Open My wall"), link("meine-wand.html")] },
    { k: ["familien-code", "familiencode", "einladen", "anderes handy", "oma", "opa", "family code", "invite"],
      a: () => tr("Mama oder Papa öffnen „Meine Wand“ und tippen beim Familien-Planner auf „QR zeigen“ oder „Link kopieren“. Mit dem QR-Code kommt jedes Familien-Handy rein, auch Oma und Opa. 👵", "A parent opens “My wall” and taps “Show QR” or “Copy link” in the Family Planner box. Every family phone can join with that QR code, even grandma. 👵") },
    { k: ["vorles", "lesen kann", "hören", "read aloud", "can't read", "listen"],
      a: () => tr("Bei jeder Antwort von mir gibt es den Knopf 🔊. Dann lese ich dir alles vor! Im Stundenplan gibt's auch „Vorlesen“.", "Every answer of mine has a 🔊 button. Tap it and I'll read it to you! The timetable has “Read aloud” too.") },
    { k: ["witz", "lustig", "lachen", "joke", "funny"],
      a: () => JOKES[Math.floor(Math.random() * JOKES.length)] },
    { k: ["danke", "super", "cool", "toll", "thanks", "thank", "great"],
      a: () => tr("Gern geschehen! 😊 Frag mich jederzeit wieder.", "You're welcome! 😊 Ask me anytime.") },
    { k: ["wer hat", "erfunden", "gemacht", "kay", "who made", "created"],
      a: () => tr("Die Wand hat Kay aus Leipzig gebaut. 🦔 Er hat lange in der Gastronomie gearbeitet und wollte eine Wand, auf der alle zusammen Spaß haben.", "Kay from Leipzig built this wall. 🦔 He worked in bars and restaurants for years and wanted a wall where everyone has fun together.") },
    { k: [" ki ", "künstlich", "roboter", "bist du echt", "mensch", "robot", " ai ", " real "],
      a: () => tr(`Ich bin ${NAME}, ein kleiner Helfer-Roboter. 🤖 Ich kenne nur die Antworten zur Wand und schicke nichts ins Internet. Was du mich fragst, wird nirgends gespeichert.`, `I'm ${NAME}, a little helper robot. 🤖 I only know answers about this wall and send nothing to the internet. Nothing you ask me is stored.`) },
  ];
  const CHIPS = FAM
    ? [tr("Wie mache ich einen Stundenplan?", "How do I make a timetable?"), tr("Wie lade ich Fotos hoch?", "How do I add photos?"), tr("Notfall – was tun?", "Emergency – what to do?"), tr("Wer kann das sehen?", "Who can see this?"), tr("Erzähl einen Witz!", "Tell me a joke!")]
    : [tr("Wie schreibe ich was?", "How do I write?"), tr("Wie male ich?", "How do I draw?"), tr("Welche Spiele gibt es?", "What games are there?"), tr("Was ist erlaubt?", "What's allowed?"), tr("Erzähl einen Witz!", "Tell me a joke!")];

  const norm = s => " " + s.toLowerCase().replace(/[!?.,;:"“”„()]/g, " ").replace(/\s+/g, " ") + " ";
  function answer(q) {
    const why = typeof KloFilter !== "undefined" && KloFilter.reason ? KloFilter.reason(q, true) : null;
    if (why === "sorge") return { a: FAQ.find(f => f.k.includes("traurig")).a(), go: window.kloNotfall ? [tr("🚑 Notfall-Hilfe", "🚑 Emergency help"), sos] : null };
    if (why === "kontakt") return { a: tr("Ich bin ein Roboter. Ich frage niemanden nach Alter, Wohnort oder Nummer, und das solltest du auch niemandem im Internet verraten. 🛡️", "I'm a robot. I never ask anyone for their age, address or number, and you shouldn't share those online either. 🛡️") };
    if (why) return { a: tr("Darüber rede ich nicht. 🙊 Frag mich lieber was zur Wand!", "I don't talk about that. 🙊 Ask me something about the wall instead!") };
    const n = norm(q);
    let best = null, score = 0;
    for (const f of FAQ) {
      const s = f.k.reduce((sum, k) => sum + (n.includes(k) ? k.length : 0), 0);
      if (s > score) { score = s; best = f; }
    }
    if (!best) return { a: tr("Hmm, das weiß ich leider nicht. 🤔 Ich kenne mich nur mit der Wand aus. Probier eine der Fragen unten!", "Hmm, I don't know that one. 🤔 I only know about the wall. Try one of the questions below!"), chips: true };
    const go = typeof best.go === "function" ? best.go() : best.go;
    return { a: best.a(), go };
  }

  /* ---------- Aussehen ---------- */
  const css = document.createElement("style");
  css.textContent = `
  .hf-btn{position:fixed;right:12px;bottom:120px;z-index:29;width:68px;height:68px;border-radius:50%;border:3px solid ${C.accent};background:${FAM ? "#fff" : "#1d2630"};
    padding:6px 4px 2px;box-shadow:0 8px 24px rgba(0,0,0,.35);cursor:pointer;animation:hfBob 3s ease-in-out infinite;-webkit-tap-highlight-color:transparent}
  .hf-btn svg{width:100%;height:100%;display:block}
  .hf-tip{position:fixed;right:88px;z-index:29;background:#fff;color:#1d2321;font:700 15px/1.25 system-ui,sans-serif;padding:10px 14px;border-radius:16px 16px 4px 16px;
    box-shadow:0 6px 18px rgba(0,0,0,.25);max-width:190px;animation:hfPop .35s ease-out}
  @keyframes hfBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
  @keyframes hfPop{from{transform:scale(.6);opacity:0}to{transform:scale(1);opacity:1}}
  .hf-ov{position:fixed;inset:0;z-index:48;background:rgba(20,24,22,.55);display:flex;align-items:flex-end;justify-content:center}
  .hf-box{width:100%;max-width:480px;height:min(78vh,640px);background:${FAM ? "#fbf7f1" : "#161c20"};color:${FAM ? "#1f2a2e" : "#f4efe6"};border-radius:24px 24px 0 0;
    display:flex;flex-direction:column;font:16px/1.4 system-ui,sans-serif;box-shadow:0 -10px 40px rgba(0,0,0,.4);animation:hfUp .25s ease-out;padding-bottom:env(safe-area-inset-bottom,0px)}
  @keyframes hfUp{from{transform:translateY(40px);opacity:0}to{transform:none;opacity:1}}
  .hf-head{display:flex;align-items:center;gap:12px;padding:14px 16px;border-bottom:1px solid ${FAM ? "#eadfd2" : "#2a343b"}}
  .hf-head .av{width:54px;height:46px;flex:none}.hf-head .av svg{width:100%;height:100%}
  .hf-head b{font-size:19px;display:block}.hf-head small{opacity:.7;font-size:13px}
  .hf-x{margin-left:auto;width:44px;height:44px;border-radius:50%;border:none;background:${FAM ? "#efe6da" : "#26313a"};color:inherit;font-size:22px;cursor:pointer}
  .hf-log{flex:1;overflow-y:auto;padding:14px 14px 4px;display:flex;flex-direction:column;gap:10px;overscroll-behavior:contain}
  .hf-m{max-width:86%;padding:11px 14px;border-radius:18px;white-space:pre-wrap;overflow-wrap:anywhere}
  .hf-m.bot{align-self:flex-start;background:${FAM ? "#fff" : "#232d34"};border:1px solid ${FAM ? "#eadfd2" : "#2f3b44"};border-bottom-left-radius:6px}
  .hf-m.me{align-self:flex-end;background:${C.accent};color:${FAM ? "#fff" : "#161c20"};font-weight:600;border-bottom-right-radius:6px}
  .hf-act{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px}
  .hf-act button{font:700 14px system-ui;border-radius:999px;padding:9px 14px;min-height:40px;border:2px solid ${C.accent};background:transparent;color:inherit;cursor:pointer}
  .hf-act button.go{background:${C.accent};color:${FAM ? "#fff" : "#161c20"}}
  .hf-chips{display:flex;gap:8px;overflow-x:auto;padding:8px 14px;scrollbar-width:none}
  .hf-chips button{flex:none;font:600 14px system-ui;border-radius:999px;padding:9px 14px;min-height:40px;border:1px solid ${FAM ? "#e0d4c6" : "#34414b"};background:${FAM ? "#fff" : "#1f282e"};color:inherit;cursor:pointer}
  .hf-in{display:flex;gap:8px;padding:8px 14px 14px}
  .hf-in input{flex:1;min-width:0;font:16px system-ui;padding:12px 14px;border-radius:999px;border:2px solid ${FAM ? "#e0d4c6" : "#34414b"};background:${FAM ? "#fff" : "#0f1417"};color:inherit}
  .hf-in button{width:50px;height:50px;border-radius:50%;border:none;background:${C.accent};color:${FAM ? "#fff" : "#161c20"};font-size:22px;cursor:pointer}
  .hf-talk .hf-mouth{animation:hfTalk .22s ease-in-out infinite alternate;transform-origin:220px 256px}
  @keyframes hfTalk{from{transform:scaleY(.4)}to{transform:scaleY(1.3)}}
  .hf-blink .hf-eyes{animation:hfBlink 4s infinite;transform-origin:220px 196px}
  @keyframes hfBlink{0%,94%,100%{transform:scaleY(1)}96%{transform:scaleY(.1)}}
  @media (prefers-reduced-motion:reduce){.hf-btn,.hf-talk .hf-mouth,.hf-blink .hf-eyes{animation:none}}`;
  document.head.appendChild(css);

  const btn = document.createElement("button");
  btn.type = "button"; btn.className = "hf-btn hf-blink"; btn.id = "hfOpen";
  btn.setAttribute("aria-label", tr(`${NAME} fragen – Hilfe`, `Ask ${NAME} – help`));
  btn.innerHTML = head("hfa");
  document.body.appendChild(btn);

  // Immer knapp über der Schreib-Leiste schweben
  const bar = document.getElementById("composer");
  let tip = null;
  function place() {
    const h = bar && !bar.hidden ? bar.getBoundingClientRect().height : 0;
    btn.style.bottom = (h + 12) + "px";
    if (tip) tip.style.bottom = (h + 40) + "px";
  }
  place(); window.addEventListener("resize", place);
  if (bar && "ResizeObserver" in window) new ResizeObserver(place).observe(bar);

  // Einmal am Tag kurz winken
  try {
    const day = new Date().toDateString();
    if (localStorage.getItem("klowand-helfer-tip") !== day) {
      setTimeout(() => {
        tip = document.createElement("div"); tip.className = "hf-tip";
        tip.textContent = tr(`Hi, ich bin ${NAME}! Frag mich was 👋`, `Hi, I'm ${NAME}! Ask me anything 👋`);
        document.body.appendChild(tip); place();
        tip.onclick = () => open();
        setTimeout(() => { if (tip) { tip.remove(); tip = null; } }, 6000);
      }, 4000);
      localStorage.setItem("klowand-helfer-tip", day);
    }
  } catch (e) {}

  /* ---------- Chat ---------- */
  let ov = null;
  function speak(text) {
    if (!("speechSynthesis" in window)) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text.replace(/[\u{1F300}-\u{1FAFF}☀-➿]/gu, ""));
    u.lang = tr("de-DE", "en-US", "ja-JP"); u.rate = .95; u.pitch = FAM ? 1.25 : 1.05;
    const av = ov && ov.querySelector(".av");
    u.onstart = () => av && av.classList.add("hf-talk");
    u.onend = u.onerror = () => av && av.classList.remove("hf-talk");
    speechSynthesis.speak(u);
  }
  function add(who, text, go) {
    const log = ov.querySelector(".hf-log");
    const m = document.createElement("div"); m.className = "hf-m " + who; m.textContent = text;
    if (who === "bot") {
      const act = document.createElement("div"); act.className = "hf-act";
      if (go) { const g = document.createElement("button"); g.type = "button"; g.className = "go"; g.textContent = go[0]; g.onclick = go[1]; act.appendChild(g); }
      const s = document.createElement("button"); s.type = "button"; s.textContent = "🔊 " + tr("Vorlesen", "Read aloud", "読み上げ"); s.onclick = () => speak(text); act.appendChild(s);
      m.appendChild(act);
    }
    log.appendChild(m); log.scrollTop = log.scrollHeight;
  }
  function ask(q) {
    q = (q || "").trim().slice(0, 140); if (!q) return;
    add("me", q);
    const r = answer(q);
    const av = ov.querySelector(".av"); av.classList.add("hf-talk");
    setTimeout(() => { av.classList.remove("hf-talk"); add("bot", r.a, r.go); }, 450);
  }
  function close() { if (ov) { ov.remove(); ov = null; } if ("speechSynthesis" in window) speechSynthesis.cancel(); btn.hidden = false; }
  function open() {
    if (tip) { tip.remove(); tip = null; }
    if (ov) return;
    ov = document.createElement("div"); ov.className = "hf-ov";
    ov.innerHTML = `<div class="hf-box" role="dialog" aria-modal="true" aria-label="${NAME}">
      <div class="hf-head"><div class="av hf-blink">${head("hfb")}</div><div><b>${NAME}</b><small>${tr("Dein Wand-Helfer · fragt nichts, speichert nichts", "Your wall helper · asks nothing, stores nothing")}</small></div>
      <button type="button" class="hf-x" aria-label="${tr("Schließen", "Close")}">✕</button></div>
      <div class="hf-log" aria-live="polite"></div>
      <div class="hf-chips">${CHIPS.map(c => `<button type="button">${c.replace(/</g, "&lt;")}</button>`).join("")}</div>
      <form class="hf-in"><input maxlength="140" placeholder="${tr("Frag mich was …", "Ask me something …")}" aria-label="${tr("Deine Frage", "Your question")}"><button type="submit" aria-label="${tr("Fragen", "Ask")}">➤</button></form></div>`;
    document.body.appendChild(ov); btn.hidden = true;
    ov.addEventListener("click", e => { if (e.target === ov) close(); });
    ov.querySelector(".hf-x").onclick = close;
    ov.querySelectorAll(".hf-chips button").forEach(b => b.onclick = () => ask(b.textContent));
    const f = ov.querySelector(".hf-in"), inp = f.querySelector("input");
    f.onsubmit = e => { e.preventDefault(); ask(inp.value); inp.value = ""; };
    add("bot", FAQ[0].a());
  }
  btn.onclick = open;
  document.addEventListener("keydown", e => { if (e.key === "Escape" && ov) close(); });
  window.kloHelfer = open;
})();
