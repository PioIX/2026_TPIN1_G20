let contadorUser = 0;
class User {
  constructor(name, email, password, esAdmin = false) {
    contadorUser++;
    this.idUser = contadorUser;
    this.name = name;
    this.email = email;
    this.password = password;
    this.record = 0;
    this.esAdmin = esAdmin;
  }
}