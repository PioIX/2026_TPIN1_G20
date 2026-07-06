let contadorUser = 0;
class User {
  constructor(username, email, contrasenia, record, esAdmin ) {

    contadorUser++;
    this.idUser= contadorUser;
    this.username = username;
    this.email = email;
    this.contrasenia = contrasenia;
    this.record = 0;
    this.esAdmin = esAdmin;
  }
}

const users = [
  new User("ejemplo","ejemplo@gmail.com","pass",false)
]