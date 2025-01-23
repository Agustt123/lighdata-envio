const { getConnection, getFromRedis } = require('../../dbconfig');

class EnviosItems {
  constructor(didEnvio = "", codigo = "", imagen = "", descripcion = "", ml_id = "", dimensions = "", cantidad = "",
      variacion = "", seller_sku = "", descargado = "", autofecha = "", superado = "", elim = null, idEmpresa = null) {

      this.didEnvio = didEnvio;
      this.codigo = codigo;
      this.imagen = imagen;
      this.descripcion = descripcion;
      this.ml_id = ml_id;
      this.dimensions = dimensions;
      this.cantidad = cantidad;
      this.variacion = variacion;
      this.seller_sku = seller_sku;
      this.descargado = descargado;
      this.autofecha = new Date().toISOString();
      this.superado = superado;

      this.elim = elim || 0;
      this.idEmpresa = String(idEmpresa); // Asegurarse de que idEmpresa sea siempre un string
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

      // Obtener la conexión
      const connection = await getConnection(this.idEmpresa);

      if (this.didEnvio === "") {
        // Si `didEnvio` está vacío, crear un nuevo registro
        return this.createNewRecord(connection);
      } else {
        // Si `didEnvio` no está vacío, verificar si ya existe y manejarlo
        return this.checkAndUpdateDidEnvio(connection);
      }
    } catch (error) {
      console.error("Error en el método insert:", error.message);

      // Lanzar un error con el formato estándar
      throw {
        status: 500,
        response: {
          estado: false,
          error: -1,
        },
      };
    }
  }

  checkAndUpdateDidEnvio(connection) {
    const checkDidEnvioQuery = 'SELECT id FROM envios_items WHERE didEnvio = ?';
    return new Promise((resolve, reject) => {
      connection.query(checkDidEnvioQuery, [this.didEnvio], (err, results) => {
        if (err) {
          return reject(err);
        }

        if (results.length > 0) {
          // Si `didEnvio` ya existe, actualizarlo
          const updateQuery = 'UPDATE envios_items SET superado = 1 WHERE didEnvio = ?';
          connection.query(updateQuery, [this.didEnvio], (updateErr) => {
            if (updateErr) {
              return reject(updateErr);
            }

            // Crear un nuevo registro con el mismo `didEnvio`
            this.createNewRecord(connection).then(resolve).catch(reject);
          });
        } else {
          // Si `didEnvio` no existe, crear un nuevo registro directamente
          this.createNewRecord(connection).then(resolve).catch(reject);
        }
      });
    });
  }

  createNewRecord(connection) {
    const columnsQuery = 'DESCRIBE envios_items';

    return new Promise((resolve, reject) => {
      connection.query(columnsQuery, (err, results) => {
        if (err) {
          return reject(err);
        }

        const tableColumns = results.map((column) => column.Field);
        const filteredColumns = tableColumns.filter((column) => this[column] !== undefined);

        const values = filteredColumns.map((column) => this[column]);
        const insertQuery = `INSERT INTO envios_items (${filteredColumns.join(', ')}) VALUES (${filteredColumns.map(() => '?').join(', ')})`;

        console.log("Insert Query:", insertQuery);
        console.log("Values:", values);

        connection.query(insertQuery, values, (err, results) => {
          if (err) {
            return reject(err);
          }

          resolve({ insertId: results.insertId });
        });
      });
    });
  }
}

module.exports = EnviosItems;
