import { icons } from "../effects/icons.js"; 
import { fetchAndRenderToday } from "./weatherdata.js";

const LOCATION_TIMEOUT = 5000;
const locationName = document.getElementById("locationName");

export function getLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            setLocationText("your location");
            console.warn("Geolocation is not supported by this browser.");
            return reject("no-geo");
        }

        const timeoutId = setTimeout(() => {
            setLocationText("your location");
            console.warn("Geolocation request timed out.");
            reject("timeout");
        }, LOCATION_TIMEOUT);

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                clearTimeout(timeoutId);

                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                setDayNightIcon(lat, lon);
                setCityName(lat, lon);
                fetchAndRenderToday(lat, lon);

                resolve({ lat, lon });
            },
            () => {
                clearTimeout(timeoutId);
                setLocationText("your location");
                console.warn("Geolocation permission denied or unavailable.");
                reject("denied");
            }
        );
    });
}

async function setCityName(lat, lon) {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
        );
        const data = await response.json();

        const city =
            (data.address &&
                (data.address.city ||
                 data.address.town ||
                 data.address.village ||
                 data.address.county)) ||
            "your location.";

        setLocationText(city);
    } catch (error) {
        setLocationText("your location");
        console.error("Error fetching location data:", error);
    }
}

async function setDayNightIcon(lat, lon) {
    const iconContainer = document.querySelector(".day-night-icon");
    if (!iconContainer) return;

    try {
        const res = await fetch(
            `https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lon}&formatted=0`
        );
        const json = await res.json();

        const sunrise = new Date(json.results.sunrise);
        const sunset  = new Date(json.results.sunset);
        const now     = new Date();

        const isDay = now >= sunrise && now < sunset;

        iconContainer.innerHTML = isDay ? icons.day : icons.night;
        iconContainer.setAttribute(
            "aria-label",
            isDay ? "Daytime weather icon" : "Nighttime weather icon"
        );
    } catch (e) {
        console.error("Failed to determine day/night:", e);
        const hour = new Date().getHours();
        const isDayHeuristic = hour >= 6 && hour < 18;
        iconContainer.innerHTML = isDayHeuristic ? icons.day : icons.night;
        iconContainer.setAttribute(
            "aria-label",
            isDayHeuristic ? "Daytime weather icon" : "Nighttime weather icon"
        );
    }
}

function setLocationText(text) {
    if (locationName) locationName.textContent = text;
}
