const mysql = require('mysql');

// Configuración de las bases de datos
const dbConfigsArray = [
    
    {
        host: 'localhost',
        user: 'logisticaA',
        password: 'logisticaa',
        database: 'logisticaa'
    },
    {
        host: 'localhost',
        user: 'procourrier',
        password: 'procourrier',
        database: 'procourrier'
    },
    {
        host: 'localhost',
        user: 'logisticaB',
        password: 'logisticab',
        database: 'logisticab'
    },
    {
        host: 'localhost',
        user: 'logisticaC',
        password: 'logisticac',
        database: 'logisticac'
    },
    {
        host: 'localhost',
        user: 'logisticaD',
        password: 'logisticad',
        database: 'logisticad'
    },
   
];
console.log("Config array length:", dbConfigsArray.length);
console.log(dbConfigsArray[1])
// Función para obtener la conexión
function getConnection(databaseIdentifier) {
    
    let config;

    // Si se pasa un índice
    if (typeof databaseIdentifier === 'number') {
        if (databaseIdentifier < 0 || databaseIdentifier >= dbConfigsArray.length) {
            throw new Error(`Índice fuera de rango: ${databaseIdentifier}`);
        }
        config = dbConfigsArray[databaseIdentifier];
    }
    // Si se pasa un nombre
    else if (typeof databaseIdentifier === 'string') {
        config = dbConfigsArray.find(db => db.database === databaseIdentifier);
        if (!config) {
            throw new Error(`Configuración no encontrada para la base de datos: ${databaseIdentifier}`);
        }
    } else {
        throw new Error(`Identificador inválido: ${databaseIdentifier}`);
    }

    return mysql.createConnection(config);
}

// Exportamos esta función para usarla en otras partes del código
module.exports = getConnection;
