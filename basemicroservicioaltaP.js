const express = require('express');
const jwt = require('jsonwebtoken');
const mysql = require('mysql');
const crypto = require('crypto');
const bodyParser = require('body-parser');
const redis = require('redis');

// Configuración de Redis
const redisClient = redis.createClient({
  socket: {
    host: '127.0.0.1', // IP interna
    port: 6379,          // Puerto interno
  }
 
});

// Manejo de errores
redisClient.on('error', (err) => {
  console.error('Error al conectar con Redis:', err);
});


//Me traigo las empresas habilitadas
let empresasDB = null;

const app = express(); 
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
const PORT = 3000;


function getDbConfig(idEmpresa) {
  data = -1;
  for (let j in empresasDB) {
	if (empresasDB[j]["id"]*1 == idEmpresa) {
		data = empresasDB[j];
	}
  }
  return data // Devuelve null si la clave no existe
}

async function actualizarEmpresas(){
    const empresasDataJson = await redisClient.get('empresasData');
    empresasDB = JSON.parse(empresasDataJson);
}


(async () => {
    try {
        await redisClient.connect();

        // Actualizar empresas antes de iniciar el servidor
        await actualizarEmpresas();


        // Iniciar servidor
        app.listen(PORT, () => {
            console.log(`Servidor escuchando en el puerto ${PORT}`);
        });
        
    } catch (err) {
        console.error('Error al iniciar el servidor:', err);
    }
})();
