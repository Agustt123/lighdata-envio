const express = require('express');
const app = express();
const port = 3000;


app.use(express.json());

// Importar rutas
const router = require('./route/route-envios');
const enviospack = require('./route/route-enviopack');

// Usar las rutas definidas
app.use('/api', router);
app.use("/api2",enviospack)

// Iniciar servidor
app.listen(port, () => {
    console.log(`Servidor escuchando en http://localhost:${port}`);
});

// Manejar cierre de servidor
process.on('SIGINT', () => {
    console.log('Cerrando servidor...');
    process.exit();
});
