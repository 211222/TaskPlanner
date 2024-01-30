import express from "express";
import userRoutes from "./routes/users.js";
import taskRoutes from "./routes/tasks.js";
import cors from "cors";
import session from "express-session";

const app = express()

app.use(express.json())
app.use(cors());

app.use(
    session({
        secret: "TaskPlanner", //Una cadena secreta utilizada para cifrar los datos de la sesión.
        resave: false, //Si no hubo cambios en la session no se guarda en el almacen.
        saveUninitialized: true //Se refiere a si se debe almacenar una sesión aunque no se haya realizado ningún cambio en ella.
    })
);

app.use("/user", userRoutes)
app.use("/task", taskRoutes)

app.listen(8800)