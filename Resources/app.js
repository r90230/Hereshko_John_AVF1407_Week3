
var Map = require('ti.map');
var win = Titanium.UI.createWindow();

var currentTime = new Date();
var year = currentTime.getFullYear();
var month = currentTime.getMonth() + 1;
var day = currentTime.getDate();
var workingDate = year+""+month+""+day;
var today = workingDate.toString();

var getCoords = function(){
	if (Ti.Geolocation.locationServicesEnabled) {
	    Ti.Geolocation.purpose = 'Get Current Location';
	    Ti.Geolocation.accuracy = Ti.Geolocation.ACCURACY_BEST;
	    Ti.Geolocation.distanceFilter = 10;
	    Ti.Geolocation.preferredProvider = Ti.Geolocation.PROVIDER_GPS;
	    
	    var storedCoords = [];
	 
	    Ti.Geolocation.addEventListener('location', function(e) {
	        if (e.error) {
	            alert('Error: ' + e.error);
	        } else {
	           Ti.Geolocation.reverseGeocoder(e.coords.latitude, e.coords.longitude, function(z){
	           		var currentLocation = Map.createAnnotation({
					latitude:e.coords.latitude,
					longitude:e.coords.longitude,
					title:z.places[0].street,
					subtitle:z.places[0].zipcode,
					pincolor:Map.ANNOTATION_RED,
					myid:2
					});
					storedCoords.push(currentLocation);
	           	});
	           	
	           	
	           	var mountainView = Map.createAnnotation({
			    latitude:37.390749,
			    longitude:-122.081651,
			    title:"Appcelerator Headquarters",
			    subtitle:'Mountain View, CA',
			    pincolor:Map.ANNOTATION_RED
			});
				storedCoords.push(mountainView);
	           	
	          	           	
	           	var db = Ti.Database.open('geoCoords');
	           	var dbRows = db.execute('SELECT * from coords');
	           	var dbLat = dbRows.fieldByName('lat');
	           	var dbLng = dbRows.fieldByName('lng');
	           	var dbTitle = dbRows.fieldByName('title');
	           	var dbSubtitle = dbRows.fieldByName('subtitle');
	           	
	           	while(dbRows.isValidRow()){
	           	
	           	var annotations = Map.createAnnotation({
	           		latitude: dbLat,
	           		longitude: dbLng,
	           		title: dbTitle,
	           		subtitle: dbSubtitle,
	           		pincolor: Map.ANNOTATION_PURPLE,
	           		animate: true
	           	});
	           	storedCoords.push(annotations);
	           	dbRows.next();
	           	};
	           	var mapview = Map.createView({
			    mapType: Map.NORMAL_TYPE,
			    region: e.coords,
			    animate:true,
			    regionFit:true,
			    userLocation:true,
				});
				mapview.setAnnotations(storedCoords);
				win.add(mapview);
	        
	    }
	});//end event listener
		} else {
	   		 alert('Please enable location services');
				}
};


var url = "https://api.foursquare.com/v2/venues/search?ll=40.3142890930176,-76.6989822387695&client_id=3IDALSAWRC1OYQDFCB5SMTJEQ4NKPJWDGLYWX1HRQQGPSGIW&client_secret=IKQNC01TZRJRKWWZFELXJS0ETSVQPDIHGUJ1D2JFHBN43Z3P&v=20140724";

var remoteResponse = function(e){
	var json = JSON.parse(this.responseText);
	
	var db = Ti.Database.open('geoCoords');
	var dbTableCreate = db.execute('CREATE TABLE IF NOT EXISTS coords(id INTEGER PRIMARY KEY, lat REAL, lng REAL, title TEXT, subtitle TEXT);');
	db.close();
	
	for(i=0;i<29;i++){ 
	var placesLat = json.response.venues[i].location.lat;
	var placesLng = json.response.venues[i].location.lng;
	var placesTitle = json.response.venues[i].name;
	var placesSubtitle = json.response.venues[i].location.city;
	
		if(Ti.Network.online){
			var db = Ti.Database.open('geoCoords');
			var insertRows = db.execute('INSERT INTO coords (lat,lng,title,subtitle) VALUES (?,?,?,?)', placesLat, placesLng, placesTitle, placesSubtitle);
			var lastRow = db.lastInsertRowId;
			db.close();
		};
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
