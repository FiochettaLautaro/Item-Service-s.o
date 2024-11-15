const express = require('express');
const router = express.Router();
const multer = require('multer');
const itemController = require('../controllers/itemController'); // Importa el controlador

// Configurar Multer
const storage = multer.memoryStorage(); // Guarda el archivo en memoria (sin persistir en el sistema de archivos)
const upload = multer({ storage: storage }); // Utiliza la configuración de almacenamiento

// Definir las rutas y asociarlas con las funciones del controlador
router.get('/api/v1', itemController.getAllItems);
router.get('/api/v1/:id', itemController.getItemById);

// Ruta POST para crear un item, incluye el middleware `upload.single('image')` para procesar un archivo
router.post('/api/v1', upload.single('image'), itemController.createItem);

router.put('/api/v1/:id', itemController.updateItem);
router.delete('/api/v1/:id', itemController.deleteItem);

module.exports = router;
