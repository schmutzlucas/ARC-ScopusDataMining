/**
 * This program can be used to reformat Grants data obtained from the Australian Research council data portal
 * https://dataportal.arc.gov.au/NCGP/Web/Grant/Grants. It creates a new json file where the grants are organized by
 * lead investigator instead of by grants. Moreover, it retrieves the metrics from the corresponding lead investigator
 * from Scopus using the Scopus Author API. For this step, it requires a Scopus API access and at least one Scopus API
 * key (https://dev.elsevier.com/).
 */

import {read, writeToFile} from './readWriteFile.js';
import {addORCID} from './orcidApi.js';
import {formatArcData, sumFunding} from './formatArcData.js'
import {addMetrics} from './scopusAPI.js'
import fs from 'fs';
import promptSync from 'prompt-sync';

// To get input from console
const prompt = promptSync();

async function main() {
    // removes old results if present
    if (fs.existsSync('./results')) {
        fs.rmSync('./results', {recursive: true});
    }
    // Asks the user for the filename of the ARC data, needs to be stored in ./data/
    const filename = prompt("Enter filename: ");
    console.log("Received filename.");

    // Since this is a small project, only one verification is used here.
    // To reinforce the application, please add more verifications.
    if (filename !== "") {
        console.log("Reading file...");
        let json = read("./data/" + filename);
        let data = formatArcData(json);
        sumFunding(data);
        console.log(data);
        writeToFile('grantsbyauth', data)
        await addORCID(data);
        writeToFile('grantsbyauthORCID', data)
        console.log(data);
        await addMetrics(data);
        console.log(data);
        writeToFile('grants', data);
    }
}

await main();
