let contadorUser = 0;
class User {
  constructor(username, mail, contrasenia ) {

    contadorUser++;
    this.idUser= contadorUser;
    this.username = username;
    this.mail = mail;
    this.contrasenia = contrasenia;
    this.record = record;
  }
}