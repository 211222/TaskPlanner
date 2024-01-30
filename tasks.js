// routes.js
import express from 'express';
import { createTask, getTasks,deleteTask, editTask, updateTaskStatus, searchTasksByStatus, searchTasksByDate } from '../controllers/task.js';
import { setCurrentUser } from '../controllers/user.js'; // Importa el middleware

const router = express.Router();

router.use(setCurrentUser);

// Definir rutas
router.post('/post', createTask);
router.post('/get', getTasks);
router.put('/put/:taskId', editTask);
router.delete('/delete/:taskId', deleteTask);
router.put('/tasks/:taskId/status', updateTaskStatus);
router.post('/tasks/buscarStatus', searchTasksByStatus);
router.post('/searchTasksByDate', searchTasksByDate);

export default router;
