// Fetch elements by their IDs
const cityinput = document.getElementById("cityinput");
const searchbtn = document.getElementById("searchbtn");
const cityListDropdown = document.getElementById("city-list-dropdown");
const cityNameElement = document.getElementById("city-name");
const countryNameElement = document.getElementById("country-name");
const key = "a821b4d398ab3031604981a4408fdd33";

// Call autodetectLocation on page load to get the user's location
document.addEventListener("DOMContentLoaded", () => {
  autodetectLocation();

  // Add event listener to the search button
  searchbtn.addEventListener("click", searchCity);

  // Hide the dropdown when clicking outside of it
  document.addEventListener("click", (event) => {
    if (
      !cityListDropdown.contains(event.target) &&
      event.target !== cityinput
    ) {
      cityListDropdown.style.display = "none";
    }
  });

  // Hide the dropdown when the input field is cleared or modified
  cityinput.addEventListener("input", () => {
    if (cityinput.value.trim() === "") {
      cityListDropdown.style.display = "none";
    }
  });

  // Tab navigation logic
  setupTabNavigation();
});

// Function to search for cities and display them in a dropdown
function searchCity(event) {
  event.preventDefault(); // Prevent form submission

  const city = cityinput.value.trim();
  if (city) {
    // Fetch city data using the Geocoding API
    const queryURL1 = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=5&appid=${key}`;

    fetch(queryURL1)
      .then((response) => response.json())
      .then((data) => {
        if (data.length > 0) {
          displayCityOptions(data);
        } else {
          alert("No cities found. Please try again.");
        }
      })
      .catch((error) => console.error("Error fetching city data:", error));
  } else {
    // If no city is entered, autodetect the location
    autodetectLocation();
  }
}

// Function to display a list of city options as a dropdown
function displayCityOptions(cities) {
  // Clear previous city options
  cityListDropdown.innerHTML = "";
  cityListDropdown.style.display = "block"; // Show the dropdown

  // Create a list of items for each city
  cities.forEach((city) => {
    const cityItem = document.createElement("div");
    cityItem.textContent = `${city.name}, ${city.country}`;
    cityItem.className = "dropdown-item";
    cityItem.onclick = () => {
      // Update the header with the selected city and country
      updateHeader(city.name, city.country);
      fetchforecast(city.lat, city.lon);
      cityinput.value = city.name; // Optionally fill the input with the selected city name
      cityListDropdown.style.display = "none"; // Hide the dropdown after selection
    };
    cityListDropdown.appendChild(cityItem);
  });
}

// Function to update the header with city and country
function updateHeader(city, country) {
  cityNameElement.textContent = city;
  countryNameElement.textContent = country;
}

// Function to autodetect location
function autodetectLocation() {
  // Check if the Geolocation API is available
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(success, error);
  } else {
    console.log("Geolocation is not supported by this browser.");
  }
}

// Function to fetch the forecast
function fetchforecast(lat, lon) {
  const queryURL2 = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${key}&units=metric`;

  // Fetch to get the forecast
  fetch(queryURL2)
    .then((response) => response.json())
    .then((data) => {
      // Display the forecast data
      displayForecast(data);
      // Update the header with the location data (if available)
      if (data.city) {
        updateHeader(data.city.name, data.city.country);
      }
    })
    .catch((error) => console.error("Error fetching forecast data:", error));
}

// Success callback for geolocation
function success(position) {
  const lat = position.coords.latitude;
  const lon = position.coords.longitude;
  console.log("Latitude:", lat, "Longitude:", lon);

  // Use these coordinates to fetch weather data
  fetchforecast(lat, lon);
}

// Error callback for geolocation
function error(err) {
  console.warn(`ERROR(${err.code}): ${err.message}`);
}

// Function to set up tab navigation
function setupTabNavigation() {
  const tabHeaders = document.querySelectorAll(".tab-header .main-tab");
  const tabContents = document.querySelectorAll(".tab-content");
  const tabHeader = document.querySelector(".tab-header");
  const tabHeaderWrapper = document.querySelector(".tab-header-wrapper");
  const arrowLeft = document.querySelector(".arrow-left");
  const arrowRight = document.querySelector(".arrow-right");
  let scrollAmount = 0;
  const scrollStep = 100; // Amount to scroll with each arrow click

  // Function to activate a tab and its content
  function activateTab(tabElement) {
    // Remove active class from all headers and contents
    tabHeaders.forEach((header) => header.classList.remove("active"));
    tabContents.forEach((content) => content.classList.remove("active"));

    // Add active class to the clicked tab header
    tabElement.classList.add("active");

    // If there's specific content associated with the tab, activate it
    const contentId = tabElement.dataset.tab;
    if (contentId) {
      document.getElementById(contentId)?.classList.add("active");
    }
  }

  // Event listeners for tab clicks
  tabHeaders.forEach((header) => {
    header.addEventListener("click", () => activateTab(header));
  });

  // Activate the first tab by default (if any)
  if (tabHeaders.length > 0) {
    activateTab(tabHeaders[0]);
  }

  // Function to check if the arrows need to be shown or hidden
  function checkArrows() {
    const maxScroll = tabHeader.scrollWidth - tabHeaderWrapper.clientWidth;
    if (scrollAmount <= 0) {
      arrowLeft.style.display = "none";
    } else {
      arrowLeft.style.display = "flex";
    }
    if (scrollAmount >= maxScroll) {
      arrowRight.style.display = "none";
    } else {
      arrowRight.style.display = "flex";
    }
  }

  // Initialize arrow visibility
  checkArrows();

  // Event listeners for arrow clicks
  arrowLeft.addEventListener("click", () => {
    scrollAmount -= scrollStep;
    if (scrollAmount < 0) scrollAmount = 0;
    tabHeader.style.transform = `translateX(-${scrollAmount}px)`;
    checkArrows();
  });

  arrowRight.addEventListener("click", () => {
    scrollAmount += scrollStep;
    const maxScroll = tabHeader.scrollWidth - tabHeaderWrapper.clientWidth;
    if (scrollAmount > maxScroll) scrollAmount = maxScroll;
    tabHeader.style.transform = `translateX(-${scrollAmount}px)`;
    checkArrows();
  });

  // Update arrow visibility on window resize
  window.addEventListener("resize", () => {
    checkArrows();
  });
}

// Function to display the forecast data
function displayForecast(data) {
  console.log(data);
  const mainTabContainer = document.querySelector(".tab-header");
  const tabContentContainer = document.querySelector(".tab-content-container");

  // Clear any existing content in the tab-header and tab-content
  mainTabContainer.innerHTML = "";
  tabContentContainer.innerHTML = "";

  // Get daily statistics for the forecast data
  const dailyForecast = getDailyStatistics(data.list);

  dailyForecast.forEach((forecast, index) => {
    const date = formatDateWithDayjs(forecast.date);
    const avgTemp = forecast.avgTemp;
    const minTemp = forecast.minTemp;
    const maxTemp = forecast.maxTemp;
    const commonWeather = forecast.commonWeather;

    // Create a div for each day's forecast
    const dayTab = document.createElement("div");
    dayTab.className = "main-tab";
    dayTab.dataset.tab = `day-${index}`; // Unique identifier for each tab

    // Add the "active" class to the first tab
    if (index === 0) {
      dayTab.classList.add("active");
    }

    // Create a title element
    const dateTitle = document.createElement("h2");
    dateTitle.textContent = date;

    // Create a paragraph for the temperatures
    const tempInfo = document.createElement("p");
    tempInfo.textContent = `Avg: ${avgTemp}°C, Min: ${minTemp}°C, Max: ${maxTemp}°C`;

    // Create a paragraph for the description
    const descriptionInfo = document.createElement("p");
    descriptionInfo.textContent = commonWeather.description;

    // Create an image for the weather icon
    const iconElement = document.createElement("img");
    iconElement.src = `https://openweathermap.org/img/wn/${commonWeather.icon}@2x.png`;
    iconElement.alt = commonWeather.description;
    iconElement.className = "daily-icon";

    // Append elements to the dayTab
    dayTab.appendChild(dateTitle);
    dayTab.appendChild(tempInfo);
    dayTab.appendChild(iconElement);
    dayTab.appendChild(descriptionInfo);

    // Append the dayTab to the mainTabContainer
    mainTabContainer.appendChild(dayTab);

    // Create a div for the content associated with each day's forecast
    const dayContent = document.createElement("div");
    dayContent.className = "tab-content";
    dayContent.id = `day-${index}`; // Match this ID with the data-tab attribute

    // Add the "active" class to the first content container
    if (index === 0) {
      dayContent.classList.add("active");
    }

    // Add hourly forecasts for the selected day
    const hourlyForecast = getHourlyForecastForDay(data.list, forecast.date);
    hourlyForecast.forEach((hour) => {
      const hourDiv = document.createElement("div");
      hourDiv.className = "hourly-forecast";

      const hourTime = formatHourWithDayjs(hour.dt_txt);
      const hourTemp = hour.main.temp;
      const hourDescription = hour.weather[0].description;
      const hourIconCode = hour.weather[0].icon;
      const hourIconUrl = `https://openweathermap.org/img/wn/${hourIconCode}@2x.png`;

      const hourTimeElement = document.createElement("h4");
      hourTimeElement.textContent = hourTime;

      const hourTempElement = document.createElement("p");
      hourTempElement.textContent = `${hourTemp}°C`;

      const hourDescriptionElement = document.createElement("p");
      hourDescriptionElement.textContent = hourDescription;

      const hourIconElement = document.createElement("img");
      hourIconElement.src = hourIconUrl;
      hourIconElement.alt = hourDescription;
      hourIconElement.className = "hourly-icon";

      hourDiv.appendChild(hourTimeElement);
      hourDiv.appendChild(hourIconElement);
      hourDiv.appendChild(hourTempElement);
      hourDiv.appendChild(hourDescriptionElement);

      dayContent.appendChild(hourDiv);
    });

    // Append the content for each day's forecast to the tab-content container
    tabContentContainer.appendChild(dayContent);
  });

  // After displaying the forecast, set up the tab navigation
  setupTabNavigation();
}

// Function to extract daily statistics from the forecast list
function getDailyStatistics(list) {
  const dailyData = {};

  list.forEach((item) => {
    const date = item.dt_txt.split(" ")[0]; // Get the date part (YYYY-MM-DD)
    if (!dailyData[date]) {
      dailyData[date] = {
        tempSum: 0,
        tempCount: 0,
        minTemp: item.main.temp,
        maxTemp: item.main.temp,
        weatherCounts: {}, // To count occurrences of each weather condition
        date: date
      };
    }

    dailyData[date].tempSum += item.main.temp;
    dailyData[date].tempCount += 1;
    dailyData[date].minTemp = Math.min(dailyData[date].minTemp, item.main.temp);
    dailyData[date].maxTemp = Math.max(dailyData[date].maxTemp, item.main.temp);

    // Count the weather condition
    const weather = item.weather[0];
    if (!dailyData[date].weatherCounts[weather.icon]) {
      dailyData[date].weatherCounts[weather.icon] = {
        count: 0,
        description: weather.description,
        icon: weather.icon
      };
    }
    dailyData[date].weatherCounts[weather.icon].count += 1;
  });

  return Object.values(dailyData).map((day) => {
    // Find the most common weather condition
    const commonWeather = Object.values(day.weatherCounts).reduce(
      (max, current) => (current.count > max.count ? current : max)
    );

    return {
      date: day.date,
      avgTemp: (day.tempSum / day.tempCount).toFixed(1),
      minTemp: day.minTemp.toFixed(1),
      maxTemp: day.maxTemp.toFixed(1),
      commonWeather: commonWeather
    };
  });
}

// Function to get hourly forecast for a specific day
function getHourlyForecastForDay(list, dayDate) {
  return list.filter((item) => item.dt_txt.startsWith(dayDate));
}

// Function to format date using Day.js
function formatDateWithDayjs(dateString) {
  const date = dayjs(dateString);
  return date.format("ddd D MMM");
}

// Function to format hour using Day.js
function formatHourWithDayjs(dateString) {
  const date = dayjs(dateString);
  return date.format("HH:mm");
}
