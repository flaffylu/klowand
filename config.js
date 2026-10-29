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

/* Kontakt für die Infoseite (wirte.html). Leer lassen = Kontaktbereich ausblenden. */
const KONTAKT = { email: "", telefon: "" };
