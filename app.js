const express = require('express');
const bodyParser = require('body-parser');
const itemRoutes = require('./routes/itemRoutes'); // Importa las rutas

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.json());

// Usar las rutas
app.use('/', itemRoutes);

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
