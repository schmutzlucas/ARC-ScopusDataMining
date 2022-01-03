/**
 * These functions are used to collect and add the metrics from Scopus to an author profile.
 * A first API call is made by using the ORCID, if it succeeds it checks if the author obtained from Scopus has been
 * affiliated with an Australian institution. If either of these two steps fail, it tries to obtain the Scopus EID by
 * making an API call with the first and last name of the author. Then checks if the returned author is affiliated
 * with an Australian institution and adds the metrics to the author.
 * To respect the number of queries per second authorized by Scopus a timer is implemented. As the request frequencies
 * are counted per API key, it is advised to use multiple API keys in the apiKeys array. The program will loop through
 * the keys to distribute the load.
 */

import {writeToFile} from "./readWriteFile.js";
import fetch from "node-fetch";

const apiKeys = [
    '6c5874ca0af03eea96af105221f99625',
    '6bb5f3f175ae62472ba8143341a05b3e',
    '6ab3c2a01c29f0e36b00c8fa1d013f83'];
const waitInterval = 333 / apiKeys.length;

var apiKeyIndex = 0;
var wait = new Promise(r => setTimeout(r, waitInterval));

/**
 * This function makes the API calls, store intermediary results to files, controls the quality of the {metrics}
 * and adds the metrics to the corresponding author profile.
 * @param data formatted in the previous steps
 * @returns {Promise<void>}
 */
async function addMetrics(data) {
    for (const i in data.authors) {
        let metrics = await scopusApiCalls(data.authors[i]);
        console.log('Metrics: ' + i + ' of ' + data.authors.length);
        if (i % 100 == 0) {
            writeToFile('save' + i, data);
        }
        if (metrics.hasOwnProperty('hIndex') && metrics.hasOwnProperty('documentCount')) {
            data.authors[i].metrics = metrics;
        } else {
            writeToFile('error', data.authors[i]);
            delete data.authors[i];
        }
    }
}

/**
 * This functions verifies if the corresponding author as been affiliated with an Australian institution
 * @param dump The complete response from the Scopus API when requesting author data by EID/ORCID
 * @returns {boolean}
 */
function checkAustralian(dump) {
    return JSON.stringify(dump).includes('Australia');
}

/**
 * This functions retrieves and organizes the metrics data from two different Scopus API calls
 * @param author Complete profile of a lead-investigator
 * @returns {Promise<{metrics}>} Formatted metrics as an object
 */
async function scopusApiCalls(author) {
    // First API call
    let baseUrl = 'https://api.elsevier.com/content/author?orcid=';
    let scopusUrl = baseUrl + author.orcid + '&apikey=' + apiKeys[apiKeyIndex++ % apiKeys.length];
    await wait;
    let response = await fetch(scopusUrl, {method: 'GET', headers: {Accept: 'application/json'}});
    wait = new Promise(r => setTimeout(r, waitInterval));
    // Organization of the metrics and second API call
    let metrics = {};
    if (response.ok) {
        let dump = await response.json();
        if (checkAustralian(dump)) {
            let authorData = dump['author-retrieval-response'][0];
            metrics.documentCount = Number(authorData['coredata']['document-count']);
            metrics.citedByCount = Number(authorData['coredata']['cited-by-count']);
            metrics.citationCount = Number(authorData['coredata']['citation-count']);
            metrics.publicationStart = Number(authorData['author-profile']['publication-range']['@start']);
            metrics.publicationEnd = Number(authorData['author-profile']['publication-range']['@end']);

            baseUrl = 'https://api.elsevier.com/content/author?view=metrics&orcid=';
            scopusUrl = baseUrl + author.orcid + '&apikey=' + apiKeys[apiKeyIndex++ % apiKeys.length];
            await wait;
            response = await fetch(scopusUrl, {method: 'GET', headers: {Accept: 'application/json'}});
            wait = new Promise(r => setTimeout(r, waitInterval));
            dump = await response.json();
            authorData = dump['author-retrieval-response'][0];
            metrics.hIndex = Number(authorData['h-index']);
            metrics.coAuthorCount = Number(authorData['coauthor-count']);
        }
    } else {
        metrics = await scopusEidApiCall(author)
    }

    return metrics
}

/**
 * This function offers an alternate way of looking for an author when the search by ORCID was unsatisfactory.
 * It first searches the eid of the author by first and last name (as obtained with the splitName function).
 * @param author Complete profile of a lead-investigator
 * @returns {Promise<{metrics}>}
 */
async function scopusEidApiCall(author) {
    // First API call by first name and last name to retrieve eid
    let baseUrl = 'http://api.elsevier.com/content/search/author?apikey=';
    let scopusUrl = baseUrl + apiKeys[apiKeyIndex++ % apiKeys.length] + '&query=AUTHFIRST%28'
        + author.firstName + '%29+AND+AUTHLASTNAME%28' + author.lastName + '%29';
    await wait;
    let response = await fetch(scopusUrl, {method: 'GET', headers: {Accept: 'application/json'}});
    wait = new Promise(r => setTimeout(r, waitInterval));
    let dump = await response.json();
    let eid = dump['search-results'].entry[0].eid

    // Second API calls by EID
    baseUrl = 'https://api.elsevier.com/content/author?eid=';
    scopusUrl = baseUrl + eid + '&apikey=' + apiKeys[apiKeyIndex++ % apiKeys.length];
    await wait;
    response = await fetch(scopusUrl, {method: 'GET', headers: {Accept: 'application/json'}});
    wait = new Promise(r => setTimeout(r, waitInterval));
    // Organization of the metrics and third API call
    let metrics = {};
    if (response.ok) {
        dump = await response.json();
        if (checkAustralian(dump)) {
            let authorData = dump['author-retrieval-response'][0];
            metrics.documentCount = Number(authorData['coredata']['document-count']);
            metrics.citedByCount = Number(authorData['coredata']['cited-by-count']);
            metrics.citationCount = Number(authorData['coredata']['citation-count']);
            metrics.publicationStart = Number(authorData['author-profile']['publication-range']['@start']);
            metrics.publicationEnd = Number(authorData['author-profile']['publication-range']['@end']);

            baseUrl = 'https://api.elsevier.com/content/author?view=metrics&eid=';
            scopusUrl = baseUrl + eid + '&apikey=' + apiKeys[apiKeyIndex++ % apiKeys.length];
            await wait;
            response = await fetch(scopusUrl, {method: 'GET', headers: {Accept: 'application/json'}});
            wait = new Promise(r => setTimeout(r, waitInterval));
            dump = await response.json();
            authorData = dump['author-retrieval-response'][0];
            metrics.hIndex = Number(authorData['h-index']);
            metrics.coAuthorCount = Number(authorData['coauthor-count']);
        }
    }
    return metrics
}

export {
    writeToFile,
    addMetrics,
};
