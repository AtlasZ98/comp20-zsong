var myLat = 0;
var myLng = 0;
var myPosition = new google.maps.LatLng(myLat, myLng);

var myOptions = {
    zoom: 15,
    center: myPosition,
    mapTypeId: google.maps.MapTypeId.ROADMAP
};
var map;
var marker;
var infowindow = new google.maps.InfoWindow();

var request = new XMLHttpRequest();

function init() {
    map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
    getLocations();
}

function getLocations() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            myLat = position.coords.latitude;
            myLng = position.coords.longitude;
            renderMap();
            getOtherLocations();
        });
    }
    else {
        alert("Geolocation is not supported by your web browser.");
    }
}


function renderMap() {
    myPosition = new google.maps.LatLng(myLat, myLng);
    map.panTo(myPosition);

    marker = new google.maps.Marker({
        icon: "icons/me.png",
        position: myPosition,
        title: "The Weinermobile is X miles away from me!"
    });
    marker.setMap(map);
        
    // Open info window on click of marker
    google.maps.event.addListener(marker, 'click', function() {
        infowindow.setContent(marker.title);
        infowindow.open(map, marker);
    });
}

function getOtherLocations() {
    request.open("POST", "https://hans-moleman.herokuapp.com/rides", true);
    request.onreadystatechange = function() {
        if (request.readyState == 4 && request.status == 200) {
            console.log("Got the data back!");
            data = request.responseText;
            console.log(data);
        }
        else if (request.readyState == 4 && request.status != 200) {
        }
        else {
            console.log("In progress...");
        }
    };
    console.log("username=pCH9E2zt&lat=" + myLat + "&lng=" + myLng);
    request.send("username=pCH9E2zt&lat=" + myLat + "&lng=" + myLng);
}