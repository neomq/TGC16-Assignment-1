const API_BASE_URL="https://api.foursquare.com/v3";
const API_KEY="fsq39KAcQFbTaS1UcZfkT7ZQAkGv7nIP4Wtkhziu4dcLibg=";

// search function
async function search(query, location){
    
    let near = 'singapore' + ',' + location; // string seperated by comma

    let response = await axios.get(API_BASE_URL + '/places/search', {
        params: {
            'query': query,
            'categories': '11128',
            'near': near,
            'v': '02202022'
        },
        headers: {
            'Accept': 'application/json',
            'Authorization': API_KEY
        }
    })
    return response.data;
}