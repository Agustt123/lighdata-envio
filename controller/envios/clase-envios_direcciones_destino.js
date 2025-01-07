
const getConnection = require('../../dbconfig');

// Clase EnviosDireccionesDestino
class EnviosDireccionesDestino {
    constructor(did = null,didEnvio,  calle = null, numero = null, address_line = null, cp = null, localidad = null, provincia = null, pais = null, latitud = null, longitud = null,   
        quien = null,idEmpresa = null) {
        this.did = did;
        this.didEnvio = didEnvio;
        this.calle = calle;
        this.numero = numero;
        this.address_line = calle.numero;
        this.cp = cp;
        this.localidad = localidad;
        this.provincia = provincia;
        this.pais = pais;
        this.latitud = latitud;
        this.longitud = longitud;
        this.idEmpresa= idEmpresa;
       
     
      
        this.quien = quien;

    }

    // Método para convertir a JSON
    toJSON() {
        return JSON.stringify(this);
    }

    // Método para insertar en la base de datos
    async insert() {
        const connection = getConnection(this.idEmpresa);
        const columnsQuery = 'DESCRIBE envios_direcciones_destino';

        return new Promise((resolve, reject) => {
            connection.query(columnsQuery, (err, results) => {
                if (err) {
                    return reject(err);
                }

                const tableColumns = results.map(column => column.Field);
                const filteredColumns = tableColumns.filter(column => this[column] !== undefined);

                const values = filteredColumns.map(column => this[column]);
                const insertQuery = `INSERT INTO envios_direcciones_destino (${filteredColumns.join(', ')}) VALUES (${filteredColumns.map(() => '?').join(', ')})`;

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





// Crear la instancia de la clase con los datos

// Insertar los datos en la base de datos
//direccionDestino.insert();

// Cerrar la conexión
//connection.end();
module.exports= EnviosDireccionesDestino;
