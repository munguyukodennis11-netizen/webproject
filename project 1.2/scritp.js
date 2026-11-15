let players = JSON.parse(localStorage.getItem("gamingPlayers")) || [];
let tournaments = JSON.parse(localStorage.getItem("gamingTournaments")) || [];

let activeTournament = null;

// Save tournament data
function saveData() {
    localStorage.setItem("gamingPlayers", JSON.stringify(players));
    localStorage.setItem("gamingTournaments", JSON.stringify(tournaments));
}

// Create tournament section
const tournamentArea = document.createElement("section");

tournamentArea.innerHTML = `
    <h2>Create New Tournament</h2>

    <input type="text" id="tournamentName"
        placeholder="Enter tournament name">

    <select id="gameType">
        <option value="eFootball">eFootball</option>
        <option value="FIFA">FIFA</option>
        <option value="PUBG">PUBG</option>
        <option value="Call of Duty">Call of Duty</option>
    </select>

    <button id="createTournament">Create Tournament</button>

    <h2>Tournament Members</h2>
    <p id="memberCount">Members: 0</p>
    <ul id="tournamentMembers"></ul>

    <button id="startTournament">Start Tournament</button>

    <h2>Tournament Matches</h2>
    <div id="matches"></div>

    <h2>Leaderboard</h2>
    <div id="leaderboard"></div>
`;

document.querySelector(".container").appendChild(tournamentArea);

// Create a new tournament
document.getElementById("createTournament").addEventListener("click", function () {

    const name = document.getElementById("tournamentName").value.trim();
    const game = document.getElementById("gameType").value;

    if (name === "") {
        alert("Please enter tournament name");
        return;
    }

    activeTournament = {
        id: Date.now(),
        name: name,
        game: game,
        status: "Registration Open",
        members: [],
        matches: []
    };

    tournaments.push(activeTournament);

    saveData();

    showTournament();

    alert("Tournament created successfully!");
});

// Register members manually
document.getElementById("registrationForm").addEventListener("submit", function (event) {

    event.preventDefault();

    if (!activeTournament) {
        alert("Please create a tournament first");
        return;
    }

    if (activeTournament.status !== "Registration Open") {
        alert("Registration is closed");
        return;
    }

    const fullname = document.getElementById("fullname").value.trim();
    const username = document.getElementById("username").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const team = document.getElementById("team").value.trim();

    if (!fullname || !username || !phone || !team) {
        alert("Please fill in all fields");
        return;
    }

    const exists = activeTournament.members.some(
        player => player.username.toLowerCase() === username.toLowerCase()
    );

    if (exists) {
        alert("This member is already registered!");
        return;
    }

    const member = {
        id: Date.now(),
        fullname: fullname,
        username: username,
        phone: phone,
        team: team
    };

    activeTournament.members.push(member);
    players.push(member);

    saveData();

    this.reset();

    showTournament();
    displayPlayers();

    alert("Member registered successfully!");
});

// Display tournament information
function showTournament() {

    if (!activeTournament) return;

    document.getElementById("tournamentMembers").innerHTML = "";

    activeTournament.members.forEach(member => {

        const li = document.createElement("li");

        li.textContent = member.fullname + " - " + member.username;

        document.getElementById("tournamentMembers").appendChild(li);

    });

    document.getElementById("memberCount").textContent =
        "Members: " + activeTournament.members.length;
}

// Start tournament
document.getElementById("startTournament").addEventListener("click", function () {

    if (!activeTournament) {
        alert("Create a tournament first");
        return;
    }

    if (activeTournament.members.length < 2) {
        alert("Register at least two members");
        return;
    }

    if (activeTournament.status !== "Registration Open") {
        alert("Tournament has already started");
        return;
    }

    activeTournament.status = "Ongoing";

    generateMatches();

    saveData();

    showMatches();

    alert("Tournament started successfully!");
});

// Generate league matches
function generateMatches() {

    const members = activeTournament.members;

    activeTournament.matches = [];

    for (let i = 0; i < members.length; i++) {

        for (let j = i + 1; j < members.length; j++) {

            activeTournament.matches.push({
                player1: members[i].fullname,
                player2: members[j].fullname,
                score1: null,
                score2: null,
                completed: false
            });

        }

    }

}

// Display matches
function showMatches() {

    const matchArea = document.getElementById("matches");

    matchArea.innerHTML = "";

    activeTournament.matches.forEach((match, index) => {

        const div = document.createElement("div");

        div.innerHTML = `
            <h4>${match.player1} vs ${match.player2}</h4>

            <input type="number" id="score1${index}"
                placeholder="Score 1" min="0">

            <input type="number" id="score2${index}"
                placeholder="Score 2" min="0">

            <button onclick="saveResult(${index})">
                Save Result
            </button>

            <p>
                ${match.completed
                    ? "Result: " + match.score1 + " - " + match.score2
                    : "Not played"}
            </p>
        `;

        matchArea.appendChild(div);

    });

}

// Save match results
function saveResult(index) {

    const score1 = document.getElementById("score1" + index).value;
    const score2 = document.getElementById("score2" + index).value;

    if (score1 === "" || score2 === "" ||
        Number(score1) < 0 || Number(score2) < 0) {

        alert("Enter valid scores");
        return;
    }

    const match = activeTournament.matches[index];

    if (match.completed) {
        alert("This match already has a result");
        return;
    }

    match.score1 = Number(score1);
    match.score2 = Number(score2);
    match.completed = true;

    saveData();

    showMatches();
    showLeaderboard();
}

// Calculate leaderboard
function showLeaderboard() {

    const table = {};

    activeTournament.members.forEach(member => {

        table[member.fullname] = {
            played: 0,
            points: 0
        };

    });

    activeTournament.matches.forEach(match => {

        if (match.completed) {

            table[match.player1].played++;
            table[match.player2].played++;

            if (match.score1 > match.score2) {
                table[match.player1].points += 3;
            }

            else if (match.score1 < match.score2) {
                table[match.player2].points += 3;
            }

            else {
                table[match.player1].points++;
                table[match.player2].points++;
            }

        }

    });

    const sorted = Object.entries(table).sort(
        (a, b) => b[1].points - a[1].points
    );

    document.getElementById("leaderboard").innerHTML =
        sorted.map((item, index) => `
            <p>
                ${index + 1}. ${item[0]}
                | Played: ${item[1].played}
                | Points: ${item[1].points}
            </p>
        `).join("");
}

// Display registered players
function displayPlayers() {

    const table = document.getElementById("playerTable");

    if (!table) return;

    table.innerHTML = "";

    players.forEach(player => {

        const row = table.insertRow();

        row.insertCell(0).textContent = player.fullname;
        row.insertCell(1).textContent = player.username;
        row.insertCell(2).textContent = player.phone;
        row.insertCell(3).textContent = player.team;

    });

    const total = document.getElementById("totalPlayers");

    if (total) {
        total.textContent = players.length;
    }

}

// Restore existing tournament
function restoreTournament() {

    const saved = tournaments.findLast(
        tournament =>
            tournament.status === "Registration Open" ||
            tournament.status === "Ongoing"
    );

    if (saved) {
        activeTournament = saved;

        showTournament();

        if (activeTournament.status === "Ongoing") {
            showMatches();
            showLeaderboard();
        }
    }

    displayPlayers();

}

restoreTournament();