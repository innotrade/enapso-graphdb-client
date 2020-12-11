# enapso-graphdb-client

In enapso graphdb client we provide connection with two different databases so you can use any one for connection which you need, just upload your OWL file and perform queries against that owl file.

enapso Ontotext GraphDB 8.x/9.x Client for Node.js

Node.js client for Ontotext GraphDB to easily perform SPARQL queries and update statements against your RDF stores, your OWL ontologies or knowledge graphs in Node.js applications. The client implements the authentication (Basic and JWT), the handling of prefixes, a convenient error handling and an optional transformation of SPARQL result bindings to CSV and TSV files as well as to JSON resultsets that can easily be processed in JavaScript.
Please also refer to the @innotrade/enapso-graphdb-admin project. There you'll find also tools to manage GraphDB and to easily upload and download ontolgies to and from your GraphDB repositories. Any questions and suggestions are welcome.

**The following demo require a running GraphDB 8.x/9.x instance on localhost at port 7200. The demos as well as the automated tests require a fully working Ontotext GraphDB repository "Test" and a user "Test" with the password "Test" being set up, which has read/write access to the "Test" Repository. While creating new repository select the ruleset RDFS-Plus (Optimized).**
Get the latest version of GraphDB for free at https://www.ontotext.com/products/graphdb/.

enapso Apache Jena Fuseki2 Client for Node.js

Node.js client for fuseki to easily perform SPARQL queries and update statements against your RDF stores, your OWL ontologies or knowledge graphs in Node.js applications. The client implements the handling of prefixes, a convenient error handling and an optional transformation of SPARQL result bindings to CSV and TSV files as well as to JSON resultsets that can easily be processed in JavaScript.

Get the latest version of Apache jena Fuseki for free at https://jena.apache.org/download/index.cgi.
After successfully downloading the zip folder of apache jena fuseki unzip the downloaded folder. To run the server of apache jena fuski and it work correctly you need to configure the shiro.ini file available in folder `Apache_Jena_Fuseki=> run=> shiro.ini`. Open the file comment the 26 line where it restricted to localhost `/$/** = localhostFilter` just need to add `#` in start of this line and save the file.
Now to run the apache server, you need to go to apache folder and run the batch file of apache-server.bat you will see a command prompt open and your server will be start on `localhost:3030` port.

**The following demo2 for fuseki require a running fuseki instance on localhost at port 3030 for which you need to a create a dataset name Test on fuseki server for which you need to go `localhost:3030` click on manage datasets=>add new dataset**

**This project is actively developed and maintained.**
To discuss questions and suggestions with the enapso and GraphDB community, we'll be happy to meet you in our forum at https://www.innotrade.com/forum/.

# Installation

```
npm i @innotrade/enapso-graphdb-client --save
```

# Examples

## Configuring the GraphDB connection

This is the configuration data for the connection to your GraphDB instance:

```javascript
const { EnapsoGraphDBClient } = require('@innotrade/enapso-graphdb-client');

// connection data to the running GraphDB instance
const GRAPHDB_BASE_URL = 'http://localhost:7200',
    GRAPHDB_REPOSITORY = 'Test',
    GRAPHDB_USERNAME = 'Test',
    GRAPHDB_PASSWORD = 'Test',
    GRAPHDB_CONTEXT_TEST = 'http://ont.enapso.com/repo';

const DEFAULT_PREFIXES = [
    EnapsoGraphDBClient.PREFIX_OWL,
    EnapsoGraphDBClient.PREFIX_RDF,
    EnapsoGraphDBClient.PREFIX_RDFS,
    EnapsoGraphDBClient.PREFIX_XSD,
    EnapsoGraphDBClient.PREFIX_PROTONS,
    {
        prefix: 'entest',
        iri: 'http://ont.enapso.com/test#'
    }
];
```

`prefix` specifies the prefix `entest` that is used as a reference to the base IRI `http://ont.enapso.com/test#`. and `iri` to pass the reference of base IRI of Ontology .Please also refer to the entire list of prefixes at the bottom of this document.

## Configuring the Fuseki connection

For fuseki connection we use the same congiuration as above descirbe for GraphDB we need to change the port from `7200` to `3030` and add two more constant variable.

```javascript
const FUSEKI_QUERY_PATH = `/${GRAPHDB_REPOSITORY}/sparql`,
    FUSEKI_UPDATE_PATH = `/${GRAPHDB_REPOSITORY}/update`;
```

if you want to use the fuseki server you need to give the query and update part as given above and if you are gonna use the GraphDB then you dont need to pass any path constants it by default use the GraphDB paths.

## Instantiating a Apache Jena FUSEKI Client

Create an fuski client like:

```javascript
let graphDBEndpoint = new EnapsoGraphDBClient.Endpoint({
    baseURL: GRAPHDB_BASE_URL,
    repository: GRAPHDB_REPOSITORY,
    prefixes: DEFAULT_PREFIXES,
    queryPath: FUSEKI_QUERY_PATH,
    updatePath: FUSEKI_UPDATE_PATH,
    transform: 'toCSV'
});
```

## Instantiating a GraphDB SPARQL Client

Create an GraphDB client like:

```javascript
let graphDBEndpoint = new EnapsoGraphDBClient.Endpoint({
    baseURL: GRAPHDB_BASE_URL,
    repository: GRAPHDB_REPOSITORY,
    prefixes: DEFAULT_PREFIXES,
    transform: 'toCSV'
});
```

tranform is use to convert the results of GraphDB in a specific format so here we define the format there we have 3 predefine formats `toJSON` `toCSV` and `toTSV` this option is optional
This is how you authenticate against GraphDB using JWT:

```javascript
graphDBEndpoint
    .login(GRAPHDB_USERNAME, GRAPHDB_PASSWORD)
    .then((result) => {
        console.log(result);
    })
    .catch((err) => {
        console.log(err);
    });
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
graphDBEndpoint
    .query(
        `select *from <${GRAPHDB_CONTEXT_TEST}>
where {
    ?class rdf:type owl:Class
    filter(regex(str(?class), "http://ont.enapso.com/test#TestClass", "i")) .
}`,
        { transform: 'toJSON' }
    )
    .then((result) => {
        console.log(
            'Read the classes name:\n' + JSON.stringify(result, null, 2)
        );
    })
    .catch((err) => {
        console.log(err);
    });
```

if you want to convert the result of one query result to another format not the golbal defined format so you can see the above example.
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
graphDBEndpoint
    .update(
        `insert data {
			graph <${GRAPHDB_CONTEXT_TEST}> {
      entest:TestClass rdf:type owl:Class}
  }`
    )
    .then((result) => {
        console.log('inserted a class :\n' + JSON.stringify(result, null, 2));
    })
    .catch((err) => {
        console.log(err);
    });
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
graphDBEndpoint
    .update(
        `with <${GRAPHDB_CONTEXT_TEST}>
		delete {
		  entest:TestClass rdf:type owl:Class
		}
		insert {
		  entest:TestClassUpdated rdf:type owl:Class
		}
		where {
		  entest:TestClass rdf:type owl:Class
		}`
    )
    .then((result) => {
        console.log(
            'Updated the inserted class name:\n' +
                JSON.stringify(result, null, 2)
        );
    })
    .catch((err) => {
        console.log(err);
    });
```

In case the update operation was successful, you'll get the following result:

```json
{
    "success": true,
    "statusCode": 200,
    "message": "OK"
}
```

## Delete Triples

This is how you can delete triples in your graph:

```javascript
graphDBEndpoint
    .update(
        `with <${GRAPHDB_CONTEXT_TEST}>
		delete {
			entest:TestClassUpdated rdf:type owl:Class
		}
		where {
			entest:TestClassUpdated rdf:type owl:Class
		}`
    )
    .then((result) => {
        console.log('Delete the class:\n' + JSON.stringify(result, null, 2));
    })
    .catch((err) => {
        console.log(err);
    });
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
        "vars": ["iri", "firstName", "lastName"]
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

### Beautified enapso JSON Resultset:

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

The enapso GraphDB client enables you to easily export query results to CSV and TSV files.

```javascript
csv = this.graphDBEndpoint.transformBindingsToCSV(query);
```

returns the following object:

```json
{
    "total": 2,
    "success": true,
    "headers": ["iri,firstName,lastName"],
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
    csv.headers.join('\r\n') +
        '\r\n' +
        // add the csv records to the file
        csv.records.join('\r\n')
);
```

In case you require more detailed control over the separator and/or string delimiter characters you can use:

```javascript
csv = this.graphDBEndpoint.transformBindingsToSeparatedValues(query, {
    // replace IRIs by prefixes for easier
    // resultset readability (optional)
    replacePrefixes: true,
    // drop the prefixes for easier
    // resultset readability (optional)
    // "dropPrefixes": true,
    separator: ',',
    separatorEscape: '\\,',
    delimiter: '"',
    delimiterEscape: '\\"'
});
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

The following prefixes are already predefined in the enapso GraphDB Client:

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
