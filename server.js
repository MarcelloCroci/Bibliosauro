const { Pool } = require('pg');

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



pool.connect()
    .then(() => {
        console.log('Connected to CockroachDB!');
    })
    .catch((err) => {
        console.error('Connection error:', err.stack);
    });




