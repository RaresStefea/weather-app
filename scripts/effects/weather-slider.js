
export function initWeatherRotator() {
    const rotator = document.querySelector('.weather-rotator');

    const words = ["sunny", "cloudy", "rainy", "windy", "stormy", "foggy","snowy"];
    let index = 0;
    let intervalId = null;

    function rotateWords() {
        intervalId = setInterval(() => {
            rotator.classList.add("fade-out");

            setTimeout(() => {
                index = (index + 1) % words.length;
                rotator.textContent = words[index];
                rotator.classList.remove("fade-out");
            }, 500);

        }, 2500);
    }

    rotateWords();

    rotator.addEventListener("mouseenter", () => clearInterval(intervalId));
    rotator.addEventListener("mouseleave", rotateWords);
}
