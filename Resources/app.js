
var Map = require('ti.map');
var win = Titanium.UI.createWindow();

var currentTime = new Date();
var year = currentTime.getFullYear();
var month = currentTime.getMonth() + 1;
var day = currentTime.getDate();
var workingDate = year+""+month+""+day;
var today = workingDate.toString();

console.log(today);

var mountainView = Map.createAnnotation({
    latitude:37.390749,
    longitude:-122.081651,
    title:"Appcelerator Headquarters",
    subtitle:'Mountain View, CA',
    pincolor:Map.ANNOTATION_RED,
    myid:1
});

var mapview = Map.createView({
    mapType: Map.NORMAL_TYPE,
    region: {latitude:33.74511, longitude:-84.38993,
            latitudeDelta:0.01, longitudeDelta:0.01},
    animate:true,
    regionFit:true,
    userLocation:true,
    annotations:[mountainView]
});

win.add(mapview);
// Handle click events on any annotations on this map.
mapview.addEventListener('click', function(evt) {
    Ti.API.info("Annotation " + evt.title + " clicked, id: " + evt.annotation.myid);
});

var url;

var getCoords = function(){
	if (Ti.Geolocation.locationServicesEnabled) {
	    Ti.Geolocation.purpose = 'Get Current Location';
	    Ti.Geolocation.accuracy = Ti.Geolocation.ACCURACY_BEST;
	    Ti.Geolocation.distanceFilter = 10;
	    Ti.Geolocation.preferredProvider = Ti.Geolocation.PROVIDER_GPS;
	 
	    Ti.Geolocation.addEventListener('location', function(e) {
	        if (e.error) {
	            alert('Error: ' + e.error);
	        } else {
	           mapview.region = e.coords;
	           Ti.Geolocation.reverseGeocoder(e.coords.latitude, e.coords.longitude, function(z){
	           		var currentLocation = Map.createAnnotation({
					latitude:e.coords.latitude,
					longitude:e.coords.longitude,
					title:z.places[0].street,
					subtitle:z.places[0].zipcode,
					pincolor:Map.ANNOTATION_RED,
					myid:2
					});
	           	mapview.annotations = [mountainView,currentLocation];
	           	});
	        }
	    });
		} else {
	   		 alert('Please enable location services');
				}
};


var url = "https://api.foursquare.com/v2/venues/search?ll=40.3142890930176,-76.6989822387695&client_id=3IDALSAWRC1OYQDFCB5SMTJEQ4NKPJWDGLYWX1HRQQGPSGIW&client_secret=IKQNC01TZRJRKWWZFELXJS0ETSVQPDIHGUJ1D2JFHBN43Z3P&v=20140724";

console.log(url);

var remoteResponse = function(e){
	var json = JSON.parse(this.responseText);
	
	for(i = 0;i < 29; i++){
		var placesLat = json.response.venues[i].location.lat;
		var placesLng = json.response.venues[i].location.lng;
		var placesTitle = json.response.venues[i].name;
		var placesSubtitle = json.response.venues[i].location.formattedAddress;
		var booster = i+2;
		
		var makingPins = Map.createAnnotation({
			    latitude:placesLat,
			    longitude:placesLng,
			    title:placesTitle,
			    subtitle:placesSubtitle,
			    pincolor:Map.ANNOTATION_RED,
			    myid:i 
			});
		mapview.annotations.push(makingPins);
		console.log(makingPins.myid);
		console.log(mapview.annotations.length);
	};

};

var remoteError = function(e){
	Ti.API.debug("Status: " + this.status);
	Ti.API.debug("Response: " + this.responseText);
	Ti.API.debug("Error: " + e.error);
	alert("There was an error.");
};

var xhr = Ti.Network.createHTTPClient({
	onload: remoteResponse,
	onerror: remoteError,
	timeout: 20000
});

xhr.open("GET", url);
xhr.send();

getCoords();
win.open();
