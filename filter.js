/* Klo-Wand: Wortfilter für Sprüche, Antworten und Ranglisten-Namen.
   Erkennt auch Tricks wie „f1ck“, „f i c k“, „fiiick“ und „Fötze/Foetze“.
   Eigene Wörter einfach in die Listen unten schreiben, kleingeschrieben.
   Hinweis: Die Datenbank-Regeln in Firebase prüfen eine kürzere Liste nochmal. */
const KloFilter = (() => {
  // Wortstämme: werden überall im Text gefunden, auch mit Leerzeichen oder Punkten dazwischen
  const STEMS = [
    // Sex und Schweinkram
    "fick", "fuck", "fotze", "fotz", "wichs", "wix", "titten", "pimmel", "muschi", "sperma", "porn",
    "penis", "vagina", "hure", "schlampe", "bums", "voegeln", "orgasm", "dildo", "blowjob", "pussy",
    "nackt", "nackig", "kondom", "erektion", "masturb", "onanier", "bordell", "schwanzlutsch", "arschfick", "analsex",
    "hentai", "nudes", "leckmich", "blasmir", "lutschmein", "eierleck", "vergewaltig", "sexy", "sexuell", "geschlechtsverkehr",
    "busen", "brueste", "nippel", "schamhaar", "kitzler", "klitoris", "hoden", "steifer", "poppen", "rammeln", "notgeil",
    // Beleidigungen und Hass
    "arschloch", "missgeburt", "spast", "schwuchtel", "kanake", "neger", "nazi", "hitler", "siegheil",
    "heilhitler", "bitch", "wichser", "umbringen", "abstechen", "kinderf", "pedo", "paedo",
    // Englisch
    "cunt", "whore", "faggot", "motherf", "asshole", "dickhead", "handjob", "rimjob", "deepthroat", "jerkoff", "killyourself",
    // Japanisch
    "死ね", "しね", "殺す", "ころす", "殺せ", "ちんこ", "チンコ", "ちんぽ", "チンポ", "まんこ", "マンコ", "おっぱい", "セックス", "せっくす", "エッチしよ",
    "レイプ", "強姦", "売春", "援交", "ブス", "きもい", "キモい", "ガイジ", "池沼", "チョン", "クズ",
  ];
  // Kurze Wörter: nur als ganzes Wort, damit „Kanal“, „Titel“ oder „Minute“ nicht hängen bleiben
  const WORDS = ["sex", "anal", "cum", "tits", "titte", "boobs", "cock", "schwanz", "arsch", "fik", "milf", "nude", "geil", "geile", "geiler",
    "bumsen", "dick", "nutte", "nutten", "moese", "mose", "nigger", "nigga", "niger", "titten",
    "rape", "raped", "slut", "sluts", "twat", "wank", "wanker", "horny", "boner", "kys", "fag", "fags", "retard", "retarded", "dicks", "boob", "porno"];
  // „geil“ und „dick“ sind im Deutschen oft harmlos. Wer das zu streng findet, löscht sie oben einfach wieder.
  // Harmlose Wörter, die einen Wortstamm enthalten: werden vor der Prüfung entfernt
  const SAFE = ["fiktion", "fiktiv", "fikus", "ficus", "hoffentlich"];

  const LEET = { "0": "o", "1": "i", "!": "i", "|": "i", "3": "e", "4": "a", "@": "a", "5": "s", "$": "s", "7": "t", "€": "e" };
  function norm(t, leet = true) {
    let n = t.toLowerCase().replace(/ä/g, "a").replace(/ö/g, "o").replace(/ü/g, "u").replace(/ß/g, "ss")
      .replace(/ae/g, "a").replace(/oe/g, "o").replace(/ue/g, "u");
    n = leet ? n.replace(/[01!|3457@$€]/g, ch => LEET[ch] || ch) : n.replace(/[01!|3457@$€]/g, " ");
    return n.replace(/ph/g, "f").replace(/ck/g, "k").replace(/c(?=[aou])/g, "k")
      .replace(/([a-z])\1+/g, "$1");             // fiiiick -> fik, titten -> titen
  }
  const STEMS_N = STEMS.map(t => norm(t)), WORDS_N = WORDS.map(t => norm(t)), SAFE_N = SAFE.map(t => norm(t));

  function check(n) {
    SAFE_N.forEach(w => { n = n.split(w).join(" "); });
    const words = n.split(/[^a-z]+/).filter(Boolean);
    if (words.some(w => WORDS_N.includes(w))) return true;
    if (STEMS_N.some(s => n.includes(s))) return true;
    // Buchstaben ohne Abstand: „f.i.c.k“, „f-i-c-k“, „fi ck“
    const glued = norm(n.replace(/[^a-z]/g, ""));
    if (STEMS_N.some(s => s.length >= 4 && glued.includes(s))) return true;
    // Einzelne Buchstaben mit Abstand: „s e x“, „f i c k“
    const spaced = n.match(/(?:^|[^a-z])((?:[a-z][^a-z]+){2,}[a-z])(?=$|[^a-z])/g) || [];
    return spaced.some(m => { const g = norm(m.replace(/[^a-z]/g, "")); return WORDS_N.includes(g) || STEMS_N.some(s => g.includes(s)); });
  }
  /* ---------- Kindersicher: zusätzliche Sperren für alle öffentlichen Wände ----------
     Jede Gruppe hat STEMS (überall im Text, auch als Satzteil) und WORDS (nur als ganzes Wort). */
  const GROUPS = {
    // Kummer: wird nicht gepostet, aber das Kind bekommt Hilfe-Nummern angezeigt
    sorge: {
      STEMS: ["selbstmord", "suizid", "mich umbringen", "mich töten", "will sterben", "will nicht mehr leben", "nicht mehr leben",
        "missbrauch", "fasst mich an", "fasst mich immer an", "schlägt mich", "schlagen mich", "haut mich", "ich ritze", "mich ritzen",
        "kill myself", "suicide", "self harm", "selfharm", "want to die", "abused", "abuse", "hurts me"],
      WORDS: ["ritzen", "ritze", "kys"],
    },
    // Schutz vor Fremden: keine Kontaktdaten, Treffen, Fotos oder Geheimnisse
    kontakt: {
      STEMS: ["snapchat", "instagram", "whatsapp", "telegram", "discord", "handynummer", "telefonnummer", "meine nummer", "deine nummer",
        "ruf mich an", "ruf an unter", "schreib mir privat", "privat schreiben", "privatchat", "adde mich", "add mich", "folg mir", "folgt mir",
        "wo wohnst du", "wohnst du", "wie alt bist du", "wie alt seid ihr", "bist du allein", "alleine zuhause", "allein zuhause",
        "schick mir ein", "schickt mir ein", "schick mir bild", "schick mir foto", "schick mir pic", "schick mir deine", "schick mal ein", "schick ein bild", "schick ein foto", "foto von dir", "bild von dir", "fotos von dir", "zeig dich",
        "webcam", "videochat", "treffen wir uns", "lass uns treffen", "lass uns mal treffen", "wollen wir uns treffen", "komm vorbei", "hol dich ab",
        "unser geheimnis", "sag es niemandem", "sags niemandem", "nicht deinen eltern", "sag nichts deinen", "erzähl es keinem",
        "how old are you", "where do you live", "send pic", "send me", "dm me", "snap me", "add me", "follow me", "meet up", "lets meet", "our secret",
        "dont tell your", "are you alone", "home alone"],
      WORDS: ["snap", "insta", "ig", "tiktok", "dm", "pn", "kik", "adresse"],
    },
    // Keine Politik an der Wand
    politik: {
      STEMS: ["politik", "bundestag", "bundesregierung", "wahlkampf", "bundestagswahl", "landtagswahl", "kanzler", "partei", "flüchtling",
        "migrant", "remigration", "asylant", "ausländer raus", "volksverräter", "lügenpresse", "reichsbürger", "linksgrün", "faschist",
        "kommunist", "zionist", "die grünen", "die linke", "bündnis 90", "sieg heil", "wagenknecht", "selenskyj", "selensky", "zelensky",
        "netanjahu", "netanyahu", "weltkrieg", "im krieg", "der krieg", "krieg in", "kriegsverbrech", "geh wählen", "wahlplakat", "erdogan", "chrupalla", "baerbock", "election", "democrat", "republican", "make america"],
      WORDS: ["afd", "cdu", "csu", "spd", "fdp", "bsw", "npd", "nsdap", "mlpd", "merz", "scholz", "habeck", "weidel", "söder", "lindner",
        "höcke", "putin", "trump", "biden", "harris", "kickl", "orban", "regierung", "minister",
        "antifa", "hamas", "gaza", "maga"],
    },
    // Gewalt und Drogen
    gewalt: {
      STEMS: ["erschieß", "erschiess", "abknallen", "erstechen", "erstech", "amoklauf", "terror", "kokain", "heroin", "crystal meth",
        "kiffen", "drogen", "ecstasy", "mdma", "school shoot", "shoot you", "kill you", "töte dich", "bring dich um", "stech dich ab"],
      WORDS: ["amok", "bombe", "koks", "meth", "weed", "joint", "kiffe", "kifft", "kiffer", "gekifft", "lsd", "xtc", "pep", "speed", "gun", "waffe", "knarre"],
    },
  };
  const G = Object.fromEntries(Object.entries(GROUPS).map(([k, g]) => [k, { S: g.STEMS.map(t => norm(t)), W: g.WORDS.map(t => norm(t)) }]));
  function inGroup(n, g) {
    const words = n.split(/[^a-z0-9]+/).filter(Boolean);
    if (words.some(w => g.W.includes(w))) return true;
    // gesperrte Wörter mit Abstand zwischen den Buchstaben: „t r u m p“
    const spaced = n.match(/(?:^|[^a-z0-9])((?:[a-z0-9][^a-z0-9]+){2,}[a-z0-9])(?=$|[^a-z0-9])/g) || [];
    if (spaced.some(m => g.W.includes(m.replace(/[^a-z0-9]/g, "")))) return true;
    const flat = n.replace(/[^a-z0-9]+/g, " ").trim();
    return g.S.some(s => flat.includes(s.replace(/[^a-z0-9]+/g, " ").trim()));
  }
  const variants = text => /[*#_]/.test(text) ? ["a", "e", "i", "o", "u", ""].map(v => text.replace(/[*#_]/g, v)) : [text];

  function bad(text) {
    return variants(text).some(t => check(norm(t, true)) || check(norm(t, false)));
  }
  /* Grund, warum ein Text nicht an die Wand darf: "sorge", "kontakt", "politik", "gewalt", "bad" oder null.
     strict = true auf allen öffentlichen Wänden; false nur in der privaten Familie (dort nur grobe Wörter). */
  function reason(text, strict = true) {
    if (strict) {
      const ns = variants(text).map(t => norm(t, false).replace(/[^a-z0-9]+/g, " ") + " ").concat(variants(text).map(t => " " + norm(t, true)));
      for (const k of ["sorge", "kontakt", "politik", "gewalt"]) if (ns.some(n => inGroup(n, G[k]))) return k;
    }
    return bad(text) ? "bad" : null;
  }
  return { bad, reason, norm };
})();
