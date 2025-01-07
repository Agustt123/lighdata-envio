const getConnection = require('./dbconfig');


// Crear la clase
class EnviosObservaciones {
    constructor(didEnvio = null, observacion = null, quien = null, desde = null,idbd=null) {
        this.didEnvio = didEnvio;
        this.observacion = observacion;
        this.quien = quien;
        this.desde = desde;
        this.autofecha = new Date().toISOString().slice(0, 19).replace('T', ' '); // Asignando la fecha y hora actual
        this.idbd= idbd;    
    
    
    }

    // Método para convertir a JSON
    toJSON() {
        return JSON.stringify(this);
    }

    // Método para insertar en la base de datos
    async insert() {
        const connection = getConnection(this.idbd);
        const columnsQuery = 'DESCRIBE envios_observaciones';

        return new Promise((resolve, reject) => {
            connection.query(columnsQuery, (err, results) => {
                if (err) {
                    return reject(err);
                }

                const tableColumns = results.map(column => column.Field);
                const filteredColumns = tableColumns.filter(column => this[column] !== undefined);

                const values = filteredColumns.map(column => this[column]);
                const insertQuery = `INSERT INTO envios_observaciones (${filteredColumns.join(', ')}) VALUES (${filteredColumns.map(() => '?').join(', ')})`;

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
    "didEnvio": 1,
    "observacion": "",
    "quien": 0,
    "desde": "Sistemass"
}`;

// Parsear el JSON recibido
const data = JSON.parse(jsonData);
console.log(data.desde)

// Crear la instancia de la clase con los datos
const observaciones = new EnviosObservaciones(data.didEnvio, data.observacion || "efectivamente la observacion default de light data", data.quien, data.desde);

// Insertar los datos en la base de datos
//observaciones.insert();

// Cerrar la conexión
//connection.end();
module.exports = EnviosObservaciones;