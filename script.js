// Main function
async function main(){

    // Nested function for all event listeners
    function init(){
        let mapObject = initMap();

        // Map search result layer for the markers
        let markerSearchResultLayer = L.layerGroup();
        markerSearchResultLayer.addTo(mapObject);

        window.addEventListener('DOMContentLoaded', function(){
            // add event listeners here...

            // Search - when user clicks on search button
            document.querySelector('#search-btn').addEventListener('click', async function(){

                // clear prior search markers
                markerSearchResultLayer.clearLayers();
                // clear prior search results
                document.querySelector('#search-results').textContent = "";
                
                // get place search value
                let keyword = "";
                let category = "";
                let location = "";
                
                let searchValue = document.querySelector("#search-input").value;
                let catValue = document.querySelector("#category-input").value;
                let locationValue = document.querySelector("#location-input").value;
                
                if (searchValue){ keyword = searchValue; }
                if (catValue === "1") {
                    category = "11128"; // working space
                } else if (catValue === "2") {
                    category = "11129"; // meeting rooms
                } else {
                    category = "11128, 11129"; // search all working space and meeting rooms
                }
                if (locationValue){ location = document.querySelector("#location-input").value; }
                let near = `${location},Singapore` // string seperated by comma

                let response1 = await search(keyword, category, near);
                console.log(response1);

                // display number of search results
                let resultsNumber = response1.results.length;
                document.querySelector('#results-title').innerHTML = `${resultsNumber} results`;

                // map markers
                for (let eachResult of response1.results){
                    let lat = eachResult.geocodes.main.latitude;
                    let lng = eachResult.geocodes.main.longitude;
                    let coordinates = [lat,lng];

                    // create marker
                    let searchMarker = L.marker(coordinates);

                    // get photos fsq_id from results
                    let photoFsqid = eachResult.fsq_id;
                    // get place photo from foursquare
                    let response2 = await searchPhotos(photoFsqid);
                    // console.log(response2);
                    let photoUrl = "";
                    if (response2[0]) {
                        let prefix = response2[0].prefix;
                        let suffix = response2[0].suffix;
                        photoUrl = prefix + '192x144' + suffix;
                    }

                    // create popup
                    searchMarker.bindPopup(`<img src="${photoUrl}">
                                            <h6>${eachResult.name}</h6>`);
                    searchMarker.addTo(markerSearchResultLayer);
                    
                    let searchResultElement = document.querySelector('#search-results');

                    // append search results to searchResultElement
                    let resultElement = document.createElement('div');
                    resultElement.className = 'search-result card mb-3 p-2 shadow-sm';

                    let resultElementCard = document.createElement('div');
                    resultElementCard.className = 'card-body';

                    let resultTitle = document.createElement('h6');
                    resultTitle.className = 'card-title';

                    let resultText = document.createElement('p');
                    resultText.className = 'card-text text-muted';

                    resultTitle.innerHTML = eachResult.name;
                    resultText.innerHTML = eachResult.location.formatted_address;
                    
                    // append child
                    searchResultElement.appendChild(resultElement);
                    resultElement.appendChild(resultElementCard);
                    resultElementCard.appendChild(resultTitle);
                    resultElementCard.appendChild(resultText);

                    // Event listener to resultElement
                    resultElement.addEventListener('click', function(){
                        // zoom to the location on map
                        mapObject.flyTo(coordinates, 16); // check out leaflet documentation - map methods for modifying map state
                        // marker popup
                        searchMarker.openPopup();
                    })

                    // auto-click to zoom to first search result location
                    document.querySelector('.search-result').click();
                }
            })

        })

        // Map Setup
        function initMap() {
            let singapore = [1.29, 103.85];
            let mapObject = L.map('sgmap',{ zoomControl: false}).setView(singapore, 13); //disable zoomControl when initializing map
            // change position of zoom control
            L.control.zoom({position:'bottomright'}).addTo(mapObject);

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
