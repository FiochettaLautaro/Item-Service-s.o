const Item = require('../model/ItemModel'); // Importa el modelo

const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

const AWS = require('aws-sdk');

AWS.config.update({
    accessKeyId: '',
    secretAccessKey: '',
    region: 'us-east-1'
});

const s3 = new AWS.S3();

const deleteImageFromS3 = async (imageKey) => {
    const params = {
        Bucket: 'imagenes-items', // Reemplazá con el nombre de tu bucket de S3
        Key: imageKey
    };

    try {
        await s3.deleteObject(params).promise();
        console.log(`Imagen eliminada de S3: ${imageKey}`);
    } catch (error) {
        console.error('Error al eliminar la imagen de S3:', error);
        throw new Error('No se pudo eliminar la imagen de S3');
    }
};

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
                return res.status(500).json({ error: err.message });
            }
            if (!results || results.length === 0) {
                return res.status(404).json({ error: 'Ítem no encontrado' });
            }
            res.json(results); // Ahora devuelve todos los elementos encontrados
        });
    },

    getItemById: (req, res) => {
        const id = req.params.id;
        Item.getById(id, (err, results) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (!results || results.length === 0) {
                return res.status(404).json({ error: 'Ítem no encontrado' });
            }
            res.json(results[0]);
        });
    },

    createItem: async (req, res) => {
        let image_url ;
        const file = req.file;
        const params = {
            Bucket: 'imagenes-items', // Reemplazá con el nombre de tu bucket de S3
            Key: `${Date.now()}_${file.originalname}`, // Nombre único para el archivo
            Body: file.buffer, // El contenido del archivo
            ContentType: file.mimetype
        };

            try {
                const data = await s3.upload(params).promise();
                image_url = data.Location; // URL de la imagen en S3
            } catch (error) {
                console.error(error);

            }

        const name = req.body.name;
        const price=  req.body.price;
        const description= req.body.description;
        // Validación para datos incompletos
        if (!name || !price || !description || !image_url) {
            return res.status(400).json({ error: "Datos incompletos. Todos los campos son requeridos." });
        }

        // Crear el nuevo item si todos los datos están completos
        const newItem = { name, price, description, image_url };
        Item.create(newItem, (err, results) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.status(201).json({ id: results.insertId, ...newItem });
        });
    },

    updateItem: (req, res) => {
        const id = req.params.id;
        const updatedItem = req.body;

        // Logging para depuración
        console.log('ID:', id);
        console.log('Updated Item:', updatedItem);


        Item.update(id, updatedItem, (err, affectedRows) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (affectedRows === 0) {
                return res.status(404).json({ error: 'Ítem no encontrado' });
            }
            res.status(200).json({ id, ...updatedItem });
        });
    },

    deleteItem: async (req, res) => {
        const id = req.params.id;

        try {
            // Buscar el ítem por ID para obtener la URL de la imagen usando callback
            Item.getById(id, async (err, results) => {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
                if (!results || results.length === 0) {
                    return res.status(404).json({ error: 'Ítem no encontrado' });
                }

                // Obtener la clave de la imagen en S3
                const imageKey = results[0].image_url.split('/').pop();
                console.log(imageKey);
                // Eliminar la imagen de S3
                await deleteImageFromS3(imageKey);

                // Eliminar el ítem de la base de datos
                Item.delete(id, (err, affectedRows) => {
                    if (err) {
                        return res.status(500).json({ error: err.message });
                    }
                    if (affectedRows === 0) {
                        return res.status(404).json({ error: 'Ítem no encontrado' });
                    }
                    res.status(204).send(); // Eliminación exitosa
                });
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Error al eliminar el ítem" });
        }
    }


};
