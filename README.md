![ENAPSO](https://i.ibb.co/6b3rXrB/enapso-client.png)

<div align="center">
  <h1><span style="font-weight:bold; color: #4299E1;">ENAPSO</span> Graph Database Client</h1>
  <a href="https://www.npmjs.com/package/@innotrade/enapso-graphdb-client"><img src="https://img.shields.io/npm/v/@innotrade/enapso-graphdb-client" /></a>
  <a href="https://github.com/prisma/prisma/blob/main/CONTRIBUTING.md"><img src="https://img.shields.io/badge/connect-Community-brightgreen" /></a>
  <a href="https://github.com/innotrade/enapso-graphdb-client/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-Apache%202-blue" /></a>
  <a href="https://github.com/innotrade/enapso-graphdb-client/blob/main/CODE_OF_CONDUCT.md"><img src="https://img.shields.io/badge/code-Conduct-orange" /></a>
  <br />
  <br />
  <a href="https://www.innotrade.com/">Website</a>
  <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
  <a href="https://github.com/innotrade/enapso-graphdb-client/wiki">Documentation</a>
  <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
  <a href="https://github.com/innotrade/enapso-graphdb-client/discussions">Discussion</a>
  <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
  <a href="#">Facebook</a>
  <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
  <a href="#">Twitter</a>
  <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>
  <a href="#">LinkedIn</a>
  <br />
  <hr />
</div>

ENAPSO Graph Database client is an easy-to-use tool for performing SPARQL queries and update statements against your knowledge graphs or ontologies stored in your graph database. You can use it with any Node.js application.

As of now we support the connection with three major graph databases

-   [Ontotext GraphDB](https://www.ontotext.com/products/graphdb/)
-   [Apache Jena fuseki](https://jena.apache.org/)
-   [Stardog](https://www.stardog.com/)

There will be more graph databases added to this list in the future.

In addition to authentication (Basic and JWT), the client handles prefixes, provides error-handling capabilities, and is capable of transforming SPARQL result bindings into CSV and TSV files as well as JSON resultsets that can be easily processed in Javascript.

You may also find these tools useful

-   [**ENAPSO Graph Database Admin**](https://github.com/innotrade/enapso-graphdb-admin): To perform administrative and monitoring operations against your graph databases, such as importing and exporting ontologies/knowledge graphs and utilizing the graph database's special features.
-   [**ENAPSO Command Line Interface for Graph Databases**](https://github.com/innotrade/enapso-graphdb-admin): To easily perform numeropus scriptable convenience operations on graph databases

[**Tutorial for Test Suite**](https://github.com/innotrade/enapso-graphdb-client/wiki/Tutorial-for-Graph-Databases-Test-Suite): To run the Test suites against the graph database.

Any questions and suggestions are welcome.

# Installation

```
npm i @innotrade/enapso-graphdb-client --save
```

## Create the connection with Graph Database

```javascript
const { EnapsoGraphDBClient } = require('@innotrade/enapso-graphdb-client');

let graphDBEndpoint = new EnapsoGraphDBClient.Endpoint({
    baseURL: 'http://localhost:7200',
    repository: 'Test',
    triplestore: 'ontotext-graphDB', // 'ontotext-graphDB'or'fuseki' or 'stardog'
    prefixes: [
        {
            prefix: 'entest',
            iri: 'http://ont.enapso.com/test#'
        }
    ],
    transform: 'toCSV'
});
```

| Parameter             | Type             | Description                                                                                                                     | Values                                      |
| --------------------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| baseURL(required)     | String           | Pass the URL in which graph databases is running.                                                                               |                                             |
| repository(required)  | String           | Pass the name of repository or database of the graph databases with which you want to create connection.                        |                                             |
| prefixes(required)    | Array of objects | Pass the prefix and its iri as object which will be used in the SPARQL query to perform crud operations.                        |                                             |
| triplestore(optional) | String           | Pass the name of graph database with which you want to create connection by default it create connection with Ontotext GraphDB. | ('ontotext-graphDB' , 'stardog' , 'fuseki') |
| transform(optional)   | String           | Pass the type in which you want to show result of SPARQL query by default it show result in json format.                        | ('toJSON', 'toCSV' , 'toTSV')               |

# Feature List

| Feature                                           | Description                                                        | Ontotext GraphDB | Apache Jena Fuseki | Stardog |
| ------------------------------------------------- | ------------------------------------------------------------------ | ---------------- | ------------------ | ------- |
| [Login](#authenticate-against-the-graph-database) | Authenticate against the Graph Database                            | ✔                | ✘                  | ✔       |
| [Query](#querying-against-the-graph-database)     | To retrieve the information from graph database using SPARQL query | ✔                | ✔                  | ✔       |
| [Update](#updating-triples-in-graph-database)     | To update the triples in the graph database                        | ✔                | ✔                  | ✔       |

## Authenticate against the Graph Database

```
graphDBEndpoint.login('admin','root').then((result) => {
        console.log(result);
    })
    .catch((err) => {
        console.log(err);
    });
```

## Querying against the Graph Database

```
graphDBEndpoint
    .query(
        'select *
where {
    ?class rdf:type owl:Class
    filter(regex(str(?class), "http://ont.enapso.com/test#TestClass", "i")) .
}',
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

## Updating Triples in Graph Database

```
graphDBEndpoint
    .update(
        `insert data {
		graph <http://ont.enapso.com/test> {
      entest:TestClass rdf:type owl:Class}
  }`
    )
    .then((result) => {
        console.log('inserted a class :\n' + JSON.stringify(result, null, 2));
    })
    .catch((err) => {
        `console.log(err);
    });
```

For more use cases and detailed description follow the following link
https://github.com/innotrade/enapso-graphdb-client/wiki
