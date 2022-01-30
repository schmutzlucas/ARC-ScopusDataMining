# Description
This program can be used to reformat Grants data obtained from the Australian Research Council data portal https://dataportal.arc.gov.au/NCGP/Web/Grant/Grants.  
It creates a new json file where the grants are organized by lead investigator instead of by grants. Moreover, it retrieves the metrics from the corresponding lead investigator from Scopus using the Scopus Author and search APIs. For this step, it requires a Scopus API access and at least one Scopus API key (https://dev.elsevier.com/).

# Installation
You first need to install node.js on your computer. Source-code and installers avaiable here: https://nodejs.org/en/download/

Use the following command to install the program:  
_This command will install all dependencies_  
```node
npm install
```
And this one to start it: 
```node
npm start
```
The data that will be converted should be put in ```data``` folder. After you start the program you will be ask to type the file name into the console (with extension). 

The results are stored in ```results```. 
