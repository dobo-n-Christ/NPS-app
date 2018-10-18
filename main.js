'use strict';

const baseUrl = 'https://api.nps.gov/api/v1/parks';
const apiKey = 'MHel5sddCer1Ya0HwQvdbikoitE9jmBeboyR2E6p';

function formatQueryParams(params) {
    const stateCodeString = params.stateCode.split(/[ ,!."';:-]+/).join(',');
    params.stateCode = stateCodeString;
    const queryItems = Object.keys(params).map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`);
    return queryItems.join('&');
}

function displayParks(responseJson) {
    console.log(responseJson);
    $('.js-results').empty();
    for (let i = 0; i < responseJson.data.length; i++) {
        $('.js-results').append(`
        <li><h3>${responseJson.data[i].fullName}</h3></li>
        <li><p>${responseJson.data[i].description}</p></li>
        <li><a href="${responseJson.data[i].url}">Visit ${responseJson.data[i].fullName} website</a></li>
        `);
        $('#results').removeClass('hidden');
    }
}

function getParks(query, maxResults) {
    const params = {
        stateCode: query,
        limit: maxResults,
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