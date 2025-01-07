const getConnection = require('./dbconfig');

class EnviosFlex {
    constructor(
       ml_shipment_id,
        ml_vendedor_id,  ml_qr_seguridad, didCliente,
        didCuenta,
        

        
 elim,idbd
    ) {
        
        this.ml_shipment_id = ml_shipment_id;
        this.ml_vendedor_id = ml_vendedor_id;
     
        this.ml_qr_seguridad = ml_qr_seguridad;
        this.didCliente = didCliente;
        this.didCuenta = didCuenta;

        this.elim = elim || 0;
        this.idbd=idbd;
    }

    async insert() {
        const connection = getConnection(this.idbd);
        const columnsQuery = 'DESCRIBE envios';

        return new Promise((resolve, reject) => {
            connection.query(columnsQuery, (err, results) => {
                if (err) {
                    return reject(err);
                }

                const tableColumns = results.map(column => column.Field);
                const filteredColumns = tableColumns.filter(column => this[column] !== undefined);

                const values = filteredColumns.map(column => this[column]);
                const insertQuery = `INSERT INTO envios (${filteredColumns.join(', ')}) VALUES (${filteredColumns.map(() => '?').join(', ')})`;

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
    }
}

module.exports = EnviosFlex;
