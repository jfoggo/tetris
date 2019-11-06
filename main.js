var tRows = 20;
var tCols = 10;
var idCounter = 0;
var keydownFired = false;
var highScore = 0;

var tracks = [
    'tetris-gameboy-01.mp3',
    "tetris-gameboy-02.mp3",
    "tetris-gameboy-03.mp3",
    "tetris-gameboy-04.mp3",
    "tetris-gameboy-05.mp3"
];

var obj = {
    "L": {
        coords: [[0,0],[1,0],[2,0],[2,1]],
        color: "orange",
        displayOffset: [1,1],
        rotations: [
            [[1,1],[0,0],[-1,-1],[0,-2]],
            [[1,-1],[0,0],[-1,1],[-2,0]],
            [[-1,-1],[0,0],[1,1],[0,2]],
            [[-1,1],[0,0],[1,-1],[2,0]]
        ]
    },
    "J": {
        coords: [[0,1],[1,1],[2,1],[2,0]],
        color: "navy",
        displayOffset: [1,2],
        rotations: [
            [[1,1],[0,0],[-1,-1],[-2,0]],
            [[1,-1],[0,0],[-1,1],[0,2]],
            [[-1,-1],[0,0],[1,1],[2,0]],
            [[-1,1],[0,0],[1,-1],[0,-2]]
        ]
    },
    "I": {
        coords: [[0,0],[1,0],[2,0],[3,0]],
        color: "lightblue",
        displayOffset: [1,2],
        rotations: [
            [[2,-2],[1,-1],[0,0],[-1,1]],
            [[-2,2],[-1,1],[0,0],[1,-1]]
        ]
    },
    "O": {
        coords: [[0,0],[0,1],[1,0],[1,1]],
        color: "yellow",
        displayOffset: [2,1],
        rotations: [
            [[0,0],[0,0],[0,0],[0,0]]
        ]
    },
    "S": {
        coords: [[1,0],[1,1],[0,1],[0,2]],
        color: "green",
        displayOffset: [2,1],
        rotations: [
            [[-2,1],[-1,0],[0,1],[1,0]],
            [[2,-1],[1,0],[0,-1],[-1,0]]
        ]
    },
    "Z": {
        coords: [[0,0],[0,1],[1,1],[1,2]],
        color: "red",
        displayOffset: [2,1],
        rotations: [
            [[1,1],[0,0],[-1,1],[-2,0]],
            [[-1,-1],[0,0],[1,-1],[2,0]]
        ]
    },
    "T": {
        coords: [[0,0],[0,1],[1,1],[0,2]],
        color: "violet",
        displayOffset: [2,1],
        rotations: [
            [[-1,1],[0,0],[-1,-1],[1,-1]],
            [[1,1],[0,0],[-1,1],[-1,-1]],
            [[1,-1],[0,0],[1,1],[-1,1]],
            [[-1,-1],[0,0],[1,-1],[1,1]]
        ]
    }
};

function calcPoints(lines,lvl){
    var factor;
    if (lines == 1) factor = 40;
    else if (lines == 2) factor = 100;
    else if (lines == 3) factor = 300;
    else factor = 1200;
    //console.log(factor+"*"+"("+lvl+"+1) = "+factor*(lvl+1));
    return factor * (lvl+1);
}

class Figur {
    constructor(typ){
        //typ = "Z";
        this.typ = typ;
        this.id = "f"+idCounter++;
        this.color = obj[typ].color;
        this.coords = obj[typ].coords.map(a=>[a[0],a[1]]);
        this.rotation = 0;
        for (var i=0;i<3;i++){
            var r = random(0,10);
            if (r <= 4) this.rotateLeft(true);
            else if (r <= 8) this.rotateRight(true);
        }
        this.hide();
        this.coords = this.startCoordinates(typ);
        this.hasMoved = false;
        this.adj = [0,0];
    }
    toString(){
        return this.typ+": "+this.coords;
    }
    startCoordinates(typ){
        var minX = this.coords[0][1];
        var maxX = this.coords[0][1];
        var maxY = this.coords[0][0];
        var minY = this.coords[0][0];
        for (var i=0;i<this.coords.length;i++){
            minX = Math.min(this.coords[i][1],minX);
            maxX = Math.max(this.coords[i][1],maxX);
            maxY = Math.max(this.coords[i][0],maxY);
            minY = Math.min(this.coords[i][0],minY);
        }
        var width = maxX-minX+1;
        var height = maxY-minY+1;
        var x = random(0,tCols-1-width);
        //x = tCols-width-1;
        var y = 0-height;
        //y = 0-height;
        /*
        console.log(this.typ);
        console.log(x+","+y);
        console.log("width: "+width+", height: "+height);
        */
        var coords = [];
        for (var i=0;i<this.coords.length;i++){
            coords.push([
                this.coords[i][0]+y,
                this.coords[i][1]+x
            ]);
        }
        return coords;
    }
    show(){
        for (var i=0;i<this.coords.length;i++){
            var [r,c] = this.coords[i];
            var td = $("#r"+r+"c"+c);
            if (td.length == 0) continue;
            td.addClass(this.id+" used");
            td.css({
                background: this.color,
                border: "solid black 1px"
            });
        }
        $("td[id]:not([class]):not('#score'):not('#score-label'), td[class='']").css("border","none");
    }
    hide(){
        var tds = $("."+this.id);
        tds.css({
            background: "transparent",
            borderWidth: "0px"
        });
        tds.removeClass(this.id+" used");
        $("td[id]:not([class]):not('#score'):not('#score-label'), td[class='']").css("border","none");
    }
    moveDown(){
        if (this.test(1+this.adj[0],0+this.adj[1])){ 
            this.coords = this.coords.map(arr=>[arr[0]+1+this.adj[0],arr[1]+this.adj[1]]);
            //console.log(this.coords);
            this.hasMoved = true;
            if (!this.test(1,0)) $("#block-down")[0].play();
            return true;
        }
        else if (this.test(1,0)){ 
            this.coords = this.coords.map(arr=>[arr[0]+1,arr[1]]);
            //console.log(this.coords);
            this.hasMoved = true;
            if (!this.test(1,0)) $("#block-down")[0].play();
            return true;
        }
        return false;
    }
    moveLeft(){
        if (!this.test(0,-1)) return false;
        this.coords = this.coords.map(arr=>[arr[0],arr[1]-1]);
        this.hide();
        this.show();
    }
    moveRight(){
        if (!this.test(0,1)) return false;
        this.coords = this.coords.map(arr=>[arr[0],arr[1]+1]);
        this.hide();
        this.show();
    }
    test(y,x){
        for (var i=0;i<this.coords.length;i++){
            var [r,c] = this.coords[i];
            r += y;
            c += x;
            var td = $("#r"+r+"c"+c);
            if (r < 0) continue;
            if (td.length == 0) return false;
            if (!td.hasClass(this.id) && td.hasClass("used")) return false;
        }
        return true;
    }
    bottomMost(){
        var b = this.coords[0][0];
        for (var i=0;i<this.coords.length;i++){
            b = Math.max(b,this.coords[i][0]);
        }
        return b;
    }
    topMost(){
        var t = this.coords[0][0];
        for (var i=0;i<this.coords.length;i++){
            t = Math.min(t,this.coords[i][0]);
        }
        return t;
    }
    rotateRight(silent){
        var cur = this.rotation;
        var next = cur < obj[this.typ].rotations.length-1 ? cur+1 : 0;
        for (var i=0;i<this.coords.length;i++){
            var td = $("#r"+(this.coords[i][0]+obj[this.typ].rotations[cur][i][0])+"c"+(this.coords[i][1]+obj[this.typ].rotations[cur][i][1]));
            if (td.length == 0 && (this.coords[i][0]+obj[this.typ].rotations[cur][i][0] >= 0 || this.coords[i][1]+obj[this.typ].rotations[cur][i][1] < 0 || this.coords[i][1]+obj[this.typ].rotations[cur][i][1] >= tCols)) return false;
            if (!td.hasClass(this.id) && td.hasClass("used")) return false;
        }
        if (!silent) $("#block-rotate")[0].play();
        //console.log(this.typ+" rotate right");
        for (var i=0;i<this.coords.length;i++){
            this.coords[i] = [this.coords[i][0]+obj[this.typ].rotations[cur][i][0],this.coords[i][1]+obj[this.typ].rotations[cur][i][1]];
        }
        this.rotation = next;
        this.hide();
        this.show();
        return true;
    }
    rotateLeft(silent){
        var cur = this.rotation;
        var next = cur > 0 ? cur-1 : obj[this.typ].rotations.length-1;
        for (var i=0;i<this.coords.length;i++){
            var td = $("#r"+(this.coords[i][0]-obj[this.typ].rotations[next][i][0])+"c"+(this.coords[i][1]-obj[this.typ].rotations[next][i][1]));
            if (td.length == 0 && (this.coords[i][0]-obj[this.typ].rotations[next][i][0] >= 0 || this.coords[i][1]-obj[this.typ].rotations[next][i][1] < 0 || this.coords[i][1]-obj[this.typ].rotations[next][i][1] >= tCols)) return false;
            if (!td.hasClass(this.id) && td.hasClass("used")) return false;
        }
        if (!silent) $("#block-rotate")[0].play();
        //console.log(this.typ+" rotate left");
        for (var i=0;i<this.coords.length;i++){
            this.coords[i] = [this.coords[i][0]-obj[this.typ].rotations[next][i][0],this.coords[i][1]-obj[this.typ].rotations[next][i][1]];
        }
        this.rotation = next;
        this.hide();
        this.show();
        return true;
    }
}

class Game {
    constructor(){
        this.score = 0;
        this.curFig = undefined;
        this.nextFig = undefined;
        this.end = false;
        this.speed = 500;
        this.switching = false;
        this.lvl = 0;
        this.todoForLvl = 3;
        this.linesForLvl = 3;
    }
    start(){
        var allTypes = [];
        for (var typ in obj) allTypes.push(typ);
        this.curFig = new Figur(allTypes[random(0,allTypes.length-1)]);
        this.nextFig = new Figur(allTypes[random(0,allTypes.length-1)]);
        //displayNextFigur(this.nextFig);
        this.curFig.hide();
        this.nextFig.hide();
        displayNextFigur(this.curFig);
        var first = true;
        var play = () => {
            if (first) displayNextFigur(this.nextFig);
            first = false;
            this.switching = false;
            if (!this.curFig.moveDown()){
                //console.log("not down: "+this.curFig.id);
                if ((this.curFig.topMost() < 0 && this.curFig.bottomMost() >= 0 )|| !this.curFig.hasMoved){
                    clearInterval(this.inter);
					$("*").off("click touchstart touchend mousedown mouseup");
                    console.log("END");
                    console.log(this.curFig.toString());
                    this.curFig = undefined;
                    $("#music")[0].pause();
                    $("#gameover")[0].play();
					setTimeout(()=>{
						if (highScore < this.score) {
							$("#highscore").text(highScore);
							highScore = this.score;
							setCookie("highscore",highScore);
							alert("*** Congratulation ***\nNew Highscore: "+this.score);
						}
						else alert("Your score: "+this.score+"\nHighscore: "+highScore);
						restartGame();
					},1000);
                }
                else {
                    this.switching = true;
                    var rows = this.checkRows();
                    if (rows.length > 0) $("#line-remove")[0].play();
                    for (var i=0;i<rows.length;i++){
                        this.delRow(rows[i]);
                    }
                    //console.log("ROWS: "+rows);
                    // Calculate points
                    this.score += this.curFig.coords.length;
                    for (var i=0;i<rows.length;i++){
                        var i2 = i;
                        for (var j=i+1;j<rows.length && Math.abs(rows[j-1]-rows[j]) == 1;j++) i2 = j;
                        var p = i2-i+1;
                        this.score += calcPoints(p,this.lvl);
                        i += i2-i;
                    }
                    this.todoForLvl -= rows.length;
                    $("#score").text(this.score);
                    // try adding next figur
                    this.curFig = this.nextFig;
                    this.nextFig = new Figur(allTypes[random(0,allTypes.length-1)]); 
                    this.nextFig.hide();
                    setTimeout(()=>{
                        displayNextFigur(this.nextFig);
                    },100);
                }
            }
            else {
                //console.log("down ok: "+this.curFig.id);
                this.curFig.hide();
                this.curFig.show();
            }
            if (this.todoForLvl <= 0) {    // Level up every N*3 lines
                this.lvl++;
                $("#lvl").text(this.lvl);
                clearInterval(this.inter);
                this.speed = Math.max(this.speed-30,100);
                this.inter = setInterval(play,this.speed);
                $("#lvl").css("color","red");
                setTimeout(function(){
                    $("#lvl").css("color","initial");
                },1000);
                this.linesForLvl += 3;
                this.todoForLvl = this.linesForLvl;
            }
        };
        this.play = play;
        setTimeout(()=>{
            this.inter = setInterval(play,this.speed);
        },1000);
    }
    stop(){
        /*$(document).off("dblclick");
        clearInterval(this.inter);
        console.log("stopped");
        $(document).dblclick(()=>{
            this.inter = setInterval(this.play,this.speed);
            $(document).off("dblclick");
            $(document).dblclick(()=>{
                this.stop();
            });
        });*/
    }
    checkRows(){
        var rows = [];
        for (var i=0;i<tRows;i++){
            for (var j=0;j<tCols;j++){
                var td = $("#r"+i+"c"+j);
                if (!td.hasClass("used")) break;
                else if (j == tCols-1) rows.push(i);
            }
        }
        return rows;
    }
    delRow(r){
        for (var i=r;i>=0;i--){
            for (var j=0;j<tCols;j++){
                var oldTd = $("#r"+(i-1)+"c"+j);
                var newTd = $("#r"+(i)+"c"+j);
                if (i > 0) {
                    newTd.attr("class",oldTd.attr("class"));
                    newTd.css({
                        background: oldTd.css("background-color"),
                        border: oldTd.css("border")
                    });
                }
                else {
                    newTd.attr("class");
                    newTd.css({
                        border: "none",
                        background: "none"
                    });
                }
            }
        }
    }
}

function displayNextFigur(f){
    var coords = obj[f.typ].coords;
    var tds = $(".next");
    var matrix = [];
    for (var i=0;i<5;i++){
        var arr = [];
        for (var j=0;j<5;j++) arr.push(tds.eq(i*5+j));
        matrix.push(arr);
    }
    tds.css({
        background: "none",
        border: "none"
    });
    for (var i=0;i<obj[f.typ].coords.length;i++){
        var td = matrix[obj[f.typ].coords[i][0]+obj[f.typ].displayOffset[0]][obj[f.typ].coords[i][1]+obj[f.typ].displayOffset[1]];
        td.css({
            background: f.color,
            border: "solid black 1px"
        });
    }
}

function random(min,max){
    return Math.floor(Math.random()*(max-min+1))+min;
}

function createTable(rows,cols){
    var t = $("table")[0];
    var m = 0;
    for (var i=0;i<rows+1;i++){
        var r = t.insertRow(i);
        for (var j=0;j<cols+1+6+1;j++){
            var c = r.insertCell();
            if (j > 0 && j < 11 && i < rows) {
                c.id = "r"+i+"c"+(j-1);
                c.style.border = "none";
            }
            else if (j >= 12 && i == 1 && j <= 16){
                c.id = "level-label";
                c.style.background = "none";
                c.style.border = "none";
                c.colSpan = 5;
                j += 4;
                c.innerHTML = "LEVEL:";
            }
			
			
            else if (j >= 12 && i == 3 && j <= 16){
                c.id = "lvl";
                c.style.background = "none";
                c.style.border = "none";
                c.colSpan = 5;
                j += 4;
                c.innerHTML = "0";
            }
			
			
            else if (j >= 12 && i == 5 && j <= 16){
                c.id = "score-label";
                c.style.background = "none";
                c.style.border = "none";
                c.colSpan = 5;
                j += 4;
                c.innerHTML = "SCORE:";
            }
            else if (j >= 12 && i == 7 && j <= 16){
                c.id = "score";
                c.style.background = "none";
                c.style.border = "none";
                c.colSpan = 5;
                j += 4;
                c.innerHTML = 0;
            }
            else if (j >= 12 && i >= 9  && i <= 13 && j <= 16){
                $(c).addClass("next");
                c.style.background = "none";
                c.style.border = "none";
            }
        }
    }
    //console.log(m);
}

function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for(var i = 0; i <ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

function setCookie(cname, cvalue, exdays) {
  var d = new Date();
  d.setTime(d.getTime() + (30 * 24 * 60 * 60 * 1000));
  var expires = "expires="+d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}
var g;

function init(){
    createTable(tRows,tCols);
	var c;
	if (c = getCookie("highscore")) highScore = parseInt(c);
	$("#highscore").text(highScore);
    if ($("#box").outerHeight() > $(window).innerHeight() || $("#box").outerWidth() > $(window).innerWidth()) {
        var width = $(window).innerWidth();
        var height = $(window).innerHeight()*0.85-$(".controls-wrapper").outerHeight()-$("h1").outerHeight();
        var size = Math.min(width/18,height/21);
        $("td").css({
           // width: size+"px",
           // height: size+"px"
        });
    }
	g = new Game();
    $("#left").on("touchstart mousedown",(event)=>{
        event.stopPropagation();
        event.preventDefault();
		if (!g.switching) g.curFig.moveLeft();
        g.curFig.adj[1] = -1;
    });
    $("#right").on("touchstart mousedown",(event)=>{
		event.stopPropagation();
        event.preventDefault();
        if (!g.switching) g.curFig.moveRight();
        g.curFig.adj[1] = 1;
    });
    $("#right, #left").on("touchend mouseup",()=>{
        g.curFig.adj[1] = 0;
    });
    $("#down").click(()=>{
        if (g.switching) return;
        g.curFig.moveDown();
        g.curFig.hide();
        g.curFig.show();
    });
    $("#rotate-right").click(()=>{
        if (!g.switching) g.curFig.rotateRight();
    });
    $("#rotate-left").click(()=>{
        if (!g.switching) g.curFig.rotateLeft();
    });
    $(document).keydown((event)=>{
        if (keydownFired) return;
        keydownFired = true;
        if (event.keyCode == 37 && !g.switching) {
            g.curFig.moveLeft();
            g.curFig.hide();
            g.curFig.show();
            event.preventDefault();
        }
        else if (event.keyCode == 39 && !g.switching) {
            g.curFig.moveRight();
            g.curFig.hide();
            g.curFig.show();
            event.preventDefault();
        }
        else if (event.keyCode == 40 && !g.switching) {
            g.curFig.moveDown();
            g.curFig.hide();
            g.curFig.show();
            event.preventDefault();
        }
        else if (event.keyCode == 32 && !g.switching) {
            g.curFig.rotateLeft();
            event.preventDefault();
        }
        else if (event.keyCode == 13 && !g.switching) {
            g.curFig.rotateRight();
            event.preventDefault();
        }
    });
    $(document).keyup(()=>{
        keydownFired = false;
    })
    $(document).dblclick(()=>g.stop());
    var audio = $("#music");
    $(document).click((event)=>{
        //audio[0].play();
        audio[0].play();
        $(document).off("click");
        $("#game-menu, #box").toggleClass("hidden");
        $("body").css("background","black");
        $("#box").css("opacity",1);
        g.start();
    });
    audio.on("ended",(event)=>{
        var t = random(0,5);
        while (t == trackId) t = random(0,5);
        trackId = t;
        audio.attr("src",tracks[trackId]);
        audio[0].pause();
        audio[0].load();
        audio[0].play();
    });
    $("#r0c10").css("background","red");
}

var trackId = 1;

function restartGame(){
	$("table").empty();
	$("*").off("*");
	$("*").off("touchstart touchend mousedown mouseup");
	$("#box, #game-menu").toggleClass("hidden");
	$("body").css("background","white");
	init();
}
var isOnline = navigator.onLine;

function updateStatus(event){
    isOnline = navigator.onLine;
    var status = $("#status");
    if (isOnline) {
	status.text("&#9992;");
    }
    else {
	status.text("&#127757;");
    }
}

window.addEventListener("load",function(){
    window.addEventListener("online",updateStatus);
    window.addEventListener("offline",updateStatus);
    updateStatus();
});

$(document).ready(init);
