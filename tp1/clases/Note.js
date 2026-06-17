let date = new Date();
let contadorNote = 0;
class Note {
  constructor(title, content, category, user) {
    contadorNote++;
    this.idNote = contadorNote;
    this.title = title;
    this.content = content;
    this.category = category;
    this.users = [user];
    this.modificationHistory = [];
  }

  agregarModificacion(user, date, newTitle, newContent, newCategory) {
    let mod = new Modification(user, date, newTitle, newContent, newCategory);
    this.modificationHistory.push(mod);
  }

  addUser(user) {
    this.users.push(user);
  }

  deleteUser(user) {
    let cleanUsers = [];
    for (let i = 0; i < this.users.length; i++) {
      if (this.users[i] != user) {
        cleanUsers.push(this.users[i]);
      }
    }
    this.users = cleanUsers;
  }
} 