// Innotrade enapso GraphDB Client Example
// (C) Copyright 2019-2020 Innotrade GmbH, Herzogenrath, NRW, Germany
// Author: Alexander Schulze

const { EnapsoGraphDBClient } = require("../index");

// connection data to the running GraphDB instance
const GRAPHDB_BASE_URL = "http://localhost:7200",
  GRAPHDB_REPOSITORY = "Test",
  GRAPHDB_USERNAME = "Test",
  GRAPHDB_PASSWORD = "Test",
  GRAPHDB_CONTEXT_TEST = "http://ont.enapso.com/repo";

const DEFAULT_PREFIXES = [
  EnapsoGraphDBClient.PREFIX_OWL,
  EnapsoGraphDBClient.PREFIX_RDF,
  EnapsoGraphDBClient.PREFIX_RDFS,
  EnapsoGraphDBClient.PREFIX_XSD,
  EnapsoGraphDBClient.PREFIX_PROTONS,
  {
    prefix: "entest",
    iri: "http://ont.enapso.com/test#",
  },
];

let graphDBEndpoint = new EnapsoGraphDBClient.Endpoint({
  baseURL: GRAPHDB_BASE_URL,
  repository: GRAPHDB_REPOSITORY,
  prefixes: DEFAULT_PREFIXES,
  transform: "toCSV",
});

// connect and authenticate
graphDBEndpoint
  .login(GRAPHDB_USERNAME, GRAPHDB_PASSWORD)
  .then((result) => {
    console.log(result);
  })
  .catch((err) => {
    console.log(err);
  });

// read the class
graphDBEndpoint
  .query(
    `select *from <${GRAPHDB_CONTEXT_TEST}>
where {
  ?class rdf:type owl:Class
  filter(regex(str(?class), "http://ont.enapso.com/test#TestClass", "i")) .
}`,
    { transform: "toJSON" }
  )
  .then((result) => {
    console.log("Read a class:\n" + JSON.stringify(result, null, 2));
  })
  .catch((err) => {
    console.log(err);
  });

// update the class
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
    console.log("Update a class name:\n" + JSON.stringify(result, null, 2));
  })
  .catch((err) => {
    console.log(err);
  });

// delete the class
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
    console.log("Delete a class:\n" + JSON.stringify(result, null, 2));
  })
  .catch((err) => {
    console.log(err);
  });

// insert the class
graphDBEndpoint
  .update(
    `insert data {
			graph <${GRAPHDB_CONTEXT_TEST}> {
      entest:TestClass rdf:type owl:Class}
  }`
  )
  .then((result) => {
    console.log("Insert a class :\n" + JSON.stringify(result, null, 2));
  })
  .catch((err) => {
    console.log(err);
  });
