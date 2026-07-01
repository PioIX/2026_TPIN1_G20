const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { realizarQuery } = require('./modulos/mysql');
const app = express(); 

// Configuración para que tu API pueda recibir datos y ser consultada
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// ENDPOINT: LOGIN

app.post('/api/login', async function(req, res) {
    var usuarioInput = req.body.username;       
    var passwordInput = req.body.contrasenia; 

    try {
        // CORRECCIÓN: Se cambió 'user' por 'username'
        var buscarUsuario = await realizarQuery(`SELECT * FROM Usuarios WHERE username = '${usuarioInput}'`);

        if (buscarUsuario.length === 0) {
            return res.status(404).send({
                error: "USUARIO_NO_EXISTE",
                mensaje: "El usuario no existe. ¡Debes registrarte!"
            });
        }

        var usuarioValido = buscarUsuario[0];
        
        // CORRECCIÓN: Se cambió 'contraseña' por 'contrasenia' 
        if (usuarioValido.contrasenia === passwordInput) {
            // Login correcto
            res.send({
                loginExitoso: true,
                mensaje: "¡Ingreso exitoso!",
                usuario: { 
                    idUser: usuarioValido.idUser,
                    username: usuarioValido.username // CORRECCIÓN: 'username' en lugar de 'user'
                }
            });
        } else {
            res.status(401).send({
                loginExitoso: false,
                error: "PASSWORD_INCORRECTA",
                mensaje: "La contraseña es incorrecta."
            });
        }

    } catch (error) {
        res.status(500).send({ mensaje: "Error en la base de datos", error: error.message });
    }
});


// ENDPOINT: REGISTRO
app.post('/api/registro', async function(req, res) {
    var usuarioInput = req.body.username;
    var passwordInput = req.body.contrasenia; 

    try {
        // CORRECCIÓN IMPORTANTE: Como tu SQL no tiene AUTO_INCREMENT en 'idUser',
        // calculamos el siguiente ID disponible manualmente para que no falle el INSERT.
        var maxIdResult = await realizarQuery('SELECT MAX(idUser) as maxId FROM Usuarios');
        var nextId = (maxIdResult[0].maxId || 0) + 1;

        // CORRECCIÓN: Usamos las columnas exactas de tu SQL (idUser, username, contrasenia, record, esAdmin)
        // Se le asigna por defecto record = 0 y esAdmin = 0 (false)
        await realizarQuery(`
            INSERT INTO Usuarios (idUser, username, contrasenia, record, esAdmin) 
            VALUES (${nextId}, '${usuarioInput}', '${passwordInput}', 0, 0)
        `);
        
        res.send({
            registroExitoso: true,
            mensaje: "Usuario creado con éxito. Ya puedes iniciar sesión."
        });

    } catch (error) {
        res.status(500).send({ 
            registroExitoso: false, 
            mensaje: "No se pudo registrar el usuario", 
            error: error.message 
        });
    }
});

app.get('/', function (req,res) {
    res.send("Servidor corriendo")
})

app.get('/jugadores', async function (req,res){
    let respuesta = await realizarQuery("SELECT * FROM Jugadores;")
    res.send({jugadores: respuesta})
})
// Al final de tu archivo index.js, abajo de tus rutas
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`¡Servidor activo en el puerto ${PORT}!`);
});


// Nota: Asegúrate de tener tu función realizarQuery() vinculada y el app.listen() al final del archivo.

app.post('/api/login', async function (req,res){
    let respuesta = await realizarQuery("SELECT * FROM Usuarios;")
    res.send({usuarios: respuesta})
})

