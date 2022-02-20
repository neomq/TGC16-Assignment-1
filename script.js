// Main function
async function main(){

    // Nested function for all event listeners
    function init(){
        let mapObject = initMap();

        window.addEventListener('DOMContentLoaded', function(){
            // add event listeners here
            
            // Search bar dropdown toggle
            document.querySelector('#itemtext').addEventListener('click', function(){
                //alert('clicked!')
                let text = document.querySelector('#buttontext').innerText;
                document.querySelector('#buttontext').innerText = document.querySelector('#itemtext').innerText;
                document.querySelector('#itemtext').innerText = text;
            })
            
        })
    }

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

    init();
}
main();
