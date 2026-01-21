import { initWeatherRotator } from './effects/weather-slider.js';
import { getLocation } from './api/geolocation.js';

document.addEventListener("DOMContentLoaded", () => {
    initWeatherRotator();
    getLocation();
    
});
