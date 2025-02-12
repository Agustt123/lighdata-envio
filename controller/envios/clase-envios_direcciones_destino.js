const { getConnection, getFromRedis } = require('../../dbconfig');

// Clase EnviosDireccionesDestino
class EnviosDireccionesDestino {
  constructor(did = "", didEnvio, calle = null, numero = null, address_line = null, cp = null, localidad = null, provincia = "", pais = "", latitud = "", longitud = "", 
    quien = null, idEmpresa = null,destination_comments="",delivery_preference="",conHorario="",prioridad="") {

    
    this.did = did;
    this.didEnvio = didEnvio;
    this.calle = calle;
    this.numero = numero;
    this.address_line = calle?.numero; // Asegúrate de que 'calle' sea un objeto con 'numero'
    this.cp = cp;
    this.localidad = localidad;
    this.provincia = provincia;
    this.pais = pais;
    this.latitud = latitud;
    this.longitud = longitud;
    this.idEmpresa = String(idEmpresa); // Asegurarse de que idEmpresa sea siempre un string
    this.quien = quien || 0;
    this.destination_comments=destination_comments;
    this.delivery_preference=delivery_preference;
    this.conHorario=conHorario;
    this.prioridad=prioridad;

  }

  // Método para convertir a JSON
  toJSON() {
    return JSON.stringify(this);
  }

  // Método para insertar en la base de datos
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

      if (this.didEnvio === null) {
        // Si `didEnvio` es null, crear un nuevo registro
        return this.createNewRecord(connection);
      } else {
        // Si `didEnvio` no es null, verificar si ya existe y manejarlo
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
    const checkDidEnvioQuery = 'SELECT id FROM envios_direcciones_destino WHERE didEnvio = ?';
    return new Promise((resolve, reject) => {
      connection.query(checkDidEnvioQuery, [this.didEnvio], (err, results) => {
        if (err) {
          return reject(err);
        }

        if (results.length > 0) {
          // Si `didEnvio` ya existe, actualizarlo
          const updateQuery = 'UPDATE envios_direcciones_destino SET superado = 1 WHERE didEnvio = ?';
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
    const columnsQuery = 'DESCRIBE envios_direcciones_destino';

    return new Promise((resolve, reject) => {
      connection.query(columnsQuery, (err, results) => {
        if (err) {
          return reject(err);
        }

        const tableColumns = results.map((column) => column.Field);
        const filteredColumns = tableColumns.filter((column) => this[column] !== undefined);

        const values = filteredColumns.map((column) => this[column]);
        const insertQuery = `INSERT INTO envios_direcciones_destino (${filteredColumns.join(', ')}) VALUES (${filteredColumns.map(() => '?').join(', ')})`;

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

module.exports = EnviosDireccionesDestino;
