let currentPagePrestiti = 1;
let currentPageLibri = 1;
const limit = 10;

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

function loadPrestiti(page) {
    $.get(`/api/statistiche/prestiti?page=${page}&limit=${limit}`, function (data) {
        const utentiPrestitiTable = $('#utentiPrestiti tbody');
        utentiPrestitiTable.empty();

        data.rows.forEach(row => {
            const DataPrestato = row.data_inizio.slice(0, 10).split('-').reverse().join('/');
            const DataRiconsegna = row.data_scadenza.slice(0, 10).split('-').reverse().join('/');

            utentiPrestitiTable.append(`
                <tr>
                    <td>${row.nome}</td>
                    <td>${row.cognome}</td>
                    <td>${row.ruolo}</td>
                    <td>${row.titolo || 'Nessun libro in prestito'}</td>
                    <td>${DataPrestato}</td>
                    <td>${DataRiconsegna}</td>
                    <td><button class="restituzione-btn" data-id="${row.id_prestito}">Restituisci</button></td>
                </tr>
            `);
            
        });

        $('#prestitiPagination').empty().append(
            renderPagination(data.total, page, (newPage) => {
                currentPagePrestiti = newPage;
                loadPrestiti(newPage);
            })
        );
    });
}

function loadLibri(page) {
    $.get(`/api/statistiche/libri?page=${page}&limit=${limit}`, function (data) {
        const dettagliLibriTable = $('#dettagliLibri tbody');
        dettagliLibriTable.empty();
        data.rows.forEach(row => {
            dettagliLibriTable.append(`
                <tr>
                    <td>${row.id_libro}</td>
                    <td>${row.titolo}</td>
                    <td>${row.autore}</td>
                    <td>${row.anno_pubblicazione}</td>
                    <td>${row.isbn}</td>
                    <td>${row.quantita}</td>
                    <td>${row.popolarita}</td>
                    <td>${row.disponibile ? 'Sì' : 'No'}</td>
                    <td>${row.casa_editrice}</td>
                    <td>${row.generi.join(', ')}</td>
                </tr>
            `);
        });

        $('#libriPagination').empty().append(
            renderPagination(data.total, page, (newPage) => {
                currentPageLibri = newPage;
                loadLibri(newPage);
            })
        );
    });
}

$(document).ready(function () {
    loadPrestiti(currentPagePrestiti);
    loadLibri(currentPageLibri);
});

//pressione bottone
$(document).on('click', '.restituzione-btn', function () {
    const prestitoId = $(this).data('id');

    $.ajax({
        url: `/api/restituisci/${prestitoId}`,
        method: 'PUT',
        success: function () {
            alert('Prenotazione restituita con successo!');
            loadPrestiti(currentPagePrestiti); // Ricarica la tabella
        },
        error: function (err) {
            alert('Errore durante la restituzione della prenotazione.');
            console.error(err);
        }
    });
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