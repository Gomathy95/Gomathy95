$(document).ready(function () {
    const apiToken = "c056ca09dbcd798da8af95cf2ff9a8bc6eecbd7f";
    var map1 = L.map('map').setView([20, 0], 2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map1);

    function getLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(onLocationSuccess, onLocationError);
        } else {
            alert("Geolocation is not supported by this browser.");
        }
    }

    function onLocationSuccess(position) {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        fetchCurrentLocation(lat, lon);
        fetchNearbyCities(lat, lon);
    }

    function onLocationError(error) {
        console.error("Error getting location", error);
        alert("Unable to retrieve your location. Please enable location services.");
    }

    function fetchCurrentLocation(lat, lon) {
        const url = `https://api.waqi.info/feed/geo:${lat};${lon}/?token=${apiToken}`;

        $.getJSON(url, function (response) {
            if (response.status === "ok") {
                const data = response.data;
                const cityName = data.city.name;
                const aqi = data.aqi;

                L.marker([lat, lon]).addTo(map1)
                    .bindPopup(`<b>Your Location</b><br>${cityName}<br>AQI: ${aqi}`)
                    .openPopup();
            }
        }).fail(function (error) {
            console.error("Error fetching current location AQI data:", error);
        });
    }

    function fetchNearbyCities(lat, lon) {
        const url = `https://api.waqi.info/map/bounds/?latlng=${lat - 2},${lon - 2},${lat + 2},${lon + 2}&token=${apiToken}`;

        $.getJSON(url, function (response) {
            if (response.status === "ok") {
                const data = response.data.slice(0, 75); 
                data.forEach((city) => {
                    const cityName = city.station.name;
                    const aqi = city.aqi;
                    const lat = city.lat;
                    const lon = city.lon;

                    L.marker([lat, lon]).addTo(map1)
                        .bindPopup(`<b>${cityName}</b><br>AQI: ${aqi}`);
                });
            }
        }).fail(function (error) {
            console.error("Error fetching nearby AQI data:", error);
        });
    }

    $("#refresh").click(function () {
        map1.eachLayer(function (layer) {
            if (layer instanceof L.Marker) {
                map1.removeLayer(layer);
            }
        });
        getLocation();
    });

    getLocation();
});