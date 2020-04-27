function newFlight(map, locations, speed) {
  console.log('skrt');
}


var locations = [
  {
    "lat": 39.8726,
    "recorded_at_ms": 1481571873000,
    "lng": -75.2371,
    "bearing": 135.5958557129
  },
  {
    "lat": 39.7789,
    "recorded_at_ms": 1481571873000,
    "lng": -74.9470,
    "bearing": 135.5958557129
  },
];
var mymap = L.map('mapid').setView([39.8736, -75.239], 10);
L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
  attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
  maxZoom: 18,
  id: 'mapbox.streets',
  accessToken: 'pk.eyJ1IjoibXVmZmlub290YSIsImEiOiJjanNobXRjZTIwbDN0NDNxdzV0bXlxd3dkIn0.7gthNlZt3be0G2AURWZlQg'
}).addTo(mymap);

var airportIcon = L.icon({
  iconUrl: 'assets/airport-icon.png',
  iconSize: [32, 32], // size of the icon
  shadowSize: [50, 64], // size of the shadow
  iconAnchor: [16, 32], // point of the icon which will correspond to marker's location
})

const PHLCoords = [39.8726, -75.2371];
const CCACoords = [39.7789, -74.9470];
const UKTCoords = [40.4350, -75.3809];

// Philidephia International Airport PHL : 39.8726,-75.2371
let phlMarker = L.marker(PHLCoords, { icon: airportIcon });

// Camden County Airport 19N : 39.7789,-74.9470
let ccaMarker = L.marker(CCACoords, { icon: airportIcon });

// Quakertown Airport UKT : 40.4350,-75.3809
let uktMarker = L.marker(UKTCoords, { icon: airportIcon });

phlMarker.addTo(mymap);
ccaMarker.addTo(mymap);
uktMarker.addTo(mymap);

var Icon = L.DivIcon.extend({
  createIcon: function () {
    // outerDiv.style.transform is updated by Leaflet
    var outerDiv = document.createElement('div');
    this.div = document.createElement('div');
    this.div.classList.add('ferrari');
    const img = document.createElement('img');
    img.src = './assets/plane-icon.svg';
    img.width = '30';
    this.div.appendChild(img);
    outerDiv.appendChild(this.div);
    return outerDiv;
  },
  rotate(deg) {
    this.div.style.transform = 'translate3d(-15px, -35px, 0) rotate(' + deg + 'deg)';
  },
  iconSize: [30, 70],
})

var icon = new Icon();
var marker = L.movingMarker([locations[0].lat, locations[0].lng], {
  destinations: locations.map(function (item, index, array) {
    var duration = index === 0 ? 1000 : item.recorded_at_ms - array[index - 1].recorded_at_ms;
    return {
      latLng: [item.lat, item.lng],
      duration: duration,
      bearing: item.bearing,
    };
  }),
  icon: icon,
});

marker.on('destinationsdrained', function () {
  console.log('done');
});

marker.on('start', function () {
  icon.rotate(locations[0].bearing);
});
marker.on('destination', function (destination) {
  if (destination.bearing !== undefined) {
    icon.rotate(destination.bearing);
  }
});

marker.addTo(mymap);

document.getElementById('button-emergency-landing').addEventListener('click', () => {
  let myCoord = L.latLng([39.88, -75.2371]);
  phlMarker.setLatLng(myCoord);
  console.log('should have moved');
});