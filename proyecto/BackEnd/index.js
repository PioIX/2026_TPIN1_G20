const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { realizarQuery } = require('./modulos/mysql');
const app = express(); 

// Configuración para que tu API pueda recibir datos y ser consultada
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


//  LOGIN

app.post('/api/login', async function(req, res) {
    var usuarioInput = req.body.username;       
    var passwordInput = req.body.contrasenia; 

    try {
       
        var buscarUsuario = await realizarQuery(`SELECT * FROM Usuarios WHERE username = '${usuarioInput}'`);

        if (buscarUsuario.length === 0) {
            return res.status(404).send({
                error: "USUARIO_NO_EXISTE",
                mensaje: "El usuario no existe. ¡Debes registrarte!"
            });
        }

        var usuarioValido = buscarUsuario[0];
        
       
        if (usuarioValido.contrasenia === passwordInput) {
            
            res.send({
                loginExitoso: true,
                mensaje: "¡Ingreso exitoso!",
                usuario: { 
                    idUser: usuarioValido.idUser,
                    username: usuarioValido.username 
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

// REGISTRO
app.post('/api/registro', async function(req, res) {
    var usuarioInput = req.body.username;
    var passwordInput = req.body.contrasenia; 

    try {
        
        var maxIdResult = await realizarQuery('SELECT MAX(idUser) as maxId FROM Usuarios');
        var nextId = (maxIdResult[0].maxId || 0) + 1;

        
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


// =========================================================================
// NOTA: Asegúrate de tener declarada aquí arriba tu función realizarQuery()
// =========================================================================


// ==========================================
// RUTAS BASE
// ==========================================

app.get('/', function (req, res) {
    res.send("Servidor corriendo");
});

app.get('/jugadores', async function (req, res) {
    try {
        let respuesta = await realizarQuery("SELECT * FROM Jugadores;");
        res.send({ jugadores: respuesta });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

// AUTENTICACIÓN (LOGIN Y REGISTRO)
// ==========================================

// LOGIN
app.post('/api/login', async function(req, res) {
    var usuarioInput = req.body.username;       
    var passwordInput = req.body.contrasenia; 

    try {
        var buscarUsuario = await realizarQuery(`SELECT * FROM Usuarios WHERE username = '${usuarioInput}'`);

        if (buscarUsuario.length === 0) {
            return res.status(404).send({
                error: "USUARIO_NO_EXISTE",
                mensaje: "El usuario no existe. ¡Debes registrarte!"
            });
        }

        var usuarioValido = buscarUsuario[0];
        
        if (usuarioValido.contrasenia === passwordInput) {
            res.send({
                loginExitoso: true,
                mensaje: "¡Ingreso exitoso!",
                usuario: { 
                    idUser: usuarioValido.idUser,
                    username: usuarioValido.username,
                    record: usuarioValido.record
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

// REGISTRO (Adaptado a tu tabla con 'email')
app.post('/api/registro', async function(req, res) {
    var usuarioInput = req.body.username;
    var emailInput = req.body.email; // Agregado según tu estructura de tabla
    var passwordInput = req.body.contrasenia; 

    try {
        var maxIdResult = await realizarQuery('SELECT MAX(idUser) as maxId FROM Usuarios');
        var nextId = (maxIdResult[0].maxId || 0) + 1;

        await realizarQuery(`
            INSERT INTO Usuarios (idUser, username, email, contrasenia, record, esAdmin) 
            VALUES (${nextId}, '${usuarioInput}', '${emailInput}', '${passwordInput}', 0, 0)
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

















/*
//* ==========================================
// LÓGICA DEL JUEGO (HIGHER OR LOWER)
// ==========================================

// 1. Iniciar Partida: Devuelve 2 jugadores aleatorios
app.get('/api/nueva-partida', async function(req, res) {
    try {
        // Selecciona 2 jugadores al azar usando tus columnas: id, nombre, cantGoles, pais
        let jugadores = await realizarQuery("SELECT id, nombre, cantGoles, pais FROM Jugadores ORDER BY RAND() LIMIT 2;");
        
        if (jugadores.length < 2) {
            return res.status(500).send({ mensaje: "No hay suficientes jugadores en la base de datos." });
        }

        res.send({
            jugadorA: jugadores[0], // De este se muestran los goles en la pantalla
            jugadorB: jugadores[1]  // De este el usuario debe adivinar si tiene MÁS o MENOS
        });
    } catch (error) {
        res.status(500).send({ mensaje: "Error al obtener jugadores", error: error.message });
    }
});

// 2. Verificar Voto: Procesa si acertó o perdió, y guarda el historial en la tabla 'Partidas'
app.post('/api/verificar-voto', async function(req, res) {
    const { idUser, idJugadorA, idJugadorB, voto, rachaActual } = req.body;

    try {
        // Buscamos los goles de ambos jugadores usando la columna 'cantGoles' e 'id'
        let datosA = await realizarQuery(`SELECT cantGoles FROM Jugadores WHERE id = ${idJugadorA}`);
        let datosB = await realizarQuery(`SELECT cantGoles FROM Jugadores WHERE id = ${idJugadorB}`);

        if (datosA.length === 0 || datosB.length === 0) {
            return res.status(404).send({ mensaje: "No se encontraron los jugadores." });
        }

        const golesA = datosA[0].cantGoles;
        const golesB = datosB[0].cantGoles;

        // Determinamos la respuesta correcta ('mas' si B tiene igual o más goles, 'menos' si tiene menos)
        const respuestaCorrecta = (golesB >= golesA) ? 'mas' : 'menos';

        // SI EL JUGADOR ACERTÓ
        if (voto === respuestaCorrecta) {
            // Buscamos un nuevo rival que no sea el mismo Jugador B para la siguiente ronda
            let siguienteJugador = await realizarQuery(`SELECT id, nombre, cantGoles, pais FROM Jugadores WHERE id != ${idJugadorB} ORDER BY RAND() LIMIT 1;`);

            return res.send({
                resultado: "CORRECTO",
                golesJugadorB: golesB, // Le revelamos los goles al frontend para la animación
                siguienteJugador: siguienteJugador[0] // Se convierte en el nuevo Jugador B
            });

        // SI EL JUGADOR PERDIÓ
        } else {
            // 1. Guardamos la partida jugada en la tabla 'Partidas'
            // Calculamos manualmente el siguiente idJuego (Primary Key sin auto_increment)
            var maxIdResult = await realizarQuery('SELECT MAX(idJuego) as maxId FROM Partidas');
            var nextJuegoId = (maxIdResult[0].maxId || 0) + 1;

            // Insertamos usando tus columnas: idJuego, idUser, fecha, puntuacion
            await realizarQuery(`
                INSERT INTO Partidas (idJuego, idUser, fecha, puntuacion) 
                VALUES (${nextJuegoId}, ${idUser}, CURDATE(), ${rachaActual})
            `);

            // 2. Comprobamos si el jugador superó su récord personal en la tabla 'Usuarios'
            let usuario = await realizarQuery(`SELECT record FROM Usuarios WHERE idUser = ${idUser}`);
            let recordActual = usuario[0].record;
            let nuevoRecordEstablecido = false;

            if (rachaActual > recordActual) {
                await realizarQuery(`UPDATE Usuarios SET record = ${rachaActual} WHERE idUser = ${idUser}`);
                nuevoRecordEstablecido = true;
                recordActual = rachaActual;
            }

            return res.send({
                resultado: "INCORRECTO",
                golesJugadorB: golesB,
                nuevoRecordEstablecido: nuevoRecordEstablecido,
                recordMaximo: recordActual,
                mensaje: `Juego terminado. Tu puntuación final fue de ${rachaActual}.`
            });
        }

    } catch (error) {
        res.status(500).send({ mensaje: "Error al procesar la jugada", error: error.message });
    }
});

// 3. Ranking Global (Opcional pero recomendado para Single Player)
app.get('/api/ranking', async function(req, res) {
    try {
        let topUsuarios = await realizarQuery("SELECT username, record FROM Usuarios WHERE record > 0 ORDER BY record DESC LIMIT 10;");
        res.send({ ranking: topUsuarios });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});


// ==========================================
// INICIO DEL SERVIDOR
// ==========================================

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`¡Servidor activo en el puerto ${PORT}!`);
});

*/