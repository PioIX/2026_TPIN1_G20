
app.post('/api/login', async function(req, res) {
    var usuarioInput = req.body.username;       
    var passwordInput = req.body.contrasenia; // Cambiado a contraseña

    try {
        
        var buscarUsuario = await realizarQuery(`SELECT * FROM Usuarios WHERE user = '${usuarioInput}'`);

        if (buscarUsuario.length === 0) {
            
            return res.status(404).send({
                error: "USUARIO_NO_EXISTE",
                mensaje: "El usuario no existe. ¡Debes registrarte!"
            });
        }

        var usuarioValido = buscarUsuario[0];
        
       
        if (usuarioValido.contraseña === passwordInput) {
            // Login correcto
            res.send({
                loginExitoso: true,
                mensaje: "¡Ingreso exitoso!",
                usuario: { 
                    idUser: usuarioValido.idUser,
                    user: usuarioValido.user 
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


app.post('/api/registro', async function(req, res) {
    var usuarioInput = req.body.username;
    var passwordInput = req.body.contrasenia; // Cambiado a contraseña

    try {
        // Insertamos usando tus columnas exactas de la base de datos
        await realizarQuery(`INSERT INTO Usuarios (user, contraseña) VALUES ('${usuarioInput}', '${passwordInput}')`);
        
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