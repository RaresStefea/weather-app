
import { initWeatherRotator } from './effects/weather-slider.js';
import { getLocation } from './api/geolocation.js';
import { fetchAndRenderToday } from './api/weatherdata.js';
import { renderForecastFromRaw } from './api/forecast.js';

document.addEventListener("DOMContentLoaded", async () => {
    initWeatherRotator();

    const { lat, lon } = await getLocation();

    const result = await fetchAndRenderToday(lat, lon);
    
    if (!result) 
        return;

    renderForecastFromRaw(result.raw);
});
