# enapso-graphdb-client
Enapso Ontotext GraphDB 8.x Client for JavaScript

Client for Ontotext GraphDB to easily perform SPARQL queries and update statements against your RDF stores, your OWL ontologies or knowledge graphs in node.js applications. The client implements the authentication, the handling of prefixes and the optional transformation of the SPARQL results into a resultset that can easily be processed in JavaScript. 
Future versions will implement further convenience methods on SPARQL level.
Any questions and suggestions are welcome.

# Creating a GraphDB Endpoint

```javascript
var graphDBEndpoint = new EnapsoGraphDBClient.Endpoint({
    queryURL: [QueryURL], 
    updateURL: [UpdateURL],
    username: [Username],
    password: [Password],
    prefixes: [Prefixes]
});
```

# Example

## Querying GraphDB

This demo requires a running GraphDB instance on localhost at port 7200.
The automated tests require a repository "Test" and user "Test" with the password "Test".

```javascript
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
```

Standard SPARQL Result Structure:
```json
{
  "head": {
    "vars": [
      "s",
      "p",
      "o"
    ]
  },
  "results": {
    "bindings": [
      {
        "p": {
          "type": "uri",
          "value": "http://www.w3.org/1999/02/22-rdf-syntax-ns#type"
        },
        "s": {
          "type": "uri",
          "value": "http://www.w3.org/1999/02/22-rdf-syntax-ns#type"
        },
        "o": {
          "type": "uri",
          "value": "http://www.w3.org/1999/02/22-rdf-syntax-ns#Property"
        }
      },
      {
        "p": {
          "type": "uri",
          "value": "http://www.w3.org/1999/02/22-rdf-syntax-ns#type"
        },
        "s": {
          "type": "uri",
          "value": "http://www.w3.org/2000/01/rdf-schema#subPropertyOf"
        },
        "o": {
          "type": "uri",
          "value": "http://www.w3.org/1999/02/22-rdf-syntax-ns#Property"
        }
      }
    ]
  },
  "success": true
}
```

Beautified Resultset Structure:
```json
{
  "total": 2,
  "success": true,
  "records": [
    {
      "p": "type",
      "s": "type",
      "o": "Property"
    },
    {
      "p": "type",
      "s": "subPropertyOf",
      "o": "Property"
    }
  ]
}
```