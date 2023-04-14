import express from "express";
import cookieParser from 'cookie-parser';
import scurf from 'csurf';
import usuarioRoutes from "./routes/usuarioRoute.js";
import db from "./config/db.js";

// Crear la app
const app = express();

// Parsear data
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Habilitar Cookie Parser
app.use( cookieParser() )

// Habilitar CSRF
app.use( scurf({ cookie: true }) )

// Conexión a la base de datos
try {
  await db.authenticate();
  db.sync();
  console.log("Conexión correcta a la base de datos");
} catch (error) {
  console.log(error);
}

// Habilitar PUG
app.set("view engine", "pug");
app.set("views", "./views");

// Hanilitar archivos estaticos
app.use(express.static("public"));

// Usar el enrutador
app.use("/", usuarioRoutes);

// Definir un puerto y arrancar el proyecto
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Servidor corriendo en el puerto ${port}`);
});
