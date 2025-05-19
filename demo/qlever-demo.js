/* eslint-disable no-unused-vars */
/* eslint-disable prefer-const */
/* eslint-disable prefer-template */
/* eslint-disable no-console */
/* eslint-disable prettier/prettier */
/* eslint-disable one-var */
/* eslint-disable no-undef */
/* eslint-disable prettier/prettier */
require('@innotrade/enapso-config');
const { EnapsoGraphDBClient } = require('../index');

// connection data to the running Graph Database instance
const GRAPHDB_BASE_URL = 'http://localhost:7001';
let accessToken='data_7643543846_Zs6nw7yi3Z9m'

const DEFAULT_PREFIXES = [
    EnapsoGraphDBClient.PREFIX_OWL,
    EnapsoGraphDBClient.PREFIX_RDF,
    EnapsoGraphDBClient.PREFIX_RDFS,
    EnapsoGraphDBClient.PREFIX_XSD,
    EnapsoGraphDBClient.PREFIX_PROTONS,
];

let graphDBEndpoint = new EnapsoGraphDBClient.Endpoint({
    baseURL: GRAPHDB_BASE_URL,
    prefixes: DEFAULT_PREFIXES,
    triplestore: 'qlever'
});

graphDBEndpoint.setAccessToken(accessToken);

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

    // insert the class
graphDBEndpoint
    .update(
        `insert data {
      owl:TestClass rdf:type owl:Class}
  `
    )
    .then((result) => {
        console.log('Insert a class :\n' + JSON.stringify(result, null, 2));
    })
    .catch((err) => {
        console.log(err);
    });
