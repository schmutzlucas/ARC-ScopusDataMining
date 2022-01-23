# Description
This program can be used to reformat Grants data obtained from the Australian Research Council data portal https://dataportal.arc.gov.au/NCGP/Web/Grant/Grants.  
It creates a new json file where the grants are organized by lead investigator instead of by grants. Moreover, it retrieves the metrics from the corresponding lead investigator from Scopus using the Scopus Author API. For this step, it requires a Scopus API access and at least one Scopus API key (https://dev.elsevier.com/).

# Usage
_Note:_  
_- The program uses node@16.13.1_  
_- Please install ```npm``` in order to execute the program._

Use the following command to install the program:  
_This command will install all dependencies_  
```node
npm install
```
And this one to start it: 
_This command will execute the program_  
```node
npm start
```
The data that will be converted needs to be put in ```data``` folder. After you start the program you will be ask to type the file name into the console (with extension). 

The results are stored in ```results```. 
