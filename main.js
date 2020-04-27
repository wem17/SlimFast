'use strict';

import FlightController from './FlightController.js';

document.addEventListener("DOMContentLoaded", function(event) { 
  let flightController = new FlightController();  
  window.fc = flightController;
  fc.global = {
    // Constants
    // PHLCoords: [39.87189865112305, -75.24109649658203],
    // DENCoords: [39.861698150635, -104.672996521],
    // MIACoords: [25.79319953918457, -80.29060363769531],
    // MSPCoords: [44.8820, -93.221802],
    // JFKCoords: [40.63980103, -73.77890015],

    coordsArray: [
      [39.87189865112305, -75.24109649658203], //PHLCoords
      [39.861698150635, -104.672996521],       // DENCoords
      [25.79319953918457, -80.29060363769531], // MIACoords
      [44.8820, -93.221802],                   // MSPCoords
      [40.63980103, -73.77890015]              // JFKCoords
    ],
    SIMULATION_SPEED: 16, // ms per tick, minimum for most browsers is 15-1
    TICK_TRAVEL: 0.01, // Normalized displacement vector multiplie
    GPS_ERROR_MARGIN: 50, // Margin of error for landing detectio
  }
  fc.init();
});