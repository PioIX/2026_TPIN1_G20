/*function login(email, password) {
  for (let i = 0; i < users.length; i++) {
    if (email === users[i].email) {
      if (password === users[i].password) {
        userLoged = users[i].idUser;
        return users[i].idUser;
      }
      else{
      return 0;
     }
    }
  }
  return -1;
}

function handleLogin() {
  let email = ui.getEmail();
  let password = ui.getPassword();
  let userLogin = "";
  let res = login(email, password);
  for (let i = 0; i < users.length; i++) {
    if (users[i].idUser === res) {
      userLogin = users[i].name;
    }
  }

  if (res == -1) {
    ui.showModal("Error","Usuario y contraseña incorrectos");
  } else if (res == 0) {
    ui.showModal("Error","Correo electronico y contraseña no coinciden");
  } else {
    ui.setUser(userLogin);
    showNotes(res);
    ui.changeScreen();
    ui.showModal("Bienvenido " + userLogin + "!", "Inicio de sesion exitoso");
  }
}

function register(name, email, password) {
  let res = login(email, password);
  if (res === -1) {
    let userRegister = new User(name, email, password);
    users.push(userRegister);
    return -2; 
  }
}

function handleRegister() {
  let email = ui.getEmail();
  let password = ui.getPassword();
  let name = ui.getUser(); 
  let res = register(name, email, password);
  if (res === -2) {
    ui.setUser(name); 
    ui.getEmail(email);
    ui.getPassword(password);
    handleLogin()
  } 
  else{
    ui.showModal("Error", "Este correo ya está registrado")
  }
}

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
*/
async function llamadoAlGet() {
      const response = await fetch('https://localhost:4000', {
        method: "GET", 
        headers: {
            "Content-Type": "application/json",
        },
      })
    };
let result = await response.json();

async function llamadoAlPost(datos) {
  const response = await fetch('https://localhost:4000', {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(datos) 
  });
}
