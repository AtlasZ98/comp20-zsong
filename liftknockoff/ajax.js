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
    
    function init() {
        map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
        getMyLocation();
    }

    function getMyLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
                myLat = position.coords.latitude;
                myLng = position.coords.longitude;
                renderMap();
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