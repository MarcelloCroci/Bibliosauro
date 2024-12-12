$("#register-submit").click(function () {
    const userData = {
        nome: $("#nomeid").val(), // Nome dell'utente
        cognome: $("#cognomeid").val(), // Cognome dell'utente
        email: $("#emailid").val(), // Email dell'utente
        password: $("#pswid").val(), // Password dell'utente
        ruolo: "utente" // Ruolo predefinito
    };

    // Validazione base
    if (!userData.nome || !userData.cognome || !userData.email || !userData.password) {
        alert("Tutti i campi sono obbligatori.");
        return;
    }

    // Invio dei dati al server per registrare il nuovo utente
    $.ajax({
        url: "/api/register",
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify(userData),
        success: function (response) {
            alert("Registrazione avvenuta con successo! Puoi ora effettuare il login.");
            // Reindirizza alla pagina di login
            window.location.href = "../html/login.html";
        },
        error: function (error) {
            console.error("Errore durante la registrazione:", error);
            alert("Errore durante la registrazione. Riprova.");
        }
    });
});

