let contadorModification = 0;
class Modification {
  constructor(user, date, newTitle, newContent, newCategory ) {
    
    contadorModification++;
    this.idModification= contadorModification;
    this.user = user;
    this.date = date;
    this.newTitle = newTitle;
    this.newContent = newContent;
    this.newCategory = newCategory;
  }
}

