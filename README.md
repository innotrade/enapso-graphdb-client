![ENAPSO](https://i.ibb.co/yf9fm5g/enapso-graphdb.png)

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

ENAPSO Graph Database client is an easy-to-use tool to perform SPARQL query and update statements against your knowledge graphs or ontologies stored in your graph database. It can be used with any Node.js application.

As of now, ENAPSO Graph Database Client supports the following graph databases:

-   [Ontotext GraphDB](https://www.ontotext.com/products/graphdb/)
-   [Apache Jena Fuseki](https://jena.apache.org/)
-   [Stardog](https://www.stardog.com/)

More graph databases will be supported added in the future.

In addition to authentication (Basic and JWT), the client handles prefixes, handles errors, and transforms SPARQL result bindings into CSV and TSV files as well as JSON result sets that can be easily processed in JavaScript.

The following tools you also might find useful:

-   [**ENAPSO Graph Database Admin**](https://github.com/innotrade/enapso-graphdb-admin): Enables you to perform administrative and monitoring operations against your graph databases, such as importing and exporting ontologies or knowledge graphs and utilizing the graph database's special features.
-   [**ENAPSO Command Line Interface for Graph Databases**](https://github.com/innotrade/enapso-graphdb-admin): Enables you to perform numerous scriptable operations on graph databases, e.g. for monitoring and testing, CI/CD pipelines or backup and restore.

# 🛠️&nbsp;Installation

```
npm i @innotrade/enapso-graphdb-client --save
```

## Create the connection with graph database

```javascript
const { EnapsoGraphDBClient } = require('@innotrade/enapso-graphdb-client');

let graphDBEndpoint = new EnapsoGraphDBClient.Endpoint({
    baseURL: 'http://localhost:7200',
    repository: 'Test',
    triplestore: 'graphdb', // 'graphdb' or 'fuseki' or 'stardog'
    prefixes: [
        {
            prefix: 'entest',
            iri: 'http://ont.enapso.com/test#'
        }
    ],
    transform: 'toCSV'
});
```

### Parameters

| Parameter             | Type             | Description                                                                                                                              | Values                             |
| --------------------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| baseURL(required)     | String           | Pass the URL in which graph database is running.                                                                                         |                                    |
| repository(required)  | String           | Pass the name of the repository or database of the graph databases with which you want to create a connection.                           |                                    |
| prefixes(required)    | Array of objects | Pass the prefix and its IRI as an object which will be used in the SPARQL query to perform crud operations.                              |                                    |
| triplestore(optional) | String           | Pass the name of the graph database with which you want to create a connection by default it creates a connection with Ontotext GraphDB. | ('graphdb' , 'stardog' , 'fuseki') |
| transform(optional)   | String           | Pass the type in which you want to show the result of SPARQL query by default it shows the result in JSON format.                        | ('toJSON', 'toCSV' , 'toTSV')      |

# 📋&nbsp;Features

| Feature           | Description                                                        | Ontotext GraphDB | Apache Jena Fuseki | Stardog |
| ----------------- | ------------------------------------------------------------------ | ---------------- | ------------------ | ------- |
| [Login](#login)   | Authenticate user against the graph database                       | ✔                | ✘                  | ✔       |
| [Query](#query)   | To retrieve the information from graph database using SPARQL query | ✔                | ✔                  | ✔       |
| [Update](#update) | To update the triples in the graph database                        | ✔                | ✔                  | ✔       |

<details open>
<summary>
  
## Authentication
</summary>
Authenticate against the graph database:
<div>  
  &nbsp; 
</div>
	
```
graphDBEndpoint.login('admin','root').then((result) => {
        console.log(result);
    })
    .catch((err) => {
        console.log(err);
    });
```

</details>
	
<details open>
<summary>
  
## Query
</summary>

Query the graph database:

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

</details>

<details open>
<summary>
  
## Update
</summary>

Update the graph database:

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

</details>

# 📖&nbsp;Documentation

View the [documentation](https://github.com/innotrade/enapso-graphdb-client/wiki) for further usage examples.

# 🧪&nbsp;Testing

[Tutorial](https://github.com/innotrade/enapso-graphdb-client/wiki/Tutorial-for-Graph-Databases-Test-Suite) to run the Test suite against the graph database.

# 😎&nbsp;Contributing

Contributing is more than just coding. You can support the project in many ways. We will be happy to collaborate with you and we are looking forward to commonly making semantics and knowledge graph technologies available for your projects.

Details of how you can help the project are described in the [CONTRIBUTING.md](./CONTRIBUTING.md)
document.

## 🧑‍🏫&nbsp;Contributors

<a href = "https://github.com/Tanu-N-Prabhu/Python/graphs/contributors">
  <img src = "https://contrib.rocks/image?repo=innotrade/enapso-graphdb-client" width="200"/>
</a>

<div>  
  &nbsp; 
</div>

# 💬&nbsp;Bugs and Feature Requests

Do you have a bug report or a feature request?

Please feel free to add a [new
issue](https://github.com/innotrade/enapso-graphdb-client/issues/new) or write to us in [discussion](https://github.com/innotrade/enapso-graphdb-client/discussions): Any questions and suggestions are welcome.

<div>  
  &nbsp; 
</div>

# 🧾&nbsp;License

This project is licensed under the Apache 2.0 License. See the [LICENSE](./LICENSE) file for more
details.
