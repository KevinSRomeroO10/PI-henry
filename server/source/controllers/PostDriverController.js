const { Driver, Team } = require('../models/Index');

const axios = require('axios')

const PostDriverController = async (req, res) => {

  const { nombre, apellido, descripcion, imagen, nacionalidad, fechaNacimiento, teams } = req.body;

  try {

    const apiResponse = await axios.get('http://localhost:5000/drivers')
    const apiDrivers = apiResponse.data
    let lastIdApiDrivers

    if (apiDrivers && apiDrivers.length > 0) {
      const sortedDrivers = apiDrivers.sort((a, b) => b.id - a.id);
      lastIdApiDrivers = sortedDrivers[0].id;
    }

    let lastId = 0

    await Driver.max('id', { raw: true })
    .then(maxId => {
      if(maxId > 0){
        lastId = maxId+2
      }
      else{
        lastId = lastIdApiDrivers+1
      }
    })
    .catch(err => {
      errorLastError = err
    });
    
    const newDriver = await Driver.create({
        id: lastId,
        nombre,
        apellido,
        descripcion,
        imagen,
        nacionalidad,
        fechaNacimiento
      }
    );

    if (teams && teams.length > 0) {
      for (const teamName of teams) {
        let team = await Team.findOne({ where: { nombre: teamName } });
        if (!team) {
          team = await Team.create({ nombre: teamName });
        }
        await newDriver.addTeam(team);
      }
    }

    res.status(201).json({ mensaje: 'Conductor creado exitosamente.'});
  } 
  catch (error) {
    res.status(500).json({ 
      mensaje: 'Error interno del servidor al crear el conductor.', error: error.message});
  }
};

module.exports = { PostDriverController };

// para registar mediante esta API, crea los teams si no existen
// {
//   "nombre": "asdfasdf",
//   "apellido": "romero",
//   "descripcion": "No se del conductor",
//   "imagen": "URL de la imagen del conductor",
//   "nacionalidad": "Nacionalidad del conductor",
//   "fechaNacimiento": "1998-12-10",
//   "teams": ["equipo1", "equipo2", "equipo3"]
// }

