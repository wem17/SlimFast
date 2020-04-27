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

export default class FlightManager {
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
    this.tickRate = SIMULATION_SPEED;  //The tick rate in ms/tick cannot be less than 16
    this.selectedFlight = null;
    this.startTime = Date.now();
    this.tickCount = 0;
    this.tickInterval = null;
  }

  setTickRate(rate) {
    this.pause();

    if (rate < 16) this.tickRate = 16;
    if (rate > 1000) this.tickRate = 1200;
    else this.tickRate = rate;

    this.play();
  }

  pause() {
    clearInterval(this.tickInterval);
    this.playing = false;
  }

  play() {
    this.tickInterval = setInterval(() => this.executeTick(), this.tickRate);    
    this.playing = true;
  }

  executeTick() {
    for (let flight of this.flights) {
      flight.onTick(this.tickCount);
    }
    ++this.tickCount;
    document.getElementById('clock').innerHTML = this.getSimulationTime();
  }

  getFlightByCallsign(callsign) {
    for (let i = 0; i < this.flights.length; ++i) {
      if (callsign === this.flights[i].getCallsign()) {
        return this.flights[i];
      }
    }
    return null;
  }

  selectFlight(flight) {
    if (this.selectedFlight) {
      document.getElementById(`select-${this.selectedFlight.getCallsign()}`).classList.remove('active');
      this.selectedFlight.deSelect();
    }
    this.selectedFlight = flight;
    this.selectedFlight.select();
    this.map.setView(flight.getLatLng(), 10);
    document.getElementById(`select-${this.selectedFlight.getCallsign()}`).classList.add('active');
  }

  getSelectedFlight() {
    return this.selectedFlight;
  }

  addFlight(flight) {
    this.flights.push(flight);
    flight.getMarker().addTo(this.map).on('click', () => {this.selectFlight(flight)});

    let currentCallsign = flight.getCallsign();
    let selectFlightButton = `<a href="#" class="list-group-item" id="select-${currentCallsign}">${flight.getFlightName()}</a>`
    document.getElementById('flight-selector').insertAdjacentHTML('beforeend', selectFlightButton);
    document.getElementById(`select-${currentCallsign}`).addEventListener('click', () => {
      this.selectFlight(flight);
    });
    // this.selectFlight();
    // flight.focus();
  }

  getSimulationTime() {
    let runTimeInMs = this.tickCount * 16;
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

    let commandFlight = this.getFlightByCallsign(commandArr[0]);
    if (commandFlight) {
      if (commandArr[1] === 'bearing') {
        commandFlight.setBearing(commandArr[2]);
        commandFlight.setAction('bearing');
      }
    }

    for (command of commandArr) {
      console.log(command);
    }
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