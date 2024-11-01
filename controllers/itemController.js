const Item = require('../model/ItemModel'); // Importa el modelo

module.exports = {
    getAllItems: (req, res) => {
        const filters = {
            name: req.query.name,
            minPrice: req.query.minPrice,
            maxPrice: req.query.maxPrice,
            startDate: req.query.startDate,
            endDate: req.query.endDate,
            order: req.query.order
        };

        Item.getAll(filters, (err, results) => {
            if (err) {
                res.status(500).json({ error: err.message });
            } else if (!results || results.length === 0) {
                res.status(404).json({ error: 'Ítem no encontrado' });
            } else {
                res.json(results[0]);
            }
        });
    },

    getItemById: (req, res) => {
        const id = req.params.id;
        Item.getById(id, (err, results) => {
            if (err) {
                res.status(500).json({ error: err.message });
            } else if (!results || results.length === 0) {
                res.status(404).json({ error: 'Ítem no encontrado' });
            } else {
                res.json(results[0]);
            }
        });
    },

    createItem: (req, res) => {
        const { name, price, description, image_url } = req.body;

        // Validación para datos incompletos
        if (!name || !price || !description || !image_url) {
            return res.status(400).json({ error: "Datos incompletos. Todos los campos son requeridos." });
        }

        // Crear el nuevo item si todos los datos están completos
        const newItem = { name, price, description, image_url };
        Item.create(newItem, (err, results) => {
            if (err) {
                res.status(500).json({ error: err.message });
            } else {
                res.status(201).json({ id: results.insertId, ...newItem });
            }
        });
    },


    updateItem: (req, res) => {
        const id = req.params.id;
        const updatedItem = req.body;

        Item.update(id, updatedItem, (err, affectedRows) => {
            if (err) {
                res.status(500).json({ error: err.message });
            } else if (affectedRows === 0) {
                res.status(404).json({ error: 'Ítem no encontrado' });
            } else {
                res.status(200).json({ id, ...updatedItem });
            }
        });
    },

    deleteItem: (req, res) => {
        const id = req.params.id;

        Item.delete(id, (err, affectedRows) => {
            if (err) {
                res.status(500).json({ error: err.message });
            } else if (affectedRows === 0) {
                res.status(404).json({ error: 'Ítem no encontrado' });
            } else {
                res.status(204).send();
            }
        });
    }
};
