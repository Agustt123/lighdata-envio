const getConnection = require('./dbconfig');
// Configuración de la conexión


// Crear la clase
class EnviosLogisticaInversa {
    constructor(didEnvio = null, didCampoLogistica = null, valor = null, quien = null,idbd=null) {
        this.didEnvio = didEnvio;
        this.didCampoLogistica = didCampoLogistica;
        this.valor = valor;
        this.quien = quien;
        this.idbd= idbd
    }

    // Método para convertir a JSON
    toJSON() {
        return JSON.stringify(this);
    }

    // Método para insertar en la base de datos
    async insert() {
        const connection = getConnection(this.idbd);
        const columnsQuery = 'DESCRIBE envios_logisticainversa';

        return new Promise((resolve, reject) => {
            connection.query(columnsQuery, (err, results) => {
                if (err) {
                    return reject(err);
                }

                const tableColumns = results.map(column => column.Field);
                const filteredColumns = tableColumns.filter(column => this[column] !== undefined);

                const values = filteredColumns.map(column => this[column]);
                const insertQuery = `INSERT INTO envios_logisticainversa (${filteredColumns.join(', ')}) VALUES (${filteredColumns.map(() => '?').join(', ')})`;

                console.log("Query:", insertQuery);
                console.log("Values:", values);

                connection.query(insertQuery, values, (err, results) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve({ insertId: results.insertId });
                    }
                });
            });
        });
    }}
// Datos de entrada
const jsonData = `{
    "didEnvio": 0,
    "didCampoLogistica": 456,
    "valor": 100,
    "quien": 0
}`;

// Parsear el JSON recibido
const data = JSON.parse(jsonData);

// Crear la instancia de la clase con los datos
const logisticaInversa = new EnviosLogisticaInversa(data.didEnvio, data.didCampoLogistica, data.valor, data.quien);

// Insertar los datos en la base de datos
//logisticaInversa.insert();

// Cerrar la conexión
//connection.end();


module.exports = EnviosLogisticaInversa;
