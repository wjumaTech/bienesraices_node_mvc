import express from 'express'
import usuarioRoutes from './routes/usuarioRoute.js'
import db from './config/db.js'


// Crear la app
const app = express()

// Conexión a la base de datos
try {
    await db.authenticate()
    db.sync()
    console.log('Conexión correcta a la base de datos')
} catch (error) {
    console.log(error)
}

// Habilitar PUG
app.set('view engine', 'pug')
app.set('views', './views')

// Parsear data
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

// Hanilitar archivos estaticos
app.use(express.static( 'public' ))

// Usar el enrutador
app.use('/', usuarioRoutes)



// Definir un puerto y arrancar el proyecto
const port = 3000
app.listen(port, () => {
    console.log(`Servidor corriendo en el puerto ${port}`)
})


