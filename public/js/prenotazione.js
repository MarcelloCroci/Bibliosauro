
const limit = 10;
let currentPageAttive = 1;
let currentPagePrecedenti = 1;

function renderPagination(total, currentPage, onPageChange) {
    const totalPages = Math.ceil(total / limit);
    const paginationContainer = $('<div class="pagination"></div>');

    for (let i = 1; i <= totalPages; i++) {
        const pageButton = $(`<button>${i}</button>`);
        if (i === currentPage) {
            pageButton.attr('disabled', true);
        }
        pageButton.click(() => onPageChange(i));
        paginationContainer.append(pageButton);
    }

    return paginationContainer;
}

function loadPrenotazioniAttive(page) {
    $.get(`/api/prenotazioni/attive/:${id_utente}?page=${page}&limit=${limit}`, function (data) {
        const idUtente=JSON.parse(localStorage.getItem("id_utente"));
        const attiveTable = $('#prenotazioniAttive tbody');
        attiveTable.empty();

        data.rows.forEach(row => {
            attiveTable.append(`
                <tr>
                    <td>${row.id_prestito}</td>
                    <td>${row.libro}</td>
                    <td>${row.data_inizio.slice(0, 10).split('-').reverse().join('/')}</td>
                    <td>${row.data_scadenza.slice(0, 10).split('-').reverse().join('/')}</td>
                </tr>
            `);
        });

        $('#attivePagination').empty().append(
            renderPagination(data.total, page, (newPage) => {
                currentPageAttive = newPage;
                loadPrenotazioniAttive(newPage);
            })
        );
    });
}

function loadPrenotazioniPrecedenti(page) {
    $.get(`/api/prenotazioni/precedenti?page=${page}&limit=${limit}`, function (data) {
        const precedentiTable = $('#prenotazioniPrecedenti tbody');
        precedentiTable.empty();

        data.rows.forEach(row => {
            precedentiTable.append(`
                <tr>
                    <td>${row.id_prestito}</td>
                    <td>${row.libro}</td>
                    <td>${row.data_inizio.slice(0, 10).split('-').reverse().join('/')}</td>
                    <td>${row.data_conclusione.slice(0, 10).split('-').reverse().join('/')}</td>
                </tr>
            `);
        });

        $('#precedentiPagination').empty().append(
            renderPagination(data.total, page, (newPage) => {
                currentPagePrecedenti = newPage;
                loadPrenotazioniPrecedenti(newPage);
            })
        );
    });
}

$(document).ready(function () {
    loadPrenotazioniAttive(currentPageAttive);
    loadPrenotazioniPrecedenti(currentPagePrecedenti);
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
    } else if (user.ruolo === "admin") {
        console.log("L'utente è un admin. Nessuna restrizione.");
    }
} else {
    console.log("Nessun utente autenticato.");
}