const { getConnection, getFromRedis } = require('../../dbconfig');

class EnviosFlex {
  constructor(did,
    ml_shipment_id, ml_vendedor_id, ml_qr_seguridad, didCliente,
    didCuenta, elim, idEmpresa
  ) {
    this.did=did
    this.ml_shipment_id = ml_shipment_id;
    this.ml_vendedor_id = ml_vendedor_id;
    this.ml_qr_seguridad = ml_qr_seguridad;
    this.didCliente = didCliente;
    this.didCuenta = didCuenta;
    this.elim = elim || 0;
    this.idEmpresa = idEmpresa;
  }

  toJSON() {
    return JSON.stringify(this);
  }

  async insert() {
    const redisKey = 'empresasData'; // La clave en Redis que contiene todas las empresas
    console.log("Buscando clave de Redis:", redisKey);

    try {
      // Obtener todas las empresas desde Redis
      const empresasDataJson = await getFromRedis(redisKey);
      const empresasDB = empresasDataJson;

      // Verificar si la empresa en la posición idEmpresa existe
      const empresa = empresasDB ? empresasDB[this.idEmpresa] : null;

      if (!empresa) {
        throw new Error(`Configuración no encontrada en Redis para empresa con ID: ${this.idEmpresa}`);
      }

      console.log("Configuración de la empresa encontrada:", empresa);

      // Obtener la conexión a la base de datos
      const connection = await getConnection(this.idEmpresa);

      if (this.did === 0 || this.did === '0') {
        // Caso `ml_shipment_id === 0`: Crear un nuevo registro
        return this.createNewRecordWithIdUpdate(connection);
      } else {
        // Caso `ml_shipment_id !== 0`: Verificar y actualizar
        return this.checkAndUpdateShipmentId(connection);
      }
    } catch (error) {
      console.error("Error en el método insert:", error.message);


      throw {
        status: 500,
        response: {
          estado: false,
          error: -1,

        },
      };
    }
  }

  checkAndUpdateShipmentId(connection) {
    const checkShipmentIdQuery = 'SELECT id FROM envios WHERE id = ?';
    return new Promise((resolve, reject) => {
      connection.query(checkShipmentIdQuery, [this.did], (err, results) => {
        if (err) {
          return reject(err);
        }

        if (results.length > 0) {
          // Si el `ml_shipment_id` ya existe, actualizarlo
          const updateQuery = 'UPDATE envios SET elim = 1 WHERE did = ?';
          connection.query(updateQuery, [this.did], (updateErr) => {
            if (updateErr) {
              return reject(updateErr);
            }

            // Crear un nuevo registro con el mismo `ml_shipment_id`
            this.createNewRecord(connection, this.did, resolve, reject);
          });
        } else {
          // Si el `ml_shipment_id` no existe, simplemente crear un nuevo registro
          this.createNewRecord(connection, this.did, resolve, reject);
        }
      });
    });
  }

  createNewRecordWithIdUpdate(connection) {
    const columnsQuery = 'DESCRIBE envios';

    return new Promise((resolve, reject) => {
      connection.query(columnsQuery, (err, results) => {
        if (err) {
          return reject(err);
        }

        const tableColumns = results.map((column) => column.Field);
        const filteredColumns = tableColumns.filter((column) => this[column] !== undefined);

        const values = filteredColumns.map((column) => this[column]);
        const insertQuery = `INSERT INTO envios (${filteredColumns.join(', ')}) VALUES (${filteredColumns.map(() => '?').join(', ')})`;

        console.log('Insert Query:', insertQuery);
        console.log('Values:', values);

        connection.query(insertQuery, values, (err, results) => {
          if (err) {
            return reject(err);
          }

          const insertId = results.insertId;
          console.log("ID insertado:", insertId);

          // Actualizar el campo `ml_shipment_id` con el `insertId`
          const updateShipmentIdQuery = 'UPDATE envios SET did = ? WHERE id = ?';
          connection.query(updateShipmentIdQuery, [insertId, insertId], (updateErr) => {
            if (updateErr) {
              return reject(updateErr);
            }

            console.log(`Campo did actualizado a ${insertId} para el registro con ID ${insertId}`);
            resolve({ insertId: insertId, did: insertId });
          });
        });
      });
    });
  }

  createNewRecord(connection, did, resolve, reject) {
    const columnsQuery = 'DESCRIBE envios';

    connection.query(columnsQuery, (err, results) => {
      if (err) {
        return reject(err);
      }

      const tableColumns = results.map((column) => column.Field);
      const filteredColumns = tableColumns.filter((column) => this[column] !== undefined);

      const values = filteredColumns.map((column) => this[column]);
      const insertQuery = `INSERT INTO envios (${filteredColumns.join(', ')}) VALUES (${filteredColumns.map(() => '?').join(', ')})`;

      console.log('Insert Query:', insertQuery);
      console.log('Values:', values);

      connection.query(insertQuery, values, (err, results) => {
        if (err) {
          return reject(err);
        }

        const insertId = results.insertId;
        console.log("Nuevo registro creado con ID:", insertId);

        if (did === 0 || did === '0') {
          const updateShipmentIdQuery = 'UPDATE envios SET did = ? WHERE id = ?';
          connection.query(updateShipmentIdQuery, [insertId, insertId], (updateErr) => {
            if (updateErr) {
              return reject(updateErr);
            }

            console.log(`Campo did actualizado a ${insertId} para el registro con did ${insertId}`);
            resolve({ insertId: insertId, did:insertId });
          });
        } else {
          resolve({ insertId: insertId, did:did });
        }
      });
    });
  }
}

module.exports = EnviosFlex;
