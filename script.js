// Setup Map
let singapore = [1.29, 103.85];
let mapObject = L.map('sgmap',{zoomControl: false}).setView(singapore, 13);
function initMap() {
    L.control.zoom({
        position:'bottomright'
    }).addTo(mapObject);

    // Tile layers boilerplate
    // 'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}'
    // 'https://api.mapbox.com/styles/v1/mqneo/cl09ur8r9004016mqo7v9bx8b/tiles/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoibXFuZW8iLCJhIjoiY2wwOXVoZHdrMGgwbzNrbnRrZWlycDh6MSJ9.1Xpvf-vfkPdh_0yvX9kgOw'
    L.tileLayer('https://api.mapbox.com/styles/v1/mqneo/cl09ur8r9004016mqo7v9bx8b/tiles/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoibXFuZW8iLCJhIjoiY2wwOXVoZHdrMGgwbzNrbnRrZWlycDh6MSJ9.1Xpvf-vfkPdh_0yvX9kgOw', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery (c) <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox/streets-v11',
        tileSize: 512,
        zoomOffset: -1,
        accessToken: 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw' //demo access token
    }).addTo(mapObject);

    return mapObject;
}

// Create Map layers
let searchResultLayer = L.layerGroup();
let nearbyFoodLayer = L.markerClusterGroup(); 
let gymLayerGroup = L.markerClusterGroup(); 
let supermarketsLayer = L.markerClusterGroup(); 

let baseLayers = {};
let overlays = {
    'nearby food': nearbyFoodLayer,
    'Gyms': gymLayerGroup,
    'Supermarkets': supermarketsLayer
};

L.control.layers(baseLayers, overlays, {position: 'topright'}).addTo(mapObject);

// Hide leaflet default layers menu
let lc = document.getElementsByClassName('leaflet-control-layers');
lc[0].style.visibility = 'hidden';

// Create leaflet custom markers
const defaultMarker = L.icon({
    iconUrl: 'images/icons/marker-grey.png',
    iconSize: [34, 42],
    iconAnchor: [14, 0],
    popupAnchor: [2, 0]
});

const foodMarker = L.icon({
    iconUrl: 'images/icons/food-marker.png',
    iconSize: [40, 43],
    iconAnchor: [14, 0],
    popupAnchor: [5, 0]
});

// set search results div as global variable
let searchResultElement = document.querySelector('#search-results');

// Execute search
function startSearch() {

    // update leaflet map
    mapObject.invalidateSize();

    // auto-click to collapse search bar when user clicks on search on md/lg screen
    let mediaQueryMax991 = window.matchMedia('(max-width: 991px)');
    // if the max-width: 991px is true
    if (mediaQueryMax991.matches) {
        // alert("match!");
        // trigger auto-click
        document.querySelector(".navbar-toggler").click();
    }

    // clear prior search markers
    searchResultLayer.clearLayers();
    nearbyFoodLayer.clearLayers();

    // clear prior search results
    document.querySelector('#search-results').textContent = "";

    // get search query from form input
    let keyword = "";
    let location = "";

    let searchValue = document.querySelectorAll("#search-input");
    for (let x=0; x < searchValue.length; x++){
        if (searchValue[x].value !== ""){
            keyword = searchValue[x].value;
        }
    };

    let locationValue = document.querySelectorAll("#location-input");
    for (let x=0; x < locationValue.length; x++){
        if (locationValue[x].value !== ""){
            location = locationValue[x].value;
        }
    };

    // console.log("checking:", keyword, location); // checking only

    // Validation of search query
    let specialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
    let locationNotValid = false;
    let keywordNotValid = false;

    if (specialChars.test(location)){
        locationNotValid = true;
    }
    if (specialChars.test(keyword)){
        keywordNotValid = true;
    }

    if (locationNotValid || keywordNotValid) {
        // remove display of result summary
        document.querySelector('#results-header').style.display = "none";

        // create display of error message on the results pane
        let displayError = document.createElement('div');
        displayError.className = 'error-popup2 card bg-transparent border-0';

        let displayErrorText = document.createElement('div');
        displayErrorText.className = 'card-body';
        
        if (locationNotValid) {
            displayErrorText.innerHTML = `No search results. Please enter a valid location`;
        }
        if (keywordNotValid) {
            displayErrorText.innerHTML = `No search results. Please enter a valid keyword`;
        }
        if (locationNotValid && keywordNotValid) {
            displayErrorText.innerHTML = `No search results. Please enter a valid location and keyword`;
        }

        searchResultElement.appendChild(displayError);
        displayError.appendChild(displayErrorText);

    } else {
        // remove display of results summary
        document.querySelector('#results-header').style.display = null;
        
        // pass search query to foursquare api and display results
        getSearchResults (keyword, location);
    }
} // end of startSearch

// Get search results
async function getSearchResults (keyword, location){
    let near = `${location}, Singapore`;
    let response1 = await search(keyword, near);
    // console.log("search for", keyword, "near ", near)
    // console.log(response1);

    // display search summary and number of search results
    let resultsNumber = response1.results.length;
    if (keyword && location) {
        document.querySelector('#results-title').innerHTML = `Search results for ${keyword} near ${near}`;
        document.querySelector('#results-number').innerHTML = `${resultsNumber} results`;
    } else if (keyword && !location) {
        document.querySelector('#results-title').innerHTML = `Search results for ${keyword} in Singapore`;
        document.querySelector('#results-number').innerHTML = `${resultsNumber} results`;
    } else if (location && !keyword) {
        document.querySelector('#results-title').innerHTML = `Search results near ${near}`;
        document.querySelector('#results-number').innerHTML = `${resultsNumber} results`;
    } else {
        document.querySelector('#results-title').innerHTML = `Suggested Co-working Spaces in Singapore`;
        document.querySelector('#results-number').innerHTML = `${resultsNumber} suggestions`;
    }

    // display results filter
    // let searchFilter = document.querySelector('#results-filter');
    // searchFilter.style.display = "block";

    // map layers toggle to appear
    document.querySelector("#layer-container").style.display = "block";

    // map markers
    for (let eachResult of response1.results) {
        let lat = eachResult.geocodes.main.latitude;
        let lng = eachResult.geocodes.main.longitude;
        let coordinates = [lat, lng];

        // create marker
        let searchMarker = L.marker(coordinates, { icon: defaultMarker });

        // get address from results
        let address = eachResult.location.formatted_address;

        // get fsq_id from results
        let fsqid = eachResult.fsq_id;

        // get photos
        let response2 = await searchPhotos(fsqid);
        // console.log(response2);
        let photoUrl = "";
        if (response2[0]) {
            let prefix = response2[0].prefix;
            let suffix = response2[0].suffix;
            photoUrl = prefix + '180x135' + suffix;
        }

        // get place information
        let response3 = await searchPlaceDetails(fsqid);
        // console.log(response3);

        // get website
        let website = "";
        if (response3.website) {
            website = response3.website;
        }
        // get opening hours
        let openNow = "";
        if (response3.hours.open_now === true) {
            openNow = "Open";
        } else {
            openNow = "Closed";
        }
        let openingHours = "";
        if (response3.hours.display) {
            openingHours = response3.hours.display;
        } else {
            openingHours = "No Opening Hours Available";
        }

        // get nearby food and dining info 
        let ll = `${lat},${lng}`;
        let response4 = await searchNearFood(ll);
        // console.log(response4);
        let nearFood = "";
        let searchNearbyFood;
        for (let eachFoodResult of response4.results) {
            nearFood = eachFoodResult.name;
            nearFoodAddress = eachFoodResult.location.formatted_address;
            nearFoodDistance = eachFoodResult.distance;

            let foodCoordinates = [eachFoodResult.geocodes.main.latitude, eachFoodResult.geocodes.main.longitude];
            searchNearbyFood = L.marker(foodCoordinates, { icon: foodMarker });
            searchNearbyFood.bindPopup(`<div class="layer-popup">
                                    <p class="layer-popup-title">${nearFood}<p>
                                    <p class="layer-popup-address">${nearFoodAddress}</p>
                                    <p class="layer-popup-subtext">${nearFoodDistance}m away from ${eachResult.name}</p>
                                </div>`);
            searchNearbyFood.addTo(nearbyFoodLayer);
        }

        // create popup content
        let popupContent = document.createElement('div');
        popupContent.className = 'py-1';

        let popupTitle = document.createElement('h6');
        popupTitle.className = 'popup-title mt-2';
        popupTitle.innerHTML = eachResult.name;

        let popupPhoto = `<img src="${photoUrl}" alt="">`;

        let popupAddress = document.createElement('p');
        popupAddress.className = 'popup-address mt-3 mb-2';
        popupAddress.innerHTML = address;

        // let popupLatLng = document.createElement('p'); // for checking only
        // popupLatLng.innerHTML = `${lat},${lng}`; // for checking only

        popupContent.appendChild(popupTitle);
        if (photoUrl !== "") {
            popupContent.innerHTML += popupPhoto;
        };
        popupContent.appendChild(popupAddress);
        // popupContent.appendChild(popupLatLng);  // for checking only

        // add popup content to marker
        searchMarker.bindPopup(popupContent, { maxWidth: 180 });

        // add marker to search layer
        searchMarker.addTo(searchResultLayer);

        // append search results to searchResultElement
        // let searchResultElement = document.querySelector('#search-results'); // set as global variable

        let resultElement = document.createElement('div');
        resultElement.className = 'search-result card bg-transparent mb-3 p-2';

        let resultElementCard = document.createElement('div');
        resultElementCard.className = 'card-body';

        let resultTitle = document.createElement('h6');
        resultTitle.className = 'card-title pb-2';

        let resultHours = document.createElement('p');
        if (openNow === "Open") {
            resultHours.className = 'card-category open my-2';
        } else {
            resultHours.className = 'card-category close my-2';
        }

        let resultLocation = document.createElement('p');
        resultLocation.className = 'card-text mb-2';

        // let resultWeb = document.createElement('div');
        // resultWeb.className = 'mt-3';

        resultTitle.innerHTML = eachResult.name;
        resultHours.innerHTML = `<i class="fa-regular fa-clock"></i>&nbsp;&nbsp;${openNow} • ${openingHours}`;
        resultLocation.innerHTML += address;
        // resultWeb.innerHTML = `<a class="btn btn-outline-secondary btn-sm" href="${website}" role="button">Visit Website</a>`;

        searchResultElement.appendChild(resultElement);
        resultElement.appendChild(resultElementCard);
        resultElementCard.appendChild(resultTitle);
        resultElementCard.appendChild(resultHours);
        resultElementCard.appendChild(resultLocation);

        if (website !== "") {
            let resultWeb = document.createElement('div');
            resultWeb.className = 'mt-3';
            resultWeb.innerHTML = `<a class="btn btn-outline-secondary btn-sm" href="${website}" target="_blank" role="button">Visit Website</a>`;
            resultElementCard.appendChild(resultWeb);
        }

        // Event listener to resultElement
        resultElement.addEventListener('click', function () {
            // zoom to the location on map
            mapObject.flyTo(coordinates, 18);
            searchMarker.openPopup();
        })
    }

    searchResultLayer.addTo(mapObject);
};

// Main function
async function main(){

    // Nested function for all event listeners
    function init(){
        let mapObject = initMap();

        // Load gyms data
        async function loadGyms() {
            let response = await axios.get('data/gyms.geojson');

            let gymsLayer = L.geoJson(response.data, {
                pointToLayer: function(feature, latlng) {
                    const gymMarker = L.icon({
                            iconUrl: 'images/icons/gym-marker.png',
                            iconSize: [40, 43],
                            iconAnchor: [14, 0],
                            popupAnchor: [5, 0]
                        });
                    return L.marker(latlng, {icon: gymMarker});
                },
                onEachFeature: function (feature, layer) {
                    // console.log(feature.properties)
                    layer.bindPopup(feature.properties.Description);

                    let dummyDiv = document.createElement('div');
                    dummyDiv.innerHTML = feature.properties.Description;
                    let columns = dummyDiv.querySelectorAll('td');

                    let gymName = columns[13].innerHTML;
                    let gymAddressStreet = columns[8].innerHTML;
                    let gymBuilding = columns[3].innerHTML;
                    let gymPostalCode = columns[2].innerHTML;

                    layer.bindPopup(`<div class="layer-popup">
                                        <p class="layer-popup-title">${gymName}</p>
                                        <p class="layer-popup-address">${gymAddressStreet}, ${gymBuilding}</p>
                                        <p class="layer-popup-address">${gymPostalCode}</p>
                                    </div>`);
                }
            }).addTo(gymLayerGroup);

            return gymsLayer;
        }

        // Load supermarkets data
        async function loadSupermarkets() {
            let response = await axios.get('data/supermarkets.geojson');

            let supermarketLayer = L.geoJson(response.data, {
                pointToLayer: function(feature, latlng) {
                    const marketMarker = L.icon({
                            iconUrl: 'images/icons/market-marker.png',
                            iconSize: [40, 43],
                            iconAnchor: [14, 0],
                            popupAnchor: [5, 0]
                        });
                    return L.marker(latlng, {icon: marketMarker});
                },
                onEachFeature: function (feature, layer) {
                    // console.log(feature.properties)
                    layer.bindPopup(feature.properties.Description);

                    let dummyDiv = document.createElement('div');
                    dummyDiv.innerHTML = feature.properties.Description;
                    let columns = dummyDiv.querySelectorAll('td');

                    let supermarketName = columns[0].innerHTML;
                    let supermarketBlk = columns[1].innerHTML;
                    let supermarketStreet = columns[2].innerHTML;
                    let supermarketPostCode = columns[4].innerHTML;

                    layer.bindPopup(`<div class="layer-popup">
                                        <p class="layer-popup-title">${supermarketName}</p>
                                        <p class="layer-popup-address">${supermarketBlk} ${supermarketStreet}, ${supermarketStreet}</p>
                                    </div>`);
                }
            }).addTo(supermarketsLayer);

            return supermarketLayer;
        }
       
        window.addEventListener('DOMContentLoaded', async function(){

            loadGyms();
            loadSupermarkets();

            // Toggle map layers
            // 1. nearby food layer 
            document.querySelector("#layer-btn-toggle-food").addEventListener('click', function(){
                if (mapObject.hasLayer(nearbyFoodLayer)) {
                    document.querySelector("#layer-btn-toggle-food").classList.remove('btn-secondary');
                    document.querySelector("#layer-btn-toggle-food").classList.add('btn-light');
                    mapObject.removeLayer(nearbyFoodLayer);
                } else {
                    document.querySelector("#layer-btn-toggle-food").classList.remove('btn-light');
                    document.querySelector("#layer-btn-toggle-food").classList.add('btn-secondary');
                    mapObject.addLayer(nearbyFoodLayer);
                }
            });
            // 2. gym layer
            document.querySelector("#layer-btn-toggle-gym").addEventListener('click', function(){
                if (mapObject.hasLayer(gymLayerGroup)) {
                    document.querySelector("#layer-btn-toggle-gym").classList.remove('btn-secondary');
                    document.querySelector("#layer-btn-toggle-gym").classList.add('btn-light');
                    mapObject.removeLayer(gymLayerGroup);
                } else {
                    document.querySelector("#layer-btn-toggle-gym").classList.remove('btn-light');
                    document.querySelector("#layer-btn-toggle-gym").classList.add('btn-secondary');
                    mapObject.addLayer(gymLayerGroup);
                }
            });
            // 3. supermarket layer
            document.querySelector("#layer-btn-toggle-market").addEventListener('click', function(){
                if (mapObject.hasLayer(supermarketsLayer)) {
                    document.querySelector("#layer-btn-toggle-market").classList.remove('btn-secondary');
                    document.querySelector("#layer-btn-toggle-market").classList.add('btn-light');
                    mapObject.removeLayer(supermarketsLayer);
                } else {
                    document.querySelector("#layer-btn-toggle-market").classList.remove('btn-light');
                    document.querySelector("#layer-btn-toggle-market").classList.add('btn-secondary');
                    mapObject.addLayer(supermarketsLayer);
                }
            });
            
            // Interaction of search results panel
            let mediaQueryMax767 = window.matchMedia('(max-width: 767px)'); // for sm
            let mediaQueryMin768 = window.matchMedia('(min-width: 768px)'); // for md & lg
            function showSearchLargeScreen(){
                document.querySelector('#show-results-btn').style.display = "none";
                document.querySelector('#results-container').style.height = null;
                document.querySelector('#results-container').style.padding = "14px 26px";
                document.querySelector('#results-pane').style.height = null;
            }
            function showSearchMobile(){
                document.querySelector('#show-results-btn').style.display = "none";
                document.querySelector('#results-container').style.height = null;
                document.querySelector('#results-container').style.padding = "18px 22px 14px 22px";
                document.querySelector('#results-pane').style.height = null;
            }
            document.querySelector('#show-results-btn').addEventListener('click', function(){
                // for md & lg
                if (mediaQueryMin768.matches) {
                    showSearchLargeScreen();
                };
                // for sm
                if (mediaQueryMax767.matches) {
                    showSearchMobile();
                };
            });
            document.querySelector('#hide-btn').addEventListener('click', function(){
                document.querySelector('#results-container').style.height = "0";
                document.querySelector('#results-container').style.overflow = "hidden";
                document.querySelector('#results-container').style.padding = "0";
                document.querySelector('#results-pane').style.height = "0";
                document.querySelector('#show-results-btn').style.display = "block";
            })

            // When user clicks on search button
            let searchButtons = document.querySelectorAll('#search-btn');
            for (let i of searchButtons) {
                i.addEventListener('click', async function() {
                    
                    // auto-click to collapse search bar when user clicks on search on md/lg screen
                    let mediaQueryMax991 = window.matchMedia('(max-width: 991px)');
                    // if the max-width: 991px is true
                    if (mediaQueryMax991.matches) {
                        // trigger auto-click
                        document.querySelector(".navbar-toggler").click();
                    }

                    // start search
                    startSearch();

                }); // end of search button click function
            }; // end of search button for loop
            
        })
    }
    init();
}
main();


// SPA
let page1 = document.querySelector('#page-1');
let page2 = document.querySelector('#page-2');

function toHomePage(){
    let pages = document.querySelectorAll('.page');
    // hide all the pages
    for (let p of pages) {
        p.classList.remove('show');
        p.classList.add('hidden');
    }

    // show page 1
    page1.classList.remove('hidden');
    page1.classList.add('show');
};
function toSearchPage(){
    let pages = document.querySelectorAll('.page');
    // hide all the pages
    for (let p of pages) {
        p.classList.remove('show');
        p.classList.add('hidden');
    }

    // show page 2
    page2.classList.remove('hidden');
    page2.classList.add('show');
};

document.querySelector('#home-btn').addEventListener('click', toHomePage);
document.querySelector('#search-btn').addEventListener('click', function(){

    // perform form validation
    let locationNotValid = false;
    let keywordNotValid = false;

    let locationInput = document.querySelector('#location-input').value;
    let keywordInput = document.querySelector('#search-input').value;
    let specialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;

    if (specialChars.test(locationInput)){
        locationNotValid = true;
        // console.log("location not valid");
    }
    if (specialChars.test(keywordInput)){
        keywordNotValid = true;
        // console.log("keyword not valid");
    }

    if (locationNotValid || keywordNotValid){
        // insert error message
        let ErrorDiv = document.querySelector('#error-popup');
        ErrorDiv.style.display = 'block';

        let ErrorDivBody = document.querySelector('#error-msg');
        // ErrorDivBody.innerHTML = ''; // clear existing error msg

        if (locationNotValid) {
            ErrorDivBody.innerHTML = `<p>Invalid Location</p>`;
        }
        if (keywordNotValid) {
            ErrorDivBody.innerHTML = `<p>Invalid Keyword</p>`;
        }
        if (locationNotValid && keywordNotValid) {
            ErrorDivBody.innerHTML = '<p>Invalid Location & Keyword</p>';
        }

        // close alert
        document.querySelector('#close-alert-btn').addEventListener('click', function(){
            ErrorDiv.style.display = 'none';
        })

    } else {
        toSearchPage();
        // startSearch();
    }

});
