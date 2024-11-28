$(document).ready(function () {
    // Carica i generi
    $.ajax({
        url: '/api/generi',
        type: 'GET',
        success: function(data) {
            // Aggiungi i generi al menu a tendina
            data.forEach(function(generi) {
                $('#generi').append(
                    `<option value="${generi.id_genere}">${generi.nome_genere}</option>`
                );
            });
        },
        error: function(error) {
            console.log('Errore nel recupero dei generi:', error);
        }
    });
    // Mostra i libri nella pagina
    function loadBooks() {
        $.get("/api/librigeneri", function (data) {
            data.forEach(function (book) {
                let bookHTML = `
                    <div class="libro" data-id="${book.id_libro}">
                        <h4>${book.titolo}</h4>
                        <img src="${book.immagine}" alt="Copertina">
                    </div>
                `;
                $('#libri-table').append(bookHTML);
            });

            // Gestisci il clic su un libro
            $(".libro").click(function () {
                let bookId = $(this).data("id_libro");
                $.get(`/api/libro/${bookId}`, function (book) {
                    // Popola il modal con le informazioni del libro
                    $('#modalTitle').text(book.titolo);
                    $('#modalImage').attr('src', book.immagine);
                    $('#modalDescription').text(book.descrizione);
                    $('#modalISBN').text(book.isbn);
                    $('#modalGenre').text(book.genere);
                    $('#modalQuantity').text(book.quantita);
                    $('#modalPopularity').text(book.popolarita);

                    // Mostra il modal
                    $('#bookModal').show();
                });
            });
        });
    }

    loadBooks();

    // Chiudi il modal quando si clicca sulla "X"
    $(".close").click(function () {
        $('#bookModal').hide();
    });

    // Chiudi il modal quando si clicca fuori dal modal
    $(window).click(function (event) {
        if (event.target === document.getElementById('bookModal')) {
            $('#bookModal').hide();
        }
    });

    // //Carica libri
    // $.ajax({
    //     url: '/api/libri', // Cambia URL se necessario
    //     method: 'GET',
    //     success: function (data) {
    //         const tableBody = $('#libri-table ');
    //         tableBody.empty(); // Assicurati che la tabella sia vuota prima di popolarla

    //         data.forEach((libro) => {
    //             const disponibile = libro.disponibile ? 'Sì' : 'No';
    //             const row = `
    //                 <div class="libro">
    //                     <h4>${libro.titolo}</h4>
    //                     <img src="${libro.immagine}" alt="${libro.titolo}">
    //                     <p>
    //                         Autore: ${libro.autore} <br>
    //                         Quantità: ${libro.quantita} <br>
    //                         Disponibile: ${disponibile}
    //                     </p>
    //                 </div>
                    
    //             `;
    //             tableBody.append(row);
    //         });
    //     },
    //     error: function (err) {
    //         console.error('Errore durante il caricamento dei libri:', err);
    //         alert('Errore durante il caricamento dei libri!');
    //     },
    // });
});
