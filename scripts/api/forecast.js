
export function renderForecastFromRaw(raw) {
    if (!raw || !raw.hourly) {
        console.warn("No raw data for forecast");
        return;
    }
    const daily = buildDailySummaries(raw);

    const todayStr = new Date().toISOString().slice(0, 10);
    const futureDays = daily.filter(d => d.date > todayStr);

    const nextSix = futureDays.slice(0, 6);

    const topThree = nextSix.slice(0, 3);
    const rest = nextSix.slice(3);

    const topEl = document.querySelector(".forecast-container .top-row");
    const bottomEl = document.querySelector(".forecast-container .bottom-row");

    if (!topEl || !bottomEl) {
        console.warn("Missing .forecast-container .top-row / .bottom-row in HTML.");
        return;
    }

    topEl.innerHTML = topThree.map(makeForecastCardHTML).join("");
    bottomEl.innerHTML = rest.map(makeForecastCardHTML).join("");
}

function buildDailySummaries(data) {
    const grouped = {}; // { 'YYYY-MM-DD': { arrays... } }

    for (let i = 0; i < data.hourly.time.length; i++) {
        const date = data.hourly.time[i].split("T")[0];

        if (!grouped[date]) {
            grouped[date] = {
                temps: [],
                feels: [],
                humidity: [],
                wind: [],
                cloud: [],
                uv: [],
                precip: []
            };
        }

        grouped[date].temps.push(n(data.hourly.temperature_2m[i]));
        grouped[date].feels.push(n(data.hourly.apparent_temperature[i]));
        grouped[date].humidity.push(n(data.hourly.relative_humidity_2m[i]));
        grouped[date].wind.push(n(data.hourly.wind_speed_10m[i]));
        grouped[date].cloud.push(n(data.hourly.cloud_cover[i]));
        grouped[date].uv.push(n(data.hourly.uv_index[i]));
        grouped[date].precip.push(n(data.hourly.precipitation_probability[i]));
    }

    const days = Object.entries(grouped).map(([date, v]) => ({
        date,
        temp: avg(v.temps),
        feelsLike: avg(v.feels),
        humidity: avg(v.humidity),
        wind: avg(v.wind),
        cloud: avg(v.cloud),
        uv: avg(v.uv),
        precip: avg(v.precip)
    }));

    days.sort((a, b) => new Date(a.date) - new Date(b.date));
    return days;
}

function makeForecastCardHTML(d) {
    const weekday = new Date(d.date).toLocaleDateString("en-US", { weekday: "short" });

    return `
        <div class="weather-card forecast-card">
            <div class="weather-card-header">
                <!-- Weekday instead of SVG -->
                <div class="day-night-icon weekday-label">${weekday}</div>

                <div class="weather-temp" aria-live="polite">
                    <span class="temp-c">${d.temp}°</span>
                    <span class="temp-f">${Math.round((d.temp * 9) / 5 + 32)}°F</span>
                </div>
            </div>

            <div class="weather-extra" role="list">

                <div class="extra-item" role="listitem">
                    <span class="label">UV Index</span>
                    <span class="value">${d.uv}</span>
                </div>

                <div class="extra-item" role="listitem">
                    <span class="label">Precipitation</span>
                    <span class="value">${d.precip}%</span>
                </div>

                <div class="extra-item" role="listitem">
                    <span class="label">Humidity</span>
                    <span class="value">${d.humidity}%</span>
                </div>

                <div class="extra-item" role="listitem">
                    <span class="label">Wind</span>
                    <span class="value">${d.wind} km/h</span>
                </div>

                <div class="extra-item" role="listitem">
                    <span class="label">Feels Like</span>
                    <span class="value">${d.feelsLike}°</span>
                </div>

                <div class="extra-item" role="listitem">
                    <span class="label">Cloud Cover</span>
                    <span class="value">${d.cloud}%</span>
                </div>

            </div>
        </div>
    `;
}

function avg(arr) {
    if (!arr.length) return 0;
    return Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
}
function n(x) {
    const v = Number(x);
    return Number.isFinite(v) ? v : 0;
}
