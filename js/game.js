var canvas, ctx;
var x = 0, y = 0;
var tecla = null;
var pause = false, gameOver_= false;
var cont = 0;
var puntos = 0;
var nivel = 0;
var tic = 0 , velocidad = 80;
var cubo = new Image();
cubo.src = "images/cubo.png";

var puntos_nivel = new Array(20,40,60,80,100,120,140,160,180,200);
var strings = {
  pause : "PAUSE",
  gameOver : "GAME OVER",
  restartMsg : "Precione \"Enter\" para reiniciar",
  nextPiece : "PROXIMA PIEZA",
  level: "NIVEL",
  score: "PUNTOS"
}
var teclas = {
  UP : 38,
  DOWN : 40,
  LEFT : 37,
  RIGHT : 39,
  ENTER : 13,
  R : 82
}

var tic = 0;

var colores = ["black", "crimson", "chartreuse", "blue", "gold", "magenta", "cyan", "orange", "hotpink","navajowhite"];

var piezas = new Array();
  piezas[0] = [ 1  , 0  , 0  , 1  , 1  , 1 ],
  piezas[1] = [ 1  , 0  ,-1  , 1  , 0  , 1 ],
  piezas[2] = [ 0  , 1  , 1  , 1  ,-1  , 0 ],
  piezas[3] = [ 0  , 1  , 0  ,-1  , 1  , 1 ],
  piezas[4] = [ 0  , 1  , 0  ,-1  ,-1  , 1 ],
  piezas[5] = [ 0  , 1  , 0  ,-1  , 0  , 2 ],
  piezas[6] = [ 0  ,-1  ,-1  , 0  , 1  , 0 ];

const TAM = 20;
const FILAS = 20;
const COLUMNAS = 10;

window.addEventListener("load",init, false);

document.addEventListener("keydown", function(e){
  tecla = e.keyCode;
  if( tecla == 80 ) pause = !pause;
},false);

document.addEventListener("keyup", function(e){
  tecla = null;
},false);

function Tablero(){
  this.grid = new Array(FILAS);
  for (var i = 0; i < 20; i++) {
    this.grid[i] = new Array(COLUMNAS);
  }
}

function Pieza () {
  this.color;
  this.origen = { x: 0, y: 0 };
  this.perif = [ { x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 } ];
  this.setOrigen = function(x , y) {
    this.origen.x = x;
    this.origen.y = y;
  }
  this.setPerif = function(perifs){
    this.perif[0].x = perifs[0];
    this.perif[0].y = perifs[1];
    this.perif[1].x = perifs[2];
    this.perif[1].y = perifs[3];
    this.perif[2].x = perifs[4];
    this.perif[2].y = perifs[5];
  }
  this.setColor = function(color){
    this.color = color;
  }

  this.getPosicion = function(n){
    coords = { x : this.origen.x, y : this.origen.y };
    if(n != 0){
      coords = { x : this.origen.x + this.perif[ (n - 1)].x,
                 y : this.origen.y + this.perif[ (n - 1)].y }
    }
    return coords;
  }
}

function cuadrado(x, y){
    ctx.save();
    
    ctx.fillRect(x * TAM, y * TAM, TAM , TAM );
    ctx.drawImage(cubo, x * TAM, y * TAM);

    ctx.restore();
}

function pintaPieza(P){
    ctx.save();
    ctx.fillStyle = P.color;
    for (var i = 0; i < 4; i++) {
      coord = P.getPosicion(i);
      cuadrado(coord.x, coord.y);
    }
    ctx.restore();
}

function rotarCoordDerecha(x, y){
  return { x : -y, y : x };
}

function rotarDerecha(P){
  for(var d=0; d < 3; d++){
    coord = rotarCoordDerecha(P.perif[d].x, P.perif[d].y);
    P.perif[d].x = coord.x;
    P.perif[d].y = coord.y;
  }
}

function tablero_vacia(T){
  for (var i = 0; i < COLUMNAS; i++) {
    for (var j = 0; j < FILAS; j++) {
      T.grid[i][j] = colores[0];
    }
  }
}

function tablero_pinta(T){
  for (var i = 0; i < COLUMNAS; i++) {
    for (var j = 0; j < FILAS; j++) {
      ctx.strokeStyle = "#222";
      ctx.fillStyle = T.grid[i][j];
      cuadrado(i, j);
    }
  }
}

function tablero_incrusta_pieza(Tablero, Pieza){
  for (var i = 0; i < 4; i++) {
      coord = Pieza.getPosicion(i);
      Tablero.grid[coord.x][coord.y] = Pieza.color;
  }
}

function tablero_colision(Tablero, Pieza){
  for (var i = 0; i < 4; i++) {
    coord = Pieza.getPosicion(i);
    if(coord.x < 0 || coord.x >= COLUMNAS) return true;
    if(coord.y < 0 || coord.y >= FILAS) return true;
    if(Tablero.grid[coord.x][coord.y] != colores[0]) return true;
  }
  return false;
}

function pieza_nueva(Pieza){
  Pieza.setOrigen(13,4);
  Pieza.setPerif(piezas[ ((Math.random() * (piezas.length - 0) + 0) | 0) ]);
  Pieza.setColor(colores[ ((Math.random() * (9 - 1) + 1) | 0) ]);
}

function tablero_fila_llena(Tablero, fila){
  for(var i = 0; i < COLUMNAS; i++){
    if(Tablero.grid[i][fila] == colores[0]) return false;
  }
  return true;
}

function tablero_colapsa(Tablero, fila){
  for(var j = fila; j > 0; j--){
    for (var i = 0; i < COLUMNAS; i++) {
      Tablero.grid[i][j] = Tablero.grid[i][j - 1];
    }
  }
  for(var i = 0; i < COLUMNAS; i++){
    Tablero.grid[i][0] = colores[0];
  }
}

function tablero_cuenta_lineas(Tablero){
  var fila = FILAS - 1; count = 0;
  while(fila >= 0){
    if(tablero_fila_llena(Tablero, fila)){
      tablero_colapsa(Tablero, fila);
      count++;
    }else{
      fila--;
    }
  }
  return count;
}

function pieza_clonar(Clon, Pieza){
        Clon.origen.x = Pieza.origen.x;
        Clon.origen.y = Pieza.origen.y;
        for(var i = 0; i < 3; i++){
          Clon.perif[i].x = Pieza.perif[i].x;
          Clon.perif[i].y = Pieza.perif[i].y;
        }
        Clon.color = Pieza.color;
}
function pinta_rect(){
    ctx.save();
    
    ctx.strokeStyle = "white";
    ctx.lineWidth = 2;
    ctx.strokeRect(0,0,TAM * COLUMNAS+2, TAM * FILAS);
    ctx.strokeRect(11*TAM,2*TAM,5*TAM,6*TAM);  
    ctx.strokeRect(11 * TAM, 10*TAM, 5 * TAM, 1 * TAM); 
    ctx.strokeRect(11 * TAM, 13*TAM, 5 * TAM, 1 * TAM); 
    
    ctx.restore();
}

function pinta_stats(){
    ctx.save();

    ctx.fillStyle = "white";
    ctx.fillText(strings.nextPiece, 11 * TAM, 1 * TAM);
    ctx.fillText(strings.level, 11 * TAM, 9 * TAM);
    ctx.fillText(nivel + 1, (11 * TAM) + 14, (10 * TAM) + 14);
    ctx.fillText(strings.score, 11 * TAM, 12 * TAM);
    ctx.fillText(puntos, (11 * TAM) + 14, (13 * TAM) + 14);

    ctx.restore();
}
function gameOver(Tablero, c, sig){

      ctx.clearRect(0,0,canvas.width, canvas.height);
      repintar(Tablero, c, sig);
      ctx.fillStyle = "BLACK";
      ctx.fillRect(0, 9 * TAM, COLUMNAS * TAM, 3 * TAM);
      ctx.fillStyle = "WHITE";
      ctx.font = 'bold 14pt Calibri';
      ctx.fillText(strings.gameOver, 3 * TAM , (10  * TAM) + 7);
      ctx.font = 'bold 8pt Calibri';
      ctx.fillText(strings.restartMsg, 2 * TAM,  (11  * TAM) + 4);

      
      if(tecla == teclas.ENTER){
          reiniciar(Tablero, c, sig);
      }
}

function reiniciar(Tablero, c, sig){
    tablero_vacia(Tablero);
    pieza_nueva(sig);
    gameOver_ = false;
    puntos = 0;
    cont = 0;
    nivel = 0;
    velocidad = 80;
}

function repintar(Tablero, Pieza, PiezaSig ){
    pinta_rect();
    pinta_stats();
    tablero_pinta(Tablero);
    pintaPieza(Pieza);
    pintaPieza(PiezaSig);
}

function init(){
  canvas = document.getElementById('game');
  canvas.width = TAM * COLUMNAS + (7*TAM); canvas.height = TAM * FILAS;
  ctx = canvas.getContext('2d');

  Tablero = new Tablero();
  tablero_vacia(Tablero);

  c = new Pieza();
  pieza_nueva(c);

  c.origen.x = 5;
  c.origen.y = 1;

  sig = new Pieza();
  pieza_nueva(sig);


  run();
}

function run(){
  setTimeout(run, 12);
  if(!pause && !gameOver_){

    ctx.clearRect(0,0,canvas.width, canvas.height);

    var p = new Pieza();
    pieza_clonar(p, c);

    if(tic >= velocidad){
      tic = 0;
      tecla = teclas.DOWN;
    }

    if(tecla == teclas.UP){
      rotarDerecha(c)
    }else if( tecla == teclas.DOWN){
      c.origen.y++;
    }else if( tecla == teclas.RIGHT){
      c.origen.x++;
    }else if( tecla == teclas.LEFT){
      c.origen.x--;
    }else if( tecla == teclas.R){ 
        reiniciar(Tablero, sig);
    }

    if(tablero_colision(Tablero, c)){
      pieza_clonar(c, p);
      if(tecla == teclas.DOWN){
        tablero_incrusta_pieza(Tablero, c);
        cont = tablero_cuenta_lineas(Tablero);
        puntos += cont * cont;
        if(puntos > puntos_nivel[nivel]){
          nivel++;
          velocidad -= 6;
        }
        pieza_clonar(c, sig);
        pieza_nueva(sig);
        c.origen.x = 5;
        c.origen.y = 1;
        if (tablero_colision(Tablero, c)) {
            gameOver_ = true;
        };
      }
    }

    repintar(Tablero, c, sig);
    tic++;
    tecla = null;

  }else if(gameOver_){
      gameOver(Tablero, c, sig);
  }
  else{
    ctx.clearRect(0,0,canvas.width, canvas.height);
    repintar(Tablero, c, sig);
    ctx.save();
    ctx.fillStyle = "white";
    ctx.fillText(strings.pause, 4 * TAM, (canvas.height / 2) );
    ctx.restore();   
  }
}