
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
	    
	   var gpsProvider = Ti.Geolocation.Android.createLocationProvider({
	    name: Ti.Geolocation.PROVIDER_GPS,
	    minUpdateTime: 60, 
	    minUpdateDistance: 100
		});
		
		Ti.Geolocation.Android.addLocationProvider(gpsProvider);
			
	 
	    Ti.Geolocation.addEventListener('location', function(e) {
	        if (e.error) {
	            alert('Error: ' + e.error);
	        } else {
	        	
	        	gpsProvider = Ti.Geolocation.Android.createLocationProvider({
			    name: Ti.Geolocation.PROVIDER_GPS,
			    minUpdateTime: 60, 
			    minUpdateDistance: 100
				});

				Ti.Geolocation.Android.addLocationProvider(gpsProvider);
	         	
	           	var mountainView = Map.createAnnotation({
			    latitude:28.578216,
			    longitude:-81.308165,
			    title:"Full Sail University",
			    subtitle:'Winter Park, FL',
			    pincolor:Map.ANNOTATION_BLUE
			});
				storedCoords.push(mountainView);
	           	
	          	           	
	           	var db = Ti.Database.open('geoCoords');
	           	var dbRows = db.execute('SELECT * from coords');
	           
	           	
	           	while(dbRows.isValidRow()){
	           		
	           	var dbLat = dbRows.fieldByName('lat');
	           	var dbLng = dbRows.fieldByName('lng');
	           	var dbTitle = dbRows.fieldByName('title');	
	           	
	           	var annotations = Map.createAnnotation({
	           		latitude: dbLat,
	           		longitude: dbLng,
	           		title: dbTitle,
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
				
				mapview.addEventListener('click', function(evt) {
    				var detailView = Ti.UI.createView({
    					
    				});
});
	        
	    }
	});//end event listener
		} else {
	   		 alert('Please enable location services');
				}
};

var url = "https://api.foursquare.com/v2/venues/search?ll=40.3142890930176,-76.6989822387695&client_id=3IDALSAWRC1OYQDFCB5SMTJEQ4NKPJWDGLYWX1HRQQGPSGIW&client_secret=IKQNC01TZRJRKWWZFELXJS0ETSVQPDIHGUJ1D2JFHBN43Z3P&v=20140726";

var remoteResponse = function(e){
	var json = JSON.parse(this.responseText);
	
	var db = Ti.Database.open('geoCoords');
	var dbTableCreate = db.execute('CREATE TABLE IF NOT EXISTS coords(id INTEGER PRIMARY KEY, lat REAL, lng REAL, title TEXT);');
	db.close();
	
	for(i=0;i<29;i++){ 
		
	if(Ti.Network.online){
		try 
		{var placesLat = json.response.venues[i].location.lat;
		var placesLng = json.response.venues[i].location.lng;
		var placesTitle = json.response.venues[i].name;
		} catch (e){
			alert("There was an issue pulling in " + e);
		};
	
		var db = Ti.Database.open('geoCoords');
		var insertRows = db.execute('INSERT INTO coords (lat,lng,title) VALUES (?,?,?)', placesLat, placesLng, placesTitle);
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
