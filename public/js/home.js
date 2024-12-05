$(document).ready(function () {

    $("#ordineID, #disponibileID, #autoreID, #casa_editriceID, #generi, #cercaID").on(
        "change keyup",
        function (event) {
            loadLibri();
            

        }
    );

    // Carica i generi
    $.ajax({
        url: '/api/generi',
        type: 'GET',
        success: function(data) {
            // Aggiungi i generi al menu a tendina
            data.forEach(function(generi) {
                $(".generi").append(
                    `<option value="${generi.id_genere}">${generi.nome_genere}</option>`
                );
            });
        },
        error: function(error) {
            console.log('Errore nel recupero dei generi:', error);
        }
    });
    // Mostra i libri nella pagina
    function loadLibri() {

        const searchParams = {
            ordine: $("#ordineID").val(),
            disponibile: $("#disponibileID").prop("checked"),
            autore: $("#autoreID").val(),
            casa_editrice: $("#casa_editriceID").val(),
            generi: $("#generi").val(),
            cerca: $("#cercaID").val()
        };
        
        $.ajax({
            url: "/api/libri", // Endpoint per ottenere i libri
            method: "GET",
            data: searchParams, // Parametri della ricerca
            success: function (response) {
                // Pulisci il contenitore prima di aggiungere nuovi elementi
                $("#libri-table").empty();
        
                response.forEach((libro) => {
                    // Verifica la disponibilità
                    const disponibile = libro.disponibile ? "Disponibile" : "Non disponibile";
        
                    // Formatta i dettagli del libro in HTML
                    const libroHTML = `
                        <div class="libro" data-id="${libro.id_libro}">
                            <h4>${libro.titolo}</h4>
                            <p class="autore">Autore: ${libro.autore}</p>
                            <img src="${libro.immagine}" alt="${libro.titolo}" class="copertina">
                            <p class="disponibilita">${disponibile}</p>
                        </div>
                    `;
        
                    // Aggiungi il contenuto al contenitore
                    $("#libri-table").append(libroHTML);
                });


            },
            error: function (error) {
                console.error("Errore durante il recupero dei libri:", error);
                alert("Errore durante il caricamento dei libri!");
            }
        });
        
    }

    loadLibri();

    $(document).on("click", "#edit-submit", function () {
        const libroId = $(this).closest("#libroModal").data("libro-id"); // Ottieni l'ID del libro
        if (!libroId) return console.error("ID libro non trovato");

        // Recupera i dettagli del libro dal server e apri il modal di modifica
        $.get(`/api/libro/${libroId}`, function (libro) {
            $("#titleEditID").val(libro.titolo);
            $("#autorEditID").val(libro.autore);
            $("#editorEditID").val(libro.casa_editrice);
            $("#yearEditID").val(libro.anno_pubblicazione);
            $("#quantityEditID").val(libro.quantita);
            $("#isbnEditID").val(libro.isbn);
            $("#imageEditID").val(libro.immagine);
            $("#genreEditID").val(libro.id_genere); // Preimposta il genere
            $("#libroModalEdit").data("libro-id", libroId).show(); // Mostra il modal
            $("#libroModal").hide();
        }).fail(function () {
            console.error("Errore nel recupero del libro per la modifica.");
        });
    });

    // Gestisci il salvataggio delle modifiche
    $(document).on("click", "#save-submit", function () {
        const libroId = $("#libroModalEdit").data("libro-id");
        const libroData = {
            titolo: $("#titleEditID").val(),
            autore: $("#autorEditID").val(),
            casa_editrice: $("#editorEditID").val(),
            anno_pubblicazione: $("#yearEditID").val(),
            quantita: $("#quantityEditID").val(),
            isbn: $("#isbnEditID").val(),
            immagine: $("#imageEditID").val(),
            id_genere: $("#genreEditID").val()
        };

        // Validazione base
        if (!libroData.titolo || !libroData.autore || !libroData.casa_editrice || !libroData.anno_pubblicazione || !libroData.quantita || !libroData.isbn || !libroData.immagine || !libroData.id_genere) {
            alert("Tutti i campi sono obbligatori.");
            return;
        }

        // Invia i dati aggiornati al server
        $.ajax({
            url: `/api/libro/${libroId}`,
            method: "PUT",
            contentType: "application/json",
            data: JSON.stringify(libroData),
            success: function () {
                alert("Libro aggiornato con successo!");
                $("#libroModalEdit").hide();
                loadLibri();
            },
            error: function (error) {
                console.error("Errore durante l'aggiornamento del libro:", error);
                alert("Errore durante l'aggiornamento del libro.");
            }
        });
    });

    // Gestisci l'eliminazione del libro
    $(document).on("click", "#delete-submit", function () {
        const libroId = $("#libroModalEdit").data("libro-id");
        if (!confirm("Sei sicuro di voler eliminare questo libro?")) return;

        // Invia richiesta di eliminazione al server
        $.ajax({
            url: `/api/libro/${libroId}`,
            method: "DELETE",
            success: function () {
                alert("Libro eliminato con successo!");
                $("#libroModalEdit").hide();
                loadLibri();
            },
            error: function (error) {
                console.error("Errore durante l'eliminazione del libro:", error);
                alert("Errore durante l'eliminazione del libro.");
            }
        });
    });

    $(document).on("click", ".libro", function () {
        let libroId = $(this).data("id"); // Recupera l'ID
        console.log('ID libro cliccato:', libroId); // Logga l'ID cliccato
        if (libroId) {
            $.get(`/api/libro/${libroId}`, function (libro) {
                // Popola il modal con le informazioni del libro
                $('#modalTitle').text(libro.titolo);
                $('#modalAutor').text(libro.autore);
                $('#modalEditor').text(libro.casa_editrice);
                $('#modalImage').attr('src', libro.immagine);
                $('#modalISBN').text(libro.isbn);
                $('#modalGenre').text(libro.nome_genere);
                $('#modalQuantity').text(libro.quantita);
                $('#modalPopularity').text(libro.popolarita);
                $('#libroModal').data("libro-id", libro.id_libro).show();
            }).fail(function () {
                console.error('Errore nel recupero del libro.');
            });
        } else {
            console.error('ID libro non definito.');
        }
    });
    
        // Aggiungi evento click al pulsante "Aggiungi"
        $("#add-submit").click(function () {
            const libroData = {
                titolo: $("#titleID").val(),
                autore: $("#autorID").val(),
                casa_editrice: $("#editorID").val(),
                anno_pubblicazione: $("#yearID").val(),
                quantita: $("#quantityID").val(),
                isbn: $("#isbnID").val(),
                immagine: $("#imageID").val(),
                id_genere: $("#genreID").val() // ID del genere selezionato
            };
    
            // Validazione base
            if (!libroData.titolo || !libroData.autore || !libroData.isbn || !libroData.casa_editrice || !libroData.anno_pubblicazione || !libroData.quantita || !libroData.immagine || !libroData.id_genere) {
                alert("Tutti i campi sono obbligatori.");
                return;
            }
    
            // Invia i dati al server
            $.ajax({
                url: "/api/libri",
                method: "POST",
                contentType: "application/json",
                data: JSON.stringify(libroData),
                success: function (response) {
                    alert("Libro aggiunto con successo!");
                    // Chiudi il modal e svuota i campi
                    $("#libroModalAdd").hide();
                    $("form")[0].reset();
                    loadLibri();
                },
                error: function (error) {
                    console.error("Errore durante l'aggiunta del libro:", error);
                    alert("Errore durante l'aggiunta del libro.");
                }
            });
        });
    
    

    $(".add").click(function () {
        // Mostra il modal
        $('#libroModalAdd').show();
    });

    // Chiudi il modal quando si clicca sulla "X"
    $(".close").click(function () {
        $('#libroModal').hide();
        $('#libroModalAdd').hide();
        $('#libroModalEdit').hide();
    });

    // Chiudi il modal quando si clicca fuori dal modal
    $(window).click(function (event) {
        if (event.target === document.getElementById('libroModal')) {
            $('#libroModal').hide();
        }
        if (event.target === document.getElementById('libroModalAdd')) {
            $('#libroModalAdd').hide();
        }
        if (event.target === document.getElementById('libroModalEdit')) {
            $('#libroModalEdit').hide();
        }

    });
    

/* -------------------------------------------------------prova isloggedin---------------------------------------------------------------------------------------------------*/
    /* Funzione per il pulsante Dashboard */
    document.addEventListener("DOMContentLoaded", () => {
        const navbarDynamicContent = document.getElementById("navbarDynamicContent");
    
        // Simula lo stato di autenticazione (modifica questa logica secondo il tuo sistema di autenticazione)
        const isAuthenticated = localStorage.getItem("isLoggedIn") === "true";

        if (isAuthenticated) {
            // Crea il pulsante Dashboard
            const dashboardButton = document.createElement("button");
            dashboardButton.className = "btn btn-nav mx-1";
            dashboardButton.type = "button";
            dashboardButton.textContent = "Dashboard";
            dashboardButton.onclick = () => {
                window.location.href = "dashboard.html";
            };
            // Aggiungi il pulsante Dashboard alla navbar
            navbarDynamicContent.appendChild(dashboardButton);
        }
    });

    document.addEventListener("DOMContentLoaded", () => {
        const navbarDynamicContent = document.getElementById("navbarDynamicContent");
        const dropdownMenuLink = document.getElementById("dropdownMenuLink");
        const dropdownMenu = dropdownMenuLink.nextElementSibling;

        // Verifica se l'utente è autenticato
        const user = JSON.parse(localStorage.getItem("user"));

        if (user) {
            // Aggiorna il nome nel dropdown
            dropdownMenuLink.innerHTML = `${user.username} <i class="fa-solid fa-caret-down" style="margin-left: 5px;"></i>`;

            // Svuota il menu esistente
            dropdownMenu.innerHTML = "";

            // Aggiungi l'opzione "Opzioni"
            const optionsItem = document.createElement("li");
            const optionsLink = document.createElement("a");
            optionsLink.className = "dropdown-item";
            optionsLink.href = "options.html";
            optionsLink.textContent = "Opzioni";
            optionsItem.appendChild(optionsLink);
            dropdownMenu.appendChild(optionsItem);
            
            // Aggiungi l'opzione "Logout"
            const logoutItem = document.createElement("li");
            const logoutLink = document.createElement("a");
            logoutLink.className = "dropdown-item";
            logoutLink.href = "#";
            logoutLink.textContent = "Logout";
            logoutLink.onclick = () => {
                localStorage.removeItem("user");
                alert("Logout eseguito con successo");
                location.reload();
            };
            logoutItem.appendChild(logoutLink);
            dropdownMenu.appendChild(logoutItem);
            
            // Aggiungi il pulsante Dashboard
            const dashboardButton = document.createElement("button");
            dashboardButton.className = "btn btn-nav mx-1";
            dashboardButton.type = "button";
            dashboardButton.textContent = "Dashboard";
            dashboardButton.onclick = () => {
                window.location.href = "dashboard.html";
            };
            navbarDynamicContent.appendChild(dashboardButton);
        } else {
            // Gestione del login
            async function login(email, password) {
            try {
                const response = await fetch("http://localhost:3000/login", {
                    method: "POST",
                    headers: {
                    "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ email, password }),
                });
                
                if (response.ok) {
                    const user = await response.json();
                    localStorage.setItem("user", JSON.stringify(user));
                    alert(`Benvenuto, ${user.username}!`);
                    location.reload();
                } else {
                    alert("Credenziali non valide");
                }
            } catch (error) {
                console.error("Errore durante il login:", error);
                alert("Errore del server");
            }
        }
        
       // Simula il login con un'email e una password (aggiungi un form per login reale)
        document.getElementById("loginButton").addEventListener("click", () => {
            const email = document.getElementById("emailInput").value;
            const password = document.getElementById("passwordInput").value;
            login(email, password);
        });
        }
    });

});
