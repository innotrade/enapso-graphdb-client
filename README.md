# enapso-graphdb-client
Enapso Ontotext GraphDB 8.x Client for Node.js

Client for Ontotext GraphDB to easily perform SPARQL queries and update statements against your RDF stores, your OWL ontologies or knowledge graphs in node.js applications. The client implements the authentication (Basic and JWT), the handling of prefixes, a convenient error handling and an optional transformation of SPARQL result bindings to CSV and TSV files as well as to JSON resultsets that can easily be processed in JavaScript.
Please also refer to the enapso-graphdb-admin project. There you'll find also tools to manage GraphDB and to easily upload and download ontolgies to and from your GraphDB repositories.
Future versions will implement further convenience methods on SPARQL level.
Any questions and suggestions are welcome.

**The following demos require a running GraphDB 8.x instance on localhost at port 7200. The demos as well as the automated tests require a fully working Ontotext GraphDB repository "Test" and a user "Test" with the password "Test" being set up, which has read/write access to the "Test" Repository.**
Get the latest version of GraphDB for free at https://www.ontotext.com/free-graphdb-download-copy/.

**This project is actively developed and maintained.**
To discuss questions and suggestions with the Enapso and GraphDB community, we'll be happy to meet you in our forum at https://www.innotrade.com/forum/.

# Installation 
```
npm i enapso-graphdb-client --save
```
# Examples
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
## Inserting Triples
This is how can you can insert triples into your graph:
```javascript
let resp = await this.graphDBEndpoint.update(`
  insert data {
    graph <${GRAPHDB_CONTEXT_TEST}> {
      et:TestClass rdf:type owl:Class
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
This is how can you can update triples in your graph:
```javascript
let resp = await this.graphDBEndpoint.update(`
  with <${GRAPHDB_CONTEXT_TEST}>
  delete {
    et:TestClass rdf:type owl:Class
  }
  insert {
    et:TestClassUpdated rdf:type owl:Class
  }
  where {
    et:TestClass rdf:type owl:Class
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
# Complete Programm
```javascript
// require the Enapso GraphDB Client package
const { EnapsoGraphDBClient } = require("enapso-graphdb-client");
const fs = require("fs");

// demo SPARQL query
let DEMO_QUERY_SIMPLE = `
select * 
where {?s ?p ?o}
limit 2
`;

// query to get all individuals of the class Person
let DEMO_QUERY = `
select ?iri ?firstName ?lastName
where {
    ?iri a et:Person
    optional {
        ?iri et:firstName ?firstName .
        ?iri et:lastName ?lastName .
    }
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
		let lMsg = login.message;
		if (500 === login.statusCode) {
			if ('ECONNREFUSED' === login.code) {
				lMsg += ', check if GraphDB is running at ' +
					graphDBEndpoint.getBaseURL();
			}
		} else if (401 === login.statusCode) {
			lMsg += ', check if user "' + GRAPHDB_USERNAME +
				'" is set up in your GraphDB at ' +
				graphDBEndpoint.getBaseURL();
		}
		console.log("Login failed: " + lMsg);
		return;
	}
	console.log("Login successful"
		// the "login" object exposes more details on demand
		// especially the authentication token and the
		// user's roles configured in GraphDB for
		// subsequent requests in case of JWT authentication
		// + ": " + JSON.stringify(login, null, 2)
	);

	// execute the SPARQL query against the GraphDB endpoint
	// the access token is used to authorize the request
	let query = await graphDBEndpoint.query(DEMO_QUERY);

	if (!query.success) {
		let lMsg = query.message;
		if (403 === query.statusCode) {
			lMsg += ', check if user "' + GRAPHDB_USERNAME +
				'" has appropriate access rights to the Repository ' +
				'"' + graphDBEndpoint.getRepository() + '"';
		}
		console.log("Query failed: " + lMsg);
		return;
	}

	// if a result was successfully returned
	// log original SPARQL result and 
	// beautified result set to the console
	console.log("\nBinding:\n" +
		JSON.stringify(query, null, 2));

	// transform the bindings into a 
	// more convenient result format (optional)
	resultset = graphDBEndpoint.
		transformBindingsToResultSet(
			query, {
				// drop or replace the prefixes for easier 
				// resultset readability (optional)
				replacePrefixes: true
				// dropPrefixes: true
			}
		);
	console.log("\nResultset:\n" +
		JSON.stringify(resultset, null, 2));

	csv = graphDBEndpoint.
		transformBindingsToCSV(query);
	console.log("\CSV:\n" +
		JSON.stringify(csv, null, 2));
	fs.writeFileSync(
		'examples/examples.csv',
		// optionally add headers
		csv.headers.join('\r\n') + '\r\n' +
		// add the csv records to the file
		csv.records.join('\r\n')
	);

})();
```
### Standard SPARQL JSON binding:
In case of a successful query, a SPARQL compliant JSON is returned. For this low level call, the result neither contains a success flag nor a statusCode or message. You can interpret the existance of the head, results and bindings fields as success criteria.
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
      "iri": "et:Person_AlexanderSchulze",
      "firstName": "Alexander",
      "lastName": "Schulze"
    },
    {
      "iri": "et:Person_OsvaldoAguilarLauzurique",
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
csv = graphDBEndpoint.transformBindingsToCSV(query);
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
csv = graphDBEndpoint.
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
}
```