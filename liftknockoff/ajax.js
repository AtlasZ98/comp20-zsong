var myLat = 0;
var myLng = 0;
var myLatlng;
var myPosition;
var nearest_mile = 0;
var METER_TO_MILES = 1609.34;

var myOptions = {
    zoom: 15,
    center: myPosition,
    mapTypeId: google.maps.MapTypeId.ROADMAP
};
var map;

var request = new XMLHttpRequest();

var weinermobile_status = "The Weinermobile is nowhere to be seen.";
var nearest_vehicle = "There is no other vehicle.";


function init() {
    map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
    getLocations();
}

function getLocations() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            myLat = position.coords.latitude;
            myLng = position.coords.longitude;
            myLatlng = new google.maps.LatLng(myLat, myLng);
            renderMap();
            getOtherLocations();
        });
    }
    else {
        alert("Pity. Geolocation is not supported by your web browser.");
    }
}


function renderMap() {
    myPosition = new google.maps.LatLng(myLat, myLng);
    map.panTo(myPosition);

    var myMarker = new google.maps.Marker({
        icon: "icons/me.png",
        position: myPosition,
    });
    myMarker.setMap(map);
        
    var myInfowindow = new google.maps.InfoWindow();
    myMarker.addListener('click', function() {
        myInfowindow.setContent(weinermobile_status + "<br />" + nearest_vehicle);
        myInfowindow.open(map, myMarker);
    });
}


function getOtherLocations() {
    request.open("POST", "https://hans-moleman.herokuapp.com/rides", true);
    request.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    request.onreadystatechange = function() {
        if (request.readyState == 4 && request.status == 200) {
            data = request.responseText;
            var arr = JSON.parse(data);
            var markers = new Array([arr.vehicles.length]);
            var vLatlngs = new Array([arr.vehicles.length]);
            var infowindows = new Array([arr.vehicles.length]);

            for (var i in arr.vehicles) {
                vLatlngs[i] = new google.maps.LatLng(arr.vehicles[i].lat, arr.vehicles[i].lng);
                var distance = google.maps.geometry.spherical.computeDistanceBetween(myLatlng, vLatlngs[i]) / METER_TO_MILES;
                if (arr.vehicles[i].username == "WEINERMOBILE") {
                    weinermobile_status = "The Weinermobile is " + distance + " miles from me !";
                    markers[i] = new google.maps.Marker({
                        icon: "icons/weinermobile.png",
                        position: vLatlngs[i],
                    });
                    markers[i].setMap(map);
                } else {
                    markers[i] = new google.maps.Marker({
                        icon: "icons/vehicle.png",
                        position: vLatlngs[i],
                    });
                    markers[i].setMap(map);
                    if (distance > nearest_mile) {
                        nearest_mile = distance;
                        nearest_vehicle = "The neareset vehicles is " + nearest_mile + " away.";
                    }
                }
                markers[i].addListener('click', function() {
                    infowindows[i] = new google.maps.InfoWindow();
                    infowindows[i].setContent("This vehicle is " + arr.vehicles[i].username + ".<br /> It is " + distance + " miles from me.");
                    infowindows[i].open(map, markers[i]);
                });
            }

        }

        else if (request.readyState == 4 && request.status != 200) {
            alert("Server responded with a bad status code!")
        }
    };
    request.send("username=pCH9E2zt&lat=" + myLat + "&lng=" + myLng);
}






