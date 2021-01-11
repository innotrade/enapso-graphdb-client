/* eslint-disable prettier/prettier */
/* eslint-disable no-undef */
/* eslint-disable prettier/prettier */
// Innotrade Enapso GraphDB Client - Configuration for automated tests
// (C) Copyright 2019-2020 Innotrade GmbH, Herzogenrath, NRW, Germany
// Author: Alexander Schulze
require('@innotrade/enapso-config');

module.exports = Object.freeze({
    baseURL: encfg.getConfig(
        'enapsoDefaultGraphDB.baseUrl',
        'http://localhost:7200'
    ),
    fusekiBaseURL: encfg.getConfig(
        'enapsoDefaultGraphDB.fusekiBaseURL',
        'http://localhost:3030'
    ),
    repository: encfg.getConfig('enapsoDefaultGraphDB.repository', 'Test'),
    username: encfg.getConfig('enapsoDefaultGraphDB.userName', 'Test'),
    password: encfg.getConfig('enapsoDefaultGraphDB.password', 'Test'),
    updatePath: encfg.getConfig(
        'enapsoDefaultGraphDB.updatePath',
        `/${encfg.getConfig('enapsoDefaultGraphDB.repository', 'Test')}/update`
    ),
    queryPath: encfg.getConfig(
        'enapsoDefaultGraphDB.queryPath',
        `/${encfg.getConfig('enapsoDefaultGraphDB.repository', 'Test')}/sparql`
    ),
    prefixes: {
        PREFIX_OWL: {
            prefix: 'owl',
            iri: 'http://www.w3.org/2002/07/owl#'
        },
        PREFIX_RDF: {
            prefix: 'rdf',
            iri: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#'
        },
        PREFIX_RDFS: {
            prefix: 'rdfs',
            iri: 'http://www.w3.org/2000/01/rdf-schema#'
        },
        PREFIX_XSD: {
            prefix: 'xsd',
            iri: 'http://www.w3.org/2001/XMLSchema#'
        },
        PREFIX_FN: {
            prefix: 'fn',
            iri: 'http://www.w3.org/2005/xpath-functions#'
        },
        PREFIX_SFN: {
            prefix: 'sfn',
            iri: 'http://www.w3.org/ns/sparql#'
        },
        PREFIX_TEST: {
            prefix: 'entest',
            iri: 'http://ont.enapso.com/test#'
        }
    }
});
