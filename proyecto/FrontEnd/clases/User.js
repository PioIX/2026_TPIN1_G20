let contadorUser = 0;
class User {
  constructor(username, email, contrasenia, record, esAdmin ) {

    contadorUser++;
    this.idUser= contadorUser;
    this.username = username;
    this.mail = email;
    this.contrasenia = contrasenia;
    this.record = record;
    this.esAdmin = esAdmin;
  }
}