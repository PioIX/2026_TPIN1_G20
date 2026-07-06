

let contadorGame = 0; // Declaración que faltaba
class Game {          // Cambiado a Game
  constructor(username, puntuacion) {
    contadorGame++;
    this.idJuego = contadorGame;
    this.username = username;
    this.fecha = new Date().toLocaleDateString();
    this.puntuacion = puntuacion;
  }
}