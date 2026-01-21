export async function fetchAndRenderToday(lat, lon) {

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    try {
        const url = new URL("https://api.open-meteo.com/v1/forecast");

        url.searchParams.set("latitude", lat);
        url.searchParams.set("longitude", lon);
        url.searchParams.set("timezone", "auto");


        url.searchParams.set("forecast_days", "7");

        url.searchParams.set("hourly", [
            "temperature_2m",
            "apparent_temperature",
            "relative_humidity_2m",
            "precipitation_probability",
            "cloud_cover",
            "uv_index",
            "wind_speed_10m"
        ].join(","));

        url.searchParams.set("current_weather", "true");

        const result = await fetch(url.toString(), { signal: controller.signal });

        clearTimeout(timeout);

        const data = await result.json();

        const hour = findCurrentHourIndex(data.hourly.time);

        const tempC = data.hourly.temperature_2m[hour];
        const tempF = (tempC * 9) / 5 + 32;

        const uv = data?.hourly?.uv_index[hour] ?? 0;
        const precipitation = data?.hourly?.precipitation_probability[hour] ?? 0;
        const humidity = data?.hourly?.relative_humidity_2m[hour] ?? 0;
        const wind = data?.hourly?.wind_speed_10m[hour] ?? 0;
        const feelsLike = data?.hourly?.apparent_temperature[hour] ?? 0;
        const cloudCover = data?.hourly?.cloud_cover[hour] ?? 0;

        document.querySelector(".temp-c").textContent = `${Math.round(tempC)}°`;
        document.querySelector(".temp-f").textContent = `${Math.round(tempF)}°F`;

        const values = document.querySelectorAll(".extra-item .value");
        values[0].textContent = Math.round(uv);
        values[1].textContent = `${Math.round(precipitation)}%`;
        values[2].textContent = `${Math.round(humidity)}%`;
        values[3].textContent = `${Math.round(wind)} km/h`;
        values[4].textContent = `${Math.round(feelsLike)}°`;
        values[5].textContent = `${Math.round(cloudCover)}%`;

  
        return {today: { tempC, tempF, uv, precipitation, humidity, wind, feelsLike, cloudCover },raw: data};

    } catch (err) {
        if (err.name === 'AbortError') {
            console.error("Open-Meteo fetch aborted due to timeout");
        } else {
            console.error("Open-Meteo fetch failed:", err);
        }
        return null;
    }
}

function findCurrentHourIndex(times) {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const hh = String(now.getHours()).padStart(2, "0");

    const target = `${yyyy}-${mm}-${dd}T${hh}:00`;
    return times.indexOf(target) !== -1 ? times.indexOf(target) : 0;
}
