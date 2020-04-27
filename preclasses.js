const PHLCoords = [39.8726, -75.2371];
const CCACoords = [39.7789, -74.9470];
const UKTCoords = [40.4350, -75.3809];
let flightIDCounter = 0;
let flights = [];

function holdPattern() {
  console.log('yert');
}

function spawnPlane(map, origin, icon) {
  // add map marker
  let marker = L.marker(origin, { icon: icon });
  marker.addTo(map);

  // push flight data
  ++flightIDCounter;
  flights.push({
    flight: 'Flight number' + (flightIDCounter),
    id: flightIDCounter,
    marker: marker,
    currentInterval: null
  });
  return marker;
}

function takeOff(map, marker, destination) {
  let currentCoords = [marker.getLatLng().lat, marker.getLatLng().lng];
  let deltaLat = destination[0] - currentCoords[0]; //Difference between x coords
  let deltaLng = destination[1] - currentCoords[1]; //Difference between y coords
  let deltaLength = Math.sqrt(deltaLat * deltaLat + deltaLng * deltaLng);
  let normalizedX = deltaLat / deltaLength;
  let normalizedY = deltaLng / deltaLength;
  let radAngle = Math.atan2(normalizedY, normalizedX); //Angle from primary x axis in radians
  let degAngle = radAngle * (180 / Math.PI); //Angle in degrees
  marker.setRotationAngle(degAngle);

  marker.addTo(map);
  

  let markerInterval = setInterval(() => {
    marker.setLatLng(L.latLng(marker.getLatLng().lat + normalizedX * 0.0001, marker.getLatLng().lng + normalizedY * 0.0001));

    if (destination[0] - 0.001 <= marker.getLatLng().lat && marker.getLatLng().lat <= destination[0] + 0.001 
        && destination[1] - 0.001 <= marker.getLatLng().lng && marker.getLatLng().lng <= destination[1] + 0.001 ) {
          clearInterval(markerInterval); //Stop moving the plane
        }
  }, 15);
}

// Initialize interactive map
var flightMap = L.map('mapid').setView([39.8736, -75.239], 8);
L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
  attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
  maxZoom: 18,
  id: 'mapbox.streets',
  accessToken: 'pk.eyJ1IjoibXVmZmlub290YSIsImEiOiJjanNobXRjZTIwbDN0NDNxdzV0bXlxd3dkIn0.7gthNlZt3be0G2AURWZlQg'
}).addTo(flightMap);

let airportIcon = L.icon({
  iconUrl: "./assets/airport-icon.png",
  iconSize: [32, 32], // size of the icon
  iconAnchor: [16, 32], // point of the icon which will correspond to marker's location
});

// Add airport markers
// Philidephia International Airport PHL : 39.8726,-75.2371
let phlMarker = L.marker(PHLCoords, { icon: airportIcon });
// Camden County Airport 19N : 39.7789,-74.9470
let ccaMarker = L.marker(CCACoords, { icon: airportIcon });
// Quakertown Airport UKT : 40.4350,-75.3809
let uktMarker = L.marker(UKTCoords, { icon: airportIcon });

phlMarker.addTo(flightMap);
ccaMarker.addTo(flightMap);
uktMarker.addTo(flightMap);

// Make plane icon
let planeIcon = L.icon({
  iconUrl: "./assets/plane-icon.svg",
  iconSize: [40, 40],
  iconAnchor: [20, 20]
});

let plane1 = spawnPlane(flightMap, PHLCoords, planeIcon);

takeOff(flightMap, plane1, CCACoords,);


document.getElementById('button-add-flight').addEventListener('click', () => {
  let myCoord = L.latLng([39.88, -75.2371]);
  phlMarker.setLatLng(myCoord);
  console.log('should have moved');
  myInterval = setInterval(() => {plane1.setLatLng(L.latLng(plane1.getLatLng().lat + 0.001, plane1.getLatLng().lng + 0.001))}, 10);
});