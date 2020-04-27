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
var mymap = L.map('mapid').setView([39.8736,-75.239], 10);
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

var Icon = L.DivIcon.extend({
    createIcon: function() {
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
    destinations: locations.map(function(item, index, array) {
        var duration = index === 0 ? 1000 : item.recorded_at_ms - array[index - 1].recorded_at_ms;
        return {
            latLng: [item.lat, item.lng],
            duration: duration,
            bearing: item.bearing,
        };
    }),
    icon: icon,
});

marker.on('destinationsdrained', function() {
    console.log('done');
});

marker.on('start', function() {
    icon.rotate(locations[0].bearing);
});
marker.on('destination', function(destination) {
    if (destination.bearing !== undefined) {
        icon.rotate(destination.bearing);
    }
});

marker.addTo(mymap);


// Controls
var MoveControl = L.Control.extend({
    options: {position: 'topright'},
    onAdd(map) {
        var pauseBtn = document.createElement('button');
        pauseBtn.innerText = '⏸';
        pauseBtn.onclick = function() {
            marker.pause();
        };
        var playBtn = document.createElement('button');
        playBtn.innerText = '▶️';
        playBtn.onclick = function() {
            marker.start();
        };
        var div = document.createElement('div');
        div.appendChild(pauseBtn);
        div.appendChild(playBtn);
        return div;
    },
});
mymap.addControl(new MoveControl());