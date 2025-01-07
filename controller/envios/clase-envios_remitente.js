

const getConnection = require('../../dbconfig');

// Clase EnviosDireccionesRemitente
class EnviosDireccionesRemitente {
    constructor(did = null, didEnvio = null, calle = null, numero = null, address_line = null, cp = null, localidad = null, provincia = null, pais = null, latitud = null, longitud = null, obs = null, quien = null,idbd= null) {
        this.did = did;
        this.didEnvio = didEnvio;
        this.calle = calle;
        this.numero = numero;
        this.address_line = address_line;
        this.cp = cp;
        this.localidad = localidad;
        this.provincia = provincia;
        this.pais = pais;
        this.latitud = latitud;
        this.longitud = longitud;
        this.obs = obs;
        this.quien = quien;
        this.autofecha = new Date().toISOString().slice(0, 19).replace('T', ' ');
         // Asignando la fecha y hora actual
         this.idbd= idbd;  
    }

    // Método para convertir a JSON
    toJSON() {
        return JSON.stringify(this);
    }

    // Método para insertar en la base de datos
    async insert() {
        const connection = getConnection(this.idbd);
        const columnsQuery = 'DESCRIBE envios_direcciones_remitente';

        return new Promise((resolve, reject) => {
            connection.query(columnsQuery, (err, results) => {
                if (err) {
                    return reject(err);
                }

                const tableColumns = results.map(column => column.Field);
                const filteredColumns = tableColumns.filter(column => this[column] !== undefined);

                const values = filteredColumns.map(column => this[column]);
                const insertQuery = `INSERT INTO envios_direcciones_remitente (${filteredColumns.join(', ')}) VALUES (${filteredColumns.map(() => '?').join(', ')})`;

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

// Insertar los datos en la base de datos
//direccionRemitente.insert();

// Cerrar la conexión
//connection.end();
module.exports = EnviosDireccionesRemitente;