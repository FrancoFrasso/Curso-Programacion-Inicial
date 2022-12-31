var express = require('express');
var router = express.Router();
var nodemailer = require('nodemailer');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('FORMULARIODECONTACTO');
});

router.post('/', async (req, res, next) => {

    console.log(req.body)
  
    var Nombres = req.body.Nombres;
    var cp = req.body.cp;
    var ciudad = req.body.ciudad;
    var provincia = req.body.provincia;
    var mail = req.body.mail;
    var mensaje = req.body.mensaje;
    var numero = req.body.numero;
  
  
    var obj = {
      to: 'franco_frasso@hotmail.com',
      subject: 'contacto desde maquetado',
      html: Nombres + " se contacto con nosotros y su email es " + mail + " su numero es "+ numero + " vive en " + provincia +" - " + ciudad + " CP: " + cp + " hizo el siguiente comentario " +" "+ mensaje +" - "
    }
  
    var transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
    
        })
  
  
  
  var info = await transporter.sendMail(obj);
  
  res.render('FORMULARIODECONTACTO', {
    message: 'Mensaje enviado correctamente',
  });
  
    });
  

module.exports = router;
