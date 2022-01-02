/**
 * These functions take as argument the formatted data from formatArcData and adds the orcid of the first returned results
 * to each author. This creates wrong orcid for common name that are caught with scopus.
 */

import fetch from "node-fetch";

/**
 *
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
 *
 * @param leadInvestigator
 * @returns {Promise<*>}
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
