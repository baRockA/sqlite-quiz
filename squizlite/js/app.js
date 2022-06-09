const nextBtn = document.getElementById('next');
nextBtn.addEventListener('click', nextQuestion);
const questionTxt = document.getElementById('questiontext');
const answers = document.getElementById('answers');
const scoreText = document.getElementById('score');

var db = null;
var qcount = 0;
var score = 0;
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

    qcount = db.exec("SELECT COUNT(*) FROM question;")[0].values[0][0];

    nextQuestion();
}

function nextQuestion() {
    //Neue Frage anzeigen
    let randQuestionID = Math.floor(Math.random() * qcount) + 1;
    let newQuestion = db.exec("SELECT text FROM question WHERE qid = " + randQuestionID + ";")[0].values[0][0];
    questionTxt.innerText = newQuestion;

    //Antworten für neue Frage anzeigen
    answers.innerHTML = "";
    //SQL Statement vorbereiten und ausführen
    const aStmt = db.prepare("SELECT * FROM answer WHERE qid = " + randQuestionID + ";");

    //Mit schleife die einzelnen Datensätze durchlaufen
    while (aStmt.step()) {
        //Abrufen des aktuellen Datensatzes
        let dbanswer = aStmt.get();
        //Neuen Button für Antwort erzeugen in zur Seite hinzufügen
        let newBtn = document.createElement("button");
        newBtn.id = dbanswer[0];
        newBtn.innerText = dbanswer[1];
        newBtn.addEventListener('click', answerClicked);
        answers.appendChild(newBtn);
    }

    //Speicher für Statement wieder freigeben, weil Datensätze nicht mehr gebraucht werden.
    aStmt.free();
}

function answerClicked(event) {
    //Überprüfe ob angeklickte Antwort richtig ist
    let aid = event.target.id;
    let right = db.exec("SELECT right FROM answer WHERE aid = " + aid + ";")[0].values[0][0];
    if (right == 1) {
        event.target.style.backgroundColor = "green";
        score++;
        scoreText.innerText = score;
    } else {
        event.target.style.backgroundColor = "red";
    }

}