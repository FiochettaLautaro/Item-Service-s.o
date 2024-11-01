const mysql = require('mysql2');
const moment = require('moment-timezone');

// Configuración de la conexión a la base de datos
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'item_bd'
});

// Conectar a la base de datos
connection.connect((err) => {
    if (err) {
        console.error('Error al conectar con la base de datos:', err);
        return;
    }
    console.log('Conexión a la base de datos establecida');
});

// Definición del modelo Item
const Item = {
    getAll: (filters, callback) => {
        let query = 'SELECT * FROM item WHERE 1=1';
        let params = [];

        // Filtro por nombre
        if (filters.name) {
            query += ' AND name LIKE ?';
            params.push(`%${filters.name}%`);
        }

        // Filtro por rango de precio
        if (filters.minPrice) {
            query += ' AND price >= ?';
            params.push(filters.minPrice);
        }
        if (filters.maxPrice) {
            query += ' AND price <= ?';
            params.push(filters.maxPrice);
        }

        // Filtro por fechas de creación
        if (filters.startDate) {
            query += ' AND created_at >= ?';
            params.push(filters.startDate);
        }
        if (filters.endDate) {
            query += ' AND created_at <= ?';
            params.push(filters.endDate);8
        }

        // Ordenar resultados
        if (filters.order) {
            query += ' ORDER BY ' + filters.order;
        }

        console.log('Ejecutando consulta:', query, params); // Para depuración

        connection.query(query, params, callback);
    },

    getById: (id, callback) => {
        connection.query('SELECT * FROM item WHERE id = ?', [id], callback);
    },

    create: (data, callback) => {
        const { name, price, description, image_url } = data;
        const now = moment().tz('America/Argentina/Buenos_Aires').format('YYYY-MM-DD HH:mm:ss');
        connection.query(
            'INSERT INTO item (name, price, description, image_url, created_at, modified_at) VALUES (?, ?, ?, ?, ?, ?)',
            [name, price, description, image_url, now, now],
            callback
        );
    },

    update: (id, data, callback) => {
        const { name, price, description, image_url } = data;
        const now = new Date();

        connection.query(
            'UPDATE item SET name = ?, price = ?, description = ?, image_url = ?, modified_at = ? WHERE id = ?',
            [name, price, description, image_url, now, id],
            (err, results) => {
                if (err) {
                    callback(err);
                } else {
                    callback(null, results.affectedRows); // Pasar la cantidad de filas afectadas
                }
            }
        );
    },

    delete: (id, callback) => {
        connection.query(
            'DELETE FROM item WHERE id = ?',
            [id],
            (err, results) => {
                if (err) {
                    callback(err);
                } else {
                    callback(null, results.affectedRows); // Pasar la cantidad de filas afectadas
                }
            }
        );
    },

};

module.exports = Item;
