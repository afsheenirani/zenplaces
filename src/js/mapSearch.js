var map,
	infowindow,
	service,
	allMarkers = [],
	startLocation = {lat: 40.7280004, lng: -74.0358875};

var goldStar = {
	path: 'M 125,5 155,90 245,90 175,145 200,230 125,180 50,230 75,145 5,90 95,90 z',
	fillColor: 'gold',
	fillOpacity: 1,
	scale: 0.1,
	strokeColor: 'gold',
	strokeWeight: 1
};

/*
 * Sets the initial location on the map.
 * 1. Attempts to determine the user's location using the Geolocation API.
 * 2. Or Else defaults to a hardcoded location
 */
function setStartLocation() {
	var info = '<div id="startLoc">You are here!</div>';

	if( navigator.geolocation ) {		
		var geoOptions = {
			timeout: 2 * 1000,			// Timeout after 2 secs
			enableHighAccuracy: false,	// How accurate results do we need? Approx. is okay.
			maximumAge: 15 * 60 * 1000,	// Re-use a previously geolocated location from within the last 15 minutes
		}

		var geoSuccess = function(position) {
			startLocation = {
				lat: position.coords.latitude,
				lng: position.coords.longitude,
			};			
			addMarker(startLocation, info, goldStar, true);
		};

		var geoError = function(error) {
			console.error('Error occured obtaining geolocation. Will use defaultLocation.');
			addMarker(startLocation, info, null, true);
		};

		navigator.geolocation.getCurrentPosition(geoSuccess, geoError, geoOptions);
	};
};

/*
 * Adds a marker on the map at the specified location
 * Also sets the contents of the InfoWindow of the marker.
 */
function addMarker(location, info, icon, triggerClick) {
	map.setCenter(location);

	var pin = new google.maps.Marker({
		map: map,
		position: location,
	});

	if(icon) {
		pin.setIcon(icon);
	}

	infowindow = new google.maps.InfoWindow();
	google.maps.event.addListener(pin, 'click', function() {
		infowindow.setContent(info);
		infowindow.open(map, this);
	});
	
	if(triggerClick)
		new google.maps.event.trigger( pin, 'click' );

	allMarkers.push(pin);
}

/*
 * Initializes the Map
 */
function initMap() {
	map = new google.maps.Map(document.getElementById('zen-map'), {
		zoom: 15
	});

	setStartLocation();

	var searchInput = document.getElementById('search-text');
	var searchOptions = {
		'location': startLocation,
		'radius': 500,
	};
	autocomplete = new google.maps.places.Autocomplete(searchInput, searchOptions);
	autocomplete.bindTo('bounds', map);
}

/*
 * Sets the map for all markers
 */
function setMapOnAllMarkers(map) {
	for (var i = 1; i < allMarkers.length; i++) {
		allMarkers[i].setMap(map);
	}
}

/*
 * Clears all the markers from the map.
 * Only retains the marker for the starting location.
 */
function clearAllMarkers() {
	setMapOnAllMarkers(null);
	allMarkers = [ allMarkers[ 0 ] ];
}

/*
 * Performs a nearby search for the inp
 */
function searchPlaces() {
	clearAllMarkers();
	service = new google.maps.places.PlacesService(map);
	var searchText = $('#search-text').val();
	service.nearbySearch({
		location: startLocation,
		radius: 500,
		rankby: google.maps.places.RankBy.DISTANCE,
		types: ['store'],
		name: [ searchText ]
	}, nearbySearchCallback);
}

/*
 * Checks if the input event is the Enter key
 * and calls searchPlaces() if true;
 */
function isEnter() {
	$('#search-text').keyup(function(event){
	    if(event.keyCode == 13){
	        $('#search-button').click();
	    }
	});
}

/*
 * Callback for any search results.
 * It will perform two functions:
 * 1. Setup markers on the map for each result
 * 2. Display results 
 */
function nearbySearchCallback(results, status) {
	if (status === google.maps.places.PlacesServiceStatus.OK) {
		var resultsHtml = '';
		
		if(results.length > 0) {
			for (var i = 0; i < results.length; i++) {
				var location = results[i].geometry.location;
				var resultId = 'result-' + results[i].place_Id;

				// Setting up the markers
				var markerInfo = '<div id="marker-' + resultId + '" class="marker-result">';
				markerInfo += results[i].name;
				markerInfo += '</div></div>';
				addMarker(location, markerInfo, null, false);
				
				resultsHtml = '';
				results.forEach( function(result, index) {
					var resultHtml = '';

					// div wrapper for a Search PlaceResult
					resultHtml += '<div id="search-result-' + result.place_id + '" class="search-result" onclick="searchResultClicked(' + index + ')">';

					// div wrapper for Search PlaceResult details
					resultHtml += '<div id="search-result-details" class="search-result-details">';

					// Set the name of the PlaceResult
					resultHtml += '<div id="result-name" class="result-name">' + result.name + '</div>';
					
					// Add vicinity
					resultHtml += '<div id="result-vicinity" class="result-vicinity">' + result.vicinity + '</div>';
					
					// Set the Rating of the PlaceResult
					var rating = result.rating ? result.rating : 0;
					resultHtml += '<div id="result-stars" class="result-stars" data-rating="' + rating + '" data-num-stars="5"></div>';

					var isOpen = '';
					if(result.opening_hours) {
						isOpen = result.opening_hours.open_now ? 'open' : 'closed';
					}
					else if (result.permanently_closed) {
						isOpen = 'closed';
					}
					resultHtml += '<div id="result-isopen-' + isOpen + '" class="result-isopen-' + isOpen + '">' + isOpen + '</div>';
					resultHtml += '</div>';

					// div for PlaceResult photo
					resultHtml += '<div id="search-result-photo-container" class="search-result-photo-container">';
					var photoUrl = '../dist/images/result-no-photo.png';
					if(result.photos) {
						if(result.photos.length > 0) {
							photoUrl = result.photos[ 0 ].getUrl({ 
								maxHeight: 85, 
								maxWidth: 80							
							});
						}
					}
					resultHtml += '<div id="search-result-photo" class="search-result-photo" style="background-image: url(' + photoUrl + ')" />';
					resultHtml += '</div>';

					resultHtml += '</div>';
					resultsHtml += resultHtml;
				});

				$('#search-results').html(resultsHtml);
				$('.result-stars').stars();		
			}
		}
		else {
			resultsHtml += 'No results found';
			$('#search-results').html(resultsHtml);
		}		
	}
}

/*
 * When a search result is clicked, it triggers
 * the click of the associated map marker.
 */
function searchResultClicked(index) {
	var marker = allMarkers[ ( index + 1 ) ];
	new google.maps.event.trigger( marker, 'click' );
}

/*
 * A sample Place Details query.
 * This is currently not being used.
 */
function getPlaceDetails(placeId) {
	var placeRequest = {
		placeId: placeId
	};
	service.getDetails(placeRequest, placeDetailsCallback);
}

/*
 * A sample Place Details query callback.
 * This is currently not being used.
 */
function placeDetailsCallback(placeResult, placesServiceStatus) {
	var res = '';
	if (placesServiceStatus === google.maps.places.PlacesServiceStatus.OK) {
		console.log(placeResult);
	}

	return res;
}

