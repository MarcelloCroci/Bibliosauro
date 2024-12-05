const express = require('express');
const { Pool } = require('pg');
const path = require('path'); // Importa il modulo 'path'
const app = express();
app.use(express.json()); // Middleware per il parsing dei JSON
require('dotenv').config();

const pool = new Pool({
    user: process.env.USER,
    host: process.env.HOST,
    database: process.env.DATABASE,
    password: process.env.PASSWORD,
    port: process.env.PORT,
    ssl: {
        rejectUnauthorized: false,
    },
});

// Serve i file statici dalla cartella 'public'
app.use(express.static(path.join(__dirname, 'public')));
app.use("/html", express.static(path.join(__dirname, 'html')));

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

// Endpoint per caricare e filtrare i libri
app.get('/api/libri', async (req, res) => {
    try {
        const { ordine, disponibile, autore, casa_editrice, generi, cerca } = req.query;

        let queryText = `
            SELECT l.*, g.nome_genere 
            FROM libri AS l 
            JOIN libri_generi AS lg ON l.id_libro = lg.id_libro 
            JOIN generi AS g ON lg.id_genere = g.id_genere
        `;
        const queryParams = [];
        const conditions = [];

        // Filtro per disponibilità
        if (disponibile === 'true') {
            conditions.push(`l.disponibile = $${queryParams.length + 1}`);
            queryParams.push(true);
        }

        // Filtro per autore
        if (autore) {
            conditions.push(`l.autore ILIKE $${queryParams.length + 1}`);
            queryParams.push(`%${autore}%`);
        }

        // Filtro per casa editrice
        if (casa_editrice) {
            conditions.push(`l.casa_editrice ILIKE $${queryParams.length + 1}`);
            queryParams.push(`%${casa_editrice}%`);
        }

        // Filtro per genere
        if (generi) {
            conditions.push(`lg.id_genere = $${queryParams.length + 1}`);
            queryParams.push(generi);
        }

        // Filtro per ricerca generica (titolo, descrizione, autore, ecc.)
        if (cerca) {
            conditions.push(`(
                l.titolo ILIKE $${queryParams.length + 1} OR
                l.autore ILIKE $${queryParams.length + 1} OR
                l.casa_editrice ILIKE $${queryParams.length + 1}
            )`);
            queryParams.push(`%${cerca}%`);
        }

        // Aggiungi condizioni alla query
        if (conditions.length > 0) {
            queryText += ' WHERE ' + conditions.join(' AND ');
        }

        // Gestione dell'ordinamento
        if (ordine === 'alfa') {
            queryText += ' ORDER BY l.titolo ASC';
        } else if (ordine === 'popolare') {
            queryText += ' ORDER BY l.popolarita DESC';
        } else {
            queryText += ' ORDER BY l.id_libro DESC';
        }

        // Esegui la query
        const result = await pool.query(queryText, queryParams);
        res.json(result.rows);
    } catch (err) {
        console.error('Errore nel recupero dei libri:', err);
        res.status(500).send('Errore nel recupero dei libri dal database');
    }
});


//select libro by id
app.get('/api/libro/:id', async (req, res) => {
    const bookId = req.params.id;
    // console.log('ID ricevuto dal client:', bookId); // Logga l'ID ricevuto
    try {
        const result = await pool.query(
            'SELECT *, g.nome_genere FROM libri AS l JOIN libri_generi AS lg ON l.id_libro = lg.id_libro JOIN generi AS g ON lg.id_genere = g.id_genere WHERE l.id_libro = $1',
            [bookId]
        );
        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            console.log('Libro non trovato nel database.');
            res.status(404).send('Libro non trovato');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Errore nel recupero del libro');
    }
});


//INSERT
app.post('/api/libri', async (req, res) => {
    try {
        console.log('Payload ricevuto:', req.body);

        const {
            titolo,
            autore,
            casa_editrice,
            anno_pubblicazione,
            quantita,
            isbn,
            immagine,
            id_genere // ID del genere selezionato
        } = req.body;

        // Query per inserire il nuovo libro nella tabella `libri`
        const insertBookQuery = `
            INSERT INTO libri (titolo, autore, casa_editrice, anno_pubblicazione, quantita, isbn, immagine) 
            VALUES ($1, $2, $3, $4, $5, $6, $7) 
            RETURNING id_libro
        `;
        const bookParams = [titolo, autore, casa_editrice, anno_pubblicazione, quantita, isbn, immagine];

        // Inserimento del libro e recupero dell'ID generato
        const result = await pool.query(insertBookQuery, bookParams);
        const id_libro = result.rows[0].id_libro;

        console.log('Libro creato con ID:', id_libro);

        // Query per inserire nella tabella ponte `libri_generi`
        const insertBridgeQuery = `
            INSERT INTO libri_generi (id_libro, id_genere)
            VALUES ($1, $2)
        `;
        const bridgeParams = [id_libro, id_genere];

        await pool.query(insertBridgeQuery, bridgeParams);

        res.status(201).send('Libro creato con successo');
    } catch (err) {
        console.error('Errore durante la creazione del libro:', err);
        res.status(500).send('Errore durante la creazione del libro');
    }
});

//UPDATE
app.put('/api/libro/:id', async (req, res) => {
    const libroId = req.params.id;
    const { titolo, autore, casa_editrice, anno_pubblicazione, quantita, isbn, immagine, id_genere } = req.body;

    try {
        // Aggiorna il libro nella tabella `libri`
        const updateQuery = `
            UPDATE libri
            SET titolo = $1, autore = $2, casa_editrice = $3, anno_pubblicazione = $4, quantita = $5, isbn = $6, immagine = $7
            WHERE id_libro = $8
        `;
        await pool.query(updateQuery, [titolo, autore, casa_editrice, anno_pubblicazione, quantita, isbn, immagine, libroId]);

        // Aggiorna il genere nella tabella ponte `libri_generi`
        const deleteBridgeQuery = `DELETE FROM libri_generi WHERE id_libro = $1`;
        await pool.query(deleteBridgeQuery, [libroId]);

        const insertBridgeQuery = `INSERT INTO libri_generi (id_libro, id_genere) VALUES ($1, $2)`;
        await pool.query(insertBridgeQuery, [libroId, id_genere]);

        res.status(200).send("Libro aggiornato con successo.");
    } catch (error) {
        console.error("Errore durante l'aggiornamento del libro:", error);
        res.status(500).send("Errore durante l'aggiornamento del libro.");
    }
});



//DELETE
app.delete('/api/libro/:id', async (req, res) => {
    const libroId = req.params.id;

    try {
        // Elimina i collegamenti nella tabella ponte
        const deleteBridgeQuery = `DELETE FROM libri_generi WHERE id_libro = $1`;
        await pool.query(deleteBridgeQuery, [libroId]);

        // Elimina il libro dalla tabella `libri`
        const deleteQuery = `DELETE FROM libri WHERE id_libro = $1`;
        await pool.query(deleteQuery, [libroId]);

        res.status(200).send("Libro eliminato con successo.");
    } catch (error) {
        console.error("Errore durante l'eliminazione del libro:", error);
        res.status(500).send("Errore durante l'eliminazione del libro.");
    }
});



// Avvio del server
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
