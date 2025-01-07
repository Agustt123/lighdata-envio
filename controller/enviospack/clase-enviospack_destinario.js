const getConnection = require('../../dbconfig');


class envioPackDestinatario{
    constructor(didEnvio,destinario,cuil,telefono,email,provincia,localidad,domicilio,cp,observacion,idempresa){

this.didEnvio=didEnvio;
this.destinario=destinario;
this.cuil=cuil
this.telefono=telefono;
this.email=email;
this.provincia=provincia;
this.localidad=localidad;
this.domicilio=domicilio;
this.cp=cp;
this.observacion=observacion;      
this.idempresa=idempresa;  
    }

    toJson(){
        return JSON.stringify(this);
    }
    async insert() {
        const connection = getConnection(this.idempresa);
        const columnsQuery = 'DESCRIBE enviospack_destinatario';

        return new Promise((resolve, reject) => {
            connection.query(columnsQuery, (err, results) => {
                if (err) {
                    return reject(err);
                }

                const tableColumns = results.map(column => column.Field);
                const filteredColumns = tableColumns.filter(column => this[column] !== undefined);

                const values = filteredColumns.map(column => this[column]);
                const insertQuery = `INSERT INTO enviospack_destinatario (${filteredColumns.join(', ')}) VALUES (${filteredColumns.map(() => '?').join(', ')})`;

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

module.exports= envioPackDestinatario;