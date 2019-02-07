

module.exports = (Object.freeze({
    queryURL: process.env.QUERY_URL || 'localhost:7200/repositories/Test',
    updateURL: process.env.UPDATE_URL || 'localhost:7200/repositories/Test/statements',
    username: 'Test',
    password: 'Test',
    prefixes: {
        PREFIX_OWL: {
            "prefix": 'owl',
            "iri": 'http://www.w3.org/2002/07/owl#'
        },
        PREFIX_RDF: {
            "prefix": 'rdf',
            "iri": 'http://www.w3.org/1999/02/22-rdf-syntax-ns#'
        },
        PREFIX_RDFS: {
            "prefix": 'rdfs',
            "iri": 'http://www.w3.org/2000/01/rdf-schema#'
        },
        PREFIX_XSD: {
            "prefix": 'xsd',
            "iri": 'http://www.w3.org/2001/XMLSchema#'
        },
        PREFIX_FN: {
            "prefix": 'fn',
            "iri": 'http://www.w3.org/2005/xpath-functions#'
        },
        PREFIX_SFN: {
            "prefix": 'sfn',
            "iri": 'http://www.w3.org/ns/sparql#'
        }
    }
}));