

let contadorUser = 0;
class User {
  constructor(username, fecha, puntuacion) {

    contadorGame++;
    this.idJuego= contadorGame;
    this.fecha = new Date().toLocaleDateString();
    this.puntuacion = puntuacion;
  }
}


/*new Date().toLocaleDateString();*/
