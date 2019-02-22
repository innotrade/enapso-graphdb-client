# enapso-graphdb-client
Enapso Ontotext GraphDB 8.x Client for JavaScript

Client for Ontotext GraphDB to easily perform SPARQL queries and update statements against your RDF stores, your OWL ontologies or knowledge graphs in node.js applications. The client implements the authentication, the handling of prefixes and the optional transformation of the SPARQL results into a resultset that can easily be processed in JavaScript. 
Future versions will implement further convenience methods on SPARQL level.
Any questions and suggestions are welcome.

**The following demos require a running GraphDB 8.x instance on localhost at port 7200. The demos as well as the automated tests require a fully working Ontotext GraphDB repository "Test" and a user "Test" with the password "Test" being set up, which has read/write access to the "Test" Repository.**

To discuss questions and suggestions with the GraphDB community, we'll be happy to meet you in our forum at https://www.innotrade.com/forum/.

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

```javascript
// require the Enapso GraphDB Client package
const EnapsoGraphDBClient = require("../enapso-graphdb-client");

// demo SPARQL query
let query = `
    select * 
    where {?s ?p ?o}
    limit 2
    `;

// connection data to the running GraphDB instance
const
    GRAPHDB_BASE_URL = 'http://localhost:7200';
const    
    GRAPHDB_QUERY_URL = GRAPHDB_BASE_URL + '/repositories/Test',
    GRAPHDB_UPDATE_URL = GRAPHDB_BASE_URL + '/repositories/Test/statements',
    GRAPHDB_USERNAME = 'Test',
    GRAPHDB_PASSWORD = 'Test';

// the default prefixes for all SPARQL queries
const DEFAULT_PREFIXES = [
    EnapsoGraphDBClient.PREFIX_OWL,
    EnapsoGraphDBClient.PREFIX_RDF,
    EnapsoGraphDBClient.PREFIX_RDFS
];

// demonstrate a SPARQL query against GraphDB
(async () => {
    // instantiate the GraphDB endpoint
    var graphDBEndpoint = new EnapsoGraphDBClient.Endpoint({
        baseURL: GRAPHDB_BASE_URL,
        queryURL: GRAPHDB_QUERY_URL,
        updateURL: GRAPHDB_UPDATE_URL,
        // username and password are required here only 
        // if you want to use basic authentication
        // however, for security reasons it is recommended to use JWT
        // username: GRAPHDB_USERNAME,
        // password: GRAPHDB_PASSWORD,
        prefixes: DEFAULT_PREFIXES
    });
    
    // use the preferred way to login via JWT and return an access token
    let lRes = await graphDBEndpoint.login(GRAPHDB_USERNAME, GRAPHDB_PASSWORD);
    // console.log(JSON.stringify(lRes, null, 2));

    // execute the SPARQL query against the GraphDB endpoint
    // the access token is used to authorize the request
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

Standard SPARQL JSON binding:
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

Beautified Enapso JSON Resultset:
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

# Formats

GraphDB supports the import and export of graphs in numerous formats. The EnapsoGraphDBClient provides the available formats as constants. You can use them in your application by EnapsoGraphDBClient.FORMAT_TURTLE.

```json
    FORMAT_JSON : {
        name: 'JSON',
        type: 'application/rdf+json',
        extension: '.json'
    },
    FORMAT_JSON_LD: {
        name: 'JSON-LD',
        type: 'application/ld+json',
        extension: '.jsonld'
    },
    FORMAT_RDF_XML: {
        name: 'RDF-XML',
        type: 'application/rdf+xml',
        extension: '.rdf'
    },
    FORMAT_N3: {
        name: 'N3',
        type: 'text/rdf+n3',
        extension: '.n3'
    },
    FORMAT_N_TRIPLES: {
        name: 'N-Triples',
        type: 'text/plain',
        extension: '.nt'
    },
    FORMAT_N_QUADS: {
        name: 'N-Quads',
        type: 'text/x-nquads',
        extension: '.nq'
    },
    FORMAT_TURTLE: {
        name: 'Turtle',
        type: 'text/turtle',
        extension: '.ttl'
    },
    FORMAT_TRIX: {
        name: 'TriX',
        type: 'application/trix',
        extension: '.trix'
    },
    FORMAT_TRIG: {
        name: 'TriG',
        type: 'application/x-trig',
        extension: '.trig'
    },
    FORMAT_BINARY_RDF: {
        name: 'Binary RDF',
        type: 'application/x-binary-rdf',
        extension: '.brf'
    }
```