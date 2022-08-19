const LINEAS_EN_CUADRICULA = [
  //Horizontales
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  //Verticales
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  //Diagonales
  [0, 4, 8],
  [2, 4, 6],
];

//Variable dificultad
/*let dificultadSeleccionada = document.querySelector("#seleccionar-jugador").value;
console.log("dificultad: " + dificultadSeleccionada);*/

function ShowSelected()
{
/* Para obtener el valor */
var cod = document.getElementById("seleccionar-jugador").value;
console.log(cod)
 
/* Para obtener el texto */
var combo = document.getElementById("seleccionar-jugador");
var selected = combo.options[combo.selectedIndex].text;
//console.log(selected)
}

  //Random
  function generateRandomInt(min,max){
    return Math.floor((Math.random() * (max+1 -min)) +min);
}

class Nodo {
  constructor(computadora, posicion) {
    this.computadora = computadora;
    this.posicion = posicion;
    this.evaluacion = this.computadora.evaluarPosicion(this.posicion);
  }

  obtenerHijos() {
    let hijos = [];
    let copiaPosicion = [...this.posicion];
    for (let i = 0; i < this.posicion.length; i++) {
      if (this.posicion[i] === "") {        
        copiaPosicion[i] = this.obtenerSimboloSiguiente(this.posicion);
        let nodoHijo = new Nodo(this.computadora, copiaPosicion);
        hijos.push({ nodo: nodoHijo, indice: i });
        copiaPosicion = [...this.posicion];        
      }
    }
    return hijos;
  }

  //Observa una posición y determina si el próximo jugador es una X o un O
  obtenerSimboloSiguiente(posicion) {
    let numeroDeX = posicion.filter((cuadro) => cuadro === "X").length;
    let numeroDeO = posicion.filter((cuadro) => cuadro === "O").length;
    if (numeroDeX - numeroDeO === 1) {
      return "O";
    } else {
      return "X";
    }
  }
}

class Computadora {
  constructor(cuadricula, pieza) {
    this.cuadricula = cuadricula;
    this.pieza = pieza;
    // Crea un nodo con la posición actual
    this.nodo = new Nodo(this, this.cuadricula.posicionActual);
  }

  // Algoritmo que recorre el árbol de posiciones para determinar el valor (-1, 0, 1) de la siguiente jugada
  //Aca se elige la posicion que jugara la computadora en indice
  minimax(nodo, profundidad, jugadorMaximizador, indice = null) {
	  
    //Obtener valor de dificultad del formulario
    var cod = document.getElementById("seleccionar-jugador").value;

    let valor;
    let exploracion;
    let indiceElegido = null;	
    if (
      profundidad === 0 ||
      nodo.obtenerHijos().length == 0 ||
      nodo.evaluacion !== 0
    ) {
      return { valor: this.evaluarPosicion(nodo.posicion), indice };
    }	
    if (jugadorMaximizador) {
      valor = -2;
      for (let hijo of nodo.obtenerHijos()) {
        exploracion = this.minimax(
          hijo.nodo,
          profundidad - 1,
          false,
          hijo.indice
        );
        if (exploracion.valor > valor) {
          valor = exploracion.valor;
          indiceElegido = hijo.indice;	  
        }
      }	  	  
      return { valor, indice: indiceElegido };
    } else {
      valor = 2;      
      for (let hijo of nodo.obtenerHijos()) {
        exploracion = this.minimax(
          hijo.nodo,
          profundidad - 1,
          true,
          hijo.indice
        );
        if (exploracion.valor < valor) {
          valor = exploracion.valor;
          indiceElegido = hijo.indice;
        }
      }
      //Dificultad - CPU
      if(cod == 1){   //facil             
        //Posiciones actuales del juego
        //console.log(this.cuadricula.posicionActual[2])           
        let numeroRandom;
        numeroRandom = generateRandomInt(0,8)
        //console.log("Numero al azar: " + numeroRandom)
        while (this.cuadricula.posicionActual[numeroRandom]!=""){
          numeroRandom = generateRandomInt(0,8)
        }
        //console.log(numeroRandom);
        return { valor, indice:  numeroRandom};	  	
      }
      else {    //dificil                
        return { valor, indice: indiceElegido };	  	
      }
      

    }
	
  }

  // Utiliza el algoritmo minimax para obtener el índice de la cuadrícula donde se debe colocar la siguiente pieza para la mejor jugada
  obtenerMejorJugada() {
    // Actualiza la posición del nodo a la más actual
    this.nodo = new Nodo(this, this.cuadricula.posicionActual);
    if (this.pieza == "O") {		
		//Aca elige la casilla para la jugada de la computadora: return 2; por ejemplo marca la tercera casilla de la primera fila
      return this.minimax(this.nodo, 20, false).indice;
    } else {
      return this.minimax(this.nodo, 20, true).indice;
    }
  }

  //Evalua si cierta posición con formato ['','','','','','','','',''] es una victoria para 'O' (-1), para 'X' (1) o empate (0)
  evaluarPosicion(posicion) {    
	  if (this.cuadricula.obtenerGanador(posicion) === "X") {
      return 1;
    } else if (this.cuadricula.obtenerGanador(posicion) === "O") {
      return -1;
    } else {
      return 0;
    }
  }
}

// Mantiene el estado de los turnos del juego actual, implementa la lógica del juego y utiliza otras clases para decidir el término del juego y jugadas.
class Juego {
  constructor(controlador, turnoDeComputadora) {
    this.controlador = controlador;
    this.tablero = new Cuadricula(this);
    this.computadora = new Computadora(this.tablero, turnoDeComputadora);
    this.turnoDeComputadora = turnoDeComputadora;
    this.turnoActual = "X";
    this.ganador = null;
    if (this.turnoActual === this.turnoDeComputadora) {
      this.jugarTurno(this.computadora.obtenerMejorJugada(), "computadora");
    }
  }

  cambiarTurnoActual() {
    this.turnoActual = this.turnoActual === "X" ? "O" : "X";
  }

  jugarTurno(indice, tipoJugador) {
    //No permitir jugar más cuando ya haya un ganador
    if (this.ganador) return;
    //Si no es el turno del jugador, salir de la función cuando intente dar clic en un cuadro
    if (
      tipoJugador === "jugador" &&
      this.turnoActual === this.turnoDeComputadora
    )
      return;

    if (indice !== null) {
      this.tablero.dibujarJugada(indice);
    }
    this.cambiarTurnoActual();

    if (this.juegoTerminado()) {
      this.controlador.finalizarJuego();
      return;
    }

    if (this.turnoActual === this.turnoDeComputadora) {
      this.jugarTurno(this.computadora.obtenerMejorJugada(), "computadora");
    }
  }

  juegoTerminado() {
    this.ganador = this.tablero.obtenerGanador(this.tablero.posicionActual);
    if (this.ganador) {		
      return true;
    }
    return false;
  }
}

// Clase que mantiene los parámetros permanentes del juego, como la puntuación, y quien tiene el primer turno
class ControladorDeJuego {
  constructor() {
    // El jugador inicia primero por default
    this.juego = new Juego(this, "O");
    this.puntuacionJugador = 0;
    this.puntuacionComputadora = 0;
  }

  actualizarPuntuacion() {
    if (
      this.juego.ganador !== this.juego.turnoDeComputadora &&
      this.juego.ganador !== "Nadie"
    ) {
      this.puntuacionJugador++;
    } else if (
      this.juego.ganador === this.juego.turnoDeComputadora &&
      this.juego.ganador !== "Nadie"
    ) {
      this.puntuacionComputadora++;
    }
    document.querySelector("#puntuacion-jugador > p").textContent =
      this.puntuacionJugador;
    document.querySelector("#puntuacion-computadora > p").textContent =
      this.puntuacionComputadora;
  }

  finalizarJuego() {
    this.actualizarPuntuacion();
    this.escribirGanadorEnDOM();
  }

  escribirGanadorEnDOM() {
    let ganadorJuego = this.juego.ganador;
    let Computador = this.juego.turnoDeComputadora;
    //document.querySelector("#ganador").textContent = "El ganador es: " + ganadorJuego;
    console.log("Ganador: " + ganadorJuego)
    console.log("Ganador: " + this.juego.turnoDeComputadora)
    if(Computador == ganadorJuego){
      console.log("Gano la CPU");
      document.querySelector("#ganador").textContent = "Perdiste!";
    }
    else if (ganadorJuego == "Nadie"){
      document.querySelector("#ganador").textContent = "Empate!";
    }
    else {
      document.querySelector("#ganador").textContent = "Ganaste!";
    }
	  //Mensaje del ganador
	  //alert("El ganador es el jugador: " + this.juego.ganador)	  
	  //console.log(ganadorJuego);	  
	  let fichaGanadora = document.getElementsByClassName("cuadro-central")[0].innerHTML
	  //console.log("ganador " + fichaGanadora)
	  //Variables de cada casilla para identificar valor
	  let casillaCero 	= document.getElementsByClassName("cuadro-superior-izquierdo")[0].innerHTML; 
	  let casillaUno 	  = document.getElementsByClassName("cuadro-superior-central")[0].innerHTML; 
	  let casillaDos 	  = document.getElementsByClassName("cuadro-superior-derecho")[0].innerHTML; 
	  
	  let casillaTres 	= document.getElementsByClassName("cuadro-central-izquierdo")[0].innerHTML
	  let casillaCuatro = document.getElementsByClassName("cuadro-central")[0].innerHTML
	  let casillaCinco 	= document.getElementsByClassName("cuadro-central-derecho")[0].innerHTML
	  
	  let casillaSeis 	= document.getElementsByClassName("cuadro-inferior-izquierdo")[0].innerHTML
	  let casillaSiete 	= document.getElementsByClassName("cuadro-inferior-central")[0].innerHTML
	  let casillaOcho 	= document.getElementsByClassName("cuadro-inferior-derecho")[0].innerHTML
	  
	  //Se evaluan las casillas marcadas con la ficha ganadora
		if(casillaCero == casillaUno && casillaUno == casillaDos){
			document.querySelector(".cuadro-superior-izquierdo").style.color = "red"  
			document.querySelector(".cuadro-superior-central").style.color = "red"  
			document.querySelector(".cuadro-superior-derecho").style.color = "red"  
		}
		
		if(casillaTres == casillaCuatro && casillaCuatro == casillaCinco) {
			document.querySelector(".cuadro-central-izquierdo").style.color = "red"
			document.querySelector(".cuadro-central").style.color = "red"
			document.querySelector(".cuadro-central-derecho").style.color = "red"
		}
		
		if(casillaSeis == casillaSiete && casillaSiete == casillaOcho) {
			document.querySelector(".cuadro-inferior-izquierdo").style.color = "red"
			document.querySelector(".cuadro-inferior-central").style.color = "red"
			document.querySelector(".cuadro-inferior-derecho").style.color = "red"
		}

    if(casillaCero == casillaTres && casillaTres == casillaSeis){
      document.querySelector(".cuadro-superior-izquierdo").style.color = "red"  
      document.querySelector(".cuadro-central-izquierdo").style.color = "red"
      document.querySelector(".cuadro-inferior-izquierdo").style.color = "red"
    }

    if(casillaUno == casillaCuatro && casillaCuatro == casillaSiete){
      document.querySelector(".cuadro-superior-central").style.color = "red" 
      document.querySelector(".cuadro-central").style.color = "red"
      document.querySelector(".cuadro-inferior-central").style.color = "red"
    }

    if(casillaDos == casillaCinco && casillaCinco == casillaOcho){
      document.querySelector(".cuadro-superior-derecho").style.color = "red"  
      document.querySelector(".cuadro-central-derecho").style.color = "red"
      document.querySelector(".cuadro-inferior-derecho").style.color = "red"
    }

    if(casillaCero == casillaCuatro && casillaCuatro == casillaOcho){
      document.querySelector(".cuadro-superior-izquierdo").style.color = "red"  
      document.querySelector(".cuadro-central").style.color = "red"
      document.querySelector(".cuadro-inferior-derecho").style.color = "red"
    }

    if(casillaDos == casillaCuatro && casillaCuatro == casillaSeis){
      document.querySelector(".cuadro-superior-derecho").style.color = "red" 
      document.querySelector(".cuadro-central").style.color = "red"
      document.querySelector(".cuadro-inferior-izquierdo").style.color = "red"
    }
		
  }

  // Reinicia el juego con un turno nuevo para la computadora
  reiniciarJuego(turnoDeComputadora = null) {
    this.juego = new Juego(this, turnoDeComputadora);
  }
}

//Define un cuadro de cierto indice dentro de la cuadrícula de Tic Tac Toe
class Cuadro {
  constructor(index) {
    this.index = index;
  }

  // Funcion auxiliar que crea un cuadro como elementos de HTML
  crearCuadro(clase, index) {
    let div = document.createElement("div");
    div.classList.add(clase);
    div.classList.add("cuadro");
    div.setAttribute("data-index", index.toString());
    return div;
  }

  // Devuelve un div con sus clases correspondientes al cuadro según su índice, ya que todos tienen diferentes bordes
  construir() {
    switch (this.index) {
      case 0:
        return this.crearCuadro("cuadro-superior-izquierdo", this.index);
      case 1:
        return this.crearCuadro("cuadro-superior-central", this.index);
      case 2:
        return this.crearCuadro("cuadro-superior-derecho", this.index);
      case 3:
        return this.crearCuadro("cuadro-central-izquierdo", this.index);
      case 4:
        return this.crearCuadro("cuadro-central", this.index);
      case 5:
        return this.crearCuadro("cuadro-central-derecho", this.index);
      case 6:
        return this.crearCuadro("cuadro-inferior-izquierdo", this.index);
      case 7:
        return this.crearCuadro("cuadro-inferior-central", this.index);
      case 8:
        return this.crearCuadro("cuadro-inferior-derecho", this.index);
    }
  }
}

// Define la cuadrícula completa del juego de Tic Tac Toe
class Cuadricula {
  constructor(juego) {
    this.tag = document.querySelector("#cuadricula");
    this.juego = juego;
    this.posicionActual = ["", "", "", "", "", "", "", "", ""];
    this.dibujar();
  }
  // De acuerdo con una posición dada con el formato ['','','','','','','','',''], decide si existe un empate
  hayEmpate(posicion) {
    for (let cuadro of posicion) {
      if (cuadro === "") {
        return false;
      }
    }
    return "Nadie";
  }

  obtenerGanador(posicion) {
    for (let elem of LINEAS_EN_CUADRICULA) {
      if (
        posicion[elem[0]] === posicion[elem[1]] &&
        posicion[elem[0]] === posicion[elem[2]] &&
        posicion[elem[0]] !== ""
      ) {		  
        //Regresa el símbolo que se repite en la línea (ganador)		
        return posicion[elem[0]];		
      }
    }
	
    if (this.hayEmpate(posicion)) return this.hayEmpate(posicion);
    return null;	
  }
  
  

  obtenerCuadroConIndice(indice) {
    return document.querySelector(`[data-index='${indice}']`);
  }

  dibujarJugada(indice) {
    this.obtenerCuadroConIndice(indice).textContent = this.juego.turnoActual;
    this.posicionActual[parseInt(indice)] = this.juego.turnoActual;
  }

  agregarEventoDeClickACuadro(cuadro) {
    cuadro.addEventListener("click", () => {
      if (this.posicionActual[parseInt(cuadro.dataset.index)] === "") {
        this.juego.jugarTurno(parseInt(cuadro.dataset.index), "jugador");
      }
    });
  }

  construirCuadro(index) {
    let cuadro = new Cuadro(index).construir();
    this.agregarEventoDeClickACuadro(cuadro);
    return cuadro;
  }

  dibujar() {
    this.tag.innerHTML = "";
    for (let i = 0; i < 9; i++) {
      const cuadro = this.construirCuadro(i);
      this.tag.appendChild(cuadro);
    }
  }
}

function jugarTicTacToe() {
  const juego = new ControladorDeJuego();
  document.querySelector("#reiniciar").addEventListener("click", () => {
    let turnoDeComputadora = document.querySelector("#primer-jugador").value;
    //Inicia un nuevo juego y asigna a la computadora el turno seleccionado
    juego.reiniciarJuego(turnoDeComputadora);
  });
}

//Punto de entrada de la aplicación
jugarTicTacToe();
