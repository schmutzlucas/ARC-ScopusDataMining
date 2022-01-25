/**
 * Functions used to read the input data and write the results and errors
 */


import fs from 'fs';

/**
 * Reads the json file obtainedfrom the ARC plateform :https://dataportal.arc.gov.au/NCGP/Web/Grant/Grants
 * returns an object.
 * @param file ARC json file
 * @returns {any} grants object
 */
function read(file) {
    try {
        let grants = fs.readFileSync(file, 'utf8');
        grants = JSON.parse(grants);
        return grants;
    } catch (err) {
        console.error(err)
    }
}

/**
 * Writes results or errors to json files
 * @param filename
 * @param data
 */
function writeToFile(filename, data) {
    try {
        const dir = './results';
        const file = dir + '/' + filename + '.json'
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }

        removeNullElement(data)
        if (!fs.existsSync(file)) {
            fs.writeFileSync(file, JSON.stringify(data, null, 4), 'utf8');
        } else {
            fs.appendFileSync(file, '\n' + JSON.stringify(data, null, 4));
        }

    } catch (err) {
        console.error(err)
    }
}

/**
 * removes null elements that are created when we discard author with no metrics.
 * @param data
 */
/*
function removeNullElement (data){
    let tmp = [];
    for (const i in data.authors){
        if(data.authors[i] != null){
            tmp.push(data.authors[i]);
        }
    }
    data.authors = tmp;
}
*/

function removeNullElement (data) {
    if(data.authors)
    data.authors = Array.from(data.authors).filter(e=>e);
}


export {
    read,
    writeToFile,
    removeNullElement
};
