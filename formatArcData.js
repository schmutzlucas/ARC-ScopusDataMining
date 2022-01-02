/**
 * These functions are used to format the data obtained from the Australian Research council plateform :
 * https://dataportal.arc.gov.au/NCGP/Web/Grant/Grants
 */

// Creates the structure used to store grants informations
/**
 *
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

// Split the names of the lead investigator in a stupid way, first token (title) discarded,
// second token = first name, last token = last name
/**
 *
 * @param lead_investigator
 * @returns {{firstName: *, lastName: *}}
 */
function splitName(lead_investigator) {
    let lead_investigator_array = lead_investigator.split(' ');
    let firstName = lead_investigator_array[1];
    let lastName = lead_investigator_array[lead_investigator_array.length - 1];
    return {firstName, lastName};
}

// Creates a name readable by the ORCID api
/**
 *
 * @param lead_investigator
 * @returns {string}
 */
function noTitleName(lead_investigator) {
    let lead_investigator_array = lead_investigator.split(' ');
    lead_investigator_array.shift();
    return lead_investigator_array.join('%20');
}

// Reformats the arc data by author/lead-investigator
function formatArcData(jsons) {
    try {
        const data = {
            authors: []
        };

        let map = new Map();
        for (const i in jsons.data) {
            let lead_investigator = jsons.data[i].attributes['lead-investigator'];
            let tabName = splitName(lead_investigator);
            let firstName = tabName.firstName;
            let lastName = tabName.lastName;

            lead_investigator = noTitleName(lead_investigator);
            let grant = createGrantObj(jsons.data[i]);

            let grantTab = [];

            if (!map.has(lead_investigator)) {
                map.set(lead_investigator,
                    {
                        firstName: firstName,
                        lastName: lastName,
                        nbGrants: 1,
                        scheme: jsons.data[i].attributes['scheme-name'],
                        grants: [grant]
                    });
            } else {
                const investigator = map.get(lead_investigator);
                grantTab = investigator.grants;
                grantTab.push(grant);

                map.set(lead_investigator,
                    {
                        firstName: firstName,
                        lastName: lastName,
                        nbGrants: investigator.nbGrants + 1,
                        scheme: investigator.scheme,
                        grants: grantTab
                    });
            }
        }

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

// Sums the funding of each author
/**
 *
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
