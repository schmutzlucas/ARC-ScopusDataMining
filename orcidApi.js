/**
 * These functions add the orcid of the first returned results to each author. This may create errors for common names
 * where the first results is not the desired author. Mitigation measures are implemented in the scopusAPI functions.
 */

import fetch from "node-fetch";

/**
 * Adds the ORCID to each author
 * @param data
 * @returns {Promise<void>}
 */
async function addORCID(data) {
    for (const i in data.authors) {
        data.authors[i].orcid = await orcidApiCall(data.authors[i]['lead-investigator']);
        console.log('orcid: ' + i + ' of ' + data.authors.length);
    }
}

/**
 * ORCID API call
 * @param leadInvestigator name of the lead investigator
 * @returns {Promise<*>} ORCID of the first result
 */
async function orcidApiCall(leadInvestigator) {
    let baseUrl = 'https://pub.orcid.org/v3.0/search/?q=';
    let orcidUrl = baseUrl + leadInvestigator + '&start=0&rows=1';
    let response = await fetch(orcidUrl, {method: 'GET', headers: {Accept: 'application/json'}});
    let orcidJson = await response.json();
    return orcidJson.result[0]['orcid-identifier'].path;
}

export {
    addORCID
};
