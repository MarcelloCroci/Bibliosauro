const express = require('express');
const { Pool } = require('pg');
const path = require('path'); // Importa il modulo 'path'
const app = express();

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
// // Endpoint per ottenere i libri
// app.get('/api/librigeneri', async (req, res) => {
//     try {
//         const result = await 
//         pool.query('SELECT * FROM libri AS l JOIN libri_generi AS lg ON l.id_libro = lg.id_libro JOIN generi AS g ON lg.id_genere = g.id_genere');
//         res.json(result.rows);
//     } catch (err) {
//         console.error('Errore nel recupero dei libro:', err);
//         res.status(500).send('Server error');
//     }
// });

//select libro by id
app.get('/api/libro/:id_libro', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM libri AS l JOIN libri_generi AS lg ON l.id_libro = lg.id_libro JOIN generi AS g ON lg.id_genere = g.id_genere WHERE id_libro = $1', [req.params.id]);
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


// Avvio del server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
