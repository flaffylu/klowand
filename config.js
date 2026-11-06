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

/* Deine eigenen, festen Wände. Gekaufte Wände kommen automatisch über „Meine Wand“ dazu.
   WICHTIG: Fügst du hier eine Wand hinzu, muss ihr Name auch in firestore.rules
   bei fixedWall(...) stehen, sonst kann dort niemand schreiben.
   Der Teil nach ?wand= in der Adresse.
   Beispiel: flaffylu.github.io/klowand/?wand=prestigio
   Nur Kleinbuchstaben, Zahlen und Bindestriche.              */
const WAENDE = {
  "prestigio":     { name: "Prestigio",         sub: "Ristorante Italiano" },
  "goldener-hahn": { name: "Zum Goldenen Hahn", sub: "Herren · Kabine 2", subEn: "Men · Stall 2", subJa: "男性用・個室2" },
  "zuhause":       { name: "Zuhause",           sub: "Familien-Planner", subEn: "Family Planner", subJa: "ファミリープランナー" },
  "demo":          { name: "Demo-Bar",          sub: "Zum Ausprobieren", subEn: "Try it out", subJa: "お試し用" },
};

/* Wochen-Challenges: jede Kalenderwoche ist die nächste dran, danach geht es von vorne los.
   art: "text" = schreiben, "draw" = malen, "beides" = egal. en = englischer, ja = japanischer Text.                                  */
const CHALLENGES = [
  { text: "Mal den Barkeeper.", en: "Draw the bartender.", ja: "店員さんを描こう。", art: "draw" },
  { text: "Bester Reim auf „Klo“.", en: "Best rhyme with “loo”.", ja: "トイレにまつわる一番面白いダジャレ。", art: "text" },
  { text: "Dein schlechtester Anmachspruch.", en: "Your worst pickup line.", ja: "あなたの最悪の口説き文句。", art: "text" },
  { text: "Mal dein Lieblingsgetränk.", en: "Draw your favourite drink.", ja: "好きな飲み物を描こう。", art: "draw" },
  { text: "Was denkt die Klopapierrolle gerade?", en: "What is the toilet roll thinking right now?", ja: "トイレットペーパーは今、何を考えている？", art: "text" },
  { text: "Mal ein Monster, das im Spülkasten wohnt.", en: "Draw a monster that lives in the cistern.", ja: "タンクに住んでいる怪物を描こう。", art: "draw" },
  { text: "Beschreib deinen Abend in genau drei Wörtern.", en: "Describe your night in exactly three words.", ja: "今夜をちょうど3語で表すと？", art: "text" },
  { text: "Mal die Kabine, wenn sie ein Haustier wäre.", en: "Draw the stall as if it were a pet.", ja: "この個室がペットだったら？描いてみよう。", art: "draw" },
  { text: "Erfinde einen neuen Cocktail und gib ihm einen Namen.", en: "Invent a new cocktail and give it a name.", ja: "新しいカクテルを考えて名前をつけよう。", art: "text" },
  { text: "Klo-Weisheit des Tages.", en: "Loo wisdom of the day.", ja: "今日のトイレ格言。", art: "beides" },
  { text: "Mal dich als Superheld.", en: "Draw yourself as a superhero.", ja: "スーパーヒーローの自分を描こう。", art: "draw" },
  { text: "Was würdest du der Kloschüssel gern mal sagen?", en: "What would you like to tell the toilet bowl?", ja: "便器にひとこと言うなら？", art: "text" },
];

/* Challenges für Familien: auf Handys mit Familien-Code und auf der Wand „zuhause“ statt der Bar-Challenges */
const FAMILIEN_CHALLENGES = [
  { text: "Mal dein Lieblingstier.", en: "Draw your favourite animal.", ja: "好きな動物を描こう。", art: "draw" },
  { text: "Was war heute dein schönster Moment?", en: "What was your best moment today?", ja: "今日いちばん楽しかったことは？", art: "text" },
  { text: "Mal unsere Familie als Superhelden.", en: "Draw our family as superheroes.", ja: "家族をスーパーヒーローにして描こう。", art: "draw" },
  { text: "Was wollen wir am Wochenende zusammen machen?", en: "What shall we do together at the weekend?", ja: "週末みんなで何をする？", art: "text" },
  { text: "Mal dein Lieblingsessen.", en: "Draw your favourite food.", ja: "好きな食べ物を描こう。", art: "draw" },
  { text: "Erzähl einen Witz, der alle zum Lachen bringt.", en: "Tell a joke that makes everyone laugh.", ja: "みんなが笑うジョークを書こう。", art: "text" },
  { text: "Mal, wie du in 20 Jahren aussiehst.", en: "Draw what you'll look like in 20 years.", ja: "20年後の自分を描こう。", art: "draw" },
  { text: "Wofür bist du heute dankbar?", en: "What are you thankful for today?", ja: "今日感謝したいことは？", art: "text" },
  { text: "Mal ein Fantasietier, das es noch nicht gibt.", en: "Draw a fantasy animal that doesn't exist yet.", ja: "まだいない空想の動物を描こう。", art: "draw" },
  { text: "Sag jemandem aus der Familie etwas Nettes.", en: "Say something nice to someone in the family.", ja: "家族の誰かにやさしいひとことを。", art: "text" },
  { text: "Mal unser Haus, wenn es ein Schloss wäre.", en: "Draw our home as if it were a castle.", ja: "おうちがお城だったら？描いてみよう。", art: "draw" },
  { text: "Was wünschst du dir für die nächste Woche?", en: "What do you wish for next week?", ja: "来週のねがいごとは？", art: "beides" },
];

/* Musik zum Umschalten. src: null = der Lo-Fi-Beat, der im Browser entsteht.
   Eigene Lieder als MP3 in den Ordner „musik“ legen und hier eintragen. */
const MUSIK = [
  { name: "Lo-Fi", src: null },
  { name: "Ruhig", src: "musik/ruhig.mp3" },
];

/* Angaben für Impressum und Datenschutz. Leer = Platzhalter in eckigen Klammern. */
const IMPRESSUM = { name: "Kay Trautner", strasse: "Rathenaustr. 1", ort: "04179 Leipzig", email: "kaytrut426@gmail.com", telefon: "" };

/* Hintergrundbild der Wand. Leer ("") = klassische grüne Kabinentür.
   "bilder/hell.jpg" = helle Pastell-Steine, "bilder/wasser.jpg" = dunkles Wasser über Steinen.
   HINTERGRUND_HELL = true, wenn das Bild hell ist (dann wird die Schrift daneben dunkel). */
const HINTERGRUND = "bilder/kay-igel.jpg";
const HINTERGRUND_HELL = true;

/* Kontakt für die Infoseite (wirte.html). Leer lassen = Kontaktbereich ausblenden. */
/* Jeder Code reicht für 2 Wände. Für 2 weitere Wände kauft man ein Update (4,99 €) bei Payhip.
   Sobald es bei Payhip ein eigenes Update-Produkt gibt, hier dessen Link eintragen. */
const UPDATE_LINK = "https://payhip.com/Pikumio";
const WAENDE_PRO_CODE = 2;
const KONTAKT = { email: "kaytrut426@gmail.com", telefon: "" };
