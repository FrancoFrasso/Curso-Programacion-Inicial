var express = require('express');
var router = express.Router();
var novedadesModel = require ('../../models/novedadesModel');
var util = require('util');
var novedadesModel = require ('../../models/novedadesModel');
var cloudinary = require ('cloudinary').v2;
const uploader = util.promisify(cloudinary.uploader.upload);
const destroy = util.promisify(cloudinary.uploader.destroy);


router.get('/', async function (req, res, next) {

 
var novedades

if (req.query.q === undefined) {
  novedades = await novedadesModel.getNovedades();
} else {
  novedades = await novedadesModel.buscarNovedades(req.query.q);
}




novedades = novedades.map ( novedad => {
  if (novedad.img_id){
    const imagen = cloudinary.image(novedad.img_id,{
      width: 150,
      height:150,
      crop: 'fill'
    });
    return {
      ...novedad,
      imagen
    }
  } else {
    return {
      ...novedad,
      imagen: ''
    }
  }
});

  res.render('admin/novedades', {
    layout: 'admin/layout',
    usuario : req.session.nombre,
    novedades,
    is_search: req.query.q !==undefined,
    q: req.query.q
  });
});

router.get ('/eliminar/:id', async (req, res, next) => {
  const id = req.params.id;
  
  await novedadesModel.deleteNovedadesById(id);
  res.redirect('/admin/novedades')
});

router.get ('/agregar', async (req, res, next) => {
  res.render ('admin/agregar', {
    layout: 'admin/layout'
  })
});

router.post ('/agregar', async (req, res, next)=> {
  try {
    var img_id = '';

    if ( req.files && Object.keys(req.files).length > 0) {
      imagen = req.files.imagen;
      img_id = (await uploader (imagen.tempFilePath)).public_id;
    }




    if(req.body.titulo != "" && req.body.subtitulo != "" && req.body.cuerpo != ""){
      await novedadesModel.insertNovedad( 
    {
      ...req.body,
  img_id
    });
      res.redirect('/admin/novedades')
    } else {
      red.render ('admin/agregar',{
        layout: 'admin/layout',
        error: true,
        message: 'Todos los campos son requeridos'
      })
    }
  } catch (error) {
    console.log (error)
    res.render ('admin/agregar',{
      layout: 'admin/layout',
      error: true,
      message: 'No se pudo cargar la novedad'
    })
  }
})

router.get('/modificar/:id', async (req,res,next) => {
  var id = req.params.id;
  var novedad = await novedadesModel.getNovedadById (id);
  res.render ('admin/modificar', {
    layout: 'admin/layout',
    novedad
  });
});

router.post ('/modificar', async (req, res, next) => {
  try {
    let img_id = req.body.img_oringinal;
    let borrar_img_vieja = false;

    if (req.body.img_delete === "1") {
      img_id = null;
      borrar_img_vieja = true;
    } else {
      if (req.files && Object.keys(req.files).length > 0){
        imagen = req.files.imagen;
        img_id = (await uploader (imagen.tempFilePath)).public_id;
        borrar_img_vieja = true;
      }
    }

    if (borrar_img_vieja && req.body.img_oringinal){
      await (destroy(req.body.img_oringinal));
    }


    var obj = {
      titulo: req.body.titulo,
      subtitulo: req.body.subtitulo,
      cuerpo: req.body.cuerpo,
      img_id
    }

    // console.log(obj)
    await novedadesModel.modificarNovedadById(obj, req.body.id);
    res.redirect('/admin/novedades');
  } catch (error) {
    console.log (error)
    res.render ('admin/modificar', {
      layout: 'admin/layout',
      error: true,
      message: 'No se pudo modificar la novedad'
    })
  }
});



module.exports = router;