const getConnection = require('../../dbconfig');

class Enviospack{
    constructor(did,fecha, observacion,condventa,
       quien
        ,idempresa

    ){
        this.did=did;
        this.fecha=fecha;
  
        
        this.observacion=observacion,
        this.condventa=condventa;
      
  
        this.quien=quien;
        this.idempresa=idempresa;
    }

    toJSON(){
        return JSON.stringify(this);
        
    }
    async insert() {
        const connection = getConnection(this.idempresa);
        const columnsQuery = 'DESCRIBE enviospack';

        return new Promise((resolve, reject) => {
            connection.query(columnsQuery, (err, results) => {
                if (err) {
                    return reject(err);
                }

                const tableColumns = results.map(column => column.Field);
                const filteredColumns = tableColumns.filter(column => this[column] !== undefined);

                const values = filteredColumns.map(column => this[column]);
                const insertQuery = `INSERT INTO enviospack (${filteredColumns.join(', ')}) VALUES (${filteredColumns.map(() => '?').join(', ')})`;

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


    

module.exports= Enviospack;