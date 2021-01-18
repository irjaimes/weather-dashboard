//variable to store the searched city
var city = "";
// DOM variables
var searchCityEl = $("#search-city");
var searchButtonEl = $("#search-button");
var clearButtonEl = $("#clear-history");
var currentCityEl = $("#current-city");
var currentTemperatureEl = $("#temperature");
var currentHumidtyEl = $("#humidity");
var currentWSpeedEl = $("#wind-speed");
var currentUVIndexEl = $("#uv-index");
var savedCity = [];

// Function to find city if it exists 
function find(c) {
    for (var i = 0; i < savedCity.length; i++) {
        if (c.toUpperCase() === savedCity[i]) {
            return -1;
        }
    }
    return 1;
}

// Set up the API key
var apiKey = "f0eea029f2fcc4a3ad0e31ee0e5b742a";
// Display the current and 5 day weather after grabing the city form the user input search text
function displayWeather(event) {
    event.preventDefault();
    // if city value not empty
    if (searchCityEl.val().trim() !== "") {
        city = searchCityEl.val().trim();
        currentWeather(city);
    }
}

// Create data query using ajax call
function currentWeather(city) {
    // Create queryURL to get a data from weather app server 
    var queryURL = "https://api.openweathermap.org/data/2.5/weather?q=" + city + "&APPID=" + apiKey;
    $.ajax({
        url: queryURL,
        method: "GET",
    }).then(function (response) {

        // Logic to parse the data query response to display: current weather, city, date and icon. 
        console.log(response);

        //Dta object from server api for icon property.
        var weathericon = response.weather[0].icon;
        var iconURL = "https://openweathermap.org/img/wn/" + weathericon + "@2x.png";

        var date = new Date(response.dt * 1000).toLocaleDateString();

        //parse the response for name of city and concanatig the date and icon.
        $(currentCityEl).html(response.name + "  (" + date + ")" + "<img src=" + iconURL + ">");
        
        // parse the response to display the current temperature & convert to ºF
        var tempF = (response.main.temp - 273.15) * 1.80 + 32;
        $(currentTemperatureEl).html((tempF).toFixed(2) + "&#8457");

        // display the humidity
        $(currentHumidtyEl).html(response.main.humidity + "%");
        // display wind speed 
        var ws = response.wind.speed;
        // convert wind speed to mph
        var windsmph = (ws * 2.237).toFixed(1);
        //display wind speed in MPH
        $(currentWSpeedEl).html(windsmph + "MPH");

        // use long and lat coordinates as a parameters for uv query url
        UVIndex(response.coord.lon, response.coord.lat);
        fiveDayForecast(response.id);
        if (response.cod == 200) {
            savedCity = JSON.parse(localStorage.getItem("cityname"));
            //check cities save to array
            console.log(savedCity);
            if (savedCity == null) {
                savedCity = [];
                savedCity.push(city.toUpperCase()
                );
                localStorage.setItem("cityname", JSON.stringify(savedCity));
                addToList(city);
                console.log(city);
            }
            else {
                if (find(city) > 0) {
                    savedCity.push(city.toUpperCase());
                    localStorage.setItem("cityname", JSON.stringify(savedCity));
                    addToList(city);
                }
                
            }
        }

    });
}

// This function returns the UV index response
function UVIndex(ln, lt) {
    // url to get uv index
    var uvQueryURL = "https://api.openweathermap.org/data/2.5/uvi?appid=" + apiKey + "&lat=" + lt + "&lon=" + ln;
    $.ajax({
        url: uvQueryURL,
        method: "GET"
    }).then(function (response) {
        $(currentUVIndexEl).html(response.value);
        // check that uv index value reponse works
        console.log(response.value);
    });
}

// function to display the 5 day forecast for currenct searched city
function fiveDayForecast(cityid) {
    var dayover = false;
    var queryforcastURL = "https://api.openweathermap.org/data/2.5/forecast?id=" + cityid + "&appid=" + apiKey;
    $.ajax({
        url: queryforcastURL,
        method: "GET"
    }).then(function (response) {
        // for each upcoming days
        for (i = 0; i < 5; i++) {
            var date = new Date((response.list[((i + 1) * 8) - 1].dt) * 1000).toLocaleDateString();
            var iconCode = response.list[((i + 1) * 8) - 1].weather[0].icon;
            var iconURL = "https://openweathermap.org/img/wn/" + iconCode + ".png";
            var tempK = response.list[((i + 1) * 8) - 1].main.temp;
            var tempF = (((tempK - 273.5) * 1.80) + 32).toFixed(2);
            var humidity = response.list[((i + 1) * 8) - 1].main.humidity;

            $("#date-" + i).html(date);
            $("#icon-" + i).html("<img src=" + iconURL + ">");
            $("#temp-" + i).html(tempF + "&#8457");
            $("#humidity-" + i).html(humidity + "%");
        }

    });
}

//Creat DOM elements to passed searched city on the search history
function addToList(c) {
    var listEl = $("<li>" + c.toUpperCase() + "</li>");
    $(listEl).attr("class", "list-group-item");
    $(listEl).attr("data-value", c.toUpperCase());
    $(".list-group").append(listEl);
}
// display the past search results when clicking on searched history city
function loadPastSearch(event) {
    var liEl = event.target;
    if (event.target.matches("li")) {
        city = liEl.textContent.trim();
        currentWeather(city);
    }

}

// render function to load last city searched from local storage
function loadLastSearch() {
    $("ul").empty();
    var savedCity = JSON.parse(localStorage.getItem("cityname"));
    if (savedCity !== null) {
        savedCity = JSON.parse(localStorage.getItem("cityname"));
        for (i = 0; i < savedCity.length; i++) {
            addToList(savedCity[i]);
        }
        city = savedCity[i - 1];
        currentWeather(city);
    }

}
// clear the search history from the page when clicking button
function clearSearchHistory(event) {
    event.preventDefault();
    savedCity = [];
    localStorage.removeItem("cityname");
    document.location.reload();

}
// Click Event Handlers
$(document).on("click", loadPastSearch);
$(window).on("load", loadLastSearch);
$("#search-button").on("click", displayWeather);
$("#clear-history").on("click", clearSearchHistory);





















