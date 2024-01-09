//************************************************ */
//                   ESA-P3
//                   Computergrafik, BHT, WS2023
//************************************************* */

var canvas_1 = document.getElementById('myCanvas');
canvas_1.setAttribute('width', 600);
canvas_1.setAttribute('height', 600);
var context = canvas_1.getContext('2d');

//****************************** */
function draw_dot(x, y) {
    context.beginPath();
    context.fillStyle = 'green';
    context.fillRect(x, y, 1, 1);
}
//*******************************
//  #1
// implementation of a Bresenham-Line-Algitightm

console.log('********* draw_bresemham: ');

function bresenham(xStart,xEnd,yStart,yEnd) {
var e;
var e_arr = [];
    
var x_arr = [];
var y_arr = [];
var n_arr = [];

var x = xStart;
var y = yStart;
var n = 0;

x_arr.push(x);
y_arr.push(y);
n_arr.push(n);
    
var deltaX = xEnd - xStart;
var deltaY = yEnd - yStart;
    
    var differenz = Math.abs(deltaX) >= Math.abs(deltaY);

    if (differenz) {
        e = Math.abs(deltaX) - 2 * Math.abs(deltaY);
        e_arr.push(e);

        while (x != xEnd) {
            n = n + 1;
            x = x + Math.sign(deltaX);
        
            x_arr.push(x);
            n_arr.push(n);
            if (e >= 0) {
                y = y;
                e = e - 2 * Math.abs(deltaY);
                
                y_arr.push(y);
                e_arr.push(e);
                draw_dot(x, y);
            }
            else {
                y = y + Math.sign(deltaY);
                e = e + 2 * (Math.abs(deltaX) - Math.abs(deltaY));
                y_arr.push(y);
                e_arr.push(e);
                draw_dot(x, y);
  
            }
        }
    } else {
        e = Math.abs(deltaY) - 2 * Math.abs(deltaX);
        while (y != yEnd) {
            n = n + 1;
            y = y + Math.sign(deltaY);

            y_arr.push(y);
            n_arr.push(n);
            if (e > 0) {
                x = x;
                e = e - 2 * Math.abs(deltaX);

                x_arr.push(x);
                e_arr.push(e);
                draw_dot(x, y);
                
            }
            else {
                x = x + Math.sign(deltaX);
                e = e + 2 * (Math.abs(deltaY) - Math.abs(deltaX));

                x_arr.push(x);
                e_arr.push(e);
                draw_dot(x, y);
                
            }
        }
    }

}



