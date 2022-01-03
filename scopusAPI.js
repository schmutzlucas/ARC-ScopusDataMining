/**
 * These functions are used to collect and add the metrics from Scopus.
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


const apiKeys = ['6ab3c2a01c29f0e36b00c8fa1d013f83'];
const waitInterval = 333 / apiKeys.length;

var apiKeyIndex = 0;
var wait = new Promise(r => setTimeout(r, waitInterval));

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

function checkAustralian(dump) {
    return JSON.stringify(dump).includes('Australia');
}


async function scopusApiCalls(author) {
    let baseUrl = 'https://api.elsevier.com/content/author?orcid=';
    let scopusUrl = baseUrl + author.orcid + '&apikey=' + apiKeys[apiKeyIndex++ % apiKeys.length];

    await wait;
    let response = await fetch(scopusUrl, {method: 'GET', headers: {Accept: 'application/json'}});
    wait = new Promise(r => setTimeout(r, waitInterval));
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


async function scopusEidApiCall(author) {

    let baseUrl = 'http://api.elsevier.com/content/search/author?apikey=';
    let scopusUrl = baseUrl + apiKeys[apiKeyIndex++ % apiKeys.length] + '&query=AUTHFIRST%28'
        + author.firstName + '%29+AND+AUTHLASTNAME%28' + author.lastName + '%29';
    await wait;
    let response = await fetch(scopusUrl, {method: 'GET', headers: {Accept: 'application/json'}});
    wait = new Promise(r => setTimeout(r, waitInterval));
    let dump = await response.json();
    let eid = dump['search-results'].entry[0].eid

    baseUrl = 'https://api.elsevier.com/content/author?eid=';
    scopusUrl = baseUrl + eid + '&apikey=' + apiKeys[apiKeyIndex++ % apiKeys.length];

    await wait;
    response = await fetch(scopusUrl, {method: 'GET', headers: {Accept: 'application/json'}});
    wait = new Promise(r => setTimeout(r, waitInterval));
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
