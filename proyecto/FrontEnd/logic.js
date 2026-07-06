// logic.js
// Lógica de login/registro. Antes esta parte del código no funcionaba porque:
//  - El array "users" nunca estaba declarado (login() explotaba con
//    "users is not defined" apenas se apretaba el botón).
//  - El HTML llama a handleRegister() y logout(), pero esas funciones
//    solo existían comentadas más arriba.
//  - handleLogin() llamaba a showNotes(), que tampoco estaba definida.
//  - alert() nativo solo acepta un argumento, pero se lo llama con dos.

let userLoged = 0;

// Usuarios registrados (mientras no haya backend conectado).
// Nombres de propiedad iguales a los que usa login(): email, contrasenia.
let users = [
  { idUser: 1, email: "admin@test.com", contrasenia: "1234", name: "Administrador" }
];

// Sobreescribe el alert() nativo para que soporte (titulo, mensaje).
function alert(titulo, mensaje) {
  window.alert(mensaje ? `${titulo}\n${mensaje}` : titulo);
}

// ---------- Llamadas al backend ----------
async function llamadoAlGet() {
  try {
    const response = await fetch('https://localhost:4000', {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    return await response.json();
  } catch (error) {
    console.error("Error en llamadoAlGet:", error);
    return null;
  }
}

async function llamadoAlPost(datos) {
  try {
    const response = await fetch('https://localhost:4000', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos)
    });
    return await response.json();
  } catch (error) {
    console.error("Error en llamadoAlPost:", error);
    return null;
  }
}

// ---------- Login ----------
// Devuelve: idUser si es correcto, 0 si la contraseña no coincide, -1 si el correo no existe
function login(correo, contrasenia) {
  for (let i = 0; i < users.length; i++) {
    if (correo === users[i].email) {
      if (contrasenia === users[i].contrasenia) {
        userLoged = users[i].idUser;
        return users[i].idUser;
      } else {
        return 0;
      }
    }
  }
  return -1;
}

function handleLogin() {
  let email = ui.getEmail();
  let contrasenia = ui.getPassword();
  let userLogin = "";

  let res = login(email, contrasenia);

  for (let i = 0; i < users.length; i++) {
    if (users[i].idUser === res) {
      userLogin = users[i].name;
    }
  }

  if (res === -1) {
    alert("Error", "El correo electrónico no está registrado");
  } else if (res === 0) {
    alert("Error", "Correo electrónico y contraseña no coinciden");
  } else {
    ui.setUser(userLogin);
    showNotes(res);
    ui.changeScreen();
    alert("Bienvenido " + userLogin + "!", "Inicio de sesión exitoso");
  }
}

// ---------- Registro ----------
// Devuelve el idUser del nuevo usuario, o -1 si el correo ya está en uso.
function register(name, email, contrasenia) {
  let existe = users.some(u => u.email === email);
  if (existe) {
    return -1;
  }
  let nuevoId = users.length > 0 ? Math.max(...users.map(u => u.idUser)) + 1 : 1;
  users.push({ idUser: nuevoId, email: email, contrasenia: contrasenia, name: name });
  return nuevoId;
}

function handleRegister() {
  // ui.getUser() lee el input #username (así se llama en dom.js, no getUsername)
  let name = ui.getUser();
  let email = ui.getEmail();
  let contrasenia = ui.getPassword();

  if (!name || !email || !contrasenia) {
    alert("Error", "Completá usuario, correo y contraseña para registrarte");
    return;
  }

  let idUser = register(name, email, contrasenia);

  if (idUser === -1) {
    alert("Error", "Ese correo ya está registrado");
    return;
  }

  userLoged = idUser;
  ui.setUser(name);
  ui.changeScreen();
  alert("Cuenta creada", "Bienvenido " + name + "!");
}


function logout() {
  let confirmacion = confirm("¿Estás seguro?");
  if (confirmacion) {
    userLoged = 0;
    ui.clearLoginInputs();
    ui.changeScreen();
  }
}
