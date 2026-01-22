
export function initWeatherRotator() {
  const rotator = document.querySelector('.weather-rotator');
  if (!rotator) return;

  const words = ["sunny", "cloudy", "rainy", "windy", "stormy", "foggy", "snowy"];
  let index = 0;
  let intervalId = null;
  let timeoutId = null;

  function start() {
    if (intervalId)
         return; 

    intervalId = setInterval(() => {
      rotator.classList.add("fade-out");

      if (timeoutId) clearTimeout(timeoutId);

      timeoutId = setTimeout(() => {
        index = (index + 1) % words.length;
        rotator.textContent = words[index];
        rotator.classList.remove("fade-out");
      }, 500);

    }, 2500);
  }

  function stop() {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  }

  start();

  const onEnter = () => stop();
  const onLeave = () => start();

  rotator.addEventListener("mouseenter", onEnter);
  rotator.addEventListener("mouseleave", onLeave);

  return function cleanup() {
    stop();
    rotator.removeEventListener("mouseenter", onEnter);
    rotator.removeEventListener("mouseleave", onLeave);
  };
}
