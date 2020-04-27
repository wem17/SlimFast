'use strict';

// Constants
const PHLCoords = [39.87189865112305, -75.24109649658203];
const DENCoords = [39.861698150635, -104.672996521];
const MIACoords = [25.79319953918457, -80.29060363769531];
const MSPCoords = [44.8820, -93.221802];
const JFKCoords = [40.63980103, -73.77890015];
const coordsArray = [PHLCoords, DENCoords, MIACoords, MSPCoords, JFKCoords];

const SIMULATION_SPEED = 16; // ms per tick, minimum for most browsers is 15-16
const TICK_TRAVEL = 0.01; // Normalized displacement vector multiplier
let GPS_ERROR_MARGIN = 50; // Margin of error for landing detection

class FlightManager {
  constructor() {
    // Coordinates of airports
    const airportCoords = coordsArray;
    // Create airport icon
    const airportIcon = L.icon({
      iconUrl: "./assets/airport-circle.png",
      iconSize: [32, 32], // size of the icon
      iconAnchor: [16, 16], // point of the icon which will correspond to marker's location
    });
    this.playing = false;
    // Stores flights
    this.flights = [];
    // Initializes interactive map
    this.map = L.map('mapid', {
      center: [39.8736, -75.239],
      zoom: 8,
      attributionControl: false,
      zoomControl: false
    });
    // Initialize tiles on map
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(this.map);
    // Add markers to map
    for (let coords of airportCoords) {
      L.marker(coords, { icon : airportIcon }).addTo(this.map);
    }
    this.selectedFlight = 0;
    this.startTime = Date.now();
    this.tickCount = 0;
  }

  start() {
    setInterval(() => this.executeTick(), SIMULATION_SPEED);
    
  }

  pause() {
    this.playing = false;
  }

  play() {
    this.playing = true;
  }

  executeTick() {
    if (this.playing) {
      for (let flight of this.flights) {
        flight.onTick(this.tickCount);
      }
      ++this.tickCount;
      document.getElementById('clock').innerHTML = this.getSimulationTime();
    }
  }

  getFlightByCallsign(callsign) {
    for (let i = 0; i < this.flights.length; ++i) {
      if (callsign === this.flights[i].getCallsign()) {
        return this.flights[i];
      }
    }
    console.log('Could not find flight');
    debugger;
  }

  selectFlight(flight) {
    this.selectedFlight = flight;
    this.map.setView(flight.getLatLng(), 10);
  }

  getSelectedFlight() {
    return this.flights[this.selectedFlight];
  }

  addFlight(flight) {
    this.flights.push(flight);
    flight.getMarker().addTo(this.map);

    let currentCallsign = flight.getCallsign();
    let selectFlightButton = `<a href="#" class="list-group-item" id="select-${currentCallsign}">${flight.getFlightName()}</a>`
    document.getElementById('flight-selector').insertAdjacentHTML('beforeend', selectFlightButton);
    document.getElementById(`select-${currentCallsign}`).addEventListener('click', () => {
      this.selectFlight(this.getFlightByCallsign(currentCallsign));
    });
    // this.selectFlight();
    // flight.focus();
  }

  getSimulationTime() {
    let runTimeInMs = this.tickCount * SIMULATION_SPEED;
    let minutes = Math.floor(runTimeInMs / 60000);
    let seconds = ((runTimeInMs % 60000) / 1000).toFixed(0);
    return (seconds == 60 ? (minutes+1) + ":00" : minutes + ":" + (seconds < 10 ? "0" : "") + seconds);
  }

  runCommand(command) {
    let commandArr = command.split(' ');
    let callsign = commandArr[0];
    let inputCommand = commandArr[1];
    let value = commandArr[2];

    let flightIndex = 0;
    // while (flightIndex < flights.length && flights[flight]) {

    // }

    switch (inputCommand) {
      case 'bearing': {
        console.log('bearing command');
        break;
      }
      case 'altitude': {
        console.log('altitude command');
      }
    }
  }
}

class Flight{
  constructor(origin, destination) {
    this.arrived = false; // Plane has(n't) landed
    this.origin = L.latLng(origin); // Origin LatLng
    this.destination = L.latLng(destination); //Destination LatLng
    this.callsign = Flight.genCallsign();
    this.id = Flight.getCounter();
    let planeIcon = L.icon({
      iconUrl: "./assets/flight-marker.png",
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });

    const popupElement = `
      <div class="popup-callsign-container">
        <div class="popup-callsign-left">
          <p>／</p>
        </div>
        <div class="popup-callsign-right">
          <p>•${this.callsign}</p>
          <p>A:${this.getAltitude()} B:${this.getBearing()} S:${this.getSpeed()}</p>
        </div>
      </div>
    `;

    this.marker = L.marker(origin, { icon: planeIcon })
                  .bindTooltip(popupElement, {
                    permanent: true,
                    direction: 'top'
                  })

    

    // this.marker.bindTooltip(popupElement).openTooltip();
    this.action = 'fly';
    this.actionStartTick = 0;
    this.currentTick = 0;
    this.initialCoords = [];
  }

  getId() {
    return this.id;
  }

  getAltitude() {
    return 'tAlt';
  }

  getBearing() {
    return 'tBr';
  }

  getSpeed() {
    return 'tSp';
  }

  getOrigin() {
    return this.origin;
  }

  getDestination() {
    return this.destination;
  }

  getFlightName() {
    // return `Flight number ${this.getId()} O: ${this.getOrigin()} D:${this.getDestination()}`;
    return `Flight ${this.getCallsign()}`;
  }

  static genCallsign() {
    let sign = 'N';
  
    let middleNumber = '' + Math.floor(Math.random() * 9999);
    while (middleNumber.length < 4) middleNumber = '0' + middleNumber;
    sign += middleNumber;
    sign += String.fromCharCode(Math.floor(Math.random() * 26) + 65);
    return sign;
  }

  getCallsign() {
    return this.callsign;
  }

  static calculateBearingFromPoints(pointA, pointB) {
    console.log('haha')
  }

  static getCounter() {
    Flight.counter = (Flight.counter || 0) + 1;
    return Flight.counter;
  }

  getMarker() {
    return this.marker;
  }

  getLatLng() {
    return this.marker.getLatLng();
  }

  // focus() {
  //   flightMap.setView(this.marker.getLatLng(), 9);
  // }
  
  // Go to destination
  takeOff() {
    let currentCoords = this.marker.getLatLng();

    let deltaLat = this.destination.lat - currentCoords.lat; //Difference between x coords
    let deltaLng = this.destination.lng - currentCoords.lng; //Difference between y coords
    let deltaLength = Math.sqrt(deltaLat * deltaLat + deltaLng * deltaLng);
    let normalizedX = deltaLat / deltaLength;
    let normalizedY = deltaLng / deltaLength;
    let scaledX = normalizedX * TICK_TRAVEL;
    let scaledY = normalizedY * TICK_TRAVEL;
    let radAngle = Math.atan2(normalizedY, normalizedX); //Angle from primary x axis in radians
    let degAngle = radAngle * (180 / Math.PI); //Angle in degrees
    this.marker.setRotationAngle(degAngle);

    let nextTickPos = L.latLng(currentCoords.lat + scaledX, currentCoords.lng + scaledY);
    if (nextTickPos.distanceTo(this.destination) > currentCoords.distanceTo(this.destination)) { // if overshoot, don't
      this.marker.setLatLng(this.destination);
      this.setAction('landed');
    } else {
      this.marker.setLatLng(nextTickPos);
    }
  }

  // crash
  land() {
    // this.primeNewAction();
    // console.log('shouldLand');
  }

  // Animate plane into holding pattern
  holdPattern(tick, initialCoords) {
    // let currentCoords = [this.marker.getLatLng().lat, this.marker.getLatLng().lng];
    let deltaLat = this.destination.lat - initialCoords.lat; //Difference between x coords
    let deltaLng = this.destination.lng - initialCoords.lng; //Difference between y coords
    let deltaLength = Math.sqrt(deltaLat * deltaLat + deltaLng * deltaLng);
    let normalizedX = deltaLat / deltaLength;
    let normalizedY = deltaLng / deltaLength;
    let scaledX = normalizedX * TICK_TRAVEL;
    let scaledY = normalizedY * TICK_TRAVEL;

    let relativeTick = tick - this.actionStartTick;

    // this.inAction = true;
    let turnFreq = 300;
    if (relativeTick % turnFreq === Math.floor(turnFreq * 0.2)
        || relativeTick % turnFreq === Math.floor(turnFreq * 0.5)
        || relativeTick % turnFreq === Math.floor(turnFreq * 0.7)
        || relativeTick % turnFreq === 1) {
      this.marker.setRotationAngle(this.marker.options.rotationAngle + 90);
    }
    if (relativeTick % turnFreq < turnFreq * 0.2) {
      this.marker.setLatLng(L.latLng(this.marker.getLatLng().lat - scaledY, this.marker.getLatLng().lng + scaledX));
    }
    else if (relativeTick % turnFreq < turnFreq * 0.5) {
      this.marker.setLatLng(L.latLng(this.marker.getLatLng().lat - scaledX, this.marker.getLatLng().lng - scaledY));
    }
    else if (relativeTick % turnFreq < turnFreq * 0.7) {
      this.marker.setLatLng(L.latLng(this.marker.getLatLng().lat + scaledY, this.marker.getLatLng().lng - scaledX));
    }
    else {
      this.marker.setLatLng(L.latLng(this.marker.getLatLng().lat + scaledX, this.marker.getLatLng().lng + scaledY));
    }
  }

  setAction(action) {
    this.action = action;
    this.actionStartTick = this.currentTick;
    this.initialCoords = this.marker.getLatLng();
  }

  flyAtBearing(bearing) {
    this.marker.setRotationAngle(bearing);

  }

  onTick(tick) {
    this.currentTick = tick;
    let { actionStartTick } = this;

    switch (this.action) {
      case 'fly': {
        this.takeOff();
        break;
      }
      case 'hold': {
        this.holdPattern(tick, this.initialCoords);
        // this.actionStartTick = tick;
        break;
      }
      case 'land': {
        this.land();
        break;
      }
      case 'landed': {
        if (!this.arrived) {
          this.arrived = true;
        }
        break;
      }
      case 'pretakeoff': {
        // console.log('boy should you take off');
        break;
      }
    }
  }
}

(function main() {
  // console.log('this is the main function')

  let flightManager = new FlightManager();
  for (let i = 0; i < coordsArray.length; ++i) {
    for (let j = 0; j <coordsArray.length; ++j) {
      if (i !== j) {
        flightManager.addFlight(new Flight(coordsArray[i], coordsArray[j]));
      }
    }
  }
  // for (let i = coordsArray.length - 1; 1 < i; --i) {
  //   flightManager.addFlight(new Flight(coordsArray[i], coordsArray[i-1]))
  // }

  ////////////////////////////////////////
  ////Event listeners for UI elements/////
  ////////////////////////////////////////
  console.log('yert');
  document.getElementById('button-emergency-landing').addEventListener('click', () => {
    flightManager.getSelectedFlight().setAction('land');
  });
  document.getElementById('button-hold').addEventListener('click', () => {
    flightManager.getSelectedFlight().setAction('hold');
  });

  document.getElementById('button-takeoff').addEventListener('click', () => {
    flightManager.getSelectedFlight().setAction('fly');
  });

  // document.getElementById('button-start').addEventListener('click', () => {
  //   flightManager.start();
  // })
  document.getElementById('console-enter').addEventListener('click', () => {
    flightManager.runCommand(document.getElementById('console-input').value);
    document.getElementById('console-input').value = '';
  })

  document.getElementById('pause-simulation').addEventListener('click', () => {
    flightManager.pause();
    console.log('Simulation paused');
  })

  document.getElementById('play-simulation').addEventListener('click', () => {
    flightManager.play();
    console.log('Simulation resumed');
  })

  flightManager.start();
})();