'use strict';

const TICK_TRAVEL = 0.01; // Normalized displacement vector multiplie
const GPS_ERROR_MARGIN = 50; // Margin of error for landing detectio

export default class Flight{
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
    this.selectButton = {};
    const popupElement = `
      <div class="popup-callsign-container">
        <div class="popup-callsign-left">
          <p>／</p>
        </div>
        <div class="popup-callsign-right">
          <p>•${this.callsign}</p>
          <span class="stat-label"><p id=${this.callsign}-altitude>A:${this.getAltitude()}</p> <p id="${this.callsign}-bearing">B:${this.getBearing()}</p> <p id="${this.callsign}-speed">S:${this.getSpeed()}</p></span>
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
    this.selected = false;
    this.altitude = 10;
    this.speed = 0;
  }

  getId() {
    return this.id;
  }

  getAltitude() {
    return this.altitude;
  }

  setAltitude(altitude) {
    this.altitude = altitude;
  }

  setBearing(bearing) {
    this.bearing = bearing;
  }

  getBearing() {
    // let modAngle = this.marker.options.rotationAngle % 360;
    // return modAngle < 0 ? 360 + modAngle : modAngle;
    return Flight.calculateBearingFromPoints(this.origin, this.destination).toFixed(0);
  }

  getSpeed() {
    return this.speed;
  }

  setSpeed(speed) {
    this.speed = speed;
  }

  getAction() {
    return this.action;
  }

  select() {
    this.selected = true;

    
    let modAngle = this.marker.options.rotationAngle % 360;
    let regularDegree = modAngle < 0 ? 360 + modAngle : modAngle;

    document.getElementById(`big-speed`).innerHTML = this.speed;
    document.getElementById(`big-altitude`).innerHTML = this.altitude;
    document.getElementById(`big-bearing`).innerHTML = regularDegree.toFixed(0);
  }

  deSelect() {
    this.selected = false;
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
    let deltaLat = pointB.lat - pointA.lat; //Difference between x coords
    let deltaLng = pointB.lng - pointA.lng; //Difference between y coords
    let deltaLength = Math.sqrt(deltaLat * deltaLat + deltaLng * deltaLng);
    let normalizedX = deltaLat / deltaLength;
    let normalizedY = deltaLng / deltaLength;
    let radAngle = Math.atan2(normalizedY, normalizedX); //Angle from primary x axis in radians
    let degAngle = radAngle * (180 / Math.PI); //Angle in degrees
    return degAngle + 90;
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

  flyAtSetBearing() {
    let {bearing} = this;
    let currentCoords = this.marker.getLatLng();

    let bearingRad = bearing * (Math.PI / 180);
    let scaledX = Math.cos(bearingRad) * TICK_TRAVEL;
    let scaledY = Math.sin(bearingRad) * TICK_TRAVEL;

    let nextTickPos = L.latLng(currentCoords.lat + scaledX, currentCoords.lng + scaledY);
    this.marker.setLatLng(nextTickPos);
    this.marker.setRotationAngle(bearing);
    

  }

  onTick(tick) {
    this.currentTick = tick;
    let { actionStartTick } = this;

    this.setSpeed(0);
    this.setAltitude(19);
    switch (this.getAction()) {
      case 'fly': {
        this.takeOff();
        this.setSpeed(300);
        this.setAltitude(3000);
        break;
      }
      case 'bearing': {
        this.flyAtSetBearing();
        this.setSpeed(300);
        this.setAltitude(3000);
        break;
      }
      case 'hold': {
        this.setSpeed(300);
        this.setAltitude(3000);
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

    let modAngle = this.marker.options.rotationAngle % 360;
    let regularDegree = modAngle < 0 ? 360 + modAngle : modAngle;

    if (this.selected) {
      document.getElementById(`big-speed`).innerHTML = this.getSpeed();
      document.getElementById(`big-altitude`).innerHTML = this.getAltitude();
      document.getElementById(`big-bearing`).innerHTML = regularDegree.toFixed(0);
    }

    document.getElementById(`${this.getCallsign()}-speed`).innerHTML = 'S:' + this.getSpeed();

    document.getElementById(`${this.getCallsign()}-altitude`).innerHTML = 'A:' + this.getAltitude();


    document.getElementById(`${this.getCallsign()}-bearing`).innerHTML = 'B:' + regularDegree.toFixed(0);
  }
}