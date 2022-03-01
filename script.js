// Main function
async function main(){

    // Nested function for all event listeners
    function init(){
        let mapObject = initMap();

        // create marker result layer
        let searchResultLayer = L.layerGroup();

        // load MRT station exit data
        async function loadHawkerCentres() {
            let response = await axios.get('data/hawker-centres.geojson');

            let hawkerName = "";
            let hawkerStatus = "";
            let hawkerAddress = "";
            let dummyDiv = document.createElement('div');

            let hawkerLayer = L.geoJson(response.data, {

                filter: function (feature) {
                    dummyDiv.innerHTML = feature.properties.Description;
                    
                    let columns = dummyDiv.querySelectorAll('td');
                    hawkerStatus = columns[3].innerHTML;
                    
                    if (hawkerStatus === "Existing") return true;
                    if (hawkerStatus === "Existing (new)") return true;
                },
                onEachFeature: function (feature, layer) {
                    dummyDiv.innerHTML = feature.properties.Description;
                    let columns = dummyDiv.querySelectorAll('td');
                    hawkerName = columns[19].innerHTML;
                    hawkerStatus = columns[3].innerHTML;
                    hawkerAddress = columns[29].innerHTML;

                    layer.bindPopup(`<div>
                                        <ul>
                                            <li>${hawkerName}</li>
                                            <li>${hawkerStatus}</li>
                                            <li>${hawkerAddress}</li>
                                        </ul>
                                    </div>`);

                    console.log(hawkerStatus);
                }

            }).addTo(mapObject);
            return hawkerLayer;
        }; 

        window.addEventListener('DOMContentLoaded', async function(){

            await loadHawkerCentres();

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
                    let openingHours = "";
                    if (response3.hours.display) {
                        openingHours = response3.hours.display;
                    } else {
                        openingHours = "No Opening Hours Available";
                    }
                    
                    // create popup content
                    let popupContent = document.createElement('div');
                    popupContent.className = 'py-1';

                    let popupTitle = document.createElement('h6');
                    popupTitle.className = 'mt-2';
                    popupTitle.innerHTML = eachResult.name;

                    let popupPhoto = `<img src="${photoUrl}" alt="">`;

                    let popupAddress = document.createElement('p');
                    popupAddress.className = 'fs-6';
                    popupAddress.innerHTML = address;

                    popupContent.appendChild(popupTitle);
                    popupContent.innerHTML += popupPhoto;

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
                    resultHours.innerHTML = openingHours;
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
                        mapObject.flyTo(coordinates, 18); // check out leaflet documentation - map methods for modifying map state
                        searchMarker.openPopup();
                    })
                    // auto-click first search result location
                    // document.querySelector('.search-result').click();
                }

                searchResultLayer.addTo(mapObject);
            })
        })

        // Map Setup
        function initMap() {
            let singapore = [1.29, 103.85];
            let mapObject = L.map('sgmap').setView(singapore, 13); //disable zoomControl when initializing map

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
