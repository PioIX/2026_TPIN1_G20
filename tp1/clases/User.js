let contadorUser = 0;
class User {
  constructor(name, email, password ) {

    contadorUser++;
    this.idUser= contadorUser;
    this.name = name;
    this.email = email;
    this.password = password;
  }
}
