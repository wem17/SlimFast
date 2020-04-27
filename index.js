var Leaflet = L;
var noop = function () { };
;
Leaflet.MovingMarker = Leaflet.Marker.extend({
    initialize: function (startLatLng, options) {
        if (options === void 0) { options = {}; }
        this.startLatLng = L.latLng(startLatLng);
        this.isZooming = false;
        this.isPaused = false;
        this.defaultDuration = 1000;
        Leaflet.Marker.prototype.initialize.call(this, startLatLng, options);
        this.fire('destination', startLatLng);
        if (!options.destinations || !options.destinations.length) {
            return this.fire('destinationsdrained');
        }
        this.destinations = options.destinations;
        this.step();
    },
    onAdd: function (map) {
        var _this = this;
        Leaflet.Marker.prototype.onAdd.call(this, map);
        this.start();
        this.map = map;
        map.addEventListener('zoomstart', function () { _this.isZooming = true; });
        map.addEventListener('zoomend', function () { _this.isZooming = false; });
    },
    step: function () {
        var nextDestination = this.destinations.shift();
        this.fire('destination', nextDestination);
        this.nextLatLng = L.latLng(nextDestination.latLng);
        this.duration = nextDestination.duration || this.defaultDuration;
    },
    start: function () {
        this.startedAt = Date.now();
        this.isPaused = false;
        this.fire('start');
        this.requestAnimationFrameSetLatLng();
    },
    pause: function () {
        this.fire('paused');
        this.isPaused = true;
    },
    requestAnimationFrameSetLatLng: function () {
        if (!this.isPaused) {
            requestAnimationFrame(this.setCurrentLatLng.bind(this));
        }
    },
    setCurrentLatLng: function () {
        var now = Date.now();
        var end = this.startedAt + this.duration;
        // Schedule the next tick
        if (now < end) {
            this.requestAnimationFrameSetLatLng();
        }
        else {
            if (this.destinations.length) {
                // step to next destination
                this.startedAt = Date.now();
                this.startLatLng = this.nextLatLng;
                this.step();
                this.requestAnimationFrameSetLatLng();
            }
            else {
                this.setLatLng(this.nextLatLng);
                return this.fire('destinationsdrained');
            }
        }
        if (!this.isZooming) {
            var t = now - this.startedAt;
            var lat = this.startLatLng.lat + ((this.nextLatLng.lat - this.startLatLng.lat) / this.duration * t);
            var lng = this.startLatLng.lng + ((this.nextLatLng.lng - this.startLatLng.lng) / this.duration * t);
            this.setLatLng({ lat: lat, lng: lng });
            var rawPoint = this.map.project({ lat: lat, lng: lng });
            var point = rawPoint._subtract(this.map.getPixelOrigin());
            L.DomUtil.setPosition(this.getElement(), point);
        }
        return;
    }
});
Leaflet.movingMarker = function (startLatLng, options) {
    if (options === void 0) { options = {}; }
    return new Leaflet.MovingMarker(startLatLng, options);
};
//# sourceMappingURL=index.js.map