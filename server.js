const express = require('express');
const { Pool } = require('pg');
const path = require('path'); // Importa il modulo 'path'
const app = express();
app.use(express.json());

const pool = new Pool({
    user: 'albastefano',
    host: 'sleepy-quetzal-5300.j77.aws-eu-central-1.cockroachlabs.cloud',
    database: 'defaultdb',
    password: 'kKtKW9M-AHKNYhS1Yadm1w',
    port: 26257,
    ssl: {
        rejectUnauthorized: false,
    },
});

// Serve i file statici dalla cartella 'public'
app.use(express.static(path.join(__dirname, 'public')));
app.use("/html",express.static(path.join(__dirname, 'html')));

// Endpoint per la root (che ora restituirà index.html)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'index.html'));
});


// Endpoint per ottenere i generi dal database
app.get('/api/generi', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM generi');
        res.json(result.rows);
    } catch (err) {
        console.error('Errore nel recupero dei generi:', err);
        res.status(500).send('Errore nel recupero dei generi');
    }
});

// Endpoint per ottenere i libri
app.get('/api/libri', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM Libri');
        res.json(result.rows);
    } catch (err) {
        console.error('Errore nel recupero dei libro:', err);
        res.status(500).send('Server error');
    }
});

//select libro by id
app.get('/api/libro/:id', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM libri WHERE id_libro = $1', [req.params.id]);
        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            res.status(404).send('Libro non trovato');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Errore nel recupero del libro');
    }
});
//LOGIN
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).send("Email e password sono obbligatori.");
    }

    try {
        // Query per verificare l'utente
        const query = `
            SELECT * 
            FROM utenti 
            WHERE email = $1 AND password = crypt($2,password)
        `;
        const result = await pool.query(query, [email, password]);

        if (result.rows.length > 0) {
            // Autenticazione riuscita
            res.status(200).json({ message: "Login avvenuto con successo", user: result.rows[0] });
        } else {
            // Autenticazione fallita
            res.status(401).send("Email o password errati.");
        }
    } catch (error) {
        console.error("Errore durante il login:", error);
        res.status(500).send("Errore interno al server.");
    }
});

//register
app.post('/api/register', async (req, res) => {
    const { nome, cognome, email, password, ruolo } = req.body;

    if (!nome || !cognome || !email || !password) {
        return res.status(400).send("Tutti i campi sono obbligatori.");
    }

    try {
        // Query per inserire un nuovo utente
        const query = `
            INSERT INTO utenti (nome, cognome, email, password, ruolo) 
            VALUES ($1, $2, $3, crypt($4, gen_salt('bf')), $5)
            RETURNING id_utente
        `;
        const result = await pool.query(query, [nome, cognome, email, password, ruolo || "utente"]);

        res.status(201).json({ message: "Registrazione completata", userId: result.rows[0].id_utente });
    } catch (error) {
        console.error("Errore durante la registrazione:", error);
        if (error.code === '23505') {
            res.status(409).send("L'email è già registrata.");
        } else {
            res.status(500).send("Errore interno al server.");
        }
    }
});





// Avvio del server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
