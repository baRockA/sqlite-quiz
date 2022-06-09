const nextBtn = document.getElementById('next');
nextBtn.addEventListener('click', nextQuestion);
const questionTxt = document.getElementById('questiontext');
const answers = document.getElementById('answers');

var db = null;
loadDB();

async function loadDB() {
    //häufiger Fehler: Schreibweise von InitSqlJs beachten!
    const sqlPromise = initSqlJs();
    // Erklärungen zu Fetch-API und Promises: https://www.digitalocean.com/community/tutorials/how-to-use-the-javascript-fetch-api-to-get-data-de
    //häufiger Fehler: arrayBuffer() ist eine Funktion, also Klammern nicht vergessen.
    const dataPromise = fetch("/db/quiz.sqlite").then(res => res.arrayBuffer());
    //Auf Promises warten
    const [SQL, buf] = await Promise.all([sqlPromise, dataPromise]);
    //Datenbank in db speichern
    db = new SQL.Database(new Uint8Array(buf));

    startQuiz();
}

function startQuiz() {
    //SQL Statement vorbereiten und ausführen
    const qStmt = db.prepare("SELECT * FROM question;");

    //Mit schleife die einzelnen Datensätze durchlaufen
    while (qStmt.step()) {
        //Abrufen des aktuellen Datensatzes
        let dbquestion = qStmt.get();
        //Ausgabe des Datensatzes (als Array) auf Console
        console.log(dbquestion);
    }

    //Speicher für Statement wieder freigeben, weil Datensätze nicht mehr gebraucht werden.
    qStmt.free();
}