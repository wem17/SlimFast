
(function (){
  var mymap = L.map('mapid').setView([39.8736,-75.239], 9);
  L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
  attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
  maxZoom: 18,
  id: 'mapbox.streets',
  accessToken: 'pk.eyJ1IjoibXVmZmlub290YSIsImEiOiJjanNobXRjZTIwbDN0NDNxdzV0bXlxd3dkIn0.7gthNlZt3be0G2AURWZlQg'
}).addTo(mymap);

var popup = L.popup();

function onMapClick(e) {
    popup
        .setLatLng(e.latlng)
        .setContent("You clicked the map at " + e.latlng.toString())
        .openOn(mymap);
}

var airportIcon = L.icon({
  iconUrl: 'assets/airport-icon.png',
  iconSize:     [32, 32], // size of the icon
  shadowSize:   [50, 64], // size of the shadow
  iconAnchor:   [16, 32], // point of the icon which will correspond to marker's location
})

const PHLCoords = [39.8726, -75.2371];
const CCACoords = [39.7789,-74.9470];
const UKTCoords = [40.4350,-75.3809];

// Philidephia International Airport PHL : 39.8726,-75.2371
L.marker(PHLCoords, {icon: airportIcon}).addTo(mymap);

// Camden County Airport 19N : 39.7789,-74.9470
L.marker(CCACoords, {icon: airportIcon}).addTo(mymap);

// Quakertown Airport UKT : 40.4350,-75.3809
L.marker(UKTCoords, {icon: airportIcon}).addTo(mymap);


// var myMovingMarker = L.Marker.movingMarker([PHLCoords, CCACoords],[20000]).addTo(mymap);
// myMovingMarker.start();



mymap.on('click', onMapClick);
})()