const getConnection = require('../../dbconfig');

class enviosPackRemitente{
    constructor(didEnvio,remitente,telefono,email,provincia,localidad,domicilio,cp,idempresa)
    { 
        this.didEnvio=didEnvio;
        this.remitente=remitente;
        this.telefono=telefono;
        this.email=email;
        this.provincia=provincia;
        this.localidad=localidad;
        this.domicilio=domicilio,
        this.cp=cp;
        this.idempresa=idempresa;

    }
    toJson(){
        return JSON.stringify(this);
    }
    async insert() {
        const connection = getConnection(this.idempresa);
        const columnsQuery = 'DESCRIBE enviospack_remitente';

        return new Promise((resolve, reject) => {
            connection.query(columnsQuery, (err, results) => {
                if (err) {
                    return reject(err);
                }

                const tableColumns = results.map(column => column.Field);
                const filteredColumns = tableColumns.filter(column => this[column] !== undefined);

                const values = filteredColumns.map(column => this[column]);
                const insertQuery = `INSERT INTO enviospack_remitente (${filteredColumns.join(', ')}) VALUES (${filteredColumns.map(() => '?').join(', ')})`;

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
module.exports= enviosPackRemitente;