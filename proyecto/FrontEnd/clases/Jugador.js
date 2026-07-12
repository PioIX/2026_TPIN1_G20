let contador = 0;
class Jugador {
  constructor(nombre, cantGoles, pais) {
    contador++;
    this.id = contador;
    this.nombre = nombre;
    this.cantGoles = cantGoles;
    this.pais = pais;
  }
}
