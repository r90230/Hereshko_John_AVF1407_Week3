
var Map = require('ti.map');
var win = Titanium.UI.createWindow();

var search = Ti.UI.createTextField({
	top: 30,
	width: "80%",
	height: 50,
	backgroundColor: 'white',
	borderColor: 'grey',
	hintText: "Search a location!",
	textAlign: 'center'
});

	var currentTime = new Date();
	var year = currentTime.getFullYear();
	var month = currentTime.getMonth() + 1;
	if (month.length = 1)
	{month = "0" + month;};
	var day = currentTime.getDate();
	var workingDate = year+""+month+""+day;
	var today = workingDate.toString();
	
	

var getCoords = function(){
	if (Ti.Geolocation.locationServicesEnabled) {
	    Ti.Geolocation.purpose = 'Get Current Location';
	    Ti.Geolocation.accuracy = Ti.Geolocation.ACCURACY_BEST;
	    Ti.Geolocation.distanceFilter = 20;
	    Ti.Geolocation.preferredProvider = Ti.Geolocation.PROVIDER_GPS;
	    
	    win.removeAllChildren();
	    
	    var storedCoords = [];
	 
	    Ti.Geolocation.addEventListener('location', function(e) {
	        if (e.error) {
	            alert('Error: ' + e.error);
	        } else {
	        	try
	        	{var myLat = e.coords.latitude;
	        	var myLng = e.coords.longitude;}
	        	catch(e)
	        	{alert("Error: " +e.error);};
	         	
	           	var mountainView = Map.createAnnotation({
			    latitude:28.578216,
			    longitude:-81.308165,
			    title:"Full Sail University",
			    subtitle:'Winter Park, FL',
			    pincolor:Map.ANNOTATION_BLUE
			});
				storedCoords.push(mountainView);
				
					if(myLat != null && myLng != null)
					{foursquareCall(myLat,myLng);}
					
					else if (myLat = null && myLng !=null)
					{alert("Latitude not found!");}
					else if (myLng = null && myLat !=null)
					{alert("Longitude not found!");}
					else
					{alert("Location not properly found!");};
			       	
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
				mapview.add(search);
				win.add(mapview);
				
				Ti.Geolocation.addEventListener('calibration', function(evt) {
	           	storedCoords.push(annotations);
				});
	    }
	});//end event listener
		} else {
	   		 alert('Please enable location services');
				}
};

var foursquareCall = function(lat,lng){
	var currentTime = new Date();
	var year = currentTime.getFullYear();
	var month = currentTime.getMonth() + 1;
	if (month.length = 1)
	{month = "0" + month;};
	var day = currentTime.getDate();
	var workingDate = year+""+month+""+day;
	var today = workingDate.toString();
	
	
	var url = "https://api.foursquare.com/v2/venues/search?ll="+lat+","+lng+"&intent=browse&radius=800&limit=10&client_id=3IDALSAWRC1OYQDFCB5SMTJEQ4NKPJWDGLYWX1HRQQGPSGIW&client_secret=IKQNC01TZRJRKWWZFELXJS0ETSVQPDIHGUJ1D2JFHBN43Z3P&v="+today;
	
	console.log(url);
				
	xhr.open("GET", url);
	xhr.send();
};

var searchLocation = function(){
	if (search.value != null){
		var google = "http://maps.google.com/maps/api/geocode/json?address="+search.value;
		
		var xhrGoogle = Ti.Network.createHTTPClient({
			onload: function(e){
				var jsonLocation = JSON.parse(this.responseText);
				try
				{var city = jsonLocation.results[0].address_components[0].long_name;
				var state = jsonLocation.results[0].address_components[2].short_name;
				var searchLocation = city+","+state;
				var searchLat = jsonLocation.results[0].geometry.location.lat;
				var searchLng = jsonLocation.results[0].geometry.location.lng;}
				catch(e)
				{alert("Man, what a bummer! I had an error finding "+e.responseText+"!");};
				
				var url = "https://api.foursquare.com/v2/venues/search?near="+searchLocation+"&intent=browse&radius=800&limit=10&client_id=3IDALSAWRC1OYQDFCB5SMTJEQ4NKPJWDGLYWX1HRQQGPSGIW&client_secret=IKQNC01TZRJRKWWZFELXJS0ETSVQPDIHGUJ1D2JFHBN43Z3P&v="+today;
				
				xhr.open("GET", url);
				xhr.send();
				
			},
			onerror: remoteError,
			timeout: 20000
});
		
		xhrGoogle.open("GET", google);
		xhrGoogle.send();
	};
};

var remoteError = function(e){
	Ti.API.debug("Status: " + this.status);
	Ti.API.debug("Response: " + this.responseText);
	Ti.API.debug("Error: " + e.error);
	alert("There was an error. " +e.error+ ", and error code: " +this.statusText);
};

var remoteResponse = function(e){
	var json = JSON.parse(this.responseText);
	
	var db = Ti.Database.open('geoCoords');
	var dbTableCreate = db.execute('CREATE TABLE IF NOT EXISTS coords(id INTEGER PRIMARY KEY, lat REAL, lng REAL, title TEXT);');
	db.close();
	
	for(i=0;i<9;i++){ 
		
	if(Ti.Network.online){
		var db = Ti.Database.open('geoCoords');
		try 
		{var placesLat = json.response.venues[i].location.lat;
		var placesLng = json.response.venues[i].location.lng;
		var placesTitle = json.response.venues[i].name;
		} catch (e){
		alert("Error with piece of database fill: "+e.error);
		};//end catch
	
		
		var insertRows = db.execute('INSERT INTO coords (lat,lng,title) VALUES (?,?,?)', placesLat, placesLng, placesTitle);
		var lastRow = db.lastInsertRowId;
		console.log(placesLng);
		console.log(i);
		
		
		db.close();
		};
	};
};

var xhr = Ti.Network.createHTTPClient({
	onload: remoteResponse,
	onerror: remoteError,
	timeout: 20000
});


search.addEventListener("return", searchLocation);



getCoords();
win.open();
