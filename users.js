import express from "express";

import { getUsers, postUser, putUser, deleteUser, loginUser, buscarEmail} from "../controllers/user.js";

const router = express.Router()

router.get("/", getUsers)

router.post("/", postUser)

router.put("/:Id", putUser)

router.delete("/:Id", deleteUser)

// Aquí se utiliza setCurrentUser en la ruta loginUser
router.post("/loginUser", loginUser);

router.post("/buscarEmail", buscarEmail)


export default router