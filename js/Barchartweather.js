const Google_Key = "AIzaSyA-8CTDisLXo_SLzKRQMv7ds4porl_cq9Q";
const OWM_Key = "65074012804cee478133b2d1ef3e721b";

function fetchWeatherData() {
  if (!navigator.geolocation) { console.error("Geolocation not supported"); return; }
  const OWM_Key = (window.CONFIG && window.CONFIG.OWM_KEY) || OWM_Key; // fallback if you kept the const

  navigator.geolocation.getCurrentPosition(function(pos) {
    const mylat = pos.coords.latitude;
    const mylon = pos.coords.longitude;
    const url = `https://api.openweathermap.org/data/2.5/find?lat=${mylat}&lon=${mylon}&appid=${OWM_Key}&cnt=20&units=metric`;

    $.getJSON(url, function (data) {
      const stations = data.list.slice(0, 5);
      const labels = stations.map(s => s.name.length > 10 ? s.name.substring(0,10)+"..." : s.name);
      const temperatures = stations.map(s => s.main.temp);
      renderChart(labels, temperatures);
    }).fail(err => console.error("OWM fetch error:", err));
  }, err => console.error("Geolocation error:", err));
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

