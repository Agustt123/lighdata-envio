const mysql = require('mysql2');
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'logisticaA',
    password: 'logisticaa',
    database: 'logisticaa'
});


class Envios {
    constructor(
        did, didDeposito, gtoken, flex, turbo, exterior, autofecha, 
        fecha_inicio, fechaunix, lote, ml_shipment_id, 
        ml_vendedor_id, ml_venta_id, ml_pack_id, ml_qr_seguridad, didCliente, 
        didCuenta, didServicio, 
        didSucursalDistribucion, peso, volumen, bultos, 
        valor_declarado, 
        monto_total_a_cobrar, tracking_method, tracking_number, fecha_venta,  
        destination_receiver_name, destination_receiver_phone, 
        destination_receiver_email, destination_comments, delivery_preference, quien, elim,
    ) {
        // Asignar solo los valores pasados
        this.did = did;
        this.didDeposito = didDeposito;
        this.gtoken = gtoken;
        this.flex = flex;
        this.turbo = turbo;
        this.exterior = exterior;
        this.autofecha = autofecha;
        this.fecha_inicio = fecha_inicio;
        this.fechaunix = fechaunix;
        this.lote = lote;
        this.ml_shipment_id = ml_shipment_id;
        this.ml_vendedor_id = ml_vendedor_id;
        this.ml_venta_id = ml_venta_id;
        this.ml_pack_id = ml_pack_id;
        this.ml_qr_seguridad = ml_qr_seguridad;
        this.didCliente = didCliente;
        this.didCuenta = didCuenta;
        this.didServicio = didServicio;
        this.didSucursalDistribucion = didSucursalDistribucion || 1; // Default: 1
        this.peso = peso;
        this.volumen = volumen;
        this.bultos = bultos;
        this.valor_declarado = valor_declarado;
        this.monto_total_a_cobrar = monto_total_a_cobrar;
        this.tracking_method = tracking_method;
        this.tracking_number = tracking_number;
        this.fecha_venta = fecha_venta;
        this.destination_receiver_name = destination_receiver_name;
        this.destination_receiver_phone = destination_receiver_phone;
        this.destination_receiver_email = destination_receiver_email;
        this.destination_comments = destination_comments;
        this.delivery_preference = delivery_preference;
        this.quien = quien || 0; // Default: 0
        this.elim = elim || 0; // Default: 0
     
        this.didEnvioZonaCosto = 0;  // Default: 0
    }

    async insert() {
        // Obtener las columnas de la tabla 'envios' desde la base de datos
        const columnsQuery = 'DESCRIBE envios';

        return new Promise((resolve, reject) => {
            connection.execute(columnsQuery, (err, results) => {
                if (err) {
                    return reject(err);
                }

                // Crear un array con los nombres de las columnas de la tabla
                const tableColumns = results.map(column => column.Field);

          
const values = tableColumns.map(column => {
   
    if (this[column] !== undefined) {
        return this[column];  
    }


    if (column.includes("fecha") || column.includes("datetime")) {

        if (column === "estimated_delivery_time_date") {
            return "0000-00-00 00:00:00";  
        }

      
        if (this[column] === '0000-00-00 00:00:00') {
            return '0000-00-00 00:00:00';  
        }

        return '0000-00-00 00:00:00'; 
    }

    return 0;
});

                
                
     
                

                // Construcción dinámica de la consulta INSERT
                const insertQuery = `INSERT INTO envios (${tableColumns.join(', ')}) VALUES (${tableColumns.map(() => '?').join(', ')})`;

                console.log("Query:", insertQuery);
                console.log("Values:", values);

                // Ejecutar el INSERT
                connection.execute(insertQuery, values, (err, results) => {
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

module.exports = Envios;
