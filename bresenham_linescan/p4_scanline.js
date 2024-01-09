//************************************************ */
//                   P4
//                   Computergrafik, BHT, WS2023
//************************************************* */

//#1; define all vertices of the polygon
var vertices=[];
var kanten = [];
var kanten_not_horizont = [];
var kanten_aktiv = [];

var schnittPunkten_knoten = [];
var schnittPunkten_kanten = [];

var schnittPunkten_X = [];
var schnittPunkten = [];
var schnittPunkten_storage = [];

var even_X = [];
var odd_X = [];

vertices = [ //[[x,y,z]]
    [300, 60,0],
    [350, 60,0],
    [400,110,0],
    [390,180,0],
    [500, 80,0],
    [500, 240,0],
    [300, 240,0]
];

var polygon = [0, 1, 2, 3, 4, 5, 6];


function scanline_beginn(vertices) {
    var sort=vertices.toSorted((a, b) => a[1] - b[1]); //sorting in ascending order (Y)
    return {
        y_min: sort[0][1],  //erstes Element y=(erstes Element, ertsen Vertex, zweite Stelle im Vertex)
        y_max:sort[sort.length - 1][1] //letztes Element
    }
}

function signum_kante(vertex_start, vertex_end) {
    return vertex_end[1] > vertex_start[1] ? -1 : vertex_end[1] < vertex_start[1] ? 1 : 0;
}

function anstieg_kante(vertex_start, vertex_end) {    
    var delta_y = vertex_end[1] - vertex_start[1];
    var delta_x = vertex_end[0] - vertex_start[0];
    return delta_x !== 0 ? delta_y / delta_x : 0;
}

// #5; alle Kanten extrahieren
function polygon_kanten(vertices) {
    var kante;
    for (let i = 0; i < vertices.length; i++) {

        if ((i+1) < vertices.length) {
            kante = {};
            kante.xy_start = vertices[i];
            kante.xy_end = vertices[i+1];
            kante.signum = signum_kante(vertices[i], vertices[i+1]);
            kante.anstieg = anstieg_kante(vertices[i], vertices[i + 1]);
            kanten.push(kante);
        }
        else {          //Polygon muss geschlossen sein: letztes Vertex zu den Vertex[0]
            kante = {}; 
            kante.xy_start = vertices[i];
            kante.xy_end = vertices[0];
            kante.signum = signum_kante(vertices[i], vertices[0]);
            kante.anstieg = anstieg_kante(vertices[i], vertices[0]);
            kanten.push(kante);
            }
    }
}

// kanten_not_horizont werden für Zeichnen den Linien benötigt
function polygon_kanten_notHorizont(kanten) {
    kanten_not_horizont = kanten.filter((element) => element.signum != 0);
}

//kanten_aktiv haben Schnittpunkte mir der Scanline
function polygon_kanten_aktiv(kanten_not_horizont, scanline) { 
    kanten_aktiv = [];
    kanten_aktiv = kanten_not_horizont.filter((element) =>
        (scanline >= element.xy_start[1] && scanline <= element.xy_end[1]) ||(scanline >= element.xy_end[1] && scanline <= element.xy_start[1])     
    );
}

//Schnittpunkten mit vertices (Knoten) extrahieren
function polygon_schnittPunkten_knoten(scanline) {
    if (kanten_aktiv.length === 0) return;

    schnittPunkten_knoten = []; 
    var knote;
    var richtung;//1 start of growth; 10 end of growth
    // richtung 1: Kante ist im Wachstum
    // richtung 10: Kante ist ausgewachsen
    for (elem of kanten_aktiv) {
        if (elem.xy_start[1] === scanline) {
            if (elem.signum ===-1) {
                richtung = 1;
            } else { richtung = 10; }
        
            knote = {};
            knote.x = elem.xy_start[0];
            knote.y = scanline;
            knote.signum = elem.signum;
            knote.anstieg = elem.anstieg;
            knote.r = richtung;
            schnittPunkten_knoten.push(knote);
        }
        if (elem.xy_end[1] === scanline) {
            if (elem.signum===1) {
                richtung = 1;
            } else{ richtung = 10; }

            knote = {};
            knote.x = elem.xy_end[0];
            knote.y = scanline;
            knote.signum = elem.signum; //from which vertices extract X-coordinstes (one or two)
            knote.anstieg = elem.anstieg, //it needed for storage to find the next X
            knote.r=richtung //for storage: vertex from growing edge will be put in storage
            schnittPunkten_knoten.push(knote);
        }
    }
 }

//es wird bestimmt, aus weichen Knoten mit gleicnen X-koordinaten diese Koordinaten
//extrahiert werden (aus einer oder aus zwei).
function knoten_anzahl() {
    if (schnittPunkten_knoten.length === 0) return;
   
    var sorted = schnittPunkten_knoten.toSorted((a, b) => a.x - b.x); //sort based on x-koordinaten
    var number_1 = [];

    //Schnittpunkte mit gleichen X-Koordinaten in 2 Arrays verteilen
    var sorted_even=[];
    var sorted_odd=[];
    for (let i = 0; i < sorted.length; i++){
        if (i % 2 !== 0) { sorted_odd.push(sorted[i]) } else {
            sorted_even.push(sorted[i]);
        }
    }
    //X-koordinaten extrahieren
    for (let e = 0, o = 0; e < sorted_even.length, o < sorted_odd.length; e++, o++) {
        var vergleich_signum = sorted_even[e].signum !== sorted_odd[o].signum;
        if (vergleich_signum) {
            number_1.push(sorted_even[e].x);
            number_1.push(sorted_odd[o].x);
        } else { number_1.push(sorted_even[e].x); }
    }
 
    for (elem of number_1) {
        schnittPunkten_X.push(elem);
}

    //select elements for storage only , if they are on growing edges. 
    schnittPunkten = [];
    schnittPunkten = sorted.filter((a) => a.r === 1);

}


//funktion berechnet X-Koordinaten auf der Scanline. 
//Parametern: scanline, gespeicherte schnittpunkte (x, anstieg)
function polygon_schnittPunkten_kanten(scanline) {

    if (kanten_aktiv.length === 0) return;
    if (schnittPunkten_storage.length === 0) return;

    schnittPunkten_kanten = [];
    var punkt;
    var x_;
    var schnittPunkten_storage_sort = schnittPunkten_storage.toSorted((a, b) => a.x - b.x);

    for (elem of schnittPunkten_storage_sort) {
        if (elem.anstieg !== 0) {
           
            x_ = elem.x + (1 / elem.anstieg);
        } else { x_ = elem.x; }

                punkt = {};
        punkt.x = x_;
        punkt.y = scanline;
        punkt.anstieg = elem.anstieg;
        schnittPunkten_kanten.push(punkt);           

    }
 }

//funktion bereinigt Schnittpunkte von Schnittpunkten-Knoten 
//(wenn die für aktuelle Scanlinie existieren), und extrahiert X-koordinaten
function kanten_anzahl(scanline) {

    //if there scanline cuts edges, remove those
    if (schnittPunkten_knoten.length !== 0) { 
        var number_2 = [];
        number_2 = schnittPunkten_kanten.filter(function (elem) {
            for (knote of schnittPunkten_knoten) {
            return Number((elem.x).toFixed()) !== knote.x;
        }
        });
          for (elem of number_2) {
            schnittPunkten.push(elem);
            schnittPunkten_X.push(Math.floor(elem.x));
        }
    }
    else {
        for (elem of schnittPunkten_kanten) {
            schnittPunkten.push(elem);
            schnittPunkten_X.push(Math.floor(elem.x));
        }
    }
}

//X-Koordinaten  werden aufsteigend sortiert, in zwei Arrays verteilt: even /odd;
// Linie verbindet in verschiedenen Arrays befindenden Elementen (X-Koordinaten), die gleiches Indexes haben.
function polygon_fill(scanline) {
    //X-Koordinaten  and then divide the array schnittPunkten_X[] in two arrays: even /odd;
    var even_X = [];
    var odd_X = [];
    //stellen_sort();
    var sort = [];//supportive array
    sort = schnittPunkten_X.toSorted((a, b) => a - b); //sort based on x-koordinate
    var index = 0;
    for (let j = 0; j < sort.length; j++) {
        if (j % 2 != 0) {
            odd_X.push(sort[j]);
        } else { even_X.push(sort[j]); }
    }
    //draw_X_even_odd(even_X, odd_X, scanline);
    for (let i = 0, j = 0; i < even_X.length, j < odd_X.length; i++, j++) {
        bresenham(even_X[i], odd_X[j], scanline, scanline);
        console.log('line');
    }
}


function draw_X_even_odd(even_X, odd_X, scanline) {
    for (let i = 0, j = 0; i < even_X.length, j < odd_X.length; i++, j++) {
        draw_x_scanline(even_X[i], odd_X[j], scanline);
    }
}

function draw_x_scanline(x1, x2, y) {
    context.beginPath();
    context.strokeStyle = "red";
    context.lineWidth = 1;
    context.fillStyle = 'red';
    if (x1 !== x2) {
        //move to starting coordinate and draw line to the last coordinate
        context.moveTo(x1, y);
        context.lineTo(x2, y);
        context.stroke(); //!! important function. It is actually draws a stroke
    }
}
function clearIntersections() {
    schnittPunkten_X = [];
    schnittPunkten = [];
    even_X = [];
    odd_X = [];
}

function scan() {
    var scanline;
    scanline= scanline_beginn(vertices).y_min;
    var scanline_last;
    scanline_last= scanline_beginn(vertices).y_max;

    polygon_kanten(vertices); //extrahiert alle kanten
    polygon_kanten_notHorizont(kanten); //schneidet alle horizontale Kanten aus

    while (scanline <= scanline_last) {
        
        polygon_kanten_aktiv(kanten_not_horizont, scanline);//bestimmt aktive Kanten
        polygon_schnittPunkten_knoten(scanline);//extrahiert Schnitpunkte, die Knoten sind
        knoten_anzahl(); //extrahiert X-koordinaten und speichert die Schnittpunkte

        polygon_schnittPunkten_kanten(scanline); //extrahiert alle Schnittpunkte
        kanten_anzahl(scanline);//ausssortiert Knoten, extrahiert X-koordinaten und speichert die Schnittpunkte

        polygon_fill(scanline);

        schnittPunkten_storage = [];
        for (elem of schnittPunkten) {
            schnittPunkten_storage.push(elem);
         }
        clearIntersections();
        scanline++;
    }
}

scan();

//************************************************************************* */
//polygon: array of one-/many-1D-array, connecting vertices in one polygon
function strokePolygon_1(){
    var xStart, xEnd, yStart, yEnd;
    
    for (var v = 0; v < polygon.length; v++) {
    xStart = vertices[polygon[v]][0];
    yStart = vertices[polygon[v]][1];
    var nextVertexIndex = (v < polygon.length - 1) ? v + 1 : 0; //incriminates and then jump to 0
    xEnd =vertices[polygon[nextVertexIndex]][0];
    yEnd = vertices[polygon[nextVertexIndex]][1];
    
    bresenham(xStart,xEnd,yStart,yEnd);
}
}
strokePolygon_1();

