# enapso-graphdb-client
Enapso Ontotext GraphDB 8.x/9.x Client for Node.js

Client for Ontotext GraphDB to easily perform SPARQL queries and update statements against your RDF stores, your OWL ontologies or knowledge graphs in node.js applications. The client implements the authentication (Basic and JWT), the handling of prefixes, a convenient error handling and an optional transformation of SPARQL result bindings to CSV and TSV files as well as to JSON resultsets that can easily be processed in JavaScript.
Please also refer to the enapso-graphdb-admin project. There you'll find also tools to manage GraphDB and to easily upload and download ontolgies to and from your GraphDB repositories.
Future versions will implement further convenience methods on SPARQL level.
Any questions and suggestions are welcome.

**The following demos require a running GraphDB 8.x/9.x instance on localhost at port 7200. The demos as well as the automated tests require a fully working Ontotext GraphDB repository "Test" and a user "Test" with the password "Test" being set up, which has read/write access to the "Test" Repository.**
Get the latest version of GraphDB for free at https://www.ontotext.com/products/graphdb/.

**This project is actively developed and maintained.**
To discuss questions and suggestions with the Enapso and GraphDB community, we'll be happy to meet you in our forum at https://www.innotrade.com/forum/.

# Installation 
```
npm i enapso-graphdb-client --save
```
# Examples
## Configuring the GraphDB connection
This is the configuration data for the connection to your GraphDB instance:
```javascript
const { EnapsoGraphDBClient } = require('enapso-graphdb-client');
const fs = require("fs");

const
  GRAPHDB_BASE_URL = 'http://localhost:7200',
  GRAPHDB_REPOSITORY = 'Test',
  GRAPHDB_USERNAME = 'Test',
  GRAPHDB_PASSWORD = 'Test',
  GRAPHDB_CONTEXT_TEST = 'http://ont.enapso.com/test'
  ;

const DEFAULT_PREFIXES = [
  EnapsoGraphDBClient.PREFIX_OWL,
  EnapsoGraphDBClient.PREFIX_RDF,
  EnapsoGraphDBClient.PREFIX_RDFS,
  EnapsoGraphDBClient.PREFIX_XSD,
  EnapsoGraphDBClient.PREFIX_PROTONS,
  EnapsoGraphDBClient.PREFIX_ENTEST
];
```
```PREFIX_ENTEST``` specifies the prefix ```entest``` that is used as a reference to the base IRI ```http://ont.enapso.com/test#```. Please also refer to the entire list of prefixes at the bottom of this document.
## Instantiating a GraphDB SPARQL Client
This is how the GraphDB client is created:
```javascript
const EnapsoGraphDBClientDemo = {
  graphDBEndpoint: null,
  authentication: null,

  this.graphDBEndpoint = new EnapsoGraphDBClient.Endpoint({
    baseURL: GRAPHDB_BASE_URL,
    repository: GRAPHDB_REPOSITORY,
    prefixes: DEFAULT_PREFIXES
  });
```
This is how you authenticate against GraphDB using JWT:
```javascript
this.authentication = await this.graphDBEndpoint.login(
  GRAPHDB_USERNAME,
  GRAPHDB_PASSWORD
);
```
This is how you check the success of the authentication:
```javascript
if (!this.authentication.success) {
  console.log('\nLogin failed:\n' +
    JSON.stringify(this.authentication, null, 2));
  return;
}
console.log('\nLogin successful');
```
If required, you can get more details about the reason of a connection failure:
```javascript
if (!this.authentication.success) {
    let lMsg = this.authentication.message;
    if (500 === this.authentication.statusCode) {
        if ('ECONNREFUSED' === this.authentication.code) {
            lMsg += ', check if GraphDB is running at ' +
            this.graphDBEndpoint.getBaseURL();
        }
    } else if (401 === this.authentication.statusCode) {
        lMsg += ', check if user "' + GRAPHDB_USERNAME +
            '" is set up in your GraphDB at ' +
            this.graphDBEndpoint.getBaseURL();
    }
    console.log("Login failed: " + lMsg);
    return;
}
```
In case a connection cannot be established at all, e.g. because GraphDB is not available or running at the given URL, you'll get a HTTP 500 error message:
```json
{
  "success": false,
  "message": "Error: connect ECONNREFUSED 127.0.0.1:7201",
  "statusCode": 500
}
```
In case of invaalid credentials or insufficient access rights, you'll get a HTTP 401 error message:
```json
{
  "success": false,
  "message": "401 - Bad credentials",
  "statusCode": 401
}
```
## Querying GraphDB
This is how you execute a SPARQL query against GraphDB and transform the bindings to an easily processible resultset:
```javascript
let binding = await this.graphDBEndpoint.query(`
  select * 
    from <${GRAPHDB_CONTEXT_TEST}>
  where {
    ?class rdf:type owl:Class
    filter(regex(str(?class), "http://ont.enapso.com/test#TestClass", "i")) .
  }`
);
if (binding.success) {
  let resp = await this.graphDBEndpoint.transformBindingsToResultSet(binding);
  console.log("Query succeeded:\n" + JSON.stringify(resp, null, 2));
} else {
  console.log("Query failed:\n" + JSON.stringify(binding, null, 2));
}
```
In case a matching record is found, the result looks like this:
```json
{
  "total": 1,
  "success": true,
  "records": [
    {
      "class": "http://ont.enapso.com/test#TestClass"
    }
  ]
}
```
In case of errors in the query, you'll get a HTTP 400 error message:
```json
{
  "statusCode": 400,
  "message": "HTTP Error: 400 Bad Request",
  "success": false
}
```
In case of insufficient access rights, you'll get a HTTP 403 error message:
```json
{
  "statusCode": 403,
  "message": "HTTP Error: 403 Forbidden",
  "success": false
}
```
## Inserting Triples
This is how can you can insert triples into your graph:
```javascript
let resp = await this.graphDBEndpoint.update(`
  insert data {
    graph <${GRAPHDB_CONTEXT_TEST}> {
      entest:TestClass rdf:type owl:Class
    }
  }`
);
console.log('Insert ' +
  (resp.success ? 'succeeded' : 'failed') +
  ':\n' + JSON.stringify(resp, null, 2));
```
In case the insert operation was successful, you'll get the following result:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "OK"
}
```
## Updating Triples
This is how you can update triples in your graph:
```javascript
let resp = await this.graphDBEndpoint.update(`
  with <${GRAPHDB_CONTEXT_TEST}>
  delete {
    entest:TestClass rdf:type owl:Class
  }
  insert {
    entest:TestClassUpdated rdf:type owl:Class
  }
  where {
    entest:TestClass rdf:type owl:Class
  }`
);
console.log('Update ' +
  (resp.success ? 'succeeded' : 'failed') +
  ':\n' + JSON.stringify(resp, null, 2));
```
In case the update operation was successful, you'll get the following result:
```json
{
  "success": true,
  "statusCode": 200,
  "message": "OK"
}
```
### Standard SPARQL JSON binding:
In case of a successful query, a SPARQL compliant JSON is returned. For this low level call, the result neither contains a statusCode nor a message. In addition to the successf flag, you can interpret the existance of the head, results and bindings fields as success criteria.
```json
{
  "head": {
    "vars": [
      "iri",
      "firstName",
      "lastName"
    ]
  },
  "results": {
    "bindings": [
      {
        "iri": {
          "type": "uri",
          "value": "http://ont.enapso.com/test#Person_AlexanderSchulze"
        },
        "firstName": {
          "type": "literal",
          "value": "Alexander"
        },
        "lastName": {
          "type": "literal",
          "value": "Schulze"
        }
      },
      {
        "iri": {
          "type": "uri",
          "value": "http://ont.enapso.com/test#Person_OsvaldoAguilarLauzurique"
        },
        "firstName": {
          "type": "literal",
          "value": "Osvaldo"
        },
        "lastName": {
          "type": "literal",
          "value": "Aguilar Lauzurique"
        }
      }
    ]
  },
  "success": true
}
```
### Beautified Enapso JSON Resultset:
```json
{
  "total": 2,
  "success": true,
  "records": [
    {
      "iri": "entest:Person_AlexanderSchulze",
      "firstName": "Alexander",
      "lastName": "Schulze"
    },
    {
      "iri": "entest:Person_OsvaldoAguilarLauzurique",
      "firstName": "Osvaldo",
      "lastName": "Aguilar Lauzurique"
    }
  ]
}
```
### Error Handling
In case the login cannot be performed, because no connection to the GraphDB instance can be established, the following error will be returned:
```json
{
  "success": false,
  "code": "ECONNREFUSED",
  "message": "Error: connect ECONNREFUSED 127.0.0.1:7200",
  "statusCode": 500
}
```
In case of invalid credentials, the following error will be returned:
```json
{
  "success": false,
  "message": "401 - Bad credentials",
  "statusCode": 401
}
```
In case of errors during the execution of the query, the following error will be returned:
```json
{
  "success": false,
  "statusCode": 400,
  "message": "HTTP Error: 400 Bad Request"
}
```
# CSV and TSV Results
The Enapso GraphDB client enables you to easily export query results to CSV and TSV files.
```javascript
csv = this.graphDBEndpoint.transformBindingsToCSV(query);
````
returns the following object:
```json
{
  "total": 2,
  "success": true,
  "headers": [
    "iri,firstName,lastName"
  ],
  "records": [
    "http://ont.enapso.com/test#Person_AlexanderSchulze,Alexander,Schulze",
    "http://ont.enapso.com/test#Person_OsvaldoAguilarLauzurique,Osvaldo,Aguilar Lauzurique"
  ]
}
```
that easily can be written to a file e.g. by the following code:
```javascript
fs.writeFileSync(
    'examples/examples.csv',
    // optionally add headers
    csv.headers.join('\r\n') + '\r\n' +
    // add the csv records to the file
    csv.records.join('\r\n')
);
```
In case you require more detailed control over the separator and/or string delimiter characters you can use:
```javascript
csv = this.graphDBEndpoint.
    transformBindingsToSeparatedValues(
        query, {
            // replace IRIs by prefixes for easier 
            // resultset readability (optional)
            "replacePrefixes": true,
            // drop the prefixes for easier 
            // resultset readability (optional)
            // "dropPrefixes": true,
            "separator": ',',
            "separatorEscape": '\\,',
            "delimiter": '"',
            "delimiterEscape": '\\"'
        }
    );
```
# Formats
GraphDB supports the import and export of graphs in numerous formats. The EnapsoGraphDBClient provides the available formats as constants. You can use them in your application, for instance, by EnapsoGraphDBClient.FORMAT_TURTLE.
```json
"FORMAT_JSON": {
    "name": "JSON",
    "type": "application/rdf+json",
    "extension": ".json"
},
"FORMAT_JSON_LD": {
    "name": "JSON-LD",
    "type": "application/ld+json",
    "extension": ".jsonld"
},
"FORMAT_RDF_XML": {
    "name": "RDF-XML",
    "type": "application/rdf+xml",
    "extension": ".rdf"
},
"FORMAT_N3": {
    "name": "N3",
    "type": "text/rdf+n3",
    "extension": ".n3"
},
"FORMAT_N_TRIPLES": {
    "name": "N-Triples",
    "type": "text/plain",
    "extension": ".nt"
},
"FORMAT_N_QUADS": {
    "name": "N-Quads",
    "type": "text/x-nquads",
    "extension": ".nq"
},
"FORMAT_TURTLE": {
    "name": "Turtle",
    "type": "text/turtle",
    "extension": ".ttl"
},
"FORMAT_TRIX": {
    "name": "TriX",
    "type": "application/trix",
    "extension": ".trix"
},
"FORMAT_TRIG": {
    "name": "TriG",
    "type": "application/x-trig",
    "extension": ".trig"
},
"FORMAT_BINARY_RDF": {
    "name": "Binary RDF",
    "type": "application/x-binary-rdf",
    "extension": ".brf"
}
```
# Prefixes
The following prefixes are already predefined in the Enapso GraphDB Client:
```json
"PREFIX_OWL": {
    "prefix": "owl",
    "iri": "http://www.w3.org/2002/07/owl#"
},
"PREFIX_RDF": {
    "prefix": "rdf",
    "iri": "http://www.w3.org/1999/02/22-rdf-syntax-ns#"
},
"PREFIX_RDFS": {
    "prefix": "rdfs",
    "iri": "http://www.w3.org/2000/01/rdf-schema#"
},
"PREFIX_XSD": {
    "prefix": "xsd",
    "iri": "http://www.w3.org/2001/XMLSchema#"
},
"PREFIX_FN": {
    "prefix": "fn",
    "iri": "http://www.w3.org/2005/xpath-functions#"
},
"PREFIX_SFN": {
    "prefix": "sfn",
    "iri": "http://www.w3.org/ns/sparql#"
},
"PREFIX_ENTEST": {
    "prefix": "entest",
    "iri": "http://ont.enapso.com/test#"
},
"PREFIX_ONTOFN": {
    "prefix": "ontofn",
    "iri": "http://www.ontotext.com/sparql/functions/#"
},
"PREFIX_SPIF": {
    "prefix": "spif",
    "iri": "http://spinrdf.org/spif#"
},
"PREFIX_APROPF": {
    "prefix": "aprof",
    "iri": "http://jena.hpl.hp.com/ARQ/property#"
},
"PREFIX_ALIST": {
    "prefix": "alist",
    "iri": "http://jena.apache.org/ARQ/list#"
}
```