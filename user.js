import {db} from '../db.js'


// Middleware para obtener el usuario actual
export const setCurrentUser = (req, res, next) => {
  // Suponiendo que has almacenado el ID del usuario en la sesión bajo la clave 'userId'
  const userId = req.session.userId;

  if (userId) {
    // Aquí puedes realizar una consulta a la base de datos para obtener los detalles completos del usuario si es necesario
    const getUserQuery = "SELECT * FROM usuarios WHERE `id` = ?";
    
    db.query(getUserQuery, [userId], (error, results) => {
      if (error) {
        console.error("Error al obtener el usuario actual:", error);
        return res.status(500).json({ error: "Error interno del servidor." });
      }

      const user = results[0];

      if (!user) {
        return res.status(404).json({ error: "Usuario no encontrado." });
      }

      req.currentUser = user; // Asigna el objeto de usuario a req.currentUser
      console.log("Usuario actual configurado en req.currentUser:", user);
      next();
    });
  } else {
    // Si no hay usuario en la sesión, pasa al siguiente middleware o función
    next();
  }
};


//GET para consultar y leer a los usuarios
export const getUsers = (_, res) => {
  const getQuery = "SELECT `id`,`Nombre`, `Genero`, `FechaNacimiento`, `Email` FROM usuarios";

  db.query(getQuery, (error, data) => {
    if (error) {
      console.error("Error al recuperar usuarios:", error);
      return res.status(500).json({ error: "Error interno del servidor." }); //500 Error interno de servidor.
    }

    return res.status(200).json(data); //200 Indica que la solicitud ha tenido éxito.
  });
};


//POST para crear el usuario
export const postUser = (req, res) => {

  const postQuery = "INSERT INTO usuarios(`Nombre`, `Genero`, `FechaNacimiento`, `Email`, `Contraseña`) VALUES(?, ?, ?, ?, ?)";

  const values = [
    req.body.Nombre,
    req.body.Genero,
    req.body.FechaNacimiento,
    req.body.Email,
    req.body.Contraseña,
  ];

  db.query(postQuery, values, (error) => {
    if (error) {
      console.error("Error al insertar el usuario:", error);
      return res.status(500).json({ error: "Error interno del servidor." }); //500 Error interno de servidor.
    }

    return res.status(201).json("Usuario creado con éxito."); //201 indica que la solicitud ha tenido éxito y ha llevado a la creación de un recurso.
  });
};


export const buscarEmail = (req, res) => {
  const buscarEmailQuery = "SELECT COUNT(*) as count FROM usuarios WHERE `Email` = ?"; //La COUNT(*) nos permite contar el número de filas en una tabla.
    
    const values = [
      req.body.Email,
    ];
  
    db.query(buscarEmailQuery, values, (error, results) => {
      if (error) {
        console.error("Error al verificar el correo:", error);
        return res.status(500).json({ error: "Error interno del servidor." }); //500 Error interno de servidor.
      }
  
      const userCount = results[0].count;
  
      if (userCount > 0) {
        return res.status(200).json({ message: "El correo ya está registrado." }); //200 Indica que la solicitud ha tenido éxito.
      }else {
        return res.status(200).json({ message: "El correo no está registrado." }); //200 Indica que la solicitud ha tenido éxito.
      }
    });
  };  


//Update para editar y actualizar a los usuarios, SQL de actualización está destinada a modificar los valores de varios campos en la tabla
export const putUser = (req, res) => {
  const updateQuery = "UPDATE usuarios SET `Nombre` = ?, `Genero` = ?, `FechaNacimiento` = ?, `Email` = ?, `Contraseña` = ? WHERE `id` = ?";

  const values = [
    req.body.Nombre,
    req.body.Genero,
    req.body.FechaNacimiento,
    req.body.Email,
    req.body.Contraseña,
  ];

  db.query(updateQuery, [...values, req.params.Id], (error, results) => {
    if (error) {
      console.error("Error al actualizar el usuario:", error);
      return res.status(500).json({ error: "Error interno del servidor." }); //500 Error interno de servidor.
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "Usuario no encontrado." }); //404 No se encontro.
    }

    return res.status(200).json("Usuario editado con éxito."); //200 Indica que la solicitud ha tenido éxito.
  });
};


//DELETE para eliminar.
export const deleteUser = (req, res) => {
  const deleteQuery = "DELETE FROM usuarios WHERE `id` = ?";

  db.query(deleteQuery, [req.params.Id], (error, results) => {
    if (error) {
      console.error("Error al eliminar el usuario:", error);
      return res.status(500).json({ error: "Error interno del servidor." }); //500 Error interno de servidor.
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "Usuario no encontrado." }); //404 No se encontro.
    }

    return res.status(200).json("Usuario borrado con éxito."); //200 Indica que la solicitud ha tenido éxito.
  });
};


//Para buscar y validar el inicio de sesion del usuario
export const loginUser = (req, res) => {
  const selectQuery = "SELECT * FROM usuarios WHERE `Email` = ?";

  const values = [
    req.body.Email,
  ];

  db.query(selectQuery, values, (error, results) => {
    if (error) {
      console.error("Error al recuperar el usuario:", error);
      return res.status(500).json({ error: "Error interno del servidor." }); //500 Error interno de servidor.
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Usuario no encontrado." }); //404 No se encontro.
    }

    const user = results[0];

    if (user.Contraseña !== req.body.Contraseña) {
      return res.status(401).json({ error: "Credenciales inválidas." }); //401 carece de credenciales válidas de autenticación para el recurso solicitado.
    }

    req.session.userId = user.id;
    req.session.userNombre = user.Nombre;

    return res.status(200).json({userId: user.id, userNombre: user.Nombre}); //200 Indica que la solicitud ha tenido éxito.
  });
};