let userLoged = 0;
let recordUsuario = 0;
let users = [];

const API_URL = "http://localhost:4000";

// ---------- ESTADO DEL JUEGO ----------
let jugadorIzquierdo = null; 
let jugadorDerecho = null; 

//-----------juego----------
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

// CORRECCIÓN APLICADA AQUÍ
async function llamadoAlPost(endpoint, datos) {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos)
    });

    let data = null;
    const contentType = response.headers.get("content-type");
    
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      const textData = await response.text();
      data = textData ? { mensaje: textData } : null; 
    }

    return { status: response.status, data };
  } catch (error) {
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
        let usuarioActual = new User(res.usuario.name, email, password, res.usuario.esAdmin);
        usuarioActual.idUser = res.usuario.idUser;
        usuarioActual.record = res.usuario.record;
        users.push(usuarioActual);
      } catch (error) {
        console.error("Error guardando usuario en el array 'users':", error);
      }

      if (res.usuario.esAdmin) {
        mostrarPantallaAdmin();
        break;
      }

      try {
        await cargarJugadores();
      } catch (error) {
        console.error("Error cargando jugadores:", error);
      }
      iniciarJuego();
      break;
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
    document.getElementById('seccion-admin').style.display = 'none';
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
    esCorrecto = true;
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

    jugadorIzquierdo = jugadorDerecho;
    jugador1 = jugadorIzquierdo.nombre;
    cant1 = jugadorIzquierdo.cantGoles;
    urlBandera1 = "imagenes/" + jugadorIzquierdo.pais + ".png";

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

// ---------- ADMINISTRADOR ----------
function mostrarPantallaAdmin() {
  document.getElementById('seccion-login').style.display = 'none';
  document.getElementById('seccion-juego').style.display = 'none';
  document.getElementById('seccion-gameover').style.display = 'none';
  document.getElementById('seccion-admin').style.display = 'block';
}

async function buscarFutbolistaAdmin() {
  const nombre = document.getElementById('admin-nombre').value.trim();
  const contenedorResultados = document.getElementById('admin-resultados-busqueda');

  if (!nombre) {
    ui.showModal("Atención", "Escribe un nombre para buscar.");
    return;
  }

  const respuesta = await llamadoAlGet(`/jugadores/buscar?nombre=${encodeURIComponent(nombre)}`);

  contenedorResultados.innerHTML = "";

  if (respuesta && Array.isArray(respuesta.jugadores) && respuesta.jugadores.length > 0) {
    respuesta.jugadores.forEach(function (jugador) {
      const item = document.createElement('p');
      item.textContent = jugador.nombre + " — " + jugador.cantGoles + " goles — " + jugador.pais;
      contenedorResultados.appendChild(item);
    });
  } else {
    contenedorResultados.textContent = "No se encontraron futbolistas con ese nombre.";
  }
}

async function handleAgregarFutbolista() {
  const nombre = document.getElementById('admin-nombre').value.trim();
  const cantGoles = document.getElementById('admin-goles').value;
  const pais = document.getElementById('admin-pais').value.trim();

  if (!nombre || cantGoles === "" || !pais) {
    ui.showModal("Error", "Debes completar nombre, cantidad de goles y país.");
    return;
  }

  const resultado = await llamadoAlPost("/api/agregar-jugador", {
    nombre: nombre,
    cantGoles: Number(cantGoles),
    pais: pais
  });

  if (resultado.status === 0) {
    ui.showModal("Error", "No se pudo conectar con el servidor. ¿Está corriendo el backend en el puerto 4000?");
  } else if (resultado.status === 200 && resultado.data.agregadoExitoso) {
    ui.showModal("Éxito", "Futbolista agregado correctamente.");
    document.getElementById('admin-nombre').value = "";
    document.getElementById('admin-goles').value = "";
    document.getElementById('admin-pais').value = "";
  } else if (resultado.status === 409) {
    ui.showModal("Atención", "Ese futbolista ya existe en la base de datos. No se puede crear de nuevo.");
  } else {
    ui.showModal("Error del servidor", (resultado.data && resultado.data.mensaje) || "No se pudo agregar el futbolista.");
  }
}

async function handleEliminarFutbolista() {
  const nombre = document.getElementById('admin-nombre').value.trim();

  if (!nombre) {
    ui.showModal("Error", "Debes escribir el nombre del futbolista a eliminar.");
    return;
  }

  const resultado = await llamadoAlPost("/api/eliminar-jugador", { nombre: nombre });

  if (resultado.status === 0) {
    ui.showModal("Error", "No se pudo conectar con el servidor. ¿Está corriendo el backend en el puerto 4000?");
  } else if (resultado.status === 200 && resultado.data.eliminadoExitoso) {
    ui.showModal("Éxito", "Futbolista eliminado correctamente.");
    document.getElementById('admin-nombre').value = "";
    document.getElementById('admin-resultados-busqueda').innerHTML = "";
  } else if (resultado.status === 404) {
    ui.showModal("Atención", "Ese futbolista no existe en la base de datos.");
  } else {
    ui.showModal("Error del servidor", (resultado.data && resultado.data.mensaje) || "No se pudo eliminar el futbolista.");
  }
}