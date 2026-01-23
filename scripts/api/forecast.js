export function renderForecastFromRaw(raw) {
  if (!raw || !raw.hourly) {
    console.warn("No raw data for forecast");
    return;
  }

  const daily = buildDailySummaries(raw);
  const nextSix = pickNextDays(daily, 6);

  const topThree = nextSix.slice(0, 3);
  const rest = nextSix.slice(3);

  const { topEl, bottomEl } = getForecastContainers();
  if (!topEl || !bottomEl) return;

  renderForecastRow(topEl, topThree);
  renderForecastRow(bottomEl, rest);
}

function buildDailySummaries(data) {
  const grouped = {};

  const times = data?.hourly?.time ?? [];
  for (let i = 0; i < times.length; i++) {
    const date = String(times[i]).split("T")[0];

    if (!grouped[date]) {
      grouped[date] = {
        temps: [],
        feels: [],
        humidity: [],
        wind: [],
        cloud: [],
        uv: [],
        precip: [],
      };
    }

    grouped[date].temps.push(n(data.hourly.temperature_2m?.[i]));
    grouped[date].feels.push(n(data.hourly.apparent_temperature?.[i]));
    grouped[date].humidity.push(n(data.hourly.relative_humidity_2m?.[i]));
    grouped[date].wind.push(n(data.hourly.wind_speed_10m?.[i]));
    grouped[date].cloud.push(n(data.hourly.cloud_cover?.[i]));
    grouped[date].uv.push(n(data.hourly.uv_index?.[i]));
    grouped[date].precip.push(n(data.hourly.precipitation_probability?.[i]));
  }

  const days = Object.entries(grouped).map(([date, v]) => ({
    date,
    temp: avg(v.temps),
    feelsLike: avg(v.feels),
    humidity: avg(v.humidity),
    wind: avg(v.wind),
    cloud: avg(v.cloud),
    uv: avg(v.uv),
    precip: avg(v.precip),
  }));

  days.sort((a, b) => new Date(a.date) - new Date(b.date));
  return days;
}

function pickNextDays(daily, count) {
  const todayStr = new Date().toISOString().slice(0, 10);
  return daily
    .filter((d) => d.date > todayStr)
    .slice(0, count);
}

function getForecastContainers() {
  const topEl = document.querySelector(".forecast-container .top-row");
  const bottomEl = document.querySelector(".forecast-container .bottom-row");

  if (!topEl || !bottomEl) {
    console.warn("Missing .forecast-container .top-row / .bottom-row in HTML.");
    return { topEl: null, bottomEl: null };
  }

  return { topEl, bottomEl };
}

/**
 * Render a list of day summaries as forecast cards into a container.
 */
function renderForecastRow(container, days) {
  container.replaceChildren();

  const frag = document.createDocumentFragment();
  for (const d of days) {
    frag.appendChild(makeForecastCard(d));
  }
  container.appendChild(frag);
}

const PROTOTYPE = (() => {
  const make = (tag, className) => {
    const el = document.createElement(tag);
    if (className) el.className = className;
    return el;
  };

  const extraItem = make("div", "extra-item");
  extraItem.setAttribute("role", "listitem");

  const extraLabel = make("span", "label");
  const extraValue = make("span", "value");
  extraItem.appendChild(extraLabel);
  extraItem.appendChild(extraValue);

  const weekdayLabel = make("div", "day-night-icon weekday-label");

  const tempBox = make("div", "weather-temp");
  tempBox.setAttribute("aria-live", "polite");

  const tempC = make("span", "temp-c");
  const tempF = make("span", "temp-f");
  tempBox.appendChild(tempC);
  tempBox.appendChild(tempF);

  const header = make("div", "weather-card-header");

  const extra = make("div", "weather-extra");
  extra.setAttribute("role", "list");

  const card = make("div", "weather-card forecast-card");

  return { card, header, weekdayLabel, tempBox, extra, extraItem };
})();

function makeForecastCard(d) {
  const weekday = new Date(d.date).toLocaleDateString("en-US", { weekday: "short" });
  const tempF = Math.round((d.temp * 9) / 5 + 32);

  const card = PROTOTYPE.card.cloneNode(false);

  const header = PROTOTYPE.header.cloneNode(false);

  const weekdayLabel = PROTOTYPE.weekdayLabel.cloneNode(false);
  weekdayLabel.textContent = weekday;

  const tempBox = PROTOTYPE.tempBox.cloneNode(true);
  tempBox.children[0].textContent = `${d.temp}°`;
  tempBox.children[1].textContent = `${tempF}°F`;

  header.appendChild(weekdayLabel);
  header.appendChild(tempBox);

  const extra = PROTOTYPE.extra.cloneNode(false);

  const addExtraItem = (labelText, valueText) => {
    const item = PROTOTYPE.extraItem.cloneNode(true);
    item.children[0].textContent = labelText;          
    item.children[1].textContent = String(valueText);  
    extra.appendChild(item);
  };

  addExtraItem("UV Index", d.uv);
  addExtraItem("Precipitation", `${d.precip}%`);
  addExtraItem("Humidity", `${d.humidity}%`);
  addExtraItem("Wind", `${d.wind} km/h`);
  addExtraItem("Feels Like", `${d.feelsLike}°`);
  addExtraItem("Cloud Cover", `${d.cloud}%`);

  card.appendChild(header);
  card.appendChild(extra);

  return card;
}

function avg(arr) {
  if (!arr || !arr.length) return 0;
  return Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
}
function n(x) {
  const v = Number(x);
  return Number.isFinite(v) ? v : 0;
}
