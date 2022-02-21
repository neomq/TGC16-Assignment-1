console.dir(document)

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

            // Search bar dropdown toggle
            document.querySelector('#itemtext').addEventListener('click', function(){
                // alert('clicked!')
                let text = document.querySelector('#buttontext').innerText;
                document.querySelector('#buttontext').innerText = document.querySelector('#itemtext').innerText;
                document.querySelector('#itemtext').innerText = text;
            })
            // Search function -  when user clicks on search button
            document.querySelector('#search-btn').addEventListener('click', async function(){

                // Display search results
                let searchResultElement = document.querySelector("#search-results");

                // clear prior search markers
                markerSearchResultLayer.clearLayers();
                // clear prior search results
                document.querySelector('#search-results').textContent = "";
                
                let keyword = "";
                let location = "";
                // Toggle search field
                if (document.querySelector('#buttontext').innerText == 'Keyword'){
                    keyword = document.querySelector("#search-input").value;
                } else if (document.querySelector('#buttontext').innerText == 'Location'){
                    location = document.querySelector("#search-input").value;
                }
                let response = await search(keyword, location);
                // console.log(response);

                // map markers
                for (let eachResult of response.results){
                    let lat = eachResult.geocodes.main.latitude;
                    let lng = eachResult.geocodes.main.longitude;
                    let coordinates = [lat,lng];

                    let searchMarker = L.marker(coordinates);
                    searchMarker.bindPopup(`<div>${eachResult.name}</div>`); // bind popup to all markers
                    searchMarker.addTo(markerSearchResultLayer);
                    
                    // append search results to searchResultElement
                    let resultElement = document.createElement('div');
                    resultElement.innerHTML = eachResult.name;
                    resultElement.className = 'search-result';
                    searchResultElement.appendChild(resultElement);
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
