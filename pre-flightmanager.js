

// Constants
const PHLCoords = [39.87189865112305, -75.24109649658203];
const DENCoords = [39.861698150635, -104.672996521];
const MIACoords = [25.79319953918457, -80.29060363769531];
const MSPCoords = [44.8820, -93.221802];
const JFKCoords = [40.63980103, -73.77890015];
const coordsArray = [PHLCoords, DENCoords, MIACoords, MSPCoords, JFKCoords];
const airportIcon = L.icon({
  iconUrl: "./assets/airport-circle.png",
  iconSize: [32, 32], // size of the icon
  iconAnchor: [16, 16], // point of the icon which will correspond to marker's location
});

const SIMULATION_SPEED = 10;

let flights = [];
let selectedFlight = 0;

let timeInterval = {};

function millisToSeconds(millis) {
  var seconds = (millis / 1000).toFixed(0);
  return seconds;
}

class Flight{
  constructor(map, origin, destination) {
    this.arrived = false; // Plane has(n't) landed
    this.takeoffTime = 0; // Takeoff time (ms)
    this.actionCounter = 0; // "animation ticks" counter
    this.map = map; // Interactive map
    this.origin = origin; // Origin LatLng
    this.destination = destination; //Destination LatLng
    this.inAction = false;
    this.id = Flight.getCounter();
    this.flightName = "Flight number: " + this.id;
    this.currentInterval = null;
    let planeIcon = L.icon({
      iconUrl: "./assets/flight-marker.png",
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });
    this.marker = L.marker(origin, { icon: planeIcon })
    this.marker.addTo(map);
  }

  getId() {
    return this.id;
  }

  static getCounter() {
    Flight.counter = (Flight.counter || 0) + 1;
    return Flight.counter;
  }

  focus() {
    flightMap.setView(this.marker.getLatLng(), 9);
  }

  cancelInterval() {
    clearInterval(this.currentInterval);
  }

  primeNewAction() {
    if (this.inAction) clearInterval(this.currentInterval);
    this.actionCounter = 0;
  }
  
  // Go to destination
  takeOff() {
    this.primeNewAction();

    let currentCoords = [this.marker.getLatLng().lat, this.marker.getLatLng().lng];
    let deltaLat = this.destination[0] - currentCoords[0]; //Difference between x coords
    let deltaLng = this.destination[1] - currentCoords[1]; //Difference between y coords
    let deltaLength = Math.sqrt(deltaLat * deltaLat + deltaLng * deltaLng);
    let normalizedX = deltaLat / deltaLength;
    let normalizedY = deltaLng / deltaLength;
    let scaledX = normalizedX * 0.0001;
    let scaledY = normalizedY * 0.0001;
    let radAngle = Math.atan2(normalizedY, normalizedX); //Angle from primary x axis in radians
    let degAngle = radAngle * (180 / Math.PI); //Angle in degrees
    this.marker.setRotationAngle(degAngle);

    let errorMargin = 0.01;
    this.inAction = true;
    this.currentInterval = setInterval(() => {
      this.marker.setLatLng(L.latLng(this.marker.getLatLng().lat + scaledX, this.marker.getLatLng().lng + scaledY));
  
      if (this.destination[0] - errorMargin <= this.marker.getLatLng().lat && this.marker.getLatLng().lat <= this.destination[0] + errorMargin 
          && this.destination[1] - errorMargin <= this.marker.getLatLng().lng && this.marker.getLatLng().lng <= this.destination[1] + errorMargin ) {
            clearInterval(this.currentInterval); //Stop moving the plane
            this.inAction = false;
            arrived = true;
          }
    }, SIMULATION_SPEED);
    this.takeoffTime = Date.now();
  }

  // Get time spent flying
  getFlightTime() {
    if (this.takeoffTime == 0) return '0';
    let millisFlightTime = Date.now() - this.takeoffTime;
    return millisToSeconds(millisFlightTime);
  }

  // crash
  emergencyLanding() {
    this.primeNewAction();
  }

  // Animate plane into holding pattern
  holdPattern() {
    this.primeNewAction();

    let currentCoords = [this.marker.getLatLng().lat, this.marker.getLatLng().lng];
    let deltaLat = this.destination[0] - currentCoords[0]; //Difference between x coords
    let deltaLng = this.destination[1] - currentCoords[1]; //Difference between y coords
    let deltaLength = Math.sqrt(deltaLat * deltaLat + deltaLng * deltaLng);
    let normalizedX = deltaLat / deltaLength;
    let normalizedY = deltaLng / deltaLength;
    let scaledX = normalizedX * 0.0001;
    let scaledY = normalizedY * 0.0001;

    this.inAction = true;
    this.currentInterval = setInterval(() => {
      ++this.actionCounter;
      let turnFreq = 1400;
      if (this.actionCounter % 1400 === 300 
          || this.actionCounter % 1400 === 700 
          || this.actionCounter % 1400 === 1000 
          || this.actionCounter % 1400 === 1) {
        this.marker.setRotationAngle(this.marker.options.rotationAngle + 90);
      }
      if (this.actionCounter % turnFreq < 300) {
        this.marker.setLatLng(L.latLng(this.marker.getLatLng().lat - scaledY, this.marker.getLatLng().lng + scaledX));
      }
      else if (this.actionCounter % turnFreq < 700) {
        this.marker.setLatLng(L.latLng(this.marker.getLatLng().lat - scaledX, this.marker.getLatLng().lng - scaledY));
      }
      else if (this.actionCounter % turnFreq < 1000) {
        this.marker.setLatLng(L.latLng(this.marker.getLatLng().lat + scaledY, this.marker.getLatLng().lng - scaledX));
      }
      else {
        this.marker.setLatLng(L.latLng(this.marker.getLatLng().lat + scaledX, this.marker.getLatLng().lng + scaledY));
      }
    }, SIMULATION_SPEED);
  }
  
}


// Initialize interactive map
var flightMap = L.map('mapid', {
  center: [39.8736, -75.239],
  zoom: 8,
  attributionControl: false,
  zoomControl: false
})
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
	subdomains: 'abcd',
	maxZoom: 19
}).addTo(flightMap);



// // Add airport markers
// // Philidephia International Airport PHL : 39.8726,-75.2371
// let phlMarker = L.marker(PHLCoords, { icon: airportIcon });
// // Camden County Airport 19N : 39.7789,-74.9470
// let ccaMarker = L.marker(CCACoords, { icon: airportIcon });
// // Quakertown Airport UKT : 40.4350,-75.3809
// let uktMarker = L.marker(UKTCoords, { icon: airportIcon });

for (coords of coordsArray) {
  L.marker(coords, {icon : airportIcon}).addTo(flightMap);
}

// phlMarker.addTo(flightMap);
// ccaMarker.addTo(flightMap);
// uktMarker.addTo(flightMap);





////////////////////////////////////////
////Event listeners for UI elements/////
////////////////////////////////////////
document.getElementById('button-emergency-landing').addEventListener('click', () => {
  flights[selectedFlight].emergencyLanding();
});

document.getElementById('button-hold').addEventListener('click', () => {
  flights[selectedFlight].holdPattern();
});

document.getElementById('button-takeoff').addEventListener('click', () => {
  flights[selectedFlight].takeOff();
});

let originDropdown =  document.getElementById('origin-dropdown');
let destinationDropdown = document.getElementById('destination-dropdown');
document.getElementById('button-add-flight').addEventListener('click', () => {
  document.getElementById('flight-time').innerHTML = 0;
  let newFlight = new Flight(flightMap, coordsArray[originDropdown.selectedIndex], coordsArray[destinationDropdown.selectedIndex]);
  flights.push(newFlight);
  
  selectedFlight = flights.length - 1;
  document.getElementById('inbound-flights').insertAdjacentHTML('beforeend', `<button type="button" class="btn btn-secondary" id=${selectedFlight}>${newFlight.flightName}</button>`);
  document.getElementById(selectedFlight).addEventListener('click', (e) => {
    selectedFlight = e.target.id;
    flights[selectedFlight].focus();
  });
  if (timeInterval) clearInterval(this.currentInterval);
  timeInterval = setInterval(() => {
    if (flights[selectedFlight].takeoffTime != 0) {
      document.getElementById('flight-time').innerHTML = flights[selectedFlight].getFlightTime();
    }
  }, 1000);
})