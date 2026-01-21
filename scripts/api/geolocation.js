const LOCATION_TIMEOUT = 5000; 
const locationName = document.getElementById("locationName");

export function getLocation() {
    if (!navigator.geolocation) {
        setLocationText("your location.");
        console.warn("Geolocation is not supported by this browser.");
        return;
    }

    let timeoutId = setTimeout(() => {
        setLocationText("your location.");
        console.warn("Geolocation request timed out.");
    }, LOCATION_TIMEOUT);

    navigator.geolocation.getCurrentPosition(
        (position) => {
            clearTimeout(timeoutId);
            handleSuccess(position);
        },
        () => {
            clearTimeout(timeoutId);
            setLocationText("your location.");
            console.warn("Geolocation permission denied or unavailable.");
        }
    );
}

async function handleSuccess(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
        );
        const data = await response.json();

        const city =
            data.address.city ||
            data.address.town ||
            data.address.village ||
            data.address.county ||
            "your location.";

        setLocationText(city);
    } catch (error) {
        setLocationText("your location.");
        console.error("Error fetching location data:", error);
    }
}

function setLocationText(text) {
    if (locationName) locationName.textContent = text;
}
