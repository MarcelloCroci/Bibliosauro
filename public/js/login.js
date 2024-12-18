$("#login-submit").click(function () {
    const loginData = {
        email: $("#emailid").val(), // Email inserita dall'utente
        password: $("#pswid").val() // Password inserita dall'utente
    };
    

    // Validazione base
    if (!loginData.email || !loginData.password) {
        alert("Inserire sia l'email che la password.");
        return;
    }

    // Invia i dati al server per l'autenticazione
    $.ajax({
        url: "/api/login",
        method: "POST",
        contentType: "application/json",
        data: JSON.stringify(loginData),
        success: function (response) {
            alert("Login avvenuto con successo!");
            localStorage.setItem("user", JSON.stringify(response.user));

            // Ad esempio, puoi reindirizzare l'utente a un'altra pagina:
            window.location.href = "../html/index.html";
        },
        error: function (error) {
            console.error("Errore durante il login:", error);
            alert("Email o password errati.");
        }
    });
});

$("#logout-button").click(function () {
    localStorage.removeItem("user");
    window.location.href = "../html/login.html";
});
