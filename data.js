const API_BASE_URL="https://api.foursquare.com/v3";
const API_KEY="fsq39KAcQFbTaS1UcZfkT7ZQAkGv7nIP4Wtkhziu4dcLibg=";

// search
async function search(keyword, near){

    let response1 = await axios.get(API_BASE_URL + '/places/search', {
        params: {
            'query': keyword,
            'categories': "11128,11147",
            'near': near,
            'limit': 50,
            'v': '02272022'
        },
        headers: {
            'Accept': 'application/json',
            'Authorization': API_KEY
        }
    })
    return response1.data;
}

// search photos
async function searchPhotos(fsq_id){
    let response2 = await axios.get(API_BASE_URL + `/places/${fsq_id}/photos`, {
        params: {
            'classifications': 'indoor'
        },
        headers: {
            'Accept': 'application/json',
            'Authorization': API_KEY
        }
    })
    return response2.data;
}

// search place details
async function searchPlaceDetails(fsq_id){
    let response3 = await axios.get(API_BASE_URL + `/places/${fsq_id}`, {
        params: {
            'fields': 'description,website,rating,hours'
        },
        headers: {
            'Accept': 'application/json',
            'Authorization': API_KEY
        }
    })
    return response3.data;
}