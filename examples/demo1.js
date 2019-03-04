// Innotrade Enapso GraphDB Client Example
// (C) Copyright 2019 Innotrade GmbH, Herzogenrath, NRW, Germany

// require the Enapso GraphDB Client package
const EnapsoGraphDBClient = require("../enapso-graphdb-client");
const fs = require("fs");

// demo SPARQL query
let DEMO_QUERY_SIMPLE =
    `
    select * 
    where {?s ?p ?o}
    limit 100
    `;
let DEMO_QUERY =
    `
    select ?iri ?firstName ?lastName
    where {
        ?iri a et:Person
        optional {?iri et:firstName ?firstName }
        optional {?iri et:lastName ?lastName }
    }
    limit 2
    `;

// connection data to the running GraphDB instance
const
    GRAPHDB_BASE_URL = 'http://localhost:7200';
const
    GRAPHDB_REPOSITORY = 'Test',
    GRAPHDB_USERNAME = 'Test',
    GRAPHDB_PASSWORD = 'Test';

// the default prefixes for all SPARQL queries
const DEFAULT_PREFIXES = [
    EnapsoGraphDBClient.PREFIX_OWL,
    EnapsoGraphDBClient.PREFIX_RDF,
    EnapsoGraphDBClient.PREFIX_RDFS,
    EnapsoGraphDBClient.PREFIX_XSD,
    EnapsoGraphDBClient.PREFIX_PROTONS,
    {
        "prefix": "et",
        "iri": "http://ont.enapso.com/test#"
    }
];

// demonstrate a SPARQL query against GraphDB
(async () => {
    // instantiate the GraphDB endpoint
    var graphDBEndpoint = new EnapsoGraphDBClient.Endpoint({
        baseURL: GRAPHDB_BASE_URL,
        repository: GRAPHDB_REPOSITORY,
        // username and password are required here only 
        // if you want to use basic authentication
        // however, for security reasons it is 
        // strongly recommended to use JWT
        // username: GRAPHDB_USERNAME,
        // password: GRAPHDB_PASSWORD,
        prefixes: DEFAULT_PREFIXES
    });

    // use the preferred way to login via JWT
    // and persist returned access token internally
    // for future requests using this endpoint
    let login = await graphDBEndpoint.login(
        GRAPHDB_USERNAME, GRAPHDB_PASSWORD
    );
    if (!login.success) {
        // if login was not successful, exit
        console.log("Login failed: " +
            JSON.stringify(login, null, 2));
        return;
    }
    console.log("Login successful: " +
        JSON.stringify(login, null, 2)
    );

    // execute the SPARQL query against the GraphDB endpoint
    // the access token is used to authorize the request
    let query = await graphDBEndpoint.query(DEMO_QUERY);

    // if a result was successfully returned
    if (query.success) {
        // log original SPARQL result and 
        // beautified result set to the console
        console.log("\nBinding:\n" +
            JSON.stringify(query, null, 2));

        // transform the bindings into a 
        // more convenient result format (optional)
        resultset = graphDBEndpoint.
            transformBindingsToResultSet(
                query, {
                    // drop the prefixes for easier 
                    // resultset readability (optional)
                    replacePrefixes: true,
                    // dropPrefixes: true,
                }
            );
        console.log("\nResultset:\n" +
            JSON.stringify(resultset, null, 2));

        csv = graphDBEndpoint.
            transformBindingsToSeparatedValues(
                query, {
                    // drop the prefixes for easier 
                    // resultset readability (optional)
                    replacePrefixes: true,
                    // dropPrefixes: true,
                    separator: ',',
                    separatorEscape: '\\,',
                    delimiter: '"',
                    delimiterEscape: '\\"'
                }
            );
        console.log("\CSV:\n" +
            JSON.stringify(csv, null, 2));
        fs.writeFileSync('examples/examples.csv', csv.records.join('\r\n'));
    } else {
        console.log("Query failed: " +
            JSON.stringify(query, null, 2));
    }

})();
