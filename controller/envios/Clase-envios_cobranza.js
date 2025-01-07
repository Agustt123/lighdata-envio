
const getConnection = require('../../dbconfig');
// Configuración de la conexión

// Clase EnviosCobranza
class EnviosCobranza {
    constructor(didEnvio = null, didCampoCobranza = null, valor = null, quien = null,  elim = null,idEmpresa = null) {
   
        this.didEnvio = didEnvio;
        this.didCampoCobranza = didCampoCobranza;
        this.valor = valor;
        this.quien = quien || 0;
        this.elim = elim || 0;
       
        this.idEmpresa=idEmpresa;
   
    }

   
    toJSON() {
        return JSON.stringify(this);
    }

    
    
    async insert() {
        const connection = getConnection(this.idEmpresa);
        const columnsQuery = 'DESCRIBE envios_cobranzas';

        return new Promise((resolve, reject) => {
            connection.query(columnsQuery, (err, results) => {
                if (err) {
                    return reject(err);
                }

                const tableColumns = results.map(column => column.Field);
                const filteredColumns = tableColumns.filter(column => this[column] !== undefined);

                const values = filteredColumns.map(column => this[column]);
                const insertQuery = `INSERT INTO envios_cobranzas (${filteredColumns.join(', ')}) VALUES (${filteredColumns.map(() => '?').join(', ')})`;

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

module.exports = EnviosCobranza;
