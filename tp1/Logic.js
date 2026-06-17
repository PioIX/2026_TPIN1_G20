let userLoged = 0
const ahora = new Date();
const dia = ahora.getDate();
const mes = ahora.getMonth();
const anio = ahora.getFullYear();

const users = [
  new User("Lewis", "LewisHamilton@gmail.com", "pass"),
  new User("Marcelo", "MarceloGallardo@gmail.com", "pass"),
  new User("Lionel", "LionelMessi@gmail.com", "pass"),
  new User("Patricio", "PatoFontanet@gmail.com", "pass"),
];

const notes = [
  new Note("Titulo1", "Contenido1", "ejemplo",1),
  new Note("Titulo2", "Contenido2", "ejemplo",2),
  new Note("Titulo3", "Contenido3", "ejemplo",3),
  new Note("Titulo4", "Contenido4", "ejemplo",4),
  new Note("Titulo5", "Contenido5", "ejemplo",1),
  new Note("Titulo6", "Contenido6", "ejemplo",2),
  new Note("Titulo7", "Contenido7", "ejemplo",3),
  new Note("Titulo8", "Contenido8", "ejemplo",4),
  new Note("Titulo9", "Contenido9", "ejemplo",1),
  new Note("Titulo10", "Contenido10", "ejemplo",2),
];


let myNote = notes[0];
console.log(myNote.users); 
myNote.addUser(99);      
console.log(myNote.users); 
myNote.deleteUser(99);      
console.log(myNote.users); 

function login(email, password) {
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

function showNotes(idUser) {
  ui.clearSelect();
  for (let i = 0; i < notes.length; i++) {
    for (let j = 0; j < notes[i].users.length; j++) {
      if (notes[i].users[j] === idUser) {
        ui.createNote(notes[i].idNote, notes[i].title, notes[i].content, notes[i].category);
        ui.addNoteToSelect(notes[i].idNote, notes[i].title);
      }
    }
  }
}

function addNote(title, content, category, user) {
  if (title && content && category && user) {
    let newNote = new Note(title, content, category, user);
    notes.push(newNote);
    return newNote.idNote;
  } else {
    return -1;
  }
}

function handleAddNote() {
  let title = ui.getNoteTitle();
  let content = ui.getNoteContent();
  let category = ui.getNoteCategory();
  let user = userLoged;
  let res = addNote(title, content, category, user);
  if (res === -1) {
    ui.showModal("Error", "faltan completar campos para crear la nota");
  } else {
    ui.createNote(res, title, content, category);
    ui.addNoteToSelect(res, title, content, category);
    ui.showModal("Nota creada", "La nota se ha generado correctamente");
  }
}

function showNoteInConsole() {
  let id = ui.getSelectedNote();
  for (let i = 0; i < notes.length; i++) {
    if (notes[i].idNote == id) {
      console.log("Titulo: ",notes[i].title," ","Contenido: ",notes[i].content," ","Categoria: ",notes[i].category);
    }
  }
}

function showNoteHistory() {
  let id = ui.getSelectedNote();
  for (let i = 0; i < notes.length; i++) {
    if (notes[i].idNote == id) {
      if (notes[i].modificationHistory && notes[i].modificationHistory.length > 0) {
        ui.showModal("Historial de modificaciones de la nota: " + notes[i].title, "Anterior Titulo: " + oldTitle + " - " + "Anterior Contenido: " + oldContent + " - " + "Anterior Categoria: " + oldCategory + " - " + "Fecha de Modificacion: " + dia +"/"+mes+"/"+anio);
      } else {
        ui.showModal("Historial vacío", "Esta nota no registra ninguna modificación todavía.");
      }
    }
  }
}

function updateNote(id, title, content, category, userLoged) {
  for (let i = 0; i < notes.length; i++) {
    if (notes[i].idNote == id) {
      oldTitle = notes[i].title
      oldContent = notes[i].content
      oldCategory = notes[i].category
      notes[i].agregarModificacion(userLoged, title, content, category);
      notes[i].title = title;
      notes[i].content = content;
      notes[i].category = category;
      return notes[i]; 
    }
  }
  return -1;
}

function editNote(id) {
  let title = ui.getNoteTitle();
  let content = ui.getNoteContent();
  let category = ui.getNoteCategory();
  if (title === "" || content === "" || category === "") {
    ui.showModal("Error", "Faltan completar campos para modificar la nota.");
  } else {
    let modifiedNote = updateNote(id, title, content, category, userLoged);
      ui.editNote(id, title, content, category);
      ui.showModal("Éxito", "La nota se modificó correctamente.");
  }
}

function deleteNote(id) {
  let foundIndex = -1;
  for (let i = 0; i < notes.length; i++) {
    if (notes[i].idNote == id) {
      foundIndex = i;
    }
  }
  if (foundIndex === -1) {
    return false;
  }
  for (let j = foundIndex; j < notes.length - 1; j++) {
    notes[j] = notes[j + 1];
  }
  notes.pop(); 
  return true;
}

function eraseNote(id) {
  let erasedNote = deleteNote(id); 
  if (erasedNote === true) {
    ui.removeNote(id); 
    ui.showModal("Éxito", "La nota fue eliminada correctamente.");
  } else {
    ui.showModal("Error", "No se pudo encontrar la nota para eliminar.");
  }
}

function searchByContent(text) {
  if (text.length < 4) {
    return;
  }
  let found = false;
  for (let i = 0; i < notes.length; i++) {
    let noteContent = notes[i].content.toLowerCase();
    let searchText = text.toLowerCase();

    if (noteContent.includes(searchText)) {
      found = true;
      console.log(notes[i]);
      break; 
    }
  }
  if (found === false) { 
    console.log("No hay coincidencias"); 
  }
}

