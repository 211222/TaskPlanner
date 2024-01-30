import { db } from '../db.js';


// GET para obtener la lista de tareas de un usuario
export const getTasks = (req, res) => { // Suponiendo que tienes un middleware para obtener el usuario actual

  const selectQuery = `
    SELECT * FROM task
    WHERE usuario_id = ? ORDER BY id DESC
  `;

  const values = [
    req.body.userId,
  ];
  // Ejecuta la consulta para obtener las tareas del usuario de la base de datos
  db.query(selectQuery, values, (error, tasks) => {
    if (error) {
      console.error("Error al obtener las tareas:", error);
      return res.status(500).json({ error: "Error interno del servidor." });
    }

    req.session.userTareas = tasks;

    return res.status(200).json({ userTareas: tasks }); // Devuelve un objeto JSON con la lista de tareas
  });
};


// POST para crear una tarea
export const createTask = (req, res) => {
  const currentDate = new Date(); // Obtiene la fecha y hora actuales
const dateToday = currentDate.toISOString().split('T')[0]; // Obtiene la fecha actual en formato YYYY-MM-DD

// const taskDate = new Date(req.body.fecha_fin + 'T' + req.body.hora_fin); // Combina fecha y hora de la tarea
const taskDate = new Date(req.body.fecha_fin);
const taskDateFull = taskDate.toISOString().split('T')[0]; // Obtiene la fecha de la tarea en formato YYYY-MM-DD

let task = ""; // Inicializamos la variable task

const fin = req.body.hora_fin;
const start = req.body.hora_inicio;

// Compara la fecha actual con la fecha de la tarea y las horas de inicio y fin
if (taskDateFull > dateToday || (taskDateFull === dateToday && fin > start)) {
  console.log("tarea pendiente");
  task = "Pendiente";
} else {
  console.log("tarea atrasada");
  task = "Atrasada";
}

  // if ((taskDate == fechaSinHora && fin > start) || taskDate > fechaSinHora) {
  //   task = "Pendiente"; // Si la tarea está en el pasado, está atrasada
  // }
  // else if(taskDate < fechaSinHora) {
  //   task = "Atrasada";
  // }

  const insertQuery = `
    INSERT INTO task (usuario_id, tarea, descripcion, fecha_inicio, hora_inicio, fecha_fin, hora_fin, estatus)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    req.body.userId,
    req.body.tarea,
    req.body.descripcion,
    req.body.fecha_inicio,
    req.body.hora_inicio,
    req.body.fecha_fin,
    req.body.hora_fin,
    task,
  ];

  // Ejecuta la consulta para insertar la tarea en la base de datos
  db.query(insertQuery, values, (error, results) => {
    if (error) {
      console.error("Error al insertar la tarea:", error);
      return res.status(500).json({ error: "Error interno del servidor." });
    }
    return res.status(201).json({ message: "Tarea creada con éxito." }); // Devuelve un objeto JSON con un mensaje
  });
};


// PUT para editar una tarea
/* export const editTask = (req, res) => {
  const taskId = req.params.taskId; // Suponiendo que obtienes el ID de la tarea desde los parámetros de la ruta

  const updateQuery = `
    UPDATE task
    SET tarea = ?, descripcion = ?, fecha_inicio = ?, hora_inicio = ?, fecha_fin = ?, hora_fin = ?
    WHERE usuario_id = ? AND id = ?
  `;

  const values = [
    req.body.userId,
    req.body.tarea,
    req.body.descripcion,
    req.body.fecha_inicio,
    req.body.hora_inicio,
    req.body.fecha_fin,
    req.body.hora_fin,
    taskId,
  ];

  // Ejecuta la consulta para actualizar la tarea en la base de datos
  db.query(updateQuery, values, (error, results) => {
    if (error) {
      console.error("Error al actualizar la tarea:", error);
      return res.status(500).json({ error: "Error interno del servidor." });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "Tarea no encontrada." });
    }

    return res.status(200).json({ message: "Tarea editada con éxito." });
  });
}; */

// PUT para editar una tarea
export const editTask = (req, res) => {
  const taskId = req.params.taskId;

  const updatedTask = req.body;// Los datos actualizados de la tarea 
  const currentDate = new Date();

  if (updatedTask.estatus === "Pendiente" && new Date(updatedTask.fecha_fin) < currentDate) {
    updatedTask.estatus = "Atrasado";
  } else if (updatedTask.estatus === "Pendiente" && new Date(updatedTask.fecha_inicio) <= currentDate && new Date(updatedTask.fecha_fin) >= currentDate) {
    updatedTask.estatus = "Progreso";
  }

  if (updatedTask.estatus === "Atrasado" && new Date(updatedTask.fecha_inicio) > currentDate && new Date(updatedTask.fecha_fin) > currentDate) {
    updatedTask.estatus = "Pendiente";
  } else if (updatedTask.estatus === "Atrasado" && new Date(updatedTask.fecha_inicio) <= currentDate && new Date(updatedTask.fecha_fin) >= currentDate) {
    updatedTask.estatus = "Progreso";
  }

  if (updatedTask.estatus === "Progreso" && new Date(updatedTask.fecha_inicio) > currentDate && new Date(updatedTask.fecha_fin) > currentDate) {
    updatedTask.estatus = "Pendiente";
  } else if (updatedTask.estatus === "Progreso" && new Date(updatedTask.fecha_inicio) <= currentDate && new Date(updatedTask.fecha_fin) < currentDate) {
    updatedTask.estatus = "Atrasado";
  }
  if (updatedTask.estatus === "Completado") {
    if (currentDate > new Date(updatedTask.fecha_fin)) {
      updatedTask.estatus = "Atrasado";
    } else if (currentDate >= new Date(updatedTask.fecha_inicio) && currentDate <= new Date(updatedTask.fecha_fin)) {
      updatedTask.estatus = "Progreso";
    } else if (new Date(updatedTask.fecha_inicio) > currentDate && new Date(updatedTask.fecha_fin) > currentDate) {
      updatedTask.estatus = "Pendiente";
    }
  }

  const updateQuery = `
    UPDATE task
    SET tarea = ?, descripcion = ?, fecha_inicio = ?, hora_inicio = ?, fecha_fin = ?, hora_fin = ?, estatus = ?
    WHERE usuario_id = ? AND id = ?
  `;


  const values = [
    updatedTask.tarea,
    updatedTask.descripcion,
    updatedTask.fecha_inicio,
    updatedTask.hora_inicio,
    updatedTask.fecha_fin,
    updatedTask.hora_fin,
    updatedTask.estatus,
    req.body.userId,
    taskId,
  ];

  // Ejecuta la consulta para actualizar la tarea en la base de datos
  db.query(updateQuery, values, (error, results) => {
    if (error) {
      console.error("Error al actualizar la tarea:", error);
      return res.status(500).json({ error: "Error interno del servidor." });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "Tarea no encontrada." });
    }

    // Obtén todas las tareas del usuario desde req.session.userTareas
    const userTasks = updatedTask.estatus;

    // Comprobar el estado y la fecha actual para determinar si está atrasada o en progreso
    /* const currentDate = new Date(); */
    /* console.log(updatedTask.estatus); */

    // Actualiza el estado de las tareas en req.session.userTareas
    /*      const updatedTasks = userTasks.map(task => {
          if (task.id === taskId) {
            if (task.estatus === "Pendiente" && new Date(task.fecha_fin) < currentDate) {
              task.estatus = "Atrasada";
            } else if (task.estatus === "Pendiente" && new Date(task.fecha_inicio) <= currentDate) {
              task.estatus = "Progreso";
            }
          }
          return task;
        }); */
    /* req.session.userTareas = updatedTasks; */

    return res.status(200).json({ message: "Tarea editada con éxito." });
  });
};

// DELETE para eliminar una tarea
export const deleteTask = (req, res) => {
  const usuarioId = req.body.userId; // Suponiendo que tienes un middleware para obtener el usuario actual
  const taskId = req.params.taskId; // Suponiendo que obtienes el ID de la tarea desde los parámetros de la ruta

  const deleteQuery = `
    DELETE FROM task
    WHERE usuario_id = ? AND id = ?
  `;

  // Ejecuta la consulta para eliminar la tarea de la base de datos
  db.query(deleteQuery, [usuarioId, taskId], (error, results) => {
    if (error) {
      console.error("Error al eliminar la tarea:", error);
      return res.status(500).json({ error: "Error interno del servidor." });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "Tarea no encontrada." });
    }

    return res.status(200).json({ message: "Tarea eliminada con éxito." });
  });
};

export const updateTaskStatus = (req, res) => {
  const taskId = req.params.taskId;

  const updateStatusQuery = `
    UPDATE task
    SET estatus = ?
    WHERE usuario_id = ? AND id = ?
  `;

  const values = [
    req.body.estatus,
    req.body.userId,
    taskId,
  ];


  db.query(updateStatusQuery, values, (error, results) => {
    if (error) {
      console.error("Error al actualizar el estado de la tarea:", error);
      return res.status(500).json({ error: "Error interno del servidor." });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "Tarea no encontrada." });
    }

    return res.status(200).json({ message: "Estado de tarea actualizado con éxito." });

  });
}

/* export const updateTaskStatus = (req, res) => {
  const taskId = req.params.taskId; // Obtén el ID de la tarea desde los parámetros de la ruta
  const newStatus = req.body.estatus; // Obtén el nuevo estado desde el cuerpo de la solicitud

  const updateStatusQuery = `
    UPDATE task
    SET estatus = ?
    WHERE usuario_id = ? AND id = ?
  `;

  const values = [
    newStatus,
    req.body.userId,
    taskId,
  ];

  db.query(updateStatusQuery, values, (error, results) => {
    if (error) {
      console.error("Error al actualizar el estado de la tarea:", error);
      return res.status(500).json({ error: "Error interno del servidor." });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "Tarea no encontrada." });
    }

    return res.status(200).json({ message: "Estado de tarea actualizado con éxito."});
  });
}; */

//realizar la busqueda por el status de la tarea
export const searchTasksByStatus = (req, res) => {
  const status = req.query.estatus;

  const searchQuery = `
    SELECT * FROM task
    WHERE usuario_id = ? AND estatus = ?
  `;

  const values = [
    req.body.userId,
    status, // Utiliza el estado proporcionado en la consulta
  ];

  db.query(searchQuery, values, (error, tasks) => {
    if (error) {
      console.error("Error al buscar tareas por estado:", error);
      return res.status(500).json({ error: "Error interno del servidor." });
    }

    const numRows = tasks.length; // Obtiene el número de filas en el resultado

    return res.status(200).json({ tasks: tasks, numeroConsulta: numRows });
  });
};

//Hacer la consulta por fecha
export const searchTasksByDate = (req, res) => {
  const startDate = req.query.startDate; // parametro fecha inicio
  const endDate = req.query.endDate; // Fecha fin
  const searchQuery = `
    SELECT * FROM task
    WHERE usuario_id = ? AND fecha_inicio >= ? AND fecha_fin <= ?
  `;
  
  const values = [
    req.body.userId,
    startDate,
    endDate,
  ];

  db.query(searchQuery, values, (error, tasks) => {
    if (error) {
      console.error("Error al buscar tareas por fecha:", error);
      return res.status(500).json({ error: "Error interno del servidor." });
    }

    return res.status(200).json({ tasks: tasks });
  });
};
