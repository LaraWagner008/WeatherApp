document.addEventListener('DOMContentLoaded', () => {
    const API_KEY = 'd8ed4f6221924504ba0105236250304';
    const weatherInfo = document.getElementById('weather-info');
    const cityInput = document.getElementById('city-input');
    const searchBtn = document.getElementById('search-btn');
    const weeklyForecastEl = document.getElementById("weekly-forecast");

    // Создаем контейнер для списка городов
    const citiesList = document.createElement('div');
    citiesList.id = 'cities-list';
    citiesList.className = 'cities-dropdown';
    cityInput.parentNode.insertBefore(citiesList, cityInput.nextSibling);

        // Новый обработчик для автодополнения
        cityInput.addEventListener('input', debounce(function() {
            const query = cityInput.value.trim();
            if (query.length < 1) { 
                citiesList.style.display = 'none';
                return;
            }
            searchCities(query);
        }, 300));

        
    searchBtn.addEventListener('click', getWeather);
    cityInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') getWeather();
    });


// Функция поиска городов
async function searchCities(query) {
    try {
        const response = await fetch(
            `https://api.weatherapi.com/v1/search.json?key=${API_KEY}&q=${query}`
        );
        const cities = await response.json();
        showCitiesList(cities);
    } catch (error) {
        console.error('Ошибка поиска:', error);
    }
}

// Функция отображения списка городов
function showCitiesList(cities) {
    citiesList.innerHTML = '';
    
    if (!cities || cities.length === 0) {
        const emptyItem = document.createElement('div');
        emptyItem.className = 'city-item';
        emptyItem.textContent = 'Город не найден';
        citiesList.appendChild(emptyItem);
    } else {
        cities.forEach(city => {
            const cityElement = document.createElement('div');
            cityElement.className = 'city-item';
            cityElement.textContent = `${city.name}, ${city.country}`;
            
            cityElement.addEventListener('click', () => {
                cityInput.value = `${city.name}, ${city.country}`;
                citiesList.style.display = 'none';
                getWeather(); // Автоматический поиск
            });
            
            citiesList.appendChild(cityElement);
        });
    }
    
    citiesList.style.display = 'block';
}


    function getWeatherIconByText(weatherText) {
        const lowerText = weatherText.toLowerCase();

        if (lowerText.includes('дождь') || lowerText.includes('ливень')) return '<img class="weather-icon" src="weather icons/rain.png" alt="Дождь">';
        if (lowerText.includes('снег') || lowerText.includes('метель')) return '<img class="weather-icon" src="weather icons/snow.png" alt="Снег">';
        if (lowerText.includes('ясно') || lowerText.includes('солнечно')) return '<img class="weather-icon" src="weather icons/sun.png" alt="Солнце">';
        if (lowerText.includes('облачно') || lowerText.includes('пасмурно')) return '<img class="weather-icon" src="weather icons/clouds.png" alt="Облачно">';
        if (lowerText.includes('туман') || lowerText.includes('дымка')) return '<img class="weather-icon" src="weather icons/fog.png" alt="Туман">';
        if (lowerText.includes('гроза') || lowerText.includes('молния')) return '<img class="weather-icon" src="weather icons/storm.png" alt="Гроза">';
        if (lowerText.includes('ветр') || lowerText.includes('ветер')) return '<img class="weather-icon" src="weather icons/wind.png" alt="Ветер">';

        return '🌈';
    }

    // Прогноз на сегодня
    function displayWeather(data) {
        const { name, country } = data.location;
        const { temp_c, humidity, wind_kph } = data.current;
        const { text } = data.current.condition;

        const customIcon = getWeatherIconByText(text); // Используем свою иконку

        weatherInfo.innerHTML = `
            <h2 class="city">${name}, ${country}</h2>
            <div class="temp">${Math.round(temp_c)}°C</div>
            <div class="weather-icon">${customIcon}</div>
            <div class="description">${text}</div>
            <div class="details">
                <div class="detail-item">
                    <div>Влажность</div>
                    <div>${humidity}%</div>
                </div>
                <div class="detail-item">
                    <div>Ветер</div>
                    <div>${wind_kph} км/ч</div>
                </div>
            </div>
        `;
    }

    // Прогноз на 3 дня (WeatherAPI бесплатно даёт только 3 дня)
    function displayWeeklyForecast(forecastDays) {
        weeklyForecastEl.innerHTML = "";
        forecastDays.forEach(day => {
            const date = new Date(day.date);
            const dayName = date.toLocaleDateString("ru-RU", { weekday: "short" });
            const maxTemp = Math.round(day.day.maxtemp_c);
            const minTemp = Math.round(day.day.mintemp_c);
            const customIcon = getWeatherIconByText(day.day.condition.text);
            const dayNumber = date.getDate();
            const monthName = date.toLocaleDateString("ru-RU", { month: "short" }).replace('.', '');
            const dateString = `${dayNumber} ${monthName}`;
            const dayElement = document.createElement("div");
            dayElement.className = "forecast-day";
            dayElement.innerHTML = `
                <div class="day-date">${dayName}, ${dateString}</div>
                <div class="weather-icon">${customIcon}</div> <!-- Используем свою иконку -->
                <div class="day-temp">${minTemp}° / ${maxTemp}°</div>
                <div class="day-desc">${day.day.condition.text}</div>
            `;
            weeklyForecastEl.appendChild(dayElement);
        });
    }

    async function getWeather() {
        const city = cityInput.value.trim() || 'Москва';
        try {
            const response = await fetch(
                `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${city}&days=3&lang=ru`
            );
            if (!response.ok) throw new Error('Город не найден');
            const data = await response.json();
            displayWeather(data);
            displayWeeklyForecast(data.forecast.forecastday);
        } catch (error) {
            showError(error.message);
        }
    }
    // Функция debounce для оптимизации запросов
    function debounce(func, delay) {
        let timeout;
        return function() {
            const context = this;
            const args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), delay);
        };
    }
    function showError(message) {
        weatherInfo.innerHTML = `<div class="error">${message}</div>`;
    }

    getWeather(); // Загрузка погоды по умолчанию

});