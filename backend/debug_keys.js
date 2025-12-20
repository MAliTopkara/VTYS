const { pool } = require('./db');
const fs = require('fs');

async function debugKeys() {
    try {
        const [users] = await pool.query('SELECT * FROM kullanicilar LIMIT 1');
        let output = '';
        if (users.length > 0) {
            output += 'KEYS: ' + JSON.stringify(Object.keys(users[0])) + '\n';
            output += 'OBJ: ' + JSON.stringify(users[0], null, 2) + '\n';
        } else {
            output += 'No users found.';
        }

        fs.writeFileSync('debug_output.txt', output);
        console.log('Done writing to debug_output.txt');

    } catch (error) {
        console.error('DB Hatası:', error);
    } finally {
        process.exit();
    }
}

debugKeys();
