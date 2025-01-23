const { getConnection, getFromRedis } = require('../../dbconfig');

class Envios {
    constructor(data) {
        const {
            idEmpresa,
            did = 0,
            didDeposito = 1,
            gtoken = this.generateGToken(),
            flex=0,
            turbo = 0,
            exterior = 0,
            autofecha = new Date().toISOString(),
            fecha_inicio = new Date().toISOString(),
            fechaunix = this.generateFechaUnix(),
            lote = "",
            ml_shipment_id = "",
            ml_vendedor_id = "",
            ml_venta_id = "",
            ml_pack_id = "",
            ml_qr_seguridad = "",
            didCliente=0,
            didCuenta,
            didServicio = 1,
            didSucursalDistribucion = 1,
            peso = "",
            volumen = "",
            bultos = 1,
            valor_declarado = "",
            monto_total_a_cobrar = "",
            tracking_method = "",
            tracking_number = "",
            fecha_venta = "",
            destination_receiver_name = " ",
            destination_receiver_phone = "",
            destination_receiver_email = "",
            destination_comments = "   ",
            delivery_preference = " ",
            quien,
            elim=0,
        } = data;

        // Validar campos obligatorios
        if (idEmpresa == null ||flex ==null || didCuenta == null || didCliente ==null||quien== null || elim ===undefined){
          //!flex || !didCliente || !didCuenta || !quien || elim === undefined) {
            throw new Error("Faltan campos obligatorioss.");
        }

        // Asignar valores
        this.idEmpresa = idEmpresa;
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
        this.didSucursalDistribucion = didSucursalDistribucion;
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
        this.quien = quien;
        this.elim = elim;
    }

    generateGToken() {
        return Math.random().toString(36).substring(2);
    }

    generateFechaUnix() {
        return Math.floor(Date.now() / 1000);
    }

    async insert() {
        const redisKey = 'empresasData'; // Clave en Redis
        try {
            const empresasDataJson = await getFromRedis(redisKey);
            const empresasDB = empresasDataJson;

            // Verificar si la empresa existe
            const empresa = empresasDB ? empresasDB[this.idEmpresa] : null;
            if (!empresa) {
                throw new Error(`Configuración no encontrada en Redis para empresa con ID: ${this.idEmpresa}`);
            }

            // Obtener conexión
            const connection = await getConnection(this.idEmpresa);

            if (this.did === 0 || this.did === '0') {
                return this.createNewRecordWithIdUpdate(connection);
            } else {
                return this.checkAndUpdateDid(connection);
            }
        } catch (error) {
            console.error("Error en insert:", error.message);
            throw {
                status: 500,
                response: {
                    estado: false,
                    error: -1,
                },
            };
        }
    }

    checkAndUpdateDid(connection) {
        const query = 'SELECT id FROM envios WHERE did = ?';
        return new Promise((resolve, reject) => {
            connection.query(query, [this.did], (err, results) => {
                if (err) return reject(err);

                if (results.length > 0) {
                    const updateQuery = 'UPDATE envios SET superado = 1 WHERE did = ?';
                    connection.query(updateQuery, [this.did], (updateErr) => {
                        if (updateErr) return reject(updateErr);
                        this.createNewRecord(connection, this.did, resolve, reject);
                    });
                } else {
                    this.createNewRecord(connection, this.did, resolve, reject);
                }
            });
        });
    }

    createNewRecordWithIdUpdate(connection) {
        return new Promise((resolve, reject) => {
            const query = 'DESCRIBE envios';
            connection.query(query, (err, results) => {
                if (err) return reject(err);

                const columns = results.map((col) => col.Field);
                const filteredColumns = columns.filter((col) => this[col] !== undefined);
                const values = filteredColumns.map((col) => this[col]);

                const insertQuery = `INSERT INTO envios (${filteredColumns.join(', ')}) VALUES (${filteredColumns.map(() => '?').join(', ')})`;
                console.log(values);
                

                connection.query(insertQuery, values, (err, result) => {
                    if (err) return reject(err);

                    const insertId = result.insertId;
                    const updateQuery = 'UPDATE envios SET did = ? WHERE id = ?';
                    connection.query(updateQuery, [insertId, insertId], (err) => {
                        if (err) return reject(err);
                        resolve({ insertId, did: insertId });
                    });
                });
            });
        });
    }

    createNewRecord(connection, did, resolve, reject) {
        const query = 'DESCRIBE envios';
        connection.query(query, (err, results) => {
            if (err) return reject(err);

            const columns = results.map((col) => col.Field);
            const filteredColumns = columns.filter((col) => this[col] !== undefined);
            const values = filteredColumns.map((col) => this[col]);

            const insertQuery = `INSERT INTO envios (${filteredColumns.join(', ')}) VALUES (${filteredColumns.map(() => '?').join(', ')})`;

            connection.query(insertQuery, values, (err, result) => {
                if (err) return reject(err);

                const insertId = result.insertId;
                if (did === 0 || did === '0') {
                    const updateQuery = 'UPDATE envios SET did = ? WHERE id = ?';
                    connection.query(updateQuery, [insertId, insertId], (err) => {
                        if (err) return reject(err);
                        resolve({ insertId, did: insertId });
                    });
                } else {
                    resolve({ insertId, did });
                }
            });
        });
    }
}

module.exports = Envios;
