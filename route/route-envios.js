const express = require('express');
const router = express.Router();
const EnviosLogisticaInversa = require('../clase-envios_logisticainversa');  // Importa la clase de logística inversa
const EnviosObservaciones = require('../clase-envios_observaciones');  // Importa la nueva clase de observaciones
const EnviosDireccionesDestino = require("../clase-envios_direcciones_destino");
const EnviosDireccionesRemitente = require('../clase-envios_remitente');
const EnviosCobranza = require('../Clase-envios_cobranza');
const Envios = require ("../clase-envios");
const EnviosFlex= require("../clase-enviosflex");

const validateData= require('./middleware');
const dbConfigs = [
    { host: "localhost", port: 5432, database: "logisticaa", user: "logisticaA", password: "logisticaa" },
    { host: "localhost", port: 5432, database: "logisticab", user: "user_b", password: "password_b" },
    { host: "localhost", port: 5432, database: "logisticac", user: "user_c", password: "password_c" },
    { host: "localhost", port: 5432, database: "logisticad", user: "user_d", password: "password_d" },
];

// Middleware para seleccionar la base de datos según la posición de `idbd` en el cuerpo
function dbSelector(req, res, next) {
    const { idbd } = req.body; 
    console.log(dbConfigs[0]) // Extraemos el idbd del cuerpo de la solicitud

    // Verificamos que el idbd sea válido
    if (idbd === undefined || idbd < 0 || idbd >= dbConfigs.length) {
        return res.status(400).json({ message: "iddb no válido" });
    }

    // Asignamos la configuración de la base de datos a req.dbConfig
    req.dbConfig = dbConfigs[idbd];

    next();
}


router.use(dbSelector);



// Ruta para insertar datos en EnviosLogisticaInversa
router.post('/enviosLogisticaInversa', (req, res) => {
    const { didEnvio, didCampoLogistica, valor, quien ,idbd} = req.body;

    const logisticaInversa = new EnviosLogisticaInversa(
        didEnvio, 
        didCampoLogistica, 
        valor, 
        quien,idbd);

        console.log(logisticaInversa);
        

    logisticaInversa.insert();

    res.status(200).send({ message: 'Registro insertado correctamente en enviosLogisticaInversa.' });
});

// Ruta para insertar datos en EnviosObservaciones
router.post('/enviosObservaciones', (req, res) => {
    const { didEnvio, observacion, quien, desde,idbd } = req.body;

    // Si no se proporciona una observación, se usa la default
    const observacionDefault = observacion || "efectivamente la observacion default de light data";

    const observaciones = new EnviosObservaciones(didEnvio, observacionDefault, quien, desde,idbd);

    observaciones.insert();

    res.status(200).send({ message: 'Observación guardada correctamente.' });
});
router.post('/insertar-direccion', (req, res) => {
    const data = req.body;
  
    
    console.log("IDBD recibido:", data.idbd);  // Verificamos si está llegando el valor de idbd

    if (!data.idbd) {
        return res.status(400).json({ message: "Base de datos no seleccionada" });
    }

    // Crear la instancia de la clase con los datos recibidos
    const direccionDestino = new EnviosDireccionesDestino(
        data.did,
        data.didEnvio,
        data.calle,
        data.numero,
        data.address_line || `${data.calle} ${data.numero}`,
        data.cp,
        data.localidad,
        data.provincia,
        data.pais || "Argentina",
        data.latitud,
        data.longitud,
        data.quien,
     
        data.idbd
    );


    // Insertar los datos en la base de datos
    direccionDestino.insert();

    // Responder al cliente
    res.status(200).json({ message: "Registro insertado correctamente" });
});

router.post('/insertar-direccion-remitente', (req, res) => {
    const data = req.body;
    console.log(data)

    // Crear la instancia de la clase con los datos recibidos
    const direccionRemitente = new EnviosDireccionesRemitente(
        data.did, 
        data.didEnvio, 
        data.calle, 
        data.numero, 
        data.calle + data.numero, 
        data.cp, 
        data.localidad, 
        data.provincia, 
        data.pais || "Argentina", 
        data.latitud, 
        data.longitud, 
        data.obs || 'observaciones light data', 
        data.quien,
        data.idbd
    );
    console.log(direccionRemitente)

    // Insertar los datos en la base de datos
    direccionRemitente.insert();

    // Responder al cliente
    res.status(200).json({ message: "Datos del remitente guardados correctamente" });
});
router.post('/insertar-cobranza', (req, res) => {
    const data = req.body;

    console.log("IDBD recibido:", data.idbd);  // Verificamos si está llegando el valor de idbd

    if (!data.idbd) {
        return res.status(400).json({ message: "Base de datos no seleccionada" });
    }

    // Crear la instancia de la clase EnviosCobranza con los datos recibidos
    const cobranza = new EnviosCobranza(
        null,  // ID autogenerado en la base de datos
        data.didEnvio,
        data.didCampoCobranza,
        data.valor,
        data.quien,
      null,
      null,
      null,
        data.idbd  // Pasamos el idbd para que se use en la conexión
    );
    console.log(cobranza)

    // Insertar los datos en la base de datos
    cobranza.insert()
        .then(() => res.status(200).json({ message: "Registro de cobranza insertado correctamente" }))
        .catch((err) => res.status(500).json({ message: err.message }));
});

router.post('/insertar-envio',dbSelector, async (req, res) => {
    try {
        const data = req.body;

        // Imprime el cuerpo recibido para depuración
        console.log("Datos recibidos:", data);

        // Crea una instancia de la clase Envios usando las propiedades del JSON
        const envio = new Envios(
            data.did, data.didDeposito, data.gtoken, data.flex, data.turbo, data.exterior, data.autofecha, 
            data.fecha_inicio, data.fechaunix, data.lote, data.ml_shipment_id, 
            data.ml_vendedor_id, data.ml_venta_id, data.ml_pack_id, data.ml_qr_seguridad, data.didCliente, 
            data.didCuenta, data.didServicio, data.didSucursalDistribucion, 
            data.peso, data.volumen, data.bultos, data.valor_declarado, 
            data.monto_total_a_cobrar, data.tracking_method, data.tracking_number, data.fecha_venta, 
            data.destination_receiver_name, data.destination_receiver_phone, 
            data.destination_receiver_email, data.destination_comments, 
            data.delivery_preference, data.quien, data.elim,data.idbd
        );
       

        // Inserta el registro en la base de datos
        const resultado = await envio.insert();

        // Extrae el ID de inserción si está disponible
        const insertId = resultado.insertId;

        console.log("Registro insertado con ID:", insertId);

        // Responde con éxito
        res.status(200).json({
            message: "Registro de envío insertado correctamente",
            insertId: insertId
        });
    } catch (error) {
        console.error("Error al insertar el envío:", error);

        // Responde con error
        res.status(500).json({
            message: "Error al insertar el registro de envío",
            error: error.message
        });
    }
});

router.post('/insertar-envioflex', async (req, res) => {
    try {
        const data = req.body;

        // Imprime el cuerpo recibido para depuración

        console.log("Datos recibidos:", data);

        // Crea una instancia de la clase Envios usando las propiedades del JSON
        const envio = new EnviosFlex(
             data.ml_shipment_id, 
            data.ml_vendedor_id,  data.ml_qr_seguridad, data.didCliente, 
            data.didCuenta, data.elim,data.idbd
        );
        console.log(envio);
        
       

        // Inserta el registro en la base de datos
        const resultado = await envio.insert();

        // Extrae el ID de inserción si está disponible
        const insertId = resultado.insertId;

        console.log("Registro insertado con ID:", insertId);

        // Responde con éxito
        res.status(200).json({
            message: "Registro de envío insertado correctamente",
            insertId: insertId
        });
    } catch (error) {
        console.error("Error al insertar el envío:", error);

        // Responde con error
        res.status(500).json({
            message: "Error al insertar el registro de envío",
            error: error.message
        });
    }
});

router.post("/cargardatos",dbSelector,async(req,res)=>{
    const data = req.body;
    console.log(typeof validateData); // Debería imprimir "function"

    try {
        const email = data.destination_receiver_email;
        delete data.destination_receiver_email;
       validateData(data);
        console.log("Todos los campos son válidos.");
        if (email) {
            data.destination_receiver_email = email;
        }
    } catch (error) {
        console.error("Error al validar los datos:", error.message);
        return res.status(400).json({
            message: "Error en la validación de los datos",
            error: error.message,
        });
    }

    
    
    
    if (data.flex===1){
    
    
        const envioflex = new EnviosFlex(
            data.ml_shipment_id, 
           data.ml_vendedor_id,  data.ml_qr_seguridad, data.didCliente, 
           data.didCuenta, data.elim,data.idbd
       );
      
    
       // Inserta el registro en la base de datos
        resultado = await envioflex.insert();
    }
    else{
    
    
    
        const envio = new Envios(
            data.did, data.didDeposito, data.gtoken, data.flex, data.turbo, data.exterior, data.autofecha, 
            data.fecha_inicio, data.fechaunix, data.lote, data.ml_shipment_id, 
            data.ml_vendedor_id, data.ml_venta_id, data.ml_pack_id, data.ml_qr_seguridad, data.didCliente, 
            data.didCuenta, data.didServicio, data.didSucursalDistribucion, 
            data.peso, data.volumen, data.bultos, data.valor_declarado, 
            data.monto_total_a_cobrar, data.tracking_method, data.tracking_number, data.fecha_venta, 
            data.destination_receiver_name, data.destination_receiver_phone, 
            data.destination_receiver_email, data.destination_comments, 
            data.delivery_preference, data.quien, data.elim,data.idbd
        );
       
    
        // Inserta el registro en la base de datos
        const resultado = await envio.insert();
    
        // Extrae el ID de inserción si está disponible
        const insertId = resultado.insertId;
    
        console.log("Registro insertado con ID:", insertId);
        
           // Extrae el ID de inserción si está disponible
           
        
        
          
        
            if (data.envioscobranza){
        
                const cobranza = new EnviosCobranza(
                    null,  // ID se autogenera en la base de datos
                    insertId,
                    data.envioscobranza.didCampoCobranza,
                    data.envioscobranza.valor,
                    data.envioscobranza.quien,data.idbd
                );
                cobranza.insert();
        
            }
        
        
        
        // Insertar los datos en la base de datos
        
        if (data.enviosLogisticaInversa){
        
            const logisticaInversa = new EnviosLogisticaInversa(
                insertId,
                data.enviosLogisticaInversa.didCampoLogistica, 
                data.enviosLogisticaInversa.valor,
                data.enviosLogisticaInversa.quien,data.idbd);
            
            logisticaInversa.insert();
        
        }
        
        
        
        
        
        
        
        
        
        if (data.enviosObservaciones){
        
            
            const observacionDefault =data.enviosObservaciones.observacion || "efectivamente la observacion default de light data";
                const observaciones = new EnviosObservaciones
                (     insertId,
                     observacionDefault, 
                     data.enviosObservaciones.quien, 
                     data.enviosObservaciones.desde,data.idbd);
            
                observaciones.insert();
        }
        
        
        
        if (data.enviosDireccionesDestino){
        
            
            const direccionDestino = new EnviosDireccionesDestino(
                data.enviosDireccionesDestino.did,
                insertId,
                data.enviosDireccionesDestino.calle,
                data.enviosDireccionesDestino.numero,
                data.enviosDireccionesDestino.address_line || `${data.enviosDireccionesDestino.calle} ${data.enviosDireccionesDestino.numero}`,
                data.enviosDireccionesDestino.cp,
                data.enviosDireccionesDestino.localidad,
                data.enviosDireccionesDestino.provincia,
                data.enviosDireccionesDestino.pais || "Argentina",
                data.enviosDireccionesDestino.latitud,
                data.enviosDireccionesDestino.longitud,
             
               
            
                data.enviosDireccionesDestino.quien,data.idbd
                
            );
            
            // Insertar los datos en la base de datos
            direccionDestino.insert();
        }
            
        
        if(data.enviosDireccionesRemitente){
        
        
            const direccionRemitente = new EnviosDireccionesRemitente(
                data.enviosDireccionesRemitente.did, 
            insertId,
                data.enviosDireccionesRemitente.calle, 
                data.enviosDireccionesRemitente.numero, 
                data.enviosDireccionesRemitente.calle + data.enviosDireccionesRemitente.numero, 
                data.enviosDireccionesRemitente.cp, 
                data.enviosDireccionesRemitente.localidad, 
                data.enviosDireccionesRemitente.provincia, 
                data.enviosDireccionesRemitente.pais || "Argentina", 
                data.enviosDireccionesRemitente.latitud, 
                data.enviosDireccionesRemitente.longitud, 
                data.enviosDireccionesRemitente.obs || 'observaciones light data', 
                data.enviosDireccionesRemitente.quien,data.idbd
            );
            
            // Insertar los datos en la base de datos
            direccionRemitente.insert();
        
        }    
    }
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    res.status(200).json({
        message: "Registro de envío insertado correctamente",
    //console.log("Datos recibidos:", data);
 
        
    });});





module.exports = router;
