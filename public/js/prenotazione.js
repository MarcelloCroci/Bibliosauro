
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
    const id_utente = user?.id_utente; // Verifica che l'utente sia autenticato
    if (!id_utente) {
        console.error("ID utente non trovato. L'utente potrebbe non essere autenticato.");
        return;
    }

    $.ajax({
        url: `/api/prenotazioni/attive/${id_utente}`,
        method: "GET",
        data: { page, limit }, // Parametri query
        success: function (data) {
            const attiveTable = $('#prenotazioniAttive tbody');
            attiveTable.empty();

            // Se non ci sono prenotazioni attive
            if (!data.rows || data.rows.length === 0) {
                $('#prenotazioniAttive').html('<p class="no-data">Nessuna prenotazione attiva trovata.</p>');
                $('#attivePagination').empty(); // Rimuove la paginazione
                return;
            }

            // Popola la tabella con i dati ricevuti
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
        },
        error: function (xhr, status, error) {
            console.error("Errore durante il caricamento delle prenotazioni attive:", error);
            const attiveTable = $('#prenotazioniAttive tbody');
            attiveTable.empty();
            attiveTable.append('<tr><td colspan="5">Errore durante il caricamento delle prenotazioni attive.</td></tr>');
        }
    });
}



function loadPrenotazioniPrecedenti(page) {
    const id_utente = user?.id_utente; // Verifica che l'utente sia autenticato
    if (!id_utente) {
        console.error("ID utente non trovato. L'utente potrebbe non essere autenticato.");
        return;
    }

    $.ajax({
        url: `/api/prenotazioni/precedenti/${id_utente}`,
        method: "GET",
        data: { page, limit }, // Parametri query
        success: function (data) {
            const attiveTable = $('#prenotazioniPrecedenti tbody');
            attiveTable.empty();
            
            if (!data.rows || data.rows.length === 0) {
                $('#prenotazioniPrecedenti').html('<p class="no-data">Nessuna prenotazione precedente trovata.</p>');
                $('#precedentiPagination').empty(); // Rimuove la paginazione se non ci sono risultati
                return;
            }
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
        },
        error: function (xhr, status, error) {
            console.error("Errore durante il caricamento delle prenotazioni attive:", error);
        }
    });
}



$(document).ready(function () {
    loadPrenotazioniAttive(currentPageAttive);
    loadPrenotazioniPrecedenti(currentPagePrecedenti);
});
