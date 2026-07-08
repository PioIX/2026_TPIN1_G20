let userLoged = 0;

const API_URL = "http://localhost:4000"; // http, no https: el server no tiene certificado SSL

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

// ---------- JUGADORES ----------
let jugadores = []; // acá se guardan las instancias de Jugador traídas de la BD

/**
 * Pide al backend la tabla Jugadores (GET /jugadores) y llena el array `jugadores`
 * con instancias de la clase Jugador, una por cada fila que devuelva la BD.
 */
async function cargarJugadores() {
  const respuesta = await llamadoAlGet("/jugadores");

  if (respuesta && Array.isArray(respuesta.jugadores)) {
    jugadores = respuesta.jugadores.map(fila => new Jugador(fila));
    console.log("Jugadores cargados desde la BD:", jugadores);
  } else {
    console.error("No se pudieron cargar los jugadores desde el servidor");
    jugadores = [];
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
      ui.setUser(res.usuario.name);
      ui.changeScreen();
      await cargarJugadores();
      iniciarJuego();
      console.log("Bienvenido " + res.usuario.name + "!", "Inicio de sesion exitoso");
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
    ui.changeScreen();
    ui.showModal("Sesión cerrada correctamente");
  } else {
    ui.showModal("Cierre de sesión cancelado");
  }
}