const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController'); // Importa el controlador

// Definir las rutas y asociarlas con las funciones del controlador
router.get('/api/v1', itemController.getAllItems);
router.get('/api/v1/:id', itemController.getItemById);
router.post('/api/v1', itemController.createItem);
router.put('api/v1/:id', itemController.updateItem);
router.delete('/api/v1/:id', itemController.deleteItem);

module.exports = router;
