// Main function
async function main(){

    // Nested function for all event listeners
    function init(){
        let mapObject = initMap();

        // Load gyms
        async function loadGyms() {
            let response = await axios.get('data/gyms.geojson');

            let gymsLayer = L.geoJson(response.data, {
                onEachFeature: function (feature, layer) {
                    console.log(feature.properties)
                    layer.bindPopup(feature.properties.Description);

                    let dummyDiv = document.createElement('div');
                    dummyDiv.innerHTML = feature.properties.Description;
                    let columns = dummyDiv.querySelectorAll('td');

                    let gymName = columns[13].innerHTML;
                    let gymAddressStreet = columns[8].innerHTML;
                    let gymBuilding = columns[3].innerHTML;
                    let gymPostalCode = columns[2].innerHTML;

                    layer.bindPopup(`<div>
                                        <ul>
                                            <li>${gymName}</li>
                                            <li>${gymAddressStreet}, ${gymBuilding}</li>
                                            <li>${gymPostalCode}</li>
                                        </ul>
                                    </div>`);
                }
            }).addTo(gymLayerGroup);

            return gymsLayer;
        }

        // Load smoking area
        async function loadSmoking() {
            let response = await axios.get('data/smoking.geojson');

            let smokingLayer = L.geoJson(response.data, {
                onEachFeature: function (feature, layer) {
                    // console.log(feature.properties)
                    layer.bindPopup(feature.properties.Description);

                    let dummyDiv = document.createElement('div');
                    dummyDiv.innerHTML = feature.properties.Description;
                    let columns = dummyDiv.querySelectorAll('td');

                    let smokeArea = columns[1].innerHTML;
                    let smokeDescription = columns[0].innerHTML;

                    layer.bindPopup(`<div>
                                        <ul>
                                            <li>${smokeArea}</li>
                                            <li>${smokeDescription}</li>
                                        </ul>
                                    </div>`);
                }
            }).addTo(smokeLayerGroup);

            return smokingLayer;
        }

        // Load supermarkets
        async function loadSupermarkets() {
            let response = await axios.get('data/supermarkets.geojson');

            let supermarketLayer = L.geoJson(response.data, {
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

                    layer.bindPopup(`<div>
                                        <ul>
                                            <li>${supermarketName}</li>
                                            <li>${supermarketBlk}</li>
                                            <li>${supermarketStreet}</li>
                                            <li>${supermarketPostCode}</li>
                                        </ul>
                                    </div>`);
                }
            }).addTo(supermarketsLayer);

            return supermarketLayer;
        }
       
        // create map layers
        let searchResultLayer = L.layerGroup();

        let nearbyFoodLayer = L.markerClusterGroup(); 
        let gymLayerGroup = L.markerClusterGroup(); 
        let smokeLayerGroup = L.markerClusterGroup(); 
        let supermarketsLayer = L.markerClusterGroup(); 

        let baseLayers = {
            
        }
        let overlays = {
            'Nearby Food & Dining': nearbyFoodLayer,
            'Gyms': gymLayerGroup,
            'Designated Smoking areas': smokeLayerGroup,
            'Supermarkets': supermarketsLayer
        }

        L.control.layers(baseLayers, overlays, {position: 'topleft'}).addTo(mapObject);

        window.addEventListener('DOMContentLoaded', async function(){

            loadGyms();
            loadSmoking();
            loadSupermarkets();

            // Search - when user clicks on search button
            document.querySelector('#search-btn').addEventListener('click', async function(){

                // auto-click navbar-toggler on mobile to collapse search bar
                let mediaQuery = window.matchMedia('(max-width: 991px)')
                // if the media query is true
                if (mediaQuery.matches) {
                    // trigger auto-click
                    document.querySelector(".navbar-toggler").click();
                }

                // clear prior search markers
                searchResultLayer.clearLayers();
                nearbyFoodLayer.clearLayers();

                // clear prior search results
                document.querySelector('#search-results').textContent = "";
                
                // get place search value
                let keyword = "";
                let location = "";
                
                let searchValue = document.querySelector("#search-input").value;
                let locationValue = document.querySelector("#location-input").value;
                
                if (searchValue){ keyword = searchValue; }
                if (locationValue){ location = document.querySelector("#location-input").value; }
                let near = `${location}, Singapore` // string seperated by comma

                let response1 = await search(keyword, near);
                console.log("search: ", keyword, "near ", near)
                // console.log(response1);

                // display search summary and number of search results
                let resultsNumber = response1.results.length;
                if (keyword && location) {
                    document.querySelector('#results-title').innerHTML = `${resultsNumber} results for ${keyword} near ${near}`;
                } else if (keyword && !location) {
                    document.querySelector('#results-title').innerHTML = `${resultsNumber} results for ${keyword} in Singapore`;
                } else if (location && !keyword) {
                    document.querySelector('#results-title').innerHTML = `${resultsNumber} results near ${near}`;
                } else {
                    document.querySelector('#results-title').innerHTML = `Suggested Co-working Spaces in Singapore`;
                }
                
                // display results filter
                document.querySelector('#results-filter').style.display = "block";
                document.querySelector('#filter-icon').style.display = "block";
                document.querySelector('#filter-btn').style.display = "block";

                // map markers
                for (let eachResult of response1.results){
                    let lat = eachResult.geocodes.main.latitude;
                    let lng = eachResult.geocodes.main.longitude;
                    let coordinates = [lat,lng];

                    // create marker
                    let searchMarker = L.marker(coordinates);

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
                        photoUrl = prefix + '200x150' + suffix;
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
                    //console.log(response4);
                    let nearFood = "";
                    let foodArray = [];
                    let searchNearbyFood;
                    for (let eachFoodResult of response4.results){
                        nearFood = eachFoodResult.name;
                        nearFoodAddress = eachFoodResult.location.formatted_address;
                        nearFoodDistance = eachFoodResult.distance;
                        searchNearbyFood = L.marker([eachFoodResult.geocodes.main.latitude,eachFoodResult.geocodes.main.longitude]);
                        searchNearbyFood.bindPopup(`<div>
                                                        <p>${nearFood}</p>
                                                        <p>${nearFoodAddress}</p>
                                                        <p>${nearFoodDistance}m away</p>
                                                    </div>`);
                        searchNearbyFood.addTo(nearbyFoodLayer);
                        foodArray.push(nearFood);
                    }                    
                    
                    // create popup content
                    let popupContent = document.createElement('div');
                    popupContent.className = 'py-1';

                    let popupTitle = document.createElement('h6');
                    popupTitle.className = 'mt-2';
                    popupTitle.innerHTML = eachResult.name;

                    let popupPhoto = `<img src="${photoUrl}" alt="">`;

                    let popupAddress = document.createElement('p');
                    popupAddress.className = 'fs-6 text-muted mt-1 mb-2';
                    popupAddress.innerHTML = address;

                    // let popupLatLng = document.createElement('p'); // for checking only
                    // popupLatLng.innerHTML = `${lat},${lng}`; // for checking only
                    
                    popupContent.appendChild(popupTitle);
                    if (photoUrl !== ""){
                        popupContent.innerHTML += popupPhoto;
                    };
                    popupContent.appendChild(popupAddress);
                    // popupContent.appendChild(popupLatLng);  // for checking only

                    // add popup content to marker
                    searchMarker.bindPopup(popupContent, {maxWidth: 200});
                    
                    // add marker to search layer
                    searchMarker.addTo(searchResultLayer);

                    // append search results to searchResultElement
                    let searchResultElement = document.querySelector('#search-results');
                    let resultElement = document.createElement('div');
                    resultElement.className = 'search-result card mb-3 p-2';

                    let resultElementCard = document.createElement('div');
                    resultElementCard.className = 'card-body';

                    let resultTitle = document.createElement('h6');
                    resultTitle.className = 'card-title';

                    let resultHours = document.createElement('p');
                    resultHours.className = 'card-category lead fs-6';

                    let resultLocation = document.createElement('p');
                    resultLocation.className = 'card-text text-muted';

                    let resultWeb = document.createElement('p');

                    resultTitle.innerHTML = eachResult.name;
                    resultHours.innerHTML = `${openNow} • ${openingHours}`;
                    resultLocation.innerHTML += address;
                    resultWeb.innerHTML = `<a href="${website}" class="link-primary">${website}</a>`;
                    
                    searchResultElement.appendChild(resultElement);
                    resultElement.appendChild(resultElementCard);
                    resultElementCard.appendChild(resultTitle);
                    resultElementCard.appendChild(resultHours);
                    resultElementCard.appendChild(resultLocation);
                    resultElementCard.appendChild(resultWeb);

                    // Event listener to resultElement
                    resultElement.addEventListener('click', function(){
                        // zoom to the location on map
                        mapObject.flyTo(coordinates, 18);
                        searchMarker.openPopup();
                    })
                    // auto-click first search result location
                    // document.querySelector('.search-result').click();
                }

                searchResultLayer.addTo(mapObject);
                nearbyFoodLayer.addTo(mapObject);
            })
        })

        // Map Setup
        function initMap() {
            let singapore = [1.29, 103.85];
            let mapObject = L.map('sgmap').setView(singapore, 13);

            // Tile layers boilerplate
            L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
                attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery (c) <a href="https://www.mapbox.com/">Mapbox</a>',
                maxZoom: 18,
                id: 'mapbox/streets-v11',
                tileSize: 512,
                zoomOffset: -1,
                accessToken: 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw' //demo access token
            }).addTo(mapObject);

            return mapObject;
        }
    }
    init();
}
main();
