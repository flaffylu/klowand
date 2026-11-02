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
  ];
  // Kurze Wörter: nur als ganzes Wort, damit „Kanal“, „Titel“ oder „Minute“ nicht hängen bleiben
  const WORDS = ["sex", "anal", "cum", "tits", "titte", "boobs", "cock", "schwanz", "arsch", "fik", "milf", "nude", "geil", "geile", "geiler",
    "bumsen", "dick", "nutte", "nutten", "moese", "mose", "nigger", "nigga", "niger", "titten"];
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
  function bad(text) {
    const tries = /[*#_]/.test(text) ? ["a", "e", "i", "o", "u", ""].map(v => text.replace(/[*#_]/g, v)) : [text];
    return tries.some(t => check(norm(t, true)) || check(norm(t, false)));
  }
  return { bad, norm };
})();
