const express = require('express');
const router = express.Router();
const EnviosLogisticaInversa = require('../controller/envios/clase-envios_logisticainversa');  // Importa la clase de logística inversa
const EnviosObservaciones = require('../controller/envios/clase-envios_observaciones');  // Importa la nueva clase de observaciones
const EnviosDireccionesDestino = require("../controller/envios/clase-envios_direcciones_destino");
const EnviosDireccionesRemitente = require('../controller/envios/clase-envios_remitente');
const EnviosCobranza = require('../controller/envios/Clase-envios_cobranza');
const Envios = require ("../controller/envios/clase-envios");
const EnviosFlex= require("../controller/envios/clase-enviosflex");
const EnviosItems= require("../controller/envios/clase-envios_items")
const { redisClient,getConnection } = require('../dbconfig');

const validateData= require('../middleware/middleware');

const validarCamposRequeridos = require("../middleware/json")

const camposRequeridos = [
    "idEmpresa",
    "flex",
    "didCliente",
    "didCuenta",
    "quien",
    "elim",





    'enviosDireccionesDestino',
    'enviosDireccionesDestino.numero',
    'enviosDireccionesDestino.calle',
    'enviosDireccionesDestino.cp',
    'enviosDireccionesDestino.localidad'
    
];








router.post("/cargardatos",validarCamposRequeridos(camposRequeridos), async (req, res) => {
    try {
        const data = req.body;

        // Validar que los campos requeridos estén presentes
        if (!data.enviosDireccionesDestino || 
            !data.enviosDireccionesDestino.calle || 
            !data.enviosDireccionesDestino.numero || 
            !data.enviosDireccionesDestino.cp || 
            !data.enviosDireccionesDestino.localidad) {
            
            return res.status(400).json({
                message: "Faltan campos obligatorios en la dirección de destino"
            });
        }

        

        // Ahora que se ha validado la presencia de los campos obligatorios, continúa con la lógica de inserción
        const email = data.destination_receiver_email;
        delete data.destination_receiver_email;
        validateData(data);
        console.log("Todos los campos son válidos.");
        if (email) {
            data.destination_receiver_email = email;
        }

        if (data.flex === 1) {
            const envioflex = new EnviosFlex(
                data.did,
                data.ml_shipment_id,
                data.ml_vendedor_id, data.ml_qr_seguridad, data.didCliente,
                data.didCuenta, data.elim, data.idEmpresa
            );

            const resultado = await envioflex.insert();
            const insertId = resultado.did;
            console.log("Registro insertado con ID:", insertId);

            res.status(200).json({
                estado: true,
                didEnvio: insertId
            });
        } else {
            const envio = new Envios(data);
            const resultado = await envio.insert();
            const insertId = resultado.did;

            console.log("Registro insertado con did:", insertId);

            // Validación y creación de EnviosCobranza
            if (data.envioscobranza) {
                const cobranza = new EnviosCobranza(
                    insertId,
                    data.envioscobranza.didCampoCobranza,
                    data.envioscobranza.valor,
                    data.envioscobranza.quien,
                    0,
                    data.idEmpresa
                );
                cobranza.insert();
            }

            // Validación y creación de EnviosLogisticaInversa
            if (data.enviosLogisticaInversa) {
                const logisticaInversa = new EnviosLogisticaInversa(
                    insertId,
                    data.enviosLogisticaInversa.didCampoLogistica,
                    data.enviosLogisticaInversa.valor,
                    data.enviosLogisticaInversa.quien, data.idEmpresa
                );
                logisticaInversa.insert();
            }

            // Validación y creación de EnviosObservaciones
            if (data.enviosObservaciones) {
                const observacionDefault = data.enviosObservaciones.observacion || "efectivamente la observacion default de light data";
                const observaciones = new EnviosObservaciones(
                    insertId,
                    observacionDefault,
                    data.enviosObservaciones.quien,
                    data.enviosObservaciones.desde, data.idEmpresa
                );
                observaciones.insert();
            }

            // Validación y creación de EnviosDireccionesDestino
            if (data.enviosDireccionesDestino) {
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
                    data.enviosDireccionesDestino.quien,
                    data.idEmpresa,
                    data.enviosDireccionesDestino.destination_comments,
                    data.enviosDireccionesDestino.delivery_preference,
                    data.enviosDireccionesDestino.conHorario,
                    data.enviosDireccionesDestino.prioridad
                );
                direccionDestino.insert();
            }

            // Validación y creación de EnviosDireccionesRemitente
            if (data.enviosDireccionesRemitente) {
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
                    data.enviosDireccionesRemitente.quien, data.idEmpresa
                );
                direccionRemitente.insert();
            }

            if(data.enviosItems){
                const enviosItems= new EnviosItems(
                    insertId,
                    data.enviosItems.codigo,
                    data.imagen,
                    data.enviosItems.descripcion,
                    data.enviosItems.ml_id,
                    data.enviosItems.dimensions,
                    data.enviosItems.cantidad,
                    data.enviosItems.variacion,
                    data.enviosItems.seller_sku,
                    data.enviosItems.descargado,
                    data.enviosItems.autofecha,
                    data.enviosItems.superado,
                    data.enviosItems.elim,
                    data.idEmpresa
                )

            }

            res.status(200).json({
                estado: true,
                didEnvio: insertId
            });
        }
    } catch (error) {
        console.error("Error durante la inserción:", error);
        return res.status(500).send({
            estado: false,
            error: -1
        });
    }
});


router.post("/enviosMLredis", async (req, res) => {
    const data = req.body;
    const connection = await getConnection(data.idEmpresa);

    try {
        await connection.beginTransaction();

      

        const email = data.destination_receiver_email;
        delete data.destination_receiver_email;
       // validateData(data);

        if (email) {
            data.destination_receiver_email = email;
        }

        const newDid = await redisClient.incr("paquete:did");

        const redisKeyEstadosEnvios = `estadosEnviosML`;
       // Asignar el valor de subKey
const subKey = `${data.ml_vendedor_id}-${data.ml_shipment_id}`;

// Obtener la fecha actual y restar 3 horas
let fechaCreacion = new Date();
fechaCreacion.setHours(fechaCreacion.getHours() - 3);

// Formatear la fecha y hora como 'YYYY-MM-DD HH:MM:SS'
let fechaCreacionModificada = fechaCreacion.toISOString().slice(0, 19).replace('T', ' ');

// Crear el objeto estadoEnvio
const estadoEnvio = {
    didEnvio: data.did || newDid,
    didEmpresa: data.idEmpresa,
    estado: data.estado || 1,
    fechaCreacion: fechaCreacionModificada, // Fecha con 3 horas menos
    fechaActualizacion: ""
};

// Guardar el estado de envío en la clave del hash en Redis usando hSet
await redisClient.hSet(redisKeyEstadosEnvios, subKey, JSON.stringify(estadoEnvio));


        // Comentado: Guardar datos en MongoDB
        /*
        const envio = new Envios(data, data.did === undefined || data.did === null ? newDid : data.did);
        const respuesta = await envio.createQuerys();
        const insertedId = await insertarEnMongo(idcola, data.idEmpresa, 1, "Alta paquete", respuesta);
        await actualizarColaExterna(data.idEmpresa, idcola, insertedId);
        */

        // Procesamiento principal
        if (data.flex === 1) {
            const envioflex = new EnviosFlex(
                data.did || newDid, 
                data.ml_shipment_id,
                data.ml_vendedor_id, 
                data.ml_qr_seguridad, 
                data.didCliente,
                data.didCuenta, 
                data.elim, 
                data.idEmpresa
            );
            await envioflex.insert();
            await connection.commit();
        } else {
            // Comentado: Guardar datos en MongoDB
            /*
            if (data.envioscobranza) {
                // Código relacionado con envioscobranza...
            }
            if (data.enviosDireccionesRemitente) {
                // Código relacionado con enviosDireccionesRemitente...
            }
            if (data.enviosLogisticaInversa) {
                // Código relacionado con enviosLogisticaInversa...
            }
            if (data.enviosObservaciones) {
                // Código relacionado con enviosObservaciones...
            }
            if (data.enviosDireccionesDestino) {
                // Código relacionado con enviosDireccionesDestino...
            }
            if (data.enviosItems) {
                // Código relacionado con enviosItems...
            }
            */

            await connection.commit();
        }

        return res.status(200).json({
            estado: true,
            didEnvio: newDid 
        });

    } catch (error) {
        console.error("Error durante la inserción:", error);
        await connection.rollback();

        return res.status(500).json({
            estado: false,
            error: -1,
            message: error
            
        });
    } finally {
        connection.end();
    }
});



module.exports = router;
