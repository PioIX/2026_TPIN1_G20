require('dotenv').config(); // TIENE que ir antes de requerir ./modulos/mysql

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const { realizarQuery } = require('./modulos/mysql');
const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

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

// ==========================================
// AUTENTICACIÓN (LOGIN Y REGISTRO)
// ==========================================

// LOGIN — busca por email, que es lo que manda el formulario de login del front
app.post('/api/login', async function (req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).send({
            error: "DATOS_INCOMPLETOS",
            mensaje: "Debes enviar email y password."
        });
    }

    try {
        const buscarUsuario = await realizarQuery("SELECT * FROM Usuarios WHERE email = ?", [email]);

        if (buscarUsuario.length === 0) {
            return res.status(404).send({
                error: "USUARIO_NO_EXISTE",
                mensaje: "El usuario no existe. ¡Debes registrarte!"
            });
        }

        const usuarioValido = buscarUsuario[0];
        let passwordCorrecta;

        if (usuarioValido.password.startsWith('$2')) {
            // Password guardada como hash bcrypt (usuarios nuevos)
            passwordCorrecta = await bcrypt.compare(password, usuarioValido.password);
        } else {
            // Compatibilidad con passwords viejas en texto plano: si coincide,
            // se migra a hash automáticamente en este mismo login.
            passwordCorrecta = usuarioValido.password === password;
            if (passwordCorrecta) {
                try {
                    const nuevoHash = await bcrypt.hash(password, 10);
                    await realizarQuery("UPDATE Usuarios SET password = ? WHERE idUser = ?", [nuevoHash, usuarioValido.idUser]);
                } catch (migrationError) {
                    // No dejamos que un fallo de migración (ej: columna 'password' muy corta)
                    // le impida entrar a alguien que puso la contraseña correcta.
                    console.log("No se pudo migrar el password a hash:", migrationError.message);
                }
            }
        }

        if (passwordCorrecta) {
            res.send({
                loginExitoso: true,
                mensaje: "¡Ingreso exitoso!",
                usuario: {
                    idUser: usuarioValido.idUser,
                    name: usuarioValido.name,
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

// REGISTRO
app.post('/api/registro', async function (req, res) {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).send({
            registroExitoso: false,
            mensaje: "Debes enviar name, email y password."
        });
    }

    try {
        const existente = await realizarQuery("SELECT * FROM Usuarios WHERE email = ?", [email]);

        if (existente.length > 0) {
            return res.status(409).send({
                registroExitoso: false,
                mensaje: "Este correo ya está registrado"
            });
        }

        const maxIdResult = await realizarQuery('SELECT MAX(idUser) as maxId FROM Usuarios');
        const nextId = (maxIdResult[0].maxId || 0) + 1;

        const passwordHasheada = await bcrypt.hash(password, 10);

        await realizarQuery(
            "INSERT INTO Usuarios (idUser, name, email, password, record, esAdmin) VALUES (?, ?, ?, ?, 0, 0)",
            [nextId, name, email, passwordHasheada]
        );

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

    app.post('/api/actualizar-record', async function (req, res) {
    const { idUser, record } = req.body;

    if (!idUser || record === undefined) {
        return res.status(400).send({
            error: "DATOS_INCOMPLETOS",
            mensaje: "Debes enviar idUser y record."
        });
    }

    try {
        await realizarQuery("UPDATE Usuarios SET record = ? WHERE idUser = ?", [record, idUser]);
        res.send({ actualizado: true });
    } catch (error) {
        res.status(500).send({
            actualizado: false,
            mensaje: "No se pudo actualizar el récord",
            error: error.message
        });
    }
});
});

//----------Jugadores---------
app.get('/jugadores', async function (req, res) {
    try {
        let respuesta = await realizarQuery("SELECT * FROM Jugadores;");
        res.send({ jugadores: respuesta });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
    console.log(`¡Servidor activo en el puerto ${PORT}!`);
});