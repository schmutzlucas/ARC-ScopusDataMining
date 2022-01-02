/**
 * Functions used to read the input data and write the results
 */


import fs from 'fs';

/**
 *
 * @param file
 * @returns {any}
 */
function read(file) {
    try {
        let grants = fs.readFileSync(file, 'utf8');
        grants = JSON.parse(grants);
        //console.log(grants);
        return grants;
    } catch (err) {
        console.error(err)
    }
}

/**
 *
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

// removes null elements that are created when we discard author with no metrics.
/**
 *
 * @param data
 */
function removeNullElement (data){
    let tmp = [];
    for (const i in data.authors){
        if(data.authors[i] != null){
            tmp.push(data.authors[i]);
        }
    }
    data.authors = tmp;
}

export {
    read,
    writeToFile,
    removeNullElement
};
