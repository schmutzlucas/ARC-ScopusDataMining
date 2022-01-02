import {read, writeToFile} from './readWriteFile.js';
import {addORCID} from './orcidApi.js';
import {formatArcData, sumFunding} from './formatArcData.js'
import {addMetrics} from './scopusAPI.js'
import fs from 'fs';
import promptSync from 'prompt-sync';

// To get input from console
const prompt = promptSync();


async function main() {
    if (fs.existsSync('./results')) {
        fs.rmSync('./results', {recursive: true});
    }
    const filename = prompt("Enter filename: ");
    console.log("Received filename.");

    const apiKey = "6c5874ca0af03eea96af105221f99625";


    // Since this is a small project, only one verification is used here.
    // To reinforce the application, please add more verifications.
    if (filename !== "") {
        console.log("Reading file...");
        let json = read("./data/" + filename);
        let data = formatArcData(json);                       //return data authors object
        sumFunding(data);
        console.log(data);
        writeToFile('grantsbyauth', data)
        await addORCID(data);
        console.log(data);
        await addMetrics(data);
        console.log(data);
        writeToFile('grants', data);
    }
}

await main();

