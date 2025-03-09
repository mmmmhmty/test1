import express from "express";
import axios from "axios";

const app = express();
const PORT = 3000;

const API_KEY = "454b5e3c01bc4a688a562221250103";
const BASE_URL = "http://api.weatherapi.com/v1/forecast.json";

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", async (req, res) => {
  try {
    const city = req.query.city || "Chernivtsi";
    const url = `${BASE_URL}?key=${API_KEY}&q=${city}&days=7&aqi=no&alerts=no&lang=uk`;

    const response = await axios.get(url);
    const { location, current, forecast } = response.data;

    const html = `
<!DOCTYPE html>
<html lang="uk" class="light-theme">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Сучасний прогноз погоди для вашого міста">
  <title>WeatherNexus - ${location.name}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: #2563eb;
      --background: #f0f4f8;
      --text: #1e293b;
      --card-bg: #ffffff;
      --shadow: rgba(0, 0, 0, 0.1);
      --dynamic-hue: 200;
    }
    /* Темний режим – "бокси" стають темнішими */
    .dark-theme {
      --background: #1e293b;
      --text: #f0f4f8;
      --card-bg: #2a2a2a;
      --shadow: rgba(255, 255, 255, 0.1);
    }
    .dark-theme .container {
        background-color: rgba(42, 42, 42, 0.9);
        box-shadow: 0 4px 12px rgba(255, 255, 255, 0.1);
      }
      
    * {
      box-sizing: border-box;
      transition: background 0.3s ease, color 0.3s ease;
    }
    body {
      font-family: 'Inter', sans-serif;
      margin: 0;
      padding: 0;
      background: var(--background);
      color: var(--text);
      background-size: cover;
      background-position: center;
      min-height: 100vh;
      position: relative;
      overflow-x: hidden;
    }
    /* Титульна сторінка (landing page) */
    #landing-page {
      position: fixed;
      top: 0; left: 0;
      width: 100vw;
      height: 100vh;
      background: var(--background);
      z-index: 2000;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      opacity: 1;
      transition: opacity 1s ease;
    }
    #landing-page.hidden {
      opacity: 0;
      pointer-events: none;
    }
    #enter-button {
      margin-top: 20px;
      padding: 0.75rem 1rem;
      background: var(--primary);
      border: none;
      color: #fff;
      border-radius: 8px;
      cursor: pointer;
      font-size: 1.2rem;
    }
    /* Інтерактивне, таскане сонце на титульній сторінці */
    #draggable-sun {
      width: 80px;
      height: 80px;
      background: radial-gradient(circle, #ffde00, #ffa500);
      border-radius: 50%;
      animation: orbit 15s linear infinite;
      cursor: grab;
      user-select: none;
    }
    @keyframes orbit {
      0%   { transform: translate(0, 0); }
      25%  { transform: translate(150px, 0); }
      50%  { transform: translate(150px, 150px); }
      75%  { transform: translate(0, 150px); }
      100% { transform: translate(0, 0); }
    }
    /* Анімовані хмари на титульній сторінці */
    .landing-cloud {
      position: absolute;
      width: 200px;
      height: 100px;
      background: url('/images/cloud.png') no-repeat center;
      background-size: contain;
      opacity: 0.7;
      animation: moveClouds 60s linear infinite;
      z-index: 1999;
    }
    .landing-cloud:nth-of-type(1) { top: 5%; animation-delay: 0s; }
    .landing-cloud:nth-of-type(2) { top: 15%; animation-delay: 10s; }
    .landing-cloud:nth-of-type(3) { top: 25%; animation-delay: 20s; }
    @keyframes moveClouds {
      from { transform: translateX(-250px); }
      to { transform: translateX(100vw); }
    }
    /* Основний контейнер */
    .container {
      max-width: 1400px;
      margin: 2rem auto;
      padding: 2rem 1rem;
      background-color: rgba(255, 255, 255, 0.85);
      border-radius: 12px;
      box-shadow: 0 4px 12px var(--shadow);
      position: relative;
      z-index: 2;
    }
    /* Header */
    header {
      padding: 1rem 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .logo {
      font-size: 2rem;
      font-weight: 600;
    }
    .theme-toggle,
    .unit-toggle {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      margin-left: 0.5rem;
    }
    .search-form {
      display: flex;
      gap: 1rem;
      max-width: 500px;
      width: 100%;
      margin: 1rem 0;
    }
    .search-input {
      flex: 1;
      padding: 0.75rem;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      font-size: 1rem;
    }
    .search-button {
      padding: 0.75rem 1rem;
      background: var(--primary);
      border: none;
      color: #fff;
      border-radius: 8px;
      cursor: pointer;
    }
    .current-weather {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
      margin: 2rem 0;
      align-items: center;
    }
    .current-main {
      text-align: center;
    }
    .weather-icon {
      width: 120px;
      height: 120px;
    }
    .temperature {
      font-size: 4rem;
      font-weight: 600;
      margin: 0.5rem 0;
    }
    .details-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 1rem;
    }
    .detail-item {
      background: rgba(0,0,0,0.03);
      padding: 1rem;
      border-radius: 8px;
      text-align: center;
    }
    .forecast {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
      margin-top: 2rem;
    }
    .day-card {
      background: var(--card-bg);
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 2px 8px var(--shadow);
      cursor: pointer;
      transition: transform 0.2s;
    }
    .day-card:hover {
      transform: translateY(-5px);
    }
    /* Бічна панель для детальної інформації */
    #side-panel {
      position: fixed;
      top: 0;
      right: -400px;
      width: 400px;
      height: 100%;
      background: var(--card-bg);
      box-shadow: -4px 0 12px var(--shadow);
      overflow-y: auto;
      transition: right 0.4s ease;
      padding: 1rem;
      z-index: 1000;
    }
    #side-panel.active {
      right: 0;
    }
    #side-panel .close-btn {
      position: absolute;
      top: 10px;
      left: 10px;
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
    }
    @media (max-width: 768px) {
      .current-weather {
        grid-template-columns: 1fr;
        text-align: center;
      }
    }
  </style>
</head>
<body>
  <!-- Титульна сторінка -->
  <div id="landing-page">
    <div id="draggable-sun"></div>
    <div class="landing-cloud"></div>
    <div class="landing-cloud"></div>
    <div class="landing-cloud"></div>
    <button id="enter-button">Вхід</button>
  </div>
  <!-- Основний контент -->
  <header class="container">
    <div class="logo">☁️ WeatherNexus</div>
    <div>
      <button class="theme-toggle" onclick="toggleTheme()">🌓</button>
      <button class="unit-toggle" onclick="toggleUnit()">°C / °F</button>
    </div>
  </header>
  <div class="container">
    <form class="search-form" action="/" method="GET">
      <input type="text" class="search-input" name="city" placeholder="Введіть назву міста..." value="${location.name}">
      <button type="submit" class="search-button">Пошук</button>
    </form>
    <section class="current-weather">
      <div class="current-main">
        <img src="${current.condition.icon}" alt="${current.condition.text}" class="weather-icon">
        <div class="temperature" id="current-temp" data-c="${current.temp_c}" data-f="${current.temp_f}">${current.temp_c}°C</div>
        <div class="condition">${current.condition.text}</div>
      </div>
      <div class="details-grid">
        <div class="detail-item">
          <div>📍 Місто</div>
          <div>${location.name}</div>
        </div>
        <div class="detail-item">
          <div>💨 Вітер</div>
          <div>${current.wind_kph} км/год</div>
        </div>
        <div class="detail-item">
          <div>💧 Вологість</div>
          <div>${current.humidity}%</div>
        </div>
        <div class="detail-item">
          <div>👁️ Видимість</div>
          <div>${current.vis_km} км</div>
        </div>
        <div class="detail-item">
          <div>🤗 Відчувається як</div>
          <div>${current.feelslike_c}°C</div>
        </div>
        <div class="detail-item">
          <div>☔ Опади</div>
          <div>${current.precip_mm} мм</div>
        </div>
        <div class="detail-item">
          <div>🔆 UV</div>
          <div>${current.uv}</div>
        </div>
      </div>
    </section>
    <section class="forecast">
      ${forecast.forecastday.map((day, index) => `
        <div class="day-card" onclick="showDetails(${index})" data-index="${index}">
          <h3>${new Date(day.date).toLocaleDateString("uk-UA", { weekday: 'long', day: 'numeric', month: 'short' })}</h3>
          <img src="${day.day.condition.icon}" alt="${day.day.condition.text}">
          <div class="temp-max" data-c="${day.day.maxtemp_c}" data-f="${day.day.maxtemp_f}">⬆️ ${day.day.maxtemp_c}°C</div>
          <div class="temp-min" data-c="${day.day.mintemp_c}" data-f="${day.day.mintemp_f}">⬇️ ${day.day.mintemp_c}°C</div>
          <div class="rain-chance">🌧️ ${day.day.daily_chance_of_rain}%</div>
        </div>
      `).join("")}
    </section>
  </div>
  <!-- Бічна панель -->
  <div id="side-panel">
    <button class="close-btn" onclick="closePanel()">×</button>
    <div id="side-content"></div>
  </div>
  <script>
    // Перемикання теми
    function toggleTheme() {
      document.documentElement.classList.toggle('dark-theme');
      const currentTheme = document.documentElement.classList.contains('dark-theme') ? 'dark' : 'light';
      localStorage.setItem('theme', currentTheme);
    }
    // Перемикання одиниць температури
    function toggleUnit() {
      window.unit = window.unit === 'c' ? 'f' : 'c';
      localStorage.setItem('unit', window.unit);
      updateTemperatures();
    }
    function updateTemperatures() {
      const currentTempElem = document.getElementById('current-temp');
      if (currentTempElem) {
        currentTempElem.innerText = window.unit === 'c' 
          ? currentTempElem.getAttribute('data-c') + "°C" 
          : currentTempElem.getAttribute('data-f') + "°F";
      }
      document.querySelectorAll('.day-card .temp-max').forEach(elem => {
        elem.innerText = window.unit === 'c' 
          ? "⬆️ " + elem.getAttribute('data-c') + "°C" 
          : "⬆️ " + elem.getAttribute('data-f') + "°F";
      });
      document.querySelectorAll('.day-card .temp-min').forEach(elem => {
        elem.innerText = window.unit === 'c' 
          ? "⬇️ " + elem.getAttribute('data-c') + "°C" 
          : "⬇️ " + elem.getAttribute('data-f') + "°F";
      });
    }
    document.addEventListener('DOMContentLoaded', () => {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark-theme');
      }
      window.unit = localStorage.getItem('unit') || 'c';
      updateTemperatures();
      // Динамічний фон залежно від стану погоди
      const condition = "${current.condition.text}".toLowerCase();
      const body = document.body;
      if (condition.includes("ясно") || condition.includes("сонячно")) {
        body.style.backgroundImage = "url('/images/sunny.jpg')";
      } else if (condition.includes("хмарно") || condition.includes("облачно")) {
        body.style.backgroundImage = "url('/images/cloudy.jpg')";
      } else if (condition.includes("дощ")) {
        body.style.backgroundImage = "url('/images/rainy.jpg')";
      } else if (condition.includes("сніг")) {
        body.style.backgroundImage = "url('/images/snowy.jpg')";
      } else {
        body.style.backgroundImage = "url('/images/default.jpg')";
      }
    });
    // Бічна панель
    const forecastData = ${JSON.stringify(forecast.forecastday)};
    function showDetails(index) {
      const dayData = forecastData[index];
      const formattedDate = new Date(dayData.date).toLocaleDateString("uk-UA", { weekday: 'long', day: 'numeric', month: 'long' });
      const sideContent = document.getElementById('side-content');
      sideContent.innerHTML = \`
        <h2>\${formattedDate}</h2>
        <img src="\${dayData.day.condition.icon}" alt="\${dayData.day.condition.text}" style="width:80px;">
        <p><strong>Стан:</strong> \${dayData.day.condition.text}</p>
        <p><strong>Макс температура:</strong> \${window.unit === 'c' ? dayData.day.maxtemp_c + "°C" : dayData.day.maxtemp_f + "°F"}</p>
        <p><strong>Мін температура:</strong> \${window.unit === 'c' ? dayData.day.mintemp_c + "°C" : dayData.day.mintemp_f + "°F"}</p>
        <p><strong>Опади:</strong> \${dayData.day.daily_chance_of_rain}%</p>
        <p><strong>Схід/Захід:</strong> \${dayData.astro.sunrise} / \${dayData.astro.sunset}</p>
        <h3>Погодинний прогноз</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap: 10px;">
          \${dayData.hour.map(hour => \`
            <div style="background: rgba(0,0,0,0.05); padding: 5px; border-radius: 5px; text-align: center;">
              <div>\${new Date(hour.time_epoch * 1000).getHours()}:00</div>
              <img src="\${hour.condition.icon}" alt="\${hour.condition.text}" style="width:40px;">
              <div>\${window.unit === 'c' ? hour.temp_c + "°C" : hour.temp_f + "°F"}</div>
            </div>
          \`).join("")}
        </div>
      \`;
      document.getElementById('side-panel').classList.add('active');
    }
    function closePanel() {
      document.getElementById('side-panel').classList.remove('active');
    }
    document.addEventListener('click', function(e) {
      const sidePanel = document.getElementById('side-panel');
      if(sidePanel.classList.contains('active') && !e.target.closest('#side-panel') && !e.target.closest('.day-card')) {
        closePanel();
      }
    });
    // Draggable сонце на титульній сторінці
    const draggableSun = document.getElementById('draggable-sun');
    let sunDragging = false;
    let sunOffset = { x: 0, y: 0 };
    draggableSun.addEventListener('mousedown', (e) => {
      sunDragging = true;
      draggableSun.style.animation = 'none';
      const rect = draggableSun.getBoundingClientRect();
      sunOffset.x = e.clientX - rect.left;
      sunOffset.y = e.clientY - rect.top;
    });
    document.addEventListener('mousemove', (e) => {
      if (sunDragging) {
        draggableSun.style.position = 'absolute';
        draggableSun.style.left = (e.clientX - sunOffset.x) + 'px';
        draggableSun.style.top = (e.clientY - sunOffset.y) + 'px';
        // Зміна кольору залежно від позиції сонця
        let newHue = Math.floor((e.clientX / window.innerWidth) * 360);
        document.documentElement.style.setProperty('--dynamic-hue', newHue);
      }
    });
    document.addEventListener('mouseup', (e) => {
      if (sunDragging) {
        sunDragging = false;
        draggableSun.style.position = '';
        draggableSun.style.left = '';
        draggableSun.style.top = '';
        draggableSun.style.animation = 'orbit 15s linear infinite';
      }
    });
    // Сонце іноді ховається за хмари
    setInterval(() => {
      if (Math.random() < 0.3) {
        draggableSun.style.opacity = 0;
        setTimeout(() => { draggableSun.style.opacity = 1; }, 2000);
      }
    }, 10000);
    // Обробка кнопки "Вхід" на титульній сторінці
    document.getElementById('enter-button').addEventListener('click', () => {
      document.getElementById('landing-page').classList.add('hidden');
    });
  </script>
</body>
</html>
    `;
    res.send(html);
  } catch (error) {
    const errorHtml = `
      <div class="container">
          <h2>Помилка 😕</h2>
          <p>${error.response?.data?.error?.message || "Невідома помилка"}</p>
          <a href="/">Спробувати знову</a>
      </div>
    `;
    res.status(500).send(errorHtml);
  }
});

app.listen(PORT, () => {
  console.log(`Сервер запущено: http://localhost:${PORT}`);
});
