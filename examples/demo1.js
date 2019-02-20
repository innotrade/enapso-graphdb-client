// Innotrade Enapso GraphDB Client Example
// (C) Copyright 2019 Innotrade GmbH, Herzogenrath, NRW, Germany

// require the Enapso GraphDB Client package
const EnapsoGraphDBClient = require("enapso-graphdb-client");

// demo SPARQL query
let query = `
    select * 
    where {?s ?p ?o}
    limit 2
    `;

// connection data to the running GraphDB instance
const
    GRAPHDB_QUERY_URL = 'http://localhost:7200/repositories/Test',
    GRAPHDB_UPDATE_URL = 'http://localhost:7200/repositories/Test/statements',
    GRAPHDB_USERNAME = 'Test',
    GRAPHDB_PASSWORD = 'Test';

// the default prefixes for all SPARQL queries
const DEFAULT_PREFIXES = [
    EnapsoGraphDBClient.PREFIX_OWL,
    EnapsoGraphDBClient.PREFIX_RDF,
    EnapsoGraphDBClient.PREFIX_RDFS
];

// instantiate the GraphDB endpoint
var graphDBEndpoint = new EnapsoGraphDBClient.Endpoint({
    queryURL: GRAPHDB_QUERY_URL,
    updateURL: GRAPHDB_UPDATE_URL,
    username: GRAPHDB_USERNAME,
    password: GRAPHDB_PASSWORD,
    prefixes: DEFAULT_PREFIXES
});

// demonstrate a SPARQL query against GraphDB
(async () => {
    // execute the SPARQL query against the GraphDB endpoint 
    let resultset, binding = await graphDBEndpoint.query(query);

    // if a result was successfully returned
    if (binding.success) {
        // transform the bindings into a more convenient result format (optional)
        resultset = EnapsoGraphDBClient.transformBindingsToResultSet(binding, {
            // drop the prefixes for easier resultset readability (optional)
            dropPrefixes: true
        });
    }

    // log original SPARQL result and beautified result set to the console
    console.log("\nBinding:\n" + JSON.stringify(binding, null, 2));
    console.log("\nResultset:\n" + JSON.stringify(resultset, null, 2));
})();
