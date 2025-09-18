const Google_Key = "AIzaSyA-8CTDisLXo_SLzKRQMv7ds4porl_cq9Q";
const OWM_Key = "65074012804cee478133b2d1ef3e721b";

function fetchWeatherData() {
    const url = `https://www.googleapis.com/geolocation/v1/geolocate?key=${Google_Key}`;
    $.post(url, function (response) {
        const mylat = response.location.lat;
        const mylon = response.location.lng;

        const owm_url = `https://api.openweathermap.org/data/2.5/find?lat=${mylat}&lon=${mylon}&appid=${OWM_Key}&cnt=20&units=metric`;
        $.getJSON(owm_url, function (data) {
            const stations = data.list.slice(0, 5);
            
            
            const labels = stations.map(station => 
                station.name.length > 10 ? station.name.substring(0, 10) + "..." : station.name
            );
            const temperatures = stations.map(station => station.main.temp);

            renderChart(labels, temperatures);
        });
    });
}

function renderChart(labels, data) {
    const ctx = document.getElementById("weatherChart").getContext("2d");

    new Chart(ctx, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [{
                label: "Temperature (°C)",
                data: data,
                backgroundColor: "rgba(26, 109, 203, 0.4)",
                borderColor: "rgb(26, 109, 203)",
                borderWidth: 1,
                borderRadius: 5,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        font: {
                            size: 14
                        }
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        font: {
                            size: 12
                        },
                        maxRotation: 0, 
                        autoSkip: true,
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: "rgba(200, 200, 200, 0.2)"
                    }
                }
            }
        }
    });
}

$(document).ready(fetchWeatherData);
