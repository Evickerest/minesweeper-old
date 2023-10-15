const DOMboard = document.querySelector(".board");
let board = [];
let Width = 5;
let Height = 5;
let Bombs = 5;
let firstClick = true;
const COLORS = ["blue","green","red","darkblue","brown","cyan","black","grey"];

//prevents menu from right clicking
document.addEventListener('contextmenu', event => event.preventDefault());

//checks if an x,y position on the grid is valid
function isValidTile(x,y){
    return !(x < 0 || x >= Width || y < 0 || y >= Height);
}

class Tile {
    constructor(x,y,element){
        this.x = x;
        this.y = y;
        this.bomb = false;
        this.number = 0;
        this.cleared = false;
        this.clicked = false;
        this.flag = false;
        this.element = element;
    }

    // reveals the tile
    clear(){
        if( this.flag || this.clicked) return;
        this.element.classList.add("cleared");
        this.element.textContent = this.bomb ? "X" : (this.number == 0 ? "" : this.number);
        this.element.style.color = COLORS[this.number-1];
        this.clicked = true;
        if( this.number == 0) this.clearZeroes();
        
        
    }

    // gets adjacent tiles from a specific tile in a form of an array
    getAdjTiles(){
        let tile = [];
        for(i = -1; i <= 1; i++){
            for(j = -1; j <= 1; j++){
                if(isValidTile(this.x+i,this.y+j) && !(i == 0 && j == 0)){
                    tile.push(board[this.x+i][this.y+j]);
                } 
            }
        }
        return tile;
    }   

    // flags and unflags the tile
    flagTile(){  
        if(this.clicked) return;
        this.element.textContent = this.flag ? "" : "\u{1F6A9}";
        this.flag = !this.flag;
    }

    // clears adjacent tiles 
    clearAdjTiles(){
        if( !this.clicked) return;
        let count = 0;
        const adjTiles = this.getAdjTiles();
        adjTiles.forEach( adjTile => { if(adjTile.flag) count++ });
        if( count == this.number) adjTiles.forEach( adjTile => adjTile.clear());
    }
    
    // flood fill algorithm to clear zeroes
    clearZeroes(){
        if(this.cleared || this.number != 0 || this.flag || this.bomb) return;
        this.getAdjTiles().forEach( adjTile => adjTile.clear());
    }
}

function createBoard(w,h,b){
    Width = w;
    Height = h;
    Bombs = b;
    firstClick = true;
    DOMboard.textContent = "";
    const fragment = new DocumentFragment();

    // HTML layout uses a grid container, and that width is set here
    // this is show the grid automatically forms a rectangle
    document.documentElement.style.setProperty('--tile-width', Width);

    // create an empty multi dimensional array
    board = Array(Width).fill(0).map(x => Array(Height).fill(0));

    // create the html objects for the board
    for( i = 0; i < Height; i++){  
        for(j = 0; j < Width; j++){  
            const element = document.createElement("div");
            element.className = "tile";
            element.x = j;
            element.y = i;
            element.onmousedown = click;
            board[j][i] = new Tile(j,i,element);
            element.tile = board[j][i];
            fragment.appendChild(element);
        }
        DOMboard.appendChild( fragment );
    } 
}

function createBombsAndNumbers(x,y){
    let bombsLeft = Bombs;
    while( bombsLeft > 0){
        
        // selects a random tile on the board
        tile = board[ Math.floor(Math.random()*Width) ][ Math.floor(Math.random()*Height) ];

        // checks if title is not a bomb, and is more than 1 tile away from first mouse click
        if( !tile.bomb && !((Math.abs(tile.x-x) + Math.abs(tile.y-y)) < 3 )){
            tile.bomb = true;

            //adds 1 to adjacent tiles
            tile.getAdjTiles().forEach(adjTile => adjTile.number++);
            bombsLeft--;
        }   
        
    }

}

function click(e){
    switch( e.which ){
        case 1: 
            // on first click create board
            // this is so there is no chance of clicking a mine first mouse click
            if( firstClick){
                createBombsAndNumbers(this.x,this.y);
                firstClick = false;
            }
            this.tile.clear();  
            break;
            
        // middle click
        case 2:
            this.tile.clearAdjTiles();
            break;

        // right click
        case 3:
            this.tile.flagTile();
            break;
        default:
            console.log("something has gone wrong.");
    }
   // checkWin(this.x,this.y);
}

//checks if won
function checkWin(){
    let sum = 0;
    board.forEach( column => column.forEach((tile) => sum += tile.clicked));;
    if( sum == Width*Height - Bombs) alert("you have won");
}
