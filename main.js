'use strict';

const baseUrl = 'https://api.nps.gov/api/v1/parks';
const apiKey = 'MHel5sddCer1Ya0HwQvdbikoitE9jmBeboyR2E6p';

function formatQueryParams(params) {
    const stateCodeString = params.stateCode.split(/[ ,!."';:-]+/).join(',');
    params.stateCode = stateCodeString;
    const queryItems = Object.keys(params).map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`);
    return queryItems.join('&');
}

function getAddressObj(array) {
    let i;
    for (i = 0; i < array.length; i++) {
        if (array[i].type === 'Physical') {
            return array[i];
        }
    }
}

function getPhysAddress(response, index) {
    const addressArray = response.data[index].addresses;
    return getAddressObj(addressArray);
}

function determineLines(obj) {
    let result = ``;
    for (prop in obj) {
        const value = obj[prop];
        if (value) {
            result += `${value}<br>`;
        }
    }
    return result;
}



// function determineLines(obj) {
//     if (obj.line1 !== '' && obj.line2 !== '' && obj.line3 !== '') {
//         const line123 = `${obj.line1}<br>
//         ${obj.line2}<br>
//         ${obj.line3}<br>`;
//         return line123;
//     }
//     else if (obj.line1 !== '' && obj.line2 !== '') {
//         const line12 = `${obj.line1}<br>
//         ${obj.line2}<br>`;
//         return line12;
//     }
//     else if (obj.line1 !== '' && obj.line3 !== '') {
//         const line13 = `${obj.line1}<br>
//         ${obj.line3}<br>`;
//         return line13;
//     }
//     else {
//         const line1 = `${obj.line1}<br>`;
//         return line1;
//     }
// }

function formatAddress(response, index) {
    const physAddressObj = getPhysAddress(response, index);
    const addressLines = determineLines(physAddressObj);
    return `
    ${addressLines}
    ${physAddressObj.city}, ${physAddressObj.stateCode} ${physAddressObj.postalCode}
    `;
}

function displayParks(responseJson) {
    console.log(responseJson);
    $('.js-results').empty();
    for (let i = 0; i < responseJson.data.length; i++) {
        $('.js-results').append(`
        <li><h3>${responseJson.data[i].fullName}</h3></li>
        <li><p>${responseJson.data[i].description}</p></li>
        <li><a href="${responseJson.data[i].url}">Visit ${responseJson.data[i].fullName} website</a></li>
        <li><h4>Address:</h4></li>
        <li><p>${formatAddress(responseJson, i)}</p></li>
        `);
        $('#results').removeClass('hidden');
    }
}

function getParks(query, maxResults) {
    const params = {
        stateCode: query,
        limit: maxResults,
        fields: 'addresses',
        api_key: apiKey
    }
    const queryString = formatQueryParams(params);
    const url = `${baseUrl}?${queryString}`;
    fetch(url)
    .then(response => response.json())
    .then(responseJson => {
        if (responseJson.total > 0) {
            displayParks(responseJson);
        }
        else {
            throw new Error('state code not found');
        }
    })
    .catch(err => {
        $('.js-results').text(`Something went wrong. ${err.message}`);
    });
}

function watchForm() {
    $('form').submit(event => {
        event.preventDefault();
        const searchText = $('#search-text').val();
        const maxResults = $('#max-results').val() - 1;
        getParks(searchText, maxResults);
    });
}

$(watchForm);