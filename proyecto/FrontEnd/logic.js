let userLoged = 0;
let recordUsuario = 0;
let users = [];

const API_URL = "http://localhost:4000";

// ---------- ESTADO DEL JUEGO ----------
let jugadorIzquierdo = null; 
let jugadorDerecho = null; 

//-----------juago----------
function iniciarJuego() {
    document.getElementById('seccion-login').style.display = 'none';
    document.getElementById('seccion-gameover').style.display = 'none';
    document.getElementById('seccion-juego').style.display = 'block';

    if (jugadores.length < 2) {
        console.error("No hay suficientes jugadores cargados para iniciar el juego");
        return;
    }

    let indiceIzquierdo = Math.floor(Math.random() * jugadores.length);
    let indiceDerecho = Math.floor(Math.random() * jugadores.length);
    while (indiceDerecho === indiceIzquierdo) {
        indiceDerecho = Math.floor(Math.random() * jugadores.length);
    }

    jugadorIzquierdo = jugadores[indiceIzquierdo];
    jugadorDerecho = jugadores[indiceDerecho];

    jugador1 = jugadorIzquierdo.nombre;
    jugador2 = jugadorDerecho.nombre;
    cant1 = jugadorIzquierdo.cantGoles;

    urlBandera1 = "imagenes/" + jugadorIzquierdo.pais + ".png";
    urlBandera2 = "imagenes/" + jugadorDerecho.pais + ".png";

    currentscore = 0;

    actualizarInterfaz();
}
  
// ---------- Llamadas al backend ----------
async function llamadoAlGet(endpoint) {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    return await response.json();
  } catch (error) {
    console.error("Error en llamadoAlGet:", error);
    return null;
  }
}

async function llamadoAlPost(endpoint, datos) {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos)
    });
    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    // Esto se dispara SOLO si el fetch no pudo ni siquiera llegar al servidor
    // (server apagado, puerto mal, CORS bloqueado, etc.)
    console.error("Error en llamadoAlPost (sin conexión real):", error);
    return { status: 0, data: null };
  }
}
async function actualizarRecordEnBackend(idUser, nuevoRecord) {
  const resultado = await llamadoAlPost("/api/actualizar-record", { idUser, record: nuevoRecord });
  if (resultado.status !== 200) {
    console.error("No se pudo guardar el nuevo récord en la base de datos");
  }
}
// ---------- JUGADORES ----------
async function cargarJugadores() {
  const respuesta = await llamadoAlGet("/jugadores");

  jugadores = [];

  if (respuesta && Array.isArray(respuesta.jugadores)) {
    for (let i = 0; i < respuesta.jugadores.length; i++) {
      let fila = respuesta.jugadores[i];
      let nuevoJugador = new Jugador(fila.nombre, fila.cantGoles, fila.pais);
      jugadores.push(nuevoJugador);
    }
    console.log("Jugadores cargados desde la BD:", jugadores);
  } else {
    console.error("No se pudieron cargar los jugadores desde el servidor");
  }

  return jugadores;
}

// ---------- LOGIN ----------
async function login(email, password) {
  const resultado = await llamadoAlPost("/api/login", { email, password });

  if (resultado.status === 0) {
    return { tipo: "SIN_CONEXION" };
  }
  if (resultado.status === 200 && resultado.data.loginExitoso) {
    userLoged = resultado.data.usuario.idUser;
    return { tipo: "OK", usuario: resultado.data.usuario };
  }
  if (resultado.status === 404) {
    return { tipo: "NO_EXISTE" };
  }
  if (resultado.status === 401) {
    return { tipo: "PASSWORD_INCORRECTA" };
  }
  // Cualquier otro código (típicamente 500) => mostramos el mensaje real que mandó el server
  return {
    tipo: "ERROR_SERVIDOR",
    mensaje: (resultado.data && (resultado.data.mensaje || resultado.data.error)) || "Error desconocido del servidor"
  };
}

async function handleLogin() {
  let email = ui.getEmail();
  let password = ui.getPassword();

  let res = await login(email, password);

  switch (res.tipo) {
    case "SIN_CONEXION":
      ui.showModal("Error", "No se pudo conectar con el servidor. ¿Está corriendo el backend en el puerto 4000?");
      break;
    case "NO_EXISTE":
      ui.showModal("Error", "El usuario no existe. ¡Debes registrarte!");
      break;
    case "PASSWORD_INCORRECTA":
      ui.showModal("Error", "Correo electrónico y contraseña no coinciden");
      break;
    case "ERROR_SERVIDOR":
      ui.showModal("Error del servidor", res.mensaje);
      break;
    case "OK":
      recordUsuario = res.usuario.record;

      try {
        let usuarioActual = new User(res.usuario.name, email, password);
        usuarioActual.idUser = res.usuario.idUser; // pisa el id autogenerado por el real de la BD
        usuarioActual.record = res.usuario.record;
        users.push(usuarioActual);
      } catch (error) {
        console.error("Error guardando usuario en el array 'users':", error);
      }

      try {
        await cargarJugadores();
      } catch (error) {
        console.error("Error cargando jugadores:", error);
      }
  iniciarJuego();
  }
}

// ---------- REGISTRO ----------
async function register(name, email, password) {
  const resultado = await llamadoAlPost("/api/registro", { name, email, password });

  if (resultado.status === 0) {
    return { tipo: "SIN_CONEXION" };
  }
  if (resultado.status === 200 && resultado.data.registroExitoso) {
    return { tipo: "OK" };
  }
  if (resultado.status === 409) {
    return { tipo: "YA_REGISTRADO" };
  }
  return {
    tipo: "ERROR_SERVIDOR",
    mensaje: (resultado.data && (resultado.data.mensaje || resultado.data.error)) || "Error desconocido del servidor"
  };
}

async function handleRegister() {
  let email = ui.getEmail();
  let password = ui.getPassword();
  let name = ui.getUser();

  let res = await register(name, email, password);

  switch (res.tipo) {
    case "SIN_CONEXION":
      ui.showModal("Error", "No se pudo conectar con el servidor. ¿Está corriendo el backend en el puerto 4000?");
      break;
    case "YA_REGISTRADO":
      ui.showModal("Error", "Este correo ya está registrado");
      break;
    case "ERROR_SERVIDOR":
      ui.showModal("Error del servidor", res.mensaje);
      break;
    case "OK":
      ui.setUser(name);
      ui.showModal("Correo Registrado!", "ahora inicie sesión para jugar");
      break;
  }
}

// ---------- LOGOUT ----------
function logout() {
  let confirmacion = confirm("¿Estás seguro?");
  if (confirmacion === true) {
    userLoged = 0;
    ui.clearLoginInputs();

    document.getElementById('seccion-juego').style.display = 'none';
    document.getElementById('seccion-gameover').style.display = 'none';
    document.getElementById('seccion-login').style.display = 'flex';

    ui.showModal("Sesión cerrada correctamente");
  } else {
    ui.showModal("Cierre de sesión cancelado");
  }
}

// ---------- MAYOR / MENOR ----------
function mayor() {
  HoL("mayor");
}

function menor() {
  HoL("menor");
}

function HoL(eleccion) {
  let golesIzquierdo = jugadorIzquierdo.cantGoles;
  let golesDerecho = jugadorDerecho.cantGoles;

  let esCorrecto;
  if (golesDerecho === golesIzquierdo) {
    esCorrecto = true; // empate: siempre cuenta como acierto
  } else if (eleccion === "mayor") {
    esCorrecto = golesDerecho > golesIzquierdo;
  } else {
    esCorrecto = golesDerecho < golesIzquierdo;
  }

  if (esCorrecto) {
    currentscore++;
    if (currentscore > higherscore) {
      higherscore = currentscore;
    }

    // El jugador que estaba oculto a la derecha pasa a la izquierda, ya visible
    jugadorIzquierdo = jugadorDerecho;
    jugador1 = jugadorIzquierdo.nombre;
    cant1 = jugadorIzquierdo.cantGoles;
    urlBandera1 = "imagenes/" + jugadorIzquierdo.pais + ".png";

    // Nuevo jugador random a la derecha, distinto del que acaba de pasar a la izquierda
    jugadorDerecho = elegirJugadorRandomDistintoDe(jugadorIzquierdo);
    jugador2 = jugadorDerecho.nombre;
    urlBandera2 = "imagenes/" + jugadorDerecho.pais + ".png";

    actualizarInterfaz();
  } else {
    mostrarPantallaFinal();
  }
}

function elegirJugadorRandomDistintoDe(jugadorAExcluir) {
  let indice = Math.floor(Math.random() * jugadores.length);
  while (jugadores[indice] === jugadorAExcluir) {
    indice = Math.floor(Math.random() * jugadores.length);
  }
  return jugadores[indice];
}

// ---------- FIN DE PARTIDA ----------
function mostrarPantallaFinal() {
  if (currentscore > recordUsuario) {
    recordUsuario = currentscore;

    for (let i = 0; i < users.length; i++) {
      if (users[i].idUser === userLoged) {
        users[i].record = recordUsuario;
      }
    }

    // Lo persiste en la base de datos
    actualizarRecordEnBackend(userLoged, recordUsuario);
  }

  document.getElementById('seccion-juego').style.display = 'none';
  document.getElementById('seccion-gameover').style.display = 'block';

  document.getElementById('gameover-puntaje').innerText = currentscore;
  document.getElementById('gameover-record').innerText = recordUsuario;
}

function continuarJuego() {
  iniciarJuego();
}