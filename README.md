# enapso-graphdb-client
Enapso Ontotext GraphDB 8.x Client for JavaScript

Client for Ontotext GraphDB to easily perform SPARQL queries and update statements in node.js.
The client implements the authentication, the handling of prefixes and the transformation of the SPARQL results
into a result set that can easily be parsed in JavaScript. 
Future versions will implement further convenience methods on SPARQL level.
Any questions and suggestions are welcome.

# Creating a GraphDB Endpoint

```javascript
var endpoint = new EnapsoGraphDBClient.Endpoint({
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
const EnapsoGraphDBClient = require("../client");

let lQuery = `
    select * 
    where {?s ?p ?o}
    limit 2
    `;

var lQueryURL = 'http://localhost:7200/repositories/Test';
var lUpdateURL = 'http://localhost:7200/repositories/Test/statements';
var lUsername = 'Test';
var lPassword = 'Test';

let lPrefixes = [
    EnapsoGraphDBClient.PREFIX_OWL,
    EnapsoGraphDBClient.PREFIX_RDF,
    EnapsoGraphDBClient.PREFIX_RDFS
];

var mEndPoint = new EnapsoGraphDBClient.Endpoint({
    queryURL: lQueryURL,
    updateURL: lUpdateURL,
    username: lUsername,
    password: lPassword,
    prefixes: lPrefixes
});

(async () => {
    let lRes, lBinding = await mEndPoint.query(lQuery);

    if (lBinding.success) {
        // transform the bindings into a more convenient result format
        lRes = EnapsoGraphDBClient.transformBindingsToResultSet(lBinding, {
            dropPrefixes: true
        });
    }
    console.log("\nBinding:\n" + JSON.stringify(lBinding, null, 2));
    console.log("\nResultset:\n" + JSON.stringify(lRes, null, 2));
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