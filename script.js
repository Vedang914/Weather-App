// script.js

document.getElementById('getWeather').addEventListener('click', fetchWeather);
document.getElementById('getCurrentLocationWeather').addEventListener('click', fetchCurrentLocationWeather);
document.getElementById('recentSearch').addEventListener('change', fetchRecentSearchWeather);

const recentSearches = JSON.parse(localStorage.getItem('recentSearches')) || [];

if (recentSearches.length) {
    populateRecentSearches();
}

async function fetchWeather() {
    const location = document.getElementById('location').value.trim();
    if (!location) {
        alert('Please enter a location.');
        return;
    }

    const apiKey = '8857a7933b9267d2d24dbde8cbb9c703'; // Replace with your actual API key
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}&units=metric`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Location not found');
        }

        const data = await response.json();
        displayCurrentWeather(data);

        const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${location}&appid=${apiKey}&units=metric`;
        const forecastResponse = await fetch(forecastUrl);
        const forecastData = await forecastResponse.json();
        displayForecast(forecastData);

        updateRecentSearches(location);

    } catch (error) {
        alert(error.message);
    }
}

async function fetchCurrentLocationWeather() {
    if (!navigator.geolocation) {
        alert('Geolocation is not supported by your browser.');
        return;
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        const apiKey = '8857a7933b9267d2d24dbde8cbb9c703'; // Replace with your actual API key
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Unable to retrieve weather data for your location.');
            }

            const data = await response.json();
            displayCurrentWeather(data);

            const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;
            const forecastResponse = await fetch(forecastUrl);
            const forecastData = await forecastResponse.json();
            displayForecast(forecastData);

        } catch (error) {
            alert(error.message);
        }
    }, () => {
        alert('Unable to retrieve your location.');
    });
}

function fetchRecentSearchWeather() {
    const location = document.getElementById('recentSearch').value;
    if (location) {
        document.getElementById('location').value = location;
        fetchWeather();
    }
}

function displayCurrentWeather(data) {
    document.getElementById('weatherInfo').classList.remove('hidden');
    document.getElementById('locationName').textContent = `${data.name}, ${data.sys.country}`;
    document.getElementById('currentTemp').textContent = `Temperature: ${data.main.temp}°C`;
    document.getElementById('currentCondition').textContent = `Condition: ${data.weather[0].description}`;
    document.getElementById('currentHumidity').textContent = `Humidity: ${data.main.humidity}%`;
    document.getElementById('currentWindSpeed').textContent = `Wind Speed: ${data.wind.speed} m/s`;
}

function displayForecast(data) {
    const forecastDays = document.getElementById('forecastDays');
    forecastDays.innerHTML = '';

    const dailyData = data.list.filter((reading) => reading.dt_txt.includes('12:00:00'));

    dailyData.forEach((day) => {
        const dayDiv = document.createElement('div');

        const date = new Date(day.dt_txt);
        const options = { weekday: 'long', month: 'long', day: 'numeric' };

        const iconUrl = `https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`;

        dayDiv.innerHTML = `
            <h4 class="text-lg font-semibold">${date.toLocaleDateString('en-US', options)}</h4>
            <img src="${iconUrl}" alt="${day.weather[0].description}" class="w-16 h-16" />
            <p class="text-lg">Temp: ${day.main.temp}°C</p>
            <p class="text-lg">Wind: ${day.wind.speed} m/s</p>
            <p class="text-lg">Humidity: ${day.main.humidity}%</p>
            <p class="text-lg">Condition: ${day.weather[0].description}</p>
        `;

        dayDiv.classList.add('p-4', 'bg-gray-200', 'rounded', 'shadow-md', 'hover:shadow-lg', 'transition-shadow', 'duration-300');

        forecastDays.appendChild(dayDiv);
    });
}

function updateRecentSearches(location) {
    if (!recentSearches.includes(location)) {
        recentSearches.push(location);
        localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
        populateRecentSearches();
    }
}

function populateRecentSearches() {
    const recentSearchSelect = document.getElementById('recentSearch');
    recentSearchSelect.innerHTML = '';
    recentSearches.forEach((location) => {
        const option = document.createElement('option');
        option.value = location;
        option.textContent = location;
        recentSearchSelect.appendChild(option);
    });

    if (recentSearches.length > 0) {
        document.getElementById('recentSearches').classList.remove('hidden');
    }
}
