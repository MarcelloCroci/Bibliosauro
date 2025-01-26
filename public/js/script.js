document.getElementById("dino").addEventListener("click", function () {
    const audio = document.getElementById("audioPlayer");
    audio.play();
});



const burger = document.getElementById('burger');
const menu = document.getElementById('menu');

burger.addEventListener('click', () => {
  menu.style.display = menu.style.display === 'flex' ? 'none' : 'flex';
});

const user = JSON.parse(localStorage.getItem("user"));

if (user) {
    console.log("Dati dell'utente autenticato:", user);
    // Cambia l'ID del bottone login in logout
    const loginButton = document.getElementById("login-button");
    if (loginButton) {
        loginButton.id = "logout-button"; // Cambia l'ID
        loginButton.textContent = "Logout"; // Cambia il testo del bottone
    }

    // Controlla il ruolo dell'utente
    if (user.ruolo === "utente") {
        console.log("L'utente è un utente standard.");

        // Nascondi i bottoni per la modifica e aggiunta
        document.querySelectorAll("#edit-submit, .add, #stats").forEach((button) => {
            button.style.display = "none";
        });
    } else if (user.ruolo === "admin") {
        console.log("L'utente è un admin. Nessuna restrizione.");
    }
} else {
    console.log("Nessun utente autenticato.");
    // Nascondi i bottoni per la modifica e aggiunta
    document.querySelectorAll("#edit-submit, .add, #prenota-submit, #pren, #stats").forEach((button) => {
        button.style.display = "none";});
}