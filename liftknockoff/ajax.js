var myLat = 0;
var myLng = 0;
var myLatlng;
var myPosition;
var nearest_mile = Number.MAX_SAFE_INTEGER;
var METER_TO_MILES = 1609.34;
var myUsername = "pCH9E2zt";
var myOptions = {
    zoom: 15,
    center: myPosition,
    mapTypeId: google.maps.MapTypeId.ROADMAP
};
var map;

var request = new XMLHttpRequest();
var infowindow = new google.maps.InfoWindow();
var weinermobile_status = "The Weinermobile is nowhere to be seen.";
var nearest_role = "There is no other vehicle/passenger.";


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
        position: myPosition
    });
    myMarker.setMap(map);

    myMarker.addListener('click', function() {
        infowindow.setContent("I'm " + myUsername + " ." + nearest_role + "<br />" + weinermobile_status);
        infowindow.open(map, myMarker);
    });
}


function getOtherLocations() {
    request.open("POST", "https://hans-moleman.herokuapp.com/rides", true);
    request.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    request.onreadystatechange = function() {
        if (request.readyState == 4 && request.status == 200) {
            data = request.responseText;
            var arr = JSON.parse(data);
            var role_name;
            var roles;
            var role_icon;

            if ("vehicles" in arr) {
                role_name = "vehicle";
                roles = arr.vehicles;
                role_icon = "icons/vehicle.png";
            } else if ("passengers" in arr) {
                role_name = "passenger";
                roles = arr.passengers;
                role_icon = "icons/passenger.png";
            } else {
                alert("JSON data is wrong!")
            };

            var markers = new Array([roles.length]);
            var vLatlngs = new Array([roles.length]);

            for (var i in roles) {
                vLatlngs[i] = new google.maps.LatLng(roles[i].lat, roles[i].lng);
                var distance = google.maps.geometry.spherical.computeDistanceBetween(myLatlng, vLatlngs[i]) / METER_TO_MILES;
                markers[i] = new google.maps.Marker({
                    icon: role_icon,
                    position: vLatlngs[i],
                    name: roles[i].username,
                    info: "This " + role_name + " is " + roles[i].username + 
                            ".<br /> It is " + distance + " miles from me."
                });
                markers[i].setMap(map);
                if ((distance < nearest_mile) && (roles[i].username != "WEINERMOBILE")) {
                    nearest_mile = distance;
                    nearest_role = "The neareset " + role_name + " is " + nearest_mile + " away.";
                }
                if (roles[i].username == "WEINERMOBILE") {
					markers[i].info = "This is " + roles[i].username + ".<br /> It is " + distance + " miles from me.";
                    weinermobile_status = "The Weinermobile is " + distance + " miles from me !";
                    markers[i].icon = "icons/weinermobile.png";
                }
                google.maps.event.addListener(markers[i], 'click', function() {
                    infowindow.setContent(this.info);
                    infowindow.open(map, this);
                });
            }

        }

        else if (request.readyState == 4 && request.status != 200) {
            alert("Server responded with a bad status code!")
        }
    };
    request.send("username=" + myUsername + "&lat=" + myLat + "&lng=" + myLng);
}






