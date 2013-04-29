/*
battery = {
	MAX_SIZE_HISTORY : 120,
	history : [],
	init : function() {

	},

}

*/
function Polygon () {
    var pointList = [];
    this.node = document.createElementNS('http://www.w3.org/2000/svg','polygon');
    function build (arg) {
        var res = [];
        for (var i=0,l=arg.length;i<l;i++) {
            res.push(arg[i].join(','));
        }
        return res.join(' ');
    }
    this.attribute = function (key,val) {
        if (val === undefined) {
          return node.getAttribute(key);
        }
        this.node.setAttribute(key,val);
    };
    this.getPoint = function (i) {
      return pointList[i];
    };
    this.setPoint = function (i,x,y) {
        pointList[i] = [x,y];
        this.attribute('points',build(pointList));
    };
    this.points = function () {
      for (var i=0,l=arguments.length;i<l;i+=2) {
          pointList.push([arguments[i],arguments[i+1]]);
      }
      this.attribute('points',build(pointList));
    };
    // initialize 'points':
    this.points.apply(this,arguments);
}
var polygon = new Polygon(0,0, 20,60, 30,80);
//Polygon.style="fill:url(#gradient)";

//localStorage.removeItem("batteryHistory");
var batteryHistory = [];
console.log("inicio", localStorage.getItem("batteryHistory"));
if (localStorage.getItem("batteryHistory")) {
  batteryHistory = JSON.parse(localStorage.getItem("batteryHistory"));
  //localStorage.setItem("batteryHistory", JSON.stringify([]));
}



window.onload = function() {
  var titulo = document.querySelector("#titulo");



  var battery = navigator.battery || navigator.mozBattery || navigator.webkitBattery;
  //var REFERSH_TIME = 1000;
  var REFERSH_TIME = 300000;
  var MAX_SIZE_HISTORY = Math.round(86400000 / REFERSH_TIME); /* Un día */
  var panel_width = 100;
  var panel_height = 100;

 // console.log (batteryHistory);


  var bBatteryLevelRandom = false;
  var foo_contador = 0;

  function updateBatteryStatus() {
    //var batteryHistory = getBatteryHistory();
    var chargeLevel;
    if (bBatteryLevelRandom) {
      chargeLevel = Math.random();
      chargeLevel = Math.round(chargeLevel*3)/3;
    }
    else {
      chargeLevel = battery.level;
    }

    addStatusToHistorial(Date.now(), chargeLevel);
    //console.log(document.getElementById("svgelem").getBoundingClientRect());

    /* Limpiar de puntos */
    var puntos = document.getElementById("puntos");
    while (puntos.firstChild) {
      puntos.removeChild(puntos.firstChild);
    }
    var x, y;
    var huecoEntrePuntos = Math.round(batteryHistory.length / 10);
    for(n=0; n<batteryHistory.length; n++) {
      x = getX(batteryHistory[n].timestamp)*100;
      y = (1-batteryHistory[n].level)*100;
      polygon.setPoint(n, x, y);
      //console.log(n, x, y);

      if((n % huecoEntrePuntos) === 0) {
        console.log(n);
        // Pintar cada huecoEntrePuntos
        var punto = document.createElementNS('http://www.w3.org/2000/svg','circle');
        punto.setAttribute("cx", x);
        punto.setAttribute("cy", y);
        punto.setAttribute("r", 1);

        puntos.appendChild(punto);
      }
    }
    polygon.setPoint(n, 100, 100);
    polygon.setPoint(n+1, 0, 100);
    //polygon.points(160,210, 270,330, 100,260, 100,100, 0,100);

    var msg = "Battery status: " + Math.round(chargeLevel * 100) + " %";

    if (battery.charging) {
      msg = "Charging. " + msg;
    }

    foo_contador++;
    msg = msg + ' (' + batteryHistory.length + ', ' + foo_contador + ')';

    titulo.innerHTML = msg;
  }

  function addStatusToHistorial(newTimestamp, newLevel) {
    // ver si los dos anteriores tienen la misma medida, si es así actualizamos el timestamp de la última
    //var batteryHistory = JSON.parse(localStorage.getItem("batteryHistory"));
    var historyLength = batteryHistory.length;
    //console.log("Viene", newTimestamp, newLevel, "y tengo", historyLength);
    if (historyLength > 1 && batteryHistory[historyLength-1].level == newLevel && batteryHistory[historyLength-2].level == newLevel) {
      // Si son 3 mediciones con el mismo valor nos quedamos sólo con la primera y última.
      batteryHistory[historyLength-1].timestamp = newTimestamp;
      //console.log("puede haber 2 iguales ["+historyLength+"]");
    }
    else {
      if (batteryHistory.length > MAX_SIZE_HISTORY) {
        batteryHistory.shift();
      }
      batteryHistory.push({'timestamp': newTimestamp, 'level': newLevel});
      //console.log("añado",{'timestamp': newTimestamp, 'level': newLevel});
    }
    localStorage.setItem("batteryHistory", JSON.stringify(batteryHistory));

    //console.log (batteryHistory.length);
  }
  function getBatteryHistory() {
    return JSON.parse(localStorage.getItem("batteryHistory"));
  }

  /* Devuelve la coordenada x entre 0 y correspondiente a un timestamp */
  function getX(timestamp) {
    /* Primer y último timestamp de la secuencia almacenada */
    var batteryHistory = getBatteryHistory();
    var
      firstTS = batteryHistory[0].timestamp,
      lastTS = batteryHistory[batteryHistory.length-1].timestamp;
    // Normalize to start into 0
    lastTS = lastTS - firstTS;
    timestamp = timestamp - firstTS;
    firstTS = 0;

    return timestamp/lastTS;
  }

  battery.addEventListener("chargingchange", updateBatteryStatus);
  battery.addEventListener("levelchange", updateBatteryStatus);

  bBatteryLevelRandom = document.getElementById("random").checked;
  var timeoutID = window.setInterval(updateBatteryStatus, REFERSH_TIME);
  updateBatteryStatus();

  //polygon.setPoint(1, 20,90); // set point and automatically re-build points
  //polygon.points(160,210, 270,330, 100,360, 100,100, 0,100); // set everything
  console.log(polygon.node); // refer to the actual SVG element
  document.getElementById("svg_grafica").appendChild(polygon.node);
          //console.log(titulo);
          titulo.onclick = function() {
            updateBatteryStatus();
            titulo.classList.toggle("seleccionado");
          };

          document.getElementById("stop").onclick = function() {
            window.clearInterval(timeoutID);
            console.log("Fin");
          };

          document.getElementById("random").onclick = function() {
            bBatteryLevelRandom = this.checked;
          };

          document.getElementById("test").onclick = function() {
            if (false) {
              // Telephony object
              var tel = navigator.mozTelephony;
              // Place a call
              var call = tel.dial("123456789");
              alert("Llamando");              
            }
            if(true) {
              console.log(batteryHistory);
            }

          };

};
