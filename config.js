/* ================= KLO-WAND EINSTELLUNGEN =================
   Diese Datei teilen sich die Wand (index.html) und die
   Admin-Seite (admin.html).                                  */

const firebaseConfig = {
  apiKey: "AIzaSyCCMP4WrNrB-tYXs1ldH0AdmAuLbTB3SzU",
  authDomain: "klowand-4a570.firebaseapp.com",
  projectId: "klowand-4a570",
  storageBucket: "klowand-4a570.firebasestorage.app",
  messagingSenderId: "186204143946",
  appId: "1:186204143946:web:816a1b0b4f1bc312e201b3"
};

/* Deine Wände: der Teil nach ?wand= in der Adresse.
   Beispiel: flaffylu.github.io/klowand/?wand=prestigio
   Nur Kleinbuchstaben, Zahlen und Bindestriche.              */
const WAENDE = {
  "prestigio":     { name: "Prestigio",         sub: "Ristorante Italiano" },
  "goldener-hahn": { name: "Zum Goldenen Hahn", sub: "Herren · Kabine 2" },
  "zuhause":       { name: "Zuhause",           sub: "Das Familienklo" },
  "demo":          { name: "Demo-Bar",          sub: "Zum Ausprobieren" },
};

/* Wochen-Challenges: jede Kalenderwoche ist die nächste dran, danach geht es von vorne los.
   art: "text" = schreiben, "draw" = malen, "beides" = egal.                                  */
const CHALLENGES = [
  { text: "Mal den Barkeeper.", art: "draw" },
  { text: "Bester Reim auf „Klo“.", art: "text" },
  { text: "Dein schlechtester Anmachspruch.", art: "text" },
  { text: "Mal dein Lieblingsgetränk.", art: "draw" },
  { text: "Was denkt die Klopapierrolle gerade?", art: "text" },
  { text: "Mal ein Monster, das im Spülkasten wohnt.", art: "draw" },
  { text: "Beschreib deinen Abend in genau drei Wörtern.", art: "text" },
  { text: "Mal die Kabine, wenn sie ein Haustier wäre.", art: "draw" },
  { text: "Erfinde einen neuen Cocktail und gib ihm einen Namen.", art: "text" },
  { text: "Klo-Weisheit des Tages.", art: "beides" },
  { text: "Mal dich als Superheld.", art: "draw" },
  { text: "Was würdest du der Kloschüssel gern mal sagen?", art: "text" },
];

/* Musik zum Umschalten. src: null = der Lo-Fi-Beat, der im Browser entsteht.
   Eigene Lieder als MP3 in den Ordner „musik“ legen und hier eintragen. */
const MUSIK = [
  { name: "Lo-Fi", src: null },
  { name: "Ruhig", src: "musik/ruhig.mp3" },
];

/* Angaben für Impressum und Datenschutz. Leer = Platzhalter in eckigen Klammern. */
const IMPRESSUM = { name: "Kay Trautner", strasse: "", ort: "Leipzig", email: "kaytrut426@gmail.com", telefon: "" };

/* Hintergrundbild der Wand. Leer ("") = klassische grüne Kabinentür. */
const HINTERGRUND = "bilder/wasser.jpg";

/* Kontakt für die Infoseite (wirte.html). Leer lassen = Kontaktbereich ausblenden. */
const KONTAKT = { email: "kaytrut426@gmail.com", telefon: "" };
