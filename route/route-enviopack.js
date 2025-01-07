const express=require("express");   
const enviospack=express.Router();
const Enviospack=require("../controller/enviospack/clase-enviospack")
const enviospackDestinatario=require("../controller/enviospack/clase-enviospack_destinario")
const enviospackRemitente=require("../controller/enviospack/clase-enviospack_remitente")
const validateToken = require('../middleware/token'); //




const validateData=require("../middleware/middleware")


enviospack.post("/enviospack",(req,res)=>{
    const data=req.body;

    const enviosPack= new Enviospack(
       
        data.data.did,
        data.data.fecha,
      
   
        data.data.observacion,
        data.data.condventa,

        data.quien,
        data.idempresa
    )

    console.log(enviosPack)

    enviosPack.insert();
    res.status(200).send({ message: 'Registro insertado correctamente en enviospack.' });
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

enviospack.post("/flujoenviospack",validateToken, async(req,res)=>{

    try {
        const data= req.body;
        const enviosPack= new Enviospack(
           
            data.data.did,
            data.data.fecha,
          
       
            data.data.observacion,
            data.data.condventa,
    
            data.quien,
            data.idempresa
        )
    
        console.log(enviosPack)
    
       const resultado= await enviosPack.insert();
       const insertId=resultado.insertId;
       console.log( "este es el insert id : ",insertId)
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
    
    
    
    
        res.status(200).send({ message: 'Registro insertado correctamente en enviospack.' });
        
    } catch (error) {console.error("Error durante la inserción:", error);
        res.status(500).send({ message: 'Hubo un error al procesar el registro.' });
        
    }

})


module.exports = enviospack;
