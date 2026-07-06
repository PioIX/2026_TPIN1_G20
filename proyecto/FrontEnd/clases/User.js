let contadorUser = 0;
class User {
  constructor(username, email, contrasenia, esAdmin ) {

    contadorUser++;
    this.idUser= contadorUser;
    this.username = username;
    this.email = email;
    this.contrasenia = contrasenia;
    this.record = 0;
    this.esAdmin = esAdmin;
  }
}

