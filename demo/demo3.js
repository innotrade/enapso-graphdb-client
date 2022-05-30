/* eslint-disable no-unused-vars */
/* eslint-disable prefer-const */
/* eslint-disable prefer-template */
/* eslint-disable no-console */
/* eslint-disable prettier/prettier */
/* eslint-disable one-var */
/* eslint-disable no-undef */
/* eslint-disable prettier/prettier */
// Innotrade enapso GraphDB Client Example
// (C) Copyright 2019-2020 Innotrade GmbH, Herzogenrath, NRW, Germany
// Author: Alexander Schulze
require('@innotrade/enapso-config');
const { EnapsoGraphDBClient } = require('../index');

// connection data to the running GraphDB instance
const GRAPHDB_BASE_URL = encfg.getConfig(
        'enapsoDefaultGraphDB.baseUrl',
        'http://localhost:5820'
    ),
    GRAPHDB_REPOSITORY = encfg.getConfig(
        'enapsoDefaultGraphDB.repository',
        'Test'
    ),
    GRAPHDB_USERNAME = encfg.getConfig(
        'enapsoDefaultGraphDB.userName',
        'admin'
    ),
    GRAPHDB_PASSWORD = encfg.getConfig(
        'enapsoDefaultGraphDB.password',
        'admin'
    ),
    // FUSEKI_QUERY_PATH = encfg.getConfig(
    //     'enapsoDefaultGraphDB.queryPath',
    //     `/${GRAPHDB_REPOSITORY}/sparql`
    // ),
    // FUSEKI_UPDATE_PATH = encfg.getConfig(
    //     'enapsoDefaultGraphDB.updatePath',
    //     `/${GRAPHDB_REPOSITORY}/update`
    // ),
    GRAPHDB_CONTEXT_TEST = encfg.getConfig(
        'enapsoDefaultGraphDB.contextTest',
        'http://ont.enapso.com/test'
    );

const DEFAULT_PREFIXES = [
    EnapsoGraphDBClient.PREFIX_OWL,
    EnapsoGraphDBClient.PREFIX_RDF,
    EnapsoGraphDBClient.PREFIX_RDFS,
    EnapsoGraphDBClient.PREFIX_XSD,
    EnapsoGraphDBClient.PREFIX_PROTONS,
    {
        prefix: encfg.getConfig('enapsoDefaultGraphDB.prefix', 'entest'),
        iri: encfg.getConfig(
            'enapsoDefaultGraphDB.iri',
            'http://ont.enapso.com/test#'
        )
    }
];

let graphDBEndpoint = new EnapsoGraphDBClient.Endpoint({
    baseURL: GRAPHDB_BASE_URL,
    repository: GRAPHDB_REPOSITORY,
    prefixes: DEFAULT_PREFIXES,
    tripleStore: 'stardog',
    transform: 'toCSV'
});

// // connect and authenticate
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
        `SELECT ?s ?label WHERE {
            ?s a owl:Class ;
               rdfs:label ?label
        }`,
        { transform: 'toJSON' }
    )
    .then((result) => {
        console.log('Read a class:\n' + JSON.stringify(result, null, 2));
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
        console.log('Update a class name:\n' + JSON.stringify(result, null, 2));
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
        console.log('Delete a class:\n' + JSON.stringify(result, null, 2));
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
        console.log('Insert a class :\n' + JSON.stringify(result, null, 2));
    })
    .catch((err) => {
        console.log(err);
    });
