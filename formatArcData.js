/**
 * These functions are used to format the data obtained from the Australian Research council plateform :
 * https://dataportal.arc.gov.au/NCGP/Web/Grant/Grants
 */

/**
 * Creates an object that stores the relevant grant information found in the ARC json
 * @param data 
 * @returns {{}} 
 */
function createGrantObj(data) {
    let grant = {};
    grant.id = data.id;
    grant.scheme = data.attributes['scheme-name'];
    grant.schemeCode = data.attributes['scheme-information'].schemeCode;
    grant.yearSubmit = data.attributes['scheme-information'].submissionYear;
    grant.fundingCurrent = data.attributes['current-funding-amount'];
    grant.fundingAnnounced = data.attributes['announced-funding-amount'];
    grant.yearStart = data.attributes['funding-commencement-year'];
    return grant;
}

/**
 * Splits the name of the lead investigator in a stupid way, first token (title) discarded, second token = first name,
 * last token = last name. However, this was the best way found to work with the Scopus API, and it is used only as a
 * last resort.
 * @param lead_investigator String containing the name of the lead investigator in the ARC data
 * @returns {{firstName: *, lastName: *}}
 */
function splitName(lead_investigator) {
    let lead_investigator_array = lead_investigator.split(' ');
    let firstName = lead_investigator_array[1];
    let lastName = lead_investigator_array[lead_investigator_array.length - 1];
    return {firstName, lastName};
}

/**
 * Rearranges the string containing the name of the lead investigator to discard the title and replace spaces with %20
 * to be used in the ORCID API.
 * @param lead_investigator String containing the name of the lead investigator in the ARC data
 * @returns {string}
 */
function noTitleName(lead_investigator) {
    let lead_investigator_array = lead_investigator.split(' ');
    lead_investigator_array.shift();
    return lead_investigator_array.join('%20');
}

/**
 * Reformats the arc data by author/lead-investigator
 * @param jsons takes as input the json obtained from the ARC database
 * @returns {{authors: *[]}} a json organized by lead investigator name, where each investigator can have multiple grants.
 */
function formatArcData(jsons) {
    try {
        const data = {
            authors: []
            };

        let map = new Map();
        // loops through each grant
        for (const i in jsons.data) {
            let lead_investigator = jsons.data[i].attributes['lead-investigator'];
            let tabName = splitName(lead_investigator);
            let firstName = tabName.firstName;
            let lastName = tabName.lastName;

            lead_investigator = noTitleName(lead_investigator);
            let grant = createGrantObj(jsons.data[i]);

            let grantTab = [];

            // controls if the map has already the lead investigator, if not creates a new object
            if (!map.has(lead_investigator)) {
                map.set(lead_investigator,
                    {
                        firstName: firstName,
                        lastName: lastName,
                        nbGrants: 1,
                        grants: [grant]
                    });
            } else { // adds the new grants to the lead investigator grant object
                const investigator = map.get(lead_investigator);
                grantTab = investigator.grants;
                grantTab.push(grant);

                map.set(lead_investigator,
                    {
                        nbGrants: investigator.nbGrants + 1,
                        grants: grantTab
                    });
            }
        }

        // Creates a json from the map
        for (const [key, value] of map) {
            data.authors.push({
                'lead-investigator': key,
                'firstName': value.firstName,
                'lastName': value.lastName,
                'scheme': value.scheme,
                'nbGrants': value.nbGrants,
                'grants': value.grants
            });
        }

        return data;
    } catch (err) {
        console.error(err)
    }
}


/**
 * Sums the funding for each author
 * @param data
 */
function sumFunding(data) {
    for (const i in data.authors) {
        let totalGrants = 0;
        for (const j in data.authors[i].grants) {
            totalGrants += data.authors[i].grants[j].fundingAnnounced;
        }
        data.authors[i].sumFunding = Number(totalGrants);
    }
}


export {
    formatArcData,
    sumFunding
};
