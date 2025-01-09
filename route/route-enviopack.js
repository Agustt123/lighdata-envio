const express=require("express");   
const enviospack=express.Router();
const Enviospack=require("../controller/enviospack/clase-enviospack")
const enviospackDestinatario=require("../controller/enviospack/clase-enviospack_destinario")
const enviospackRemitente=require("../controller/enviospack/clase-enviospack_remitente")
const validateToken = require('../middleware/token'); //
const { redisClient } = require('../dbconfig');




const validateData=require("../middleware/middleware")


enviospack.post('/enviospack', async (req, res) => {
    const data = req.body;
  
    try {
     
        const empresasDataJson = await redisClient.get('empresasData');
        const empresasDB = JSON.parse(empresasDataJson);  

      
        const empresaId = data.idempresa.toString();
 
        const empresa = empresasDB[empresaId];  

        if (!empresa) {
            return res.status(404).send({ message: 'Empresa no encontrada.' });
        }

        console.log("Empresa encontrada:", empresa);

        // Continuar con el resto de tu lógica
        const enviosPack = new Enviospack(
            data.data.did,
            data.data.fecha,
            data.data.observacion,
            data.data.condventa,
            data.data.quien,
            data.idempresa
        );

        await enviosPack.insert();
        res.status(200).send({ message: 'Registro insertado correctamente en enviospack.' });

    } catch (error) {
        console.error("Error al insertar en enviospack:", error);
        res.status(500).send({ message: 'Error al insertar el registro.' });
    }
});

  


enviospack.post("/enviospackdestinatario",(req,res)=>{
    const data=req.body;
    console.log(data)
    const enviospackdestinatario= new enviospackDestinatario(
        data.data.destinatario.destinatario,
        data.data.destinatario.cuil,
        data.data.destinatario.telefono,
        data.data.destinatario.email,
        data.data.destinatario.provincia,
        data.data.destinatario.localidad,
        data.data.destinatario.domicilio,
        data.data.destinatario.cp,
        data.data.destinatario.observacion,
        data.idempresa

        
    )

    enviospackdestinatario.insert();
    res.status(200).send({ message: 'Registro insertado correctamente en enviospack.' });
})

enviospack.post("/enviospackremitente",validateToken, (req,res)=>{
    const data=req.body;
    console.log(data)
    const enviospackremitente= new enviospackRemitente(
        
        data.data.remitente.remitente,
        data.data.remitente.telefono,
        data.data.remitente.email,
        data.data.remitente.provincia,
        data.data.remitente.localidad,
        data.data.remitente.domicilio,
        data.data.remitente.cp,
        data.idempresa
        
    )
    enviospackremitente.insert()
    res.status(200).send({ message: 'Registro insertado correctamente en enviospackremi.' });
})

enviospack.post("/flujoenviospack", async(req,res)=>{
    const data= req.body;

    try {
        const empresasDataJson = await redisClient.get('empresasData');
        const empresasDB = JSON.parse(empresasDataJson);  // Parsear el JSON

        // Verificar si la empresa con id 4 existe
        const empresaId = data.idempresa.toString();
  // El ID de la empresa que quieres buscar
        const empresa = empresasDB[empresaId];  // Acceder directamente a la empresa con el id

        if (!empresa) {
            return res.status(404).send({   success: false,
                message: 'Hubo un error al procesar el registro.',
                error: -1 });
        }

        console.log("Empresa encontrada:", empresa);
        const enviosPack= new Enviospack(
           
            data.data.did,
            data.data.fecha,
          
       
            data.data.observacion,
            data.data.condventa,
    
            data.quien,
            data.idempresa
        )
        const resultado= await enviosPack.insert();
        const insertId=resultado.did;
        console.log( "este es el insert id : ",insertId)
    
        console.log(enviosPack)

   
        

        if(data.data.destinatario){

            const enviospackdestinatario= new enviospackDestinatario(
             insertId,
             data.data.destinatario.destinatario,
             data.data.destinatario.cuil,
             data.data.destinatario.telefono,
             data.data.destinatario.email,
             data.data.destinatario.provincia,
             data.data.destinatario.localidad,
             data.data.destinatario.domicilio,
             data.data.destinatario.cp,
             data.data.destinatario.observacion,
             data.idempresa
         
             
         )
     
         enviospackdestinatario.insert();
        }

     
        
    

    if (data.data.remitente){
        

        const enviospackremitente= new enviospackRemitente(
        
            insertId,    
            data.data.remitente.remitente,
            data.data.remitente.telefono,
            data.data.remitente.email,
            data.data.remitente.provincia,
            data.data.remitente.localidad,
            data.data.remitente.domicilio,
            data.data.remitente.cp,
            data.idempresa
        )
        enviospackremitente.insert()
    }
    
    
    
    
    
        return res.status(200).send({ 
            estado:true,
            message: 'Registro de envío insertado correctamente',
            didEnvio: insertId



         });
        
    } catch (error) {console.error("Error durante la inserción:", error);
      return   res.status(500).send({ 
        estado: false,
        message: 'Hubo un error al procesar el registro.',
        error: -1


      });
        
    }

})


module.exports = enviospack;
