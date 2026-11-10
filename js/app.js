/* =========================================
   SkyCast - Weather Dashboard
   JavaScript & Open-Meteo REST API
========================================= */

const GEOCODING_URL =
    "https://geocoding-api.open-meteo.com/v1/search";

const WEATHER_URL =
    "https://api.open-meteo.com/v1/forecast";

// HTML elements
const searchForm = document.getElementById("search-form");
const cityInput = document.getElementById("city-input");
const searchButton = document.getElementById("search-button");
const statusMessage = document.getElementById("status-message");

const cityName = document.getElementById("city-name");
const countryName = document.getElementById("country-name");
const temperature = document.getElementById("temperature");
const weatherDescription =
    document.getElementById("weather-description");
const weatherIcon = document.getElementById("weather-icon");
const feelsLike = document.getElementById("feels-like");
const humidity = document.getElementById("humidity");
const windSpeed = document.getElementById("wind-speed");
const pressure = document.getElementById("pressure");
const cloudCover = document.getElementById("cloud-cover");
const updatedTime = document.getElementById("updated-time");

// Weather code descriptions and icons
const weatherConditions = {
    0: { description: "Clear sky", icon: "☀️" },
    1: { description: "Mainly clear", icon: "🌤️" },
    2: { description: "Partly cloudy", icon: "⛅" },
    3: { description: "Overcast", icon: "☁️" },
    45: { description: "Foggy", icon: "🌫️" },
    48: { description: "Rime fog", icon: "🌫️" },
    51: { description: "Light drizzle", icon: "🌦️" },
    53: { description: "Moderate drizzle", icon: "🌦️" },
    55: { description: "Dense drizzle", icon: "🌧️" },
    56: { description: "Freezing drizzle", icon: "🌧️" },
    57: { description: "Heavy freezing drizzle", icon: "🌧️" },
    61: { description: "Light rain", icon: "🌧️" },
    63: { description: "Moderate rain", icon: "🌧️" },
    65: { description: "Heavy rain", icon: "🌧️" },
    66: { description: "Freezing rain", icon: "🌧️" },
    67: { description: "Heavy freezing rain", icon: "🌧️" },
    71: { description: "Light snowfall", icon: "🌨️" },
    73: { description: "Moderate snowfall", icon: "🌨️" },
    75: { description: "Heavy snowfall", icon: "❄️" },
    77: { description: "Snow grains", icon: "❄️" },
    80: { description: "Light rain showers", icon: "🌦️" },
    81: { description: "Moderate rain showers", icon: "🌧️" },
    82: { description: "Heavy rain showers", icon: "⛈️" },
    85: { description: "Light snow showers", icon: "🌨️" },
    86: { description: "Heavy snow showers", icon: "❄️" },
    95: { description: "Thunderstorm", icon: "⛈️" },
    96: { description: "Thunderstorm with hail", icon: "⛈️" },
    99: { description: "Heavy thunderstorm with hail", icon: "⛈️" }
};

// Show status messages
function showStatus(message, type = "") {
    statusMessage.textContent = message;
    statusMessage.className = type;
}

// Search for a city using the Geocoding API
async function getCityCoordinates(city) {
    const url = `${GEOCODING_URL}?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("Unable to search for the city. Please try again.");
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
        throw new Error("City not found. Check the spelling and try again.");
    }

    return data.results[0];
}

// Fetch current weather using latitude and longitude
async function getWeather(latitude, longitude) {
    const params = new URLSearchParams({
        latitude: latitude,
        longitude: longitude,
        current: [
            "temperature_2m",
            "relative_humidity_2m",
            "apparent_temperature",
            "is_day",
            "weather_code",
            "cloud_cover",
            "pressure_msl",
            "wind_speed_10m"
        ].join(","),
        timezone: "auto"
    });

    const response = await fetch(`${WEATHER_URL}?${params}`);

    if (!response.ok) {
        throw new Error("Unable to retrieve weather data. Please try again.");
    }

    const data = await response.json();

    if (!data.current) {
        throw new Error("Weather information is currently unavailable.");
    }

    return data;
}

// Display weather information on the dashboard
function displayWeather(location, weatherData) {
    const current = weatherData.current;

    const condition = weatherConditions[current.weather_code] || {
        description: "Unknown conditions",
        icon: "🌡️"
    };

    cityName.textContent = location.name;
    countryName.textContent = [
        location.admin1,
        location.country
    ].filter(Boolean).join(", ");

    temperature.textContent =
        `${Math.round(current.temperature_2m)}°`;

    weatherDescription.textContent = condition.description;
    weatherIcon.textContent = condition.icon;

    feelsLike.textContent =
        `Feels like ${Math.round(current.apparent_temperature)}°C`;

    humidity.textContent =
        `${current.relative_humidity_2m}%`;

    windSpeed.textContent =
        `${current.wind_speed_10m} km/h`;

    pressure.textContent =
        `${Math.round(current.pressure_msl)} hPa`;

    cloudCover.textContent =
        `${current.cloud_cover}%`;

    updatedTime.textContent =
        `Last updated: ${current.time.replace("T", " ")} (local time)`;

    showStatus("Weather updated successfully!", "success");
}

// Main search function
async function searchWeather(city) {
    if (!city.trim()) {
        showStatus("Please enter a city name.", "error");
        return;
    }

    searchButton.disabled = true;
    searchButton.textContent = "Loading...";
    showStatus("Searching for weather information...");

    try {
        // Step 1: Find the city's coordinates
        const location = await getCityCoordinates(city);

        // Step 2: Fetch weather using those coordinates
        const weatherData = await getWeather(
            location.latitude,
            location.longitude
        );

        // Step 3: Display the retrieved weather
        displayWeather(location, weatherData);

    } catch (error) {
        console.error("Weather search error:", error);
        showStatus(error.message || "Something went wrong. Please try again.", "error");

    } finally {
        searchButton.disabled = false;
        searchButton.textContent = "Search";
    }
}

// Listen for form submissions
searchForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const city = cityInput.value.trim();

    searchWeather(city);
});

// Load a default city when the application starts
searchWeather("Coimbatore");